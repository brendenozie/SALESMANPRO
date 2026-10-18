"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ArrowPathIcon,
  SparklesIcon,
  SwatchIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { DocumentType } from "@/lib/documents/types";
import { getTemplatesForType } from "@/lib/documents/registry";

interface DocumentPdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  documentId: string;
  documentNumber: string;
  companySlug: string;
  companyId: string;
  initialTemplateId?: string;
  onTemplateChange?: (newTemplateId: string) => void;
}

export default function DocumentPdfPreviewModal({
  isOpen,
  onClose,
  documentType,
  documentId,
  documentNumber,
  companySlug,
  companyId,
  initialTemplateId,
  onTemplateChange,
}: DocumentPdfPreviewModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplateId ||
      (documentType === "INVOICE"
        ? "invoice-corporate"
        : documentType === "STUDENT_FEE_INVOICE"
        ? "fee-invoice-academic"
        : documentType === "STUDENT_FEE_RECEIPT"
        ? "fee-receipt-standard"
        : documentType === "STUDENT_REPORT"
        ? "student-report-classic"
        : documentType === "QUOTATION"
        ? "quotation-corporate"
        : "receipt-standard")
  );
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const activeBlobUrlRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const availableTemplates = getTemplatesForType(documentType);

  // Fetch live PDF when document, template, or open state changes
  useEffect(() => {
    if (!isOpen) {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
      setPdfBlobUrl(null);
      return;
    }

    let isSubscribed = true;
    setLoading(true);
    setError(null);

    const fetchPdf = async () => {
      try {
        const queryParams = new URLSearchParams({
          templateId: selectedTemplateId,
          companyId,
        });

        const res = await fetch(`/api/documents/${documentType.toLowerCase().replace(/_/g, "-")}/${documentId}/pdf?${queryParams.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}: Failed to generate document PDF`);
        }

        const blob = await res.blob();
        if (!isSubscribed) return;

        // Revoke previous blob URL to prevent memory leaks
        if (activeBlobUrlRef.current) {
          URL.revokeObjectURL(activeBlobUrlRef.current);
        }

        const url = URL.createObjectURL(blob);
        activeBlobUrlRef.current = url;
        setPdfBlobUrl(url);
      } catch (err: any) {
        if (!isSubscribed) return;
        console.error("PDF Preview Fetch Error:", err);
        setError(err.message || "Failed to load document PDF preview.");
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchPdf();

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, documentType, documentId, selectedTemplateId, companyId]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      }
    };
  }, []);

  // Keyboard shortcut: ESC closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (onTemplateChange) {
      onTemplateChange(templateId);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch (err) {
        console.warn("Direct iframe print failed, falling back to window.open", err);
      }
    }
    if (pdfBlobUrl) {
      const printWindow = window.open(pdfBlobUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  const handleDownload = () => {
    if (!pdfBlobUrl) return;
    const link = document.createElement("a");
    link.href = pdfBlobUrl;
    link.download = `${documentType.toLowerCase()}-${documentNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 15, 175));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 15, 60));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="relative flex flex-col w-full max-w-6xl h-[92vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* TOP TOOLBAR */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800">
          
          {/* Document Meta & Badge */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DocumentCheckIcon className="w-4 h-4" />
              {documentType.replace(/_/g, " ")}
            </span>
            <div className="flex flex-col">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {documentNumber}
              </h2>
              <span className="text-[10px] text-slate-400">
                Official Generated Business Document
              </span>
            </div>
          </div>

          {/* Template Quick Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full sm:max-w-md">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <SwatchIcon className="w-3.5 h-3.5 text-blue-400" /> Style:
            </span>
            {availableTemplates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  title={tmpl.description}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50"
                  }`}
                >
                  {tmpl.name}
                </button>
              );
            })}
          </div>

          {/* Actions: Zoom, Print, Download, Close */}
          <div className="flex items-center gap-2">
            
            {/* Zoom Controls (Hidden on small mobile) */}
            <div className="hidden md:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
              <button
                onClick={handleZoomOut}
                title="Zoom Out"
                disabled={zoomLevel <= 60}
                className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                title="Reset Fit"
                className="px-2 text-[11px] font-mono font-bold text-slate-300 hover:text-white transition-colors"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                title="Zoom In"
                disabled={zoomLevel >= 175}
                className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                <MagnifyingGlassPlusIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              disabled={loading || !!error}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold border border-slate-700 transition-all disabled:opacity-40"
              title="Print Document"
            >
              <PrinterIcon className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading || !!error}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/30 transition-all disabled:opacity-40"
              title="Download PDF"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Close Preview (Esc)"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* VIEWPORT AREA */}
        <div className="relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-2 sm:p-6">
          
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-slate-400">
              <ArrowPathIcon className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm font-semibold tracking-wide text-slate-300">
                Rendering High-Resolution PDF...
              </p>
              <p className="text-xs text-slate-500">
                Applying branding, verified payment details & vector layouts
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center max-w-md p-6 bg-rose-950/40 border border-rose-800/60 rounded-xl text-center">
              <p className="text-sm font-bold text-rose-300 mb-2">PDF Generation Error</p>
              <p className="text-xs text-rose-200/80 mb-4">{error}</p>
              <button
                onClick={() => setSelectedTemplateId(selectedTemplateId)}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Retry Generation
              </button>
            </div>
          )}

          {!loading && !error && pdfBlobUrl && (
            <div
              className="w-full h-full flex items-center justify-center transition-all duration-150"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "center center",
              }}
            >
              <iframe
                ref={iframeRef}
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full rounded-lg shadow-2xl bg-white border border-slate-700/50"
                title={`PDF Preview: ${documentNumber}`}
              />
            </div>
          )}
        </div>

        {/* BOTTOM METADATA BAR */}
        <footer className="flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Active Template: <strong className="text-slate-200">{availableTemplates.find(t => t.id === selectedTemplateId)?.name || selectedTemplateId}</strong></span>
          </div>
          <div>
            <span>SalesmanPro Unified PDF Engine</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
