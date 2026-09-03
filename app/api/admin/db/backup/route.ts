/**
 * app/api/admin/db/backup/route.ts
 *
 * GET: Stream application-level JSON export for local emergency download.
 * POST: Trigger asynchronous background cloud backup job via BullMQ.
 */

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { backupService } from "@/lib/backup/backupService";
import { formatResponse } from "@/lib/formatResponse";
import { BackupType } from "@/lib/backup/types";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    const encoder = new TextEncoder();
    const runtimeModel = (prisma as any)._runtimeDataModel;
    const models = Object.keys(runtimeModel.models);

    const stream = new ReadableStream({
      async start(controller) {
        const errorMap: Record<string, string> = {};

        const header =
          JSON.stringify({
            meta: {
              version: "v2",
              timestamp: Date.now(),
              platform: "mongodb",
            },
          }).slice(0, -1) + ', "data": {';

        controller.enqueue(encoder.encode(header));

        for (let i = 0; i < models.length; i++) {
          const modelName = models[i];
          const modelMeta = runtimeModel.models[modelName];
          const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
          const modelClient = (prisma as any)[prismaKey];

          if (!modelClient) continue;

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

                const clean = sanitizeForBackup(record, modelMeta);
                controller.enqueue(encoder.encode(JSON.stringify(clean)));
                firstRecordInModel = false;
              }

              skip += batchSize;
            } while (batch.length === batchSize);
          } catch (err: any) {
            errorMap[modelName] = err.message;
          }

          controller.enqueue(encoder.encode("]"));

          if (i < models.length - 1) {
            controller.enqueue(encoder.encode(","));
          }
        }

        const footer = `}, "errors": ${JSON.stringify(errorMap)}}`;
        controller.enqueue(encoder.encode(footer));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=salesmanpro-db-export-${Date.now()}.json`,
        "Cache-Control": "no-store",
      },
    });
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    timeoutMs: 120_000,
  }
);

export const POST = withApiHandler(
  async (req, context) => {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const type = (body.type || "MANUAL") as BackupType;
    const requestedBy = context.user?.email || context.user?.id || "admin";

    const record = await backupService.triggerBackup(type, requestedBy);

    return formatResponse(
      true,
      {
        backup: {
          ...record,
          sizeBytes: record.sizeBytes ? Number(record.sizeBytes) : 0,
        },
      },
      "Backup initiated successfully",
      202
    );
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);

function sanitizeForBackup(record: any, modelMeta: any) {
  const cleaned: any = {};
  for (const field of modelMeta.fields) {
    if (field.kind !== "scalar") continue;
    const key = field.name;
    const value = record[key];
    if (value === undefined || value === null) continue;
    if (field.type === "DateTime" && value instanceof Date) {
      cleaned[key] = value.toISOString();
      continue;
    }
    if (typeof value === "bigint") {
      cleaned[key] = value.toString();
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
}
