"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  TrashIcon,
  ClipboardDocumentCheckIcon,
  ClipboardIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import {
  uploadSingleMedia,
  formatMediaBytes,
  UploadedAssetResult,
  UploadStageProgress,
} from "@/lib/media/unifiedUploadEngine";

export interface MediaAssetRecord {
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
  storageKey?: string | null;
  status?: string;
  createdAt?: string;
  metadata?: any;
}

interface MediaLibraryClientProps {
  companyId: string;
  slug: string;
  storeName: string;
}

export default function MediaLibraryClient({
  companyId,
  slug,
  storeName,
}: MediaLibraryClientProps) {
  // State
  const [items, setItems] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<"ALL" | "IMAGE" | "VIDEO" | "DOCUMENT">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Upload modal & queue state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [activeUploads, setActiveUploads] = useState<
    Array<{
      id: string;
      fileName: string;
      progress: number;
      stage: string;
      status: "queued" | "uploading" | "success" | "error";
      error?: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch assets from API
  const fetchAssets = useCallback(async () => {
    try {
      setRefreshing(true);
      const url = new URL("/api/media/assets", window.location.origin);
      url.searchParams.set("companyId", companyId);
      url.searchParams.set("limit", "100");
      if (selectedType !== "ALL") {
        url.searchParams.set("type", selectedType);
      }
      if (searchQuery.trim()) {
        url.searchParams.set("search", searchQuery.trim());
      }

      const res = await fetch(url.toString(), {
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to load media (${res.status})`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err: any) {
      console.error("Failed fetching media library:", err);
      toast.error(err.message || "Could not load media assets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, selectedType, searchQuery]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Derived metrics
  const stats = useMemo(() => {
    let totalBytes = 0;
    let imageCount = 0;
    let videoCount = 0;
    let docCount = 0;

    items.forEach((item) => {
      totalBytes += item.size || 0;
      if (item.type === "IMAGE") imageCount++;
      else if (item.type === "VIDEO") videoCount++;
      else docCount++;
    });

    return {
      total: items.length,
      formattedSize: formatMediaBytes(totalBytes),
      imageCount,
      videoCount,
      docCount,
    };
  }, [items]);

  // Copy CDN URL with feedback
  const handleCopyUrl = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("CDN link copied to clipboard!", { duration: 2500 });
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  // Soft Delete handler
  const handleDeleteAsset = async (asset: MediaAssetRecord) => {
    if (!confirm(`Are you sure you want to remove "${asset.originalName || "this asset"}" from your store media library?`)) {
      return;
    }

    try {
      setIsDeleting(asset.id);
      const res = await fetch(`/api/media/assets?id=${asset.id}&companyId=${companyId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete media asset");
      }

      setItems((prev) => prev.filter((i) => i.id !== asset.id));
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
      }
      toast.success("Media asset soft-deleted safely.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete asset");
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle file upload
  const handleFilesChosen = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploadModalOpen(true);

    const newUploadItems = fileArray.map((file) => ({
      id: crypto.randomUUID(),
      fileName: file.name,
      progress: 0,
      stage: "queued",
      status: "queued" as const,
    }));

    setActiveUploads((prev) => [...prev, ...newUploadItems]);

    // Process uploads sequentially or with controlled concurrency
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const uploadId = newUploadItems[i].id;

      setActiveUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId ? { ...u, status: "uploading", stage: "authorizing" } : u
        )
      );

      try {
        const category = file.type.startsWith("video/")
          ? "video"
          : file.type.includes("pdf")
          ? "document"
          : "image";

        const result: UploadedAssetResult = await uploadSingleMedia(file, {
          companyId,
          category,
          processVariants: category === "image",
          onProgress: (p: UploadStageProgress) => {
            setActiveUploads((prev) =>
              prev.map((u) =>
                u.id === uploadId
                  ? {
                      ...u,
                      progress: p.percentage,
                      stage: p.stage,
                    }
                  : u
              )
            );
          },
        });

        setActiveUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? { ...u, progress: 100, stage: "completed", status: "success" }
              : u
          )
        );

        // Append new asset to items list
        setItems((prev) => [
          {
            id: result.mediaId,
            url: result.cdnUrl || result.url,
            originalName: result.originalName,
            type: (result.type || "IMAGE") as any,
            size: result.size,
            variants: result.variants,
            thumbnailUrl: result.thumbnailUrl,
            status: "READY",
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } catch (err: any) {
        console.error(`Upload error for ${file.name}:`, err);
        setActiveUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId
              ? {
                  ...u,
                  status: "error",
                  error: err.message || "Upload failed",
                }
              : u
          )
        );
      }
    }

    toast.success("Upload queue processing finished!");
    fetchAssets();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans p-4 sm:p-6 lg:p-8">
      <Toaster position="top-center" />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        className="hidden"
        onChange={(e) => e.target.files && handleFilesChosen(e.target.files)}
      />

      <div className="max-w-[1700px] mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                <PhotoIcon className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Store Media Library</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    S3 + CloudFront CDN
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                  Centralized high-performance media hub for <span className="font-bold text-zinc-800 dark:text-zinc-200">{storeName}</span> products, vertical reels, and marketing banners.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchAssets()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
            >
              <ArrowPathIcon className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg active:scale-98"
            >
              <CloudArrowUpIcon className="w-4 h-4" />
              <span>Upload New Media</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Assets</span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {stats.total.toLocaleString()}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Storage Footprint</span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {stats.formattedSize}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">WebP Images</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.imageCount}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Marketplace Videos</span>
            <div className="text-2xl font-black text-amber-500 mt-1">
              {stats.videoCount}
            </div>
          </div>
        </div>

        {/* Search, Filter & View Controls */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "ALL", label: "All Formats" },
              { id: "IMAGE", label: "Photos & WebP", icon: PhotoIcon },
              { id: "VIDEO", label: "Videos & Reels", icon: VideoCameraIcon },
              { id: "DOCUMENT", label: "Documents", icon: DocumentIcon },
            ].map((tab) => {
              const isActive = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedType(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar & View Mode Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative grow md:w-72">
              <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Layout with Main Grid and Side Drawer */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Content Area */}
          <div className={`w-full transition-all duration-300 ${selectedAsset ? "lg:w-2/3 xl:w-3/4" : "w-full"}`}>
            {loading ? (
              <div className="py-24 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <ArrowPathIcon className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-3" />
                <p className="text-sm font-semibold text-zinc-500">Connecting to store media catalog...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-24 text-center bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
                <CloudArrowUpIcon className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No media assets found</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                  Upload product photos, reels, or marketing banners to start building your store media catalog.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
                >
                  <CloudArrowUpIcon className="w-4 h-4" />
                  <span>Upload Now</span>
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* Visual Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  const isVideo = asset.type === "VIDEO";
                  const isCopied = copiedId === asset.id;

                  return (
                    <motion.div
                      key={asset.id}
                      layout
                      onClick={() => setSelectedAsset(asset)}
                      className={`group relative flex flex-col justify-between overflow-hidden bg-white dark:bg-zinc-900 border-2 rounded-2xl cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                        isSelected
                          ? "border-indigo-600 ring-2 ring-indigo-500/20"
                          : "border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {/* Media Thumbnail */}
                      <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                        {isVideo ? (
                          asset.thumbnailUrl ? (
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.originalName || "video"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-400">
                              <VideoCameraIcon className="w-10 h-10" />
                              <span className="text-[10px] font-bold mt-1">Reel Clip</span>
                            </div>
                          )
                        ) : asset.type === "IMAGE" ? (
                          <img
                            src={asset.thumbnailUrl || asset.url}
                            alt={asset.originalName || "media"}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-400">
                            <DocumentIcon className="w-10 h-10" />
                            <span className="text-[10px] font-bold mt-1">Document</span>
                          </div>
                        )}

                        {/* Type Badge */}
                        <div className="absolute top-2 left-2 z-10">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${
                              isVideo
                                ? "bg-amber-500 text-zinc-950 font-bold"
                                : asset.type === "IMAGE"
                                ? "bg-black/60 text-white"
                                : "bg-indigo-600 text-white"
                            }`}
                          >
                            {asset.type}
                          </span>
                        </div>

                        {/* File Size Badge */}
                        {asset.size && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow z-10">
                            {formatMediaBytes(asset.size)}
                          </div>
                        )}

                        {/* Hover Overlay Buttons */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2 z-20">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyUrl(asset.url, asset.id);
                            }}
                            title="Copy CDN URL"
                            className="p-2 rounded-xl bg-white/90 hover:bg-white text-zinc-900 shadow-md transition-transform hover:scale-110"
                          >
                            {isCopied ? (
                              <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ClipboardIcon className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAsset(asset);
                            }}
                            title="Inspect Details"
                            className="p-2 rounded-xl bg-white/90 hover:bg-white text-zinc-900 shadow-md transition-transform hover:scale-110"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Filename & Info Footer */}
                      <div className="p-2.5 bg-white dark:bg-zinc-900">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {asset.originalName || "Untitled Media"}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-0.5">
                          <span>{asset.width && asset.height ? `${asset.width}x${asset.height}` : "Optimized"}</span>
                          <span>{asset.status === "READY" ? "Ready" : asset.status}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Detail Table View */
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Preview</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Dimensions</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-medium">
                    {items.map((asset) => {
                      const isCopied = copiedId === asset.id;
                      return (
                        <tr
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-4">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                              <img
                                src={asset.thumbnailUrl || asset.url}
                                alt="thumb"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-zinc-800 dark:text-zinc-200">
                            {asset.originalName || "Asset"}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                              {asset.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-zinc-500 font-mono">
                            {formatMediaBytes(asset.size || 0)}
                          </td>
                          <td className="py-2.5 px-4 text-zinc-500">
                            {asset.width && asset.height ? `${asset.width} × ${asset.height}` : "—"}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyUrl(asset.url, asset.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                              >
                                {isCopied ? (
                                  <ClipboardDocumentCheckIcon className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <ClipboardIcon className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAsset(asset);
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Side Inspection Drawer */}
          <AnimatePresence>
            {selectedAsset && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full lg:w-1/3 xl:w-1/4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-lg space-y-4 shrink-0 sticky top-6"
              >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <InformationCircleIcon className="w-4 h-4 text-indigo-500" />
                    <span>Asset Details</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedAsset(null)}
                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Media Preview Player */}
                <div className="aspect-square w-full rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center">
                  {selectedAsset.type === "VIDEO" ? (
                    <video
                      src={selectedAsset.url}
                      controls
                      poster={selectedAsset.thumbnailUrl || undefined}
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : selectedAsset.type === "IMAGE" ? (
                    <img
                      src={selectedAsset.url}
                      alt="preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <DocumentIcon className="w-16 h-16 text-zinc-400" />
                  )}
                </div>

                {/* Metadata Items */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 text-[11px] font-bold uppercase">Filename</span>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 break-all">
                      {selectedAsset.originalName || "Asset"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="text-zinc-400 text-[10px] font-bold uppercase">Size</span>
                      <p className="font-mono text-zinc-700 dark:text-zinc-300">
                        {formatMediaBytes(selectedAsset.size || 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[10px] font-bold uppercase">Dimensions</span>
                      <p className="text-zinc-700 dark:text-zinc-300 font-mono">
                        {selectedAsset.width && selectedAsset.height
                          ? `${selectedAsset.width} × ${selectedAsset.height}`
                          : "Responsive WebP"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase">CloudFront CDN Link</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="text"
                        readOnly
                        value={selectedAsset.url}
                        className="grow px-2 py-1.5 text-[11px] font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 truncate"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(selectedAsset.url, selectedAsset.id)}
                        className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Responsive Variants Info */}
                  {selectedAsset.variants && (
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-zinc-400 text-[10px] font-bold uppercase flex items-center gap-1">
                        <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>Adaptive Variants</span>
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.keys(selectedAsset.variants).map((variantKey) => (
                          <span
                            key={variantKey}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase"
                          >
                            {variantKey}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                    <a
                      href={selectedAsset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grow text-center py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Open Full Size
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteAsset(selectedAsset)}
                      disabled={isDeleting === selectedAsset.id}
                      className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 border border-rose-200 dark:border-rose-900 font-bold hover:bg-rose-100 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating / Active Uploads Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <CloudArrowUpIcon className="w-4 h-4 text-indigo-600" />
                <span>Upload Queue ({activeUploads.length})</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {activeUploads.map((task) => (
                <div
                  key={task.id}
                  className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                      {task.fileName}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">
                      {task.stage}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 transition-all duration-200 ${
                        task.status === "error"
                          ? "bg-rose-500"
                          : task.status === "success"
                          ? "bg-emerald-500"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>

                  {task.error && (
                    <p className="text-[10px] text-rose-500 font-medium">{task.error}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
