"use client";

import React, { useState, useRef } from "react";
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  StarIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  uploadSingleMedia,
  validateClientMediaFile,
  formatMediaBytes,
  CLIENT_UPLOAD_LIMITS,
  UploadCategory,
} from "@/lib/media/unifiedUploadEngine";

export interface UploadQueueItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  stage?: string;
  category: UploadCategory;
  previewUrl?: string;
  error?: string;
}

interface GhubaImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  videos?: string[];
  onVideosChange?: (videos: string[]) => void;
  documents?: string[];
  onDocumentsChange?: (documents: string[]) => void;
  maxImages?: number;
  allowVideo?: boolean;
  maxVideos?: number;
  allowDocuments?: boolean;
  maxDocuments?: number;
  companyId?: string;
  title?: string;
}

export default function GhubaImageUploader({
  images,
  onChange,
  videos = [],
  onVideosChange,
  documents = [],
  onDocumentsChange,
  maxImages = 6,
  allowVideo = true,
  maxVideos = 1,
  allowDocuments = false,
  maxDocuments = 2,
  companyId,
  title = "Product Media",
}: GhubaImageUploaderProps) {
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build the accepted extensions string
  const acceptTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".heic",
    ".heif",
  ];

  if (allowVideo) {
    acceptTypes.push("video/mp4", "video/webm", "video/quicktime", ".mp4", ".mov", ".webm");
  }

  if (allowDocuments) {
    acceptTypes.push("application/pdf", ".pdf", ".epub");
  }

  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (!fileList.length) return;

    for (const file of fileList) {
      // Determine media category
      const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
      const isDocument = file.type === "application/pdf" || /\.(pdf|epub)$/i.test(file.name);
      const category: UploadCategory = isVideo ? "video" : isDocument ? "book" : "image";

      // Check slot capacity
      if (category === "image") {
        const queuedCount = uploadQueue.filter((q) => q.category === "image").length;
        if (images.length + queuedCount >= maxImages) {
          alert(`Maximum of ${maxImages} images allowed.`);
          continue;
        }
      } else if (category === "video") {
        if (!allowVideo) {
          alert("Video uploads are not enabled for this item type.");
          continue;
        }
        const queuedCount = uploadQueue.filter((q) => q.category === "video").length;
        if (videos.length + queuedCount >= maxVideos) {
          alert(`Maximum of ${maxVideos} video allowed.`);
          continue;
        }
      } else if (category === "book") {
        if (!allowDocuments) {
          alert("Document uploads are not enabled for this item type.");
          continue;
        }
        const queuedCount = uploadQueue.filter((q) => q.category === "book").length;
        if (documents.length + queuedCount >= maxDocuments) {
          alert(`Maximum of ${maxDocuments} documents allowed.`);
          continue;
        }
      }

      // Pre-validation
      const validationError = validateClientMediaFile(file, category);
      const itemId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      let localBlobUrl: string | undefined = undefined;

      try {
        localBlobUrl = URL.createObjectURL(file);
      } catch {
        // Fallback if blob URL cannot be constructed
      }

      if (validationError) {
        setUploadQueue((prev) => [
          ...prev,
          {
            id: itemId,
            name: file.name,
            size: file.size,
            progress: 0,
            category,
            previewUrl: localBlobUrl,
            error: validationError,
          },
        ]);
        continue;
      }

      // Add to uploading queue with local preview
      setUploadQueue((prev) => [
        ...prev,
        {
          id: itemId,
          name: file.name,
          size: file.size,
          progress: 10,
          category,
          previewUrl: localBlobUrl,
          stage: "authorizing",
        },
      ]);

      try {
        // Run using the new unified upload engine
        const result = await uploadSingleMedia(file, {
          companyId,
          category,
          processVariants: category === "image",
          onProgress: (p) => {
            setUploadQueue((prev) =>
              prev.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      progress: p.percentage,
                      stage: p.stage,
                    }
                  : item
              )
            );
          },
        });

        const targetUrl = result.cdnUrl || result.url;

        // Cleanup local blob memory
        if (localBlobUrl) {
          try {
            URL.revokeObjectURL(localBlobUrl);
          } catch {}
        }

        // Remove from upload queue
        setUploadQueue((prev) => prev.filter((item) => item.id !== itemId));

        // Append to state
        if (category === "image") {
          onChange([...images, targetUrl]);
        } else if (category === "video" && onVideosChange) {
          onVideosChange([...videos, targetUrl]);
        } else if (category === "book" && onDocumentsChange) {
          onDocumentsChange([...documents, targetUrl]);
        }
      } catch (err: any) {
        console.error("[GhubaMediaUploader] Upload error:", err);
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  progress: 0,
                  stage: "error",
                  error: err?.message || "Upload failed. Please check network connection.",
                }
              : item
          )
        );
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([target, ...rest]);
  };

  const removeVideo = (indexToRemove: number) => {
    if (onVideosChange) {
      onVideosChange(videos.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const removeDocument = (indexToRemove: number) => {
    if (onDocumentsChange) {
      onDocumentsChange(documents.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const removeQueueItem = (id: string) => {
    setUploadQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const isVideoUrl = (url: string) => /\.(mp4|webm|mov|m4v)($|\?)/i.test(url);
  const isPdfUrl = (url: string) => /\.(pdf|epub)($|\?)/i.test(url);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
          <span>{title}</span>
          <span className="text-[11px] font-normal text-zinc-500">
            ({images.length}/{maxImages} images
            {allowVideo ? `, ${videos.length}/${maxVideos} video` : ""}
            {allowDocuments ? `, ${documents.length}/${maxDocuments} docs` : ""})
          </span>
        </label>
        <span className="text-[11px] text-zinc-500">
          Max 15MB/img • 100MB/vid
        </span>
      </div>

      {/* Grid of uploaded assets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {/* Images */}
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
          >
            <img
              src={url}
              alt={`Product preview ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {idx === 0 ? (
              <span className="absolute top-2 left-2 bg-amber-500 text-zinc-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                Cover Photo
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(idx)}
                className="absolute top-2 left-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-amber-500 hover:text-zinc-950 transition-colors backdrop-blur-sm opacity-0 group-hover:opacity-100 text-[10px] font-bold flex items-center gap-1"
                title="Set as Cover"
              >
                <StarIcon className="w-3.5 h-3.5" />
                <span>Make Cover</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors backdrop-blur-sm opacity-90 group-hover:opacity-100"
              title="Remove image"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Videos */}
        {videos.map((vidUrl, idx) => (
          <div
            key={vidUrl + idx}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700 shadow-sm flex flex-col items-center justify-center p-2"
          >
            <video
              src={vidUrl}
              className="w-full h-full object-cover rounded-xl opacity-80"
              muted
              playsInline
              loop
              onMouseOver={(e) => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
              onMouseOut={(e) => (e.currentTarget as HTMLVideoElement).pause()}
            />
            <span className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <PlayIcon className="w-3 h-3 fill-current" />
              Video Reel
            </span>
            <button
              type="button"
              onClick={() => removeVideo(idx)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-red-600 transition-colors backdrop-blur-sm"
              title="Remove video"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Documents / PDFs */}
        {documents.map((docUrl, idx) => (
          <div
            key={docUrl + idx}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 shadow-sm flex flex-col items-center justify-center p-3 text-center"
          >
            <DocumentTextIcon className="w-10 h-10 text-amber-600 dark:text-amber-400 mb-1" />
            <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate w-full px-2">
              PDF Asset
            </span>
            <span className="text-[10px] text-zinc-500">Downloadable</span>
            <button
              type="button"
              onClick={() => removeDocument(idx)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors backdrop-blur-sm"
              title="Remove document"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Upload Dropzone Tile */}
        {images.length < maxImages && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20 scale-[0.99]"
                : "border-zinc-300 dark:border-zinc-700 hover:border-amber-500 dark:hover:border-amber-500 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-amber-50/40 dark:hover:bg-amber-950/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptTypes.join(",")}
              className="hidden"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
                e.target.value = "";
              }}
            />
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 shadow-sm">
              <PhotoIcon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {dragActive ? "Drop here" : "Add Photos / Media"}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">
              Tap to browse or drop
              {allowVideo ? " • MP4" : ""}
              {allowDocuments ? " • PDF" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Active Uploading Queue with Live Progress */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2 pt-2">
          {uploadQueue.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs shadow-sm"
            >
              {/* Thumbnail / Category Icon */}
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0 flex items-center justify-center">
                {item.previewUrl && item.category === "image" ? (
                  <img src={item.previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                ) : item.category === "video" ? (
                  <VideoCameraIcon className="w-5 h-5 text-indigo-500" />
                ) : item.category === "book" ? (
                  <DocumentTextIcon className="w-5 h-5 text-amber-500" />
                ) : (
                  <PhotoIcon className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              {/* Info & Progress */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    {item.error ? (
                      <ExclamationCircleIcon className="w-4 h-4 text-red-500 shrink-0" />
                    ) : item.progress === 100 ? (
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <ArrowUpTrayIcon className="w-3.5 h-3.5 text-amber-500 animate-bounce shrink-0" />
                    )}
                    <span className="truncate font-semibold text-zinc-800 dark:text-zinc-200">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                    {formatMediaBytes(item.size)}
                  </span>
                </div>

                {item.error ? (
                  <p className="text-[11px] text-red-500 font-medium">{item.error}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400 w-8 text-right">
                      {item.progress}%
                    </span>
                  </div>
                )}
              </div>

              {/* Dismiss / Remove Button */}
              {item.error && (
                <button
                  type="button"
                  onClick={() => removeQueueItem(item.id)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
