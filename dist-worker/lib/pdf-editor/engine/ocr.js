"use strict";
/**
 * lib/pdf-editor/engine/ocr.ts
 *
 * OCR Engine for scanned document processing.
 * Integrates Tesseract.js to detect and recognize text on image-only pages.
 * Clearly separates native PDF text from OCR-derived text with confidence metrics.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPageOCR = exports.setOCRWorkerFactoryForTests = void 0;
const geometry_1 = require("../model/geometry");
let configuredWorkerFactory;
function setOCRWorkerFactoryForTests(factory) {
    configuredWorkerFactory = factory;
}
exports.setOCRWorkerFactoryForTests = setOCRWorkerFactoryForTests;
/**
 * Runs OCR on an image buffer or base64 image data URL.
 */
async function runPageOCR(imageBufferOrDataUrl, pageId, pageWidth, pageHeight, workerFactory) {
    if (!imageBufferOrDataUrl || (typeof imageBufferOrDataUrl === "string" && !imageBufferOrDataUrl.trim())) {
        return {
            success: false,
            confidence: 0,
            textElements: [],
            rawText: "",
            error: { code: "OCR_INPUT_MISSING", message: "An image buffer or data URL is required" },
        };
    }
    let worker = null;
    let timeoutHandle;
    try {
        const timeoutMs = Number(process.env.PDF_EDITOR_OCR_TIMEOUT_MS || 45_000);
        const timeout = new Promise((_, reject) => {
            timeoutHandle = setTimeout(() => {
                const error = new Error(`OCR timed out after ${timeoutMs}ms`);
                error.name = "OCRTimeoutError";
                reject(error);
            }, timeoutMs);
        });
        const ret = await Promise.race([
            (async () => {
                if (workerFactory || configuredWorkerFactory) {
                    worker = await (workerFactory || configuredWorkerFactory)();
                }
                else {
                    const { createWorker } = await Promise.resolve().then(() => __importStar(require("tesseract.js")));
                    worker = await createWorker("eng");
                }
                return worker.recognize(imageBufferOrDataUrl);
            })(),
            timeout,
        ]);
        if (timeoutHandle)
            clearTimeout(timeoutHandle);
        const textElements = [];
        const lines = ret.data.lines || [];
        const imgWidth = ret.data?.width || ret.data?.image_width || 1240;
        const imgHeight = ret.data?.height || ret.data?.image_height || 1754;
        const scaleX = pageWidth / imgWidth;
        const scaleY = pageHeight / imgHeight;
        let zIndex = 50;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line.text.trim())
                continue;
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
                bbox: (0, geometry_1.roundRect)({ x, y, width: w, height: h }),
                rotation: 0,
                origin: "ocr",
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
    }
    catch (err) {
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
    }
    finally {
        if (timeoutHandle)
            clearTimeout(timeoutHandle);
        if (worker) {
            try {
                await worker.terminate();
            }
            catch (error) {
                console.error("OCR worker cleanup failed:", error);
            }
        }
    }
}
exports.runPageOCR = runPageOCR;
