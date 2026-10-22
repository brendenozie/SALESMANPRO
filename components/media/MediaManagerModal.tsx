"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  XMarkIcon,
  CloudArrowUpIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  FolderOpenIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  uploadSingleMedia,
  formatMediaBytes,
  UploadedAssetResult,
  UploadStageProgress,
} from "@/lib/media/unifiedUploadEngine";
import toast from "react-hot-toast";

export interface MediaItemDisplay {
  id: string;
  url: string;
  originalName?: string | null;
  type: "IMAGE" | "VIDEO" | "BOOK" | "DOCUMENT";
  size?: number | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  variants?: any;
  thumbnailUrl?: string | null;
  createdAt?: string;
  status?: string;
}

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
  onSelect: (selected: MediaItemDisplay[]) => void;
  multiple?: boolean;
  acceptedCategory?: "image" | "video" | "book" | "document" | "all";
  maxSelectCount?: number;
  title?: string;
}

export default function MediaManagerModal({
  isOpen,
  onClose,
  companyId,
  onSelect,
  multiple = false,
  acceptedCategory = "all",
  maxSelectCount = 10,
  title = "Media Asset Library",
}: MediaManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    acceptedCategory === "all" ? "ALL" : acceptedCategory.toUpperCase()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryItems, setLibraryItems] = useState<MediaItemDisplay[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedItems, setSelectedItems] = useState<MediaItemDisplay[]>([]);
  const [inspectItem, setInspectItem] = useState<MediaItemDisplay | null>(null);

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<{
    file: File;
    id: string;
    progress: UploadStageProgress;
    error?: string;
    result?: UploadedAssetResult;
    controller?: AbortController;
  }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch store media assets
  const fetchLibrary = useCallback(async () => {
    setIsLoadingLibrary(true);
    try {
      const typeParam = categoryFilter !== "ALL" ? `&type=${categoryFilter}` : "";
      const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : "";
      const companyParam = companyId ? `&companyId=${encodeURIComponent(companyId)}` : "";

      const res = await fetch(`/api/media/assets?status=READY${typeParam}${searchParam}${companyParam}`);
      if (res.ok) {
        const data = await res.json();
        setLibraryItems(data.items || []);
      }
    } catch (err) {
      console.error("[FETCH_LIBRARY_ERROR]", err);
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [categoryFilter, searchQuery, companyId]);

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    } else {
      setSelectedItems([]);
      setInspectItem(null);
      setPendingUploads([]);
    }
  }, [isOpen, fetchLibrary]);

  if (!isOpen) return null;

  // Selection toggle
  const toggleSelect = (item: MediaItemDisplay) => {
    if (!multiple) {
      setSelectedItems([item]);
      return;
    }

    setSelectedItems((prev) => {
      const exists = prev.find((it) => it.id === item.id);
      if (exists) {
        return prev.filter((it) => it.id !== item.id);
      }
      if (prev.length >= maxSelectCount) {
        toast.error(`Maximum limit of ${maxSelectCount} assets allowed.`);
        return prev;
      }
      return [...prev, item];
    });
  };

  const handleConfirmSelection = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one media asset.");
      return;
    }
    onSelect(selectedItems);
    onClose();
  };

  // Upload handler
  const handleUploadFiles = async (files: File[]) => {
    if (!files.length) return;

    setActiveTab("upload");

    const newEntries = files.map((file) => ({
      file,
      id: crypto.randomUUID(),
      progress: { percentage: 5, stage: "authorizing" as const },
      controller: new AbortController(),
    }));

    setPendingUploads((prev) => [...newEntries, ...prev]);

    // Process uploads
    for (const entry of newEntries) {
      try {
        const result = await uploadSingleMedia(entry.file, {
          companyId,
          signal: entry.controller.signal,
          onProgress: (p) => {
            setPendingUploads((curr) =>
              curr.map((item) => (item.id === entry.id ? { ...item, progress: p } : item))
            );
          },
        });

        setPendingUploads((curr) =>
          curr.map((item) =>
            item.id === entry.id
              ? {
                  ...item,
                  progress: { percentage: 100, stage: "completed" },
                  result,
                }
              : item
          )
        );

        // Prepend to library and auto-select if single selection
        const createdItem: MediaItemDisplay = {
          id: result.id,
          url: result.cdnUrl || result.url,
          originalName: entry.file.name,
          type: entry.file.type.startsWith("video/")
            ? "VIDEO"
            : entry.file.type === "application/pdf"
            ? "BOOK"
            : "IMAGE",
          size: result.fileSize,
          width: result.width,
          height: result.height,
          variants: result.variants,
          thumbnailUrl: result.variants?.thumbnail || result.cdnUrl,
        };

        setLibraryItems((prev) => [createdItem, ...prev]);

        if (!multiple && selectedItems.length === 0) {
          setSelectedItems([createdItem]);
        }
      } catch (uploadErr: any) {
        setPendingUploads((curr) =>
          curr.map((item) =>
            item.id === entry.id
              ? {
                  ...item,
                  progress: { percentage: 0, stage: "error" },
                  error: uploadErr.message || "Upload failed",
                }
              : item
          )
        );
      }
    }
  };

  // Delete handler
  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to remove this asset from your store library?")) {
      return;
    }

    try {
      const companyParam = companyId ? `&companyId=${encodeURIComponent(companyId)}` : "";
      const res = await fetch(`/api/media/assets?id=${mediaId}${companyParam}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Asset deleted successfully.");
        setLibraryItems((prev) => prev.filter((it) => it.id !== mediaId));
        setSelectedItems((prev) => prev.filter((it) => it.id !== mediaId));
        if (inspectItem?.id === mediaId) setInspectItem(null);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to delete asset.");
      }
    } catch {
      toast.error("Network error while deleting media.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-5xl h-[85vh] max-h-[820px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              <PhotoIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Centralized storage, responsive variants & multi-tenant security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("library")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "library"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <FolderOpenIcon className="w-4 h-4" />
              <span>Library ({libraryItems.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "upload"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <CloudArrowUpIcon className="w-4 h-4" />
              <span>Upload New</span>
            </button>
          </div>

          {/* Search & Category Filter (Library View) */}
          {activeTab === "library" && (
            <div className="flex items-center gap-2 flex-1 justify-end">
              <div className="relative max-w-xs w-full">
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLibrary()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-zinc-700 dark:text-zinc-200"
              >
                <option value="ALL">All Media</option>
                <option value="IMAGE">Photos & Graphics</option>
                <option value="VIDEO">Videos & Reels</option>
                <option value="BOOK">Books & PDFs</option>
              </select>

              <button
                onClick={fetchLibrary}
                title="Refresh library"
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoadingLibrary ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Grid / Dropzone */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "upload" ? (
              <div className="space-y-6">
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files) {
                      handleUploadFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition duration-150 text-center ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept={
                      acceptedCategory === "video"
                        ? "video/*"
                        : acceptedCategory === "book"
                        ? "application/pdf,.epub"
                        : "image/*,video/*,application/pdf"
                    }
                    onChange={(e) => {
                      if (e.target.files) handleUploadFiles(Array.from(e.target.files));
                      e.target.value = "";
                    }}
                    className="hidden"
                  />

                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
                    <CloudArrowUpIcon className="w-7 h-7" />
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Drag and drop files here, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      browse device
                    </button>
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Supports high-resolution WebP/JPEG, vertical MP4 reels (up to 100MB), and catalog documents.
                  </p>
                </div>

                {/* In-Flight Upload List */}
                {pendingUploads.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                      Recent Upload Tasks
                    </h4>
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                      {pendingUploads.map((task) => (
                        <div key={task.id} className="p-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 flex-shrink-0">
                              {task.file.type.startsWith("video/") ? (
                                <VideoCameraIcon className="w-4 h-4" />
                              ) : (
                                <PhotoIcon className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {task.file.name}
                              </p>
                              <p className="text-[11px] text-zinc-500">
                                {formatMediaBytes(task.file.size)} • {task.progress.stage}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            {task.progress.stage === "completed" ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircleIcon className="w-4 h-4" /> Ready
                              </span>
                            ) : task.error ? (
                              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                                <ExclamationCircleIcon className="w-4 h-4" /> Failed
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-indigo-600 h-full transition-all duration-150"
                                    style={{ width: `${task.progress.percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                                  {task.progress.percentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Library Grid View */
              <div>
                {isLoadingLibrary && libraryItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                    <ArrowPathIcon className="w-6 h-6 animate-spin mb-2" />
                    <p className="text-xs">Loading media assets...</p>
                  </div>
                ) : libraryItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <PhotoIcon className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      No media assets found
                    </p>
                    <p className="text-xs text-zinc-500 mb-4">
                      Upload photos or videos to begin building your store asset library.
                    </p>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                    >
                      Upload First Asset
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {libraryItems.map((item) => {
                      const isSelected = selectedItems.some((s) => s.id === item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSelect(item)}
                          className={`group relative flex flex-col aspect-square rounded-xl overflow-hidden border cursor-pointer transition select-none bg-zinc-100 dark:bg-zinc-800 ${
                            isSelected
                              ? "border-indigo-600 ring-2 ring-indigo-600/30"
                              : "border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-400"
                          }`}
                        >
                          {/* Media Preview */}
                          {item.type === "VIDEO" ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                              {item.thumbnailUrl ? (
                                <img
                                  src={item.thumbnailUrl}
                                  alt={item.originalName || "Video"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <VideoCameraIcon className="w-10 h-10 text-zinc-600" />
                              )}
                              <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white flex items-center gap-1">
                                <VideoCameraIcon className="w-3 h-3" /> VIDEO
                              </span>
                            </div>
                          ) : item.type === "BOOK" ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-zinc-500 bg-zinc-50 dark:bg-zinc-900">
                              <DocumentIcon className="w-8 h-8 mb-1 text-zinc-400" />
                              <span className="text-[10px] font-semibold text-center truncate max-w-full">
                                {item.originalName || "Document"}
                              </span>
                            </div>
                          ) : (
                            <img
                              src={item.variants?.thumbnail || item.thumbnailUrl || item.url}
                              alt={item.originalName || "Image"}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />
                          )}

                          {/* Selection Checkmark Badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                              <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Quick Inspect Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectItem(item);
                            }}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition"
                            title="Inspect details"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Asset Inspector Sidebar */}
          {inspectItem && (
            <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 p-5 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Asset Details
                  </h4>
                  <button
                    onClick={() => setInspectItem(null)}
                    className="text-zinc-400 hover:text-zinc-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                  {inspectItem.type === "VIDEO" ? (
                    <video
                      src={inspectItem.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={inspectItem.url}
                      alt={inspectItem.originalName || "Preview"}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Filename</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 break-all">
                      {inspectItem.originalName || "Unnamed asset"}
                    </span>
                  </div>

                  {inspectItem.size && (
                    <div>
                      <span className="text-zinc-400 block text-[10px]">File Size</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {formatMediaBytes(inspectItem.size)}
                      </span>
                    </div>
                  )}

                  {inspectItem.width && inspectItem.height && (
                    <div>
                      <span className="text-zinc-400 block text-[10px]">Dimensions</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {inspectItem.width} × {inspectItem.height} px
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-zinc-400 block text-[10px]">CDN URL</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(inspectItem.url);
                        toast.success("URL copied to clipboard!");
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:underline"
                    >
                      Copy Public CDN URL
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <button
                  type="button"
                  onClick={() => handleDeleteMedia(inspectItem.id)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Remove from Library</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="text-xs text-zinc-500">
            {selectedItems.length > 0 ? (
              <span>
                <strong className="text-zinc-900 dark:text-zinc-100">{selectedItems.length}</strong>{" "}
                asset(s) selected
              </span>
            ) : (
              <span>Select an asset to attach or upload new files</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedItems.length === 0}
              onClick={handleConfirmSelection}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none transition shadow-sm"
            >
              Attach {selectedItems.length > 0 ? `(${selectedItems.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
