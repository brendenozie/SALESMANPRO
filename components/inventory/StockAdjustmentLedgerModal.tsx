"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  XMarkIcon as X,
  AdjustmentsHorizontalIcon as SlidersHorizontal,
  ClockIcon as History,
  ArrowPathIcon as Loader2,
  ArrowUpRightIcon as ArrowUpRight,
  ArrowDownRightIcon as ArrowDownRight,
  CheckCircleIcon as CheckCircle2,
  ExclamationTriangleIcon as AlertTriangle,
  ShieldExclamationIcon as ShieldAlert,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface StockAdjustmentLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  product?: any | null;
  initialTab?: "adjust" | "ledger";
  onSuccess?: () => Promise<void> | void;
}

const MOVEMENT_OPTIONS = [
  {
    value: "STOCK_ADDITION",
    label: "+ Stock Addition (General Increase)",
    mode: "add",
  },
  {
    value: "PURCHASE_RECEIPT",
    label: "+ Purchase Receipt (Supplier Delivery)",
    mode: "add",
  },
  {
    value: "CUSTOMER_RETURN",
    label: "+ Customer Return (Restock Sellable)",
    mode: "add",
  },
  {
    value: "STOCK_REDUCTION",
    label: "− Stock Reduction (General Decrease)",
    mode: "subtract",
  },
  {
    value: "DAMAGE",
    label: "− Damaged Stock (Remove from Sellable)",
    mode: "subtract",
  },
  {
    value: "WRITE_OFF",
    label: "− Write-Off / Expired / Lost",
    mode: "subtract",
  },
  {
    value: "SUPPLIER_RETURN",
    label: "− Return to Supplier",
    mode: "subtract",
  },
  {
    value: "STOCK_CORRECTION",
    label: "= Set Exact Stock Quantity (Correction)",
    mode: "exact",
  },
];

export default function StockAdjustmentLedgerModal({
  isOpen,
  onClose,
  companyId,
  product,
  initialTab = "adjust",
  onSuccess,
}: StockAdjustmentLedgerModalProps) {
  const [activeTab, setActiveTab] = useState<"adjust" | "ledger">(
    product ? initialTab : "ledger",
  );
  const [movementType, setMovementType] = useState<string>("STOCK_ADDITION");
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [reorderThreshold, setReorderThreshold] = useState<number>(
    Number(product?.reorderThreshold ?? product?.productItem?.reorderThreshold ?? 10),
  );
  const [warehouseName, setWarehouseName] = useState<string>("Main Warehouse");
  const [reason, setReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Ledger state
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterType, setFilterType] = useState<string>("");

  const currentStock = Number(
    product?.companyStock ?? product?.quantity ?? 0,
  );

  useEffect(() => {
    if (product) {
      setActiveTab(initialTab);
      setReorderThreshold(
        Number(
          product.reorderThreshold ??
            product.productItem?.reorderThreshold ??
            10,
        ),
      );
      setQuantityInput(1);
      setReason("");
    } else {
      setActiveTab("ledger");
    }
  }, [product, initialTab, isOpen]);

  const fetchLedger = useCallback(async () => {
    if (!companyId || !isOpen) return;
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams({ companyId, limit: "100" });
      if (product?.id) params.set("productId", product.id);
      if (filterType) params.set("movementType", filterType);

      const res = await fetch(`/api/admin/inventory/adjust?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.logs)) {
        setLogs(json.data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch inventory ledger:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [companyId, product?.id, filterType, isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === "ledger") {
      fetchLedger();
    }
  }, [isOpen, activeTab, fetchLedger]);

  if (!isOpen) return null;

  const selectedOption =
    MOVEMENT_OPTIONS.find((o) => o.value === movementType) ||
    MOVEMENT_OPTIONS[0];

  const projectedStock =
    selectedOption.mode === "exact"
      ? Math.max(0, Math.floor(quantityInput))
      : selectedOption.mode === "add"
        ? currentStock + Math.max(0, Math.floor(quantityInput))
        : currentStock - Math.max(0, Math.floor(quantityInput));

  const projectedDelta = projectedStock - currentStock;

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    if (!reason.trim()) {
      toast.error("Please enter a reason or reference for this stock movement.");
      return;
    }
    if (projectedStock < 0) {
      toast.error(
        `Insufficient stock. Available: ${currentStock}, cannot reduce by ${quantityInput}.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        companyId,
        productId: product.id,
        movementType,
        reorderThreshold: Math.max(0, Math.floor(reorderThreshold)),
        warehouseName,
        reason: reason.trim(),
      };

      if (selectedOption.mode === "exact") {
        payload.targetQuantity = Math.max(0, Math.floor(quantityInput));
      } else {
        payload.quantityDelta = Math.max(1, Math.floor(quantityInput));
      }

      const res = await fetch("/api/admin/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to adjust stock");
      }

      toast.success(json.message || "Inventory updated & logged!");
      if (onSuccess) await onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Stock adjustment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-gray-800/60 border-b border-slate-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              {product
                ? `Inventory Control & Ledger — ${product.name}`
                : "Store Inventory Movement Ledger"}
            </h2>
            <p className="text-xs text-slate-500">
              {product
                ? `Current On-Hand Stock: ${currentStock} units • Reorder Threshold: ${reorderThreshold} units`
                : "Complete auditable history of stock additions, reductions, stocktakes, transfers, and sales"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {product && (
              <div className="inline-flex rounded-xl bg-slate-200/70 dark:bg-gray-800 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("adjust")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeTab === "adjust"
                      ? "bg-white dark:bg-gray-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-gray-400"
                  }`}
                >
                  Adjust Stock
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("ledger")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    activeTab === "ledger"
                      ? "bg-white dark:bg-gray-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-gray-400"
                  }`}
                >
                  Movement Ledger
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === "adjust" && product ? (
            <form onSubmit={handleAdjustSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Movement Type
                  </label>
                  <select
                    value={movementType}
                    onChange={(e) => {
                      setMovementType(e.target.value);
                      if (e.target.value === "STOCK_CORRECTION") {
                        setQuantityInput(currentStock);
                      } else if (quantityInput === 0) {
                        setQuantityInput(1);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MOVEMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Warehouse / Location
                  </label>
                  <select
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="Storefront Floor">Storefront Display Floor</option>
                    <option value="Backroom Storage">Backroom Storage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    {selectedOption.mode === "exact"
                      ? "New Exact Physical Stock Quantity"
                      : "Quantity to Adjust"}
                  </label>
                  <input
                    type="number"
                    min={selectedOption.mode === "exact" ? 0 : 1}
                    value={quantityInput}
                    onChange={(e) =>
                      setQuantityInput(
                        Math.max(
                          selectedOption.mode === "exact" ? 0 : 1,
                          parseInt(e.target.value || "0", 10),
                        ),
                      )
                    }
                    className="w-full px-3.5 py-2.5 text-base font-bold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Low-Stock Reorder Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={reorderThreshold}
                    onChange={(e) =>
                      setReorderThreshold(
                        Math.max(0, parseInt(e.target.value || "0", 10)),
                      )
                    }
                    className="w-full px-3.5 py-2.5 text-base font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Live Reconciliation Preview */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  projectedStock < 0
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : projectedDelta > 0
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : projectedDelta < 0
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                    Authoritative Stock Impact (Warehouse & Ghuba Marketplace)
                  </div>
                  <div className="text-sm font-semibold">
                    Current: <strong>{currentStock}</strong> units → New:{" "}
                    <strong>{projectedStock}</strong> units (
                    {projectedDelta >= 0 ? `+${projectedDelta}` : projectedDelta}{" "}
                    units)
                  </div>
                </div>
                {projectedStock < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                    <ShieldAlert className="w-4 h-4" /> Insufficient Stock
                  </span>
                ) : projectedStock === 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-white/80 px-2.5 py-1 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" /> Marks Out of Stock on Ghuba
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white/80 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Available on Ghuba
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Audit Reason / Reference Note (Required)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="e.g., Received supplier batch #INV-409, or 2 units damaged during shelf restocking..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || projectedStock < 0}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Recording Movement..." : "Post Stock Adjustment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 font-medium">
                  Showing {logs.length} auditable stock movement record(s)
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="">All Movement Types</option>
                  <option value="OPENING_STOCK">Opening Stock</option>
                  <option value="RESTOCK">Restock</option>
                  <option value="PURCHASE_RECEIPT">Purchase Receipt</option>
                  <option value="STOCK_ADDITION">Stock Addition</option>
                  <option value="STOCK_REDUCTION">Stock Reduction</option>
                  <option value="STOCKTAKE_ADJUSTMENT">Stocktake Adjustment</option>
                  <option value="TRANSFER_OUT">Transfer Out</option>
                  <option value="TRANSFER_IN">Transfer In</option>
                  <option value="SALE">Customer Sale</option>
                  <option value="POS_SALE">POS Sale</option>
                  <option value="ORDER_CANCELLATION">Order Cancellation</option>
                  <option value="AGENT_ASSIGN">Agent Assign</option>
                  <option value="AGENT_RETURN">Agent Return</option>
                  <option value="DAMAGE">Damage</option>
                  <option value="WRITE_OFF">Write-Off</option>
                  <option value="STOCK_CORRECTION">Stock Correction</option>
                </select>
              </div>

              {loadingLogs ? (
                <div className="py-12 flex items-center justify-center text-slate-400 gap-2 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading movement ledger...
                </div>
              ) : logs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No inventory movements recorded for this filter yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Date / Ref</th>
                        {!product && <th className="py-2.5 px-3">Product</th>}
                        <th className="py-2.5 px-3">Movement</th>
                        <th className="py-2.5 px-3 text-center">Qty Change</th>
                        <th className="py-2.5 px-3 text-center">Prev → New</th>
                        <th className="py-2.5 px-3">Reason & Actor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.map((log) => {
                        const isPositive =
                          log.delta !== null
                            ? log.delta > 0
                            : ["NEWSTOCK", "RESTOCK", "RETURN", "TRANSFER_IN", "STOCK_ADDITION", "PURCHASE_RECEIPT", "CUSTOMER_RETURN", "ORDER_CANCELLATION"].includes(
                                log.movementType,
                              );
                        return (
                          <tr key={log.id} className="hover:bg-slate-50/70">
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-medium text-slate-800">
                                {new Date(log.createdAt).toLocaleDateString()}{" "}
                                {new Date(log.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              {log.referenceId && (
                                <div className="font-mono text-[10px] text-slate-400">
                                  {log.referenceId}
                                </div>
                              )}
                            </td>
                            {!product && (
                              <td className="py-2.5 px-3 font-semibold text-slate-800">
                                {log.productName}
                              </td>
                            )}
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPositive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-800"
                                }`}
                              >
                                {isPositive ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3" />
                                )}
                                {log.movementType}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              <span
                                className={
                                  isPositive
                                    ? "text-emerald-600"
                                    : "text-rose-600"
                                }
                              >
                                {log.delta !== null
                                  ? log.delta > 0
                                    ? `+${log.delta}`
                                    : log.delta
                                  : isPositive
                                    ? `+${log.quantity}`
                                    : `-${log.quantity}`}
                              </span>
                              {log.damaged > 0 && (
                                <div className="text-[10px] text-rose-500">
                                  ({log.damaged} dmg)
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                              {log.previousQuantity !== null &&
                              log.newQuantity !== null
                                ? `${log.previousQuantity} → ${log.newQuantity}`
                                : "—"}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="text-slate-700 line-clamp-2">
                                {log.reason || log.summary}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                By {log.actorName || "System"} •{" "}
                                {log.warehouseName || "Main Warehouse"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

