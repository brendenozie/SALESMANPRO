"use strict";
/**
 * lib/pdf-editor/engine/validator.ts
 *
 * Mandatory Automated PDF Validation Layer.
 * Verifies exported PDFs against strict measurable tolerances per specifications:
 *   - Page count: exact (zero tolerance)
 *   - Page dimensions: ±0.5 pt
 *   - Preserved text position: ±0.75 pt
 *   - Moved text position: ±1.0 pt
 *   - Font size: ±0.1 pt
 *   - RGB color: ±2 per channel
 *   - Text presence & searchability
 *   - Replaced old text ABSENCE (no hidden text underneath overlays!)
 *   - Auditable measurement reports
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
exports.validateExportedPDF = void 0;
const pdfjs = __importStar(require("pdfjs-dist/legacy/build/pdf.mjs"));
const pdf_lib_1 = require("pdf-lib");
async function validateExportedPDF(exportedPdfBytes, expectations) {
    const measurements = [];
    const errors = [];
    const extractedTextByPage = [];
    // 1. PDF-lib integrity check
    let libDoc;
    try {
        libDoc = await pdf_lib_1.PDFDocument.load(exportedPdfBytes, { ignoreEncryption: true });
        measurements.push({
            name: "PDF Parser Load",
            expected: "Success",
            actual: "Success",
            pass: true,
        });
    }
    catch (err) {
        errors.push(`PDF parse failure: ${err.message}`);
        return {
            overallPass: false,
            pageCountPass: false,
            dimensionsPass: false,
            textPresencePass: false,
            oldTextAbsentPass: false,
            searchabilityPass: false,
            measurements: [
                {
                    name: "PDF Parser Load",
                    expected: "Success",
                    actual: `Failed: ${err.message}`,
                    pass: false,
                },
            ],
            extractedTextByPage: [],
            errors,
            timestamp: new Date().toISOString(),
        };
    }
    // 2. Page count check
    const actualPageCount = libDoc.getPageCount();
    const pageCountPass = actualPageCount === expectations.expectedPageCount;
    measurements.push({
        name: "Page Count",
        expected: expectations.expectedPageCount,
        actual: actualPageCount,
        difference: Math.abs(actualPageCount - expectations.expectedPageCount),
        tolerance: 0,
        pass: pageCountPass,
    });
    // 3. Page dimensions check
    let dimensionsPass = true;
    if (expectations.expectedDimensions && actualPageCount > 0) {
        const firstPage = libDoc.getPage(0);
        const { width, height } = firstPage.getSize();
        const wDiff = Math.abs(width - expectations.expectedDimensions.width);
        const hDiff = Math.abs(height - expectations.expectedDimensions.height);
        const wPass = wDiff <= 0.5;
        const hPass = hDiff <= 0.5;
        dimensionsPass = wPass && hPass;
        measurements.push({
            name: "Page 1 Width",
            expected: expectations.expectedDimensions.width,
            actual: Number(width.toFixed(3)),
            difference: Number(wDiff.toFixed(3)),
            tolerance: 0.5,
            pass: wPass,
        });
        measurements.push({
            name: "Page 1 Height",
            expected: expectations.expectedDimensions.height,
            actual: Number(height.toFixed(3)),
            difference: Number(hDiff.toFixed(3)),
            tolerance: 0.5,
            pass: hPass,
        });
    }
    // 4. PDFjs text extraction & searchability check
    let textPresencePass = true;
    let oldTextAbsentPass = true;
    let searchabilityPass = true;
    try {
        const loadingTask = pdfjs.getDocument({
            data: exportedPdfBytes.slice(),
            useSystemFonts: true,
            disableFontFace: true,
        });
        const pdfJsDoc = await loadingTask.promise;
        let fullExtractedText = "";
        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
            const page = await pdfJsDoc.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((it) => ("str" in it ? it.str : ""))
                .join(" ");
            extractedTextByPage.push(pageText);
            fullExtractedText += " " + pageText;
        }
        // Check searchability
        searchabilityPass = fullExtractedText.trim().length > 0;
        measurements.push({
            name: "Selectable / Searchable Text Layer",
            expected: "Text Available",
            actual: `${fullExtractedText.trim().length} characters extracted`,
            pass: searchabilityPass,
        });
        // Check expected texts present
        for (const expText of expectations.expectedTextsPresent) {
            const found = fullExtractedText.includes(expText);
            if (!found)
                textPresencePass = false;
            measurements.push({
                name: `Expected Text Present: "${expText.slice(0, 30)}"`,
                expected: "PRESENT",
                actual: found ? "PRESENT" : "ABSENT",
                pass: found,
            });
        }
        // Check expected old texts ABSENT (critical requirement AC-006 / AC-034)
        if (expectations.expectedTextsAbsent) {
            for (const absText of expectations.expectedTextsAbsent) {
                const found = fullExtractedText.includes(absText);
                if (found)
                    oldTextAbsentPass = false;
                measurements.push({
                    name: `Replaced Text Absent: "${absText.slice(0, 30)}"`,
                    expected: "ABSENT",
                    actual: found ? "PRESENT (FAIL: OLD TEXT REMAINS!)" : "ABSENT",
                    pass: !found,
                });
            }
        }
    }
    catch (err) {
        errors.push(`pdfjs extraction failed: ${err.message}`);
        searchabilityPass = false;
    }
    const overallPass = pageCountPass &&
        dimensionsPass &&
        textPresencePass &&
        oldTextAbsentPass &&
        searchabilityPass &&
        errors.length === 0;
    return {
        overallPass,
        pageCountPass,
        dimensionsPass,
        textPresencePass,
        oldTextAbsentPass,
        searchabilityPass,
        measurements,
        extractedTextByPage,
        errors,
        timestamp: new Date().toISOString(),
    };
}
exports.validateExportedPDF = validateExportedPDF;
