"use strict";
/**
 * lib/pdf-editor/engine/analyzer.ts
 *
 * Dedicated PDF Analysis / Reverse Engineering Layer.
 * Analyzes uploaded PDF documents and constructs the canonical isomorphic
 * PDFDocumentModel with accurate top-left page coordinates, font analysis,
 * image extraction, vector shapes, and content stream bindings.
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePDF = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const pdfjs = __importStar(require("pdfjs-dist/legacy/build/pdf.mjs"));
const pdf_lib_1 = require("pdf-lib");
const geometry_1 = require("../model/geometry");
const content_stream_1 = require("./content-stream");
async function analyzePDF(pdfBytes) {
    const pdfDoc = await pdf_lib_1.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const loadingTask = pdfjs.getDocument({
        data: pdfBytes.slice(),
        useSystemFonts: true,
        disableFontFace: true,
    });
    const pdfJsDoc = await loadingTask.promise;
    const docId = `doc_${node_crypto_1.default.randomBytes(8).toString("hex")}`;
    const pages = [];
    const fonts = {};
    const imageHashCounts = new Map();
    // Pass 1: Global Font and Image Analysis from PDF Document Catalog
    for (let pageIdx = 0; pageIdx < pdfDoc.getPageCount(); pageIdx++) {
        const pageNode = pdfDoc.getPage(pageIdx).node;
        const resources = pageNode.Resources();
        if (!resources)
            continue;
        // Font dictionary
        const fontDict = resources.get(pdf_lib_1.PDFName.of("Font"));
        if (fontDict instanceof pdf_lib_1.PDFDict) {
            for (const [keyName, fontRef] of fontDict.entries()) {
                const k = keyName.asString().replace(/^\//, "");
                if (!fonts[k]) {
                    const fontObj = pdfDoc.context.lookup(fontRef);
                    let baseFont = "Helvetica";
                    let subtype = "Type1";
                    let isEmbedded = false;
                    if (fontObj instanceof pdf_lib_1.PDFDict) {
                        const bf = fontObj.get(pdf_lib_1.PDFName.of("BaseFont"));
                        if (bf instanceof pdf_lib_1.PDFName)
                            baseFont = bf.asString().replace(/^\//, "");
                        const st = fontObj.get(pdf_lib_1.PDFName.of("Subtype"));
                        if (st instanceof pdf_lib_1.PDFName)
                            subtype = st.asString().replace(/^\//, "");
                        isEmbedded = Boolean(fontObj.get(pdf_lib_1.PDFName.of("FontDescriptor")));
                    }
                    const cleanFamily = baseFont.replace(/^[A-Z]{6}\+/, "").split("-")[0] || "Helvetica";
                    const isBold = /bold/i.test(baseFont);
                    const isItalic = /italic|oblique/i.test(baseFont);
                    fonts[k] = {
                        key: k,
                        baseFont,
                        family: cleanFamily,
                        subtype,
                        weight: isBold ? "bold" : "normal",
                        style: isItalic ? "italic" : "normal",
                        embedded: isEmbedded,
                        subset: /^[A-Z]{6}\+/.test(baseFont),
                        encoding: "WinAnsiEncoding",
                        hasToUnicode: false,
                        source: "original",
                    };
                }
            }
        }
    }
    // Pass 2: Per-page deep structural inspection
    for (let pageIdx = 0; pageIdx < pdfJsDoc.numPages; pageIdx++) {
        const jsPage = await pdfJsDoc.getPage(pageIdx + 1);
        const libPage = pdfDoc.getPage(pageIdx);
        const { width: pageWidth, height: pageHeight } = libPage.getSize();
        const rotationRaw = libPage.getRotation().angle;
        const rotation = ([0, 90, 180, 270].includes(rotationRaw)
            ? rotationRaw
            : 0);
        const pageId = `page_${pageIdx + 1}_${node_crypto_1.default.randomBytes(4).toString("hex")}`;
        const pageElements = [];
        // Parse Content Stream for operators & operands
        let rawOps = [];
        const contents = libPage.node.Contents();
        if (contents instanceof pdf_lib_1.PDFRawStream || contents instanceof pdf_lib_1.PDFStream) {
            const filterObj = contents.dict.get(pdf_lib_1.PDFName.of("Filter"));
            const filters = [];
            if (filterObj instanceof pdf_lib_1.PDFName) {
                filters.push(filterObj.asString());
            }
            else if (filterObj instanceof pdf_lib_1.PDFArray) {
                for (let i = 0; i < filterObj.size(); i++) {
                    const item = filterObj.get(i);
                    if (item instanceof pdf_lib_1.PDFName)
                        filters.push(item.asString());
                }
            }
            else if (Array.isArray(filterObj)) {
                filterObj.forEach((f) => {
                    if (f instanceof pdf_lib_1.PDFName)
                        filters.push(f.asString());
                    else if (typeof f === "string")
                        filters.push(f);
                });
            }
            else if (filterObj) {
                const s = filterObj.toString();
                if (s.includes("ASCII85"))
                    filters.push("ASCII85Decode");
                if (s.includes("Flate"))
                    filters.push("FlateDecode");
            }
            const streamBytes = typeof contents.getContents === "function"
                ? contents.getContents()
                : contents.asUint8Array();
            const decompressed = (0, content_stream_1.decompressContentStream)(streamBytes, filters);
            rawOps = (0, content_stream_1.tokenizeContentStream)(decompressed);
        }
        // 2.1 Content Stream Graphics & Text State Machine
        let ctm = [1, 0, 0, 1, 0, 0];
        const ctmStack = [];
        let curFont = "F1";
        let curFontSize = 12;
        let curColor = { r: 0, g: 0, b: 0 };
        let textMatrix = [1, 0, 0, 1, 0, 0];
        let lineMatrix = [1, 0, 0, 1, 0, 0];
        let leading = 12;
        let zCounter = 10;
        for (let opIdx = 0; opIdx < rawOps.length; opIdx++) {
            const op = rawOps[opIdx];
            if (op.op === "q") {
                ctmStack.push([...ctm]);
            }
            else if (op.op === "Q") {
                if (ctmStack.length > 0)
                    ctm = ctmStack.pop();
            }
            else if (op.op === "cm" && op.operands.length === 6) {
                const [a, b, c, d, e, f] = op.operands;
                ctm = [
                    ctm[0] * a + ctm[2] * b,
                    ctm[1] * a + ctm[3] * b,
                    ctm[0] * c + ctm[2] * d,
                    ctm[1] * c + ctm[3] * d,
                    ctm[0] * e + ctm[2] * f + ctm[4],
                    ctm[1] * e + ctm[3] * f + ctm[5],
                ];
            }
            else if (op.op === "rg" && op.operands.length === 3) {
                curColor = {
                    r: (0, geometry_1.clampByte)(op.operands[0] * 255),
                    g: (0, geometry_1.clampByte)(op.operands[1] * 255),
                    b: (0, geometry_1.clampByte)(op.operands[2] * 255),
                };
            }
            else if (op.op === "g" && op.operands.length === 1) {
                const val = (0, geometry_1.clampByte)(op.operands[0] * 255);
                curColor = { r: val, g: val, b: val };
            }
            else if (op.op === "BT") {
                textMatrix = [1, 0, 0, 1, 0, 0];
                lineMatrix = [1, 0, 0, 1, 0, 0];
            }
            else if (op.op === "Tf" && op.operands.length >= 2) {
                const fName = typeof op.operands[0] === "object" && op.operands[0] !== null && "name" in op.operands[0]
                    ? op.operands[0].name
                    : String(op.operands[0]);
                curFont = fName;
                curFontSize = Number(op.operands[1]) || 12;
            }
            else if (op.op === "TL" && op.operands.length >= 1) {
                leading = Number(op.operands[0]) || 12;
            }
            else if (op.op === "Tm" && op.operands.length === 6) {
                textMatrix = op.operands;
                lineMatrix = [...textMatrix];
            }
            else if (op.op === "Td" && op.operands.length === 2) {
                const tx = Number(op.operands[0]);
                const ty = Number(op.operands[1]);
                textMatrix[4] = lineMatrix[4] + tx;
                textMatrix[5] = lineMatrix[5] + ty;
                lineMatrix = [...textMatrix];
            }
            else if (op.op === "T*") {
                textMatrix[5] = lineMatrix[5] - leading;
                lineMatrix = [...textMatrix];
            }
            else if (op.op === "Tj" || op.op === "TJ") {
                let str = "";
                if (op.op === "Tj" && typeof op.operands[0] === "string") {
                    str = op.operands[0];
                }
                else if (op.op === "TJ" && Array.isArray(op.operands[0])) {
                    str = op.operands[0]
                        .filter((p) => typeof p === "string")
                        .join("");
                }
                if (str.trim()) {
                    const pdfX = textMatrix[4] * ctm[0] + textMatrix[5] * ctm[2] + ctm[4];
                    const pdfY = textMatrix[4] * ctm[1] + textMatrix[5] * ctm[3] + ctm[5];
                    const topY = pageHeight - pdfY - curFontSize;
                    const w = Math.max(str.length * curFontSize * 0.52, 20);
                    const fontDef = fonts[curFont] || {
                        family: "Helvetica",
                        weight: /f2|bold/i.test(curFont) ? "bold" : "normal",
                        style: "normal",
                    };
                    const isHeading = curFontSize >= 14 || /title|heading|offer/i.test(str);
                    pageElements.push({
                        id: `txt_${pageIdx + 1}_${pageElements.length + 1}`,
                        pageId,
                        kind: "text",
                        text: str,
                        lines: [
                            {
                                text: str,
                                x: pdfX,
                                baseline: topY + curFontSize * 0.8,
                                width: w,
                                runs: [
                                    {
                                        text: str,
                                        fontKey: curFont,
                                        fontSize: curFontSize,
                                        color: { ...curColor },
                                    },
                                ],
                            },
                        ],
                        bbox: (0, geometry_1.roundRect)({
                            x: pdfX,
                            y: topY,
                            width: w,
                            height: curFontSize * 1.2,
                        }),
                        rotation: 0,
                        origin: "native",
                        zIndex: zCounter++,
                        editable: true,
                        limitations: [],
                        fontKey: curFont,
                        fontFamily: fontDef.family,
                        fontSize: curFontSize,
                        fontWeight: fontDef.weight,
                        fontStyle: fontDef.style,
                        color: { ...curColor },
                        alignment: "left",
                        lineHeight: curFontSize * 1.2,
                        charSpacing: 0,
                        wordSpacing: 0,
                        layout: "positioned",
                        confidence: 1.0,
                        renderMode: 0,
                        role: isHeading ? "heading" : "body",
                        source: { opIndices: [opIdx], initialX: pdfX, initialY: topY },
                    });
                }
            }
        }
        // 2.2 Vector Shape Extraction from Content Stream (Rectangles, Paths, Panels, Accent bars)
        let curFillColor = { r: 0, g: 0, b: 0 };
        let curStrokeColor = { r: 0, g: 0, b: 0 };
        let curLineWidth = 1.0;
        for (let opIdx = 0; opIdx < rawOps.length; opIdx++) {
            const op = rawOps[opIdx];
            if (op.op === "rg" && op.operands.length === 3) {
                curFillColor = {
                    r: (0, geometry_1.clampByte)(op.operands[0] * 255),
                    g: (0, geometry_1.clampByte)(op.operands[1] * 255),
                    b: (0, geometry_1.clampByte)(op.operands[2] * 255),
                };
            }
            else if (op.op === "RG" && op.operands.length === 3) {
                curStrokeColor = {
                    r: (0, geometry_1.clampByte)(op.operands[0] * 255),
                    g: (0, geometry_1.clampByte)(op.operands[1] * 255),
                    b: (0, geometry_1.clampByte)(op.operands[2] * 255),
                };
            }
            else if (op.op === "g" && op.operands.length === 1) {
                const val = (0, geometry_1.clampByte)(op.operands[0] * 255);
                curFillColor = { r: val, g: val, b: val };
            }
            else if (op.op === "G" && op.operands.length === 1) {
                const val = (0, geometry_1.clampByte)(op.operands[0] * 255);
                curStrokeColor = { r: val, g: val, b: val };
            }
            else if (op.op === "w" && op.operands.length >= 1) {
                curLineWidth = Number(op.operands[0]) || 1.0;
            }
            else if (op.op === "re" && op.operands.length === 4) {
                // Rectangle in PDF bottom-left coordinates: [x, y, w, h]
                const rx = Number(op.operands[0]);
                const ry = Number(op.operands[1]);
                const rw = Number(op.operands[2]);
                const rh = Number(op.operands[3]);
                // Convert to top-left coordinates
                const topY = pageHeight - ry - rh;
                // Check subsequent operator for fill/stroke
                const nextOp = rawOps[opIdx + 1]?.op || "";
                const isFill = nextOp.startsWith("f") || nextOp.startsWith("F") || nextOp.startsWith("B") || nextOp.startsWith("b");
                const isStroke = nextOp.startsWith("S") || nextOp.startsWith("s") || nextOp.startsWith("B") || nextOp.startsWith("b");
                // Classify role
                let role = "panel";
                if (rh <= 15 && rw >= pageWidth * 0.8) {
                    role = "accent"; // Top gold accent bar!
                }
                else if (rh >= 200 && rw >= pageWidth * 0.8) {
                    role = "background"; // Dark cover panel!
                }
                else if (rh <= 2) {
                    role = "divider";
                }
                pageElements.push({
                    id: `shp_${pageIdx + 1}_${pageElements.length + 1}`,
                    pageId,
                    kind: "shape",
                    shapeType: "rect",
                    bbox: (0, geometry_1.roundRect)({ x: rx, y: topY, width: rw, height: rh }),
                    rotation: 0,
                    origin: "native",
                    zIndex: zCounter++,
                    editable: true,
                    limitations: [],
                    fill: isFill ? { ...curFillColor } : null,
                    stroke: isStroke ? { ...curStrokeColor } : null,
                    lineWidth: curLineWidth,
                    paint: isFill && isStroke ? "fillStroke" : isFill ? "fill" : "stroke",
                    evenOdd: nextOp.includes("*"),
                    role,
                    source: { opIndices: [opIdx, opIdx + 1] },
                });
            }
        }
        // 2.3 Image Extraction via /XObject & `Do` operators
        let curMatrix = [1, 0, 0, 1, 0, 0];
        const matrixStack = [];
        for (let opIdx = 0; opIdx < rawOps.length; opIdx++) {
            const op = rawOps[opIdx];
            if (op.op === "q") {
                matrixStack.push([...curMatrix]);
            }
            else if (op.op === "Q") {
                if (matrixStack.length > 0)
                    curMatrix = matrixStack.pop();
            }
            else if (op.op === "cm" && op.operands.length === 6) {
                // Multiply CTM
                curMatrix = [
                    Number(op.operands[0]),
                    Number(op.operands[1]),
                    Number(op.operands[2]),
                    Number(op.operands[3]),
                    Number(op.operands[4]),
                    Number(op.operands[5]),
                ];
            }
            else if (op.op === "Do" && op.operands.length >= 1) {
                const xobjName = typeof op.operands[0] === "object" && op.operands[0] !== null && "name" in op.operands[0]
                    ? op.operands[0].name
                    : String(op.operands[0]);
                // Position in PDF space: curMatrix = [w, 0, 0, h, x, y]
                const imgW = Math.abs(curMatrix[0]) || 80;
                const imgH = Math.abs(curMatrix[3]) || 80;
                const imgX = curMatrix[4];
                const imgY = pageHeight - curMatrix[5] - imgH;
                const imgHash = node_crypto_1.default.createHash("sha256").update(xobjName).digest("hex").slice(0, 16);
                imageHashCounts.set(imgHash, (imageHashCounts.get(imgHash) || 0) + 1);
                pageElements.push({
                    id: `img_${pageIdx + 1}_${pageElements.length + 1}`,
                    pageId,
                    kind: "image",
                    bbox: (0, geometry_1.roundRect)({ x: imgX, y: imgY, width: imgW, height: imgH }),
                    rotation: 0,
                    origin: "native",
                    zIndex: zCounter++,
                    editable: true,
                    limitations: [],
                    sourceType: "embedded",
                    mimeType: "image/jpeg",
                    originalWidth: 500,
                    originalHeight: 500,
                    xobjectRef: xobjName,
                    sharedCount: 1,
                    imageHash: imgHash,
                    flipH: false,
                    flipV: false,
                    source: { opIndices: [opIdx] },
                });
            }
        }
        // Update sharedCount for images
        for (const el of pageElements) {
            if (el.kind === "image" && el.imageHash) {
                el.sharedCount = imageHashCounts.get(el.imageHash) || 1;
            }
        }
        // Determine page background color (if any full-page shape exists)
        const bgShape = pageElements.find((e) => e.kind === "shape" && e.bbox.width >= pageWidth * 0.95 && e.bbox.height >= pageHeight * 0.95);
        pages.push({
            id: pageId,
            sourceIndex: pageIdx,
            width: pageWidth,
            height: pageHeight,
            rotation,
            elements: pageElements,
            tables: [],
            hasNativeText: pageElements.some((e) => e.kind === "text"),
            isScanned: !pageElements.some((e) => e.kind === "text") && pageElements.some((e) => e.kind === "image"),
            ocrStatus: pageElements.some((e) => e.kind === "text") ? "not-needed" : "available",
            background: bgShape ? bgShape.fill : null,
            warnings: [],
        });
    }
    // Pass 3: Extract Metadata
    const metadata = {
        title: pdfDoc.getTitle() || undefined,
        author: pdfDoc.getAuthor() || undefined,
        subject: pdfDoc.getSubject() || undefined,
        creator: pdfDoc.getCreator() || undefined,
        producer: pdfDoc.getProducer() || undefined,
        creationDate: pdfDoc.getCreationDate()?.toISOString(),
        modificationDate: pdfDoc.getModificationDate()?.toISOString(),
    };
    return {
        id: docId,
        analysisVersion: 1,
        pages,
        fonts,
        metadata,
        assets: {},
        report: {
            unidentified: [],
            warnings: [],
            formXObjects: 0,
            annotations: 0,
            hasAcroForm: false,
            encrypted: false,
        },
    };
}
exports.analyzePDF = analyzePDF;
