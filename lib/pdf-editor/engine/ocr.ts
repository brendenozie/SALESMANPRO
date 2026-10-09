/**
 * lib/pdf-editor/engine/ocr.ts
 *
 * OCR Engine for scanned document processing.
 * Integrates Tesseract.js to detect and recognize text on image-only pages.
 * Clearly separates native PDF text from OCR-derived text with confidence metrics.
 */

import type { PDFTextElement } from "../model/types";
import { roundRect } from "../model/geometry";

export interface OCRResult {
  confidence: number;
  textElements: PDFTextElement[];
  rawText: string;
}

/**
 * Runs OCR on an image buffer or base64 image data URL.
 */
export async function runPageOCR(
  imageBufferOrDataUrl: Buffer | Uint8Array | string,
  pageId: string,
  pageWidth: number,
  pageHeight: number
): Promise<OCRResult> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng");

    const ret = await worker.recognize(imageBufferOrDataUrl);
    await worker.terminate();

    const textElements: PDFTextElement[] = [];
    const lines = ret.data.lines || [];

    let zIndex = 50;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.text.trim()) continue;

      const bbox = line.bbox;
      // Convert pixel coordinates to PDF point coordinates assuming standard 150 DPI render
      const scaleX = pageWidth / (ret.data.imageColor?.width || 1240);
      const scaleY = pageHeight / (ret.data.imageColor?.height || 1754);

      const x = (bbox?.x0 || 40) * scaleX;
      const y = (bbox?.y0 || 40) * scaleY;
      const w = Math.max(((bbox?.x1 || 200) - (bbox?.x0 || 40)) * scaleX, 20);
      const h = Math.max(((bbox?.y1 || 60) - (bbox?.y0 || 40)) * scaleY, 12);

      textElements.push({
        id: `ocr_txt_${pageId}_${i + 1}`,
        pageId,
        kind: "text",
        text: line.text.trim(),
        lines: [
          {
            text: line.text.trim(),
            x,
            baseline: y + h * 0.8,
            width: w,
            runs: [
              {
                text: line.text.trim(),
                fontKey: "F1",
                fontSize: h,
                color: { r: 0, g: 0, b: 0 },
              },
            ],
          },
        ],
        bbox: roundRect({ x, y, width: w, height: h }),
        rotation: 0,
        origin: "ocr", // Explicitly marked as OCR-derived!
        zIndex: zIndex++,
        editable: true,
        limitations: ["OCR-derived text layer: please verify recognition accuracy"],
        fontKey: "F1",
        fontFamily: "Helvetica",
        fontSize: Math.round(h),
        fontWeight: "normal",
        fontStyle: "normal",
        color: { r: 0, g: 0, b: 0 },
        alignment: "left",
        lineHeight: h * 1.2,
        charSpacing: 0,
        wordSpacing: 0,
        layout: "paragraph",
        confidence: Number(((line.confidence || 85) / 100).toFixed(2)),
        renderMode: 0,
      });
    }

    return {
      confidence: Number(((ret.data.confidence || 85) / 100).toFixed(2)),
      textElements,
      rawText: ret.data.text,
    };
  } catch (err: any) {
    console.warn("OCR recognition encountered an issue, returning fallback:", err);
    return {
      confidence: 0,
      textElements: [],
      rawText: "",
    };
  }
}
