/**
 * lib/backup/engine/backupEngine.ts
 *
 * Core Database Backup Engine for SalesmanPro.
 * Extracts data from MongoDB via Prisma in bounded streams, sanitizes scalar fields,
 * constructs versioned manifest, compresses with Gzip, encrypts with AES-256-GCM,
 * computes SHA-256 checksums, and uploads to cloud storage.
 */

import prisma from "../../../server/db/prismadb";
import {
  BackupType,
  BackupManifest,
  BackupCollectionManifestItem,
} from "../types";
import { encryptAndCompressBackup } from "../crypto/cryptoPipeline";
import {
  getBackupStorageProvider,
  buildBackupStorageKey,
} from "../storage/storageProvider";

export interface BackupExecutionResult {
  backupId: string;
  backupType: BackupType;
  storageProvider: string;
  storageBucket?: string;
  storageKey: string;
  sizeBytes: number;
  checksum: string;
  collectionCount: number;
  recordCount: number;
  durationMs: number;
  manifest: BackupManifest;
  errors: Record<string, string>;
}

export class BackupEngine {
  /**
   * Discovers all available Prisma models and their runtime metadata.
   */
  public getModelMetadata(): Record<string, any> {
    const runtimeModel = (prisma as any)._runtimeDataModel;
    if (!runtimeModel?.models) {
      throw new Error("Unable to access Prisma runtime data model.");
    }
    return runtimeModel.models;
  }

  /**
   * Sanitizes a single record according to its Prisma schema definition.
   * Keeps only defined scalar fields to prevent relational cyclic graphs or foreign objects.
   */
  public sanitizeRecord(record: any, modelMeta: any): any {
    if (!record || typeof record !== "object") return record;
    const cleaned: Record<string, any> = {};

    for (const field of modelMeta.fields) {
      if (field.kind !== "scalar") continue;

      const key = field.name;
      const value = record[key];

      if (value === undefined || value === null) continue;

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
  public async executeBackup(
    backupId: string,
    backupType: BackupType,
    onProgress?: (model: string, done: number, total: number) => void
  ): Promise<BackupExecutionResult> {
    const startTime = Date.now();
    const modelsMeta = this.getModelMetadata();
    const modelNames = Object.keys(modelsMeta).sort();

    const dataPayload: Record<string, any[]> = {};
    const collectionManifests: BackupCollectionManifestItem[] = [];
    const errorMap: Record<string, string> = {};

    let totalRecords = 0;
    const batchSize = 1000;

    console.log(
      `[BackupEngine] Starting ${backupType} backup (${backupId}) across ${modelNames.length} models...`
    );

    for (let i = 0; i < modelNames.length; i++) {
      const modelName = modelNames[i];
      const modelMeta = modelsMeta[modelName];
      const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
      const modelClient = (prisma as any)[prismaKey];

      if (!modelClient || typeof modelClient.findMany !== "function") {
        continue;
      }

      let skip = 0;
      let modelRecords: any[] = [];
      let batch: any[] = [];

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
          scalarFieldCount: modelMeta.fields.filter((f: any) => f.kind === "scalar").length,
        });

        if (onProgress) {
          onProgress(modelName, i + 1, modelNames.length);
        }
      } catch (err: any) {
        console.warn(`[BackupEngine] Failed to dump model ${modelName}:`, err.message);
        errorMap[modelName] = err.message;
      }
    }

    // 2. Build Versioned Manifest
    const manifest: BackupManifest = {
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
      checksum: "", // Will be populated with final artifact checksum
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
    const { artifactBuffer, checksum } = await encryptAndCompressBackup(plainBuffer);
    manifest.checksum = checksum;

    // 4. Upload to Cloud Storage
    const storageProvider = getBackupStorageProvider();
    const storageKey = buildBackupStorageKey(backupId, backupType);

    console.log(
      `[BackupEngine] Uploading artifact (${(artifactBuffer.length / (1024 * 1024)).toFixed(
        2
      )} MB) to ${storageProvider.name} key: ${storageKey}...`
    );

    const uploadResult = await storageProvider.upload(
      storageKey,
      artifactBuffer,
      {
        backupId,
        backupType,
        checksum,
        records: String(totalRecords),
      },
      "application/octet-stream"
    );

    const durationMs = Date.now() - startTime;
    console.log(
      `[BackupEngine] Backup ${backupId} completed successfully in ${durationMs}ms with checksum ${checksum}.`
    );

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

export const backupEngine = new BackupEngine();
