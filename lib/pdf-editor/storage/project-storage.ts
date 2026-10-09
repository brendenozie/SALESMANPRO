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

export interface PDFProjectStorageOptions {
  baseDir?: string;
  faultInjector?: (point: PDFProjectStorageFaultPoint) => void;
}

export class PDFProjectStorage {
  private baseDir: string;
  private faultInjector?: PDFProjectStorageOptions["faultInjector"];

  constructor(options: PDFProjectStorageOptions = {}) {
    this.faultInjector = options.faultInjector;
    const configuredRoot = process.env.PDF_EDITOR_STORAGE_ROOT;
    const isBuildPhase = process.env.NEXT_IS_BUILD_PHASE === "true";
    if (process.env.NODE_ENV === "production" && !configuredRoot && !isBuildPhase) {
      throw new Error(
        "PDF editor storage is not configured for production. Set PDF_EDITOR_STORAGE_ROOT to a shared writable filesystem.",
      );
    }
    if (configuredRoot && !path.isAbsolute(configuredRoot)) {
      throw new Error("PDF_EDITOR_STORAGE_ROOT must be an absolute path");
    }
    this.baseDir = options.baseDir || configuredRoot || path.join(process.cwd(), "storage", "pdf-editor");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    try {
      fs.accessSync(this.baseDir, fs.constants.R_OK | fs.constants.W_OK);
    } catch {
      throw new Error("PDF_EDITOR_STORAGE_ROOT must be readable and writable");
    }
  }

  private getProjectDir(projectId: string): string {
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(projectId)) {
      throw new Error("Invalid PDF project identifier");
    }
    const dir = path.join(this.baseDir, projectId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  private async acquireProjectLock(projectId: string): Promise<() => void> {
    const lockPath = path.join(this.getProjectDir(projectId), "project.lock");
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
        release();
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
      release();
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
