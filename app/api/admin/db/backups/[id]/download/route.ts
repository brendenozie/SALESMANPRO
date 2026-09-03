/**
 * app/api/admin/db/backups/[id]/download/route.ts
 *
 * GET: Generates an authenticated short-lived presigned cloud download URL
 * or streams decrypted plain JSON for offline local inspection.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";
import { getBackupStorageProvider } from "@/lib/backup/storage/storageProvider";
import { decryptAndDecompressBackup } from "@/lib/backup/crypto/cryptoPipeline";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    const backupId = context.params?.id;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format"); // "json" | "raw"

    if (!backupId) {
      return formatResponse(false, null, "Backup ID required", 400);
    }

    const backup = await prisma.databaseBackup.findUnique({
      where: { id: backupId },
    });

    if (!backup || !backup.storageKey) {
      return formatResponse(false, null, "Backup artifact not found", 404);
    }

    const storage = getBackupStorageProvider();

    // If decrypted JSON download is explicitly requested
    if (format === "json") {
      const stream = await storage.download(backup.storageKey);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const buffer = Buffer.concat(chunks);

      const { plainBuffer } = await decryptAndDecompressBackup(
        buffer,
        backup.checksum || undefined
      );

      return new Response(plainBuffer, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename=salesmanpro-backup-${backup.id}.json`,
        },
      });
    }

    // Default: Presigned Cloud Download URL
    try {
      const downloadUrl = await storage.getSignedDownloadUrl(backup.storageKey, 3600);
      return formatResponse(
        true,
        {
          downloadUrl,
          storageKey: backup.storageKey,
          checksum: backup.checksum,
          sizeBytes: backup.sizeBytes ? Number(backup.sizeBytes) : 0,
          expiresInSeconds: 3600,
        },
        "Download URL generated successfully",
        200
      );
    } catch (err: any) {
      return formatResponse(false, null, `Failed to generate download URL: ${err.message}`, 500);
    }
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);
