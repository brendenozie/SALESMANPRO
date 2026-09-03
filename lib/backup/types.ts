/**
 * lib/backup/types.ts
 *
 * Core domain types and contracts for the SalesmanPro Automated Backup,
 * Cloud Archive, and Disaster Recovery Subsystem.
 */

export type BackupType =
  | "HOURLY"
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "MANUAL"
  | "PRE_DEPLOYMENT"
  | "PRE_RESTORE"
  | "DISASTER_RECOVERY";

export type BackupStatus =
  | "QUEUED"
  | "RUNNING"
  | "UPLOADING"
  | "UPLOADED"
  | "VERIFYING"
  | "VERIFIED"
  | "COMPLETED"
  | "FAILED"
  | "CORRUPTED"
  | "EXPIRED";

export type RestoreMode =
  | "PREVIEW"
  | "VALIDATE_ONLY"
  | "RESTORE_TO_NEW_DATABASE"
  | "RESTORE_TO_PRODUCTION";

export type RestoreStatus =
  | "QUEUED"
  | "RUNNING"
  | "PRE_BACKUP"
  | "RESTORING"
  | "VERIFYING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface BackupCollectionManifestItem {
  name: string;
  recordCount: number;
  scalarFieldCount: number;
  byteSizeEstimate?: number;
}

export interface BackupManifest {
  formatVersion: string; // e.g. "2.0"
  platform: string;      // "salesmanpro"
  database: string;      // "mongodb"
  schemaVersion: string; // e.g. "v2"
  createdAt: string;     // ISO timestamp
  backupType: BackupType;
  backupId: string;
  compression: "gzip" | "none";
  encryption: "aes-256-gcm" | "none";
  encryptionVersion: string;
  checksum: string;      // SHA-256 of final artifact
  collections: BackupCollectionManifestItem[];
  totalRecords: number;
  environment: string;
}

export interface BackupJobData {
  backupId: string;
  backupType: BackupType;
  triggeredBy?: string;
  forceManual?: boolean;
}

export interface RestoreJobData {
  restoreJobId: string;
  backupId: string;
  mode: RestoreMode;
  requestedBy: string;
  targetDatabaseUrl?: string; // Optional for RESTORE_TO_NEW_DATABASE
}

export interface MaintenanceJobData {
  action: "RETENTION_PRUNING" | "RECONCILIATION" | "RESTORE_TEST";
  backupId?: string;
}

export interface BackupHealthSummary {
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  lastSuccessfulBackup: {
    id: string;
    type: string;
    createdAt: string;
    sizeBytes: number;
    ageMinutes: number;
  } | null;
  lastVerifiedBackup: {
    id: string;
    type: string;
    verifiedAt: string;
    checksum: string;
    ageMinutes: number;
  } | null;
  lastRestoreTest: {
    backupId: string;
    testedAt: string;
    status: "PASSED" | "FAILED" | "UNTESTED";
  } | null;
  nextScheduledBackup: {
    type: string;
    scheduledTime: string;
  } | null;
  rpoTargetMinutes: number;
  rtoTargetMinutes: number;
  recentFailuresCount: number;
  totalBackupsCount: number;
  totalStorageBytes: number;
  activeLocks: string[];
  message: string;
}

export interface BackupStorageMetadata {
  sizeBytes: number;
  lastModified: Date;
  etag?: string;
  contentType?: string;
  customMetadata?: Record<string, string>;
}
