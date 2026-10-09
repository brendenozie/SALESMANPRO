import fs from "node:fs";
import { PDFDocument } from "pdf-lib";
import {
  decompressContentStream,
  tokenizeContentStream,
  serializeContentStream,
} from "../lib/pdf-editor/engine/content-stream.ts";

async function run() {
  const data = fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf");
  const pdfDoc = await PDFDocument.load(data);
  const page = pdfDoc.getPage(0);
  const rawBytes = page.node.Contents().asUint8Array();

  const decompressed = decompressContentStream(rawBytes, ["ASCII85Decode", "FlateDecode"]);
  console.log("Decompressed length:", decompressed.length);

  const ops = tokenizeContentStream(decompressed);
  console.log("Tokenized ops count:", ops.length);

  // Find some text ops
  const textOps = ops.filter((o) => o.op === "Tj" || o.op === "TJ");
  console.log("Found text ops:", textOps.length);
  textOps.slice(0, 5).forEach((t, idx) => {
    console.log(`Text op ${idx}:`, t.op, t.operands);
  });

  // Re-serialize
  const serialized = serializeContentStream(ops);
  console.log("Re-serialized length:", serialized.length);
}

run().catch(console.error);
