"use strict";
/**
 * lib/pdf-editor/storage/project-storage.ts
 *
 * Persistent storage abstraction for PDF Editor projects and assets.
 * Compatible with existing SalesmanPro storage conventions (S3 or local storage fallback).
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfProjectStorage = exports.PDFProjectStorage = exports.PDFProjectConflictError = void 0;
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
class PDFProjectStorage {
    baseDir;
    faultInjector;
    constructor(options = {}) {
        this.faultInjector = options.faultInjector;
        const configuredRoot = process.env.PDF_EDITOR_STORAGE_ROOT;
        const isBuildPhase = process.env.NEXT_IS_BUILD_PHASE === "true";
        if (process.env.NODE_ENV === "production" && !configuredRoot && !isBuildPhase) {
            throw new Error("PDF editor storage is not configured for production. Set PDF_EDITOR_STORAGE_ROOT to a shared writable filesystem.");
        }
        if (configuredRoot && !node_path_1.default.isAbsolute(configuredRoot)) {
            throw new Error("PDF_EDITOR_STORAGE_ROOT must be an absolute path");
        }
        this.baseDir = options.baseDir || configuredRoot || node_path_1.default.join(process.cwd(), "storage", "pdf-editor");
        if (!node_fs_1.default.existsSync(this.baseDir)) {
            node_fs_1.default.mkdirSync(this.baseDir, { recursive: true });
        }
        try {
            node_fs_1.default.accessSync(this.baseDir, node_fs_1.default.constants.R_OK | node_fs_1.default.constants.W_OK);
        }
        catch {
            throw new Error("PDF_EDITOR_STORAGE_ROOT must be readable and writable");
        }
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
        const lockPath = node_path_1.default.join(this.getProjectDir(projectId), "project.lock");
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
                    // A lock written by an older version is only recoverable when its
                    // owner cannot be identified; never age out a potentially live lock.
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
            release();
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
            release();
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
