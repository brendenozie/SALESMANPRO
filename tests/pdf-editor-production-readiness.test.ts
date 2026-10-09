import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { PDFProjectStorage, PDFProjectConflictError, type PDFProjectRecord } from "../lib/pdf-editor/storage/project-storage";
import { resolveFontWithReport, embedFontInDoc } from "../lib/pdf-editor/engine/font-registry";
import { runPageOCR } from "../lib/pdf-editor/engine/ocr";
import { ownsPDFProject } from "../lib/pdf-editor/storage/access";

const projectId = `race_test_${process.pid}`;
const storage = new PDFProjectStorage();
const documentModel = {
  id: "doc_test",
  analysisVersion: 1,
  pages: [],
  fonts: {},
  metadata: {},
  assets: {},
  report: { unidentified: [], warnings: [], formXObjects: 0, annotations: 0, hasAcroForm: false, encrypted: false },
} as PDFProjectRecord["currentDocument"];

async function testRevisionRace() {
  const now = new Date().toISOString();
  const initial: PDFProjectRecord = {
    id: projectId,
    userId: "user-a",
    companyId: "company-a",
    name: "race",
    originalPdfKey: "original.pdf",
    originalPdfSha256: "sha",
    currentDocument: documentModel,
    operations: [],
    createdAt: now,
    updatedAt: now,
    revision: 0,
  };
  await storage.saveProject(initial);

  const older = new Promise((resolve) => setTimeout(
    () => resolve(storage.updateProject(projectId, 0, {
      currentDocument: { ...documentModel, id: "older" },
      operations: [],
      updatedAt: now,
    })),
    25,
  )).then((result) => result).catch((error) => error);
  const newer = await storage.updateProject(projectId, 0, {
    currentDocument: { ...documentModel, id: "newer" },
    operations: [],
    updatedAt: now,
  }).catch((error) => error);

  const olderResult = await older.catch((error) => error);
  assert.ok(olderResult instanceof PDFProjectConflictError);
  const saved = await storage.getProject(projectId);
  assert.equal(saved?.currentDocument.id, "newer");
  assert.equal(saved?.revision, 1);

  fs.rmSync(path.join(process.cwd(), "storage", "pdf-editor", projectId), { recursive: true, force: true });
}

async function testFontsAndGlyphs() {
  const times = resolveFontWithReport("Times", "bold", "italic");
  assert.equal(times.resolved.postScriptName, "Times-BoldItalic");
  assert.equal(times.embedded, true);
  assert.equal(times.fallbackReason, undefined);

  const missing = resolveFontWithReport("NotARealFont", "normal", "normal");
  assert.equal(missing.resolved.family, "Helvetica");
  assert.ok(missing.fallbackReason);

  const pdf = await PDFDocument.create();
  const font = await embedFontInDoc(pdf, times.resolved);
  const page = pdf.addPage();
  page.drawText("Glyph coverage: ÄÉß €", { font, size: 18, x: 20, y: 700 });
  const bytes = await pdf.save();
  assert.ok(bytes.length > 0);
  assert.equal((await PDFDocument.load(bytes)).getPageCount(), 1);
}

async function testOCRFailures() {
  const missing = await runPageOCR("", "page_test", 595, 842);
  assert.equal(missing.success, false);
  assert.equal(missing.error?.code, "OCR_INPUT_MISSING");
}

function testTenantOwnership() {
  const project = {
    id: "project",
    userId: "user-a",
    companyId: "company-a",
  } as PDFProjectRecord;
  assert.equal(ownsPDFProject(project, { userId: "user-a", companyId: "company-a" }), true);
  assert.equal(ownsPDFProject(project, { userId: "user-b", companyId: "company-a" }), false);
  assert.equal(ownsPDFProject(project, { userId: "user-a", companyId: "company-b" }), false);
}

Promise.all([testRevisionRace(), testFontsAndGlyphs(), testOCRFailures()])
  .then(testTenantOwnership)
  .then(() => console.log("Production readiness tests passed: revision race, fonts, glyphs, and OCR failure contract."))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
