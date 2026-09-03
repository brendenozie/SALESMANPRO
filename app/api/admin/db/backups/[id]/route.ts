/**
 * app/api/admin/db/backups/[id]/route.ts
 *
 * GET: Retrieve single backup details.
 * DELETE: Delete backup artifact from cloud storage and remove registry record.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";
import { getBackupStorageProvider } from "@/lib/backup/storage/storageProvider";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    const backupId = context.params?.id;

    if (!backupId) {
      return formatResponse(false, null, "Backup ID required", 400);
    }

    const backup = await prisma.databaseBackup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      return formatResponse(false, null, "Backup not found", 404);
    }

    return formatResponse(
      true,
      {
        backup: {
          ...backup,
          sizeBytes: backup.sizeBytes ? Number(backup.sizeBytes) : 0,
        },
      },
      "Backup retrieved successfully",
      200
    );
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);

export const DELETE = withApiHandler(
  async (req, context) => {
    const backupId = context.params?.id;

    if (!backupId) {
      return formatResponse(false, null, "Backup ID required", 400);
    }

    const backup = await prisma.databaseBackup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      return formatResponse(false, null, "Backup not found", 404);
    }

    // Delete artifact from cloud storage
    if (backup.storageKey) {
      const storage = getBackupStorageProvider();
      try {
        await storage.delete(backup.storageKey);
      } catch (err: any) {
        console.warn(`[BackupAPI] Could not delete cloud object for ${backupId}:`, err.message);
      }
    }

    await prisma.databaseBackup.delete({
      where: { id: backupId },
    });

    return formatResponse(true, { backupId }, "Backup deleted successfully", 200);
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);
