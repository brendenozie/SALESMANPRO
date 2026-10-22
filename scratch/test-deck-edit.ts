import fs from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { analyzePDF } from "../lib/pdf-editor/engine/analyzer";
import { exportPDF } from "../lib/pdf-editor/engine/exporter";
import { createHistory, historyApply, makeUpdate } from "../lib/pdf-editor/model/operations";
import type { PDFDocumentModel, PDFTextElement } from "../lib/pdf-editor/model/types";
import { pdfProjectStorage, PDFProjectRecord } from "../lib/pdf-editor/storage/project-storage";

async function main() {
  const p1 = "C:/Users/Brenden/Downloads/SalesManPro_Deck .pptx.pdf";
  const p2 = "C:/Users/Brenden/Downloads/Ghuba_Deck .pptx.pdf";

  console.log("Analyzing SalesManPro Deck...");
  const b1 = new Uint8Array(fs.readFileSync(p1));
  const doc1 = await analyzePDF(b1);
  console.log("Doc 1 Pages:", doc1.pages.length);
  for (let i = 0; i < doc1.pages.length; i++) {
    const p = doc1.pages[i];
    console.log(`Page ${i + 1}: ${p.elements.length} elements (text: ${p.elements.filter(e => e.kind === "text").length}, shapes: ${p.elements.filter(e => e.kind === "shape").length}, images: ${p.elements.filter(e => e.kind === "image").length}, tables: ${p.tables?.length || 0})`);
  }

  console.log("\nAnalyzing Ghuba Deck...");
  const b2 = new Uint8Array(fs.readFileSync(p2));
  const doc2 = await analyzePDF(b2);
  console.log("Doc 2 Pages:", doc2.pages.length);
  for (let i = 0; i < doc2.pages.length; i++) {
    const p = doc2.pages[i];
    console.log(`Page ${i + 1}: ${p.elements.length} elements (text: ${p.elements.filter(e => e.kind === "text").length}, shapes: ${p.elements.filter(e => e.kind === "shape").length}, images: ${p.elements.filter(e => e.kind === "image").length}, tables: ${p.tables?.length || 0})`);
  }
}

main().catch(console.error);
