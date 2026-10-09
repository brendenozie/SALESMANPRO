"use client";

import React, { useRef } from "react";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export interface PDFToolbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onUploadFile: (file: File) => void;
  onLoadAurumSample: () => void;
  onExport: () => void;
  isExporting: boolean;
  viewMode: "edited" | "compare" | "original";
  onViewModeChange: (mode: "edited" | "compare" | "original") => void;
  saveStatus?: "saved" | "saving" | "unsaved";
  isAnalyzing?: boolean;
}

export const PDFToolbar: React.FC<PDFToolbarProps> = ({
  projectName,
  onProjectNameChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  onUploadFile,
  onLoadAurumSample,
  onExport,
  isExporting,
  viewMode,
  onViewModeChange,
  saveStatus = "saved",
  isAnalyzing = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 backdrop-blur-md">
      {/* Left: Project title & File actions */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,application/pdf"
          className="hidden"
        />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/20">
            <SparklesIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <input
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-48 bg-transparent text-sm font-semibold text-slate-100 outline-none transition focus:border-b focus:border-cyan-400 sm:w-64"
              placeholder="Untitled Document"
            />
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan-400" />
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  All edits saved
                </span>
              )}
              {saveStatus === "unsaved" && (
                <span className="flex items-center gap-1 text-amber-400">
                  <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                  Unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="hidden h-6 w-px bg-slate-800 md:block" />

        {/* Upload & Load Sample */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-50"
            title="Import an existing PDF"
          >
            <DocumentArrowUpIcon className="h-4 w-4 text-cyan-400" />
            <span>{isAnalyzing ? "Analyzing..." : "Import PDF"}</span>
          </button>

          <button
            onClick={onLoadAurumSample}
            disabled={isAnalyzing}
            className="hidden items-center gap-1.5 rounded-lg border border-amber-600/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50 sm:flex"
            title="Load the 4-page Aurum Offer real-world test fixture"
          >
            <DocumentDuplicateIcon className="h-4 w-4 text-amber-400" />
            <span>Load Aurum Fixture</span>
          </button>
        </div>
      </div>

      {/* Center: Undo / Redo / Zoom / View Mode */}
      <div className="flex items-center gap-2">
        {/* Undo & Redo */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:text-slate-600"
            title="Undo (Ctrl+Z)"
          >
            <ArrowUturnLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:text-slate-600"
            title="Redo (Ctrl+Y)"
          >
            <ArrowUturnRightIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 px-1 py-0.5">
          <button
            onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}
            className="rounded p-1 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs font-medium text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.5, zoom + 0.1))}
            className="rounded p-1 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            title="Reset Zoom to 100%"
          >
            100%
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="hidden rounded-lg border border-slate-800 bg-slate-950 p-0.5 sm:flex">
          <button
            onClick={() => onViewModeChange("edited")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "edited"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Edited
          </button>
          <button
            onClick={() => onViewModeChange("compare")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "compare"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => onViewModeChange("original")}
            className={`rounded px-2.5 py-1 text-xs font-medium transition ${
              viewMode === "original"
                ? "bg-cyan-500/20 text-cyan-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* Right: Export Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>{isExporting ? "Reconstructing PDF..." : "Export PDF"}</span>
        </button>
      </div>
    </header>
  );
};
