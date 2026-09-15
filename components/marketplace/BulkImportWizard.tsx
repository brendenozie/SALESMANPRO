"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TableCellsIcon,
  CubeIcon,
  ShoppingBagIcon,
  LinkIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { BulkImportMode } from "@/lib/marketplace/bulkImportService";

interface BulkImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onImportComplete?: () => void;
}

type WizardStep = "MODE_SELECT" | "MAPPING" | "PREVIEW" | "PROCESSING" | "RESULTS";

const SYSTEM_FIELDS = [
  { key: "name", label: "Product/Listing Name", required: true },
  { key: "sellingPrice", label: "Selling Price", required: true },
  { key: "quantity", label: "Stock Quantity", required: false },
  { key: "costPrice", label: "Cost Price (Internal)", required: false },
  { key: "sku", label: "SKU / Model / Barcode", required: false },
  { key: "category", label: "Category", required: false },
  { key: "description", label: "Description", required: false },
  { key: "images", label: "Image URL(s)", required: false },
  { key: "brand", label: "Brand", required: false },
  { key: "condition", label: "Condition", required: false },
];

export default function BulkImportWizard({
  isOpen,
  onClose,
  companyId,
  onImportComplete,
}: BulkImportWizardProps) {
  const [step, setStep] = useState<WizardStep>("MODE_SELECT");
  const [mode, setMode] = useState<BulkImportMode>("PRODUCTS_ONLY");

  const [rawFile, setRawFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const [previewData, setPreviewData] = useState<any | null>(null);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDownloadTemplate = () => {
    window.location.href = `/api/admin/marketplace/bulk-import?action=TEMPLATE&mode=${mode}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRawFile(file);
    setErrorMessage("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMessage("The uploaded file appears to be empty.");
          return;
        }

        const headers = results.meta.fields || [];
        setParsedHeaders(headers);
        setParsedRows(results.data);

        // Auto-detect column mappings based on common header variations
        const initialMapping: Record<string, string> = {};
        SYSTEM_FIELDS.forEach((sys) => {
          const match = headers.find((h) => {
            const clean = h.toLowerCase().replace(/[^a-z0-9]/g, "");
            const sysClean = sys.key.toLowerCase();
            const labelClean = sys.label.toLowerCase().replace(/[^a-z0-9]/g, "");
            return clean === sysClean || clean.includes(sysClean) || clean === labelClean;
          });
          if (match) initialMapping[sys.key] = match;
        });

        setColumnMapping(initialMapping);
        setStep("MAPPING");
      },
      error: (err) => {
        setErrorMessage(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const applyMappingAndPreview = async () => {
    setIsLoading(true);
    setErrorMessage("");

    // Transform raw rows with columnMapping
    const mappedRows = parsedRows.map((raw) => {
      const transformed: any = {};
      Object.entries(columnMapping).forEach(([sysKey, fileHeader]) => {
        if (fileHeader) transformed[sysKey] = raw[fileHeader];
      });
      return transformed;
    });

    try {
      const res = await fetch("/api/admin/marketplace/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "PREVIEW",
          mode,
          rows: mappedRows,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to generate preview");
      }

      setPreviewData(data.data);
      setStep("PREVIEW");
    } catch (err: any) {
      setErrorMessage(err.message || "Preview generation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const executeImport = async () => {
    setIsLoading(true);
    setStep("PROCESSING");

    const mappedRows = parsedRows.map((raw) => {
      const transformed: any = {};
      Object.entries(columnMapping).forEach(([sysKey, fileHeader]) => {
        if (fileHeader) transformed[sysKey] = raw[fileHeader];
      });
      return transformed;
    });

    try {
      const res = await fetch("/api/admin/marketplace/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "EXECUTE",
          mode,
          rows: mappedRows,
        }),
      });

      const data = await res.json();
      setExecutionResult(data.data || {});
      setStep("RESULTS");
      onImportComplete?.();
    } catch (err: any) {
      setErrorMessage(err.message || "Bulk execution failed.");
      setStep("PREVIEW");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-white dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-200 dark:shadow-none">
              <TableCellsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Enterprise Bulk Import Wizard</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Safely ingest, validate, and link products or listings at scale
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress */}
        <div className="px-6 py-2.5 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-gray-500">
          <span className={step === "MODE_SELECT" ? "text-emerald-600" : ""}>1. Mode & File</span>
          <span>→</span>
          <span className={step === "MAPPING" ? "text-emerald-600" : ""}>2. Column Mapping</span>
          <span>→</span>
          <span className={step === "PREVIEW" ? "text-emerald-600" : ""}>3. Validation Preview</span>
          <span>→</span>
          <span className={step === "RESULTS" ? "text-emerald-600" : ""}>4. Results</span>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* STEP 1: MODE SELECT */}
          {step === "MODE_SELECT" && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                  Choose Import Objective
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setMode("PRODUCTS_ONLY")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      mode === "PRODUCTS_ONLY"
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
                      <CubeIcon className="w-5 h-5 text-emerald-600" />
                      <span>Inventory Products Only</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Adds items to internal warehouse stock. Products remain internal and unlisted until published.
                    </p>
                  </div>

                  <div
                    onClick={() => setMode("MARKETPLACE_ONLY")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      mode === "MARKETPLACE_ONLY"
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
                      <ShoppingBagIcon className="w-5 h-5 text-blue-600" />
                      <span>Marketplace Listings Only</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Creates customer-facing listings. Can be linked to inventory products later.
                    </p>
                  </div>

                  <div
                    onClick={() => setMode("PRODUCTS_AND_PUBLISH")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      mode === "PRODUCTS_AND_PUBLISH"
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
                      <RocketLaunchIcon className="w-5 h-5 text-purple-600" />
                      <span>Inventory + Auto-Publish</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Creates warehouse products and immediately publishes connected listings to Ghuba Marketplace.
                    </p>
                  </div>

                  <div
                    onClick={() => setMode("LINK_EXISTING")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      mode === "LINK_EXISTING"
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 bg-white dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-gray-900 dark:text-white">
                      <LinkIcon className="w-5 h-5 text-amber-600" />
                      <span>Link Listings by SKU / ID</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Matches a spreadsheet of customer listings to existing inventory products via SKU matching.
                    </p>
                  </div>
                </div>
              </div>

              {/* Template download & Upload Dropzone */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Upload Spreadsheet (CSV / TSV)
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" /> Download Sample Template
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-gray-800/40 relative cursor-pointer">
                  <input
                    type="file"
                    accept=".csv, .tsv, .txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <DocumentArrowUpIcon className="w-10 h-10 text-emerald-600" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Drop your spreadsheet file here or click to browse
                    </p>
                    <p className="text-xs text-gray-500">Supports standard CSV exports from Excel, Google Sheets, or Shopify</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === "MAPPING" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">Map Spreadsheet Columns</h3>
                  <p className="text-xs text-gray-500">
                    File contains {parsedRows.length} rows and {parsedHeaders.length} columns. Verify mappings below:
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("MODE_SELECT")}
                  className="text-xs font-semibold text-gray-500 hover:underline"
                >
                  Change File
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {SYSTEM_FIELDS.map((field) => (
                  <div key={field.key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </span>
                      {columnMapping[field.key] ? (
                        <span className="text-[10px] text-emerald-600 font-bold">Mapped ✓</span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Unmapped</span>
                      )}
                    </div>
                    <select
                      value={columnMapping[field.key] || ""}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, [field.key]: e.target.value })
                      }
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Don't Map --</option>
                      {parsedHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={applyMappingAndPreview}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    "Validate & Preview →"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & VALIDATION */}
          {step === "PREVIEW" && previewData && (
            <div className="space-y-5">
              {/* Stat Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
                  <p className="text-[10px] uppercase font-bold text-emerald-600">New Creations</p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{previewData.createCount}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-center">
                  <p className="text-[10px] uppercase font-bold text-blue-600">Updates</p>
                  <p className="text-xl font-black text-blue-700 dark:text-blue-400">{previewData.updateCount}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl text-center">
                  <p className="text-[10px] uppercase font-bold text-purple-600">Links</p>
                  <p className="text-xl font-black text-purple-700 dark:text-purple-400">{previewData.linkCount}</p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-center">
                  <p className="text-[10px] uppercase font-bold text-red-600">Row Errors</p>
                  <p className="text-xl font-black text-red-700 dark:text-red-400">{previewData.errorRowsCount}</p>
                </div>
              </div>

              {/* Error Breakdown Drawer if errors exist */}
              {previewData.errors?.length > 0 && (
                <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    <span>{previewData.errors.length} validation issues detected (Valid rows will still import)</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs space-y-1 pr-1 font-mono text-gray-700 dark:text-gray-300">
                    {previewData.errors.slice(0, 8).map((err: any, idx: number) => (
                      <p key={idx}>
                        Row {err.row}: <strong>{err.field}</strong> — {err.message}
                      </p>
                    ))}
                    {previewData.errors.length > 8 && (
                      <p className="text-gray-400 italic">...and {previewData.errors.length - 8} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* Sample Mapped Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Sample Mapped Preview (First 5 Rows)
                </h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 font-bold border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="p-2.5">Row</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">Price</th>
                        <th className="p-2.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {previewData.sampleRows?.slice(0, 5).map((row: any) => (
                        <tr key={row.rowNumber}>
                          <td className="p-2.5 font-mono text-gray-400">#{row.rowNumber}</td>
                          <td className="p-2.5 font-semibold text-gray-900 dark:text-white truncate max-w-xs">{row.name}</td>
                          <td className="p-2.5 font-mono text-gray-600 dark:text-gray-300">{row.sku || "—"}</td>
                          <td className="p-2.5 font-bold text-emerald-600">KES {row.sellingPrice}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {row.actionIntent}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirmation Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("MAPPING")}
                  className="text-xs font-semibold text-gray-500 hover:underline"
                >
                  ← Edit Mappings
                </button>

                <button
                  type="button"
                  disabled={isLoading || previewData.validRowsCount === 0}
                  onClick={executeImport}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  Confirm & Import {previewData.validRowsCount} Rows
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROCESSING */}
          {step === "PROCESSING" && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <ArrowPathIcon className="w-12 h-12 text-emerald-600 animate-spin" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Executing Bulk Ingestion</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Processing database writes, deduplicating SKUs, and synchronizing catalog caches...
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: RESULTS */}
          {step === "RESULTS" && executionResult && (
            <div className="py-6 space-y-6 text-center">
              <div className="inline-flex p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Bulk Ingestion Completed</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Successfully committed batch changes to your business catalog.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Created</p>
                  <p className="text-lg font-black text-emerald-600">{executionResult.createdCount}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Updated</p>
                  <p className="text-lg font-black text-blue-600">{executionResult.updatedCount}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Linked</p>
                  <p className="text-lg font-black text-purple-600">{executionResult.linkedCount}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Failed</p>
                  <p className="text-lg font-black text-red-600">{executionResult.failedCount}</p>
                </div>
              </div>

              {executionResult.failedRows?.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl max-w-lg mx-auto text-left text-xs space-y-1">
                  <p className="font-bold text-red-600">Failed Rows Report:</p>
                  {executionResult.failedRows.map((f: any, i: number) => (
                    <p key={i} className="text-gray-600 dark:text-gray-300 font-mono text-[11px]">
                      Row {f.row}: {f.name} — {f.reason}
                    </p>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-lg transition-all"
              >
                Done & View Catalog
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
