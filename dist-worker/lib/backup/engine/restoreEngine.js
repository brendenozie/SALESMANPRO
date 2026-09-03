"use strict";
/**
 * lib/backup/engine/restoreEngine.ts
 *
 * Disaster Recovery & Restore Engine for SalesmanPro.
 * Enforces mandatory pre-restore backups, dependency-aware ordered restoration,
 * checksum validation, and durable progress tracking into DatabaseRestoreJob.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreEngine = exports.RestoreEngine = void 0;
const prismadb_1 = __importDefault(require("../../../server/db/prismadb"));
const cryptoPipeline_1 = require("../crypto/cryptoPipeline");
const storageProvider_1 = require("../storage/storageProvider");
const backupEngine_1 = require("./backupEngine");
const distributedLock_1 = require("../queue/distributedLock");
class RestoreEngine {
    /**
     * Prioritized dependency ordering for MongoDB collection restoration.
     * Ensures parent/reference documents exist before child/dependent records.
     */
    getPriorityOrder() {
        return [
            // Stage 1: Tenancy & Base Identity
            "Company",
            "User",
            "Account",
            "Session",
            "Role",
            "Permission",
            "Department",
            // Stage 2: Store & Tax Config
            "Store",
            "StoreCategory",
            "ProductCategory",
            "CompanyLocation",
            "PaymentConfig",
            "KraConfig",
            // Stage 3: Catalogs & Inventory
            "Product",
            "Inventory",
            "StockLevel",
            "ProductVariant",
            "PriceBook",
            // Stage 4: Customers & CRM
            "Customer",
            "Client",
            "Contact",
            "Lead",
            "Conversation",
            "WhatsAppSession",
            // Stage 5: Transactions & Orders
            "Order",
            "OrderItem",
            "Invoice",
            "Payment",
            "Transaction",
            "Subscription",
        ];
    }
    /**
     * Sorts model names into dependency order, placing unknown models at the end.
     */
    sortModelsByDependency(modelNames) {
        const priority = this.getPriorityOrder();
        const prioritySet = new Set(priority);
        const ordered = [];
        for (const name of priority) {
            if (modelNames.includes(name))
                ordered.push(name);
        }
        // Append remaining models alphabetically
        const remaining = modelNames.filter((m) => !prioritySet.has(m)).sort();
        return [...ordered, ...remaining];
    }
    /**
     * Executes a durable restore job.
     */
    async executeRestore(restoreJobId, backupId, mode, requestedBy) {
        const startTime = Date.now();
        const storage = (0, storageProvider_1.getBackupStorageProvider)();
        console.log(`[RestoreEngine] Starting restore job ${restoreJobId} for backup ${backupId} (Mode: ${mode}) by ${requestedBy}...`);
        // 1. Acquire Distributed Restore Lock to prevent concurrent restores/wipes
        const restoreLock = await (0, distributedLock_1.acquireDistributedLock)("database:restore:exclusive", 1800);
        if (!restoreLock.acquired) {
            throw new Error("Another restore or maintenance operation is currently running. Please wait.");
        }
        let preRestoreBackupId;
        try {
            // 2. Fetch Backup Record from Registry
            const backupRecord = await prismadb_1.default.databaseBackup.findUnique({
                where: { id: backupId },
            });
            if (!backupRecord) {
                throw new Error(`Backup record ${backupId} not found in database registry.`);
            }
            if (!backupRecord.storageKey) {
                throw new Error(`Backup record ${backupId} does not have a storage key.`);
            }
            // Update Restore Job Status -> RUNNING
            await prismadb_1.default.databaseRestoreJob.update({
                where: { id: restoreJobId },
                data: {
                    status: "RUNNING",
                    startedAt: new Date(),
                },
            });
            // 3. Download & Validate Artifact from Cloud Storage
            console.log(`[RestoreEngine] Downloading backup artifact: ${backupRecord.storageKey}...`);
            const artifactStream = await storage.download(backupRecord.storageKey);
            // Read into buffer for cryptographic verification
            const chunks = [];
            for await (const chunk of artifactStream) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const artifactBuffer = Buffer.concat(chunks);
            console.log(`[RestoreEngine] Verifying checksum and decrypting backup (${(artifactBuffer.length / (1024 * 1024)).toFixed(2)} MB)...`);
            const { plainBuffer } = await (0, cryptoPipeline_1.decryptAndDecompressBackup)(artifactBuffer, backupRecord.checksum || undefined);
            // Parse JSON database dump
            const dumpObject = JSON.parse(plainBuffer.toString("utf-8"));
            const manifest = dumpObject.manifest;
            const dataPayload = dumpObject.data || {};
            if (!manifest || !dataPayload) {
                throw new Error("Invalid backup artifact: missing manifest or data payload.");
            }
            const availableModels = Object.keys(dataPayload);
            let totalRecords = 0;
            for (const m of availableModels) {
                totalRecords += (dataPayload[m] || []).length;
            }
            console.log(`[RestoreEngine] Artifact verified. Manifest contains ${availableModels.length} models, ${totalRecords} records.`);
            // Update job progress with discovered counts
            await prismadb_1.default.databaseRestoreJob.update({
                where: { id: restoreJobId },
                data: {
                    collectionsTotal: availableModels.length,
                    recordsTotal: totalRecords,
                },
            });
            // 4. Handle PREVIEW or VALIDATE_ONLY modes
            if (mode === "PREVIEW" || mode === "VALIDATE_ONLY") {
                console.log(`[RestoreEngine] Mode ${mode} complete: Artifact is valid and ready for restore.`);
                await prismadb_1.default.databaseRestoreJob.update({
                    where: { id: restoreJobId },
                    data: {
                        status: "COMPLETED",
                        progressPercent: 100,
                        completedAt: new Date(),
                    },
                });
                return {
                    restoreJobId,
                    backupId,
                    mode,
                    success: true,
                    recordsRestored: 0,
                    recordsFailed: 0,
                    recordsSkipped: totalRecords,
                    collectionsRestored: availableModels.length,
                    durationMs: Date.now() - startTime,
                    errors: {},
                };
            }
            // 5. CRITICAL DISASTER RECOVERY RULE: MANDATORY PRE-RESTORE BACKUP
            if (mode === "RESTORE_TO_PRODUCTION") {
                console.log("⚠️ [RestoreEngine] RESTORE_TO_PRODUCTION requested. Creating emergency PRE_RESTORE backup...");
                await prismadb_1.default.databaseRestoreJob.update({
                    where: { id: restoreJobId },
                    data: { status: "PRE_BACKUP" },
                });
                // Generate emergency backup record
                const emergencyBackup = await prismadb_1.default.databaseBackup.create({
                    data: {
                        backupType: "PRE_RESTORE",
                        status: "RUNNING",
                        startedAt: new Date(),
                        storageProvider: storage.name,
                        triggeredBy: `PRE_RESTORE_FOR_JOB_${restoreJobId}`,
                    },
                });
                preRestoreBackupId = emergencyBackup.id;
                try {
                    const backupResult = await backupEngine_1.backupEngine.executeBackup(emergencyBackup.id, "PRE_RESTORE");
                    await prismadb_1.default.databaseBackup.update({
                        where: { id: emergencyBackup.id },
                        data: {
                            status: "VERIFIED",
                            completedAt: new Date(),
                            sizeBytes: BigInt(backupResult.sizeBytes),
                            checksum: backupResult.checksum,
                            storageKey: backupResult.storageKey,
                            storageBucket: backupResult.storageBucket,
                            collectionCount: backupResult.collectionCount,
                            recordCount: backupResult.recordCount,
                            durationMs: backupResult.durationMs,
                            verificationStatus: "VERIFIED",
                            verifiedAt: new Date(),
                            manifest: backupResult.manifest,
                        },
                    });
                    console.log(`✅ [RestoreEngine] Emergency PRE_RESTORE backup (${emergencyBackup.id}) verified successfully.`);
                }
                catch (backupErr) {
                    console.error("❌ [RestoreEngine] Emergency PRE_RESTORE backup FAILED. ABORTING PRODUCTION RESTORE!", backupErr);
                    await prismadb_1.default.databaseRestoreJob.update({
                        where: { id: restoreJobId },
                        data: {
                            status: "FAILED",
                            errorMessage: `Pre-restore safety backup failed: ${backupErr.message}. Restore aborted to prevent data loss.`,
                        },
                    });
                    throw new Error(`Emergency pre-restore backup failed: ${backupErr.message}. Production restore safely aborted.`);
                }
                await prismadb_1.default.databaseRestoreJob.update({
                    where: { id: restoreJobId },
                    data: {
                        status: "RESTORING",
                        preRestoreBackupId,
                    },
                });
            }
            // 6. Ordered Restoration Execution
            const orderedModels = this.sortModelsByDependency(availableModels);
            const runtimeModels = prismadb_1.default._runtimeDataModel?.models || {};
            let recordsProcessed = 0;
            let recordsRestored = 0;
            let recordsFailed = 0;
            let collectionsDone = 0;
            const errorSummary = {};
            for (let i = 0; i < orderedModels.length; i++) {
                const modelName = orderedModels[i];
                const records = dataPayload[modelName] || [];
                const modelMeta = runtimeModels[modelName];
                const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
                const modelClient = prismadb_1.default[prismaKey];
                if (!modelClient) {
                    console.warn(`[RestoreEngine] Model ${modelName} not found in current schema. Skipping.`);
                    continue;
                }
                console.log(`[RestoreEngine] Restoring model ${modelName} (${records.length} records)...`);
                await prismadb_1.default.databaseRestoreJob.update({
                    where: { id: restoreJobId },
                    data: {
                        currentCollection: modelName,
                        collectionsDone: i,
                        progressPercent: totalRecords > 0 ? (recordsProcessed / totalRecords) * 100 : 0,
                    },
                });
                // WIPE existing records in this collection if in production restore mode
                if (mode === "RESTORE_TO_PRODUCTION") {
                    try {
                        await modelClient.deleteMany({});
                    }
                    catch (deleteErr) {
                        console.warn(`[RestoreEngine] Error clearing collection ${modelName}:`, deleteErr.message);
                    }
                }
                // Batch Insertion
                const batchSize = 500;
                for (let b = 0; b < records.length; b += batchSize) {
                    const batch = records.slice(b, b + batchSize);
                    // Format records based on schema
                    const cleanBatch = batch.map((r) => modelMeta ? backupEngine_1.backupEngine.sanitizeRecord(r, modelMeta) : r);
                    try {
                        const res = await modelClient.createMany({
                            data: cleanBatch,
                            skipDuplicates: true,
                        });
                        recordsRestored += res.count;
                    }
                    catch (bulkErr) {
                        console.warn(`[RestoreEngine] Bulk insert failed for ${modelName}, retrying row-by-row:`, bulkErr.message);
                        // Row-by-row fallback with exact error tracking
                        for (const item of cleanBatch) {
                            try {
                                await modelClient.create({ data: item });
                                recordsRestored++;
                            }
                            catch (rowErr) {
                                recordsFailed++;
                                errorSummary[`${modelName}:${item.id || "unknown"}`] = rowErr.message;
                            }
                        }
                    }
                    recordsProcessed += batch.length;
                    // Update live progress in MongoDB
                    await prismadb_1.default.databaseRestoreJob.update({
                        where: { id: restoreJobId },
                        data: {
                            recordsProcessed,
                            recordsRestored,
                            recordsFailed,
                            progressPercent: totalRecords > 0 ? Math.min((recordsProcessed / totalRecords) * 100, 99) : 99,
                        },
                    });
                }
                collectionsDone++;
            }
            const durationMs = Date.now() - startTime;
            console.log(`✅ [RestoreEngine] Restore job ${restoreJobId} completed in ${durationMs}ms. Restored: ${recordsRestored}, Failed: ${recordsFailed}.`);
            // 7. Mark Job Completed & Increment Restore Count on Backup Record
            await prismadb_1.default.databaseRestoreJob.update({
                where: { id: restoreJobId },
                data: {
                    status: "COMPLETED",
                    progressPercent: 100,
                    completedAt: new Date(),
                    collectionsDone,
                    recordsProcessed,
                    recordsRestored,
                    recordsFailed,
                    errorSummary: Object.keys(errorSummary).length > 0 ? errorSummary : undefined,
                },
            });
            await prismadb_1.default.databaseBackup.update({
                where: { id: backupId },
                data: {
                    restoreCount: { increment: 1 },
                    lastRestoredAt: new Date(),
                },
            });
            return {
                restoreJobId,
                backupId,
                mode,
                success: recordsFailed === 0,
                recordsRestored,
                recordsFailed,
                recordsSkipped: 0,
                collectionsRestored: collectionsDone,
                durationMs,
                preRestoreBackupId,
                errors: errorSummary,
            };
        }
        catch (err) {
            console.error(`❌ [RestoreEngine] Restore job ${restoreJobId} failed:`, err);
            await prismadb_1.default.databaseRestoreJob.update({
                where: { id: restoreJobId },
                data: {
                    status: "FAILED",
                    completedAt: new Date(),
                    errorMessage: err.message,
                },
            });
            throw err;
        }
        finally {
            await (0, distributedLock_1.releaseDistributedLock)(restoreLock);
        }
    }
}
exports.RestoreEngine = RestoreEngine;
exports.restoreEngine = new RestoreEngine();
