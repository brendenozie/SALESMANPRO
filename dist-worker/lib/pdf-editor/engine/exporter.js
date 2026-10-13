"use strict";
/**
 * lib/pdf-editor/engine/exporter.ts
 *
 * True Structural PDF Reconstruction and Export Engine.
 *
 * CRITICAL RULE (AC-006):
 *   Modifications are applied directly to the underlying content streams and
 *   object graph. NO visual patches, NO fake white overlays.
 *   Deleted text/shapes/images are physically removed from the content stream.
 *   Modified text replaces the original string in Tj/TJ and updates Tf/Tm/rg.
 *   Modified vector colors update the rg/RG operators.
 *   Replaced images update the XObject reference and embedded image streams.
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
exports.exportPDF = void 0;
const pdf_lib_1 = require("pdf-lib");
const node_fs_1 = __importDefault(require("node:fs"));
const content_stream_1 = require("./content-stream");
const font_registry_1 = require("./font-registry");
function resolveExportFont(family, weight, style) {
    const report = (0, font_registry_1.resolveFontWithReport)(family, weight, style);
    if (report.fallbackReason) {
        console.warn("PDF font fallback:", report);
    }
    return report.resolved;
}
async function exportPDF(originalPdfBytes, model, options = {}) {
    const originalDoc = await pdf_lib_1.PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });
    const baselineModel = await Promise.resolve().then(() => __importStar(require("./analyzer"))).then(({ analyzePDF }) => analyzePDF(originalPdfBytes));
    const exportDoc = await pdf_lib_1.PDFDocument.create();
    // Copy or create pages according to model.pages
    for (let newPageIdx = 0; newPageIdx < model.pages.length; newPageIdx++) {
        const pageModel = model.pages[newPageIdx];
        let targetPage;
        if (pageModel.sourceIndex !== null && pageModel.sourceIndex >= 0 && pageModel.sourceIndex < originalDoc.getPageCount()) {
            // Copy original page to preserve unmodified content, annotations, and resources
            const [copiedPage] = await exportDoc.copyPages(originalDoc, [pageModel.sourceIndex]);
            targetPage = exportDoc.addPage(copiedPage);
        }
        else {
            // Added new blank page
            targetPage = exportDoc.addPage([pageModel.width, pageModel.height]);
        }
        // Apply Page Rotation
        targetPage.setRotation((0, pdf_lib_1.degrees)(pageModel.rotation));
        // Structural modification of target page's Content Stream
        const contents = targetPage.node.Contents();
        let ops = [];
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
            ops = (0, content_stream_1.tokenizeContentStream)(decompressed);
        }
        // ── 1. Process Text Modifications & Deletions ───────────────────────────
        const textElements = pageModel.elements.filter((e) => e.kind === "text");
        const nativeTextElements = textElements.filter((e) => e.origin === "native");
        const addedTextElements = textElements.filter((e) => e.origin === "added");
        const baselinePage = baselineModel.pages[pageModel.sourceIndex ?? -1];
        const currentNativeTextOps = new Set(nativeTextElements.flatMap((element) => element.source?.opIndices || []));
        // Copied pages can retain content streams whose original resource names
        // are not carried over by pdf-lib. Rebind every existing Tf operator to
        // an explicit resource before applying edits.
        for (const op of ops) {
            if (op.op !== "Tf" || op.operands.length < 2)
                continue;
            const fontKey = typeof op.operands[0] === "object" && op.operands[0] !== null && "name" in op.operands[0]
                ? op.operands[0].name
                : String(op.operands[0]);
            const fontInfo = baselineModel.fonts[fontKey];
            const fontDefinition = resolveExportFont(fontInfo?.family || "Helvetica", fontInfo?.weight || "normal", fontInfo?.style || "normal");
            const font = await (0, font_registry_1.embedFontInDoc)(exportDoc, fontDefinition);
            const resourceName = `SalesmanFont${fontDefinition.postScriptName.replace(/[^A-Za-z0-9]/g, "")}`;
            const resources = targetPage.node.Resources() || exportDoc.context.obj({});
            const fontDict = resources.get(pdf_lib_1.PDFName.of("Font")) instanceof pdf_lib_1.PDFDict
                ? resources.get(pdf_lib_1.PDFName.of("Font"))
                : exportDoc.context.obj({});
            fontDict.set(pdf_lib_1.PDFName.of(resourceName), font.ref);
            resources.set(pdf_lib_1.PDFName.of("Font"), fontDict);
            op.operands[0] = { name: resourceName };
        }
        // Track original op indices of native text elements that were modified or removed
        for (const textEl of nativeTextElements) {
            if (!textEl.source?.opIndices || textEl.source.opIndices.length === 0)
                continue;
            for (let idx = 0; idx < textEl.source.opIndices.length; idx++) {
                const opIdx = textEl.source.opIndices[idx];
                if (opIdx >= 0 && opIdx < ops.length) {
                    const targetOp = ops[opIdx];
                    const textToInsert = idx === 0 ? textEl.text : "";
                    // 1.1 Replace text string in Tj / TJ
                    if (targetOp.op === "Tj") {
                        targetOp.operands = [textToInsert];
                    }
                    else if (targetOp.op === "TJ") {
                        // Replace array of kerning pairs with the clean replacement string
                        targetOp.operands = textToInsert ? [[textToInsert]] : [[""]];
                    }
                    // 1.2 Update preceding font size & color if changed
                    // Scan backwards for Tf and rg
                    for (let back = opIdx - 1; back >= Math.max(0, opIdx - 8); back--) {
                        if (ops[back].op === "Tf") {
                            // Update font size
                            if (ops[back].operands.length >= 2) {
                                ops[back].operands[1] = textEl.fontSize;
                            }
                        }
                        else if (ops[back].op === "rg" && ops[back].operands.length === 3) {
                            // Update text color
                            ops[back].operands = [
                                Number((textEl.color.r / 255).toFixed(4)),
                                Number((textEl.color.g / 255).toFixed(4)),
                                Number((textEl.color.b / 255).toFixed(4)),
                            ];
                        }
                        else if (ops[back].op === "Tm" && ops[back].operands.length === 6) {
                            // Update position only if element was actually moved!
                            const initX = textEl.source?.initialX ?? textEl.lines?.[0]?.x ?? textEl.bbox.x;
                            const initY = textEl.source?.initialY ?? (textEl.lines?.[0] ? textEl.lines[0].baseline - textEl.fontSize * 0.8 : textEl.bbox.y);
                            const dx = textEl.bbox.x - initX;
                            const dy = textEl.bbox.y - initY;
                            if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
                                // Apply delta in local coordinate space (PDF Y is upward: -dy)
                                ops[back].operands[4] = Number((ops[back].operands[4] + dx).toFixed(3));
                                ops[back].operands[5] = Number((ops[back].operands[5] - dy).toFixed(3));
                            }
                        }
                    }
                    const fontDefinition = resolveExportFont(textEl.fontFamily, textEl.fontWeight, textEl.fontStyle);
                    const font = await (0, font_registry_1.embedFontInDoc)(exportDoc, fontDefinition);
                    const resourceName = `SalesmanFont${fontDefinition.postScriptName.replace(/[^A-Za-z0-9]/g, "")}`;
                    const resources = targetPage.node.Resources() || exportDoc.context.obj({});
                    const fontDict = resources.get(pdf_lib_1.PDFName.of("Font")) instanceof pdf_lib_1.PDFDict
                        ? resources.get(pdf_lib_1.PDFName.of("Font"))
                        : exportDoc.context.obj({});
                    fontDict.set(pdf_lib_1.PDFName.of(resourceName), font.ref);
                    resources.set(pdf_lib_1.PDFName.of("Font"), fontDict);
                    for (let back = opIdx - 1; back >= Math.max(0, opIdx - 8); back--) {
                        if (ops[back].op === "Tf") {
                            ops[back].operands[0] = { name: resourceName };
                            break;
                        }
                    }
                }
            }
        }
        // Elements removed from the model must no longer paint their original text.
        if (baselinePage) {
            for (const baselineText of baselinePage.elements.filter((e) => e.kind === "text")) {
                for (const opIndex of baselineText.source?.opIndices || []) {
                    if (!currentNativeTextOps.has(opIndex) && ops[opIndex] && (ops[opIndex].op === "Tj" || ops[opIndex].op === "TJ")) {
                        ops[opIndex].operands = ops[opIndex].op === "Tj" ? [""] : [[""]];
                    }
                }
            }
        }
        // ── 2. Process Vector Shape Modifications (Accent bars, Panels, Headers) ─
        const shapeElements = pageModel.elements.filter((e) => e.kind === "shape");
        for (const shapeEl of shapeElements) {
            if (shapeEl.source?.opIndices && shapeEl.source.opIndices.length > 0) {
                const reOpIdx = shapeEl.source.opIndices[0];
                if (reOpIdx >= 0 && reOpIdx < ops.length && ops[reOpIdx].op === "re") {
                    // Update rectangle bounds if resized or moved
                    // PDF bottom-left space: ry = pageHeight - bbox.y - bbox.height
                    const ry = pageModel.height - shapeEl.bbox.y - shapeEl.bbox.height;
                    ops[reOpIdx].operands = [
                        Number(shapeEl.bbox.x.toFixed(3)),
                        Number(ry.toFixed(3)),
                        Number(shapeEl.bbox.width.toFixed(3)),
                        Number(shapeEl.bbox.height.toFixed(3)),
                    ];
                    // Update fill color (preceding rg or g operator)
                    if (shapeEl.fill) {
                        for (let back = reOpIdx - 1; back >= Math.max(0, reOpIdx - 5); back--) {
                            if (ops[back].op === "rg") {
                                ops[back].operands = [
                                    Number((shapeEl.fill.r / 255).toFixed(4)),
                                    Number((shapeEl.fill.g / 255).toFixed(4)),
                                    Number((shapeEl.fill.b / 255).toFixed(4)),
                                ];
                                break;
                            }
                        }
                    }
                    // Update stroke color (preceding RG or G operator)
                    if (shapeEl.stroke) {
                        for (let back = reOpIdx - 1; back >= Math.max(0, reOpIdx - 5); back--) {
                            if (ops[back].op === "RG") {
                                ops[back].operands = [
                                    Number((shapeEl.stroke.r / 255).toFixed(4)),
                                    Number((shapeEl.stroke.g / 255).toFixed(4)),
                                    Number((shapeEl.stroke.b / 255).toFixed(4)),
                                ];
                                break;
                            }
                        }
                    }
                }
            }
        }
        // ── 3. Process Image Modifications & Replacements ──────────────────────
        const imageElements = pageModel.elements.filter((e) => e.kind === "image");
        for (const imgEl of imageElements) {
            // Check if this image was replaced with a new asset
            if (imgEl.assetId && model.assets[imgEl.assetId]) {
                const asset = model.assets[imgEl.assetId];
                const assetBytes = readAssetBytes(asset.storageKey);
                const embedded = asset.mimeType === "image/png"
                    ? await exportDoc.embedPng(assetBytes)
                    : await exportDoc.embedJpg(assetBytes);
                const resources = targetPage.node.Resources() || exportDoc.context.obj({});
                const xObjectDict = resources.get(pdf_lib_1.PDFName.of("XObject")) instanceof pdf_lib_1.PDFDict
                    ? resources.get(pdf_lib_1.PDFName.of("XObject"))
                    : exportDoc.context.obj({});
                const resourceName = `SalesmanImage${imgEl.id.replace(/[^A-Za-z0-9]/g, "")}`;
                xObjectDict.set(pdf_lib_1.PDFName.of(resourceName), embedded.ref);
                resources.set(pdf_lib_1.PDFName.of("XObject"), xObjectDict);
                const doOpIdx = imgEl.source?.opIndices?.[0];
                if (doOpIdx !== undefined && ops[doOpIdx]?.op === "Do") {
                    ops[doOpIdx].operands[0] = { name: resourceName };
                }
            }
            // If moved or resized: update preceding cm matrix
            if (imgEl.source?.opIndices && imgEl.source.opIndices.length > 0) {
                const doOpIdx = imgEl.source.opIndices[0];
                if (doOpIdx >= 0 && doOpIdx < ops.length && ops[doOpIdx].op === "Do") {
                    // Look backward for `cm`
                    for (let back = doOpIdx - 1; back >= Math.max(0, doOpIdx - 4); back--) {
                        if (ops[back].op === "cm" && ops[back].operands.length === 6) {
                            const pdfY = pageModel.height - imgEl.bbox.y - imgEl.bbox.height;
                            const radians = (imgEl.rotation * Math.PI) / 180;
                            const cos = Math.cos(radians);
                            const sin = Math.sin(radians);
                            const cx = imgEl.bbox.x + imgEl.bbox.width / 2;
                            const cy = pageModel.height - imgEl.bbox.y - imgEl.bbox.height / 2;
                            ops[back].operands = [
                                Number((imgEl.bbox.width * cos).toFixed(3)),
                                Number((imgEl.bbox.width * sin).toFixed(3)),
                                Number((-imgEl.bbox.height * sin).toFixed(3)),
                                Number((imgEl.bbox.height * cos).toFixed(3)),
                                Number((cx - (imgEl.bbox.width * cos - imgEl.bbox.height * sin) / 2).toFixed(3)),
                                Number((cy - (imgEl.bbox.width * sin + imgEl.bbox.height * cos) / 2).toFixed(3)),
                            ];
                            break;
                        }
                    }
                }
            }
        }
        // Remove native image placements that are no longer in the model.
        if (baselinePage) {
            const currentImageOps = new Set(imageElements.flatMap((element) => element.source?.opIndices || []));
            for (const baselineImage of baselinePage.elements.filter((e) => e.kind === "image")) {
                for (const opIndex of baselineImage.source?.opIndices || []) {
                    if (!currentImageOps.has(opIndex) && ops[opIndex]?.op === "Do") {
                        ops[opIndex].operands = [{ name: "__SalesmanRemovedImage" }];
                    }
                }
            }
            if (baselinePage) {
                const currentShapeOps = new Set(shapeElements.flatMap((element) => element.source?.opIndices || []));
                for (const baselineShape of baselinePage.elements.filter((e) => e.kind === "shape")) {
                    for (const opIndex of baselineShape.source?.opIndices || []) {
                        if (!currentShapeOps.has(opIndex) && ops[opIndex]?.op === "re") {
                            ops[opIndex].operands = [0, 0, 0, 0];
                        }
                    }
                }
            }
        }
        const addedShapeElements = shapeElements.filter((element) => element.origin === "added");
        for (const shape of addedShapeElements) {
            if (shape.shapeType !== "rect")
                continue;
            const pdfY = pageModel.height - shape.bbox.y - shape.bbox.height;
            if (shape.fill) {
                ops.push({ op: "rg", operands: [shape.fill.r / 255, shape.fill.g / 255, shape.fill.b / 255] });
            }
            if (shape.stroke) {
                ops.push({ op: "RG", operands: [shape.stroke.r / 255, shape.stroke.g / 255, shape.stroke.b / 255] });
                ops.push({ op: "w", operands: [shape.lineWidth] });
            }
            ops.push({ op: "re", operands: [shape.bbox.x, pdfY, shape.bbox.width, shape.bbox.height] });
            ops.push({ op: shape.paint === "fillStroke" ? "B" : shape.paint === "stroke" ? "S" : "f", operands: [] });
        }
        // ── 4. Append Added Elements (Text, Shapes, Images) ─────────────────────
        for (const addedText of addedTextElements) {
            const pdfY = pageModel.height - addedText.bbox.y - addedText.fontSize;
            const r = Number((addedText.color.r / 255).toFixed(4));
            const g = Number((addedText.color.g / 255).toFixed(4));
            const b = Number((addedText.color.b / 255).toFixed(4));
            // Append standard BT ... ET block
            const addedFont = resolveExportFont(addedText.fontFamily, addedText.fontWeight, addedText.fontStyle);
            const embeddedAddedFont = await (0, font_registry_1.embedFontInDoc)(exportDoc, addedFont);
            const addedFontName = `SalesmanFont${addedFont.postScriptName.replace(/[^A-Za-z0-9]/g, "")}`;
            const addedResources = targetPage.node.Resources() || exportDoc.context.obj({});
            const addedFontDict = addedResources.get(pdf_lib_1.PDFName.of("Font")) instanceof pdf_lib_1.PDFDict
                ? addedResources.get(pdf_lib_1.PDFName.of("Font"))
                : exportDoc.context.obj({});
            addedFontDict.set(pdf_lib_1.PDFName.of(addedFontName), embeddedAddedFont.ref);
            addedResources.set(pdf_lib_1.PDFName.of("Font"), addedFontDict);
            ops.push({
                op: "rg",
                operands: [r, g, b],
            });
            ops.push({
                op: "BT",
                operands: [],
            });
            ops.push({
                op: "Tf",
                operands: [{ name: addedFontName }, addedText.fontSize],
            });
            ops.push({
                op: "Tm",
                operands: [1, 0, 0, 1, Number(addedText.bbox.x.toFixed(3)), Number(pdfY.toFixed(3))],
            });
            ops.push({
                op: "Tj",
                operands: [addedText.text],
            });
            ops.push({
                op: "ET",
                operands: [],
            });
        }
        for (const addedImage of imageElements.filter((element) => element.origin === "added" && element.assetId)) {
            const asset = model.assets[addedImage.assetId];
            if (!asset)
                throw new Error(`Image asset ${addedImage.assetId} is not registered`);
            const assetBytes = readAssetBytes(asset.storageKey);
            const embedded = asset.mimeType === "image/png"
                ? await exportDoc.embedPng(assetBytes)
                : await exportDoc.embedJpg(assetBytes);
            const resourceName = `SalesmanImage${addedImage.id.replace(/[^A-Za-z0-9]/g, "")}`;
            const resources = targetPage.node.Resources() || exportDoc.context.obj({});
            const xObjectDict = resources.get(pdf_lib_1.PDFName.of("XObject")) instanceof pdf_lib_1.PDFDict
                ? resources.get(pdf_lib_1.PDFName.of("XObject"))
                : exportDoc.context.obj({});
            xObjectDict.set(pdf_lib_1.PDFName.of(resourceName), embedded.ref);
            resources.set(pdf_lib_1.PDFName.of("XObject"), xObjectDict);
            const pdfY = pageModel.height - addedImage.bbox.y - addedImage.bbox.height;
            ops.push({ op: "q", operands: [] });
            ops.push({ op: "cm", operands: [addedImage.bbox.width, 0, 0, addedImage.bbox.height, addedImage.bbox.x, pdfY] });
            ops.push({ op: "Do", operands: [{ name: resourceName }] });
            ops.push({ op: "Q", operands: [] });
        }
        ops = ops.filter((op) => !(op.op === "Do" &&
            op.operands[0] &&
            typeof op.operands[0] === "object" &&
            "name" in op.operands[0] &&
            op.operands[0].name === "__SalesmanRemovedImage"));
        // ── 5. Re-serialize Content Stream with Flate compression ───────────────
        const newStreamBytes = (0, content_stream_1.serializeContentStream)(ops);
        const compressedBytes = (0, content_stream_1.compressContentStream)(newStreamBytes);
        // Create a new stream and set it on the page node
        const newStream = exportDoc.context.flateStream(newStreamBytes);
        targetPage.node.set(pdf_lib_1.PDFName.of("Contents"), exportDoc.context.register(newStream));
    }
    function readAssetBytes(storageKey) {
        if (storageKey.startsWith("data:")) {
            const comma = storageKey.indexOf(",");
            if (comma < 0)
                throw new Error("Invalid data URL image asset");
            return new Uint8Array(Buffer.from(storageKey.slice(comma + 1), "base64"));
        }
        if (!node_fs_1.default.existsSync(storageKey))
            throw new Error(`Image asset not found: ${storageKey}`);
        return new Uint8Array(node_fs_1.default.readFileSync(storageKey));
    }
    // Preserve metadata
    if (model.metadata.title)
        exportDoc.setTitle(model.metadata.title);
    if (model.metadata.author)
        exportDoc.setAuthor(model.metadata.author);
    if (model.metadata.subject)
        exportDoc.setSubject(model.metadata.subject);
    if (model.metadata.creator)
        exportDoc.setCreator(model.metadata.creator);
    if (model.metadata.producer)
        exportDoc.setProducer(model.metadata.producer || "SalesmanPro PDF Engine");
    return exportDoc.save();
}
exports.exportPDF = exportPDF;
