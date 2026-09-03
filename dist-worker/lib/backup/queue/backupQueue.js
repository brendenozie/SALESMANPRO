"use strict";
/**
 * lib/backup/queue/backupQueue.ts
 *
 * BullMQ Queues and Schedulers for Database Backups, Restores, and Maintenance.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupBackupSchedules = exports.enqueueMaintenanceJob = exports.enqueueRestoreJob = exports.enqueueBackupJob = exports.maintenanceQueue = exports.restoreQueue = exports.backupQueue = exports.MAINTENANCE_QUEUE_NAME = exports.RESTORE_QUEUE_NAME = exports.BACKUP_QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../redis");
exports.BACKUP_QUEUE_NAME = "salesmanpro-database-backups";
exports.RESTORE_QUEUE_NAME = "salesmanpro-database-restores";
exports.MAINTENANCE_QUEUE_NAME = "salesmanpro-database-maintenance";
exports.backupQueue = new bullmq_1.Queue(exports.BACKUP_QUEUE_NAME, {
    connection: redis_1.redisConnection,
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
exports.restoreQueue = new bullmq_1.Queue(exports.RESTORE_QUEUE_NAME, {
    connection: redis_1.redisConnection,
    defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 100,
        removeOnFail: 500,
    },
});
exports.maintenanceQueue = new bullmq_1.Queue(exports.MAINTENANCE_QUEUE_NAME, {
    connection: redis_1.redisConnection,
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
async function enqueueBackupJob(data, customJobId) {
    const jobId = customJobId || `backup:${data.backupType.toLowerCase()}:${data.backupId}`;
    return exports.backupQueue.add("execute-backup", data, {
        jobId,
        priority: data.backupType === "PRE_RESTORE" ? 1 : 5,
    });
}
exports.enqueueBackupJob = enqueueBackupJob;
/**
 * Enqueues a durable restore job.
 */
async function enqueueRestoreJob(data) {
    return exports.restoreQueue.add("execute-restore", data, {
        jobId: `restore:${data.restoreJobId}`,
        priority: 1, // Highest priority
    });
}
exports.enqueueRestoreJob = enqueueRestoreJob;
/**
 * Enqueues maintenance operations (retention pruning, reconciliation).
 */
async function enqueueMaintenanceJob(data) {
    return exports.maintenanceQueue.add("execute-maintenance", data, {
        jobId: `maintenance:${data.action.toLowerCase()}:${Date.now()}`,
    });
}
exports.enqueueMaintenanceJob = enqueueMaintenanceJob;
/**
 * Registers BullMQ repeatable cron schedules for automated backups.
 * Idempotent across multiple servers; Redis will deduplicate schedules.
 */
async function setupBackupSchedules(config) {
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
            await exports.backupQueue.upsertJobScheduler("scheduled-hourly", { pattern: "0 * * * *" }, {
                name: "scheduled-hourly",
                data: {
                    backupId: "scheduled",
                    backupType: "HOURLY",
                    triggeredBy: "SCHEDULER_HOURLY",
                },
            });
            console.log("  [Scheduler] Hourly backup registered (0 * * * *)");
        }
        else {
            await exports.backupQueue.removeJobScheduler("scheduled-hourly").catch(() => null);
        }
        // 2. Daily Schedule
        if (isDaily) {
            await exports.backupQueue.upsertJobScheduler("scheduled-daily", { pattern: dailyCron }, {
                name: "scheduled-daily",
                data: {
                    backupId: "scheduled",
                    backupType: "DAILY",
                    triggeredBy: "SCHEDULER_DAILY",
                },
            });
            console.log(`  [Scheduler] Daily backup registered (${dailyCron})`);
        }
        else {
            await exports.backupQueue.removeJobScheduler("scheduled-daily").catch(() => null);
        }
        // 3. Weekly Schedule
        if (isWeekly) {
            await exports.backupQueue.upsertJobScheduler("scheduled-weekly", { pattern: weeklyCron }, {
                name: "scheduled-weekly",
                data: {
                    backupId: "scheduled",
                    backupType: "WEEKLY",
                    triggeredBy: "SCHEDULER_WEEKLY",
                },
            });
            console.log(`  [Scheduler] Weekly backup registered (${weeklyCron})`);
        }
        else {
            await exports.backupQueue.removeJobScheduler("scheduled-weekly").catch(() => null);
        }
        // 4. Monthly Schedule
        if (isMonthly) {
            await exports.backupQueue.upsertJobScheduler("scheduled-monthly", { pattern: monthlyCron }, {
                name: "scheduled-monthly",
                data: {
                    backupId: "scheduled",
                    backupType: "MONTHLY",
                    triggeredBy: "SCHEDULER_MONTHLY",
                },
            });
            console.log(`  [Scheduler] Monthly backup registered (${monthlyCron})`);
        }
        else {
            await exports.backupQueue.removeJobScheduler("scheduled-monthly").catch(() => null);
        }
    }
    catch (schedErr) {
        console.warn("[BackupQueue] Could not configure schedules (Redis may be offline):", schedErr.message);
    }
}
exports.setupBackupSchedules = setupBackupSchedules;
