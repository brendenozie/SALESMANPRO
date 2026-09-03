/**
 * app/api/admin/db/restore/route.ts
 *
 * POST: Handles authenticated local JSON backup import and restore.
 * Parses incoming JSON payload, applies dependency-ordered restoration,
 * and maintains strict error accounting.
 */

import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { backupEngine } from "@/lib/backup/engine/backupEngine";
import { restoreEngine } from "@/lib/backup/engine/restoreEngine";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const POST = withApiHandler(
  async (req, context) => {
    let parsed: any;
    try {
      parsed = await req.json();
    } catch {
      return formatResponse(false, null, "Invalid JSON payload", 400);
    }

    const dataPayload = parsed.data || parsed;
    if (!dataPayload || typeof dataPayload !== "object") {
      return formatResponse(false, null, "Invalid backup format: missing data object", 400);
    }

    const availableModels = Object.keys(dataPayload).filter((k) => Array.isArray(dataPayload[k]));
    const orderedModels = restoreEngine.sortModelsByDependency(availableModels);
    const runtimeModels = (prisma as any)._runtimeDataModel?.models || {};

    let recordsRestored = 0;
    let recordsFailed = 0;
    const results: Record<string, string> = {};
    const errors: Record<string, string> = {};

    for (const modelName of orderedModels) {
      const records = dataPayload[modelName] || [];
      const modelMeta = runtimeModels[modelName];
      const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      const modelClient = (prisma as any)[prismaKey];

      if (!modelClient) {
        errors[modelName] = "Model not found in current schema";
        continue;
      }

      if (records.length === 0) continue;

      // Clear existing records in this collection
      try {
        await modelClient.deleteMany({});
      } catch (err: any) {
        console.warn(`[LocalRestore] Error clearing ${modelName}:`, err.message);
      }

      const batchSize = 500;
      let modelRestored = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        const cleanBatch = batch.map((r: any) =>
          modelMeta ? backupEngine.sanitizeRecord(r, modelMeta) : r
        );

        try {
          const res = await modelClient.createMany({
            data: cleanBatch,
            skipDuplicates: true,
          });
          modelRestored += res.count;
        } catch (bulkErr: any) {
          // Row-by-row fallback with explicit accounting
          for (const item of cleanBatch) {
            try {
              await modelClient.create({ data: item });
              modelRestored++;
            } catch (rowErr: any) {
              recordsFailed++;
              errors[`${modelName}:${item.id || "row"}`] = rowErr.message;
            }
          }
        }
      }

      recordsRestored += modelRestored;
      results[modelName] = `${modelRestored} restored`;
    }

    return formatResponse(
      recordsFailed === 0,
      {
        recordsRestored,
        recordsFailed,
        collectionsRestored: orderedModels.length,
        summary: results,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      },
      recordsFailed === 0 ? "Local restore completed successfully" : "Local restore completed with some errors",
      recordsFailed === 0 ? 200 : 207
    );
  },
  {
    requireAuth: true,
    allowedRoles: ["SUPER_ADMIN"],
    timeoutMs: 120_000,
  }
);
