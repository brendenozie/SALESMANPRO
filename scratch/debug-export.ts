import fs from "node:fs";
import path from "node:path";
import { analyzePDF } from "../lib/pdf-editor/engine/analyzer";
import { exportPDF } from "../lib/pdf-editor/engine/exporter";

async function debug() {
  const data = new Uint8Array(fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf"));
  const model = await analyzePDF(data);
  console.log("Model analyzed. Pages:", model.pages.length);

  try {
    const exported = await exportPDF(data, model);
    console.log("Exported bytes length:", exported.length);
    console.log("Exported header:", new TextDecoder().decode(exported.slice(0, 10)));
  } catch (e: any) {
    console.error("Export error stack:", e.stack);
  }
}

debug().catch(console.error);
