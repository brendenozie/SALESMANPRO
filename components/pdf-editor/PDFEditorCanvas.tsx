"use client";

import React, { useState, useRef, useEffect } from "react";
import type {
  PDFDocumentModel,
  PDFElement,
  PDFImageElement,
  PDFPageModel,
  PDFShapeElement,
  PDFTextElement,
  RGBColor,
} from "@/lib/pdf-editor/model/types";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

if (typeof window !== "undefined" && (pdfjs as any).GlobalWorkerOptions) {
  (pdfjs as any).GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
}

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
  projectId?: string;
  pdfBytes?: Uint8Array | null;
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
  projectId,
  pdfBytes: propPdfBytes,
}) => {
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const [rawPdfBytes, setRawPdfBytes] = useState<Uint8Array | null>(propPdfBytes || null);
  const [isCanvasRendering, setIsCanvasRendering] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const compareCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Fetch original binary PDF bytes for high-fidelity rendering if not provided
  useEffect(() => {
    if (propPdfBytes) {
      setRawPdfBytes(propPdfBytes);
      return;
    }
    if (!projectId || projectId === "default") return;

    let cancelled = false;
    async function loadBytes() {
      try {
        const res = await fetch(`/api/pdf/projects/${projectId}?binary=original`);
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        if (!cancelled) {
          setRawPdfBytes(new Uint8Array(buf));
        }
      } catch (err) {
        console.warn("Failed to load binary PDF for canvas render:", err);
      }
    }
    loadBytes();
    return () => {
      cancelled = true;
    };
  }, [projectId, propPdfBytes]);

  // Render true PDF.js page onto background <canvas>
  useEffect(() => {
    if (!rawPdfBytes || !document || !document.pages[activePageIndex]) return;
    const activePage = document.pages[activePageIndex];

    let isMounted = true;
    async function renderPage() {
      try {
        setIsCanvasRendering(true);
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const loadingTask = (pdfjs as any).getDocument({
          data: rawPdfBytes!.slice(),
          useSystemFonts: true,
          disableFontFace: false,
        });
        const pdfDoc = await loadingTask.promise;
        if (!isMounted) return;

        const pNum = Math.min(activePageIndex + 1, pdfDoc.numPages);
        const page = await pdfDoc.getPage(pNum);
        if (!isMounted) return;

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        const viewport = page.getViewport({ scale: zoom, rotation: activePage.rotation });

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          const ctx = canvas.getContext("2d", { alpha: false });
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const renderContext = {
              canvasContext: ctx,
              viewport,
              transform: dpr > 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
            };
            const task = page.render(renderContext);
            renderTaskRef.current = task;
            await task.promise;
          }
        }

        // Compare canvas render
        if (viewMode === "compare" && compareCanvasRef.current) {
          const compCanvas = compareCanvasRef.current;
          compCanvas.width = Math.floor(viewport.width * dpr);
          compCanvas.height = Math.floor(viewport.height * dpr);
          compCanvas.style.width = `${viewport.width}px`;
          compCanvas.style.height = `${viewport.height}px`;
          const compCtx = compCanvas.getContext("2d", { alpha: false });
          if (compCtx) {
            compCtx.fillStyle = "#ffffff";
            compCtx.fillRect(0, 0, compCanvas.width, compCanvas.height);
            await page.render({
              canvasContext: compCtx,
              viewport,
              transform: dpr > 1 ? [dpr, 0, 0, dpr, 0, 0] : null,
            }).promise;
          }
        }
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.warn("PDF.js canvas render notice:", err);
        }
      } finally {
        if (isMounted) setIsCanvasRendering(false);
      }
    }

    renderPage();
    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [rawPdfBytes, activePageIndex, zoom, document, viewMode]);

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
            Select an uploaded document or import a new PDF file to inspect and edit.
          </p>
        </div>
      </main>
    );
  }

  const activePage = document.pages[activePageIndex];
  const origPage = originalDocument?.pages[activePageIndex] || activePage;

  // Viewport dimensions accounting for rotation
  const isRotated90or270 = activePage.rotation === 90 || activePage.rotation === 270;
  const viewportWidth = (isRotated90or270 ? activePage.height : activePage.width) * zoom;
  const viewportHeight = (isRotated90or270 ? activePage.width : activePage.height) * zoom;

  const handlePointerDown = (e: React.PointerEvent, element: PDFElement) => {
    e.stopPropagation();
    onSelectElement(element.id);
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

  const renderInteractiveOverlay = (page: PDFPageModel, isReadOnly = false) => {
    return (
      <div
        className="absolute inset-0 select-none overflow-hidden"
        style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
        onClick={() => !isReadOnly && onSelectElement(null)}
      >
        {/* Render Vector Shapes Overlay */}
        {page.elements
          .filter((e) => e.kind === "shape")
          .map((el) => {
            const shape = el as PDFShapeElement;
            const isSelected = !isReadOnly && shape.id === selectedElementId;
            const isAdded = shape.origin === "added";

            // If it's an added shape or selected, render visually on overlay
            return (
              <div
                key={shape.id}
                onPointerDown={(e) => !isReadOnly && handlePointerDown(e, shape)}
                className={`absolute transition-shadow ${
                  !isReadOnly ? "cursor-move" : ""
                } ${isSelected ? "ring-2 ring-cyan-400 shadow-lg" : ""}`}
                style={{
                  left: `${shape.bbox.x * zoom}px`,
                  top: `${shape.bbox.y * zoom}px`,
                  width: `${shape.bbox.width * zoom}px`,
                  height: `${shape.bbox.height * zoom}px`,
                  backgroundColor: isAdded ? rgbToCss(shape.fill) : isSelected ? "rgba(6, 182, 212, 0.15)" : "transparent",
                  borderColor: isAdded && shape.stroke ? rgbToCss(shape.stroke) : isSelected ? "#22d3ee" : "transparent",
                  borderWidth: `${(shape.lineWidth || 1) * zoom}px`,
                  borderStyle: isSelected ? "dashed" : shape.stroke ? "solid" : "none",
                  zIndex: isSelected ? 40 : shape.zIndex,
                  pointerEvents: shape.role === "background" && !isSelected ? "none" : "auto",
                }}
              />
            );
          })}

        {/* Render Images Overlay */}
        {page.elements
          .filter((e) => e.kind === "image")
          .map((el) => {
            const img = el as PDFImageElement;
            const isSelected = !isReadOnly && img.id === selectedElementId;
            const isReplacedOrAdded = img.origin === "added" || Boolean(img.assetId);

            return (
              <div
                key={img.id}
                onPointerDown={(e) => !isReadOnly && handlePointerDown(e, img)}
                className={`absolute overflow-hidden ${
                  !isReadOnly ? "cursor-move" : ""
                } ${isSelected ? "ring-2 ring-cyan-400 shadow-lg" : ""}`}
                style={{
                  left: `${img.bbox.x * zoom}px`,
                  top: `${img.bbox.y * zoom}px`,
                  width: `${img.bbox.width * zoom}px`,
                  height: `${img.bbox.height * zoom}px`,
                  zIndex: isSelected ? 40 : img.zIndex,
                }}
              >
                {isReplacedOrAdded && img.imageData ? (
                  <img src={img.imageData} alt="PDF Asset" className="h-full w-full object-contain" />
                ) : isSelected ? (
                  <div className="h-full w-full border-2 border-dashed border-cyan-400 bg-cyan-500/10" />
                ) : null}
              </div>
            );
          })}

        {/* Render Text Elements Overlay */}
        {page.elements
          .filter((e) => e.kind === "text")
          .map((el) => {
            const txt = el as PDFTextElement;
            const isSelected = !isReadOnly && txt.id === selectedElementId;
            const isEditing = !isReadOnly && txt.id === editingTextId;
            const isAddedOrOcr = txt.origin === "added" || txt.origin === "ocr";

            return (
              <div
                key={txt.id}
                onPointerDown={(e) => !isReadOnly && handlePointerDown(e, txt)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (!isReadOnly) setEditingTextId(txt.id);
                }}
                className={`absolute flex items-start whitespace-pre ${
                  !isReadOnly ? "cursor-text" : ""
                } ${
                  isSelected
                    ? "rounded border border-dashed border-cyan-400 bg-cyan-400/20 ring-1 ring-cyan-300"
                    : "hover:bg-cyan-500/10"
                }`}
                style={{
                  left: `${txt.bbox.x * zoom}px`,
                  top: `${txt.bbox.y * zoom}px`,
                  minWidth: `${Math.max(txt.bbox.width, 10) * zoom}px`,
                  minHeight: `${txt.fontSize * 1.2 * zoom}px`,
                  fontFamily: txt.fontFamily || "Helvetica, sans-serif",
                  fontSize: `${txt.fontSize * zoom}px`,
                  fontWeight: txt.fontWeight === "bold" ? "bold" : "normal",
                  fontStyle: txt.fontStyle === "italic" ? "italic" : "normal",
                  color: isAddedOrOcr || isEditing ? rgbToCss(txt.color, "#000000") : "transparent",
                  textAlign: txt.alignment || "left",
                  lineHeight: 1.2,
                  zIndex: isSelected || isEditing ? 50 : txt.zIndex,
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
                      if (e.key === "Escape") setEditingTextId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full resize-none border-none bg-slate-900/90 text-white p-1 rounded outline-none ring-1 ring-cyan-400"
                    style={{
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      fontWeight: "inherit",
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
      className="relative flex flex-1 items-center justify-center overflow-auto bg-slate-950 p-6"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {viewMode === "compare" ? (
        <div className="flex gap-8 items-start">
          {/* Left: Original View */}
          <div className="flex flex-col items-center">
            <span className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Original Document
            </span>
            <div
              className="relative shadow-2xl bg-white rounded overflow-hidden"
              style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
            >
              <canvas ref={compareCanvasRef} className="block w-full h-full" />
            </div>
          </div>

          {/* Right: Edited View */}
          <div className="flex flex-col items-center">
            <span className="mb-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              Interactive Editor
            </span>
            <div
              className="relative shadow-2xl bg-white rounded overflow-hidden"
              style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
            >
              <canvas ref={canvasRef} className="block w-full h-full" />
              {renderInteractiveOverlay(activePage, false)}
            </div>
          </div>
        </div>
      ) : (
        /* Standard Single Canvas View */
        <div
          className="relative shadow-2xl bg-white rounded overflow-hidden transition-all"
          style={{ width: `${viewportWidth}px`, height: `${viewportHeight}px` }}
        >
          {/* True PDF.js rendered Canvas */}
          <canvas ref={canvasRef} className="block w-full h-full" />

          {/* Interactive Overlay Layer (hidden in original viewMode) */}
          {viewMode !== "original" && renderInteractiveOverlay(activePage, false)}
        </div>
      )}
    </main>
  );
};
