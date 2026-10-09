import fs from "node:fs";
import { analyzePDF } from "../lib/pdf-editor/engine/analyzer";

async function inspect() {
  const data = new Uint8Array(fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf"));
  const model = await analyzePDF(data);
  const p1 = model.pages[0];
  const texts = p1.elements.filter((e) => e.kind === "text");
  for (const t of texts) {
    console.log(`ID: ${t.id} | Text: "${t.text}" | opIndices: ${JSON.stringify(t.source?.opIndices)}`);
  }
}

inspect().catch(console.error);
