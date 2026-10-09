"use client";

import React, { useState, useRef } from "react";
import type {
  PDFDocumentModel,
  PDFElement,
  PDFImageElement,
  PDFPageModel,
  PDFShapeElement,
  PDFTextElement,
  RGBColor,
} from "@/lib/pdf-editor/model/types";

export interface PDFEditorCanvasProps {
  document: PDFDocumentModel | null;
  activePageIndex: number;
  zoom: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateTextInline: (id: string, newText: string) => void;
  onMoveElement: (id: string, dx: number, dy: number) => void;
  viewMode: "edited" | "compare" | "original";
  originalDocument?: PDFDocumentModel | null;
}

function rgbToCss(c?: RGBColor | null, defaultColor = "transparent"): string {
  if (!c) return defaultColor;
  return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
}

export const PDFEditorCanvas: React.FC<PDFEditorCanvasProps> = ({
  document,
  activePageIndex,
  zoom,
  selectedElementId,
  onSelectElement,
  onUpdateTextInline,
  onMoveElement,
  viewMode,
  originalDocument,
}) => {
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  if (!document || !document.pages[activePageIndex]) {
    return (
      <main className="flex flex-1 items-center justify-center bg-slate-950 p-8 text-center">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-100">No Document Open</h2>
          <p className="mt-1 text-xs text-slate-400">
            Import an existing PDF file or click "Load Aurum Fixture" from the top bar to inspect and
            structurally edit.
          </p>
        </div>
      </main>
    );
  }

  const activePage = document.pages[activePageIndex];
  const origPage = originalDocument?.pages[activePageIndex] || activePage;

  // Handle Drag Move
  const handlePointerDown = (e: React.PointerEvent, element: PDFElement) => {
    e.stopPropagation();
    onSelectElement(element.id);

    // If already editing text, don't start dragging
    if (editingTextId === element.id) return;

    setDragState({
      elementId: element.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.bbox.x,
      origY: element.bbox.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState) return;
    const dx = (e.clientX - dragState.startX) / zoom;
    const dy = (e.clientY - dragState.startY) / zoom;

    // Apply incremental or final move
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      onMoveElement(dragState.elementId, dx, dy);
      setDragState({
        ...dragState,
        startX: e.clientX,
        startY: e.clientY,
      });
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  const renderPageContent = (page: PDFPageModel, isReadOnly = false) => {
    return (
      <div
        className="relative select-none bg-white shadow-2xl transition-transform"
        style={{
          width: `${page.width * zoom}px`,
          height: `${page.height * zoom}px`,
          backgroundColor: page.background ? rgbToCss(page.background, "#ffffff") : "#ffffff",
        }}
        onClick={() => !isReadOnly && onSelectElement(null)}
      >
        {/* Render Vector Shapes */}
        {page.elements
          .filter((e) => e.kind === "shape")
          .map((el) => {
            const shape = el as PDFShapeElement;
            const isSelected = !isReadOnly && shape.id === selectedElementId;

            return (
              <div
                key={shape.id}
                onPointerDown={(e) => !isReadOnly && handlePointerDown(e, shape)}
                className={`absolute transition-shadow ${
                  !isReadOnly ? "cursor-move" : ""
                } ${isSelected ? "ring-2 ring-cyan-500 shadow-md" : ""}`}
                style={{
                  left: `${shape.bbox.x * zoom}px`,
                  top: `${shape.bbox.y * zoom}px`,
                  width: `${shape.bbox.width * zoom}px`,
                  height: `${shape.bbox.height * zoom}px`,
                  backgroundColor: rgbToCss(shape.fill),
                  borderColor: shape.stroke ? rgbToCss(shape.stroke) : "transparent",
                  borderWidth: `${(shape.lineWidth || 0) * zoom}px`,
                  borderStyle: shape.stroke ? "solid" : "none",
                  zIndex: shape.zIndex,
                }}
              />
            );
          })}

        {/* Render Images */}
        {page.elements
          .filter((e) => e.kind === "image")
          .map((el) => {
            const img = el as PDFImageElement;
            const isSelected = !isReadOnly && img.id === selectedElementId;

            return (
              <div
                key={img.id}
                onPointerDown={(e) => !isReadOnly && handlePointerDown(e, img)}
                className={`absolute overflow-hidden ${
                  !isReadOnly ? "cursor-move" : ""
                } ${isSelected ? "ring-2 ring-cyan-500 shadow-md" : ""}`}
                style={{
                  left: `${img.bbox.x * zoom}px`,
                  top: `${img.bbox.y * zoom}px`,
                  width: `${img.bbox.width * zoom}px`,
                  height: `${img.bbox.height * zoom}px`,
                  zIndex: img.zIndex,
                }}
              >
                {img.imageData ? (
                  <img src={img.imageData} alt="PDF Asset" className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200 text-[10px] text-slate-500">
                    Embedded Image
                  </div>
                )}
              </div>
            );
          })}

        {/* Render Text Elements */}
        {page.elements
          .filter((e) => e.kind === "text")
          .map((el) => {
            const txt = el as PDFTextElement;
            const isSelected = !isReadOnly && txt.id === selectedElementId;
            const isEditing = !isReadOnly && txt.id === editingTextId;

            return (
              <div
                key={txt.id}
                onPointerDown={(e) => !isReadOnly && handlePointerDown(e, txt)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (!isReadOnly) setEditingTextId(txt.id);
                }}
                className={`absolute flex items-start whitespace-pre-wrap ${
                  !isReadOnly ? "cursor-text" : ""
                } ${
                  isSelected
                    ? "rounded border border-dashed border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-400"
                    : "hover:bg-cyan-500/5"
                }`}
                style={{
                  left: `${txt.bbox.x * zoom}px`,
                  top: `${txt.bbox.y * zoom}px`,
                  minWidth: `${Math.max(txt.bbox.width, 20) * zoom}px`,
                  minHeight: `${txt.fontSize * 1.2 * zoom}px`,
                  fontFamily: txt.fontFamily || "Helvetica, sans-serif",
                  fontSize: `${txt.fontSize * zoom}px`,
                  fontWeight: txt.fontWeight === "bold" ? "bold" : "normal",
                  fontStyle: txt.fontStyle === "italic" ? "italic" : "normal",
                  color: rgbToCss(txt.color, "#000000"),
                  textAlign: txt.alignment || "left",
                  lineHeight: 1.2,
                  zIndex: txt.zIndex,
                }}
              >
                {isEditing ? (
                  <textarea
                    autoFocus
                    value={txt.text}
                    rows={Math.max(1, txt.text.split("\n").length)}
                    onChange={(e) => onUpdateTextInline(txt.id, e.target.value)}
                    onBlur={() => setEditingTextId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setEditingTextId(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full resize-none border-none bg-transparent p-0 outline-none"
                    style={{
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      fontWeight: "inherit",
                      color: "inherit",
                      lineHeight: "inherit",
                    }}
                  />
                ) : (
                  <span style={{ pointerEvents: "none" }}>{txt.text}</span>
                )}
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <main
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="flex flex-1 items-start justify-center overflow-auto bg-slate-950 p-8"
    >
      {viewMode === "compare" ? (
        <div className="flex flex-wrap items-start justify-center gap-8">
          {/* Original View */}
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
              Original Document
            </span>
            {renderPageContent(origPage, true)}
          </div>

          {/* Edited View */}
          <div className="flex flex-col items-center gap-2">
            <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-300">
              Edited Document (Live)
            </span>
            {renderPageContent(activePage, false)}
          </div>
        </div>
      ) : viewMode === "original" ? (
        <div className="flex flex-col items-center gap-2">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
            Original Document
          </span>
          {renderPageContent(origPage, true)}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {renderPageContent(activePage, false)}
        </div>
      )}
    </main>
  );
};
