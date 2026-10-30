"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ClipboardDocumentCheckIcon as ClipboardCheck,
  QrCodeIcon as ScanBarcode,
  MagnifyingGlassIcon as Search,
  CheckCircleIcon as CheckCircle2,
  ExclamationTriangleIcon as AlertTriangle,
  ArrowDownRightIcon as ArrowDownRight,
  ArrowUpRightIcon as ArrowUpRight,
  ArrowPathIcon as Loader2,
  TrashIcon as Trash2,
  BookmarkSquareIcon as Save,
  ArrowUturnLeftIcon as RotateCcw,
  DocumentArrowDownIcon as FileSpreadsheet,
  PlusIcon as Plus,
  MinusIcon as Minus,
  Square3Stack3DIcon as Layers,
  ClockIcon as History,
  PaperAirplaneIcon as Send,
  ShieldCheckIcon as ShieldCheck,
  BuildingOffice2Icon as Building2,
  ArrowLeftIcon as ArrowLeft,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useBarcodeScannerWedge } from "@/lib/pos/useBarcodeScannerWedge";
import POSCameraBarcodeScannerModal from "@/components/pos/POSCameraBarcodeScannerModal";

interface AuditLineItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  expectedQty: number;
  countedQty: number;
  costPrice: number;
  sellingPrice: number;
  image?: string | null;
}

interface StocktakeSessionRecord {
  id: string;
  sessionCode: string;
  stage: "DRAFT" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "POSTED" | "CANCELLED";
  warehouseName: string;
  categoryFilter?: string;
  notes?: string;
  countedBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  auditDate: string;
  postedAt?: string | null;
  summary: {
    totalItemsCounted: number;
    discrepancyCount: number;
    positiveVarianceUnits: number;
    negativeVarianceUnits: number;
    netVarianceUnits: number;
    netFinancialImpact: number;
  };
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    systemQtyAtCount: number;
    liveSystemQtyAtPost?: number;
    countedQty: number;
    variance: number;
    costPrice: number;
    varianceValue: number;
  }>;
}

interface StockAuditClientProps {
  companyId: string;
  companyName: string;
}

export default function StockAuditClient({
  companyId,
  companyName,
}: StockAuditClientProps) {
  const params = useParams();
  const slug = (params?.slug as string) || companyId;

  const [activeTab, setActiveTab] = useState<"count" | "history">("count");
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [auditLines, setAuditLines] = useState<AuditLineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [warehouseName, setWarehouseName] = useState<string>("Main Warehouse");
  const [countedBy, setCountedBy] = useState<string>("");
  const [reviewedBy, setReviewedBy] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionCode, setActiveSessionCode] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<
    "DRAFT" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "POSTED" | "CANCELLED"
  >("DRAFT");
  const [scanMode, setScanMode] = useState<"reconcile" | "tally">("reconcile");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [submittingStage, setSubmittingStage] = useState<string | null>(null);

  // Past sessions history
  const [sessions, setSessions] = useState<StocktakeSessionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const res = await fetch(
        `/api/admin/inventory/label-products?companyId=${encodeURIComponent(
          companyId,
        )}&limit=300&fresh=true`,
      );
      const json = await res.json();
      if (json.success && json.data?.results) {
        setCatalog(json.data.results);
      }
    } catch (err) {
      console.error("Failed to load catalog for stock audit:", err);
      toast.error("Failed to load product catalog");
    } finally {
      setLoadingCatalog(false);
    }
  }, [companyId]);

  const fetchSessionHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(
        `/api/admin/inventory/audit?companyId=${encodeURIComponent(companyId)}`,
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.sessions)) {
        setSessions(json.data.sessions);
      }
    } catch (err) {
      console.error("Failed to load stocktake sessions:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCatalog();
    fetchSessionHistory();
  }, [fetchCatalog, fetchSessionHistory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of catalog) {
      if (p.category) set.add(p.category);
    }
    return ["ALL", ...Array.from(set).sort()];
  }, [catalog]);

  // Add item to count sheet:
  // - In "reconcile" mode (default when selecting from search), initialize countedQty to system stock (expectedQty)
  //   so the user enters the physical count to reconcile without accidentally setting stock to 1.
  // - In "tally" mode (barcode gun rapid counting), increment countedQty by +1 on each scan.
  const addItemToAudit = useCallback(
    (product: any, mode: "reconcile" | "tally" = "reconcile") => {
      const systemStock = Number(
        product.stock ?? product.companyStock ?? product.quantity ?? 0,
      );
      setAuditLines((prev) => {
        const existingIdx = prev.findIndex((item) => item.productId === product.id);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            expectedQty: systemStock,
            countedQty:
              mode === "tally"
                ? updated[existingIdx].countedQty + 1
                : updated[existingIdx].countedQty,
          };
          return updated;
        }
        return [
          {
            productId: product.id,
            name: product.name,
            sku: product.sku || `SKU-${product.id.slice(-6).toUpperCase()}`,
            barcode: product.barcode || product.sku || product.id,
            category: product.category || "General",
            expectedQty: systemStock,
            countedQty: mode === "tally" ? 1 : systemStock,
            costPrice: Number(product.costPrice || 0),
            sellingPrice: Number(product.price || product.sellingPrice || 0),
            image: product.image,
          },
          ...prev,
        ];
      });
    },
    [],
  );

  // Load all products (or category-filtered products) into the count sheet in 1 click
  const handleLoadProductsIntoSheet = (onlyCategory?: string) => {
    const targetCat = onlyCategory || selectedCategory;
    const filtered = catalog.filter((p) =>
      targetCat === "ALL" ? true : p.category === targetCat,
    );
    if (filtered.length === 0) {
      toast("No products found in the selected category.");
      return;
    }

    setAuditLines((prev) => {
      const existingById = new Map(prev.map((l) => [l.productId, l]));
      const merged: AuditLineItem[] = [...prev];
      let addedCount = 0;

      for (const product of filtered) {
        const sysStock = Number(
          product.stock ?? product.companyStock ?? product.quantity ?? 0,
        );
        if (!existingById.has(product.id)) {
          merged.push({
            productId: product.id,
            name: product.name,
            sku: product.sku || `SKU-${product.id.slice(-6).toUpperCase()}`,
            barcode: product.barcode || product.sku || product.id,
            category: product.category || "General",
            expectedQty: sysStock,
            countedQty: sysStock,
            costPrice: Number(product.costPrice || 0),
            sellingPrice: Number(product.price || product.sellingPrice || 0),
            image: product.image,
          });
          addedCount++;
        }
      }
      toast.success(
        addedCount > 0
          ? `Loaded ${addedCount} product(s) with current system quantities.`
          : "All matching products are already in the count sheet.",
      );
      return merged;
    });
  };

  // Handle Barcode Scan (Hardware Wedge or Camera)
  const handleBarcodeScan = useCallback(
    (code: string) => {
      const clean = code.trim().toLowerCase();
      const matched = catalog.find(
        (p) =>
          p.barcode?.toLowerCase() === clean ||
          p.sku?.toLowerCase() === clean ||
          p.id.toLowerCase() === clean ||
          p.id.slice(-8).toLowerCase() === clean,
      );

      if (matched) {
        addItemToAudit(matched, scanMode);
        toast.success(
          scanMode === "tally"
            ? `Counted +1: ${matched.name}`
            : `Loaded for reconciliation: ${matched.name} (System: ${
                matched.stock ?? matched.companyStock ?? 0
              })`,
          { duration: 1200 },
        );
      } else {
        toast.error(`Unrecognized barcode: "${code}"`);
      }
    },
    [catalog, addItemToAudit, scanMode],
  );

  useBarcodeScannerWedge({
    onScan: handleBarcodeScan,
    enabled: activeTab === "count" && activeStage !== "POSTED",
  });

  const updateCountedQty = (productId: string, newQty: number) => {
    if (activeStage === "POSTED") return;
    setAuditLines((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, countedQty: Math.max(0, Math.round(newQty)) }
          : item,
      ),
    );
  };

  const removeLine = (productId: string) => {
    if (activeStage === "POSTED") return;
    setAuditLines((prev) => prev.filter((item) => item.productId !== productId));
  };

  const startNewSession = () => {
    setActiveSessionId(null);
    setActiveSessionCode(null);
    setActiveStage("DRAFT");
    setAuditLines([]);
    setNotes("");
  };

  const resumeSession = (session: StocktakeSessionRecord) => {
    setActiveSessionId(session.id);
    setActiveSessionCode(session.sessionCode);
    setActiveStage(session.stage);
    setWarehouseName(session.warehouseName || "Main Warehouse");
    setCountedBy(session.countedBy || "");
    setReviewedBy(session.reviewedBy || "");
    setNotes(session.notes || "");
    setAuditLines(
      session.items.map((it) => {
        const catMatch = catalog.find((c) => c.id === it.productId);
        return {
          productId: it.productId,
          name: it.name,
          sku: it.sku,
          barcode: catMatch?.barcode || it.sku,
          category: catMatch?.category || "General",
          expectedQty:
            session.stage === "POSTED"
              ? it.liveSystemQtyAtPost ?? it.systemQtyAtCount
              : Number(
                  catMatch?.stock ??
                    catMatch?.companyStock ??
                    it.systemQtyAtCount ??
                    0,
                ),
          countedQty: it.countedQty,
          costPrice: it.costPrice || Number(catMatch?.costPrice || 0),
          sellingPrice: Number(catMatch?.sellingPrice || 0),
          image: catMatch?.image || null,
        };
      }),
    );
    setActiveTab("count");
  };

  // Search filter for manual addition
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return catalog
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [catalog, searchQuery]);

  // Variance & Financial Impact Summary
  // Formula: Variance = Physically Counted Quantity - System Quantity
  const summary = useMemo(() => {
    let totalExpected = 0;
    let totalCounted = 0;
    let positiveVarianceUnits = 0;
    let negativeVarianceUnits = 0;
    let netFinancialVariance = 0;
    let discrepancyCount = 0;

    for (const item of auditLines) {
      const diff = item.countedQty - item.expectedQty;
      totalExpected += item.expectedQty;
      totalCounted += item.countedQty;

      if (diff !== 0) {
        discrepancyCount++;
        if (diff > 0) positiveVarianceUnits += diff;
        if (diff < 0) negativeVarianceUnits += Math.abs(diff);
        netFinancialVariance += diff * (item.costPrice || item.sellingPrice || 0);
      }
    }

    return {
      totalItems: auditLines.length,
      totalExpected,
      totalCounted,
      discrepancyCount,
      positiveVarianceUnits,
      negativeVarianceUnits,
      netFinancialVariance,
    };
  }, [auditLines]);

  const handleSaveOrPostSession = async (
    targetStage: "DRAFT" | "SUBMITTED" | "APPROVED" | "POSTED" | "CANCELLED",
  ) => {
    if (auditLines.length === 0 && targetStage !== "CANCELLED") {
      toast.error("Add at least one product to the stocktaking session first.");
      return;
    }

    if (activeStage === "POSTED") {
      toast.error(
        "This stocktaking session has already been posted and cannot be posted again.",
      );
      return;
    }

    setSubmittingStage(targetStage);
    try {
      const res = await fetch("/api/admin/inventory/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId || undefined,
          companyId,
          stage: targetStage,
          warehouseName,
          categoryFilter: selectedCategory,
          countedBy: countedBy || undefined,
          reviewedBy: reviewedBy || undefined,
          notes,
          items: auditLines.map((l) => ({
            productId: l.productId,
            name: l.name,
            sku: l.sku,
            expectedQty: l.expectedQty,
            countedQty: l.countedQty,
            variance: l.countedQty - l.expectedQty,
            costPrice: l.costPrice,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to process stocktake session");
      }

      toast.success(json.message || `Session ${targetStage} successfully!`);

      if (json.data?.sessionId) {
        setActiveSessionId(json.data.sessionId);
      }
      if (json.data?.sessionCode) {
        setActiveSessionCode(json.data.sessionCode);
      }
      setActiveStage(targetStage);

      // Refresh live catalog & session history
      await Promise.all([fetchCatalog(), fetchSessionHistory()]);

      if (targetStage === "POSTED") {
        // Update expectedQty in UI to reflect the newly reconciled system stock
        setAuditLines((prev) =>
          prev.map((line) => ({
            ...line,
            expectedQty: line.countedQty,
          })),
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving stocktaking session");
    } finally {
      setSubmittingStage(null);
    }
  };

  const exportAuditCsv = () => {
    if (auditLines.length === 0) return;
    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Warehouse",
      "System Stock",
      "Physical Count",
      "Variance",
      "Unit Cost (KES)",
      "Variance Value (KES)",
    ];
    const rows = auditLines.map((l) => {
      const diff = l.countedQty - l.expectedQty;
      const val = diff * (l.costPrice || l.sellingPrice || 0);
      return [
        `"${l.name.replace(/"/g, '""')}"`,
        l.sku,
        `"${l.category}"`,
        `"${warehouseName}"`,
        l.expectedQty,
        l.countedQty,
        diff > 0 ? `+${diff}` : `${diff}`,
        l.costPrice || l.sellingPrice || 0,
        val.toFixed(2),
      ].join(",");
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `stocktake_${activeSessionCode || "session"}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
            <ClipboardCheck className="w-4 h-4" />
            <span>Physical Stocktaking & Reconciliation</span>
            {activeSessionCode && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
                {activeSessionCode}
              </span>
            )}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                activeStage === "POSTED"
                  ? "bg-emerald-100 text-emerald-800"
                  : activeStage === "SUBMITTED" || activeStage === "APPROVED"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {activeStage}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Inventory Stocktaking — {companyName}
          </h1>
          <p className="text-sm text-slate-500">
            Count physical inventory, review system variances (Counted − System), and post auditable stock reconciliations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/admin/${slug}/inventory`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>

          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("count")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "count"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              Count Sheet ({auditLines.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "history"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Sessions History ({sessions.length})
            </button>
          </div>

          {activeStage === "POSTED" && (
            <button
              type="button"
              onClick={startNewSession}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              New Stocktake Session
            </button>
          )}
        </div>
      </div>

      {activeTab === "history" ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Stocktaking Session History & Variance Reports
              </h2>
              <p className="text-xs text-slate-500">
                Inspect past posted reconciliations or resume draft/submitted sessions
              </p>
            </div>
            <button
              type="button"
              onClick={ startNewSession }
              className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              + Start New Session
            </button>
          </div>

          {loadingHistory ? (
            <div className="p-12 flex items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading stocktaking history...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No stocktaking sessions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((s) => {
                const isExpanded = expandedSessionId === s.id;
                return (
                  <div key={s.id} className="p-5 hover:bg-slate-50/50 transition">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {s.sessionCode}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              s.stage === "POSTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : s.stage === "CANCELLED"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {s.stage}
                          </span>
                          <span className="text-xs text-slate-500">
                            • {s.warehouseName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Counted by <strong className="text-slate-700">{s.countedBy}</strong> on{" "}
                          {new Date(s.auditDate).toLocaleString()}
                          {s.notes ? ` — "${s.notes}"` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right text-xs">
                          <div className="font-semibold text-slate-700">
                            {s.summary?.totalItemsCounted || s.items.length} items counted •{" "}
                            <span
                              className={
                                (s.summary?.discrepancyCount || 0) > 0
                                  ? "text-amber-600 font-bold"
                                  : "text-emerald-600 font-bold"
                              }
                            >
                              {s.summary?.discrepancyCount || 0} discrepancies
                            </span>
                          </div>
                          <div className="text-slate-400">
                            Net Variance: {s.summary?.netVarianceUnits >= 0 ? "+" : ""}
                            {s.summary?.netVarianceUnits || 0} units (KES{" "}
                            {(s.summary?.netFinancialImpact || 0).toLocaleString()})
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSessionId(isExpanded ? null : s.id)
                            }
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white"
                          >
                            {isExpanded ? "Hide Items" : "View Report"}
                          </button>
                          {s.stage !== "POSTED" && s.stage !== "CANCELLED" && (
                            <button
                              type="button"
                              onClick={() => resumeSession(s)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                            >
                              Resume Session
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && s.items.length > 0 && (
                      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-xl bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                            <tr>
                              <th className="py-2.5 px-4">Product</th>
                              <th className="py-2.5 px-4">SKU</th>
                              <th className="py-2.5 px-4 text-center">System Stock</th>
                              <th className="py-2.5 px-4 text-center">Counted Stock</th>
                              <th className="py-2.5 px-4 text-center">Variance</th>
                              <th className="py-2.5 px-4 text-right">Value Impact</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {s.items.map((it) => (
                              <tr key={it.productId}>
                                <td className="py-2 px-4 font-semibold text-slate-800">
                                  {it.name}
                                </td>
                                <td className="py-2 px-4 font-mono text-slate-500">
                                  {it.sku}
                                </td>
                                <td className="py-2 px-4 text-center font-semibold">
                                  {it.liveSystemQtyAtPost ?? it.systemQtyAtCount}
                                </td>
                                <td className="py-2 px-4 text-center font-bold text-slate-900">
                                  {it.countedQty}
                                </td>
                                <td className="py-2 px-4 text-center font-bold">
                                  <span
                                    className={
                                      it.variance > 0
                                        ? "text-emerald-600"
                                        : it.variance < 0
                                          ? "text-rose-600"
                                          : "text-slate-400"
                                    }
                                  >
                                    {it.variance > 0 ? `+${it.variance}` : it.variance}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-right font-mono">
                                  KES {(it.varianceValue || 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Session Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Warehouse / Stock Location
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  disabled={activeStage === "POSTED"}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Storefront Floor">Storefront Display Floor</option>
                  <option value="Backroom Storage">Backroom Storage</option>
                  <option value="Dispatch Staging">Dispatch Staging Area</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Filter & Bulk Load Category
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={activeStage === "POSTED"}
                  className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "ALL" ? `All Categories (${catalog.length})` : cat}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={loadingCatalog || activeStage === "POSTED"}
                  onClick={() => handleLoadProductsIntoSheet(selectedCategory)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Load Sheet
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Counted By / Reviewed By
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={countedBy}
                  onChange={(e) => setCountedBy(e.target.value)}
                  disabled={activeStage === "POSTED"}
                  placeholder="Counted by..."
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="text"
                  value={reviewedBy}
                  onChange={(e) => setReviewedBy(e.target.value)}
                  disabled={activeStage === "POSTED"}
                  placeholder="Reviewed by..."
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Barcode Scan Behavior
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setScanMode("reconcile")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                    scanMode === "reconcile"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Reconcile (Set Qty)
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode("tally")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                    scanMode === "tally"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600"
                  }`}
                >
                  Rapid Tally (+1)
                </button>
              </div>
            </div>
          </div>

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">
                SKUs in Count Sheet
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {summary.totalItems}
                </span>
                <span className="text-xs text-slate-400">
                  of {catalog.length} total SKUs
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">
                Physical Count vs System Stock
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {summary.totalCounted}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    / {summary.totalExpected} sys
                  </span>
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {summary.totalCounted - summary.totalExpected >= 0 ? "+" : ""}
                  {summary.totalCounted - summary.totalExpected} net
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">
                Discrepancies (Surplus / Shortage)
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-bold ${
                    summary.discrepancyCount > 0
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}
                >
                  {summary.discrepancyCount}
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-emerald-600 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />+
                    {summary.positiveVarianceUnits}
                  </span>
                  <span className="text-rose-600 flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5" />-
                    {summary.negativeVarianceUnits}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <span className="text-xs font-medium text-slate-500">
                Net Financial Variance
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span
                  className={`text-2xl font-bold ${
                    summary.netFinancialVariance < 0
                      ? "text-rose-600"
                      : summary.netFinancialVariance > 0
                        ? "text-emerald-600"
                        : "text-slate-900"
                  }`}
                >
                  {summary.netFinancialVariance < 0 ? "-" : "+"}KES{" "}
                  {Math.abs(summary.netFinancialVariance).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">Cost Valuation</span>
              </div>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                disabled={activeStage === "POSTED"}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search product by name, SKU, or scan barcode..."
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />

              {searchResults.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {searchResults.map((p) => {
                    const sysStock = p.stock ?? p.companyStock ?? p.quantity ?? 0;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          addItemToAudit(p, "reconcile");
                          setSearchQuery("");
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {p.name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            SKU: {p.sku} • Category: {p.category || "General"}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          System Stock: {sysStock}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                disabled={activeStage === "POSTED"}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition disabled:opacity-50"
              >
                <ScanBarcode className="w-4 h-4" />
                Camera Scan
              </button>

              {auditLines.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={exportAuditCsv}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Export CSV
                  </button>
                  {activeStage !== "POSTED" && (
                    <button
                      type="button"
                      onClick={() => setAuditLines([])}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Clear Sheet
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loadingCatalog ? (
              <div className="p-12 flex items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading store inventory catalog...</span>
              </div>
            ) : auditLines.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <ScanBarcode className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-800">
                    Ready to Start Physical Stocktaking
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click <strong>&ldquo;Load All Store Products&rdquo;</strong> below to load current system quantities into the count sheet, or scan individual product barcodes.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleLoadProductsIntoSheet("ALL")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Layers className="w-4 h-4" />
                    Load All Store Products ({catalog.length})
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">SKU / Category</th>
                      <th className="py-3.5 px-4 text-center">System Stock</th>
                      <th className="py-3.5 px-4 text-center">
                        Physically Counted Qty
                      </th>
                      <th className="py-3.5 px-4 text-center">
                        Variance (Counted − System)
                      </th>
                      <th className="py-3.5 px-4 text-right">Value Impact</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {auditLines.map((line) => {
                      const variance = line.countedQty - line.expectedQty;
                      const unitVal = line.costPrice || line.sellingPrice || 0;
                      const valueImpact = variance * unitVal;

                      return (
                        <tr
                          key={line.productId}
                          className={`hover:bg-slate-50/80 transition ${
                            variance !== 0 ? "bg-amber-50/20" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 font-medium text-slate-900">
                            {line.name}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-xs font-mono text-slate-600">
                              {line.sku}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {line.category}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-600">
                            {line.expectedQty}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                disabled={activeStage === "POSTED"}
                                onClick={() =>
                                  updateCountedQty(
                                    line.productId,
                                    line.countedQty - 1,
                                  )
                                }
                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 disabled:opacity-40"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                min={0}
                                disabled={activeStage === "POSTED"}
                                value={line.countedQty}
                                onChange={(e) =>
                                  updateCountedQty(
                                    line.productId,
                                    parseInt(e.target.value || "0", 10),
                                  )
                                }
                                className="w-20 text-center font-bold text-slate-900 border border-slate-200 rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              />
                              <button
                                type="button"
                                disabled={activeStage === "POSTED"}
                                onClick={() =>
                                  updateCountedQty(
                                    line.productId,
                                    line.countedQty + 1,
                                  )
                                }
                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 disabled:opacity-40"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {variance === 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />0 Exact
                              </span>
                            ) : variance > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                +{variance} Surplus (→ {line.countedQty})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {variance} Shortage (→ {line.countedQty})
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold">
                            <span
                              className={
                                valueImpact < 0
                                  ? "text-rose-600"
                                  : valueImpact > 0
                                    ? "text-emerald-600"
                                    : "text-slate-400"
                              }
                            >
                              {valueImpact < 0 ? "-" : valueImpact > 0 ? "+" : ""}
                              KES {Math.abs(valueImpact).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {activeStage !== "POSTED" && (
                              <button
                                type="button"
                                onClick={() => removeLine(line.productId)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Controls */}
            {auditLines.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <input
                  type="text"
                  value={notes}
                  disabled={activeStage === "POSTED"}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional stocktaking notes (e.g. Monthly Warehouse Count, Shelf B-4 damaged box)..."
                  className="flex-1 px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                {activeStage === "POSTED" ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    Reconciliation Posted & Locked ({activeSessionCode})
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      disabled={Boolean(submittingStage)}
                      onClick={() => handleSaveOrPostSession("DRAFT")}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition disabled:opacity-50"
                    >
                      {submittingStage === "DRAFT" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Draft
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(submittingStage)}
                      onClick={() => handleSaveOrPostSession("SUBMITTED")}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition disabled:opacity-50"
                    >
                      {submittingStage === "SUBMITTED" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Submit for Review
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(submittingStage)}
                      onClick={() => handleSaveOrPostSession("POSTED")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition"
                    >
                      {submittingStage === "POSTED" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                      Approve & Post Reconciliation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <POSCameraBarcodeScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScan={handleBarcodeScan}
      />
    </div>
  );
}
