"use client";

import React, { useState } from "react";
import {
  CalendarDaysIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { ReportingPeriod } from "@/lib/dashboard/dateRangeHelper";

interface PeriodSelectorProps {
  currentPeriod: ReportingPeriod;
  onPeriodChange: (period: ReportingPeriod, customStart?: string, customEnd?: string) => void;
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
}

const PERIOD_OPTIONS: Array<{ key: ReportingPeriod; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7days", label: "Last 7 Days" },
  { key: "last30days", label: "Last 30 Days" },
  { key: "thisWeek", label: "This Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "previousMonth", label: "Previous Month" },
  { key: "thisQuarter", label: "This Quarter" },
  { key: "thisYear", label: "This Year" },
  { key: "custom", label: "Custom Range" },
];

export default function PeriodSelector({
  currentPeriod,
  onPeriodChange,
  lastUpdated,
  isRefreshing,
  onRefresh,
}: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const currentLabel =
    PERIOD_OPTIONS.find((p) => p.key === currentPeriod)?.label || "Last 7 Days";

  const handleSelect = (key: ReportingPeriod) => {
    setIsOpen(false);
    if (key === "custom") {
      setShowCustomModal(true);
    } else {
      onPeriodChange(key);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStartDate && customEndDate) {
      setShowCustomModal(false);
      onPeriodChange("custom", customStartDate, customEndDate);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {/* Period Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all shadow-sm"
          title="Select Reporting Period"
        >
          <CalendarDaysIcon className="w-4 h-4 text-orange-600 dark:text-orange-400 stroke-[2]" />
          <span>{currentLabel}</span>
          <ChevronDownIcon
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Reporting Window
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {PERIOD_OPTIONS.map((opt) => {
                  const isSelected = opt.key === currentPeriod;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelect(opt.key)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <CheckIcon className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Manual Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all shadow-sm disabled:opacity-60"
        title="Refresh Portfolio Data"
      >
        <ArrowPathIcon
          className={`w-4 h-4 text-slate-500 dark:text-slate-400 stroke-[2] ${
            isRefreshing ? "animate-spin text-orange-500" : ""
          }`}
        />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {/* Custom Date Range Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Select Custom Date Range
            </h3>
            <form onSubmit={handleApplyCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/10"
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
