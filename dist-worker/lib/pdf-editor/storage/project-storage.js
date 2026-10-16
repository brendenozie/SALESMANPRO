"use strict";
/**
 * lib/pdf-editor/storage/project-storage.ts
 *
 * Persistent storage abstraction for PDF Editor projects and assets.
 * Compatible with existing SalesmanPro storage conventions (S3 or local storage fallback).
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfProjectStorage = exports.PDFProjectStorage = exports.RedisPDFLockProvider = exports.LocalFilePDFLockProvider = exports.PDFProjectConflictError = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_crypto_1 = __importDefault(require("node:crypto"));
class PDFProjectConflictError extends Error {
    currentProject;
    constructor(currentProject) {
        super(`Project revision conflict: current revision is ${currentProject.revision}`);
        this.name = "PDFProjectConflictError";
        this.currentProject = currentProject;
    }
}
exports.PDFProjectConflictError = PDFProjectConflictError;
class LocalFilePDFLockProvider {
    async acquire(projectId, getProjectDir) {
        const lockPath = node_path_1.default.join(getProjectDir(projectId), "project.lock");
        for (;;) {
            try {
                const handle = node_fs_1.default.openSync(lockPath, "wx");
                node_fs_1.default.writeFileSync(handle, JSON.stringify({ pid: process.pid, hostname: node_os_1.default.hostname(), acquiredAt: Date.now() }));
                node_fs_1.default.closeSync(handle);
                return () => {
                    try {
                        node_fs_1.default.unlinkSync(lockPath);
                    }
                    catch {
                        // The committed project is already safe; a missing lock is harmless.
                    }
                };
            }
            catch (error) {
                if (error?.code !== "EEXIST")
                    throw error;
                try {
                    const lock = JSON.parse(node_fs_1.default.readFileSync(lockPath, "utf8"));
                    const ownerIsLocal = lock.hostname === node_os_1.default.hostname();
                    let ownerAlive = true;
                    if (ownerIsLocal && lock.pid) {
                        try {
                            process.kill(lock.pid, 0);
                        }
                        catch (probeError) {
                            if (probeError?.code === "ESRCH")
                                ownerAlive = false;
                            else if (probeError?.code !== "EPERM")
                                throw probeError;
                        }
                    }
                    if (ownerIsLocal && lock.pid && !ownerAlive) {
                        node_fs_1.default.unlinkSync(lockPath);
                        continue;
                    }
                }
                catch (statError) {
                    if (statError?.code === "ENOENT")
                        continue;
                    if (statError instanceof SyntaxError) {
                        await new Promise((resolve) => setTimeout(resolve, 5));
                        continue;
                    }
                    throw statError;
                }
                await new Promise((resolve) => setTimeout(resolve, 5));
            }
        }
    }
}
exports.LocalFilePDFLockProvider = LocalFilePDFLockProvider;
class RedisPDFLockProvider {
    fallback = new LocalFilePDFLockProvider();
    async acquire(projectId, getProjectDir) {
        try {
            const { isRedisAvailable, getRedisClient } = await Promise.resolve().then(() => __importStar(require("@/lib/redis")));
            if (isRedisAvailable()) {
                const redis = getRedisClient();
                const lockKey = `pdf:lock:${projectId}`;
                const token = `${node_os_1.default.hostname()}:${process.pid}:${node_crypto_1.default.randomBytes(8).toString("hex")}`;
                const ttlMs = 15000;
                const start = Date.now();
                const timeoutMs = 8000;
                while (Date.now() - start < timeoutMs) {
                    const result = await redis.set(lockKey, token, "PX", ttlMs, "NX");
                    if (result === "OK") {
                        return async () => {
                            try {
                                const script = `
                  if redis.call("get", KEYS[1]) == ARGV[1] then
                    return redis.call("del", KEYS[1])
                  else
                    return 0
                  end
                `;
                                await redis.eval(script, 1, lockKey, token);
                            }
                            catch (e) {
                                console.warn("[RedisPDFLockProvider] Lock release error:", e);
                            }
                        };
                    }
                    await new Promise((resolve) => setTimeout(resolve, 15 + Math.random() * 20));
                }
            }
        }
        catch (err) {
            console.warn("[RedisPDFLockProvider] Redis lock error, falling back to local file lock:", err);
        }
        return this.fallback.acquire(projectId, getProjectDir);
    }
}
exports.RedisPDFLockProvider = RedisPDFLockProvider;
class PDFProjectStorage {
    baseDir;
    faultInjector;
    lockProvider;
    constructor(options = {}) {
        this.faultInjector = options.faultInjector;
        this.lockProvider =
            options.lockProvider ||
                (options.baseDir ? new LocalFilePDFLockProvider() : new RedisPDFLockProvider());
        const configuredRoot = process.env.PDF_EDITOR_STORAGE_ROOT;
        const isBuildPhase = process.env.NEXT_IS_BUILD_PHASE === "true";
        if (process.env.NODE_ENV === "production" && !configuredRoot && !isBuildPhase) {
            console.warn("[PDFProjectStorage] PDF_EDITOR_STORAGE_ROOT is not set; falling back to local/tmp storage.");
        }
        if (configuredRoot && !node_path_1.default.isAbsolute(configuredRoot)) {
            console.warn("[PDFProjectStorage] PDF_EDITOR_STORAGE_ROOT is not an absolute path; using as relative.");
        }
        const candidateDirs = [
            options.baseDir,
            configuredRoot,
            node_path_1.default.join(process.cwd(), "storage", "pdf-editor"),
            node_path_1.default.join(node_os_1.default.tmpdir(), "salesman-pdf-storage"),
        ].filter(Boolean);
        let resolvedDir = "";
        for (const d of candidateDirs) {
            try {
                if (!node_fs_1.default.existsSync(d)) {
                    node_fs_1.default.mkdirSync(d, { recursive: true });
                }
                node_fs_1.default.accessSync(d, node_fs_1.default.constants.R_OK | node_fs_1.default.constants.W_OK);
                resolvedDir = d;
                break;
            }
            catch {
                // try next candidate
            }
        }
        if (!resolvedDir) {
            resolvedDir = node_path_1.default.join(node_os_1.default.tmpdir(), "salesman-pdf-storage");
            try {
                node_fs_1.default.mkdirSync(resolvedDir, { recursive: true });
            }
            catch { }
        }
        this.baseDir = resolvedDir;
    }
    getProjectDir(projectId) {
        if (!/^[A-Za-z0-9_-]{1,128}$/.test(projectId)) {
            throw new Error("Invalid PDF project identifier");
        }
        const dir = node_path_1.default.join(this.baseDir, projectId);
        if (!node_fs_1.default.existsSync(dir))
            node_fs_1.default.mkdirSync(dir, { recursive: true });
        return dir;
    }
    async acquireProjectLock(projectId) {
        return this.lockProvider.acquire(projectId, (id) => this.getProjectDir(id));
    }
    async saveOriginalPdf(projectId, pdfBytes) {
        const dir = this.getProjectDir(projectId);
        const filePath = node_path_1.default.join(dir, "original.pdf");
        node_fs_1.default.writeFileSync(filePath, pdfBytes);
        return filePath;
    }
    async getOriginalPdf(projectId) {
        const dir = this.getProjectDir(projectId);
        const filePath = node_path_1.default.join(dir, "original.pdf");
        if (!node_fs_1.default.existsSync(filePath))
            return null;
        return new Uint8Array(node_fs_1.default.readFileSync(filePath));
    }
    async saveProject(record) {
        const dir = this.getProjectDir(record.id);
        const metaPath = node_path_1.default.join(dir, "project.json");
        const tempPath = `${metaPath}.${process.pid}.${Date.now()}.tmp`;
        node_fs_1.default.writeFileSync(tempPath, JSON.stringify(record, null, 2), "utf-8");
        node_fs_1.default.renameSync(tempPath, metaPath);
    }
    async getProject(projectId) {
        const dir = this.getProjectDir(projectId);
        const metaPath = node_path_1.default.join(dir, "project.json");
        if (!node_fs_1.default.existsSync(metaPath))
            return null;
        try {
            const data = JSON.parse(node_fs_1.default.readFileSync(metaPath, "utf-8"));
            return { ...data, revision: Number.isInteger(data.revision) ? data.revision : 0 };
        }
        catch {
            return null;
        }
    }
    async updateProject(projectId, expectedRevision, update) {
        const release = await this.acquireProjectLock(projectId);
        try {
            const current = await this.getProject(projectId);
            if (!current)
                throw new Error("PDF project not found");
            if (current.revision !== expectedRevision) {
                throw new PDFProjectConflictError(current);
            }
            const next = {
                ...current,
                ...update,
                revision: current.revision + 1,
            };
            await this.saveProject(next);
            return next;
        }
        finally {
            await release();
        }
    }
    async commitExport(projectId, expectedRevision, exportedPdf, update) {
        const release = await this.acquireProjectLock(projectId);
        try {
            const current = await this.getProject(projectId);
            if (!current)
                throw new Error("PDF project not found");
            if (current.revision !== expectedRevision) {
                throw new PDFProjectConflictError(current);
            }
            const dir = this.getProjectDir(projectId);
            const filePath = node_path_1.default.join(dir, "exported.pdf");
            const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
            const backupPath = `${filePath}.${process.pid}.${Date.now()}.bak`;
            const exportedPdfSha256 = node_crypto_1.default.createHash("sha256").update(exportedPdf).digest("hex");
            node_fs_1.default.writeFileSync(tempPath, exportedPdf);
            let replaced = false;
            let metadataPersisted = false;
            try {
                this.faultInjector?.("after-export-temp-write");
                this.faultInjector?.("before-export-replace");
                if (node_fs_1.default.existsSync(filePath))
                    node_fs_1.default.renameSync(filePath, backupPath);
                this.faultInjector?.("during-export-replace");
                node_fs_1.default.renameSync(tempPath, filePath);
                replaced = true;
                this.faultInjector?.("after-export-replace");
                const next = {
                    ...current,
                    ...update,
                    exportedPdfKey: filePath,
                    exportedPdfSha256,
                    exportedPdfRevision: current.revision + 1,
                    revision: current.revision + 1,
                };
                this.faultInjector?.("before-project-persist");
                await this.saveProject(next);
                metadataPersisted = true;
                this.faultInjector?.("after-project-persist");
                if (node_fs_1.default.existsSync(backupPath))
                    node_fs_1.default.unlinkSync(backupPath);
                return next;
            }
            catch (error) {
                if (metadataPersisted) {
                    if (node_fs_1.default.existsSync(backupPath))
                        node_fs_1.default.unlinkSync(backupPath);
                }
                else if (replaced) {
                    if (node_fs_1.default.existsSync(filePath))
                        node_fs_1.default.unlinkSync(filePath);
                    if (node_fs_1.default.existsSync(backupPath))
                        node_fs_1.default.renameSync(backupPath, filePath);
                }
                else {
                    if (node_fs_1.default.existsSync(tempPath))
                        node_fs_1.default.unlinkSync(tempPath);
                    if (node_fs_1.default.existsSync(backupPath) && !node_fs_1.default.existsSync(filePath))
                        node_fs_1.default.renameSync(backupPath, filePath);
                }
                throw error;
            }
        }
        finally {
            await release();
        }
    }
    async getExportedPdf(projectId) {
        const dir = this.getProjectDir(projectId);
        const filePath = node_path_1.default.join(dir, "exported.pdf");
        if (!node_fs_1.default.existsSync(filePath))
            return null;
        const bytes = new Uint8Array(node_fs_1.default.readFileSync(filePath));
        const project = await this.getProject(projectId);
        if (project?.exportedPdfSha256 &&
            node_crypto_1.default.createHash("sha256").update(bytes).digest("hex") !== project.exportedPdfSha256) {
            throw new Error("Exported PDF integrity check failed");
        }
        return bytes;
    }
}
exports.PDFProjectStorage = PDFProjectStorage;
exports.pdfProjectStorage = new PDFProjectStorage();
