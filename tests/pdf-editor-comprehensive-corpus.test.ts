import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { analyzePDF } from "../lib/pdf-editor/engine/analyzer";
import { exportPDF } from "../lib/pdf-editor/engine/exporter";
import { PDFProjectStorage, type PDFProjectRecord } from "../lib/pdf-editor/storage/project-storage";
import { createHistory, historyApply, makeUpdate, makeAdd, makeDelete } from "../lib/pdf-editor/model/operations";
import type { PDFDocumentModel, PDFTextElement, PDFShapeElement, PDFImageElement } from "../lib/pdf-editor/model/types";
import { NextRequest } from "next/server";

const fixturesDir = path.join(process.cwd(), "tests", "fixtures", "pdf-editor");
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

// 1. Create a 1x1 transparent PNG data URL for image testing
const samplePngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const samplePngBuffer = Buffer.from(samplePngBase64, "base64");

async function generateTestFixtures() {
  // Fixture A: Simple Digital PDF with text and shapes
  const docA = await PDFDocument.create();
  const fontA = await docA.embedFont(StandardFonts.Helvetica);
  const fontABold = await docA.embedFont(StandardFonts.HelveticaBold);
  const pageA = docA.addPage([600, 800]);
  pageA.drawText("SALESMANPRO ENTERPRISE INVOICE", {
    x: 50,
    y: 740,
    size: 20,
    font: fontABold,
    color: rgb(0.1, 0.2, 0.4),
  });
  pageA.drawText("Invoice Date: October 22, 2026", {
    x: 50,
    y: 710,
    size: 12,
    font: fontA,
    color: rgb(0.2, 0.2, 0.2),
  });
  pageA.drawRectangle({
    x: 50,
    y: 690,
    width: 500,
    height: 4,
    color: rgb(0.2, 0.5, 0.9),
  });
  const pathA = path.join(fixturesDir, "corpus-simple-digital.pdf");
  fs.writeFileSync(pathA, await docA.save());

  // Fixture B: Rotated Pages PDF (Page 1 = 90 deg, Page 2 = 0 deg)
  const docB = await PDFDocument.create();
  const pageB1 = docB.addPage([600, 800]);
  pageB1.setRotation(degrees(90));
  pageB1.drawText("Landscape Orientation Document", {
    x: 100,
    y: 400,
    size: 18,
    font: fontA,
  });
  const pageB2 = docB.addPage([600, 800]);
  pageB2.drawText("Portrait Orientation Follow-up", {
    x: 100,
    y: 700,
    size: 18,
    font: fontA,
  });
  const pathB = path.join(fixturesDir, "corpus-rotated-pages.pdf");
  fs.writeFileSync(pathB, await docB.save());

  // Fixture C: Scanned Document Simulation (embedded PNG image covering page)
  const docC = await PDFDocument.create();
  const pageC = docC.addPage([600, 800]);
  const pngImg = await docC.embedPng(samplePngBuffer);
  pageC.drawImage(pngImg, {
    x: 0,
    y: 0,
    width: 600,
    height: 800,
  });
  const pathC = path.join(fixturesDir, "corpus-scanned-page.pdf");
  fs.writeFileSync(pathC, await docC.save());

  // Fixture D: Multipage Document with Structured Data Table
  const docD = await PDFDocument.create();
  const pageD = docD.addPage([600, 800]);
  pageD.drawText("Quarterly Financial Summary", {
    x: 50,
    y: 740,
    size: 18,
    font: fontABold,
  });
  // Draw header line
  pageD.drawRectangle({ x: 50, y: 700, width: 500, height: 20, color: rgb(0.9, 0.9, 0.9) });
  pageD.drawText("Item Description", { x: 60, y: 705, size: 10, font: fontABold });
  pageD.drawText("Units Sold", { x: 260, y: 705, size: 10, font: fontABold });
  pageD.drawText("Gross Revenue", { x: 420, y: 705, size: 10, font: fontABold });
  // Row 1
  pageD.drawText("Enterprise Software Tier", { x: 60, y: 675, size: 10, font: fontA });
  pageD.drawText("142", { x: 260, y: 675, size: 10, font: fontA });
  pageD.drawText("$284,000", { x: 420, y: 675, size: 10, font: fontA });
  // Row 2
  pageD.drawText("Dedicated Support Package", { x: 60, y: 650, size: 10, font: fontA });
  pageD.drawText("38", { x: 260, y: 650, size: 10, font: fontA });
  pageD.drawText("$76,000", { x: 420, y: 650, size: 10, font: fontA });
  const pathD = path.join(fixturesDir, "corpus-table-document.pdf");
  fs.writeFileSync(pathD, await docD.save());
}

async function runComprehensiveCorpusTests() {
  console.log("===============================================================================");
  console.log("       SALESMANPRO PROFESSIONAL PDF EDITOR — COMPREHENSIVE CORPUS SUITE        ");
  console.log("===============================================================================\n");

  await generateTestFixtures();

  // Test 1: Simple Digital PDF Analysis and True Text Editing
  console.log("[Test 1] Analyzing Digital PDF & Verifying True Text Editing...");
  const bytesA = fs.readFileSync(path.join(fixturesDir, "corpus-simple-digital.pdf"));
  const docA = await analyzePDF(new Uint8Array(bytesA));
  assert.equal(docA.pages.length, 1);
  const page1 = docA.pages[0];
  assert.ok(page1.elements.length >= 2, "Must extract text and shape elements");
  const titleEl = page1.elements.find((e) => e.kind === "text" && (e as PDFTextElement).text.includes("SALESMANPRO")) as PDFTextElement;
  assert.ok(titleEl, "Extracted title element must be present");
  assert.equal(titleEl.role, "heading", "Analyzer layout intelligence must tag title as heading");

  // Modify title text and export
  let history = createHistory(docA);
  history = historyApply(history, makeUpdate(docA, titleEl.id, { text: "SALESMANPRO GLOBAL INVOICE (MODIFIED)" }, "text"));
  const exportedA = await exportPDF(new Uint8Array(bytesA), history.doc);
  assert.ok(exportedA.length > 0, "Exported PDF must have non-zero bytes");

  // Re-analyze exported PDF to prove modification persisted
  const reloadedDocA = await analyzePDF(exportedA);
  const reloadedText = reloadedDocA.pages[0].elements.find(
    (e) => e.kind === "text" && (e as PDFTextElement).text.includes("MODIFIED")
  );
  assert.ok(reloadedText, "Exported PDF must retain modified text");
  console.log("  ✓ Digital PDF analyzed, edited, exported, and re-verified cleanly.");

  // Test 2: Rotated Pages Preservation
  console.log("[Test 2] Analyzing Rotated Pages PDF...");
  const bytesB = fs.readFileSync(path.join(fixturesDir, "corpus-rotated-pages.pdf"));
  const docB = await analyzePDF(new Uint8Array(bytesB));
  assert.equal(docB.pages.length, 2);
  assert.equal(docB.pages[0].rotation, 90, "Page 1 rotation must be detected as 90 degrees");
  assert.equal(docB.pages[1].rotation, 0, "Page 2 rotation must be detected as 0 degrees");

  const exportedB = await exportPDF(new Uint8Array(bytesB), docB);
  const reloadedDocB = await PDFDocument.load(exportedB);
  assert.equal(reloadedDocB.getPage(0).getRotation().angle, 90, "Page 1 rotation must persist on export");
  assert.equal(reloadedDocB.getPage(1).getRotation().angle, 0, "Page 2 rotation must persist on export");
  console.log("  ✓ Page rotations accurately parsed and preserved through export pipeline.");

  // Test 3: Scanned Document Detection
  console.log("[Test 3] Analyzing Scanned Image PDF...");
  const bytesC = fs.readFileSync(path.join(fixturesDir, "corpus-scanned-page.pdf"));
  const docC = await analyzePDF(new Uint8Array(bytesC));
  const scannedPage = docC.pages[0];
  assert.equal(scannedPage.isScanned, true, "Page containing only full-page image must be marked isScanned: true");
  assert.ok(scannedPage.elements.some((e) => e.kind === "image"), "Scanned page must contain extracted image element");
  console.log("  ✓ Scanned document heuristic identified image-based scan correctly.");

  // Test 4: Structured Data & Table Heuristic Recognition
  console.log("[Test 4] Analyzing Structured Table Document...");
  const bytesD = fs.readFileSync(path.join(fixturesDir, "corpus-table-document.pdf"));
  const docD = await analyzePDF(new Uint8Array(bytesD));
  const tablePage = docD.pages[0];
  assert.ok(tablePage.tables && tablePage.tables.length > 0, "Table analyzer must detect aligned rows and columns");
  const detectedTable = tablePage.tables[0];
  assert.ok(detectedTable.rowCount >= 2, `Table must detect multiple rows (got ${detectedTable.rowCount})`);
  assert.ok(detectedTable.colCount >= 2, `Table must detect multiple columns (got ${detectedTable.colCount})`);
  console.log(`  ✓ Table layout recognized: ${detectedTable.rowCount} rows x ${detectedTable.colCount} columns.`);

  // Test 5: "See All Uploaded Documents" & Document Management API
  console.log("[Test 5] Verifying Document Management & Storage APIs...");
  const testStorageDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-storage-mgmt-"));
  const customStorage = new PDFProjectStorage({ baseDir: testStorageDir });

  const record1: PDFProjectRecord = {
    id: "proj_tenant_a_1",
    userId: "user-1",
    companyId: "store-alpha",
    name: "Alpha Invoice.pdf",
    originalPdfKey: "original.pdf",
    originalPdfSha256: "sha1",
    currentDocument: docA,
    operations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 0,
    pageCount: 1,
    fileSizeBytes: bytesA.length,
  };

  const record2: PDFProjectRecord = {
    id: "proj_tenant_a_2",
    userId: "user-1",
    companyId: "store-alpha",
    name: "Alpha Contract.pdf",
    originalPdfKey: "original.pdf",
    originalPdfSha256: "sha2",
    currentDocument: docB,
    operations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 0,
    pageCount: 2,
    fileSizeBytes: bytesB.length,
  };

  const recordOtherTenant: PDFProjectRecord = {
    id: "proj_tenant_b_1",
    userId: "user-2",
    companyId: "store-beta",
    name: "Beta Confidential.pdf",
    originalPdfKey: "original.pdf",
    originalPdfSha256: "sha3",
    currentDocument: docC,
    operations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 0,
    pageCount: 1,
    fileSizeBytes: bytesC.length,
  };

  await customStorage.saveProject(record1);
  await customStorage.saveProject(record2);
  await customStorage.saveProject(recordOtherTenant);

  // List all projects for store-alpha
  const alphaProjects = await customStorage.listProjects("store-alpha");
  assert.equal(alphaProjects.length, 2, "store-alpha should see exactly its 2 projects");
  assert.ok(alphaProjects.some((p) => p.name === "Alpha Invoice.pdf"));
  assert.ok(alphaProjects.some((p) => p.name === "Alpha Contract.pdf"));
  assert.equal(alphaProjects.some((p) => p.name.includes("Beta")), false, "Tenant isolation: cannot see store-beta documents");

  // Verify deletion
  const deleted = await customStorage.deleteProject("proj_tenant_a_2");
  assert.equal(deleted, true);
  const remaining = await customStorage.listProjects("store-alpha");
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, "proj_tenant_a_1");
  console.log("  ✓ Document list, size, page count tracking, deletion, and tenant scoping verified.");

  // Test 6: Page Management (Add page, delete page, rotate page)
  console.log("[Test 6] Verifying Page Management Operations...");
  let pageMgmtHistory = createHistory(docB);
  assert.equal(pageMgmtHistory.doc.pages.length, 2);

  // Rotate Page 2 to 180 degrees
  const p2 = pageMgmtHistory.doc.pages[1];
  pageMgmtHistory = historyApply(pageMgmtHistory, {
    type: "updatePage",
    pageId: p2.id,
    patch: { rotation: 180 },
    previous: { rotation: p2.rotation },
  });
  assert.equal(pageMgmtHistory.doc.pages[1].rotation, 180);

  // Delete Page 1
  const p1 = pageMgmtHistory.doc.pages[0];
  pageMgmtHistory = historyApply(pageMgmtHistory, {
    type: "deletePage",
    page: p1,
    index: 0,
  });
  assert.equal(pageMgmtHistory.doc.pages.length, 1);

  // Add Page back
  pageMgmtHistory = historyApply(pageMgmtHistory, {
    type: "addPage",
    page: p1,
    index: 0,
  });
  assert.equal(pageMgmtHistory.doc.pages.length, 2);
  console.log("  ✓ Page add, delete, and rotate operations applied cleanly.");

  // Clean up scratch fixtures
  fs.rmSync(testStorageDir, { recursive: true, force: true });

  console.log("\n===============================================================================");
  console.log("         ALL COMPREHENSIVE CORPUS AUDIT TESTS COMPLETED SUCCESSFULLY (100%)    ");
  console.log("===============================================================================");
}

runComprehensiveCorpusTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
  });
