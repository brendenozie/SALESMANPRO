"use client";

import React, { useState, useEffect } from "react";
import type { PDFProjectSummary } from "@/lib/pdf-editor/storage/project-storage";
import {
  FolderIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export interface PDFDocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  currentProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onUploadNew: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const PDFDocumentManager: React.FC<PDFDocumentManagerProps> = ({
  isOpen,
  onClose,
  companyId,
  currentProjectId,
  onSelectProject,
  onUploadNew,
}) => {
  const [projects, setProjects] = useState<PDFProjectSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/pdf/projects?companyId=${encodeURIComponent(companyId)}`);
      if (!res.ok) throw new Error("Failed to load uploaded documents");
      const json = await res.json();
      const list = json.data?.projects || json.projects || [];
      setProjects(list);
    } catch (err: any) {
      setError(err.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, companyId]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setDeletingId(id);
      const res = await fetch(`/api/pdf/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete document");
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (currentProjectId === id) {
        // If current project was deleted, refresh page or close
      }
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30">
              <FolderIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                All Uploaded Documents
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                  {projects.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Browse, open, inspect, download, or delete your store's uploaded PDF files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onUploadNew();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-600/20 hover:bg-cyan-500 transition"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span>Upload PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-slate-900/80">
          <div className="relative w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search uploaded documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 transition"
            />
          </div>

          <button
            onClick={fetchProjects}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:text-white transition disabled:opacity-50"
            title="Refresh documents list"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="text-xs">Loading uploaded documents...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-rose-400">
              <p className="text-xs font-semibold">{error}</p>
              <button
                onClick={fetchProjects}
                className="mt-2 rounded bg-slate-800 px-3 py-1 text-xs text-white hover:bg-slate-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && filteredProjects.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <DocumentTextIcon className="h-12 w-12 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No documents found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                {search
                  ? `No documents matching "${search}". Try another search term.`
                  : "You haven't uploaded any PDF documents to this store yet. Click 'Upload PDF' to get started."}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onUploadNew();
                }}
                className="mt-4 flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                <span>Upload First PDF</span>
              </button>
            </div>
          )}

          {!loading && !error && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((p) => {
                const isCurrent = p.id === currentProjectId;
                return (
                  <div
                    key={p.id}
                    className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all ${
                      isCurrent
                        ? "border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/40"
                        : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/90"
                    }`}
                  >
                    <div>
                      {/* Top metadata */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <DocumentTextIcon className="h-5 w-5" />
                          </div>
                          <div className="overflow-hidden">
                            <h3
                              className="truncate text-xs font-semibold text-white group-hover:text-cyan-300 transition"
                              title={p.name}
                            >
                              {p.name}
                            </h3>
                            <span className="text-[10px] text-slate-500">ID: {p.id.slice(0, 12)}...</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Document Details Badge List */}
                      <div className="mb-4 space-y-1.5 rounded-lg bg-slate-900/80 p-2.5 text-[11px] text-slate-400 border border-slate-800/80">
                        <div className="flex justify-between">
                          <span>Pages:</span>
                          <span className="font-semibold text-slate-200">{p.pageCount} pages</span>
                        </div>
                        <div className="flex justify-between">
                          <span>File Size:</span>
                          <span className="font-semibold text-slate-200">{formatBytes(p.fileSizeBytes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revision:</span>
                          <span className="font-semibold text-slate-200">
                            v{p.revision} {p.hasExported && <span className="text-emerald-400">(Exported)</span>}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uploaded:</span>
                          <span className="text-slate-300">{formatDate(p.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 gap-2">
                      <button
                        onClick={() => {
                          onSelectProject(p.id);
                          onClose();
                        }}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${
                          isCurrent
                            ? "bg-cyan-500 text-slate-950 font-bold"
                            : "bg-slate-800 text-slate-200 hover:bg-cyan-600 hover:text-white"
                        }`}
                      >
                        {isCurrent ? "Currently Open" : "Open in Editor"}
                      </button>

                      {/* Download Original Binary */}
                      <a
                        href={`/api/pdf/projects/${p.id}?binary=original`}
                        download={`${p.name}`}
                        className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:border-slate-700 hover:text-white transition"
                        title="Download Original PDF"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </a>

                      {/* Delete project */}
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deletingId === p.id}
                        className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-rose-400 hover:border-rose-900/60 hover:bg-rose-500/10 transition disabled:opacity-50"
                        title="Delete document"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
