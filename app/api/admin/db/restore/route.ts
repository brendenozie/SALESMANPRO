import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyBackupSecret } from "@/lib/verifyBackupSecret";
import { setProgress } from "@/lib/restoreProgress";

export const runtime = "nodejs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Set this to the max size you expect (e.g., 20mb, 50mb)
    },
  },
};

export const POST = withApiHandler(async (req) => {
  verifyBackupSecret(req);

  const restoreId = crypto.randomUUID();
  const reader = req.body?.getReader();
  if (!reader) return Response.json({ error: "No stream" }, { status: 400 });

  // 1. READ STREAM INTO BUFFER
  let buffer = "";
  const decoder = new TextEncoder();
  const streamDecoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += streamDecoder.decode(value, { stream: true });
  }

  let parsed: any;
  try {
    parsed = JSON.parse(buffer);
  } catch {
    return Response.json({ error: "Invalid JSON backup" }, { status: 400 });
  }

  const data = parsed.data || {};
  const modelsMeta = (prisma as any)._runtimeDataModel.models;
  const results: Record<string, any> = {};
  const errors: Record<string, string> = {};

  // 2. PROCESS MODELS
  for (const modelName of Object.keys(data)) {
    const meta = modelsMeta[modelName];
    const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    const modelClient = (prisma as any)[prismaKey];

    if (!modelClient || !meta) {
      errors[modelName] = "Model not found in current schema";
      continue;
    }

    const records = data[modelName];
    if (!Array.isArray(records) || records.length === 0) continue;

    try {
      // CLEAR EXISTING DATA
      await modelClient.deleteMany();

      const batchSize = 500;
      let restoredCount = 0;

      // 3. TRANSACTIONAL BATCH PROCESSING
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        // Sanitize every record in the batch based on DB schema
        const sanitizedBatch = batch.map((rec) =>
          sanitizeForRestore(rec, meta),
        );

        try {
          // Attempt high-speed bulk insert
          const result = await modelClient.createMany({
            data: sanitizedBatch,
            skipDuplicates: true,
          });
          restoredCount += result.count;
        } catch (bulkErr) {
          // FALLBACK: Row-by-row if the batch contains a poisoned record
          console.error(
            `Bulk insert failed for ${modelName}, falling back to individual creates...`,
          );
          for (const cleanRecord of sanitizedBatch) {
            try {
              await modelClient.create({ data: cleanRecord });
              restoredCount++;
            } catch (rowErr: any) {
              console.warn(`Skipping row in ${modelName}:`, rowErr.message);
            }
          }
        }

        // Update progress tracking
        setProgress(restoreId, {
          currentModel: modelName,
          total: records.length,
          completed: Math.min(i + batchSize, records.length),
        });
      }

      results[modelName] = `${restoredCount} restored`;
    } catch (err: any) {
      errors[modelName] = err.message;
    }
  }

  return Response.json({
    success: Object.keys(errors).length === 0,
    restoreId,
    restored: results,
    errors: Object.keys(errors).length ? errors : undefined,
  });
});

/**
 * SCHEMA-AWARE RESTORE SANITIZER
 * Tuned specifically for Prisma + MongoDB
 */
function sanitizeForRestore(record: any, modelMeta: any) {
  const cleaned: any = {};

  for (const field of modelMeta.fields) {
    // CRITICAL: Skip relation objects (e.g., "user": { ... })
    // We only want scalar fields (e.g., "userId": "...")
    if (field.kind !== "scalar") continue;

    const key = field.name;
    let value = record[key];

    // Handle missing/null values for required fields
    if (value === undefined || value === null) {
      if (field.isRequired && !field.hasDefaultValue) {
        if (field.type === "String") value = "";
        else if (field.type === "Int" || field.type === "Float") value = 0;
        else if (field.type === "Boolean") value = false;
        else if (field.type === "DateTime") value = new Date();
        else continue;
      } else {
        cleaned[key] = null;
        continue;
      }
    }

    try {
      switch (field.type) {
        case "DateTime":
          const d = new Date(value);
          cleaned[key] = isNaN(d.getTime()) ? new Date() : d;
          break;

        case "Int":
        case "Float":
          cleaned[key] = Number(value);
          break;

        case "Boolean":
          cleaned[key] =
            typeof value === "string" ? value === "true" : Boolean(value);
          break;

        case "Json":
          if (typeof value === "string") {
            try {
              cleaned[key] = JSON.parse(value);
            } catch {
              cleaned[key] = value;
            }
          } else {
            cleaned[key] = value;
          }
          break;

        default:
          cleaned[key] = value;
      }
    } catch {
      // Skip field if parsing fails
    }
  }

  return cleaned;
}
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { verifyBackupSecret } from "@/lib/verifyBackupSecret";
// import { setProgress } from "@/lib/restoreProgress";

// export const runtime = "nodejs";

// export const POST = withApiHandler(async (req) => {
//   verifyBackupSecret(req);
//   const body = await req.json();

//   if (!body || typeof body !== "object") {
//     return Response.json(
//       { success: false, message: "Invalid backup file" },
//       { status: 400 }
//     );
//   }

//   const results: Record<string, any> = {};
//   const errors: Record<string, string> = {};

//   // 1. Generate ONE restoreId for the entire operation
//   const restoreId = crypto.randomUUID();

//   for (const modelName of Object.keys(body)) {
//     const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
//     const modelClient = (prisma as any)[prismaKey];

//     if (!modelClient) {
//       errors[modelName] = "Model not found";
//       continue;
//     }

//     const records = body[modelName];
//     if (!Array.isArray(records)) continue;

//     try {
//       // 2. Clear collection
//       await modelClient.deleteMany();

//       const batchSize = 500;

//       for (let i = 0; i < records.length; i += batchSize) {
//         const batch = records.slice(i, i + batchSize);

//         await modelClient.createMany({
//           data: batch,
//         });

//         // Track progress for the current model
//         setProgress(restoreId, {
//           currentModel: modelName,
//           total: records.length,
//           completed: Math.min(i + batchSize, records.length),
//         });
//       }

//       results[modelName] = `${records.length} restored`;

//     } catch (err: any) {
//       errors[modelName] = err.message;
//       // Optional: break; if you want to stop the whole process on first error
//     }
//   }

//   // 3. Move the return OUTSIDE the loop so all models process
//   return Response.json({
//     success: Object.keys(errors).length === 0, // Success if no errors occurred
//     restoreId,
//     restored: results,
//     errors: Object.keys(errors).length > 0 ? errors : undefined,
//   });
// });

// export const POST = withApiHandler(async (req) => {
//   verifyBackupSecret(req);
//   const body = await req.json();

//   if (!body || typeof body !== "object") {
//     return Response.json(
//       { success: false, message: "Invalid backup file" },
//       { status: 400 }
//     );
//   }

//   const results: Record<string, any> = {};
//   const errors: Record<string, string> = {};

//   for (const modelName of Object.keys(body)) {
//     const prismaKey =  modelName.charAt(0).toLowerCase() + modelName.slice(1);

//     const modelClient = (prisma as any)[prismaKey];

//     if (!modelClient) {
//       errors[modelName] = "Model not found";
//       continue;
//     }

//     const records = body[modelName];

//     if (!Array.isArray(records)) continue;

//     try {
//       // Clear collection first
//       await modelClient.deleteMany();

//       const batchSize = 500;

//       const restoreId = crypto.randomUUID();

//       for (let i = 0; i < records.length; i += batchSize) {
//         const batch = records.slice(i, i + batchSize);

//         await modelClient.createMany({
//           data: batch,
//         });

//         setProgress(restoreId, {
//           currentModel: modelName,
//           total: records.length,
//           completed: Math.min(i + batchSize, records.length),
//         });

//       }

//       results[modelName] = `${records.length} restored`;

//       return Response.json({
//         success: true,
//         restoreId,
//       });

//     } catch (err: any) {
//       errors[modelName] = err.message;
//     }
//   }

//   return Response.json({
//     success: true,
//     restored: results,
//     errors,
//   });
// });

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
