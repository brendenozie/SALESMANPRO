import fs from "node:fs";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { PDFDocument } from "pdf-lib";

async function inspect() {
  const data = new Uint8Array(fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf"));
  const pdfDoc = await PDFDocument.load(data);
  console.log("Pages in pdf-lib:", pdfDoc.getPageCount());

  const doc = await pdfjs.getDocument({ data }).promise;
  console.log("Pages in pdfjs:", doc.numPages);

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const ops = await page.getOperatorList();
    console.log(`\n--- PAGE ${i} ---`);
    console.log("View:", page.view);
    console.log("Text items count:", textContent.items.length);
    console.log("Operator count:", ops.fnArray.length);

    // Sample some text items
    const sampleText = textContent.items
      .slice(0, 10)
      .map((it) => ("str" in it ? `${it.str} (${it.fontName}, size=${it.height})` : ""))
      .join(" | ");
    console.log("Sample text:", sampleText);

    // Operator analysis
    let imageOps = 0;
    let pathOps = 0;
    for (let j = 0; j < ops.fnArray.length; j++) {
      const fn = ops.fnArray[j];
      // paintImageXObject = 85, constructPath = 91, etc.
      // Let's check operator names
      const opName = Object.keys(pdfjs.OPS).find((k) => pdfjs.OPS[k] === fn);
      if (opName && opName.includes("Image")) imageOps++;
      if (opName && (opName.includes("Path") || opName.includes("curve") || opName.includes("line") || opName.includes("rectangle"))) pathOps++;
    }
    console.log(`Image ops: ${imageOps}, Path ops: ${pathOps}`);
  }
}

inspect().catch(console.error);
