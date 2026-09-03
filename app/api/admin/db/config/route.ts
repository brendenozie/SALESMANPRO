/**
 * app/api/admin/db/config/route.ts
 *
 * GET: Get current backup configuration & retention settings.
 * PATCH: Update dynamic schedule, retention rules, and alerting.
 */

import { withApiHandler } from "@/lib/hooks/withApiHandler";
import prisma from "@/server/db/prismadb";
import { setupBackupSchedules } from "@/lib/backup/queue/backupQueue";
import { formatResponse } from "@/lib/formatResponse";

export const runtime = "nodejs";

export const GET = withApiHandler(
  async (req, context) => {
    let config = await prisma.backupSystemConfig.findFirst();

    if (!config) {
      config = await prisma.backupSystemConfig.create({
        data: {
          enabled: process.env.BACKUP_ENABLED !== "false",
          timezone: process.env.BACKUP_TIMEZONE || "UTC",
          hourlyEnabled: process.env.BACKUP_HOURLY_ENABLED !== "false",
          dailyEnabled: process.env.BACKUP_DAILY_ENABLED !== "false",
          weeklyEnabled: process.env.BACKUP_WEEKLY_ENABLED !== "false",
          monthlyEnabled: process.env.BACKUP_MONTHLY_ENABLED !== "false",
          retentionHourly: parseInt(process.env.BACKUP_RETENTION_HOURLY || "48", 10),
          retentionDaily: parseInt(process.env.BACKUP_RETENTION_DAILY || "30", 10),
          retentionWeekly: parseInt(process.env.BACKUP_RETENTION_WEEKLY || "12", 10),
          retentionMonthly: parseInt(process.env.BACKUP_RETENTION_MONTHLY || "12", 10),
          dailyCron: process.env.BACKUP_DAILY_CRON || "0 2 * * *",
          weeklyCron: process.env.BACKUP_WEEKLY_CRON || "0 3 * * 0",
          monthlyCron: process.env.BACKUP_MONTHLY_CRON || "0 4 1 * *",
          alertEmail: process.env.BACKUP_ALERT_EMAIL || process.env.ADMIN_EMAIL,
          alertsEnabled: process.env.BACKUP_ALERTS_ENABLED !== "false",
        },
      });
    }

    return formatResponse(true, { config }, "Backup configuration retrieved", 200);
  },
  {
    requireAuth: true,
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
  }
);

export const PATCH = withApiHandler(
  async (req, context) => {
    const body = await req.json();

    const existing = await prisma.backupSystemConfig.findFirst();
    const configId = existing ? existing.id : undefined;

    const dataToUpdate: any = {};
    if (typeof body.hourlyEnabled === "boolean") dataToUpdate.hourlyEnabled = body.hourlyEnabled;
    if (typeof body.dailyEnabled === "boolean") dataToUpdate.dailyEnabled = body.dailyEnabled;
    if (typeof body.weeklyEnabled === "boolean") dataToUpdate.weeklyEnabled = body.weeklyEnabled;
    if (typeof body.monthlyEnabled === "boolean") dataToUpdate.monthlyEnabled = body.monthlyEnabled;
    if (typeof body.retentionHourly === "number") dataToUpdate.retentionHourly = body.retentionHourly;
    if (typeof body.retentionDaily === "number") dataToUpdate.retentionDaily = body.retentionDaily;
    if (typeof body.retentionWeekly === "number") dataToUpdate.retentionWeekly = body.retentionWeekly;
    if (typeof body.retentionMonthly === "number") dataToUpdate.retentionMonthly = body.retentionMonthly;
    if (body.dailyCron) dataToUpdate.dailyCron = body.dailyCron;
    if (body.weeklyCron) dataToUpdate.weeklyCron = body.weeklyCron;
    if (body.monthlyCron) dataToUpdate.monthlyCron = body.monthlyCron;
    if (body.alertEmail !== undefined) dataToUpdate.alertEmail = body.alertEmail;
    if (typeof body.alertsEnabled === "boolean") dataToUpdate.alertsEnabled = body.alertsEnabled;

    let updated;
    if (configId) {
      updated = await prisma.backupSystemConfig.update({
        where: { id: configId },
        data: dataToUpdate,
      });
    } else {
      updated = await prisma.backupSystemConfig.create({
        data: dataToUpdate,
      });
    }

    // Refresh BullMQ schedules
    await setupBackupSchedules({
      hourlyEnabled: updated.hourlyEnabled,
      dailyEnabled: updated.dailyEnabled,
      weeklyEnabled: updated.weeklyEnabled,
      monthlyEnabled: updated.monthlyEnabled,
      dailyCron: updated.dailyCron,
      weeklyCron: updated.weeklyCron,
      monthlyCron: updated.monthlyCron,
    });

    return formatResponse(true, { config: updated }, "Backup configuration updated", 200);
  },
  {
    requireAuth: true,
    allowedRoles: ["SUPER_ADMIN"],
  }
);
