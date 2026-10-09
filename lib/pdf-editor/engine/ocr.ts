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
  success: boolean;
  confidence: number;
  textElements: PDFTextElement[];
  rawText: string;
  error?: { code: string; message: string };
}

export interface OCRWorker {
  recognize(input: Buffer | Uint8Array | string): Promise<{ data: any }>;
  terminate(): Promise<void>;
}

let configuredWorkerFactory: (() => Promise<OCRWorker>) | undefined;

export function setOCRWorkerFactoryForTests(factory: (() => Promise<OCRWorker>) | undefined): void {
  configuredWorkerFactory = factory;
}

/**
 * Runs OCR on an image buffer or base64 image data URL.
 */
export async function runPageOCR(
  imageBufferOrDataUrl: Buffer | Uint8Array | string,
  pageId: string,
  pageWidth: number,
  pageHeight: number,
  workerFactory?: () => Promise<OCRWorker>,
): Promise<OCRResult> {
  if (!imageBufferOrDataUrl || (typeof imageBufferOrDataUrl === "string" && !imageBufferOrDataUrl.trim())) {
    return {
      success: false,
      confidence: 0,
      textElements: [],
      rawText: "",
      error: { code: "OCR_INPUT_MISSING", message: "An image buffer or data URL is required" },
    };
  }

  let worker: any = null;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeoutMs = Number(process.env.PDF_EDITOR_OCR_TIMEOUT_MS || 45_000);
    const timeout = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        const error = new Error(`OCR timed out after ${timeoutMs}ms`);
        error.name = "OCRTimeoutError";
        reject(error);
      }, timeoutMs);
    });
    const ret = await Promise.race([
      (async () => {
        if (workerFactory || configuredWorkerFactory) {
          worker = await (workerFactory || configuredWorkerFactory)!();
        } else {
          const { createWorker } = await import("tesseract.js");
          worker = await createWorker("eng");
        }
        return worker.recognize(imageBufferOrDataUrl);
      })(),
      timeout,
    ]);
    if (timeoutHandle) clearTimeout(timeoutHandle);

    const textElements: PDFTextElement[] = [];
    const lines = ret.data.lines || [];

    const imgWidth = (ret.data as any)?.width || (ret.data as any)?.image_width || 1240;
    const imgHeight = (ret.data as any)?.height || (ret.data as any)?.image_height || 1754;
    const scaleX = pageWidth / imgWidth;
    const scaleY = pageHeight / imgHeight;

    let zIndex = 50;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.text.trim()) continue;

      const bbox = line.bbox;
      // Convert pixel coordinates to PDF point coordinates assuming standard 150 DPI render
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
      success: true,
      confidence: Number(((ret.data.confidence || 85) / 100).toFixed(2)),
      textElements,
      rawText: ret.data.text,
    };
  } catch (err: any) {
    console.error("OCR recognition failed:", err);
    return {
      success: false,
      confidence: 0,
      textElements: [],
      rawText: "",
      error: {
        code: err?.name === "OCRTimeoutError" ? "OCR_TIMEOUT" : "OCR_RECOGNITION_FAILED",
        message: err?.message || "OCR recognition failed",
      },
    };
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
    if (worker) {
      try {
        await worker.terminate();
      } catch (error) {
        console.error("OCR worker cleanup failed:", error);
      }
    }
  }
}
