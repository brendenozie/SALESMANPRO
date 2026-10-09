import fs from "node:fs";
import path from "node:path";
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFStream, PDFRawStream } from "pdf-lib";
import { analyzePDF } from "../lib/pdf-editor/engine/analyzer";
import type { PDFDocumentModel } from "../lib/pdf-editor/model/types";

async function main() {
  const fixturePath = path.resolve(__dirname, "../tests/fixtures/pdf-editor/aurum-offer.pdf");
  const bytes = new Uint8Array(fs.readFileSync(fixturePath));

  console.log("Analyzing Aurum PDF fixture...");
  const model: PDFDocumentModel = await analyzePDF(bytes);

  const pdfDoc = await PDFDocument.load(bytes);
  const pageCount = pdfDoc.getPageCount();

  const inventory: any = {
    documentId: model.id,
    pageCount,
    pages: [],
    fonts: model.fonts,
    metadata: model.metadata,
  };

  for (let i = 0; i < pageCount; i++) {
    const pageModel = model.pages[i];
    const pageObj = pdfDoc.getPage(i);
    const { width, height } = pageObj.getSize();
    const rot = pageObj.getRotation().angle;

    // Check resources
    const resources = pageObj.node.Resources();
    const xObjectDict = resources?.get(PDFName.of("XObject"));
    const fontRef = resources?.get(PDFName.of("Font"));
    const fontDict = fontRef ? pdfDoc.context.lookup(fontRef) : undefined;

    const xObjectKeys: string[] = [];
    if (xObjectDict instanceof PDFDict) {
      for (const [k] of xObjectDict.entries()) {
        xObjectKeys.push(k.asString());
      }
    }

    const fontKeys: string[] = [];
    if (fontDict instanceof PDFDict) {
      for (const [k] of fontDict.entries()) {
        fontKeys.push(k.asString());
      }
    }

    const texts = pageModel.elements.filter((e) => e.kind === "text");
    const shapes = pageModel.elements.filter((e) => e.kind === "shape");
    const images = pageModel.elements.filter((e) => e.kind === "image");

    inventory.pages.push({
      pageIndex: i,
      pageNumber: i + 1,
      width,
      height,
      rotation: rot,
      textCount: texts.length,
      shapeCount: shapes.length,
      imageCount: images.length,
      xObjects: xObjectKeys,
      fontResources: fontKeys,
      texts: texts.map((t: any) => ({
        id: t.id,
        text: t.text.slice(0, 60),
        bbox: t.bbox,
        fontSize: t.fontSize,
        fontFamily: t.fontFamily,
        fontWeight: t.fontWeight,
        color: t.color,
      })),
      shapes: shapes.map((s: any) => ({
        id: s.id,
        role: s.role,
        bbox: s.bbox,
        fill: s.fill,
        stroke: s.stroke,
        lineWidth: s.lineWidth,
      })),
      images: images.map((img: any) => ({
        id: img.id,
        bbox: img.bbox,
        xobjectRef: img.xobjectRef,
      })),
    });
  }

  const outPath = path.resolve(__dirname, "aurum-baseline-inventory.json");
  fs.writeFileSync(outPath, JSON.stringify(inventory, null, 2));
  console.log(`Baseline inventory written to ${outPath}`);
  console.log(`Summary: ${pageCount} pages, Total elements: ${model.pages.reduce((acc, p) => acc + p.elements.length, 0)}`);
}

main().catch(console.error);
