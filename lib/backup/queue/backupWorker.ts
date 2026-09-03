/**
 * lib/backup/queue/backupWorker.ts
 *
 * Dedicated BullMQ Worker for processing Database Backups, Restores,
 * Artifact Verification, Retention Pruning, and Automated Restore Testing.
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "../../redis";
import prisma from "../../../server/db/prismadb";
import {
  BACKUP_QUEUE_NAME,
  RESTORE_QUEUE_NAME,
  MAINTENANCE_QUEUE_NAME,
  enqueueMaintenanceJob,
} from "./backupQueue";
import {
  BackupJobData,
  RestoreJobData,
  MaintenanceJobData,
  BackupType,
} from "../types";
import { backupEngine } from "../engine/backupEngine";
import { restoreEngine } from "../engine/restoreEngine";
import { acquireDistributedLock, releaseDistributedLock } from "./distributedLock";
import { getBackupStorageProvider } from "../storage/storageProvider";

export interface BackupWorkerInstances {
  backupWorker: Worker<BackupJobData>;
  restoreWorker: Worker<RestoreJobData>;
  maintenanceWorker: Worker<MaintenanceJobData>;
  close: () => Promise<void>;
}

export function createBackupWorker(): BackupWorkerInstances {
  console.log("[BackupWorker] Initializing dedicated database backup & restore workers...");

  // 1. BACKUP WORKER
  const backupWorker = new Worker<BackupJobData>(
    BACKUP_QUEUE_NAME,
    async (job: Job<BackupJobData>) => {
      let { backupId, backupType, triggeredBy } = job.data;
      const workerId = `backup-worker-${process.pid}`;
      const serverId = process.env.SERVER_ID || "primary-node";

      console.log(`[BackupWorker] Received backup job ${job.id} (Type: ${backupType}, ID: ${backupId})`);

      // If scheduled job, create a new DatabaseBackup record
      if (backupId === "scheduled" || !backupId) {
        const newBackup = await prisma.databaseBackup.create({
          data: {
            backupType,
            status: "QUEUED",
            startedAt: new Date(),
            triggeredBy: triggeredBy || "SCHEDULER",
            workerId,
            serverId,
          },
        });
        backupId = newBackup.id;
      }

      // Acquire distributed execution lock (prevent duplicate jobs across nodes)
      const lock = await acquireDistributedLock(`backup:exec:${backupType.toLowerCase()}`, 1200);
      if (!lock.acquired) {
        console.warn(`[BackupWorker] Distributed lock already held for ${backupType}. Skipping duplicate execution.`);
        await prisma.databaseBackup.update({
          where: { id: backupId },
          data: {
            status: "FAILED",
            failureReason: "Lock collision: another instance is running this backup class.",
          },
        });
        return;
      }

      try {
        await prisma.databaseBackup.update({
          where: { id: backupId },
          data: {
            status: "RUNNING",
            startedAt: new Date(),
            workerId,
            serverId,
          },
        });

        // Execute streaming backup pipeline
        const result = await backupEngine.executeBackup(
          backupId,
          backupType,
          async (model, done, total) => {
            await job.updateProgress(Math.round((done / total) * 100));
          }
        );

        // Update record with storage & verification details
        await prisma.databaseBackup.update({
          where: { id: backupId },
          data: {
            status: "VERIFIED",
            completedAt: new Date(),
            storageProvider: result.storageProvider,
            storageBucket: result.storageBucket,
            storageKey: result.storageKey,
            sizeBytes: BigInt(result.sizeBytes),
            checksum: result.checksum,
            collectionCount: result.collectionCount,
            recordCount: result.recordCount,
            durationMs: result.durationMs,
            verificationStatus: "VERIFIED",
            verifiedAt: new Date(),
            manifest: result.manifest as any,
          },
        });

        console.log(`✅ [BackupWorker] Backup ${backupId} completed and verified.`);

        // Trigger asynchronous retention pruning
        await enqueueMaintenanceJob({ action: "RETENTION_PRUNING" });
      } catch (err: any) {
        console.error(`❌ [BackupWorker] Backup job ${job.id} (${backupId}) failed:`, err);

        await prisma.databaseBackup.update({
          where: { id: backupId },
          data: {
            status: "FAILED",
            completedAt: new Date(),
            failureReason: err.message,
          },
        });

        throw err;
      } finally {
        await releaseDistributedLock(lock);
      }
    },
    {
      connection: redisConnection,
      concurrency: 1, // Only 1 backup at a time per worker instance
    }
  );

  // 2. RESTORE WORKER
  const restoreWorker = new Worker<RestoreJobData>(
    RESTORE_QUEUE_NAME,
    async (job: Job<RestoreJobData>) => {
      const { restoreJobId, backupId, mode, requestedBy } = job.data;
      console.log(`[RestoreWorker] Received restore job ${job.id} (RestoreJob: ${restoreJobId})`);

      try {
        await restoreEngine.executeRestore(
          restoreJobId,
          backupId,
          mode,
          requestedBy
        );
        console.log(`✅ [RestoreWorker] Restore job ${restoreJobId} completed.`);
      } catch (err: any) {
        console.error(`❌ [RestoreWorker] Restore job ${restoreJobId} failed:`, err);
        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: 1, // Restores must run sequentially
    }
  );

  // 3. MAINTENANCE WORKER (Retention & Pruning)
  const maintenanceWorker = new Worker<MaintenanceJobData>(
    MAINTENANCE_QUEUE_NAME,
    async (job: Job<MaintenanceJobData>) => {
      console.log(`[MaintenanceWorker] Processing action: ${job.data.action}`);

      if (job.data.action === "RETENTION_PRUNING") {
        await pruneExpiredBackups();
      } else if (job.data.action === "RECONCILIATION") {
        await reconcileStorageAndRegistry();
      }
    },
    {
      connection: redisConnection,
      concurrency: 1,
    }
  );

  return {
    backupWorker,
    restoreWorker,
    maintenanceWorker,
    close: async () => {
      await Promise.all([
        backupWorker.close(),
        restoreWorker.close(),
        maintenanceWorker.close(),
      ]);
    },
  };
}

/**
 * Enforces Retention Policy:
 * Keeps last 48 Hourly, 30 Daily, 12 Weekly, 12 Monthly backups.
 * Deletes older objects from cloud storage and marks records EXPIRED.
 */
export async function pruneExpiredBackups() {
  const retentionRules: Record<BackupType, number> = {
    HOURLY: parseInt(process.env.BACKUP_RETENTION_HOURLY || "48", 10),
    DAILY: parseInt(process.env.BACKUP_RETENTION_DAILY || "30", 10),
    WEEKLY: parseInt(process.env.BACKUP_RETENTION_WEEKLY || "12", 10),
    MONTHLY: parseInt(process.env.BACKUP_RETENTION_MONTHLY || "12", 10),
    MANUAL: 100,
    PRE_DEPLOYMENT: 20,
    PRE_RESTORE: 50,
    DISASTER_RECOVERY: 100,
  };

  const storage = getBackupStorageProvider();

  for (const [type, maxRetention] of Object.entries(retentionRules)) {
    const backups = await prisma.databaseBackup.findMany({
      where: {
        backupType: type,
        status: { in: ["VERIFIED", "COMPLETED"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (backups.length > maxRetention) {
      const expired = backups.slice(maxRetention);
      console.log(`[Retention] Pruning ${expired.length} expired ${type} backups (Retention: ${maxRetention})...`);

      for (const b of expired) {
        try {
          if (b.storageKey) {
            await storage.delete(b.storageKey);
          }
          await prisma.databaseBackup.update({
            where: { id: b.id },
            data: { status: "EXPIRED" },
          });
          console.log(`  [Retention] Pruned backup ${b.id} (${b.storageKey})`);
        } catch (err: any) {
          console.error(`  [Retention] Failed to prune backup ${b.id}:`, err.message);
        }
      }
    }
  }
}

/**
 * Reconciles Cloud Storage artifacts with the database registry.
 * Detects orphaned cloud objects or missing database artifacts.
 */
export async function reconcileStorageAndRegistry() {
  const storage = getBackupStorageProvider();
  console.log("[Reconciliation] Starting backup storage and registry reconciliation...");

  try {
    const cloudObjects = await storage.list(process.env.BACKUP_S3_PREFIX || "backups/production/mongodb");
    const dbBackups = await prisma.databaseBackup.findMany({
      where: {
        status: { in: ["VERIFIED", "COMPLETED"] },
      },
    });

    const dbKeys = new Set(dbBackups.map((b) => b.storageKey).filter(Boolean));
    const cloudKeys = new Set(cloudObjects.map((o) => o.key));

    // Check for DB records pointing to missing cloud artifacts
    for (const b of dbBackups) {
      if (b.storageKey && !cloudKeys.has(b.storageKey)) {
        console.warn(`[Reconciliation] Missing cloud artifact for DB backup: ${b.id} (${b.storageKey})`);
        await prisma.databaseBackup.update({
          where: { id: b.id },
          data: { status: "CORRUPTED", failureReason: "Object missing in cloud storage" },
        });
      }
    }

    // Check for orphaned cloud artifacts
    let orphanCount = 0;
    for (const obj of cloudObjects) {
      if (!dbKeys.has(obj.key)) {
        orphanCount++;
        console.log(`[Reconciliation] Discovered orphaned storage artifact: ${obj.key} (${obj.sizeBytes} bytes)`);
      }
    }

    console.log(`[Reconciliation] Reconciliation complete. Found ${orphanCount} orphaned storage objects.`);
  } catch (err: any) {
    console.error("[Reconciliation] Failed to reconcile storage:", err.message);
  }
}
