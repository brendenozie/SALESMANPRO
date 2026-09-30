"use client";

import React, { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  PrinterIcon,
  CheckCircleIcon,
  SparklesIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  Cog6ToothIcon,
  SwatchIcon,
  ArrowPathIcon,
  XMarkIcon,
  AcademicCapIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { DOCUMENT_TEMPLATES } from "@/lib/documents/registry";
import { DocumentType, TemplateDefinition } from "@/lib/documents/types";

interface Props {
  companyId: string;
  companySlug: string;
  companyName: string;
  currency: string;
}

export default function DocumentsPrintingClient({
  companyId,
  companySlug,
  companyName,
  currency,
}: Props) {
  const [activeCategory, setActiveCategory] = useState<"ALL" | "INVOICE" | "QUOTATION" | "PURCHASE_ORDER" | "RECEIPT" | "STUDENT_REPORT">("ALL");
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Success alert
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Fetch tenant settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/documents/settings?companyId=${companyId}`);
      const json = await res.json();
      if (json.success && json.data?.settings) {
        setSettings(json.data.settings);
      }
    } catch (err) {
      console.error("Failed to load document settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [companyId]);

  // Activate a template for a document type
  const handleSelectTemplate = async (template: TemplateDefinition) => {
    try {
      setSavingKey(template.documentType);
      const res = await fetch("/api/documents/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          documentType: template.documentType,
          templateId: template.id,
          pageSize: template.defaultPageSize,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSettings((prev) => ({
          ...prev,
          [template.documentType]: {
            ...prev[template.documentType],
            templateId: template.id,
            pageSize: template.defaultPageSize,
          },
        }));
        setSuccessToast(`Template "${template.name}" activated for ${template.documentType.replace(/_/g, " ")}!`);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        alert(json.error || "Failed to update template setting");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to activate template");
    } finally {
      setSavingKey(null);
    }
  };

  // Open Preview Modal
  const handleOpenPreview = async (template: TemplateDefinition) => {
    setPreviewTemplate(template);
    setPreviewLoading(true);
    setPreviewPdfUrl(null);

    try {
      const res = await fetch("/api/documents/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: template.documentType,
          templateId: template.id,
          companyId,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPreviewPdfUrl(url);
      } else {
        alert("Failed to generate preview");
      }
    } catch (err) {
      console.error("Preview load error:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Close Preview Modal
  const handleClosePreview = () => {
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    setPreviewTemplate(null);
    setPreviewPdfUrl(null);
  };

  // Filter templates
  const filteredTemplates = DOCUMENT_TEMPLATES.filter((tpl) => {
    if (activeCategory === "ALL") return true;
    if (activeCategory === "RECEIPT") return tpl.documentType === "SALES_RECEIPT" || tpl.documentType === "PAYMENT_RECEIPT";
    return tpl.documentType === activeCategory;
  });

  const getDocTypeIcon = (dt: DocumentType) => {
    switch (dt) {
      case "INVOICE":
        return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
      case "QUOTATION":
        return <ClipboardDocumentCheckIcon className="w-5 h-5 text-sky-500" />;
      case "PURCHASE_ORDER":
        return <ShoppingBagIcon className="w-5 h-5 text-slate-500" />;
      case "SALES_RECEIPT":
      case "PAYMENT_RECEIPT":
        return <ReceiptPercentIcon className="w-5 h-5 text-emerald-500" />;
      case "STUDENT_REPORT":
        return <AcademicCapIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <PrinterIcon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Unified Document Engine
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Documents & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">Printing Hub</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select design templates, preview sample outputs, and configure print layouts for <strong className="text-slate-800 dark:text-slate-200">{companyName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSettings}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all"
              title="Refresh settings"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* TOAST ALERT */}
        {successToast && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm animate-fade-in">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold">{successToast}</span>
          </div>
        )}

        {/* CATEGORY TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: "ALL", label: "All Document Designs" },
            { id: "INVOICE", label: "Commercial Invoices" },
            { id: "QUOTATION", label: "Quotations & Estimates" },
            { id: "PURCHASE_ORDER", label: "Purchase Orders" },
            { id: "RECEIPT", label: "Receipts (A4 & POS)" },
            { id: "STUDENT_REPORT", label: "School Report Cards" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TEMPLATE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const currentActiveId = settings[template.documentType]?.templateId;
            const isActive = currentActiveId === template.id;

            return (
              <div
                key={template.id}
                className={`relative rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
                  isActive
                    ? "bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Active Indicator Ribbon */}
                {isActive && (
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Active Design
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {/* Top Badge & Type */}
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      {getDocTypeIcon(template.documentType)}
                    </span>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                        {template.category} • {template.documentType.replace(/_/g, " ")}
                      </span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {template.name}
                      </h3>
                    </div>
                  </div>

                  {/* Visual Style Preview Thumbnail Strip */}
                  <div
                    className="h-28 rounded-2xl p-4 flex flex-col justify-between border border-slate-200/60 dark:border-slate-800/80 shadow-inner relative overflow-hidden"
                    style={{ backgroundColor: template.colors.bgPreview }}
                  >
                    <div className="flex justify-between items-center">
                      <div
                        className="h-4 w-20 rounded-md"
                        style={{ backgroundColor: template.colors.primary }}
                      />
                      <div
                        className="h-3 w-12 rounded"
                        style={{ backgroundColor: template.colors.accent }}
                      />
                    </div>
                    <div className="space-y-1.5 opacity-60">
                      <div className="h-2 w-full bg-slate-400/40 rounded" />
                      <div className="h-2 w-3/4 bg-slate-400/30 rounded" />
                      <div className="h-2 w-1/2 bg-slate-400/30 rounded" />
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-700 dark:text-slate-400">
                      <span>Paper: {template.defaultPageSize}</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/40 text-[8px] font-bold">
                        {template.badge}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {template.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPreview(template)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                  >
                    <EyeIcon className="w-3.5 h-3.5" /> Preview
                  </button>

                  <button
                    onClick={() => handleSelectTemplate(template)}
                    disabled={isActive || savingKey === template.documentType}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-default"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    }`}
                  >
                    {isActive ? (
                      <>
                        <CheckCircleIcon className="w-3.5 h-3.5" /> Active
                      </>
                    ) : savingKey === template.documentType ? (
                      "Saving..."
                    ) : (
                      "Set as Default"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* MODAL: LIVE PREVIEW MODAL */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up">
              
              {/* Preview Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                      Live Document Preview
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Sample Data (Non-Persistent)
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {previewTemplate.name} — {previewTemplate.documentType.replace(/_/g, " ")}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectTemplate(previewTemplate)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircleIcon className="w-4 h-4" /> Activate This Design
                  </button>

                  <button
                    onClick={handleClosePreview}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview Body with iframe */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
                {previewLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
                    <span className="text-xs font-bold text-slate-500">
                      Generating vector PDF preview...
                    </span>
                  </div>
                ) : previewPdfUrl ? (
                  <iframe
                    src={previewPdfUrl}
                    className="w-full h-full rounded-2xl border border-slate-300 dark:border-slate-800 shadow-lg bg-white"
                    title="PDF Document Preview"
                  />
                ) : (
                  <div className="text-xs text-rose-500 font-bold">
                    Failed to render preview. Please try again.
                  </div>
                )}
              </div>

              {/* Preview Footer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                <span>Default Paper Size: {previewTemplate.defaultPageSize}</span>
                {previewPdfUrl && (
                  <a
                    href={previewPdfUrl}
                    download={`preview-${previewTemplate.id}.pdf`}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download Preview PDF
                  </a>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
