"use client";

import React, { useState, useRef } from "react";
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  uploadMediaFileWithProgress,
  validateUploadFile,
  formatBytes,
  UPLOAD_LIMITS,
} from "@/lib/media/uploadClient";

interface UploadingItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  error?: string;
  url?: string;
}

interface GhubaImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  companyId?: string;
}

export default function GhubaImageUploader({
  images,
  onChange,
  maxImages = 6,
  companyId,
}: GhubaImageUploaderProps) {
  const [uploadingQueue, setUploadingQueue] = useState<UploadingItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (!fileList.length) return;

    const remainingSlots = maxImages - images.length - uploadingQueue.length;
    if (remainingSlots <= 0) {
      alert(`Maximum of ${maxImages} images allowed.`);
      return;
    }

    const toUpload = fileList.slice(0, remainingSlots);

    for (const file of toUpload) {
      const errorMsg = validateUploadFile(file, "image");
      const itemId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (errorMsg) {
        setUploadingQueue((prev) => [
          ...prev,
          { id: itemId, name: file.name, size: file.size, progress: 0, error: errorMsg },
        ]);
        continue;
      }

      // Add to uploading queue
      setUploadingQueue((prev) => [
        ...prev,
        { id: itemId, name: file.name, size: file.size, progress: 5 },
      ]);

      try {
        // Direct-to-S3 presigned upload with real-time progress
        const cdnUrl = await uploadMediaFileWithProgress({
          file,
          type: "image",
          companyId,
          onProgress: (pct) => {
            setUploadingQueue((prev) =>
              prev.map((item) => (item.id === itemId ? { ...item, progress: pct } : item))
            );
          },
        });

        // Remove from upload queue and add to completed images
        setUploadingQueue((prev) => prev.filter((item) => item.id !== itemId));
        onChange([...images, cdnUrl]);
      } catch (err: any) {
        console.error("Direct upload failed:", err);
        setUploadingQueue((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, progress: 0, error: err?.message || "Upload failed" }
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

  const removeQueueItem = (id: string) => {
    setUploadingQueue((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          Product Images ({images.length}/{maxImages})
        </label>
        <span className="text-xs text-zinc-500">Max 15MB each (JPEG, PNG, WebP)</span>
      </div>

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
          >
            <img
              src={url}
              alt={`Product preview ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {idx === 0 && (
              <span className="absolute top-2 left-2 bg-amber-500 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Cover
              </span>
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

        {/* Upload Dropzone */}
        {images.length < maxImages && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                : "border-zinc-300 dark:border-zinc-700 hover:border-amber-500 dark:hover:border-amber-500 bg-zinc-50 dark:bg-zinc-900/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={UPLOAD_LIMITS.image.accept.join(",")}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
              <PhotoIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {dragActive ? "Drop images here" : "Upload Image"}
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">JPG, PNG, or WebP</p>
          </div>
        )}
      </div>

      {/* Uploading Progress Items */}
      {uploadingQueue.length > 0 && (
        <div className="space-y-2 pt-2">
          {uploadingQueue.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {item.error ? (
                  <ExclamationCircleIcon className="w-4 h-4 text-red-500 shrink-0" />
                ) : item.progress === 100 ? (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <ArrowUpTrayIcon className="w-4 h-4 text-amber-500 animate-bounce shrink-0" />
                )}
                <span className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                  {item.name}
                </span>
                <span className="text-zinc-500 shrink-0">({formatBytes(item.size)})</span>
              </div>

              {item.error ? (
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-medium">{item.error}</span>
                  <button
                    type="button"
                    onClick={() => removeQueueItem(item.id)}
                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-zinc-600 dark:text-zinc-400 font-mono text-[10px] w-7 text-right">
                    {item.progress}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
