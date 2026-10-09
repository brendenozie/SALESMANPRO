import fs from "node:fs";
import { PDFDocument, PDFName, PDFArray } from "pdf-lib";
import { decompressContentStream, tokenizeContentStream } from "../lib/pdf-editor/engine/content-stream";

async function checkOps() {
  const data = new Uint8Array(fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf"));
  const doc = await PDFDocument.load(data);
  const contents = doc.getPage(0).node.Contents();
  const filterObj = contents.dict.get(PDFName.of("Filter"));
  const filters: string[] = [];
  if (filterObj instanceof PDFArray) {
    for (let i = 0; i < filterObj.size(); i++) filters.push(filterObj.get(i).asString());
  }
  const decompressed = decompressContentStream(contents.asUint8Array(), filters);
  const ops = tokenizeContentStream(decompressed);

  for (let i = 65; i <= 95; i++) {
    console.log(`Op ${i}: ${ops[i]?.op} -> ${JSON.stringify(ops[i]?.operands)}`);
  }
}

checkOps().catch(console.error);
