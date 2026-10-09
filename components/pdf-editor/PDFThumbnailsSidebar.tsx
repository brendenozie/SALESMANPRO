"use client";

import React from "react";
import type { PDFDocumentModel, PDFPageModel } from "@/lib/pdf-editor/model/types";
import {
  ArrowPathIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
  PlusIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

export interface PDFThumbnailsSidebarProps {
  document: PDFDocumentModel | null;
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onRotatePage: (pageId: string) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onDeletePage: (pageId: string) => void;
  onAddBlankPage: (afterIndex: number) => void;
}

export const PDFThumbnailsSidebar: React.FC<PDFThumbnailsSidebarProps> = ({
  document,
  activePageIndex,
  onSelectPage,
  onRotatePage,
  onMovePage,
  onDeletePage,
  onAddBlankPage,
}) => {
  if (!document) {
    return (
      <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-900/60 p-4">
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-800 text-xs text-slate-500">
          No document loaded
        </div>
      </aside>
    );
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <DocumentIcon className="h-4 w-4 text-cyan-400" />
          <span>Pages ({document.pages.length})</span>
        </div>
        <button
          onClick={() => onAddBlankPage(document.pages.length - 1)}
          className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-cyan-500/20 hover:text-cyan-300"
          title="Add a new blank page at the end"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {document.pages.map((page, index) => {
          const isActive = index === activePageIndex;
          const textCount = page.elements.filter((e) => e.kind === "text").length;
          const shapeCount = page.elements.filter((e) => e.kind === "shape").length;
          const imageCount = page.elements.filter((e) => e.kind === "image").length;

          return (
            <div
              key={page.id}
              onClick={() => onSelectPage(index)}
              className={`group relative cursor-pointer rounded-xl border p-2.5 transition-all ${
                isActive
                  ? "border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500"
                  : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40"
              }`}
            >
              {/* Thumbnail header */}
              <div className="mb-2 flex items-center justify-between">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {index + 1}
                </span>

                <div className="flex items-center gap-1 opacity-60 transition group-hover:opacity-100">
                  {/* Reorder Up */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) onMovePage(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                    title="Move page up"
                  >
                    <ChevronUpIcon className="h-3.5 w-3.5" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < document.pages.length - 1) onMovePage(index, index + 1);
                    }}
                    disabled={index === document.pages.length - 1}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                    title="Move page down"
                  >
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </button>

                  {/* Rotate 90° */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotatePage(page.id);
                    }}
                    className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-300"
                    title="Rotate page 90° clockwise"
                  >
                    <ArrowPathIcon className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete Page */}
                  {document.pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.id);
                      }}
                      className="rounded p-1 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400"
                      title="Delete page"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mini aspect preview box */}
              <div
                className="relative flex w-full items-center justify-center overflow-hidden rounded-md border border-slate-800/80 bg-white/5 transition group-hover:border-slate-700"
                style={{
                  aspectRatio: `${page.width} / ${page.height}`,
                  transform: `rotate(${page.rotation}deg)`,
                }}
              >
                {/* Visual miniature representation */}
                <div className="absolute inset-1 flex flex-col justify-between p-1 text-[8px] text-slate-500">
                  <div className="flex flex-col gap-0.5">
                    <div className="h-1 w-3/4 rounded-full bg-slate-700/60" />
                    <div className="h-0.5 w-1/2 rounded-full bg-slate-700/40" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="h-0.5 w-full rounded-full bg-slate-800/60" />
                    <div className="h-0.5 w-5/6 rounded-full bg-slate-800/60" />
                  </div>
                </div>

                {page.rotation > 0 && (
                  <span className="absolute bottom-1 right-1 rounded bg-slate-900/80 px-1 text-[8px] font-semibold text-cyan-400">
                    {page.rotation}°
                  </span>
                )}
              </div>

              {/* Elements summary */}
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>
                  {Math.round(page.width)} × {Math.round(page.height)} pt
                </span>
                <span>
                  {textCount}T · {shapeCount}S · {imageCount}I
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
