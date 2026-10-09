import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { PDFDocument, PDFDict, PDFName } from "pdf-lib";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { analyzePDF } from "../lib/pdf-editor/engine/analyzer";
import { exportPDF } from "../lib/pdf-editor/engine/exporter";
import { historyApply, createHistory, makeUpdate } from "../lib/pdf-editor/model/operations";
import type { PDFImageElement, PDFShapeElement, PDFTextElement } from "../lib/pdf-editor/model/types";

async function main() {
  const source = new Uint8Array(fs.readFileSync(path.resolve(__dirname, "fixtures/pdf-editor/aurum-offer.pdf")));
  const model = await analyzePDF(source);
  assert.equal(model.pages.length, 4);
  assert.ok(Object.keys(model.fonts).length > 0, "indirect page font resources must be inventoried");

  let history = createHistory(model);
  const page = history.doc.pages[0];
  const title = page.elements.find((e) => e.kind === "text" && (e as PDFTextElement).text === "FULL CORPORATE OFFER") as PDFTextElement;
  const logo = page.elements.find((e) => e.kind === "image") as PDFImageElement;
  const accent = page.elements.find((e) => e.kind === "shape" && (e as PDFShapeElement).role === "accent") as PDFShapeElement;
  assert.ok(title && logo && accent);

  history = historyApply(history, makeUpdate(history.doc, title.id, {
    text: "Aurum Verification Heading",
    fontFamily: "Times",
    fontWeight: "bold",
    fontSize: 31,
    color: { r: 12, g: 34, b: 56 },
  }, "font"));
  history = historyApply(history, makeUpdate(history.doc, accent.id, {
    fill: { r: 10, g: 90, b: 220 },
    bbox: { ...accent.bbox, width: accent.bbox.width - 20 },
  }, "color"));

  const pngData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  history = historyApply(history, makeUpdate(history.doc, logo.id, {
    assetId: "asset_test_logo",
    mimeType: "image/png",
    bbox: { ...logo.bbox, x: logo.bbox.x + 12, width: logo.bbox.width + 8 },
  }, "image"));
  history = historyApply(history, {
    type: "registerAsset",
    asset: {
      id: "asset_test_logo",
      kind: "image",
      mimeType: "image/png",
      storageKey: pngData,
      sha256: "test",
      width: 1,
      height: 1,
      byteLength: 68,
    },
  });
  history = historyApply(history, {
    type: "deleteElement",
    pageId: page.id,
    elementId: page.elements.find((e) => e.kind === "text" && (e as PDFTextElement).text === "AND TRANSACTION PROCEDURE")!.id,
    element: page.elements.find((e) => e.kind === "text" && (e as PDFTextElement).text === "AND TRANSACTION PROCEDURE")!,
    index: 0,
  });

  const exported = await exportPDF(source, history.doc, { validate: false });
  const parsed = await PDFDocument.load(exported);
  assert.equal(parsed.getPageCount(), 4);
  const resources = parsed.getPage(0).node.Resources()!;
  const fontRef = resources.get(PDFName.of("Font"));
  const fontDict = fontRef ? parsed.context.lookup(fontRef) : undefined;
  assert.ok(fontDict instanceof PDFDict && fontDict.keys().some((key) => key.asString().includes("TimesBold")));
  const xObjectRef = resources.get(PDFName.of("XObject"));
  const xObjects = xObjectRef ? parsed.context.lookup(xObjectRef) : undefined;
  assert.ok(xObjects instanceof PDFDict && xObjects.keys().some((key) => key.asString().includes("SalesmanImage")));

  const doc = await pdfjs.getDocument({ data: exported.slice(), disableFontFace: true, useSystemFonts: true }).promise;
  const text = (await doc.getPage(1).then((p) => p.getTextContent())).items
    .map((item) => "str" in item ? item.str : "").join(" ");
  assert.match(text, /Aurum Verification Heading/);
  assert.doesNotMatch(text, /FULL CORPORATE OFFER/);
  assert.doesNotMatch(text, /AND TRANSACTION PROCEDURE/);

  console.log("Aurum gap verification passed: font resource, image resource, vector edit, deletion, and four-page parse verified.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
