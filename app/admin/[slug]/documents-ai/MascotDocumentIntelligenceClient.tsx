"use client";

/**
 * app/admin/[slug]/documents-ai/MascotDocumentIntelligenceClient.tsx
 *
 * Full-page Document Intelligence, Extraction, and Business Actions Hub for SalesmanPro.
 * Supports:
 * - Drag-and-drop & Camera upload for receipts, invoices, statements, assessments
 * - Multimodal OCR extraction with field-level confidence scoring
 * - Real-time duplicate detection against existing expenses & bills
 * - Arithmetic validation (Subtotal + Taxes = Total)
 * - Human-in-the-loop side-by-side verification and approval
 * - Direct execution into canonical store financial ledgers
 */

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CameraIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ArrowTopRightOnSquareIcon,
  QueueListIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { DocumentReviewModal } from "@/components/ai/mascot/DocumentReviewModal";
import { ExtractedDocumentData, DocumentActionDraft } from "@/lib/ai/mascot/documentTypes";

interface MascotDocumentIntelligenceClientProps {
  companyId: string;
  storeSlug: string;
  storeName: string;
  storeCategory: string;
  userRole: string;
}

interface UploadedBatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: "QUEUED" | "EXTRACTING" | "EXTRACTED" | "EXECUTED" | "FAILED";
  extractedData?: ExtractedDocumentData;
  actionDraft?: DocumentActionDraft;
  error?: string;
  resultingRecordId?: string;
}

export default function MascotDocumentIntelligenceClient({
  companyId,
  storeSlug,
  storeName,
  storeCategory,
  userRole,
}: MascotDocumentIntelligenceClientProps) {
  const [batchItems, setBatchItems] = useState<UploadedBatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReviewItem, setActiveReviewItem] = useState<UploadedBatchItem | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch tenant AI credit balance
  React.useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch(`/api/ai/credits?companyId=${companyId}`);
        const data = await res.json();
        if (typeof data.balance === "number") {
          setCreditBalance(data.balance);
        }
      } catch (e) {
        // silent
      }
    };
    fetchBalance();
  }, [companyId]);

  // Handle files selected via file input or drag-and-drop
  const handleFiles = (files: FileList | File[]) => {
    const newItems: UploadedBatchItem[] = Array.from(files).map((f) => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: "QUEUED",
    }));

    setBatchItems((prev) => [...prev, ...newItems]);
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

  // Process all queued documents in sequence or parallel
  const processBatch = async () => {
    const queuedItems = batchItems.filter((it) => it.status === "QUEUED");
    if (queuedItems.length === 0) return;

    const estimatedCredits = queuedItems.length * 2;
    if (creditBalance !== null && creditBalance < estimatedCredits) {
      alert(
        `Insufficient AI credits. Processing ${queuedItems.length} document(s) requires ${estimatedCredits} credits, but your store currently has ${creditBalance} credits. Please top up your credits to proceed.`
      );
      return;
    }

    setIsProcessing(true);

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      if (item.status !== "QUEUED") continue;

      // Update item to EXTRACTING
      setBatchItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: "EXTRACTING" } : it))
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("companyId", companyId);
        formData.append("storeSlug", storeSlug);
        formData.append("userRole", userRole);

        const res = await fetch("/api/ai/mascot/documents", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          if (data.creditUsage?.balanceRemaining !== undefined) {
            setCreditBalance(data.creditUsage.balanceRemaining);
          }

          setBatchItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: "EXTRACTED",
                    extractedData: data.extracted || data.extractedData,
                    actionDraft: data.suggestedAction || data.actionDraft,
                    previewUrl: data.previewUrl || it.previewUrl,
                  }
                : it
            )
          );
        } else {
          setBatchItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? { ...it, status: "FAILED", error: data.error || "Extraction failed" }
                : it
            )
          );
        }
      } catch (err: any) {
        setBatchItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "FAILED", error: err?.message || "Network error" }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const removeItem = (id: string) => {
    setBatchItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              <SparklesIcon className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Document Intelligence Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Multimodal OCR extraction, arithmetic auditing, duplicate prevention, and automated ledger recording for {storeName}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* AI Credit Balance Pill */}
          <Link
            href={`/admin/${storeSlug}/ai-settings`}
            title="Manage Store AI Credits"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition shadow-sm"
          >
            <SparklesIcon className="w-4 h-4 text-indigo-500" />
            <span>{creditBalance !== null ? `${creditBalance.toLocaleString()} Credits` : "AI Credits"}</span>
          </Link>

          <Link
            href={`/admin/${storeSlug}/expenses`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <span>Store Expenses</span>
            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/admin/${storeSlug}/ai-tasks`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition shadow-sm"
          >
            <span>Background AI Tasks</span>
          </Link>
        </div>
      </div>

      {/* Upload & Capture Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-3xl p-8 border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/20"
            : "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60"
        }`}
      >
        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <input
          type="file"
          ref={cameraInputRef}
          capture="environment"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <div className="p-4 rounded-3xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
          <CloudArrowUpIcon className="w-10 h-10" />
        </div>

        <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
          Drop receipts, invoices, or statements here
        </h3>
        <p className="text-xs text-slate-500 max-w-md mt-1">
          Supports PDF, JPEG, PNG, and WebP up to 10MB each. Safe, encrypted, and scoped to your store tenant.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition"
          >
            <CloudArrowUpIcon className="w-4 h-4" />
            <span>Select Files</span>
          </button>

          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-sm transition"
          >
            <CameraIcon className="w-4 h-4" />
            <span>Camera Capture</span>
          </button>
        </div>
      </div>

      {/* Batch Processing List */}
      {batchItems.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <QueueListIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Uploaded Documents ({batchItems.length})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {batchItems.some((it) => it.status === "QUEUED") && (
                <button
                  onClick={processBatch}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Batch...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-3.5 h-3.5" />
                      <span>
                        Extract All Queued ({batchItems.filter((it) => it.status === "QUEUED").length * 2} Credits)
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {batchItems.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {item.file.type.startsWith("image/") ? (
                      <img
                        src={item.previewUrl}
                        alt="thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <DocumentTextIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {item.file.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {(item.file.size / 1024).toFixed(1)} KB •{" "}
                      {item.extractedData?.documentType.replace(/_/g, " ") || item.file.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  {item.status === "QUEUED" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      Queued
                    </span>
                  )}
                  {item.status === "EXTRACTING" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                      <ArrowPathIcon className="w-3 h-3 animate-spin" />
                      <span>Reading...</span>
                    </span>
                  )}
                  {item.status === "EXTRACTED" && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-emerald-500" />
                        <span>Ready (KES {item.extractedData?.total.toLocaleString()})</span>
                      </span>

                      {item.actionDraft?.duplicateWarning?.isDuplicate && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-0.5">
                          <ExclamationTriangleIcon className="w-3 h-3 text-amber-500" />
                          <span>Duplicate</span>
                        </span>
                      )}

                      <button
                        onClick={() => setActiveReviewItem(item)}
                        className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
                      >
                        Review & Book
                      </button>
                    </div>
                  )}
                  {item.status === "EXECUTED" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300">
                      Booked into Ledger
                    </span>
                  )}
                  {item.status === "FAILED" && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200">
                      {item.error || "Failed"}
                    </span>
                  )}

                  <button
                    onClick={() => removeItem(item.id)}
                    title="Remove"
                    className="p-1.5 text-slate-400 hover:text-red-500 transition"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Review Modal */}
      {activeReviewItem && activeReviewItem.extractedData && activeReviewItem.actionDraft && (
        <DocumentReviewModal
          isOpen={!!activeReviewItem}
          onClose={() => setActiveReviewItem(null)}
          extracted={activeReviewItem.extractedData}
          suggestedAction={activeReviewItem.actionDraft}
          previewUrl={activeReviewItem.previewUrl}
          companyId={companyId}
          storeSlug={storeSlug}
          onSuccess={(result) => {
            setBatchItems((prev) =>
              prev.map((it) =>
                it.id === activeReviewItem.id
                  ? { ...it, status: "EXECUTED", resultingRecordId: result.recordId }
                  : it
              )
            );
            setActiveReviewItem(null);
          }}
        />
      )}
    </div>
  );
}
