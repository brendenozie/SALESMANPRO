/**
 * lib/pdf-editor/storage/project-storage.ts
 *
 * Persistent storage abstraction for PDF Editor projects and assets.
 * Compatible with existing SalesmanPro storage conventions (S3 or local storage fallback).
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import type { PDFDocumentModel } from "../model/types";
import type { EditorOperation } from "../model/operations";

export interface PDFProjectRecord {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  originalPdfKey: string;
  originalPdfSha256: string;
  currentDocument: PDFDocumentModel;
  operations: EditorOperation[];
  exportedPdfKey?: string;
  exportedPdfSha256?: string;
  exportedPdfRevision?: number;
  createdAt: string;
  updatedAt: string;
  revision: number;
}

export class PDFProjectConflictError extends Error {
  readonly currentProject: PDFProjectRecord;

  constructor(currentProject: PDFProjectRecord) {
    super(`Project revision conflict: current revision is ${currentProject.revision}`);
    this.name = "PDFProjectConflictError";
    this.currentProject = currentProject;
  }
}

export type PDFProjectStorageFaultPoint =
  | "after-export-temp-write"
  | "before-export-replace"
  | "during-export-replace"
  | "after-export-replace"
  | "before-project-persist"
  | "after-project-persist";

export interface PDFLockProvider {
  acquire(projectId: string, getProjectDir: (id: string) => string): Promise<() => Promise<void> | void>;
}

export class LocalFilePDFLockProvider implements PDFLockProvider {
  async acquire(projectId: string, getProjectDir: (id: string) => string): Promise<() => void> {
    const lockPath = path.join(getProjectDir(projectId), "project.lock");
    for (;;) {
      try {
        const handle = fs.openSync(lockPath, "wx");
        fs.writeFileSync(handle, JSON.stringify({ pid: process.pid, hostname: os.hostname(), acquiredAt: Date.now() }));
        fs.closeSync(handle);
        return () => {
          try {
            fs.unlinkSync(lockPath);
          } catch {
            // The committed project is already safe; a missing lock is harmless.
          }
        };
      } catch (error: any) {
        if (error?.code !== "EEXIST") throw error;
        try {
          const lock = JSON.parse(fs.readFileSync(lockPath, "utf8")) as { pid?: number; hostname?: string };
          const ownerIsLocal = lock.hostname === os.hostname();
          let ownerAlive = true;
          if (ownerIsLocal && lock.pid) {
            try {
              process.kill(lock.pid, 0);
            } catch (probeError: any) {
              if (probeError?.code === "ESRCH") ownerAlive = false;
              else if (probeError?.code !== "EPERM") throw probeError;
            }
          }
          if (ownerIsLocal && lock.pid && !ownerAlive) {
            fs.unlinkSync(lockPath);
            continue;
          }
        } catch (statError: any) {
          if (statError?.code === "ENOENT") continue;
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

export class RedisPDFLockProvider implements PDFLockProvider {
  private fallback = new LocalFilePDFLockProvider();

  async acquire(projectId: string, getProjectDir: (id: string) => string): Promise<() => Promise<void> | void> {
    try {
      const { isRedisAvailable, getRedisClient } = await import("@/lib/redis");
      if (isRedisAvailable()) {
        const redis = getRedisClient();
        const lockKey = `pdf:lock:${projectId}`;
        const token = `${os.hostname()}:${process.pid}:${crypto.randomBytes(8).toString("hex")}`;
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
              } catch (e) {
                console.warn("[RedisPDFLockProvider] Lock release error:", e);
              }
            };
          }
          await new Promise((resolve) => setTimeout(resolve, 15 + Math.random() * 20));
        }
      }
    } catch (err) {
      console.warn("[RedisPDFLockProvider] Redis lock error, falling back to local file lock:", err);
    }

    return this.fallback.acquire(projectId, getProjectDir);
  }
}

export interface PDFProjectStorageOptions {
  baseDir?: string;
  faultInjector?: (point: PDFProjectStorageFaultPoint) => void;
  lockProvider?: PDFLockProvider;
}

export class PDFProjectStorage {
  private baseDir: string;
  private faultInjector?: PDFProjectStorageOptions["faultInjector"];
  private lockProvider: PDFLockProvider;

  constructor(options: PDFProjectStorageOptions = {}) {
    this.faultInjector = options.faultInjector;
    this.lockProvider =
      options.lockProvider ||
      (options.baseDir ? new LocalFilePDFLockProvider() : new RedisPDFLockProvider());
    const configuredRoot = process.env.PDF_EDITOR_STORAGE_ROOT;
    const isBuildPhase = process.env.NEXT_IS_BUILD_PHASE === "true";
    if (process.env.NODE_ENV === "production" && !configuredRoot && !isBuildPhase) {
      console.warn(
        "[PDFProjectStorage] PDF_EDITOR_STORAGE_ROOT is not set; falling back to local/tmp storage.",
      );
    }
    if (configuredRoot && !path.isAbsolute(configuredRoot)) {
      console.warn("[PDFProjectStorage] PDF_EDITOR_STORAGE_ROOT is not an absolute path; using as relative.");
    }

    const candidateDirs = [
      options.baseDir,
      configuredRoot,
      path.join(process.cwd(), "storage", "pdf-editor"),
      path.join(os.tmpdir(), "salesman-pdf-storage"),
    ].filter(Boolean) as string[];

    let resolvedDir = "";
    for (const d of candidateDirs) {
      try {
        if (!fs.existsSync(d)) {
          fs.mkdirSync(d, { recursive: true });
        }
        fs.accessSync(d, fs.constants.R_OK | fs.constants.W_OK);
        resolvedDir = d;
        break;
      } catch {
        // try next candidate
      }
    }
    if (!resolvedDir) {
      resolvedDir = path.join(os.tmpdir(), "salesman-pdf-storage");
      try {
        fs.mkdirSync(resolvedDir, { recursive: true });
      } catch {}
    }
    this.baseDir = resolvedDir;
  }

  private getProjectDir(projectId: string): string {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(projectId)) {
      throw new Error("Invalid PDF project identifier");
    }
    const dir = path.join(this.baseDir, projectId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  private async acquireProjectLock(projectId: string): Promise<() => Promise<void> | void> {
    return this.lockProvider.acquire(projectId, (id) => this.getProjectDir(id));
  }

  async saveOriginalPdf(projectId: string, pdfBytes: Uint8Array): Promise<string> {
    const dir = this.getProjectDir(projectId);
    const filePath = path.join(dir, "original.pdf");
    fs.writeFileSync(filePath, pdfBytes);
    return filePath;
  }

  async getOriginalPdf(projectId: string): Promise<Uint8Array | null> {
    const dir = this.getProjectDir(projectId);
    const filePath = path.join(dir, "original.pdf");
    if (!fs.existsSync(filePath)) return null;
    return new Uint8Array(fs.readFileSync(filePath));
  }

  async saveProject(record: PDFProjectRecord): Promise<void> {
    const dir = this.getProjectDir(record.id);
    const metaPath = path.join(dir, "project.json");
    const tempPath = `${metaPath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(record, null, 2), "utf-8");
    fs.renameSync(tempPath, metaPath);
  }

  async getProject(projectId: string): Promise<PDFProjectRecord | null> {
    const dir = this.getProjectDir(projectId);
    const metaPath = path.join(dir, "project.json");
    if (!fs.existsSync(metaPath)) return null;
    try {
      const data = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      return { ...data, revision: Number.isInteger(data.revision) ? data.revision : 0 } as PDFProjectRecord;
    } catch {
      return null;
    }
  }

  async updateProject(
      projectId: string,
      expectedRevision: number,
      update: Pick<PDFProjectRecord, "currentDocument" | "operations" | "updatedAt" | "exportedPdfKey">,
    ): Promise<PDFProjectRecord> {
      const release = await this.acquireProjectLock(projectId);
      try {
        const current = await this.getProject(projectId);
        if (!current) throw new Error("PDF project not found");
        if (current.revision !== expectedRevision) {
          throw new PDFProjectConflictError(current);
        }

        const next: PDFProjectRecord = {
          ...current,
          ...update,
          revision: current.revision + 1,
        };
        await this.saveProject(next);
        return next;
      } finally {
        await release();
      }
    }

  async commitExport(
    projectId: string,
    expectedRevision: number,
    exportedPdf: Uint8Array,
    update: Pick<PDFProjectRecord, "currentDocument" | "operations" | "updatedAt">,
  ): Promise<PDFProjectRecord> {
    const release = await this.acquireProjectLock(projectId);
    try {
      const current = await this.getProject(projectId);
      if (!current) throw new Error("PDF project not found");
      if (current.revision !== expectedRevision) {
        throw new PDFProjectConflictError(current);
      }

      const dir = this.getProjectDir(projectId);
      const filePath = path.join(dir, "exported.pdf");
      const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
      const backupPath = `${filePath}.${process.pid}.${Date.now()}.bak`;
      const exportedPdfSha256 = crypto.createHash("sha256").update(exportedPdf).digest("hex");
      fs.writeFileSync(tempPath, exportedPdf);
      let replaced = false;
      let metadataPersisted = false;
      try {
        this.faultInjector?.("after-export-temp-write");
        this.faultInjector?.("before-export-replace");
        if (fs.existsSync(filePath)) fs.renameSync(filePath, backupPath);
        this.faultInjector?.("during-export-replace");
        fs.renameSync(tempPath, filePath);
        replaced = true;
        this.faultInjector?.("after-export-replace");

        const next: PDFProjectRecord = {
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
        if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
        return next;
      } catch (error) {
        if (metadataPersisted) {
          if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
        } else if (replaced) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          if (fs.existsSync(backupPath)) fs.renameSync(backupPath, filePath);
        } else {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          if (fs.existsSync(backupPath) && !fs.existsSync(filePath)) fs.renameSync(backupPath, filePath);
        }
        throw error;
      }
    } finally {
      await release();
    }
  }

  async getExportedPdf(projectId: string): Promise<Uint8Array | null> {
    const dir = this.getProjectDir(projectId);
    const filePath = path.join(dir, "exported.pdf");
    if (!fs.existsSync(filePath)) return null;
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const project = await this.getProject(projectId);
    if (
      project?.exportedPdfSha256 &&
      crypto.createHash("sha256").update(bytes).digest("hex") !== project.exportedPdfSha256
    ) {
      throw new Error("Exported PDF integrity check failed");
    }
    return bytes;
  }
}

export const pdfProjectStorage = new PDFProjectStorage();
