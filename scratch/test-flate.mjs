import fs from "node:fs";
import { PDFDocument, PDFName } from "pdf-lib";

async function testExportDoc() {
  const data = fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf");
  const doc = await PDFDocument.load(data);
  const outDoc = await PDFDocument.create();
  const [page] = await outDoc.copyPages(doc, [0]);
  outDoc.addPage(page);

  const stream = outDoc.context.flateStream(new TextEncoder().encode("q 1 0 0 1 0 0 cm Q"));
  page.node.set(PDFName.of("Contents"), outDoc.context.register(stream));

  const saved = await outDoc.save();
  console.log("Saved length:", saved.length);
  const reloaded = await PDFDocument.load(saved);
  console.log("Reloaded pages:", reloaded.getPageCount());
}

testExportDoc().catch(console.error);
