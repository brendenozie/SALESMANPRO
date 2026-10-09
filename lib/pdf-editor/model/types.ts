/**
 * lib/pdf-editor/model/types.ts
 *
 * Canonical, isomorphic (server + browser) editable PDF document model.
 *
 * COORDINATE SYSTEM (canonical for the whole module):
 *   - Origin: top-left of the page's MediaBox
 *   - X grows right, Y grows down
 *   - Unit: PDF points (1/72 inch)
 *   - Geometry is expressed in the UNROTATED page space. Page /Rotate is a
 *     separate discrete property (0 | 90 | 180 | 270).
 * Conversion to/from PDF user space (bottom-left origin) happens only at the
 * engine boundary (lib/pdf-editor/engine/*).
 */

export type Matrix = [number, number, number, number, number, number];

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** sRGB colour, each channel 0..255. */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export type PageRotation = 0 | 90 | 180 | 270;
export type ElementOrigin = "native" | "ocr" | "added";
export type FontWeight = "normal" | "bold";
export type FontStyle = "normal" | "italic";
export type TextAlignment = "left" | "center" | "right" | "justify";

/**
 * Binding between a model element and the original content stream.
 * Op indices refer to the tokenised operator list of the page content
 * (all /Contents streams concatenated) produced by the engine interpreter.
 * Only meaningful for origin === "native". Never trusted from the client:
 * the exporter re-derives bindings by re-analysing the stored original PDF.
 */
export interface SourceBinding {
  opIndices: number[];
  initialX?: number;
  initialY?: number;
}

export interface BaseElement {
  id: string;
  pageId: string;
  bbox: Rect;
  /** Visual rotation in degrees (clockwise, page space). */
  rotation: number;
  origin: ElementOrigin;
  /** Paint order within the page (ascending = drawn later = on top). */
  zIndex: number;
  /** False when the element cannot be safely structurally edited. */
  editable: boolean;
  /** Human-readable explanations of editing limitations. */
  limitations: string[];
  source?: SourceBinding;
}

export interface TextRun {
  text: string;
  fontKey: string;
  fontSize: number;
  color: RGBColor;
}

export interface TextLine {
  text: string;
  /** Left x of the line (page space, top-left origin). */
  x: number;
  /** Baseline y (page space, top-left origin). */
  baseline: number;
  width: number;
  runs: TextRun[];
}

export interface PDFTextElement extends BaseElement {
  kind: "text";
  /** Full text; lines joined by "\n". */
  text: string;
  lines: TextLine[];
  /** Key into PDFDocumentModel.fonts. */
  fontKey: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  color: RGBColor;
  alignment: TextAlignment;
  /** Baseline-to-baseline distance in points. */
  lineHeight: number;
  charSpacing: number;
  wordSpacing: number;
  /**
   * "positioned": lines keep their absolute positions (glyph-positioned PDFs).
   * "paragraph": lines are re-wrapped inside bbox.width on edit (reflow).
   */
  layout: "positioned" | "paragraph";
  /** Original PDF BaseFont name (e.g. "ABCDEF+Inter-Bold"). */
  originalFont?: string;
  embeddedFont?: boolean;
  /** 0..1, 1 for native text, OCR engine confidence for OCR text. */
  confidence: number;
  /** PDF text render mode (3 = invisible, used by OCR text layers). */
  renderMode: number;
  /** Set when the exporter had to substitute the requested font. */
  fontFallback?: { requested: string; used: string; reason: string };
  /** Semantic role hints from layout analysis. */
  role?: "heading" | "body" | "header" | "footer" | "table-cell" | "caption";
}

export interface ImageCrop {
  /** Fractions 0..1 of the source image to keep. */
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface PDFImageElement extends BaseElement {
  kind: "image";
  sourceType: "embedded" | "external";
  mimeType?: string;
  /** Pixel dimensions of the image data. */
  originalWidth?: number;
  originalHeight?: number;
  /** Indirect reference "num gen" of the image XObject (native only). */
  xobjectRef?: string;
  /** Number of placements (any page) sharing this XObject. */
  sharedCount: number;
  /** SHA-256 of the encoded image stream bytes. */
  imageHash?: string;
  /** Asset id (PDFDocumentModel.assets) when replaced or added. */
  assetId?: string;
  flipH: boolean;
  flipV: boolean;
  crop?: ImageCrop;
  /** Preview data URL (small, optional; never used for export). */
  imageData?: string;
}

export type ShapeType = "rect" | "line" | "path";

export interface PDFShapeElement extends BaseElement {
  kind: "shape";
  shapeType: ShapeType;
  fill: RGBColor | null;
  stroke: RGBColor | null;
  lineWidth: number;
  /** Fill rule / paint operator family. */
  paint: "fill" | "stroke" | "fillStroke";
  evenOdd: boolean;
  role?: "background" | "panel" | "accent" | "table-cell" | "table-border" | "divider" | "decoration";
  /** Path in page space (top-left origin), only for added shapes. */
  pathData?: string;
}

export interface PDFLinkElement extends BaseElement {
  kind: "link";
  uri?: string;
  destPageIndex?: number;
}

export type PDFElement = PDFTextElement | PDFImageElement | PDFShapeElement | PDFLinkElement;
export type PDFElementKind = PDFElement["kind"];

export interface PDFTableModel {
  id: string;
  bbox: Rect;
  rows: number[];
  columns: number[];
  cellShapeIds: string[];
  cellTextIds: string[];
  headerShapeIds: string[];
  confidence: number;
}

export interface PDFPageModel {
  id: string;
  /** Index in the ORIGINAL document, null for inserted blank pages. */
  sourceIndex: number | null;
  /** When duplicated: id of the page this was copied from. */
  duplicatedFrom?: string;
  width: number;
  height: number;
  rotation: PageRotation;
  elements: PDFElement[];
  tables: PDFTableModel[];
  hasNativeText: boolean;
  /** True when the page appears to be a raster scan without native text. */
  isScanned: boolean;
  ocrStatus: "not-needed" | "available" | "done";
  /** Page background colour, null = none/transparent (white paper). */
  background: RGBColor | null;
  warnings: string[];
}

export interface PDFFontInfo {
  key: string;
  /** Raw BaseFont (subset prefix stripped in `family`). */
  baseFont: string;
  family: string;
  subtype: string;
  weight: FontWeight;
  style: FontStyle;
  embedded: boolean;
  subset: boolean;
  encoding: string;
  hasToUnicode: boolean;
  /** "original" = from the uploaded PDF; "library" = bundled/standard font. */
  source: "original" | "library";
  /** For library fonts: registry id (see engine/font-registry). */
  libraryId?: string;
}

export interface PDFAssetInfo {
  id: string;
  kind: "image";
  mimeType: "image/png" | "image/jpeg";
  storageKey: string;
  sha256: string;
  width: number;
  height: number;
  byteLength: number;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  pdfVersion?: string;
}

export interface AnalysisReport {
  unidentified: string[];
  warnings: string[];
  formXObjects: number;
  annotations: number;
  hasAcroForm: boolean;
  encrypted: boolean;
}

export interface PDFDocumentModel {
  id: string;
  analysisVersion: number;
  pages: PDFPageModel[];
  fonts: Record<string, PDFFontInfo>;
  metadata: PDFMetadata;
  assets: Record<string, PDFAssetInfo>;
  report: AnalysisReport;
}
