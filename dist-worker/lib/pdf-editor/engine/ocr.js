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
exports.runPageOCR = void 0;
const geometry_1 = require("../model/geometry");
/**
 * Runs OCR on an image buffer or base64 image data URL.
 */
async function runPageOCR(imageBufferOrDataUrl, pageId, pageWidth, pageHeight) {
    if (!imageBufferOrDataUrl || (typeof imageBufferOrDataUrl === "string" && !imageBufferOrDataUrl.trim())) {
        return {
            confidence: 0,
            textElements: [],
            rawText: "",
        };
    }
    let worker = null;
    try {
        const { createWorker } = await Promise.resolve().then(() => __importStar(require("tesseract.js")));
        worker = await createWorker("eng");
        const ret = await worker.recognize(imageBufferOrDataUrl);
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
            confidence: Number(((ret.data.confidence || 85) / 100).toFixed(2)),
            textElements,
            rawText: ret.data.text,
        };
    }
    catch (err) {
        console.warn("OCR recognition encountered an issue, returning fallback:", err);
        return {
            confidence: 0,
            textElements: [],
            rawText: "",
        };
    }
    finally {
        if (worker) {
            try {
                await worker.terminate();
            }
            catch (_) { }
        }
    }
}
exports.runPageOCR = runPageOCR;
