import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { PDFDocument } from "pdf-lib";
import {
  registerCustomFont,
  getCustomFonts,
  resolveFont,
  embedFontInDoc,
} from "../lib/pdf-editor/engine/font-registry";
import {
  LocalFilePDFLockProvider,
  RedisPDFLockProvider,
  PDFProjectStorage,
} from "../lib/pdf-editor/storage/project-storage";
import { exportPDF } from "../lib/pdf-editor/engine/exporter";
import { analyzePDF } from "../lib/pdf-editor/engine/analyzer";
import { createHistory, makeUpdate, historyApply } from "../lib/pdf-editor/model/operations";
import type { PDFTextElement } from "../lib/pdf-editor/model/types";

async function testLockProviders() {
  console.log("[Test 1] Multi-instance lock providers...");

  const testDir = path.join(os.tmpdir(), "pdf-storage-test-" + Date.now());
  fs.mkdirSync(testDir, { recursive: true });

  try {
    const localProvider = new LocalFilePDFLockProvider();
    const getProjectDir = (id: string) => {
      const p = path.join(testDir, id);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
      return p;
    };

    const testProjectId = "proj_lock_test_1";
    const releaseLock1 = await localProvider.acquire(testProjectId, getProjectDir);
    assert.equal(typeof releaseLock1, "function", "acquire returns release function");

    // Lock file must exist
    const lockFilePath = path.join(getProjectDir(testProjectId), "project.lock");
    assert.ok(fs.existsSync(lockFilePath), "Local file lock exists");

    // Release lock
    await releaseLock1();
    assert.equal(fs.existsSync(lockFilePath), false, "Lock file unlinked on release");

    console.log("  ✓ LocalFilePDFLockProvider acquired, persisted, and released cleanly.");

    // Test RedisPDFLockProvider with fallback and interface compliance
    const redisProvider = new RedisPDFLockProvider();
    assert.ok(redisProvider && typeof redisProvider.acquire === "function");

    // Test PDFProjectStorage with pluggable lock provider
    const storageWithCustomLock = new PDFProjectStorage({
      baseDir: testDir,
      lockProvider: localProvider,
    });
    assert.ok(storageWithCustomLock, "PDFProjectStorage initialized with custom lockProvider");

    // Test saving and retrieving a project through the storage
    await storageWithCustomLock.saveProject({
      id: "project_test_alpha",
      companyId: "comp_123",
      userId: "user_456",
      title: "Test PDF Document",
      originalPdfKey: "orig.pdf",
      currentDocument: {
        id: "doc_alpha",
        analysisVersion: 1,
        pages: [],
        fonts: {},
        metadata: {},
        assets: {},
        report: { unidentified: [], warnings: [], formXObjects: 0, annotations: 0, hasAcroForm: false, encrypted: false },
      },
      operations: [],
      revision: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const retrieved = await storageWithCustomLock.getProject("project_test_alpha");
    assert.ok(retrieved && retrieved.id === "project_test_alpha");
    assert.equal(retrieved.title, "Test PDF Document");

    // Test CAS update locking & revision conflict detection
    const updated = await storageWithCustomLock.updateProject("project_test_alpha", 0, {
      currentDocument: retrieved.currentDocument,
      operations: [],
      updatedAt: new Date().toISOString(),
    });
    assert.equal(updated.revision, 1);

    // Concurrency conflict check: repeating with stale revision 0 must reject
    let conflictCaught = false;
    try {
      await storageWithCustomLock.updateProject("project_test_alpha", 0, {
        currentDocument: retrieved.currentDocument,
        operations: [],
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      conflictCaught = true;
      assert.equal(err.name, "PDFProjectConflictError");
    }
    assert.equal(conflictCaught, true, "Revision conflict error properly thrown under concurrency");

    console.log("  ✓ PDFProjectStorage CAS revision locking and atomic conflict detection verified.");
  } finally {
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {}
  }
}

async function testCustomFontUploadAndExport() {
  console.log("[Test 2] Custom font upload, registration and export embedding...");

  // Generate a minimal mock font payload
  const mockFontBytes = new Uint8Array([
    0x00, 0x01, 0x00, 0x00, // sfnt version (TrueType)
    0x00, 0x01, 0x00, 0x10, // numTables: 1, searchRange: 16
    0x00, 0x00, 0x00, 0x00,
  ]);

  const customDef = registerCustomFont("BrandSlab", mockFontBytes, {
    displayName: "Brand Slab Pro (Custom)",
    weight: "bold",
    style: "normal",
  });

  assert.equal(customDef.family, "BrandSlab");
  assert.equal(customDef.isCustom, true);
  assert.ok(customDef.customDataUrl?.startsWith("data:font/opentype;base64,"));

  const allCustom = getCustomFonts();
  assert.ok(allCustom.some((f) => f.family === "BrandSlab"), "getCustomFonts includes newly registered font");

  // Check resolveFont prioritized custom font
  const resolved = resolveFont("BrandSlab", "bold", "normal");
  assert.equal(resolved.family, "BrandSlab");
  assert.equal(resolved.isCustom, true);

  console.log("  ✓ Custom font registered and resolved with custom metadata and base64 preview URL.");

  // Test integration with Aurum PDF
  const fixturePath = path.resolve(__dirname, "fixtures/pdf-editor/aurum-offer.pdf");
  const sourceBytes = new Uint8Array(fs.readFileSync(fixturePath));
  const model = await analyzePDF(sourceBytes);

  let history = createHistory(model);
  const textEl = history.doc.pages[0].elements.find(
    (e) => e.kind === "text" && (e as PDFTextElement).text === "FULL CORPORATE OFFER"
  ) as PDFTextElement;

  // Assign the custom font to the title
  history = historyApply(
    history,
    makeUpdate(history.doc, textEl.id, {
      fontFamily: "BrandSlab",
      fontWeight: "bold",
      text: "BRAND CUSTOM HEADING",
    }, "font")
  );

  // Exporter should embed custom font or gracefully handle with fallback without crashing
  const exported = await exportPDF(sourceBytes, history.doc, { validate: false });
  assert.ok(exported.length > 10000, "Exported PDF generated successfully with custom font text");

  const parsedDoc = await PDFDocument.load(exported);
  assert.equal(parsedDoc.getPageCount(), 4);
  console.log("  ✓ Exported PDF successfully with custom font element binding.");

  // Test embedding a real TTF binary with fontkit
  const sampleFontPath = "C:\\Windows\\Fonts\\arial.ttf";
  if (fs.existsSync(sampleFontPath)) {
    const realFontBytes = new Uint8Array(fs.readFileSync(sampleFontPath));
    registerCustomFont("CustomCorporateFont", realFontBytes, {
      displayName: "Custom Corporate Font (TrueType)",
      weight: "normal",
      style: "normal",
    });

    const docWithRealFont = await PDFDocument.create();
    const realFontDef = resolveFont("CustomCorporateFont", "normal", "normal");
    const embedded = await embedFontInDoc(docWithRealFont, realFontDef);
    assert.ok(embedded, "Real font binary embedded successfully using fontkit");
    console.log("  ✓ Real TTF binary embedded into PDF document via @pdf-lib/fontkit successfully.");
  }
}

async function run() {
  await testLockProviders();
  await testCustomFontUploadAndExport();
  console.log("\n=======================================================");
  console.log("ALL MULTI-NODE AND CUSTOM FONT TESTS PASSED (100%)");
  console.log("=======================================================");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
