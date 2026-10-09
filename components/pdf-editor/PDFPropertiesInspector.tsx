"use client";

import React, { useRef } from "react";
import type {
  PDFDocumentModel,
  PDFElement,
  PDFImageElement,
  PDFShapeElement,
  PDFTextElement,
  RGBColor,
} from "@/lib/pdf-editor/model/types";
import { BUILTIN_THEMES, type DocumentTheme } from "@/lib/pdf-editor/engine/theme";
import {
  SparklesIcon,
  SwatchIcon,
  LanguageIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export interface PDFPropertiesInspectorProps {
  document: PDFDocumentModel | null;
  selectedElement: PDFElement | null;
  onUpdateText: (elementId: string, patch: Partial<PDFTextElement>) => void;
  onUpdateShape: (elementId: string, patch: Partial<PDFShapeElement>) => void;
  onUpdateImage: (elementId: string, patch: Partial<PDFImageElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onApplyTheme: (themeId: string) => void;
  onAddTextElement: () => void;
  onAddShapeElement: () => void;
  onRunOCR: () => void;
  isOcrRunning?: boolean;
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
  onUpdateText,
  onUpdateShape,
  onUpdateImage,
  onDeleteElement,
  onApplyTheme,
  onAddTextElement,
  onAddShapeElement,
  onRunOCR,
  isOcrRunning = false,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!document) {
    return (
      <aside className="w-80 shrink-0 border-l border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-500">
        Properties Inspector
      </aside>
    );
  }

  // 1. TEXT ELEMENT SELECTED
  if (selectedElement && selectedElement.kind === "text") {
    const textEl = selectedElement as PDFTextElement;
    return (
      <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <span>Text Properties</span>
          </div>
          <button
            onClick={() => onDeleteElement(textEl.id)}
            className="flex items-center gap-1 rounded bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
            title="Delete this text element"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Text Content */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Content</label>
            <textarea
              rows={3}
              value={textEl.text}
              onChange={(e) => onUpdateText(textEl.id, { text: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 outline-none transition focus:border-cyan-500"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Font Family</label>
            <select
              value={textEl.fontFamily || "Helvetica"}
              onChange={(e) => onUpdateText(textEl.id, { fontFamily: e.target.value })}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="Helvetica">Helvetica (Sans-Serif)</option>
              <option value="Times">Times Roman (Serif)</option>
              <option value="Courier">Courier (Monospace)</option>
              <option value="Arial">Arial</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
            </select>
          </div>

          {/* Font Size & Weight & Style */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Size (pt)</label>
              <input
                type="number"
                min={6}
                max={120}
                value={Math.round(textEl.fontSize)}
                onChange={(e) =>
                  onUpdateText(textEl.id, { fontSize: Math.max(6, Number(e.target.value) || 12) })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Weight</label>
              <button
                type="button"
                onClick={() =>
                  onUpdateText(textEl.id, {
                    fontWeight: textEl.fontWeight === "bold" ? "normal" : "bold",
                  })
                }
                className={`w-full rounded-lg border p-2 text-xs font-semibold transition ${
                  textEl.fontWeight === "bold"
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                Bold
              </button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Style</label>
              <button
                type="button"
                onClick={() =>
                  onUpdateText(textEl.id, {
                    fontStyle: textEl.fontStyle === "italic" ? "normal" : "italic",
                  })
                }
                className={`w-full rounded-lg border p-2 text-xs italic transition ${
                  textEl.fontStyle === "italic"
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-300"
                    : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                }`}
              >
                Italic
              </button>
            </div>
          </div>

          {/* Color & Alignment */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Color</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1.5">
                <input
                  type="color"
                  value={rgbToHex(textEl.color)}
                  onChange={(e) => onUpdateText(textEl.id, { color: hexToRgb(e.target.value) })}
                  className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="text-[11px] font-mono text-slate-300">{rgbToHex(textEl.color)}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Alignment</label>
              <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onUpdateText(textEl.id, { alignment: align })}
                    className={`flex-1 rounded py-1 text-[10px] font-semibold uppercase transition ${
                      textEl.alignment === align
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {align[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Position & Bounds */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
            <span className="mb-2 block text-[11px] font-medium text-slate-400">Position & Bounds</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500">X (pt)</label>
                <input
                  type="number"
                  value={Math.round(textEl.bbox.x)}
                  onChange={(e) =>
                    onUpdateText(textEl.id, {
                      bbox: { ...textEl.bbox, x: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Y (pt)</label>
                <input
                  type="number"
                  value={Math.round(textEl.bbox.y)}
                  onChange={(e) =>
                    onUpdateText(textEl.id, {
                      bbox: { ...textEl.bbox, y: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // 2. VECTOR SHAPE SELECTED
  if (selectedElement && selectedElement.kind === "shape") {
    const shapeEl = selectedElement as PDFShapeElement;
    return (
      <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>Vector Shape ({shapeEl.role || "generic"})</span>
          </div>
          <button
            onClick={() => onDeleteElement(shapeEl.id)}
            className="flex items-center gap-1 rounded bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Fill Color */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Fill Color</label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2">
              <input
                type="color"
                value={rgbToHex(shapeEl.fill)}
                onChange={(e) => onUpdateShape(shapeEl.id, { fill: hexToRgb(e.target.value) })}
                className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="text-xs font-mono text-slate-300">{rgbToHex(shapeEl.fill)}</span>
            </div>
          </div>

          {/* Stroke Color & Width */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Stroke Color</label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-1.5">
                <input
                  type="color"
                  value={rgbToHex(shapeEl.stroke)}
                  onChange={(e) => onUpdateShape(shapeEl.id, { stroke: hexToRgb(e.target.value) })}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span className="text-[10px] font-mono text-slate-300">{rgbToHex(shapeEl.stroke)}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Stroke (pt)</label>
              <input
                type="number"
                min={0}
                max={20}
                step={0.5}
                value={shapeEl.lineWidth || 0}
                onChange={(e) =>
                  onUpdateShape(shapeEl.id, { lineWidth: Number(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Bounds */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
            <span className="mb-2 block text-[11px] font-medium text-slate-400">Dimensions & Position</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500">Width (pt)</label>
                <input
                  type="number"
                  value={Math.round(shapeEl.bbox.width)}
                  onChange={(e) =>
                    onUpdateShape(shapeEl.id, {
                      bbox: { ...shapeEl.bbox, width: Number(e.target.value) || 10 },
                    })
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Height (pt)</label>
                <input
                  type="number"
                  value={Math.round(shapeEl.bbox.height)}
                  onChange={(e) =>
                    onUpdateShape(shapeEl.id, {
                      bbox: { ...shapeEl.bbox, height: Number(e.target.value) || 10 },
                    })
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // 3. IMAGE ELEMENT SELECTED
  if (selectedElement && selectedElement.kind === "image") {
    const imageEl = selectedElement as PDFImageElement;

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string;
        onUpdateImage(imageEl.id, {
          imageData,
          mimeType: file.type.includes("png") ? "image/png" : "image/jpeg",
        });
      };
      reader.readAsDataURL(file);
    };

    return (
      <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            <span>Image Properties</span>
          </div>
          <button
            onClick={() => onDeleteElement(imageEl.id)}
            className="flex items-center gap-1 rounded bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>

        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageFileChange}
          accept="image/png,image/jpeg"
          className="hidden"
        />

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950 p-4">
            {imageEl.imageData ? (
              <img
                src={imageEl.imageData}
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

          <div className="rounded-lg border border-slate-800/80 bg-slate-950/40 p-3">
            <span className="mb-2 block text-[11px] font-medium text-slate-400">Dimensions</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500">Width (pt)</label>
                <input
                  type="number"
                  value={Math.round(imageEl.bbox.width)}
                  onChange={(e) =>
                    onUpdateImage(imageEl.id, {
                      bbox: { ...imageEl.bbox, width: Number(e.target.value) || 20 },
                    })
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500">Height (pt)</label>
                <input
                  type="number"
                  value={Math.round(imageEl.bbox.height)}
                  onChange={(e) =>
                    onUpdateImage(imageEl.id, {
                      bbox: { ...imageEl.bbox, height: Number(e.target.value) || 20 },
                    })
                  }
                  className="w-full rounded border border-slate-800 bg-slate-900 p-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // 4. NO ELEMENT SELECTED: DOCUMENT & PAGE LEVEL ACTIONS (Themes, OCR, Insert Tools)
  return (
    <aside className="flex w-80 shrink-0 flex-col border-l border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
      <div className="mb-4 border-b border-slate-800 pb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Document Tools & Themes
        </h3>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
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

        {/* OCR Scanned Document */}
        <div>
          <span className="mb-2 block text-xs font-medium text-slate-300">Scanned Document OCR</span>
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
                      style={{ backgroundColor: rgbToHex(theme.primary) }}
                    />
                    <span
                      className="h-3 w-3 rounded-full border border-slate-700 shadow-sm"
                      style={{ backgroundColor: rgbToHex(theme.secondary) }}
                    />
                    <span
                      className="h-3 w-3 rounded-full border border-slate-700 shadow-sm"
                      style={{ backgroundColor: rgbToHex(theme.accent) }}
                    />
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{theme.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
