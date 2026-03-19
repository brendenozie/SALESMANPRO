import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyBackupSecret } from "@/lib/verifyBackupSecret";

export const runtime = "nodejs";

export const GET = withApiHandler(async (req) => {
  verifyBackupSecret(req);

  const encoder = new TextEncoder();
  // Get the full list of models and their schema definitions
  const runtimeModel = (prisma as any)._runtimeDataModel;
  const models = Object.keys(runtimeModel.models);

  const stream = new ReadableStream({
    async start(controller) {
      const errorMap: Record<string, string> = {};

      // 1. START JSON: Open meta and open data object
      const header =
        JSON.stringify({
          meta: {
            version: "v1",
            timestamp: Date.now(),
            platform: "mongodb",
          },
        }).slice(0, -1) + ', "data": {';

      controller.enqueue(encoder.encode(header));

      // 2. ITERATE MODELS
      for (let i = 0; i < models.length; i++) {
        const modelName = models[i];
        const modelMeta = runtimeModel.models[modelName];
        const prismaKey =
          modelName.charAt(0).toLowerCase() + modelName.slice(1);
        const modelClient = (prisma as any)[prismaKey];

        if (!modelClient) continue;

        // Open array for this model
        controller.enqueue(encoder.encode(`"${modelName}":[`));

        const batchSize = 1000;
        let skip = 0;
        let batch: any[] = [];
        let firstRecordInModel = true;

        try {
          do {
            batch = await modelClient.findMany({
              skip,
              take: batchSize,
            });

            for (const record of batch) {
              if (!firstRecordInModel) {
                controller.enqueue(encoder.encode(","));
              }

              // SANITIZE: Pass metadata so we know which fields are real scalars
              const clean = sanitizeForBackup(record, modelMeta);

              controller.enqueue(encoder.encode(JSON.stringify(clean)));
              firstRecordInModel = false;
            }

            skip += batchSize;
          } while (batch.length === batchSize);
        } catch (err: any) {
          errorMap[modelName] = err.message;
        }

        // Close array for this model
        controller.enqueue(encoder.encode("]"));

        // Comma between models
        if (i < models.length - 1) {
          controller.enqueue(encoder.encode(","));
        }
      }

      // 3. CLOSE DATA, ADD ERRORS, CLOSE ROOT
      const footer = `}, "errors": ${JSON.stringify(errorMap)}}`;
      controller.enqueue(encoder.encode(footer));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename=full-db-backup-${Date.now()}.json`,
      "Cache-Control": "no-store",
    },
  });
});

/**
 * SCHEMA-AWARE SANITIZER
 * Only keeps fields that are defined as scalar fields in the Prisma schema.
 * This prevents relation objects from breaking future imports.
 */
function sanitizeForBackup(record: any, modelMeta: any) {
  const cleaned: any = {};

  // modelMeta.fields contains the definition of every field in this model
  for (const field of modelMeta.fields) {
    // 1. ONLY keep scalar fields (actual columns in Mongo)
    // Skip 'object' kind (relations like "user", "posts")
    if (field.kind !== "scalar") continue;

    const key = field.name;
    const value = record[key];

    // 2. Handle values
    if (value === undefined || value === null) continue;

    // 3. Format Dates for JSON consistency
    if (field.type === "DateTime" && value instanceof Date) {
      cleaned[key] = value.toISOString();
      continue;
    }

    cleaned[key] = value;
  }

  return cleaned;
}
