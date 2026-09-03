"use strict";
/**
 * lib/backup/engine/backupEngine.ts
 *
 * Core Database Backup Engine for SalesmanPro.
 * Extracts data from MongoDB via Prisma in bounded streams, sanitizes scalar fields,
 * constructs versioned manifest, compresses with Gzip, encrypts with AES-256-GCM,
 * computes SHA-256 checksums, and uploads to cloud storage.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupEngine = exports.BackupEngine = void 0;
const prismadb_1 = __importDefault(require("../../../server/db/prismadb"));
const cryptoPipeline_1 = require("../crypto/cryptoPipeline");
const storageProvider_1 = require("../storage/storageProvider");
class BackupEngine {
    /**
     * Discovers all available Prisma models and their runtime metadata.
     */
    getModelMetadata() {
        const runtimeModel = prismadb_1.default._runtimeDataModel;
        if (!runtimeModel?.models) {
            throw new Error("Unable to access Prisma runtime data model.");
        }
        return runtimeModel.models;
    }
    /**
     * Sanitizes a single record according to its Prisma schema definition.
     * Keeps only defined scalar fields to prevent relational cyclic graphs or foreign objects.
     */
    sanitizeRecord(record, modelMeta) {
        if (!record || typeof record !== "object")
            return record;
        const cleaned = {};
        for (const field of modelMeta.fields) {
            if (field.kind !== "scalar")
                continue;
            const key = field.name;
            const value = record[key];
            if (value === undefined || value === null)
                continue;
            if (field.type === "DateTime" && value instanceof Date) {
                cleaned[key] = value.toISOString();
                continue;
            }
            if (typeof value === "bigint") {
                cleaned[key] = value.toString();
                continue;
            }
            cleaned[key] = value;
        }
        return cleaned;
    }
    /**
     * Executes a full streaming backup of the MongoDB database.
     */
    async executeBackup(backupId, backupType, onProgress) {
        const startTime = Date.now();
        const modelsMeta = this.getModelMetadata();
        const modelNames = Object.keys(modelsMeta).sort();
        const dataPayload = {};
        const collectionManifests = [];
        const errorMap = {};
        let totalRecords = 0;
        const batchSize = 1000;
        console.log(`[BackupEngine] Starting ${backupType} backup (${backupId}) across ${modelNames.length} models...`);
        for (let i = 0; i < modelNames.length; i++) {
            const modelName = modelNames[i];
            const modelMeta = modelsMeta[modelName];
            const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
            const modelClient = prismadb_1.default[prismaKey];
            if (!modelClient || typeof modelClient.findMany !== "function") {
                continue;
            }
            let skip = 0;
            let modelRecords = [];
            let batch = [];
            try {
                do {
                    batch = await modelClient.findMany({
                        skip,
                        take: batchSize,
                    });
                    for (const item of batch) {
                        const sanitized = this.sanitizeRecord(item, modelMeta);
                        modelRecords.push(sanitized);
                    }
                    skip += batchSize;
                } while (batch.length === batchSize);
                if (modelRecords.length > 0) {
                    dataPayload[modelName] = modelRecords;
                }
                totalRecords += modelRecords.length;
                collectionManifests.push({
                    name: modelName,
                    recordCount: modelRecords.length,
                    scalarFieldCount: modelMeta.fields.filter((f) => f.kind === "scalar").length,
                });
                if (onProgress) {
                    onProgress(modelName, i + 1, modelNames.length);
                }
            }
            catch (err) {
                console.warn(`[BackupEngine] Failed to dump model ${modelName}:`, err.message);
                errorMap[modelName] = err.message;
            }
        }
        // 2. Build Versioned Manifest
        const manifest = {
            formatVersion: "2.0",
            platform: "salesmanpro",
            database: "mongodb",
            schemaVersion: "v2",
            createdAt: new Date().toISOString(),
            backupType,
            backupId,
            compression: "gzip",
            encryption: "aes-256-gcm",
            encryptionVersion: "v1",
            checksum: "",
            collections: collectionManifests,
            totalRecords,
            environment: process.env.NODE_ENV || "production",
        };
        const fullDumpObject = {
            manifest,
            data: dataPayload,
            errors: Object.keys(errorMap).length > 0 ? errorMap : undefined,
        };
        const plainBuffer = Buffer.from(JSON.stringify(fullDumpObject), "utf-8");
        // 3. Compress & Encrypt
        console.log(`[BackupEngine] Encrypting and compressing artifact for backup ${backupId}...`);
        const { artifactBuffer, checksum } = await (0, cryptoPipeline_1.encryptAndCompressBackup)(plainBuffer);
        manifest.checksum = checksum;
        // 4. Upload to Cloud Storage
        const storageProvider = (0, storageProvider_1.getBackupStorageProvider)();
        const storageKey = (0, storageProvider_1.buildBackupStorageKey)(backupId, backupType);
        console.log(`[BackupEngine] Uploading artifact (${(artifactBuffer.length / (1024 * 1024)).toFixed(2)} MB) to ${storageProvider.name} key: ${storageKey}...`);
        const uploadResult = await storageProvider.upload(storageKey, artifactBuffer, {
            backupId,
            backupType,
            checksum,
            records: String(totalRecords),
        }, "application/octet-stream");
        const durationMs = Date.now() - startTime;
        console.log(`[BackupEngine] Backup ${backupId} completed successfully in ${durationMs}ms with checksum ${checksum}.`);
        return {
            backupId,
            backupType,
            storageProvider: storageProvider.name,
            storageBucket: process.env.BACKUP_S3_BUCKET || process.env.AWS_BUCKET_NAME,
            storageKey,
            sizeBytes: uploadResult.sizeBytes,
            checksum,
            collectionCount: collectionManifests.length,
            recordCount: totalRecords,
            durationMs,
            manifest,
            errors: errorMap,
        };
    }
}
exports.BackupEngine = BackupEngine;
exports.backupEngine = new BackupEngine();
