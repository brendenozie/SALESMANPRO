"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

export interface UploadedMediaItem {
  id: string;
  url: string;
  key?: string;
  fileName: string;
  fileSize: number;
  mediaType: "image" | "video" | "book";
  thumbnailUrl?: string;
  blurDataUrl?: string;
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
}

interface MediaUploadGatewayProps {
  companyId?: string;
  mediaType?: "image" | "video" | "book";
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  existingItems?: UploadedMediaItem[];
  onMediaChanged?: (items: UploadedMediaItem[]) => void;
  processResponsiveVariants?: boolean;
  className?: string;
}

export default function MediaUploadGateway({
  companyId,
  mediaType = "image",
  accept = "image/*",
  multiple = true,
  maxFiles = 10,
  existingItems = [],
  onMediaChanged,
  processResponsiveVariants = true,
  className = "",
}: MediaUploadGatewayProps) {
  const [items, setItems] = useState<UploadedMediaItem[]>(existingItems);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateItems = (newItems: UploadedMediaItem[]) => {
    setItems(newItems);
    onMediaChanged?.(newItems);
  };

  const uploadSingleFile = async (
    file: File,
    itemId: string
  ): Promise<{ url: string; key?: string; blurDataUrl?: string }> => {
    // 1. Request presigned upload URL
    const presignRes = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        type: mediaType,
        contentType: file.type || "application/octet-stream",
        fileSize: file.size,
        companyId,
      }),
    });

    if (!presignRes.ok) {
      const err = await presignRes.json().catch(() => ({}));
      throw new Error(err.error || `Upload authorization failed (${presignRes.status})`);
    }

    const { uploadUrl, publicUrl, key } = await presignRes.json();

    // 2. Direct-to-S3 Upload with Progress Tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl, true);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 90);
          setItems((prev) =>
            prev.map((it) => (it.id === itemId ? { ...it, progress } : it))
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 upload rejected with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error during S3 upload"));
      xhr.send(file);
    });

    // 3. Optional Responsive WebP Processing
    let blurDataUrl: string | undefined;
    if (processResponsiveVariants && mediaType === "image" && key) {
      try {
        setItems((prev) =>
          prev.map((it) => (it.id === itemId ? { ...it, status: "processing", progress: 95 } : it))
        );

        const procRes = await fetch("/api/media/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, companyId }),
        });

        if (procRes.ok) {
          const procData = await procRes.json();
          blurDataUrl = procData.variants?.blurDataUrl;
        }
      } catch (procErr) {
        console.warn("[MEDIA_PROCESS_NOTICE] Proceeding with original upload:", procErr);
      }
    }

    return { url: publicUrl, key, blurDataUrl };
  };

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return;

      const remainingSlots = maxFiles - items.length;
      const validFiles = files.slice(0, remainingSlots > 0 ? remainingSlots : 0);

      if (!validFiles.length) return;

      const newUploads: UploadedMediaItem[] = validFiles.map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file), // temporary local blob
        fileName: file.name,
        fileSize: file.size,
        mediaType,
        status: "uploading",
        progress: 10,
      }));

      const combined = [...items, ...newUploads];
      updateItems(combined);

      // Upload files concurrently
      await Promise.all(
        validFiles.map(async (file, index) => {
          const item = newUploads[index];
          try {
            const { url, key, blurDataUrl } = await uploadSingleFile(file, item.id);
            setItems((prev) => {
              const updated = prev.map((it) =>
                it.id === item.id
                  ? {
                      ...it,
                      url,
                      key,
                      blurDataUrl,
                      status: "completed" as const,
                      progress: 100,
                    }
                  : it
              );
              onMediaChanged?.(updated);
              return updated;
            });
          } catch (err: any) {
            setItems((prev) => {
              const updated = prev.map((it) =>
                it.id === item.id
                  ? {
                      ...it,
                      status: "error" as const,
                      error: err?.message || "Upload failed",
                    }
                  : it
              );
              onMediaChanged?.(updated);
              return updated;
            });
          }
        })
      );
    },
    [items, maxFiles, mediaType, companyId, processResponsiveVariants]
  );

  const removeItem = (id: string) => {
    const filtered = items.filter((it) => it.id !== id);
    updateItems(filtered);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
            : "border-gray-300 dark:border-gray-700 hover:border-indigo-500 bg-gray-50/50 dark:bg-gray-900/40"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
            }
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            <CloudArrowUpIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {mediaType === "image"
                ? "PNG, JPG, WebP, AVIF (up to 15MB each)"
                : mediaType === "video"
                ? "MP4, WebM (up to 100MB)"
                : "PDF, EPUB (up to 50MB)"}
            </p>
          </div>
        </div>
      </div>

      {/* Uploaded Items List / Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-sm"
            >
              {/* Media Preview */}
              <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {item.mediaType === "image" ? (
                  <img
                    src={item.url}
                    alt={item.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : item.mediaType === "video" ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <DocumentIcon className="w-8 h-8 text-gray-400" />
                )}

                {/* Progress Overlay */}
                {item.status === "uploading" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-white">
                    <span className="text-xs font-bold mb-1">{item.progress}%</span>
                    <div className="w-3/4 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {item.status === "processing" && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-white">
                    <ArrowPathIcon className="w-5 h-5 animate-spin text-indigo-400 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Optimizing...
                    </span>
                  </div>
                )}

                {item.status === "error" && (
                  <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center p-2 text-white text-center">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-300 mb-1" />
                    <span className="text-[10px] line-clamp-2">{item.error}</span>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove asset"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Caption */}
              <div className="p-2">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate" title={item.fileName}>
                  {item.fileName}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-gray-400">
                  <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                  {item.status === "completed" && (
                    <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                      <CheckCircleIcon className="w-3 h-3" /> Ready
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
