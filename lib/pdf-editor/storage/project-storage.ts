/**
 * lib/pdf-editor/storage/project-storage.ts
 *
 * Persistent storage abstraction for PDF Editor projects and assets.
 * Compatible with existing SalesmanPro storage conventions (S3 or local storage fallback).
 */

import fs from "node:fs";
import path from "node:path";
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

export class PDFProjectStorage {
  private baseDir: string;

  constructor() {
    const configuredRoot = process.env.PDF_EDITOR_STORAGE_ROOT;
    if (process.env.NODE_ENV === "production" && !configuredRoot) {
      throw new Error(
        "PDF editor storage is not configured for production. Set PDF_EDITOR_STORAGE_ROOT to a shared writable filesystem.",
      );
    }
    this.baseDir = configuredRoot || path.join(process.cwd(), "storage", "pdf-editor");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getProjectDir(projectId: string): string {
    const dir = path.join(this.baseDir, projectId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  private async acquireProjectLock(projectId: string): Promise<() => void> {
    const lockPath = path.join(this.getProjectDir(projectId), "project.lock");
    for (;;) {
      try {
        const handle = fs.openSync(lockPath, "wx");
        fs.writeFileSync(handle, JSON.stringify({ pid: process.pid, hostname: require("node:os").hostname(), acquiredAt: Date.now() }));
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
          const ownerIsLocal = lock.hostname === require("node:os").hostname();
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
    return fs.readFileSync(filePath);
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

  async saveExportedPdf(projectId: string, pdfBytes: Uint8Array): Promise<string> {
    const dir = this.getProjectDir(projectId);
    const filePath = path.join(dir, "exported.pdf");
    fs.writeFileSync(filePath, pdfBytes);
    return filePath;
  }

  async getExportedPdf(projectId: string): Promise<Uint8Array | null> {
    const dir = this.getProjectDir(projectId);
    const filePath = path.join(dir, "exported.pdf");
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath);
  }
}

export const pdfProjectStorage = new PDFProjectStorage();
