import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyBackupSecret } from "@/lib/verifyBackupSecret";
import { setProgress } from "@/lib/restoreProgress";

export const runtime = "nodejs";

export const POST = withApiHandler(async (req) => {
  verifyBackupSecret(req);
  const body = await req.json();

  if (!body || typeof body !== "object") {
    return Response.json(
      { success: false, message: "Invalid backup file" },
      { status: 400 }
    );
  }

  const results: Record<string, any> = {};
  const errors: Record<string, string> = {};

  for (const modelName of Object.keys(body)) {
    const prismaKey =  modelName.charAt(0).toLowerCase() + modelName.slice(1);

    const modelClient = (prisma as any)[prismaKey];

    if (!modelClient) {
      errors[modelName] = "Model not found";
      continue;
    }

    const records = body[modelName];

    if (!Array.isArray(records)) continue;

    try {
      // Clear collection first
      await modelClient.deleteMany();

      const batchSize = 500;

      const restoreId = crypto.randomUUID();

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        await modelClient.createMany({
          data: batch,
        });

        setProgress(restoreId, {
          currentModel: modelName,
          total: records.length,
          completed: Math.min(i + batchSize, records.length),
        });

      }

      results[modelName] = `${records.length} restored`;
          
      return Response.json({
        success: true,
        restoreId,
      });

    } catch (err: any) {
      errors[modelName] = err.message;
    }
  }

  return Response.json({
    success: true,
    restored: results,
    errors,
  });
});

// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// export const POST = withApiHandler(async (request) => {
//   const body = await request.json();
//   const data = body.data; // The JSON backup object

//   if (!data || typeof data !== "object") {
//     return formatResponse(false, null, "Invalid backup data", 400);
//   }

//   try {
//     // We use a transaction to ensure database integrity
//     await prisma.$transaction(async (tx) => {
//       for (const [modelName, records] of Object.entries(data)) {
//         if (!Array.isArray(records)) continue;

//         // 1. Clear existing data for this model
//         // @ts-ignore
//         await tx[modelName].deleteMany({});

//         // 2. Insert backed up data
//         if (records.length > 0) {
//           // @ts-ignore
//           await tx[modelName].createMany({
//             data: records,
//           });
//         }
//       }
//     }, {
//       timeout: 30000, // Extend timeout for large datasets
//     });

//     return formatResponse(true, null, "Database restored successfully", 200);
//   } catch (error: any) {
//     console.error("Restore Error:", error);
//     return formatResponse(false, null, `Restore failed: ${error.message}`, 500);
//   }
// });