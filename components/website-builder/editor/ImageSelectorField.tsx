"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  PhotoIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  uploadMediaFileWithProgress,
  formatBytes,
  validateUploadFile,
  UPLOAD_LIMITS,
} from "@/lib/media/uploadClient";
import toast from "react-hot-toast";

// Strict upload constraints for Website Builder images
export const BUILDER_IMAGE_CONSTRAINTS = {
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB maximum file size
  warningSizeBytes: 2 * 1024 * 1024, // 2 MB warning threshold for optimization
  maxDimensionPx: 2560, // Maximum width or height
  targetDimensionPx: 1920, // Downscale target for oversized images
  allowedTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ],
};

// Curated stock photos for quick builder previews
const CURATED_STOCK_COLLECTIONS: Record<
  string,
  { label: string; photos: { label: string; url: string }[] }
> = {
  store: {
    label: "Retail & Hero",
    photos: [
      {
        label: "Modern Storefront",
        url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Luxury Boutique",
        url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Minimalist Studio",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Clean Workspace",
        url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  fashion: {
    label: "Fashion & Apparel",
    photos: [
      {
        label: "Streetwear Model",
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Urban Sneakers",
        url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Luxury Apparel",
        url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Accessories & Style",
        url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  tech: {
    label: "Tech & Devices",
    photos: [
      {
        label: "Wireless Audio",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Modern Hardware",
        url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Smart Devices",
        url: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Cybersecurity & Data",
        url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  food: {
    label: "Dining & Bakery",
    photos: [
      {
        label: "Artisan Bakery",
        url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Gourmet Dish",
        url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Fresh Organic Produce",
        url: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Coffee Culture",
        url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
  interior: {
    label: "Interior & Living",
    photos: [
      {
        label: "Minimalist Lounge",
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Modern Living Space",
        url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Architectural Detail",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      },
      {
        label: "Wood & Craftsmanship",
        url: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=1200&auto=format&fit=crop",
      },
    ],
  },
};

/**
 * Compresses an image client-side using HTML5 Canvas before S3 upload.
 * Reduces bandwidth usage, respects memory, and converts to high-efficiency WebP.
 */
async function compressImageClientSide(
  file: File,
  maxDimension: number = BUILDER_IMAGE_CONSTRAINTS.targetDimensionPx,
  quality: number = 0.85
): Promise<File> {
  // If it's a GIF or SVG, do not compress via canvas to avoid losing animation or vector info
  if (file.type === "image/gif" || file.type.includes("svg")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Only downscale if the image exceeds the target dimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return resolve(file); // Fallback to original
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          // If compressed blob is somehow larger than original, keep original
          if (blob.size >= file.size) return resolve(file);

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to original if decoding fails
    };

    img.src = objectUrl;
  });
}

interface ImageSelectorFieldProps {
  value: string;
  onChange: (newUrl: string) => void;
  label?: string;
  targetId?: string;
  companyId?: string;
  compact?: boolean;
}

export default function ImageSelectorField({
  value,
  onChange,
  label = "Image Asset",
  targetId,
  companyId,
  compact = false,
}: ImageSelectorFieldProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "stock" | "url">("upload");
  const [selectedStockCategory, setSelectedStockCategory] = useState<string>("store");
  const [urlInput, setUrlInput] = useState(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal URL state when prop changes
  React.useEffect(() => {
    setUrlInput(value || "");
  }, [value]);

  // Load natural dimensions for previewed image
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Perform upload to S3 with pre-validation and client-side compression
  const processAndUploadFile = async (rawFile: File) => {
    setUploadError(null);

    // 1. Validate file format and size
    const validationError = validateUploadFile(rawFile, "image", {
      maxSizeBytes: BUILDER_IMAGE_CONSTRAINTS.maxSizeBytes,
      accept: BUILDER_IMAGE_CONSTRAINTS.allowedTypes,
    });

    if (validationError) {
      setUploadError(validationError);
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);

    try {
      // 2. Client-side optimization: If file > 1.5MB, optimize via WebP canvas
      let fileToUpload = rawFile;
      if (rawFile.size > BUILDER_IMAGE_CONSTRAINTS.warningSizeBytes && rawFile.type !== "image/gif") {
        setUploadProgress(15);
        try {
          const optimized = await compressImageClientSide(rawFile);
          fileToUpload = optimized;
        } catch (e) {
          console.warn("Client-side compression skipped, uploading original:", e);
        }
      }

      setUploadProgress(30);

      // 3. Upload directly to S3 via presigned PUT URL
      const cdnUrl = await uploadMediaFileWithProgress(fileToUpload, {
        type: "image",
        companyId,
        maxSizeBytes: BUILDER_IMAGE_CONSTRAINTS.maxSizeBytes,
        onProgress: (percent) => {
          // Map progress from 30% to 95%
          const scaled = 30 + Math.round((percent / 100) * 65);
          setUploadProgress(scaled);
        },
      });

      setUploadProgress(100);
      onChange(cdnUrl);
      setUrlInput(cdnUrl);
      toast.success("Image uploaded to S3 successfully!");
    } catch (err: any) {
      console.error("Image upload failed:", err);
      const msg = err.message || "Failed to upload image to S3 storage";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndUploadFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      onChange("");
      return;
    }
    // Basic URL check
    if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://") && !urlInput.startsWith("/")) {
      toast.error("Please enter a valid URL starting with https://");
      return;
    }
    onChange(urlInput.trim());
    toast.success("Image URL updated");
  };

  const handleClearImage = () => {
    onChange("");
    setUrlInput("");
    setImageDimensions(null);
    toast.success("Image cleared");
  };

  const isS3Cdn = value && (value.includes("amazonaws.com") || value.includes("cloudfront.net") || value.includes("/s3/"));

  return (
    <div className="space-y-3">
      {/* Label and Clear action */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <PhotoIcon className="w-4 h-4 text-rose-500" />
          <span>{label}</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClearImage}
            className="text-[10px] text-zinc-400 hover:text-rose-500 font-bold flex items-center gap-1 transition"
            title="Remove image"
          >
            <TrashIcon className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Active Preview Thumbnail Card */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-2 shadow-xs">
          <div className="relative w-full h-36 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              onLoad={handleImageLoad}
              className="w-full h-full object-contain"
            />

            {/* S3 CDN badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs">
              {isS3Cdn ? (
                <>
                  <CloudArrowUpIcon className="w-3 h-3 text-emerald-400" />
                  <span>S3 Cloud Asset</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-3 h-3 text-amber-400" />
                  <span>External CDN</span>
                </>
              )}
            </div>

            {/* Dimension Pill */}
            {imageDimensions && (
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/70 text-zinc-300 backdrop-blur-xs">
                {imageDimensions.width} &times; {imageDimensions.height} px
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-4 text-center bg-zinc-50/50 dark:bg-zinc-900/30">
          <PhotoIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-1" />
          <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
            No image selected
          </p>
          <p className="text-[10px] text-zinc-400">Upload to S3 or choose from stock presets</p>
        </div>
      )}

      {/* Mode Tabs: Upload vs Curated Stock vs Custom URL */}
      <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 text-[11px] font-bold border border-zinc-200 dark:border-zinc-700">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === "upload"
              ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <CloudArrowUpIcon className="w-3.5 h-3.5" />
          <span>Upload (S3)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("stock")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === "stock"
              ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Stock</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
            activeTab === "url"
              ? "bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>URL</span>
        </button>
      </div>

      {/* 1. UPLOAD TAB (Direct to S3 with file constraints) */}
      {activeTab === "upload" && (
        <div className="space-y-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept={BUILDER_IMAGE_CONSTRAINTS.allowedTypes.join(",")}
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
              dragOver
                ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 scale-[0.99]"
                : "border-zinc-300 dark:border-zinc-700 hover:border-rose-500/60 bg-zinc-50/60 dark:bg-zinc-900/40"
            }`}
          >
            {isUploading ? (
              <div className="space-y-2 py-2">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-rose-500 mx-auto" />
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Uploading to S3... {uploadProgress}%
                </p>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1 py-1">
                <CloudArrowUpIcon className="w-6 h-6 text-zinc-400 group-hover:text-rose-500 mx-auto transition" />
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                  Click or drag image here
                </p>
                <p className="text-[10px] text-zinc-400">
                  JPG, PNG, WebP, GIF &bull; Max {formatBytes(BUILDER_IMAGE_CONSTRAINTS.maxSizeBytes)}
                </p>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {uploadError && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-[11px] text-red-600 dark:text-red-400">
              <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Size & Parameter Constraints Pill */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 font-medium">
            <span>Direct S3 Signed Upload</span>
            <span>Auto WebP Compression</span>
          </div>
        </div>
      )}

      {/* 2. CURATED STOCK TAB */}
      {activeTab === "stock" && (
        <div className="space-y-2.5">
          {/* Category Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-bold scrollbar-none">
            {Object.entries(CURATED_STOCK_COLLECTIONS).map(([key, col]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedStockCategory(key)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition ${
                  selectedStockCategory === key
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
            {CURATED_STOCK_COLLECTIONS[selectedStockCategory]?.photos.map((item, idx) => {
              const isSelected = value === item.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(item.url);
                    setUrlInput(item.url);
                    toast.success(`Selected "${item.label}"`);
                  }}
                  className={`group relative rounded-xl overflow-hidden border aspect-4/3 transition text-left ${
                    isSelected
                      ? "ring-2 ring-rose-500 border-rose-500"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[9px] font-bold text-white truncate w-full">
                      {item.label}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CUSTOM URL TAB */}
      {activeTab === "url" && (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="grow px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-2 bg-zinc-900 hover:bg-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition"
            >
              Apply
            </button>
          </div>
          <p className="text-[10px] text-zinc-400">
            Paste any direct image URL. Works with Unsplash, AWS CloudFront, or custom CDNs.
          </p>
        </div>
      )}
    </div>
  );
}
