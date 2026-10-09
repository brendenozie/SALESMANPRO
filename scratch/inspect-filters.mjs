import fs from "node:fs";
import zlib from "node:zlib";
import { PDFDocument, PDFName, PDFRawStream } from "pdf-lib";

async function inspectFilters() {
  const data = fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf");
  const pdfDoc = await PDFDocument.load(data);
  const page = pdfDoc.getPage(0);
  const contents = page.node.Contents();
  console.log("Stream dict:", contents.dict.toString());
  const filter = contents.dict.get(PDFName.of("Filter"));
  console.log("Filter:", filter ? filter.toString() : "none");

  // If it's ASCII85 / Flate, let's decompress
  const rawBytes = contents.asUint8Array();
  console.log("Raw bytes length:", rawBytes.length);
  // pdfjs decoded the operators perfectly, and pdf-lib can decompress or we can decode ASCII85/Flate
}

inspectFilters().catch(console.error);
