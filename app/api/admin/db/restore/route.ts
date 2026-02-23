import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

export const POST = withApiHandler(async (request) => {
  const body = await request.json();
  const data = body.data; // The JSON backup object

  if (!data || typeof data !== "object") {
    return formatResponse(false, null, "Invalid backup data", 400);
  }

  try {
    // We use a transaction to ensure database integrity
    await prisma.$transaction(async (tx) => {
      for (const [modelName, records] of Object.entries(data)) {
        if (!Array.isArray(records)) continue;

        // 1. Clear existing data for this model
        // @ts-ignore
        await tx[modelName].deleteMany({});

        // 2. Insert backed up data
        if (records.length > 0) {
          // @ts-ignore
          await tx[modelName].createMany({
            data: records,
          });
        }
      }
    }, {
      timeout: 30000, // Extend timeout for large datasets
    });

    return formatResponse(true, null, "Database restored successfully", 200);
  } catch (error: any) {
    console.error("Restore Error:", error);
    return formatResponse(false, null, `Restore failed: ${error.message}`, 500);
  }
});