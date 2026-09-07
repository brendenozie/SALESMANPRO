"use strict";
/**
 * lib/backup/queue/backupWorker.ts
 *
 * Dedicated BullMQ Worker for processing Database Backups, Restores,
 * Artifact Verification, Retention Pruning, and Automated Restore Testing.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcileStorageAndRegistry = exports.pruneExpiredBackups = exports.createBackupWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../../redis");
const prismadb_1 = __importDefault(require("../../../server/db/prismadb"));
const backupQueue_1 = require("./backupQueue");
const backupEngine_1 = require("../engine/backupEngine");
const restoreEngine_1 = require("../engine/restoreEngine");
const distributedLock_1 = require("./distributedLock");
const storageProvider_1 = require("../storage/storageProvider");
function createBackupWorker() {
    console.log("[BackupWorker] Initializing dedicated database backup & restore workers...");
    // 1. BACKUP WORKER
    const backupWorker = new bullmq_1.Worker(backupQueue_1.BACKUP_QUEUE_NAME, async (job) => {
        let { backupId, backupType, triggeredBy } = job.data;
        const workerId = `backup-worker-${process.pid}`;
        const serverId = process.env.SERVER_ID || "primary-node";
        console.log(`[BackupWorker] Received backup job ${job.id} (Type: ${backupType}, ID: ${backupId})`);
        // If scheduled job, create a new DatabaseBackup record
        if (backupId === "scheduled" || !backupId) {
            const newBackup = await prismadb_1.default.databaseBackup.create({
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
        const lock = await (0, distributedLock_1.acquireDistributedLock)(`backup:exec:${backupType.toLowerCase()}`, 1200);
        if (!lock.acquired) {
            console.warn(`[BackupWorker] Distributed lock already held for ${backupType}. Skipping duplicate execution.`);
            await prismadb_1.default.databaseBackup.update({
                where: { id: backupId },
                data: {
                    status: "FAILED",
                    failureReason: "Lock collision: another instance is running this backup class.",
                },
            });
            return;
        }
        try {
            await prismadb_1.default.databaseBackup.update({
                where: { id: backupId },
                data: {
                    status: "RUNNING",
                    startedAt: new Date(),
                    workerId,
                    serverId,
                },
            });
            // Execute streaming backup pipeline
            const result = await backupEngine_1.backupEngine.executeBackup(backupId, backupType, async (model, done, total) => {
                await job.updateProgress(Math.round((done / total) * 100));
            });
            // Update record with storage & verification details
            await prismadb_1.default.databaseBackup.update({
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
                    manifest: result.manifest,
                },
            });
            console.log(`✅ [BackupWorker] Backup ${backupId} completed and verified.`);
            // Trigger asynchronous retention pruning
            await (0, backupQueue_1.enqueueMaintenanceJob)({ action: "RETENTION_PRUNING" });
        }
        catch (err) {
            console.error(`❌ [BackupWorker] Backup job ${job.id} (${backupId}) failed:`, err);
            await prismadb_1.default.databaseBackup.update({
                where: { id: backupId },
                data: {
                    status: "FAILED",
                    completedAt: new Date(),
                    failureReason: err.message,
                },
            });
            throw err;
        }
        finally {
            await (0, distributedLock_1.releaseDistributedLock)(lock);
        }
    }, {
        connection: redis_1.redisConnection,
        concurrency: 1, // Only 1 backup at a time per worker instance
    });
    // 2. RESTORE WORKER
    const restoreWorker = new bullmq_1.Worker(backupQueue_1.RESTORE_QUEUE_NAME, async (job) => {
        const { restoreJobId, backupId, mode, requestedBy } = job.data;
        console.log(`[RestoreWorker] Received restore job ${job.id} (RestoreJob: ${restoreJobId})`);
        try {
            await restoreEngine_1.restoreEngine.executeRestore(restoreJobId, backupId, mode, requestedBy);
            console.log(`✅ [RestoreWorker] Restore job ${restoreJobId} completed.`);
        }
        catch (err) {
            console.error(`❌ [RestoreWorker] Restore job ${restoreJobId} failed:`, err);
            throw err;
        }
    }, {
        connection: redis_1.redisConnection,
        concurrency: 1, // Restores must run sequentially
    });
    // 3. MAINTENANCE WORKER (Retention & Pruning)
    const maintenanceWorker = new bullmq_1.Worker(backupQueue_1.MAINTENANCE_QUEUE_NAME, async (job) => {
        console.log(`[MaintenanceWorker] Processing action: ${job.data.action}`);
        if (job.data.action === "RETENTION_PRUNING") {
            await pruneExpiredBackups();
        }
        else if (job.data.action === "RECONCILIATION") {
            await reconcileStorageAndRegistry();
        }
    }, {
        connection: redis_1.redisConnection,
        concurrency: 1,
    });
    backupWorker.on("error", (err) => {
        console.error("[BackupWorker_REDIS_ERROR]", err.message);
    });
    restoreWorker.on("error", (err) => {
        console.error("[RestoreWorker_REDIS_ERROR]", err.message);
    });
    maintenanceWorker.on("error", (err) => {
        console.error("[MaintenanceWorker_REDIS_ERROR]", err.message);
    });
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
exports.createBackupWorker = createBackupWorker;
/**
 * Enforces Retention Policy:
 * Keeps last 48 Hourly, 30 Daily, 12 Weekly, 12 Monthly backups.
 * Deletes older objects from cloud storage and marks records EXPIRED.
 */
async function pruneExpiredBackups() {
    const retentionRules = {
        HOURLY: parseInt(process.env.BACKUP_RETENTION_HOURLY || "48", 10),
        DAILY: parseInt(process.env.BACKUP_RETENTION_DAILY || "30", 10),
        WEEKLY: parseInt(process.env.BACKUP_RETENTION_WEEKLY || "12", 10),
        MONTHLY: parseInt(process.env.BACKUP_RETENTION_MONTHLY || "12", 10),
        MANUAL: 100,
        PRE_DEPLOYMENT: 20,
        PRE_RESTORE: 50,
        DISASTER_RECOVERY: 100,
    };
    const storage = (0, storageProvider_1.getBackupStorageProvider)();
    for (const [type, maxRetention] of Object.entries(retentionRules)) {
        const backups = await prismadb_1.default.databaseBackup.findMany({
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
                    await prismadb_1.default.databaseBackup.update({
                        where: { id: b.id },
                        data: { status: "EXPIRED" },
                    });
                    console.log(`  [Retention] Pruned backup ${b.id} (${b.storageKey})`);
                }
                catch (err) {
                    console.error(`  [Retention] Failed to prune backup ${b.id}:`, err.message);
                }
            }
        }
    }
}
exports.pruneExpiredBackups = pruneExpiredBackups;
/**
 * Reconciles Cloud Storage artifacts with the database registry.
 * Detects orphaned cloud objects or missing database artifacts.
 */
async function reconcileStorageAndRegistry() {
    const storage = (0, storageProvider_1.getBackupStorageProvider)();
    console.log("[Reconciliation] Starting backup storage and registry reconciliation...");
    try {
        const cloudObjects = await storage.list(process.env.BACKUP_S3_PREFIX || "backups/production/mongodb");
        const dbBackups = await prismadb_1.default.databaseBackup.findMany({
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
                await prismadb_1.default.databaseBackup.update({
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
    }
    catch (err) {
        console.error("[Reconciliation] Failed to reconcile storage:", err.message);
    }
}
exports.reconcileStorageAndRegistry = reconcileStorageAndRegistry;
