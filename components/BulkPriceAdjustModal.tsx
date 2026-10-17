"use client";

import React, { useState } from "react";
import { XMarkIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface BulkPriceAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: any[];
  companyId: string;
  onSuccess: () => void;
}

export default function BulkPriceAdjustModal({
  isOpen,
  onClose,
  selectedProducts,
  companyId,
  onSuccess,
}: BulkPriceAdjustModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"percentage" | "flat" | "set">("percentage");
  const [direction, setDirection] = useState<"increase" | "decrease">("decrease");
  const [value, setValue] = useState<string>("10");
  const [isApplying, setIsApplying] = useState<boolean>(false);

  if (!isOpen || selectedProducts.length === 0) return null;

  const calculateNewPrice = (currentPrice: number) => {
    const val = parseFloat(value) || 0;
    if (adjustmentType === "set") return Math.max(0, val);
    if (adjustmentType === "flat") {
      return direction === "increase" ? currentPrice + val : Math.max(0, currentPrice - val);
    }
    // Percentage
    const delta = (currentPrice * val) / 100;
    return direction === "increase" ? Math.round(currentPrice + delta) : Math.max(0, Math.round(currentPrice - delta));
  };

  const handleApply = async () => {
    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid adjustment value");
      return;
    }

    setIsApplying(true);
    let successCount = 0;

    try {
      await Promise.all(
        selectedProducts.map(async (prod) => {
          const currentPrice =
            prod.sellingPrice ||
            prod.productItem?.sellingPrice ||
            prod.costPrice ||
            0;
          const newPrice = calculateNewPrice(currentPrice);

          const res = await fetch("/api/admin/post-product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: prod.id,
              companyId,
              name: prod.name,
              sellingPrice: newPrice,
            }),
          });
          if (res.ok) successCount++;
        })
      );

      toast.success(`Successfully updated prices for ${successCount} products!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update some product prices");
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">
              Bulk Price Adjustment ({selectedProducts.length} items)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Method Selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setAdjustmentType("percentage")}
              className={`py-2 rounded-xl transition ${
                adjustmentType === "percentage" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600"
              }`}
            >
              Percentage (%)
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType("flat")}
              className={`py-2 rounded-xl transition ${
                adjustmentType === "flat" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600"
              }`}
            >
              Flat Amount (KES)
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType("set")}
              className={`py-2 rounded-xl transition ${
                adjustmentType === "set" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600"
              }`}
            >
              Set Fixed Price
            </button>
          </div>

          {/* Direction & Input */}
          <div className="space-y-3">
            {adjustmentType !== "set" && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDirection("decrease")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                    direction === "decrease"
                      ? "bg-rose-50 border-rose-200 text-rose-700 ring-2 ring-rose-400/20"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  <ArrowTrendingDownIcon className="w-4 h-4 text-rose-600" />
                  <span>Discount / Decrease</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection("increase")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                    direction === "increase"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-400/20"
                      : "bg-white border-gray-200 text-gray-600"
                  }`}
                >
                  <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-600" />
                  <span>Markup / Increase</span>
                </button>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {adjustmentType === "percentage"
                  ? "Percentage Change (%)"
                  : adjustmentType === "flat"
                  ? "Amount to Adjust (KES)"
                  : "New Fixed Price for Selected Products (KES)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-base font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  {adjustmentType === "percentage" ? "%" : "KES"}
                </span>
              </div>
            </div>
          </div>

          {/* Sample Preview Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview Changes</h4>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 max-h-40 overflow-y-auto divide-y divide-gray-200/60 text-xs">
              {selectedProducts.slice(0, 5).map((p) => {
                const cur = p.sellingPrice || p.productItem?.sellingPrice || 0;
                const next = calculateNewPrice(cur);
                return (
                  <div key={p.id} className="p-2.5 flex items-center justify-between">
                    <span className="font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through">KES {Number(cur).toLocaleString()}</span>
                      <span className="font-bold text-indigo-600">KES {Number(next).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
              {selectedProducts.length > 5 && (
                <div className="p-2 text-center text-[11px] text-gray-400 italic">
                  + {selectedProducts.length - 5} more items will be updated
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100 flex items-center gap-2"
          >
            {isApplying ? "Updating..." : `Apply to ${selectedProducts.length} Items`}
          </button>
        </div>
      </div>
    </div>
  );
}
