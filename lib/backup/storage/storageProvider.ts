/**
 * lib/backup/storage/storageProvider.ts
 *
 * Pluggable Storage Abstraction for SalesmanPro Database Backups.
 * Supports AWS S3, Cloudflare R2, Wasabi, MinIO, and local filesystem fallback.
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable, PassThrough } from "stream";
import fs from "fs";
import path from "path";
import { BackupStorageMetadata } from "../types";

export interface BackupStorageProvider {
  name: string;
  upload(
    key: string,
    streamOrBuffer: Readable | Buffer,
    metadata?: Record<string, string>,
    contentType?: string
  ): Promise<{ key: string; sizeBytes: number; etag?: string }>;

  download(key: string): Promise<Readable>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;

  getMetadata(key: string): Promise<BackupStorageMetadata>;

  list(prefix: string): Promise<Array<{ key: string; sizeBytes: number; lastModified: Date }>>;

  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

/**
 * AWS S3 / S3-Compatible Cloud Storage Provider
 */
export class S3BackupStorageProvider implements BackupStorageProvider {
  public name = "s3";
  private client: S3Client;
  public bucket: string;

  constructor(options?: {
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    endpoint?: string;
  }) {
    const region =
      options?.region ||
      process.env.BACKUP_S3_REGION ||
      process.env.AWS_REGION ||
      process.env.AREGION ||
      "us-east-1";

    const accessKeyId =
      options?.accessKeyId ||
      process.env.BACKUP_S3_ACCESS_KEY ||
      process.env.AWS_ACCESS_KEY_ID ||
      process.env.AACCESS_KEY_ID ||
      "";

    const secretAccessKey =
      options?.secretAccessKey ||
      process.env.BACKUP_S3_SECRET_KEY ||
      process.env.AWS_SECRET_ACCESS_KEY ||
      process.env.ASECRET_ACCESS_KEY ||
      "";

    this.bucket =
      options?.bucket ||
      process.env.BACKUP_S3_BUCKET ||
      process.env.AWS_BUCKET_NAME ||
      process.env.AS3_BUCKET_NAME ||
      process.env.S3_BUCKET_NAME ||
      "salesmanpro-backups";

    const endpoint =
      options?.endpoint ||
      process.env.BACKUP_S3_ENDPOINT ||
      process.env.AWS_ENDPOINT ||
      undefined;

    this.client = new S3Client({
      region,
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
      endpoint,
      forcePathStyle: Boolean(endpoint),
    });
  }

  async upload(
    key: string,
    streamOrBuffer: Readable | Buffer,
    metadata: Record<string, string> = {},
    contentType: string = "application/octet-stream"
  ): Promise<{ key: string; sizeBytes: number; etag?: string }> {
    let bodyBuffer: Buffer;
    if (Buffer.isBuffer(streamOrBuffer)) {
      bodyBuffer = streamOrBuffer;
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of streamOrBuffer) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      bodyBuffer = Buffer.concat(chunks);
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: bodyBuffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    const response = await this.client.send(command);
    return {
      key,
      sizeBytes: bodyBuffer.length,
      etag: response.ETag?.replace(/"/g, ""),
    };
  }

  async download(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);
    if (!response.Body) {
      throw new Error(`S3 GetObject returned empty body for key: ${key}`);
    }

    return response.Body as Readable;
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
    } catch (err: any) {
      if (err.name === "AccessDenied" || err.$metadata?.httpStatusCode === 403) {
        console.warn(`[S3BackupStorageProvider] DeleteObject returned 403 AccessDenied for ${key}. Storage key retention pruning skipped.`);
        return;
      }
      throw err;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.getMetadata(key);
      return true;
    } catch (err: any) {
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      if (err.name === "AccessDenied" || err.$metadata?.httpStatusCode === 403) {
        console.warn(`[S3BackupStorageProvider] HeadObject returned 403 AccessDenied for ${key}. Assuming object exists under write-only IAM policy.`);
        return true;
      }
      throw err;
    }
  }

  async getMetadata(key: string): Promise<BackupStorageMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await this.client.send(command);
      return {
        sizeBytes: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        etag: response.ETag?.replace(/"/g, ""),
        contentType: response.ContentType,
        customMetadata: response.Metadata,
      };
    } catch (err: any) {
      if (err.name === "AccessDenied" || err.$metadata?.httpStatusCode === 403) {
        console.warn(`[S3BackupStorageProvider] HeadObject returned 403 AccessDenied for ${key}. Falling back to default metadata.`);
        return {
          sizeBytes: 0,
          lastModified: new Date(),
          etag: undefined,
          contentType: "application/octet-stream",
          customMetadata: {},
        };
      }
      throw err;
    }
  }

  async list(prefix: string): Promise<Array<{ key: string; sizeBytes: number; lastModified: Date }>> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
      });

      const response = await this.client.send(command);
      return (response.Contents || []).map((item) => ({
        key: item.Key || "",
        sizeBytes: item.Size || 0,
        lastModified: item.LastModified || new Date(),
      }));
    } catch (err: any) {
      if (err.name === "AccessDenied" || err.$metadata?.httpStatusCode === 403) {
        console.warn(`[S3BackupStorageProvider] ListObjectsV2 returned 403 AccessDenied for prefix: ${prefix}. Listing restricted.`);
        return [];
      }
      throw err;
    }
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }
}

/**
 * Local Filesystem Provider for offline development or emergency staging
 */
export class LocalBackupStorageProvider implements BackupStorageProvider {
  public name = "local";
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.join(process.cwd(), "storage", "backups");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private resolvePath(key: string): string {
    const safeKey = key.replace(/^[/\\]+/, "").replace(/\.\./g, "");
    return path.join(this.baseDir, safeKey);
  }

  async upload(
    key: string,
    streamOrBuffer: Readable | Buffer,
    metadata: Record<string, string> = {}
  ): Promise<{ key: string; sizeBytes: number; etag?: string }> {
    const fullPath = this.resolvePath(key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    let sizeBytes = 0;
    if (Buffer.isBuffer(streamOrBuffer)) {
      fs.writeFileSync(fullPath, streamOrBuffer);
      sizeBytes = streamOrBuffer.length;
    } else {
      const writeStream = fs.createWriteStream(fullPath);
      for await (const chunk of streamOrBuffer) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        sizeBytes += buf.length;
        writeStream.write(buf);
      }
      writeStream.end();
    }

    // Save sidecar metadata JSON
    fs.writeFileSync(`${fullPath}.meta.json`, JSON.stringify(metadata, null, 2));

    return { key, sizeBytes };
  }

  async download(key: string): Promise<Readable> {
    const fullPath = this.resolvePath(key);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${key}`);
    }
    return fs.createReadStream(fullPath);
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.resolvePath(key);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    if (fs.existsSync(`${fullPath}.meta.json`)) fs.unlinkSync(`${fullPath}.meta.json`);
  }

  async exists(key: string): Promise<boolean> {
    return fs.existsSync(this.resolvePath(key));
  }

  async getMetadata(key: string): Promise<BackupStorageMetadata> {
    const fullPath = this.resolvePath(key);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${key}`);
    }
    const stat = fs.statSync(fullPath);
    let customMetadata: Record<string, string> | undefined;
    if (fs.existsSync(`${fullPath}.meta.json`)) {
      try {
        customMetadata = JSON.parse(fs.readFileSync(`${fullPath}.meta.json`, "utf-8"));
      } catch {}
    }
    return {
      sizeBytes: stat.size,
      lastModified: stat.mtime,
      customMetadata,
    };
  }

  async list(prefix: string): Promise<Array<{ key: string; sizeBytes: number; lastModified: Date }>> {
    const results: Array<{ key: string; sizeBytes: number; lastModified: Date }> = [];
    const scan = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          scan(full);
        } else if (!file.endsWith(".meta.json")) {
          const relKey = path.relative(this.baseDir, full).replace(/\\/g, "/");
          if (!prefix || relKey.startsWith(prefix)) {
            results.push({ key: relKey, sizeBytes: stat.size, lastModified: stat.mtime });
          }
        }
      }
    };
    scan(this.baseDir);
    return results;
  }

  async getSignedDownloadUrl(key: string): Promise<string> {
    return `/api/admin/db/backups/download-local?key=${encodeURIComponent(key)}`;
  }
}

/**
 * Global Storage Provider Factory
 */
let cachedStorageProvider: BackupStorageProvider | null = null;

export function getBackupStorageProvider(): BackupStorageProvider {
  if (cachedStorageProvider) {
    return cachedStorageProvider;
  }

  const configuredProvider = process.env.BACKUP_STORAGE_PROVIDER?.toLowerCase() || "s3";

  // Check if S3 credentials or bucket exist
  const hasS3Config = Boolean(
    (process.env.BACKUP_S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || process.env.AACCESS_KEY_ID) &&
    (process.env.BACKUP_S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || process.env.ASECRET_ACCESS_KEY)
  );

  if (configuredProvider === "local" || (!hasS3Config && process.env.NODE_ENV !== "production")) {
    console.log("[StorageProvider] Using Local filesystem storage provider");
    cachedStorageProvider = new LocalBackupStorageProvider();
  } else {
    console.log("[StorageProvider] Using S3-compatible cloud storage provider");
    cachedStorageProvider = new S3BackupStorageProvider();
  }

  return cachedStorageProvider;
}

/**
 * Builds standard immutable S3 storage key based on backup type and date
 */
export function buildBackupStorageKey(backupId: string, backupType: string, date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const prefix = process.env.BACKUP_S3_PREFIX || "backups/production/mongodb";
  const typeLower = backupType.toLowerCase();

  return `${prefix}/${typeLower}/${year}/${month}/${day}/backup-${backupId}.dump.gz.enc`;
}
