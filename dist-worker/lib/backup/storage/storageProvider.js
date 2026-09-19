"use strict";
/**
 * lib/backup/storage/storageProvider.ts
 *
 * Pluggable Storage Abstraction for SalesmanPro Database Backups.
 * Supports AWS S3, Cloudflare R2, Wasabi, MinIO, and local filesystem fallback.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBackupStorageKey = exports.getBackupStorageProvider = exports.LocalBackupStorageProvider = exports.S3BackupStorageProvider = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * AWS S3 / S3-Compatible Cloud Storage Provider
 */
class S3BackupStorageProvider {
    name = "s3";
    client;
    bucket;
    constructor(options) {
        const region = options?.region ||
            process.env.BACKUP_S3_REGION ||
            process.env.AWS_REGION ||
            process.env.AREGION ||
            "us-east-1";
        const accessKeyId = options?.accessKeyId ||
            process.env.BACKUP_S3_ACCESS_KEY ||
            process.env.AWS_ACCESS_KEY_ID ||
            process.env.AACCESS_KEY_ID ||
            "";
        const secretAccessKey = options?.secretAccessKey ||
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
        const endpoint = options?.endpoint ||
            process.env.BACKUP_S3_ENDPOINT ||
            process.env.AWS_ENDPOINT ||
            undefined;
        this.client = new client_s3_1.S3Client({
            region,
            credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
            endpoint,
            forcePathStyle: Boolean(endpoint),
        });
    }
    async upload(key, streamOrBuffer, metadata = {}, contentType = "application/octet-stream") {
        let bodyBuffer;
        if (Buffer.isBuffer(streamOrBuffer)) {
            bodyBuffer = streamOrBuffer;
        }
        else {
            const chunks = [];
            for await (const chunk of streamOrBuffer) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            bodyBuffer = Buffer.concat(chunks);
        }
        const command = new client_s3_1.PutObjectCommand({
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
    async download(key) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        const response = await this.client.send(command);
        if (!response.Body) {
            throw new Error(`S3 GetObject returned empty body for key: ${key}`);
        }
        return response.Body;
    }
    async delete(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.client.send(command);
        }
        catch (err) {
            if (err.name === "AccessDenied" || err.$metadata?.httpStatusCode === 403) {
                console.warn(`[S3BackupStorageProvider] DeleteObject returned 403 AccessDenied for ${key}. Storage key retention pruning skipped.`);
                return;
            }
            throw err;
        }
    }
    async exists(key) {
        try {
            await this.getMetadata(key);
            return true;
        }
        catch (err) {
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
    async getMetadata(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
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
        }
        catch (err) {
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
    async list(prefix) {
        try {
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix,
            });
            const response = await this.client.send(command);
            return (response.Contents || []).map((item) => ({
                key: item.Key || "",
                sizeBytes: item.Size || 0,
                lastModified: item.LastModified || new Date(),
            }));
        }
        catch (err) {
            if (err.name === "AccessDenied" || err.$metadata?.httpStatusCode === 403) {
                console.warn(`[S3BackupStorageProvider] ListObjectsV2 returned 403 AccessDenied for prefix: ${prefix}. Listing restricted.`);
                return [];
            }
            throw err;
        }
    }
    async getSignedDownloadUrl(key, expiresInSeconds = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: expiresInSeconds });
    }
}
exports.S3BackupStorageProvider = S3BackupStorageProvider;
/**
 * Local Filesystem Provider for offline development or emergency staging
 */
class LocalBackupStorageProvider {
    name = "local";
    baseDir;
    constructor(baseDir) {
        this.baseDir = baseDir || path_1.default.join(process.cwd(), "storage", "backups");
        if (!fs_1.default.existsSync(this.baseDir)) {
            fs_1.default.mkdirSync(this.baseDir, { recursive: true });
        }
    }
    resolvePath(key) {
        const safeKey = key.replace(/^[/\\]+/, "").replace(/\.\./g, "");
        return path_1.default.join(this.baseDir, safeKey);
    }
    async upload(key, streamOrBuffer, metadata = {}) {
        const fullPath = this.resolvePath(key);
        fs_1.default.mkdirSync(path_1.default.dirname(fullPath), { recursive: true });
        let sizeBytes = 0;
        if (Buffer.isBuffer(streamOrBuffer)) {
            fs_1.default.writeFileSync(fullPath, streamOrBuffer);
            sizeBytes = streamOrBuffer.length;
        }
        else {
            const writeStream = fs_1.default.createWriteStream(fullPath);
            for await (const chunk of streamOrBuffer) {
                const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                sizeBytes += buf.length;
                writeStream.write(buf);
            }
            writeStream.end();
        }
        // Save sidecar metadata JSON
        fs_1.default.writeFileSync(`${fullPath}.meta.json`, JSON.stringify(metadata, null, 2));
        return { key, sizeBytes };
    }
    async download(key) {
        const fullPath = this.resolvePath(key);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error(`File not found: ${key}`);
        }
        return fs_1.default.createReadStream(fullPath);
    }
    async delete(key) {
        const fullPath = this.resolvePath(key);
        if (fs_1.default.existsSync(fullPath))
            fs_1.default.unlinkSync(fullPath);
        if (fs_1.default.existsSync(`${fullPath}.meta.json`))
            fs_1.default.unlinkSync(`${fullPath}.meta.json`);
    }
    async exists(key) {
        return fs_1.default.existsSync(this.resolvePath(key));
    }
    async getMetadata(key) {
        const fullPath = this.resolvePath(key);
        if (!fs_1.default.existsSync(fullPath)) {
            throw new Error(`File not found: ${key}`);
        }
        const stat = fs_1.default.statSync(fullPath);
        let customMetadata;
        if (fs_1.default.existsSync(`${fullPath}.meta.json`)) {
            try {
                customMetadata = JSON.parse(fs_1.default.readFileSync(`${fullPath}.meta.json`, "utf-8"));
            }
            catch { }
        }
        return {
            sizeBytes: stat.size,
            lastModified: stat.mtime,
            customMetadata,
        };
    }
    async list(prefix) {
        const results = [];
        const scan = (dir) => {
            if (!fs_1.default.existsSync(dir))
                return;
            const files = fs_1.default.readdirSync(dir);
            for (const file of files) {
                const full = path_1.default.join(dir, file);
                const stat = fs_1.default.statSync(full);
                if (stat.isDirectory()) {
                    scan(full);
                }
                else if (!file.endsWith(".meta.json")) {
                    const relKey = path_1.default.relative(this.baseDir, full).replace(/\\/g, "/");
                    if (!prefix || relKey.startsWith(prefix)) {
                        results.push({ key: relKey, sizeBytes: stat.size, lastModified: stat.mtime });
                    }
                }
            }
        };
        scan(this.baseDir);
        return results;
    }
    async getSignedDownloadUrl(key) {
        return `/api/admin/db/backups/download-local?key=${encodeURIComponent(key)}`;
    }
}
exports.LocalBackupStorageProvider = LocalBackupStorageProvider;
/**
 * Global Storage Provider Factory
 */
let cachedStorageProvider = null;
function getBackupStorageProvider() {
    if (cachedStorageProvider) {
        return cachedStorageProvider;
    }
    const configuredProvider = process.env.BACKUP_STORAGE_PROVIDER?.toLowerCase() || "s3";
    // Check if S3 credentials or bucket exist
    const hasS3Config = Boolean((process.env.BACKUP_S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || process.env.AACCESS_KEY_ID) &&
        (process.env.BACKUP_S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || process.env.ASECRET_ACCESS_KEY));
    if (configuredProvider === "local" || (!hasS3Config && process.env.NODE_ENV !== "production")) {
        console.log("[StorageProvider] Using Local filesystem storage provider");
        cachedStorageProvider = new LocalBackupStorageProvider();
    }
    else {
        console.log("[StorageProvider] Using S3-compatible cloud storage provider");
        cachedStorageProvider = new S3BackupStorageProvider();
    }
    return cachedStorageProvider;
}
exports.getBackupStorageProvider = getBackupStorageProvider;
/**
 * Builds standard immutable S3 storage key based on backup type and date
 */
function buildBackupStorageKey(backupId, backupType, date = new Date()) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const prefix = process.env.BACKUP_S3_PREFIX || "backups/production/mongodb";
    const typeLower = backupType.toLowerCase();
    return `${prefix}/${typeLower}/${year}/${month}/${day}/backup-${backupId}.dump.gz.enc`;
}
exports.buildBackupStorageKey = buildBackupStorageKey;
