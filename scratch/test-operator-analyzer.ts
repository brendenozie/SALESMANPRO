import fs from "node:fs";
import { PDFDocument, PDFName, PDFArray } from "pdf-lib";
import { decompressContentStream, tokenizeContentStream, ContentOp } from "../lib/pdf-editor/engine/content-stream";

async function testOperatorAnalyzer() {
  const data = new Uint8Array(fs.readFileSync("tests/fixtures/pdf-editor/aurum-offer.pdf"));
  const doc = await PDFDocument.load(data);
  const page = doc.getPage(0);
  const { width: pageWidth, height: pageHeight } = page.getSize();

  const contents = page.node.Contents();
  const filterObj = contents.dict.get(PDFName.of("Filter"));
  const filters: string[] = [];
  if (filterObj instanceof PDFArray) {
    for (let i = 0; i < filterObj.size(); i++) filters.push(filterObj.get(i).asString());
  }
  const decompressed = decompressContentStream(contents.asUint8Array(), filters);
  const ops = tokenizeContentStream(decompressed);

  // Track graphics state: CTM, text matrix, font, color
  let ctm = [1, 0, 0, 1, 0, 0];
  const ctmStack: number[][] = [];
  let curFont = "F1";
  let curFontSize = 12;
  let curColor = { r: 0, g: 0, b: 0 };
  let inText = false;
  let textMatrix = [1, 0, 0, 1, 0, 0];
  let lineMatrix = [1, 0, 0, 1, 0, 0];
  let leading = 12;

  const elements: Array<{ text: string; x: number; y: number; fontSize: number; font: string; opIndex: number }> = [];

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    if (op.op === "q") {
      ctmStack.push([...ctm]);
    } else if (op.op === "Q") {
      if (ctmStack.length > 0) ctm = ctmStack.pop()!;
    } else if (op.op === "cm" && op.operands.length === 6) {
      // Multiply CTM
      const [a, b, c, d, e, f] = op.operands as number[];
      ctm = [
        ctm[0] * a + ctm[2] * b,
        ctm[1] * a + ctm[3] * b,
        ctm[0] * c + ctm[2] * d,
        ctm[1] * c + ctm[3] * d,
        ctm[0] * e + ctm[2] * f + ctm[4],
        ctm[1] * e + ctm[3] * f + ctm[5],
      ];
    } else if (op.op === "rg" && op.operands.length === 3) {
      curColor = {
        r: Math.round((op.operands[0] as number) * 255),
        g: Math.round((op.operands[1] as number) * 255),
        b: Math.round((op.operands[2] as number) * 255),
      };
    } else if (op.op === "BT") {
      inText = true;
      textMatrix = [1, 0, 0, 1, 0, 0];
      lineMatrix = [1, 0, 0, 1, 0, 0];
    } else if (op.op === "ET") {
      inText = false;
    } else if (op.op === "Tf" && op.operands.length >= 2) {
      const fName = typeof op.operands[0] === "object" && op.operands[0] !== null && "name" in op.operands[0]
        ? (op.operands[0] as { name: string }).name
        : String(op.operands[0]);
      curFont = fName;
      curFontSize = Number(op.operands[1]) || 12;
    } else if (op.op === "TL" && op.operands.length >= 1) {
      leading = Number(op.operands[0]) || 12;
    } else if (op.op === "Tm" && op.operands.length === 6) {
      textMatrix = op.operands as number[];
      lineMatrix = [...textMatrix];
    } else if (op.op === "Td" && op.operands.length === 2) {
      const tx = Number(op.operands[0]);
      const ty = Number(op.operands[1]);
      textMatrix[4] = lineMatrix[4] + tx;
      textMatrix[5] = lineMatrix[5] + ty;
      lineMatrix = [...textMatrix];
    } else if (op.op === "T*") {
      textMatrix[5] = lineMatrix[5] - leading;
      lineMatrix = [...textMatrix];
    } else if (op.op === "Tj" || op.op === "TJ") {
      let str = "";
      if (op.op === "Tj" && typeof op.operands[0] === "string") {
        str = op.operands[0];
      } else if (op.op === "TJ" && Array.isArray(op.operands[0])) {
        str = op.operands[0].filter((p) => typeof p === "string").join("");
      }

      if (str.trim()) {
        // Calculate point in PDF user space:
        // P = textMatrix * CTM
        const pdfX = textMatrix[4] * ctm[0] + textMatrix[5] * ctm[2] + ctm[4];
        const pdfY = textMatrix[4] * ctm[1] + textMatrix[5] * ctm[3] + ctm[5];
        const topY = pageHeight - pdfY - curFontSize;

        elements.push({
          text: str,
          x: Math.round(pdfX * 100) / 100,
          y: Math.round(topY * 100) / 100,
          fontSize: curFontSize,
          font: curFont,
          opIndex: i,
        });
      }
    }
  }

  console.log(`Extracted ${elements.length} text elements from content stream:`);
  elements.forEach((el, idx) => {
    console.log(`[${idx}] "${el.text}" at (${el.x}, ${el.y}) size=${el.fontSize} font=${el.font} opIdx=${el.opIndex}`);
  });
}

testOperatorAnalyzer().catch(console.error);
