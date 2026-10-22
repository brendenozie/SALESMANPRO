"use client";

import React, { useRef, useState, useEffect } from "react";
import type {
  PDFDocumentModel,
  PDFElement,
  PDFImageElement,
  PDFShapeElement,
  PDFTextElement,
  PDFTableModel,
  RGBColor,
} from "@/lib/pdf-editor/model/types";
import { BUILTIN_THEMES, type DocumentTheme } from "@/lib/pdf-editor/engine/theme";
import {
  SparklesIcon,
  SwatchIcon,
  LanguageIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  TableCellsIcon,
  AdjustmentsHorizontalIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import {
  registerCustomFont,
  getCustomFonts,
  type FontDefinition,
} from "@/lib/pdf-editor/engine/font-registry";

import toast from "react-hot-toast";

export interface PDFPropertiesInspectorProps {
  document: PDFDocumentModel | null;
  selectedElement: PDFElement | null;
  selectedTable?: PDFTableModel | null;
  onUpdateText: (elementId: string, patch: Partial<PDFTextElement>) => void;
  onUpdateShape: (elementId: string, patch: Partial<PDFShapeElement>) => void;
  onUpdateImage: (elementId: string, patch: Partial<PDFImageElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onApplyTheme: (themeId: string) => void;
  onAddTextElement: () => void;
  onAddShapeElement: () => void;
  onRunOCR: () => void;
  isOcrRunning?: boolean;
  onRegisterCustomFont?: (font: FontDefinition) => void;
}

function rgbToHex(c?: RGBColor | null): string {
  if (!c) return "#000000";
  const r = Math.round(c.r).toString(16).padStart(2, "0");
  const g = Math.round(c.g).toString(16).padStart(2, "0");
  const b = Math.round(c.b).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function hexToRgb(hex: string): RGBColor {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export const PDFPropertiesInspector: React.FC<PDFPropertiesInspectorProps> = ({
  document,
  selectedElement,
  selectedTable,
  onUpdateText,
  onUpdateShape,
  onUpdateImage,
  onDeleteElement,
  onApplyTheme,
  onAddTextElement,
  onAddShapeElement,
  onRunOCR,
  isOcrRunning = false,
  onRegisterCustomFont,
}) => {
  const [activeTab, setActiveTab] = useState<"attributes" | "tools">("attributes");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);
  const [customFonts, setCustomFonts] = useState<FontDefinition[]>(() => {
    try {
      return getCustomFonts();
    } catch {
      return [];
    }
  });

  // When an element or table is clicked/selected, automatically ensure Attributes tab is active
  useEffect(() => {
    if (selectedElement || selectedTable) {
      setActiveTab("attributes");
    }
  }, [selectedElement, selectedTable]);

  const handleFontFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const cleanName =
        baseName.replace(/[-_](regular|bold|italic|medium|semibold|black|light)/i, "").trim() ||
        "CustomFont";
      const isBold = /bold/i.test(baseName);
      const isItalic = /italic|oblique/i.test(baseName);

      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);

      const registered = registerCustomFont(cleanName, uint8, {
        weight: isBold ? "bold" : "normal",
        style: isItalic ? "italic" : "normal",
        displayName: `${cleanName} (Custom)`,
      });

      const updated = getCustomFonts();
      setCustomFonts(updated);

      if (onRegisterCustomFont) {
        onRegisterCustomFont(registered);
      }

      if (selectedElement && selectedElement.kind === "text") {
        onUpdateText(selectedElement.id, {
          fontFamily: registered.family,
          fontWeight: registered.weight,
          fontStyle: registered.style,
        });
      }
      toast.success(`Custom font "${registered.family}" uploaded and ready for export!`);
    } catch (err) {
      console.error("Failed to parse/register custom font:", err);
      toast.error("Failed to read font file. Please ensure it is a valid .ttf or .otf font.");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement || selectedElement.kind !== "image") return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      onUpdateImage(selectedElement.id, {
        imageData,
        mimeType: file.type.includes("png") ? "image/png" : "image/jpeg",
      });
      toast.success("Image asset replaced successfully!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-900/80 backdrop-blur-md">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fontInputRef}
        onChange={handleFontFileChange}
        accept=".ttf,.otf,font/ttf,font/otf"
        className="hidden"
      />
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageFileChange}
        accept="image/png,image/jpeg"
        className="hidden"
      />

      {/* Persistent Top Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
        <button
          onClick={() => setActiveTab("attributes")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
            activeTab === "attributes"
              ? "bg-slate-800 text-cyan-400 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span>Attributes</span>
          {(selectedElement || selectedTable) && (
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("tools")}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
            activeTab === "tools"
              ? "bg-slate-800 text-cyan-400 shadow-sm"
              : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
          }`}
        >
          <WrenchScrewdriverIcon className="h-4 w-4" />
          <span>Document Tools</span>
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pr-3 space-y-4">
        {/* ==================== ATTRIBUTES TAB ==================== */}
        {activeTab === "attributes" && (
          <>
            {/* 1. TABLE ATTRIBUTES */}
            {selectedTable && (
              <div className="space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 shadow-sm">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <TableCellsIcon className="h-4 w-4" />
                    <span>Table Properties</span>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    Grid Detected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded bg-slate-950/80 p-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Rows</span>
                    <p className="text-sm font-bold text-slate-100">
                      {selectedTable.rowCount || selectedTable.rows.length}
                    </p>
                  </div>
                  <div className="rounded bg-slate-950/80 p-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Columns</span>
                    <p className="text-sm font-bold text-slate-100">
                      {selectedTable.colCount || selectedTable.columns.length}
                    </p>
                  </div>
                  <div className="rounded bg-slate-950/80 p-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Confidence</span>
                    <p className="text-sm font-bold text-emerald-400">
                      {Math.round((selectedTable.confidence || 0.9) * 100)}%
                    </p>
                  </div>
                  <div className="rounded bg-slate-950/80 p-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">Cells Linked</span>
                    <p className="text-sm font-bold text-slate-100">
                      {selectedTable.cellTextIds.length}
                    </p>
                  </div>
                </div>

                <div className="rounded bg-slate-950/60 p-2 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Dimensions</span>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-300">
                    {Math.round(selectedTable.bbox.width)}pt × {Math.round(selectedTable.bbox.height)}pt
                  </p>
                </div>
              </div>
            )}

            {/* 2. TEXT ELEMENT ATTRIBUTES */}
            {selectedElement && selectedElement.kind === "text" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Text Properties
                  </span>
                  <button
                    onClick={() => onDeleteElement(selectedElement.id)}
                    className="flex items-center gap-1 rounded bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
                    title="Delete text"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Text Content */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Text Content</label>
                  <textarea
                    rows={3}
                    value={(selectedElement as PDFTextElement).text}
                    onChange={(e) => onUpdateText(selectedElement.id, { text: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 outline-none transition focus:border-cyan-500"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">Font Family</label>
                    <button
                      type="button"
                      onClick={() => fontInputRef.current?.click()}
                      className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <ArrowUpTrayIcon className="h-3 w-3" />
                      <span>Upload .otf/.ttf</span>
                    </button>
                  </div>
                  <select
                    value={(selectedElement as PDFTextElement).fontFamily || "Helvetica"}
                    onChange={(e) => onUpdateText(selectedElement.id, { fontFamily: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <optgroup label="Standard 14 &amp; Web Fonts">
                      <option value="Helvetica">Helvetica (Sans-Serif)</option>
                      <option value="Times">Times Roman (Serif)</option>
                      <option value="Courier">Courier (Monospace)</option>
                      <option value="Arial">Arial</option>
                      <option value="Inter">Inter (fallback: Helvetica)</option>
                      <option value="Roboto">Roboto (fallback: Helvetica)</option>
                    </optgroup>
                    {customFonts.length > 0 && (
                      <optgroup label="Custom Uploaded Fonts">
                        {customFonts.map((font) => (
                          <option
                            key={`${font.family}-${font.weight}-${font.style}`}
                            value={font.family}
                          >
                            {font.displayName || `${font.family} (Custom)`}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Typography Controls: Size, Bold, Italic */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Size (pt)</label>
                    <input
                      type="number"
                      min={6}
                      max={144}
                      value={Math.round((selectedElement as PDFTextElement).fontSize || 12)}
                      onChange={(e) =>
                        onUpdateText(selectedElement.id, { fontSize: Number(e.target.value) || 12 })
                      }
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Weight</label>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateText(selectedElement.id, {
                          fontWeight:
                            (selectedElement as PDFTextElement).fontWeight === "bold"
                              ? "normal"
                              : "bold",
                        })
                      }
                      className={`w-full rounded-lg border p-2 text-xs font-bold transition ${
                        (selectedElement as PDFTextElement).fontWeight === "bold"
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      B
                    </button>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-400">Style</label>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateText(selectedElement.id, {
                          fontStyle:
                            (selectedElement as PDFTextElement).fontStyle === "italic"
                              ? "normal"
                              : "italic",
                        })
                      }
                      className={`w-full rounded-lg border p-2 text-xs italic transition ${
                        (selectedElement as PDFTextElement).fontStyle === "italic"
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      I
                    </button>
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={rgbToHex((selectedElement as PDFTextElement).color)}
                      onChange={(e) =>
                        onUpdateText(selectedElement.id, { color: hexToRgb(e.target.value) })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-slate-800 bg-transparent"
                    />
                    <input
                      type="text"
                      value={rgbToHex((selectedElement as PDFTextElement).color)}
                      onChange={(e) =>
                        onUpdateText(selectedElement.id, { color: hexToRgb(e.target.value) })
                      }
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-1.5 font-mono text-xs text-slate-200"
                    />
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Alignment</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => onUpdateText(selectedElement.id, { alignment: align })}
                        className={`rounded py-1.5 text-xs capitalize transition ${
                          (selectedElement as PDFTextElement).alignment === align
                            ? "bg-cyan-500/20 font-semibold text-cyan-300 border border-cyan-500/40"
                            : "bg-slate-950 text-slate-400 hover:bg-slate-900 border border-slate-800"
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. SHAPE ELEMENT ATTRIBUTES */}
            {selectedElement && selectedElement.kind === "shape" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    Shape Properties
                  </span>
                  <button
                    onClick={() => onDeleteElement(selectedElement.id)}
                    className="flex items-center gap-1 rounded bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
                    title="Delete shape"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Fill Color */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Fill Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={rgbToHex((selectedElement as PDFShapeElement).fill)}
                      onChange={(e) =>
                        onUpdateShape(selectedElement.id, { fill: hexToRgb(e.target.value) })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-slate-800 bg-transparent"
                    />
                    <input
                      type="text"
                      value={rgbToHex((selectedElement as PDFShapeElement).fill)}
                      onChange={(e) =>
                        onUpdateShape(selectedElement.id, { fill: hexToRgb(e.target.value) })
                      }
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-1.5 font-mono text-xs text-slate-200"
                    />
                  </div>
                </div>

                {/* Stroke Color */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Stroke Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={rgbToHex((selectedElement as PDFShapeElement).stroke)}
                      onChange={(e) =>
                        onUpdateShape(selectedElement.id, { stroke: hexToRgb(e.target.value) })
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-slate-800 bg-transparent"
                    />
                    <input
                      type="text"
                      value={rgbToHex((selectedElement as PDFShapeElement).stroke)}
                      onChange={(e) =>
                        onUpdateShape(selectedElement.id, { stroke: hexToRgb(e.target.value) })
                      }
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-1.5 font-mono text-xs text-slate-200"
                    />
                  </div>
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500">Width (pt)</label>
                    <input
                      type="number"
                      value={Math.round((selectedElement as PDFShapeElement).bbox.width)}
                      onChange={(e) =>
                        onUpdateShape(selectedElement.id, {
                          bbox: {
                            ...(selectedElement as PDFShapeElement).bbox,
                            width: Number(e.target.value) || 10,
                          },
                        })
                      }
                      className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Height (pt)</label>
                    <input
                      type="number"
                      value={Math.round((selectedElement as PDFShapeElement).bbox.height)}
                      onChange={(e) =>
                        onUpdateShape(selectedElement.id, {
                          bbox: {
                            ...(selectedElement as PDFShapeElement).bbox,
                            height: Number(e.target.value) || 10,
                          },
                        })
                      }
                      className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. IMAGE ELEMENT ATTRIBUTES */}
            {selectedElement && selectedElement.kind === "image" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Image Properties
                  </span>
                  <button
                    onClick={() => onDeleteElement(selectedElement.id)}
                    className="flex items-center gap-1 rounded bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
                    title="Delete image"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950 p-4">
                  {(selectedElement as PDFImageElement).imageData ? (
                    <img
                      src={(selectedElement as PDFImageElement).imageData}
                      alt="Selected"
                      className="max-h-36 max-w-full rounded object-contain"
                    />
                  ) : (
                    <div className="text-center text-xs text-slate-500">Embedded PDF Image</div>
                  )}
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="mt-3 w-full rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-600/30"
                  >
                    Replace Image File
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500">Width (pt)</label>
                    <input
                      type="number"
                      value={Math.round((selectedElement as PDFImageElement).bbox.width)}
                      onChange={(e) =>
                        onUpdateImage(selectedElement.id, {
                          bbox: {
                            ...(selectedElement as PDFImageElement).bbox,
                            width: Number(e.target.value) || 20,
                          },
                        })
                      }
                      className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Height (pt)</label>
                    <input
                      type="number"
                      value={Math.round((selectedElement as PDFImageElement).bbox.height)}
                      onChange={(e) =>
                        onUpdateImage(selectedElement.id, {
                          bbox: {
                            ...(selectedElement as PDFImageElement).bbox,
                            height: Number(e.target.value) || 20,
                          },
                        })
                      }
                      className="w-full rounded border border-slate-800 bg-slate-950 p-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. NO ELEMENT SELECTED: GUIDED PROMPT (Never Disappears) */}
            {!selectedElement && !selectedTable && (
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-center">
                <AdjustmentsHorizontalIcon className="mx-auto h-8 w-8 text-slate-600" />
                <h4 className="mt-2 text-xs font-semibold text-slate-300">No Object Selected</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                  Click on any text, shape, image, or table on the canvas to inspect and edit its properties.
                </p>

                <div className="mt-4 border-t border-slate-800 pt-3">
                  <span className="mb-2 block text-[10px] uppercase tracking-wider text-slate-500">
                    Quick Insertion
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={onAddTextElement}
                      className="flex items-center justify-center gap-1 rounded bg-slate-900 p-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>Text</span>
                    </button>
                    <button
                      onClick={onAddShapeElement}
                      className="flex items-center justify-center gap-1 rounded bg-slate-900 p-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>Shape</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== DOCUMENT TOOLS TAB ==================== */}
        {activeTab === "tools" && (
          <div className="space-y-5">
            {/* Insert Elements */}
            <div>
              <span className="mb-2 block text-xs font-medium text-slate-300">Insert Elements</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onAddTextElement}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-medium text-slate-200 transition hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Text</span>
                </button>
                <button
                  onClick={onAddShapeElement}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-medium text-slate-200 transition hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-300"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Shape</span>
                </button>
              </div>
            </div>

            {/* Custom Typography & Font Uploads */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Custom Typography</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {customFonts.length} font{customFonts.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mb-2.5 text-[11px] text-slate-400">
                Upload .otf or .ttf fonts to embed alongside the standard 14 library fonts.
              </p>
              <button
                type="button"
                onClick={() => fontInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-2 text-xs font-medium text-cyan-300 transition hover:bg-cyan-500/20"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                <span>Upload Font (.otf / .ttf)</span>
              </button>
              {customFonts.length > 0 && (
                <div className="mt-2.5 max-h-28 overflow-y-auto space-y-1">
                  {customFonts.map((f) => (
                    <div
                      key={`${f.family}-${f.weight}-${f.style}`}
                      className="flex items-center justify-between rounded bg-slate-900/80 px-2 py-1 text-[11px]"
                    >
                      <span className="font-medium text-slate-200">{f.family}</span>
                      <span className="text-[10px] text-slate-500">{f.weight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* OCR Scanned Document */}
            <div>
              <span className="mb-2 block text-xs font-medium text-slate-300">
                Scanned Document OCR
              </span>
              <button
                onClick={onRunOCR}
                disabled={isOcrRunning}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/10 p-2.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20 disabled:opacity-50"
              >
                <LanguageIcon className="h-4 w-4" />
                <span>{isOcrRunning ? "Running OCR..." : "Convert Scanned Text to Native"}</span>
              </button>
            </div>

            {/* Document Themes */}
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <SwatchIcon className="h-4 w-4 text-cyan-400" />
                <span>One-Click Document Themes</span>
              </div>

              <div className="space-y-2">
                {BUILTIN_THEMES.map((theme: DocumentTheme) => (
                  <div
                    key={theme.id}
                    onClick={() => onApplyTheme(theme.id)}
                    className="group cursor-pointer rounded-lg border border-slate-800 bg-slate-950/70 p-2.5 transition hover:border-slate-700 hover:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                        {theme.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className="h-3 w-3 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: rgbToHex(theme.primaryColor) }}
                        />
                        <span
                          className="h-3 w-3 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: rgbToHex(theme.accentColor) }}
                        />
                        <span
                          className="h-3 w-3 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: rgbToHex(theme.backgroundColor) }}
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {theme.headingFont} • Accent &amp; Panel Harmony
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
