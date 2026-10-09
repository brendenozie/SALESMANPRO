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
exports.pdfProjectStorage = exports.PDFProjectStorage = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
class PDFProjectStorage {
    baseDir;
    constructor() {
        this.baseDir = node_path_1.default.join(process.cwd(), "storage", "pdf-editor");
        if (!node_fs_1.default.existsSync(this.baseDir)) {
            node_fs_1.default.mkdirSync(this.baseDir, { recursive: true });
        }
    }
    getProjectDir(projectId) {
        const dir = node_path_1.default.join(this.baseDir, projectId);
        if (!node_fs_1.default.existsSync(dir))
            node_fs_1.default.mkdirSync(dir, { recursive: true });
        return dir;
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
        return node_fs_1.default.readFileSync(filePath);
    }
    async saveProject(record) {
        const dir = this.getProjectDir(record.id);
        const metaPath = node_path_1.default.join(dir, "project.json");
        node_fs_1.default.writeFileSync(metaPath, JSON.stringify(record, null, 2), "utf-8");
    }
    async getProject(projectId) {
        const dir = this.getProjectDir(projectId);
        const metaPath = node_path_1.default.join(dir, "project.json");
        if (!node_fs_1.default.existsSync(metaPath))
            return null;
        try {
            const data = JSON.parse(node_fs_1.default.readFileSync(metaPath, "utf-8"));
            return data;
        }
        catch {
            return null;
        }
    }
    async saveExportedPdf(projectId, pdfBytes) {
        const dir = this.getProjectDir(projectId);
        const filePath = node_path_1.default.join(dir, "exported.pdf");
        node_fs_1.default.writeFileSync(filePath, pdfBytes);
        return filePath;
    }
    async getExportedPdf(projectId) {
        const dir = this.getProjectDir(projectId);
        const filePath = node_path_1.default.join(dir, "exported.pdf");
        if (!node_fs_1.default.existsSync(filePath))
            return null;
        return node_fs_1.default.readFileSync(filePath);
    }
}
exports.PDFProjectStorage = PDFProjectStorage;
exports.pdfProjectStorage = new PDFProjectStorage();
