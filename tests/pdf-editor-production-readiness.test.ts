import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PDFDocument } from "pdf-lib";
import { PDFProjectStorage, PDFProjectConflictError, type PDFProjectRecord } from "../lib/pdf-editor/storage/project-storage";
import { resolveFontWithReport, embedFontInDoc } from "../lib/pdf-editor/engine/font-registry";
import { runPageOCR } from "../lib/pdf-editor/engine/ocr";
import { ownsPDFProject } from "../lib/pdf-editor/storage/access";

const projectId = `proj_${process.pid.toString(16).padStart(16, "0").slice(-16)}`;
const storage = new PDFProjectStorage();
const execFileAsync = promisify(execFile);
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

  const lockPath = path.join(process.cwd(), "storage", "pdf-editor", projectId, "project.lock");
  fs.writeFileSync(lockPath, JSON.stringify({ pid: 999999, hostname: require("node:os").hostname() }));
  const recovered = await storage.updateProject(projectId, 1, {
    currentDocument: { ...documentModel, id: "recovered-after-crash" },
    operations: [],
    updatedAt: now,
  });
  assert.equal(recovered.currentDocument.id, "recovered-after-crash");

  const release = await (storage as any).acquireProjectLock(projectId);
  const waiting = storage.updateProject(projectId, 2, {
    currentDocument: { ...documentModel, id: "live-lock-waiter" },
    operations: [],
    updatedAt: now,
  });
  let completed = false;
  void waiting.then(() => { completed = true; });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(completed, false);
  release();
  assert.equal((await waiting).currentDocument.id, "live-lock-waiter");

  fs.rmSync(path.join(process.cwd(), "storage", "pdf-editor", projectId), { recursive: true, force: true });
}

async function testExportCrashConsistency() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-editor-export-"));
  const exportProjectId = "proj_1111111111111111";
  const now = new Date().toISOString();
  const seed = async (storage: PDFProjectStorage) => storage.saveProject({
    id: exportProjectId,
    userId: "user-a",
    companyId: "company-a",
    name: "export",
    originalPdfKey: "original.pdf",
    originalPdfSha256: "sha",
    currentDocument: documentModel,
    operations: [],
    createdAt: now,
    updatedAt: now,
    revision: 0,
  });
  const oldBytes = new Uint8Array(Buffer.from("old-export"));
  const newBytes = new Uint8Array(Buffer.from("new-export"));
  for (const point of [
    "after-export-temp-write",
    "before-export-replace",
    "during-export-replace",
    "after-export-replace",
    "before-project-persist",
  ] as const) {
    fs.rmSync(path.join(root, exportProjectId), { recursive: true, force: true });
    const storage = new PDFProjectStorage({ baseDir: root });
    await seed(storage);
    await storage.commitExport(exportProjectId, 0, oldBytes, {
      currentDocument: documentModel,
      operations: [],
      updatedAt: now,
    });
    const faulting = new PDFProjectStorage({ baseDir: root, faultInjector: (actual) => {
      if (actual === point) throw new Error(`Injected ${point}`);
    }});
    await assert.rejects(() => faulting.commitExport(exportProjectId, 1, newBytes, {
      currentDocument: { ...documentModel, id: "new-export" },
      operations: [],
      updatedAt: now,
    }), new RegExp(`Injected ${point}`));
    const project = await storage.getProject(exportProjectId);
    assert.equal(project?.revision, 1);
    assert.equal(project?.exportedPdfRevision, 1);
    assert.deepEqual(await storage.getExportedPdf(exportProjectId), oldBytes);
  }

  fs.rmSync(path.join(root, exportProjectId), { recursive: true, force: true });
  const committedStorage = new PDFProjectStorage({ baseDir: root, faultInjector: (point) => {
    if (point === "after-project-persist") throw new Error("Injected after-project-persist");
  }});
  await seed(committedStorage);
  await assert.rejects(() => committedStorage.commitExport(exportProjectId, 0, newBytes, {
    currentDocument: { ...documentModel, id: "committed-before-response" },
    operations: [],
    updatedAt: now,
  }));
  const committed = await committedStorage.getProject(exportProjectId);
  assert.equal(committed?.revision, 1);
  assert.deepEqual(await committedStorage.getExportedPdf(exportProjectId), newBytes);
  fs.rmSync(root, { recursive: true, force: true });
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

  const previousTimeout = process.env.PDF_EDITOR_OCR_TIMEOUT_MS;
  process.env.PDF_EDITOR_OCR_TIMEOUT_MS = "20";
  let terminated = false;
  const timeout = await runPageOCR("test-image", "page_test", 595, 842, async () => ({
    recognize: () => new Promise(() => undefined),
    terminate: async () => { terminated = true; },
  }));
  assert.equal(timeout.success, false);
  assert.equal(timeout.error?.code, "OCR_TIMEOUT");
  assert.equal(terminated, true);
  if (previousTimeout === undefined) delete process.env.PDF_EDITOR_OCR_TIMEOUT_MS;
  else process.env.PDF_EDITOR_OCR_TIMEOUT_MS = previousTimeout;
}

async function testIndependentProcesses() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-editor-process-"));
  const processProjectId = "proj_0123456789abcdef";
  const processStorage = new PDFProjectStorage({ baseDir: root });
  const now = new Date().toISOString();
  await processStorage.saveProject({
    id: processProjectId,
    userId: "user-a",
    companyId: "company-a",
    name: "process-race",
    originalPdfKey: "original.pdf",
    originalPdfSha256: "sha",
    currentDocument: documentModel,
    operations: [],
    createdAt: now,
    updatedAt: now,
    revision: 0,
  });
  const worker = path.join(process.cwd(), "tests", "pdf-editor-storage-writer.ts");
  const tsNode = path.join(process.cwd(), "node_modules", "ts-node", "dist", "bin.js");
  const env = { ...process.env, PDF_EDITOR_STORAGE_ROOT: root };
  const run = (id: string, delay: string) => execFileAsync(process.execPath, [
    tsNode, "-r", "./scripts/register-paths.js", "--project", "tsconfig.worker.json",
    worker, processProjectId, "0", id, delay,
  ], { cwd: process.cwd(), env });

  const newerProcess = run("process-newer", "0");
  await new Promise((resolve) => setTimeout(resolve, 100));
  const olderProcess = run("process-older", "0");
  const [first, second] = await Promise.allSettled([newerProcess, olderProcess]);
  const output = [first, second].map((result) =>
    result.status === "fulfilled" ? result.value.stdout : `${result.reason.stdout || ""}${result.reason.stderr || ""}`,
  ).join("\n");
  assert.match(output, /COMMITTED:process-newer/);
  assert.match(output, /FAILED:PDFProjectConflictError/);
  const persisted = await new PDFProjectStorage({ baseDir: root }).getProject(processProjectId);
  assert.equal(persisted?.currentDocument.id, "process-newer");
  fs.rmSync(root, { recursive: true, force: true });
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

Promise.all([testRevisionRace(), testExportCrashConsistency(), testFontsAndGlyphs(), testOCRFailures(), testIndependentProcesses()])
  .then(testTenantOwnership)
  .then(() => {
    console.log("Production readiness tests passed: revision race, fonts, glyphs, independent processes, and OCR failure contract.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
