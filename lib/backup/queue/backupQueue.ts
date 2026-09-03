/**
 * lib/backup/queue/backupQueue.ts
 *
 * BullMQ Queues and Schedulers for Database Backups, Restores, and Maintenance.
 */

import { Queue, Job } from "bullmq";
import { redisConnection } from "../../redis";
import {
  BackupJobData,
  RestoreJobData,
  MaintenanceJobData,
  BackupType,
} from "../types";

export const BACKUP_QUEUE_NAME = "salesmanpro-database-backups";
export const RESTORE_QUEUE_NAME = "salesmanpro-database-restores";
export const MAINTENANCE_QUEUE_NAME = "salesmanpro-database-maintenance";

export const backupQueue = new Queue<BackupJobData>(BACKUP_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const restoreQueue = new Queue<RestoreJobData>(RESTORE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1, // Restore operations should not auto-retry blindly to prevent looping
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

export const maintenanceQueue = new Queue<MaintenanceJobData>(MAINTENANCE_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 10000,
    },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

/**
 * Enqueues an on-demand or scheduled backup job.
 */
export async function enqueueBackupJob(
  data: BackupJobData,
  customJobId?: string
): Promise<Job<BackupJobData>> {
  const jobId = customJobId || `backup:${data.backupType.toLowerCase()}:${data.backupId}`;
  return backupQueue.add("execute-backup", data, {
    jobId,
    priority: data.backupType === "PRE_RESTORE" ? 1 : 5,
  });
}

/**
 * Enqueues a durable restore job.
 */
export async function enqueueRestoreJob(data: RestoreJobData): Promise<Job<RestoreJobData>> {
  return restoreQueue.add("execute-restore", data, {
    jobId: `restore:${data.restoreJobId}`,
    priority: 1, // Highest priority
  });
}

/**
 * Enqueues maintenance operations (retention pruning, reconciliation).
 */
export async function enqueueMaintenanceJob(data: MaintenanceJobData): Promise<Job<MaintenanceJobData>> {
  return maintenanceQueue.add("execute-maintenance", data, {
    jobId: `maintenance:${data.action.toLowerCase()}:${Date.now()}`,
  });
}

/**
 * Registers BullMQ repeatable cron schedules for automated backups.
 * Idempotent across multiple servers; Redis will deduplicate schedules.
 */
export async function setupBackupSchedules(config?: {
  hourlyEnabled?: boolean;
  dailyEnabled?: boolean;
  weeklyEnabled?: boolean;
  monthlyEnabled?: boolean;
  dailyCron?: string;
  weeklyCron?: string;
  monthlyCron?: string;
}) {
  const isHourly = config?.hourlyEnabled ?? (process.env.BACKUP_HOURLY_ENABLED !== "false");
  const isDaily = config?.dailyEnabled ?? (process.env.BACKUP_DAILY_ENABLED !== "false");
  const isWeekly = config?.weeklyEnabled ?? (process.env.BACKUP_WEEKLY_ENABLED !== "false");
  const isMonthly = config?.monthlyEnabled ?? (process.env.BACKUP_MONTHLY_ENABLED !== "false");

  const dailyCron = config?.dailyCron || process.env.BACKUP_DAILY_CRON || "0 2 * * *";
  const weeklyCron = config?.weeklyCron || process.env.BACKUP_WEEKLY_CRON || "0 3 * * 0";
  const monthlyCron = config?.monthlyCron || process.env.BACKUP_MONTHLY_CRON || "0 4 1 * *";

  console.log("[BackupQueue] Initializing automated backup schedules via BullMQ Scheduler...");

  try {
    // 1. Hourly Schedule
    if (isHourly) {
      await (backupQueue as any).upsertJobScheduler(
        "scheduled-hourly",
        { pattern: "0 * * * *" },
        {
          name: "scheduled-hourly",
          data: {
            backupId: "scheduled",
            backupType: "HOURLY" as BackupType,
            triggeredBy: "SCHEDULER_HOURLY",
          },
        }
      );
      console.log("  [Scheduler] Hourly backup registered (0 * * * *)");
    } else {
      await (backupQueue as any).removeJobScheduler("scheduled-hourly").catch(() => null);
    }

    // 2. Daily Schedule
    if (isDaily) {
      await (backupQueue as any).upsertJobScheduler(
        "scheduled-daily",
        { pattern: dailyCron },
        {
          name: "scheduled-daily",
          data: {
            backupId: "scheduled",
            backupType: "DAILY" as BackupType,
            triggeredBy: "SCHEDULER_DAILY",
          },
        }
      );
      console.log(`  [Scheduler] Daily backup registered (${dailyCron})`);
    } else {
      await (backupQueue as any).removeJobScheduler("scheduled-daily").catch(() => null);
    }

    // 3. Weekly Schedule
    if (isWeekly) {
      await (backupQueue as any).upsertJobScheduler(
        "scheduled-weekly",
        { pattern: weeklyCron },
        {
          name: "scheduled-weekly",
          data: {
            backupId: "scheduled",
            backupType: "WEEKLY" as BackupType,
            triggeredBy: "SCHEDULER_WEEKLY",
          },
        }
      );
      console.log(`  [Scheduler] Weekly backup registered (${weeklyCron})`);
    } else {
      await (backupQueue as any).removeJobScheduler("scheduled-weekly").catch(() => null);
    }

    // 4. Monthly Schedule
    if (isMonthly) {
      await (backupQueue as any).upsertJobScheduler(
        "scheduled-monthly",
        { pattern: monthlyCron },
        {
          name: "scheduled-monthly",
          data: {
            backupId: "scheduled",
            backupType: "MONTHLY" as BackupType,
            triggeredBy: "SCHEDULER_MONTHLY",
          },
        }
      );
      console.log(`  [Scheduler] Monthly backup registered (${monthlyCron})`);
    } else {
      await (backupQueue as any).removeJobScheduler("scheduled-monthly").catch(() => null);
    }
  } catch (schedErr: any) {
    console.warn("[BackupQueue] Could not configure schedules (Redis may be offline):", schedErr.message);
  }
}

