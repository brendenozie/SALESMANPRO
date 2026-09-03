/**
 * app/api/admin/db/restore/stream/route.ts
 *
 * POST: Triggers a durable restore from an S3/cloud backup key.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";
import { backupService } from "@/lib/backup/backupService";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const POST = withApiHandler(
  async (req, context) => {
    const body = await req.json().catch(() => ({}));
    const { fileKey, mode } = body;

    if (!fileKey) {
      return formatResponse(false, null, "fileKey or backupId is required", 400);
    }

    // Resolve backup record by storageKey or ID
    let backup = await prisma.databaseBackup.findFirst({
      where: {
        OR: [{ storageKey: fileKey }, { id: fileKey }],
      },
    });

    if (!backup) {
      // If not yet registered, register this cloud artifact
      backup = await prisma.databaseBackup.create({
        data: {
          backupType: "MANUAL",
          status: "VERIFIED",
          storageKey: fileKey,
          storageProvider: "s3",
          triggeredBy: "LEGACY_S3_IMPORT",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });
    }

    const requestedBy = context.user?.email || context.user?.id || "admin";
    const restoreMode = mode || "RESTORE_TO_PRODUCTION";

    try {
      const job = await backupService.triggerRestore(backup.id, restoreMode, requestedBy);
      return formatResponse(
        true,
        {
          restoreId: job.id,
          message: "Restore job created and enqueued to backup worker",
        },
        "Restore enqueued successfully",
        202
      );
    } catch (err: any) {
      return formatResponse(false, null, `Failed to enqueue restore: ${err.message}`, 400);
    }
  },
  {
    requireAuth: true,
    allowedRoles: ["SUPER_ADMIN"],
  }
);
