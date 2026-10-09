import fs from "node:fs";
import zlib from "node:zlib";
import { PDFDocument } from "pdf-lib";

function decodeAscii85(strOrBytes) {
  let str = typeof strOrBytes === "string" ? strOrBytes : new TextDecoder("ascii").decode(strOrBytes);
  // Strip whitespace and <~ ~> if present
  str = str.replace(/\s+/g, "");
  if (str.startsWith("<~")) str = str.slice(2);
  if (str.endsWith("~>")) str = str.slice(0, -2);

  const out = [];
  let tuple = 0;
  let count = 0;

  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c === 122) { // 'z' represents 4 zero bytes
      if (count !== 0) throw new Error("Unexpected 'z' in ASCII85");
      out.push(0, 0, 0, 0);
      continue;
    }
    if (c < 33 || c > 117) continue; // skip invalid
    tuple = tuple * 85 + (c - 33);
    count++;
    if (count === 5) {
      out.push((tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255);
      tuple = 0;
      count = 0;
    }
  }

  if (count > 0) {
    for (let i = count; i < 5; i++) {
      tuple = tuple * 85 + 84;
    }
    for (let i = 0; i < count - 1; i++) {
      out.push((tuple >>> (24 - i * 8)) & 255);
    }
  }

  return Buffer.from(out);
}

async function testDecode() {
  const data = fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf");
  const pdfDoc = await PDFDocument.load(data);
  const page = pdfDoc.getPage(0);
  const rawBytes = page.node.Contents().asUint8Array();

  const ascii85Decoded = decodeAscii85(rawBytes);
  console.log("Ascii85 decoded length:", ascii85Decoded.length);
  const flateDecoded = zlib.inflateSync(ascii85Decoded);
  console.log("Flate decompressed length:", flateDecoded.length);
  const text = flateDecoded.toString("utf8");
  console.log("First 800 chars of decoded stream:\n", text.slice(0, 800));
}

testDecode().catch(console.error);
