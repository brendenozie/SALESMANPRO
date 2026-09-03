/**
 * app/api/admin/db/backups/route.ts
 *
 * GET: List all backups from database registry (with pagination & status filters).
 * POST: Create an on-demand manual or pre-deployment backup.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";
import { backupService } from "@/lib/backup/backupService";
import { formatResponse } from "@/lib/formatResponse";
import { BackupType } from "@/lib/backup/types";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.backupType = type;

    const [backups, totalCount] = await Promise.all([
      prisma.databaseBackup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.databaseBackup.count({ where }),
    ]);

    // Format BigInt sizeBytes for JSON response
    const formatted = backups.map((b) => ({
      ...b,
      sizeBytes: b.sizeBytes ? Number(b.sizeBytes) : 0,
    }));

    return formatResponse(
      true,
      {
        backups: formatted,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
      "Backups retrieved successfully",
      200
    );
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);

export const POST = withApiHandler(
  async (req, context) => {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const backupType = (body.type || "MANUAL") as BackupType;
    const requestedBy = context.user?.email || context.user?.id || "admin";

    const record = await backupService.triggerBackup(backupType, requestedBy);

    return formatResponse(
      true,
      {
        backup: {
          ...record,
          sizeBytes: record.sizeBytes ? Number(record.sizeBytes) : 0,
        },
      },
      "Backup job enqueued successfully",
      202
    );
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);
