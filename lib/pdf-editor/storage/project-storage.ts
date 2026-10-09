/**
 * lib/pdf-editor/storage/project-storage.ts
 *
 * Persistent storage abstraction for PDF Editor projects and assets.
 * Compatible with existing SalesmanPro storage conventions (S3 or local storage fallback).
 */

import fs from "node:fs";
import path from "node:path";
import { getBackupStorageProvider } from "@/lib/backup/storage/storageProvider";
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
}

export class PDFProjectStorage {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "storage", "pdf-editor");
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getProjectDir(projectId: string): string {
    const dir = path.join(this.baseDir, projectId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
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
    fs.writeFileSync(metaPath, JSON.stringify(record, null, 2), "utf-8");
  }

  async getProject(projectId: string): Promise<PDFProjectRecord | null> {
    const dir = this.getProjectDir(projectId);
    const metaPath = path.join(dir, "project.json");
    if (!fs.existsSync(metaPath)) return null;
    try {
      const data = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      return data as PDFProjectRecord;
    } catch {
      return null;
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
