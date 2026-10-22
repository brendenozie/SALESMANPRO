/**
 * scripts/edit-and-save-decks.ts
 *
 * Imports, edits, exports, and verifies the two pitch decks:
 * 1. SalesManPro_Deck .pptx.pdf
 * 2. Ghuba_Deck .pptx.pdf
 *
 * Persists both to server storage with isSuperAdminOnly: true, companyId: "super_admin_vault".
 * Re-analyzes exported files to confirm functional persistence.
 * Verifies security isolation so regular users cannot access them.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { analyzePDF } from "../lib/pdf-editor/engine/analyzer";
import { exportPDF } from "../lib/pdf-editor/engine/exporter";
import { validateExportedPDF } from "../lib/pdf-editor/engine/validator";
import {
  pdfProjectStorage,
  type PDFProjectRecord,
} from "../lib/pdf-editor/storage/project-storage";
import { ownsPDFProject } from "../lib/pdf-editor/storage/access";
import { makeUpdate, type EditorOperation } from "../lib/pdf-editor/model/operations";

async function run() {
  console.log("=== SalesmanPro Deck Processing & Verification ===");

  // Locate file paths
  const downloadsDir = "C:\\Users\\Brenden\\Downloads";
  const salesmanProPath = path.join(downloadsDir, "SalesManPro_Deck .pptx.pdf");
  const ghubaPath = path.join(downloadsDir, "Ghuba_Deck .pptx.pdf");

  if (!fs.existsSync(salesmanProPath)) {
    throw new Error(`File not found: ${salesmanProPath}`);
  }
  if (!fs.existsSync(ghubaPath)) {
    throw new Error(`File not found: ${ghubaPath}`);
  }

  const outputDir = path.join(process.cwd(), "storage", "pdf-editor");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ==========================================
  // 1. Process SalesManPro Deck
  // ==========================================
  console.log("\n[1/4] Processing SalesManPro_Deck .pptx.pdf...");
  const smpBytes = new Uint8Array(fs.readFileSync(salesmanProPath));
  const smpDoc = await analyzePDF(smpBytes, { ocrMode: "auto" });
  console.log(`SalesManPro analyzed: ${smpDoc.pages.length} pages, tables detected:`,
    smpDoc.pages.flatMap((p, idx) => (p.tables || []).map(t => `p${idx + 1}:${t.rows.length}x${t.columns.length}`)).join(", ")
  );

  // Edit Page 1: Cover Title / Subtitle
  const p1Texts = smpDoc.pages[0].elements.filter(e => e.kind === "text");
  console.log("Page 1 texts:", p1Texts.map(t => (t as any).text.trim()).filter(Boolean).slice(0, 5));
  
  // Find "online universe" or "Launch your dream" or "SalesmanPro"
  const titleEl = p1Texts.find(t => (t as any).text.includes("Launch your dream")) ||
                  p1Texts.find(t => (t as any).text.includes("online universe")) ||
                  p1Texts[0];

  const smpOps: EditorOperation[] = [];

  if (titleEl) {
    const updatedTitleText = "Launch your dream online universe (2026 Executive Verified)";
    smpOps.push(makeUpdate(smpDoc, titleEl.id, { text: updatedTitleText }, "text"));
    (titleEl as any).text = updatedTitleText;
    console.log(`Page 1 updated: "${updatedTitleText}"`);
  }

  // Edit Page 10 (Financial Projections table)
  const p10 = smpDoc.pages[9] || smpDoc.pages[smpDoc.pages.length - 2];
  const p10Texts = p10.elements.filter(e => e.kind === "text");
  const gmvCell = p10Texts.find(t => (t as any).text.includes("100M")) ||
                  p10Texts.find(t => (t as any).text.includes("500M"));
  if (gmvCell) {
    const origGmv = (gmvCell as any).text;
    const updatedGmv = origGmv.replace("100M", "150M").replace("500M", "600M");
    smpOps.push(makeUpdate(smpDoc, gmvCell.id, { text: updatedGmv }, "text"));
    (gmvCell as any).text = updatedGmv;
    console.log(`Page 10 table updated: "${origGmv}" -> "${updatedGmv}"`);
  }

  // Save to project storage with isSuperAdminOnly: true
  const smpProjectId = "proj_salesmanpro_deck";
  const smpSha256 = crypto.createHash("sha256").update(smpBytes).digest("hex");
  const smpRecord: PDFProjectRecord = {
    id: smpProjectId,
    userId: "super_admin_root",
    companyId: "super_admin_vault",
    name: "SalesManPro_Deck.pdf",
    isSuperAdminOnly: true,
    originalPdfKey: path.join(outputDir, "SalesManPro_Deck_original.pdf"),
    originalPdfSha256: smpSha256,
    currentDocument: smpDoc,
    operations: smpOps,
    pageCount: smpDoc.pages.length,
    fileSizeBytes: smpBytes.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 0,
  };

  await pdfProjectStorage.saveOriginalPdf(smpProjectId, smpBytes);
  await pdfProjectStorage.saveProject(smpRecord);
  console.log(`Saved project ${smpProjectId} with isSuperAdminOnly: true`);

  // Export modified PDF
  console.log("Exporting modified SalesManPro PDF...");
  const smpExportedBytes = await exportPDF(smpBytes, smpDoc, { validate: true });
  const smpExportPath = path.join(outputDir, "SalesManPro_Deck_Edited.pdf");
  fs.writeFileSync(smpExportPath, smpExportedBytes);
  await pdfProjectStorage.commitExport(smpProjectId, 0, smpExportedBytes, {
    currentDocument: smpDoc,
    operations: smpOps,
    updatedAt: new Date().toISOString(),
  });
  console.log(`Exported SalesManPro PDF to ${smpExportPath} (${smpExportedBytes.length} bytes)`);

  // ==========================================
  // 2. Process Ghuba Deck
  // ==========================================
  console.log("\n[2/4] Processing Ghuba_Deck .pptx.pdf...");
  const ghubaBytes = new Uint8Array(fs.readFileSync(ghubaPath));
  const ghubaDoc = await analyzePDF(ghubaBytes, { ocrMode: "auto" });
  console.log(`Ghuba analyzed: ${ghubaDoc.pages.length} pages, tables detected:`,
    ghubaDoc.pages.flatMap((p, idx) => (p.tables || []).map(t => `p${idx + 1}:${t.rows.length}x${t.columns.length}`)).join(", ")
  );

  const ghubaOps: EditorOperation[] = [];
  const gP1Texts = ghubaDoc.pages[0].elements.filter(e => e.kind === "text");
  const gTagline = gP1Texts.find(t => (t as any).text.includes("Digital Marketplace")) ||
                   gP1Texts.find(t => (t as any).text.includes("Powering")) ||
                   gP1Texts[0];
  if (gTagline) {
    const updatedGTagline = "Powering Africa's Next-Gen Digital Marketplace (Executive Verified)";
    ghubaOps.push(makeUpdate(ghubaDoc, gTagline.id, { text: updatedGTagline }, "text"));
    (gTagline as any).text = updatedGTagline;
    console.log(`Ghuba Page 1 updated: "${updatedGTagline}"`);
  }

  // Edit Page 10 (Financial Projections table)
  const gP10 = ghubaDoc.pages[9] || ghubaDoc.pages[ghubaDoc.pages.length - 2];
  const gP10Texts = gP10.elements.filter(e => e.kind === "text");
  const gGmvCell = gP10Texts.find(t => (t as any).text.includes("100M")) ||
                   gP10Texts.find(t => (t as any).text.includes("500M"));
  if (gGmvCell) {
    const origGmv = (gGmvCell as any).text;
    const updatedGmv = origGmv.replace("100M", "180M").replace("500M", "750M");
    ghubaOps.push(makeUpdate(ghubaDoc, gGmvCell.id, { text: updatedGmv }, "text"));
    (gGmvCell as any).text = updatedGmv;
    console.log(`Ghuba Page 10 table updated: "${origGmv}" -> "${updatedGmv}"`);
  }

  // Save to project storage with isSuperAdminOnly: true
  const ghubaProjectId = "proj_ghuba_deck";
  const ghubaSha256 = crypto.createHash("sha256").update(ghubaBytes).digest("hex");
  const ghubaRecord: PDFProjectRecord = {
    id: ghubaProjectId,
    userId: "super_admin_root",
    companyId: "super_admin_vault",
    name: "Ghuba_Deck.pdf",
    isSuperAdminOnly: true,
    originalPdfKey: path.join(outputDir, "Ghuba_Deck_original.pdf"),
    originalPdfSha256: ghubaSha256,
    currentDocument: ghubaDoc,
    operations: ghubaOps,
    pageCount: ghubaDoc.pages.length,
    fileSizeBytes: ghubaBytes.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 0,
  };

  await pdfProjectStorage.saveOriginalPdf(ghubaProjectId, ghubaBytes);
  await pdfProjectStorage.saveProject(ghubaRecord);
  console.log(`Saved project ${ghubaProjectId} with isSuperAdminOnly: true`);

  // Export modified PDF
  console.log("Exporting modified Ghuba PDF...");
  const ghubaExportedBytes = await exportPDF(ghubaBytes, ghubaDoc, { validate: true });
  const ghubaExportPath = path.join(outputDir, "Ghuba_Deck_Edited.pdf");
  fs.writeFileSync(ghubaExportPath, ghubaExportedBytes);
  await pdfProjectStorage.commitExport(ghubaProjectId, 0, ghubaExportedBytes, {
    currentDocument: ghubaDoc,
    operations: ghubaOps,
    updatedAt: new Date().toISOString(),
  });
  console.log(`Exported Ghuba PDF to ${ghubaExportPath} (${ghubaExportedBytes.length} bytes)`);

  // ==========================================
  // 3. Functional Persistence Re-Analysis
  // ==========================================
  console.log("\n[3/4] Verifying functional persistence via re-analysis of exported files...");

  // SalesManPro re-analysis
  const smpReAnalysis = await analyzePDF(smpExportedBytes, { ocrMode: "none" });
  const smpReTexts = smpReAnalysis.pages.flatMap(p => p.elements.filter(e => e.kind === "text")).map(t => (t as any).text);
  const smpVerified1 = smpReTexts.some(t => t.includes("Executive Verified"));
  const smpVerified2 = smpReTexts.some(t => t.includes("150M") || t.includes("600M"));
  console.log(`SalesManPro Re-analysis persistence: Title updated=${smpVerified1}, Table updated=${smpVerified2}`);

  // Ghuba re-analysis
  const ghubaReAnalysis = await analyzePDF(ghubaExportedBytes, { ocrMode: "none" });
  const ghubaReTexts = ghubaReAnalysis.pages.flatMap(p => p.elements.filter(e => e.kind === "text")).map(t => (t as any).text);
  const ghubaVerified1 = ghubaReTexts.some(t => t.includes("Executive Verified"));
  const ghubaVerified2 = ghubaReTexts.some(t => t.includes("180M") || t.includes("750M"));
  console.log(`Ghuba Re-analysis persistence: Tagline updated=${ghubaVerified1}, Table updated=${ghubaVerified2}`);

  if (!smpVerified1 && !smpVerified2) {
    throw new Error("SalesManPro updates did not persist in exported PDF!");
  }
  if (!ghubaVerified1 && !ghubaVerified2) {
    throw new Error("Ghuba updates did not persist in exported PDF!");
  }

  // ==========================================
  // 4. Security Isolation Verification
  // ==========================================
  console.log("\n[4/4] Verifying super-admin-only visibility & security isolation...");

  // A. Non-super admin listing projects for regular company
  const regularCompanyProjects = await pdfProjectStorage.listProjects("regular_company_123", false);
  const regularHasSmp = regularCompanyProjects.some(p => p.id === smpProjectId);
  const regularHasGhuba = regularCompanyProjects.some(p => p.id === ghubaProjectId);
  console.log(`Regular company listing: smpVisible=${regularHasSmp}, ghubaVisible=${regularHasGhuba}`);
  if (regularHasSmp || regularHasGhuba) {
    throw new Error("Security Violation: Super-admin documents leaked to regular company!");
  }

  // B. Non-super admin global listing (isSuperAdmin = false)
  const nonAdminGlobalProjects = await pdfProjectStorage.listProjects(undefined, false);
  const nonAdminHasSmp = nonAdminGlobalProjects.some(p => p.id === smpProjectId);
  const nonAdminHasGhuba = nonAdminGlobalProjects.some(p => p.id === ghubaProjectId);
  console.log(`Non-super-admin global listing: smpVisible=${nonAdminHasSmp}, ghubaVisible=${nonAdminHasGhuba}`);
  if (nonAdminHasSmp || nonAdminHasGhuba) {
    throw new Error("Security Violation: Super-admin documents leaked in global non-admin list!");
  }

  // C. Super-admin global listing (isSuperAdmin = true)
  const superAdminProjects = await pdfProjectStorage.listProjects(undefined, true);
  const superHasSmp = superAdminProjects.some(p => p.id === smpProjectId);
  const superHasGhuba = superAdminProjects.some(p => p.id === ghubaProjectId);
  console.log(`Super-admin global listing: smpVisible=${superHasSmp}, ghubaVisible=${superHasGhuba}`);
  if (!superHasSmp || !superHasGhuba) {
    throw new Error("Failure: Super-admin cannot see the documents in super-admin list!");
  }

  // D. Direct access check via ownsPDFProject
  const smpStored = await pdfProjectStorage.getProject(smpProjectId);
  if (!smpStored) throw new Error("Could not retrieve stored smp record");

  const regularIdentity = { userId: "user_regular", companyId: "regular_store", isSuperAdmin: false };
  const superAdminIdentity = { userId: "admin_super", companyId: "super_admin_vault", isSuperAdmin: true };

  const regularAllowed = ownsPDFProject(smpStored, regularIdentity);
  const superAllowed = ownsPDFProject(smpStored, superAdminIdentity);
  console.log(`ownsPDFProject check: regularUserAllowed=${regularAllowed}, superAdminAllowed=${superAllowed}`);

  if (regularAllowed) {
    throw new Error("Security Violation: ownsPDFProject returned true for regular user on super-admin-only project!");
  }
  if (!superAllowed) {
    throw new Error("Failure: ownsPDFProject returned false for super-admin!");
  }

  console.log("\n========================================================");
  console.log("SUCCESS: Both pitch decks edited, verified, exported, and secured.");
  console.log(`- SalesManPro: ${smpExportPath}`);
  console.log(`- Ghuba:       ${ghubaExportPath}`);
  console.log("========================================================");
}

run().catch(err => {
  console.error("Execution failed:", err);
  process.exit(1);
});
