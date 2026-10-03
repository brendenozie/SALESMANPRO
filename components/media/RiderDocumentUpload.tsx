"use client";

import React, { useState, useRef } from "react";
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentIcon,
  ArrowPathIcon,
  EyeIcon,
  ExclamationCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { uploadMediaFileWithProgress, formatBytes, validateUploadFile, UPLOAD_LIMITS } from "@/lib/media/uploadClient";

export interface RiderDocumentUploadProps {
  id?: string;
  label: string;
  sublabel?: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  maxSizeBytes?: number;
  accept?: string[];
  mediaType?: "document" | "image";
  companyId?: string;
  disabled?: boolean;
  className?: string;
}

export function RiderDocumentUpload({
  id,
  label,
  sublabel,
  description,
  value,
  onChange,
  required = false,
  maxSizeBytes = 5 * 1024 * 1024, // 5MB limit
  accept = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"],
  mediaType = "document",
  companyId,
  disabled = false,
  className = "",
}: RiderDocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const isPdf = value ? value.toLowerCase().endsWith(".pdf") || value.includes("/pdf") : false;

  const handleFile = async (file: File) => {
    setErrorMsg(null);

    // 1. Client-side validation with strict 5MB limit
    const valError = validateUploadFile(file, mediaType, { maxSizeBytes, accept });
    if (valError) {
      setErrorMsg(valError);
      toast.error(valError);
      return;
    }

    // 2. Perform upload with progress
    try {
      setUploading(true);
      setProgress(5);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const cdnUrl = await uploadMediaFileWithProgress(file, {
        type: mediaType,
        companyId,
        maxSizeBytes,
        accept,
        signal: controller.signal,
        onProgress: (p) => setProgress(Math.max(5, p)),
      });

      onChange(cdnUrl);
      setProgress(100);
      toast.success(`${label} uploaded successfully!`);
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("cancelled")) {
        toast("Upload cancelled");
      } else {
        const msg = err.message || "Failed to upload document";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } finally {
      setUploading(false);
      abortControllerRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || uploading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange("");
    setErrorMsg(null);
    setProgress(0);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label & Requirement Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-zinc-200">
          {label} {required && <span className="text-amber-400">*</span>}
        </label>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
          Max {formatBytes(maxSizeBytes)}
        </span>
      </div>

      {sublabel && <p className="text-[11px] text-zinc-400">{sublabel}</p>}
      {description && <p className="text-[11px] text-zinc-500 italic">{description}</p>}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept.join(",")}
        onChange={handleInputChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* UPLOADED STATE: Displays preview, link, and action buttons */}
      {value && !uploading && (
        <div className="relative rounded-2xl border border-emerald-500/40 bg-zinc-950/90 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg group">
          <div className="flex items-center gap-3 min-w-0">
            {isPdf ? (
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
                <DocumentIcon className="w-6 h-6 text-rose-400" />
              </div>
            ) : (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt={label} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Uploaded & Verified</span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-xs" title={value}>
                {value.split("/").pop() || value}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1"
              title="View full document"
            >
              <EyeIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </a>

            {!disabled && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 transition-all text-xs font-bold flex items-center gap-1"
                  title="Replace file"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Replace</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-all text-xs"
                  title="Remove file"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* UPLOADING STATE: Interactive progress bar and cancellation */}
      {uploading && (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Uploading {label}...</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{progress}%</span>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="text-[11px] text-zinc-400 hover:text-rose-400 underline"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400">Encrypting & uploading directly to secure Ghuba storage...</p>
        </div>
      )}

      {/* EMPTY / DROPZONE STATE */}
      {!value && !uploading && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
              : errorMsg
              ? "border-rose-500/50 bg-rose-500/5 hover:border-rose-400"
              : "border-zinc-800 bg-zinc-950/60 hover:border-amber-500/50 hover:bg-zinc-900/60"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shadow-inner group-hover:scale-110 transition-transform">
              <CloudArrowUpIcon className="w-5 h-5" />
            </div>

            <p className="text-xs font-bold text-zinc-200">
              <span className="text-amber-400 underline decoration-amber-400/50">Click to upload</span> or drag and drop
            </p>

            <p className="text-[11px] text-zinc-400">
              PNG, JPG, WEBP, or PDF (up to {formatBytes(maxSizeBytes)})
            </p>
          </div>
        </div>
      )}

      {/* Error message banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl">
          <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* URL fallback toggle for manual overrides */}
      <div className="flex items-center justify-end pt-0.5">
        <button
          type="button"
          onClick={() => setShowUrlFallback((prev) => !prev)}
          className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlFallback ? "Hide URL input" : "Or enter link manually"}
        </button>
      </div>

      {showUrlFallback && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`https://.../${label.toLowerCase().replace(/\s+/g, "_")}.jpg`}
          disabled={disabled}
          className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:border-amber-500 focus:outline-none"
        />
      )}
    </div>
  );
}
