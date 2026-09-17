/**
 * app/api/super-admin/observability/storage/route.ts
 *
 * Media Assets, Local Disk, and Backup Storage Telemetry API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";
import { collectServerMetrics } from "@/lib/observability/serverCollector";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin(req);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unauthorized" },
      { status: err.statusCode || 401 },
    );
  }

  try {
    const [server, mediaCount, mediaJobsPending, mediaJobsFailed, backups] = await Promise.all([
      collectServerMetrics().catch(() => null),
      prisma.mediaAsset.count().catch(() => 0),
      prisma.mediaJob.count({ where: { status: "PENDING" } }).catch(() => 0),
      prisma.mediaJob.count({ where: { status: "FAILED" } }).catch(() => 0),
      prisma.databaseBackup.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          sizeBytes: true,
          status: true,
          createdAt: true,
        },
      }).catch(() => []),
    ]);

    const totalBackupBytes = backups.reduce((acc, b) => acc + Number(b.sizeBytes || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        disk: {
          totalBytes: server?.diskTotalBytes || 0,
          usedBytes: server?.diskUsedBytes || 0,
          usagePercent: server?.diskUsagePercent || 0,
        },
        media: {
          totalMediaAssets: mediaCount,
          pendingProcessingJobs: mediaJobsPending,
          failedProcessingJobs: mediaJobsFailed,
        },
        backups: {
          recentCount: backups.length,
          totalStorageBytes: totalBackupBytes,
          recent: backups.map((b) => ({
            ...b,
            backupSizeBytes: Number(b.sizeBytes || 0),
            createdAt: b.createdAt.toISOString(),
          })),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch storage telemetry" },
      { status: 500 },
    );
  }
}
