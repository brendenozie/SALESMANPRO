/**
 * app/api/admin/backup/list/route.ts
 *
 * GET: Compatibility endpoint returning backup list for admin clients.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    const backups = await prisma.databaseBackup.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = backups.map((b) => ({
      id: b.id,
      key: b.storageKey || `backup-${b.id}`,
      type: b.backupType,
      status: b.status,
      size: b.sizeBytes ? Number(b.sizeBytes) : 0,
      checksum: b.checksum,
      verificationStatus: b.verificationStatus,
      lastModified: b.completedAt || b.createdAt,
    }));

    return Response.json({
      success: true,
      backups: formatted,
    });
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);
