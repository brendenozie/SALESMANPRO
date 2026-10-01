"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  SparklesIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  TagIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { MascotTaskCenter } from "@/components/ai/mascot/MascotTaskCenter";

interface MascotTaskCenterClientProps {
  companyId: string;
  storeSlug: string;
  storeName: string;
  userRole: string;
}

export default function MascotTaskCenterClient({
  companyId,
  storeSlug,
  storeName,
  userRole,
}: MascotTaskCenterClientProps) {
  const [quickLaunchLoading, setQuickLaunchLoading] = useState<string | null>(null);

  const handleQuickLaunch = async (
    taskType: string,
    title: string,
    input: Record<string, any>,
    requiresApproval: boolean = false,
    approvalDetails?: any
  ) => {
    setQuickLaunchLoading(taskType);
    try {
      const res = await fetch("/api/ai/mascot/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          taskType,
          title,
          input,
          requiresApproval,
          approvalDetails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || "Failed to launch task");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to launch task");
    } finally {
      setQuickLaunchLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/${storeSlug}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <Link
            href={`/admin/${storeSlug}/settings/ai-mascot`}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            AI Mascot Settings →
          </Link>
        </div>

        {/* Page Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                AI Task Orchestration Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor and orchestrate persistent, background-running autonomous operations for <span className="font-semibold text-slate-800 dark:text-slate-200">{storeName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Worker Online
            </span>
          </div>
        </div>

        {/* Quick Launch Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() =>
              handleQuickLaunch("REPORT_GENERATION", "Monthly Business Performance Audit", { period: "month" })
            }
            disabled={quickLaunchLoading !== null}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition shadow-sm text-left group"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
              <DocumentChartBarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                Run Sales Report
              </div>
              <div className="text-[11px] text-slate-500">
                Audits orders, revenue & AOV in background
              </div>
            </div>
          </button>

          <button
            onClick={() =>
              handleQuickLaunch("DEAD_STOCK_AUDIT", "Inventory Turnover & Dead Stock Audit", {})
            }
            disabled={quickLaunchLoading !== null}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition shadow-sm text-left group"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition">
              <TagIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                Audit Dead Stock
              </div>
              <div className="text-[11px] text-slate-500">
                Scans slow-moving catalog stock
              </div>
            </div>
          </button>

          <button
            onClick={() =>
              handleQuickLaunch("MARKETPLACE_SYNC", "Ghuba Multi-Store Sync Check", {})
            }
            disabled={quickLaunchLoading !== null}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition shadow-sm text-left group"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition">
              <ShoppingBagIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                Check Ghuba Sync
              </div>
              <div className="text-[11px] text-slate-500">
                Verifies multi-store catalog listings
              </div>
            </div>
          </button>
        </div>

        {/* Central Task Center Component */}
        <div className="min-h-[500px]">
          <MascotTaskCenter
            companyId={companyId}
            storeSlug={storeSlug}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  );
}
