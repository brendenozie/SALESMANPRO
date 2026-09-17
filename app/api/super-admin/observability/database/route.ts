/**
 * app/api/super-admin/observability/database/route.ts
 *
 * MongoDB & Database Health Telemetry API.
 */

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/ai/authHelper";
import prisma from "@/server/db/prismadb";
import { getDatabaseHealth } from "@/lib/observability/dbMonitor";

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
    const health = await getDatabaseHealth();

    // Fetch recent database backup history
    const recentBackups = await prisma.databaseBackup.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        backupType: true,
        status: true,
        sizeBytes: true,
        createdAt: true,
        completedAt: true,
        verifiedAt: true,
        failureReason: true,
      },
    }).catch(() => []);

    return NextResponse.json({
      success: true,
      data: {
        health,
        recentBackups: recentBackups.map((b) => ({
          ...b,
          backupSizeBytes: Number(b.sizeBytes || 0),
          createdAt: b.createdAt.toISOString(),
          completedAt: b.completedAt?.toISOString() || null,
          verifiedAt: b.verifiedAt?.toISOString() || null,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch database health" },
      { status: 500 },
    );
  }
}
