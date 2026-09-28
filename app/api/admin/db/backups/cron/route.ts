/**
 * app/api/admin/db/backups/cron/route.ts
 *
 * Dedicated Cron Endpoint for automated scheduled backups.
 * Can be invoked by external cron (e.g., cron-job.org, GitHub Actions, Vercel Cron)
 * or server crontab via GET / POST with ?key=CRON_SECRET or Admin session.
 */

import { NextResponse } from "next/server";
import { backupService } from "@/lib/backup/backupService";
import prisma from "@/server/db/prismadb";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow sufficient duration for backup

export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}

async function handleCron(req: Request) {
  const { searchParams } = new URL(req.url);
  const cronKey = searchParams.get("key");
  const authHeader = req.headers.get("authorization");

  const validSecret =
    process.env.CRON_SECRET ||
    process.env.BACKUP_CRON_SECRET ||
    process.env.NEXTAUTH_SECRET;

  const isAuthorized =
    (validSecret && cronKey === validSecret) ||
    (validSecret && authHeader === `Bearer ${validSecret}`);

  if (!isAuthorized && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    const config = await prisma.backupSystemConfig.findFirst();
    if (config && config.enabled === false) {
      return NextResponse.json({
        success: true,
        message: "Backups are currently disabled in backupSystemConfig",
      });
    }

    const type = (searchParams.get("type") || (config?.hourlyEnabled ? "HOURLY" : "DAILY")) as any;
    const backupRecord = await backupService.triggerBackup(type, "CRON_SCHEDULER");

    return NextResponse.json({
      success: true,
      message: `Automated backup (${type}) enqueued/started successfully`,
      backupId: backupRecord.id,
      startedAt: backupRecord.startedAt,
    });
  } catch (error: any) {
    console.error("[BackupCron] Execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to trigger automated backup",
      },
      { status: 500 }
    );
  }
}
