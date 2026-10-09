/**
 * lib/pdf-editor/model/operations.ts
 *
 * Every user-visible edit is an EditorOperation. Operations are:
 *   - pure (applyOperation never mutates its input),
 *   - self-inverting (each carries the data needed to undo it),
 *   - serialisable (persisted in MongoDB as the project's edit log).
 *
 * The persisted project state = base analysed model + ordered operation log.
 * Reopening a project replays the log; nothing is re-inferred from the PDF.
 */
import type {
  PDFAssetInfo,
  PDFDocumentModel,
  PDFElement,
  PDFImageElement,
  PDFPageModel,
  PDFShapeElement,
  PDFTextElement,
  PageRotation,
  RGBColor,
} from "./types";

type Patchable<T> = Partial<Omit<T, "id" | "kind" | "pageId" | "origin" | "source">>;

/** Union-safe patch: any property of any element kind (validated per kind at runtime). */
export type ElementPatch = Patchable<PDFTextElement> & Patchable<PDFImageElement> & Patchable<PDFShapeElement>;

export type OperationIntent =
  | "text"
  | "font"
  | "style"
  | "color"
  | "move"
  | "resize"
  | "rotate"
  | "image"
  | "zorder"
  | "theme"
  | "ocr";

export interface UpdateElementOperation {
  type: "updateElement";
  intent: OperationIntent;
  pageId: string;
  elementId: string;
  patch: ElementPatch;
  previous: ElementPatch;
}

export interface AddElementOperation {
  type: "addElement";
  pageId: string;
  element: PDFElement;
}

export interface DeleteElementOperation {
  type: "deleteElement";
  pageId: string;
  elementId: string;
  /** Snapshot for undo. */
  element: PDFElement;
  index: number;
}

export interface AddPageOperation {
  type: "addPage";
  page: PDFPageModel;
  index: number;
}

export interface DeletePageOperation {
  type: "deletePage";
  page: PDFPageModel;
  index: number;
}

export interface MovePageOperation {
  type: "movePage";
  from: number;
  to: number;
}

export interface PagePatch {
  rotation?: PageRotation;
  width?: number;
  height?: number;
  background?: RGBColor | null;
}

export interface UpdatePageOperation {
  type: "updatePage";
  pageId: string;
  patch: PagePatch;
  previous: PagePatch;
}

export interface RegisterAssetOperation {
  type: "registerAsset";
  asset: PDFAssetInfo;
}

export interface BatchOperation {
  type: "batch";
  label: string;
  operations: EditorOperation[];
}

export type EditorOperation =
  | UpdateElementOperation
  | AddElementOperation
  | DeleteElementOperation
  | AddPageOperation
  | DeletePageOperation
  | MovePageOperation
  | UpdatePageOperation
  | RegisterAssetOperation
  | BatchOperation;

export class OperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperationError";
  }
}

const IMMUTABLE_KEYS = new Set(["id", "kind", "pageId", "origin", "source"]);

const KIND_KEYS: Record<PDFElement["kind"], ReadonlySet<string>> = {
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
export function assertPatchValid(element: PDFElement, patch: ElementPatch): void {
  const allowed = KIND_KEYS[element.kind];
  for (const key of Object.keys(patch)) {
    if (IMMUTABLE_KEYS.has(key)) throw new OperationError(`Property "${key}" is immutable`);
    if (!allowed.has(key)) throw new OperationError(`Property "${key}" is not valid for ${element.kind} elements`);
  }
}

function findPage(doc: PDFDocumentModel, pageId: string): [PDFPageModel, number] {
  const idx = doc.pages.findIndex((p) => p.id === pageId);
  if (idx < 0) throw new OperationError(`Unknown page ${pageId}`);
  return [doc.pages[idx], idx];
}

function replacePage(doc: PDFDocumentModel, idx: number, page: PDFPageModel): PDFDocumentModel {
  const pages = doc.pages.slice();
  pages[idx] = page;
  return { ...doc, pages };
}

function sortByZ(elements: PDFElement[]): PDFElement[] {
  return elements.slice().sort((a, b) => a.zIndex - b.zIndex);
}

export function applyOperation(doc: PDFDocumentModel, op: EditorOperation): PDFDocumentModel {
  switch (op.type) {
    case "updateElement": {
      const [page, idx] = findPage(doc, op.pageId);
      const elIdx = page.elements.findIndex((e) => e.id === op.elementId);
      if (elIdx < 0) throw new OperationError(`Unknown element ${op.elementId}`);
      const current = page.elements[elIdx];
      if (!current.editable && op.intent !== "ocr") {
        throw new OperationError(`Element ${op.elementId} cannot be structurally edited: ${current.limitations.join("; ")}`);
      }
      assertPatchValid(current, op.patch);
      const next = { ...current, ...op.patch } as PDFElement;
      const elements = page.elements.slice();
      elements[elIdx] = next;
      const reorder = op.patch.zIndex !== undefined;
      return replacePage(doc, idx, { ...page, elements: reorder ? sortByZ(elements) : elements });
    }
    case "addElement": {
      const [page, idx] = findPage(doc, op.pageId);
      if (page.elements.some((e) => e.id === op.element.id)) throw new OperationError(`Duplicate element id ${op.element.id}`);
      if (op.element.pageId !== op.pageId) throw new OperationError("Element pageId mismatch");
      return replacePage(doc, idx, { ...page, elements: sortByZ([...page.elements, op.element]) });
    }
    case "deleteElement": {
      const [page, idx] = findPage(doc, op.pageId);
      if (!page.elements.some((e) => e.id === op.elementId)) throw new OperationError(`Unknown element ${op.elementId}`);
      return replacePage(doc, idx, { ...page, elements: page.elements.filter((e) => e.id !== op.elementId) });
    }
    case "addPage": {
      if (doc.pages.some((p) => p.id === op.page.id)) throw new OperationError(`Duplicate page id ${op.page.id}`);
      const pages = doc.pages.slice();
      pages.splice(Math.max(0, Math.min(op.index, pages.length)), 0, op.page);
      return { ...doc, pages };
    }
    case "deletePage": {
      if (doc.pages.length <= 1) throw new OperationError("A document must keep at least one page");
      return { ...doc, pages: doc.pages.filter((p) => p.id !== op.page.id) };
    }
    case "movePage": {
      const n = doc.pages.length;
      if (op.from < 0 || op.from >= n || op.to < 0 || op.to >= n) throw new OperationError("Page index out of range");
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

/** Returns the exact inverse of an operation (assets are append-only and never un-registered). */
export function invertOperation(op: EditorOperation): EditorOperation {
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

export function replayOperations(base: PDFDocumentModel, ops: EditorOperation[]): PDFDocumentModel {
  return ops.reduce(applyOperation, base);
}

/** Collects every element id referenced by an operation (for server-side authorisation checks). */
export function referencedIds(op: EditorOperation): { pageIds: string[]; elementIds: string[]; assetIds: string[] } {
  const out = { pageIds: [] as string[], elementIds: [] as string[], assetIds: [] as string[] };
  const visit = (o: EditorOperation) => {
    switch (o.type) {
      case "updateElement":
        out.pageIds.push(o.pageId);
        out.elementIds.push(o.elementId);
        if (o.patch.assetId) out.assetIds.push(o.patch.assetId);
        break;
      case "addElement":
        out.pageIds.push(o.pageId);
        if (o.element.kind === "image" && o.element.assetId) out.assetIds.push(o.element.assetId);
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

export function findElement(doc: PDFDocumentModel, elementId: string): { page: PDFPageModel; element: PDFElement } | null {
  for (const page of doc.pages) {
    const element = page.elements.find((e) => e.id === elementId);
    if (element) return { page, element };
  }
  return null;
}

/** Build an updateElement op capturing the previous values automatically. */
export function makeUpdate(
  doc: PDFDocumentModel,
  elementId: string,
  patch: ElementPatch,
  intent: OperationIntent,
): UpdateElementOperation {
  const hit = findElement(doc, elementId);
  if (!hit) throw new OperationError(`Unknown element ${elementId}`);
  const previous: Record<string, unknown> = {};
  const el = hit.element as unknown as Record<string, unknown>;
  for (const key of Object.keys(patch)) previous[key] = el[key];
  return { type: "updateElement", intent, pageId: hit.page.id, elementId, patch, previous: previous as ElementPatch };
}

/** Linear undo/redo history operating on document operations (never snapshots). */
export interface HistoryState {
  base: PDFDocumentModel;
  doc: PDFDocumentModel;
  done: EditorOperation[];
  undone: EditorOperation[];
}

export function createHistory(base: PDFDocumentModel, ops: EditorOperation[] = []): HistoryState {
  return { base, doc: replayOperations(base, ops), done: ops.slice(), undone: [] };
}

export function historyApply(state: HistoryState, op: EditorOperation): HistoryState {
  return { ...state, doc: applyOperation(state.doc, op), done: [...state.done, op], undone: [] };
}

export function historyUndo(state: HistoryState): HistoryState {
  const last = state.done[state.done.length - 1];
  if (!last) return state;
  return {
    ...state,
    doc: applyOperation(state.doc, invertOperation(last)),
    done: state.done.slice(0, -1),
    undone: [...state.undone, last],
  };
}

export function historyRedo(state: HistoryState): HistoryState {
  const next = state.undone[state.undone.length - 1];
  if (!next) return state;
  return { ...state, doc: applyOperation(state.doc, next), done: [...state.done, next], undone: state.undone.slice(0, -1) };
}
