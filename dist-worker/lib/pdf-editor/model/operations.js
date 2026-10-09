"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyRedo = exports.historyUndo = exports.historyApply = exports.createHistory = exports.makeUpdate = exports.findElement = exports.referencedIds = exports.replayOperations = exports.invertOperation = exports.applyOperation = exports.assertPatchValid = exports.OperationError = void 0;
class OperationError extends Error {
    constructor(message) {
        super(message);
        this.name = "OperationError";
    }
}
exports.OperationError = OperationError;
const IMMUTABLE_KEYS = new Set(["id", "kind", "pageId", "origin", "source"]);
const KIND_KEYS = {
    text: new Set([
        "bbox", "rotation", "zIndex", "editable", "limitations", "text", "lines", "fontKey", "fontFamily",
        "fontSize", "fontWeight", "fontStyle", "color", "alignment", "lineHeight", "charSpacing", "wordSpacing",
        "layout", "originalFont", "embeddedFont", "confidence", "renderMode", "fontFallback", "role",
    ]),
    image: new Set([
        "bbox", "rotation", "zIndex", "editable", "limitations", "sourceType", "mimeType", "originalWidth",
        "originalHeight", "xobjectRef", "sharedCount", "imageHash", "assetId", "flipH", "flipV", "crop", "imageData",
    ]),
    shape: new Set([
        "bbox", "rotation", "zIndex", "editable", "limitations", "shapeType", "fill", "stroke", "lineWidth",
        "paint", "evenOdd", "role", "pathData",
    ]),
    link: new Set(["bbox", "rotation", "zIndex", "editable", "limitations"]),
};
/** Throws when a patch touches keys that are immutable or not valid for the element kind. */
function assertPatchValid(element, patch) {
    const allowed = KIND_KEYS[element.kind];
    for (const key of Object.keys(patch)) {
        if (IMMUTABLE_KEYS.has(key))
            throw new OperationError(`Property "${key}" is immutable`);
        if (!allowed.has(key))
            throw new OperationError(`Property "${key}" is not valid for ${element.kind} elements`);
    }
}
exports.assertPatchValid = assertPatchValid;
function findPage(doc, pageId) {
    const idx = doc.pages.findIndex((p) => p.id === pageId);
    if (idx < 0)
        throw new OperationError(`Unknown page ${pageId}`);
    return [doc.pages[idx], idx];
}
function replacePage(doc, idx, page) {
    const pages = doc.pages.slice();
    pages[idx] = page;
    return { ...doc, pages };
}
function sortByZ(elements) {
    return elements.slice().sort((a, b) => a.zIndex - b.zIndex);
}
function applyOperation(doc, op) {
    switch (op.type) {
        case "updateElement": {
            const [page, idx] = findPage(doc, op.pageId);
            const elIdx = page.elements.findIndex((e) => e.id === op.elementId);
            if (elIdx < 0)
                throw new OperationError(`Unknown element ${op.elementId}`);
            const current = page.elements[elIdx];
            if (!current.editable && op.intent !== "ocr") {
                throw new OperationError(`Element ${op.elementId} cannot be structurally edited: ${current.limitations.join("; ")}`);
            }
            assertPatchValid(current, op.patch);
            const next = { ...current, ...op.patch };
            const elements = page.elements.slice();
            elements[elIdx] = next;
            const reorder = op.patch.zIndex !== undefined;
            return replacePage(doc, idx, { ...page, elements: reorder ? sortByZ(elements) : elements });
        }
        case "addElement": {
            const [page, idx] = findPage(doc, op.pageId);
            if (page.elements.some((e) => e.id === op.element.id))
                throw new OperationError(`Duplicate element id ${op.element.id}`);
            if (op.element.pageId !== op.pageId)
                throw new OperationError("Element pageId mismatch");
            return replacePage(doc, idx, { ...page, elements: sortByZ([...page.elements, op.element]) });
        }
        case "deleteElement": {
            const [page, idx] = findPage(doc, op.pageId);
            if (!page.elements.some((e) => e.id === op.elementId))
                throw new OperationError(`Unknown element ${op.elementId}`);
            return replacePage(doc, idx, { ...page, elements: page.elements.filter((e) => e.id !== op.elementId) });
        }
        case "addPage": {
            if (doc.pages.some((p) => p.id === op.page.id))
                throw new OperationError(`Duplicate page id ${op.page.id}`);
            const pages = doc.pages.slice();
            pages.splice(Math.max(0, Math.min(op.index, pages.length)), 0, op.page);
            return { ...doc, pages };
        }
        case "deletePage": {
            if (doc.pages.length <= 1)
                throw new OperationError("A document must keep at least one page");
            return { ...doc, pages: doc.pages.filter((p) => p.id !== op.page.id) };
        }
        case "movePage": {
            const n = doc.pages.length;
            if (op.from < 0 || op.from >= n || op.to < 0 || op.to >= n)
                throw new OperationError("Page index out of range");
            const pages = doc.pages.slice();
            const [moved] = pages.splice(op.from, 1);
            pages.splice(op.to, 0, moved);
            return { ...doc, pages };
        }
        case "updatePage": {
            const [page, idx] = findPage(doc, op.pageId);
            if (op.patch.rotation !== undefined && ![0, 90, 180, 270].includes(op.patch.rotation)) {
                throw new OperationError("Page rotation must be 0, 90, 180 or 270");
            }
            return replacePage(doc, idx, { ...page, ...op.patch });
        }
        case "registerAsset": {
            return { ...doc, assets: { ...doc.assets, [op.asset.id]: op.asset } };
        }
        case "batch": {
            return op.operations.reduce(applyOperation, doc);
        }
    }
}
exports.applyOperation = applyOperation;
/** Returns the exact inverse of an operation (assets are append-only and never un-registered). */
function invertOperation(op) {
    switch (op.type) {
        case "updateElement":
            return { ...op, patch: op.previous, previous: op.patch };
        case "addElement":
            return { type: "deleteElement", pageId: op.pageId, elementId: op.element.id, element: op.element, index: -1 };
        case "deleteElement":
            return { type: "addElement", pageId: op.pageId, element: op.element };
        case "addPage":
            return { type: "deletePage", page: op.page, index: op.index };
        case "deletePage":
            return { type: "addPage", page: op.page, index: op.index };
        case "movePage":
            return { type: "movePage", from: op.to, to: op.from };
        case "updatePage":
            return { ...op, patch: op.previous, previous: op.patch };
        case "registerAsset":
            return { type: "batch", label: "noop", operations: [] };
        case "batch":
            return { type: "batch", label: `undo ${op.label}`, operations: op.operations.slice().reverse().map(invertOperation) };
    }
}
exports.invertOperation = invertOperation;
function replayOperations(base, ops) {
    return ops.reduce(applyOperation, base);
}
exports.replayOperations = replayOperations;
/** Collects every element id referenced by an operation (for server-side authorisation checks). */
function referencedIds(op) {
    const out = { pageIds: [], elementIds: [], assetIds: [] };
    const visit = (o) => {
        switch (o.type) {
            case "updateElement":
                out.pageIds.push(o.pageId);
                out.elementIds.push(o.elementId);
                if (o.patch.assetId)
                    out.assetIds.push(o.patch.assetId);
                break;
            case "addElement":
                out.pageIds.push(o.pageId);
                if (o.element.kind === "image" && o.element.assetId)
                    out.assetIds.push(o.element.assetId);
                break;
            case "deleteElement":
                out.pageIds.push(o.pageId);
                out.elementIds.push(o.elementId);
                break;
            case "updatePage":
                out.pageIds.push(o.pageId);
                break;
            case "batch":
                o.operations.forEach(visit);
                break;
            default:
                break;
        }
    };
    visit(op);
    return out;
}
exports.referencedIds = referencedIds;
function findElement(doc, elementId) {
    for (const page of doc.pages) {
        const element = page.elements.find((e) => e.id === elementId);
        if (element)
            return { page, element };
    }
    return null;
}
exports.findElement = findElement;
/** Build an updateElement op capturing the previous values automatically. */
function makeUpdate(doc, elementId, patch, intent) {
    const hit = findElement(doc, elementId);
    if (!hit)
        throw new OperationError(`Unknown element ${elementId}`);
    const previous = {};
    const el = hit.element;
    for (const key of Object.keys(patch))
        previous[key] = el[key];
    return { type: "updateElement", intent, pageId: hit.page.id, elementId, patch, previous: previous };
}
exports.makeUpdate = makeUpdate;
function createHistory(base, ops = []) {
    return { base, doc: replayOperations(base, ops), done: ops.slice(), undone: [] };
}
exports.createHistory = createHistory;
function historyApply(state, op) {
    return { ...state, doc: applyOperation(state.doc, op), done: [...state.done, op], undone: [] };
}
exports.historyApply = historyApply;
function historyUndo(state) {
    const last = state.done[state.done.length - 1];
    if (!last)
        return state;
    return {
        ...state,
        doc: applyOperation(state.doc, invertOperation(last)),
        done: state.done.slice(0, -1),
        undone: [...state.undone, last],
    };
}
exports.historyUndo = historyUndo;
function historyRedo(state) {
    const next = state.undone[state.undone.length - 1];
    if (!next)
        return state;
    return { ...state, doc: applyOperation(state.doc, next), done: [...state.done, next], undone: state.undone.slice(0, -1) };
}
exports.historyRedo = historyRedo;
