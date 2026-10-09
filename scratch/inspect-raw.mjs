import fs from "node:fs";
import { PDFDocument, PDFName, PDFDict, PDFStream, PDFRawStream } from "pdf-lib";

async function inspectRaw() {
  const data = fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf");
  const pdfDoc = await PDFDocument.load(data);

  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    console.log(`\n=== PAGE ${i + 1} RAW ===`);
    const { width, height } = page.getSize();
    console.log(`Size: ${width} x ${height}`);

    // Inspect Resources
    const resources = page.node.Resources();
    if (resources) {
      const fontDict = resources.get(PDFName.of("Font"));
      console.log("Font dict:", fontDict ? fontDict.toString() : "none");
      const xobjectDict = resources.get(PDFName.of("XObject"));
      console.log("XObject dict:", xobjectDict ? xobjectDict.toString() : "none");
    }

    // Inspect Contents
    const contents = page.node.Contents();
    console.log("Contents type:", contents ? contents.constructor.name : "none");
    let streamText = "";
    if (contents instanceof PDFRawStream || contents instanceof PDFStream) {
      streamText = new TextDecoder().decode(contents.asUint8Array());
    } else if (Array.isArray(contents)) {
      console.log("Contents is array with length:", contents.length);
    }
    console.log("Stream length:", streamText.length);
    console.log("First 300 chars of stream:\n", streamText.slice(0, 300));
  }
}

inspectRaw().catch(console.error);
