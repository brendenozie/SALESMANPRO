"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
  ArrowPathIcon,
  FunnelIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ScaleIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { GhubaAdminMetrics } from "@/lib/payments/reportingService";

interface GhubaPaymentsClientProps {
  slug: string;
  initialMetrics: GhubaAdminMetrics;
}

export default function GhubaPaymentsClient({
  slug,
  initialMetrics,
}: GhubaPaymentsClientProps) {
  const [metrics, setMetrics] = useState<GhubaAdminMetrics>(initialMetrics);
  const [period, setPeriod] = useState<string>("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchMetrics = useCallback(
    async (selectedPeriod = period) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ period: selectedPeriod });
        if (selectedPeriod === "custom") {
          if (customStart) params.append("startDate", customStart);
          if (customEnd) params.append("endDate", customEnd);
        }

        const res = await fetch(`/api/admin/marketplace-gh/payments?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setMetrics(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load Ghuba metrics:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [period, customStart, customEnd]
  );

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (newPeriod !== "custom") {
      fetchMetrics(newPeriod);
    }
  };

  const formatMoney = (amount: number = 0) => {
    return `KES ${Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <SparklesIcon className="w-3.5 h-3.5" />
                Ghuba Payment Intelligence
              </span>
              <span className="text-xs text-slate-400">Authoritative Marketplace Financials</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ghuba Marketplace Payments & Settlement
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Aggregated Gross Merchandise Value (GMV), platform fee earnings, and store net settlements across all marketplace listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/${slug}/payments`}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
            >
              <BuildingStorefrontIcon className="w-4 h-4" />
              Store Payments
            </Link>
            <button
              onClick={() => fetchMetrics(period)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
          <FunnelIcon className="w-4 h-4 text-slate-400 mr-1" />
          {[
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "7days", label: "Last 7 Days" },
            { id: "30days", label: "Last 30 Days" },
            { id: "thisMonth", label: "This Month" },
            { id: "lastMonth", label: "Last Month" },
            { id: "all", label: "All Time" },
            { id: "custom", label: "Custom Range" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                period === p.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}

          {period === "custom" && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-slate-200"
              />
              <span className="text-xs text-slate-500">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-slate-200"
              />
              <button
                onClick={() => fetchMetrics("custom")}
                className="px-3 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Ghuba GMV */}
        <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Ghuba GMV</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CurrencyDollarIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatMoney(metrics.totalGhubaGMV)}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">{metrics.successfulCount} paid orders</span>
            <span>•</span>
            <span>AOV: {formatMoney(metrics.averageOrderValue)}</span>
          </div>
        </div>

        {/* Ghuba Commissions Earned */}
        <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Ghuba Fee Revenue</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-purple-300 tracking-tight">
            {formatMoney(metrics.ghubaFeesEarned)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Marketplace commission retainage on completed sales
          </div>
        </div>

        {/* Net Store Payouts */}
        <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Net Store Amount</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ScaleIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-blue-300 tracking-tight">
            {formatMoney(metrics.netPayableToStores)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Payable to participating stores after fees & refunds
          </div>
        </div>

        {/* Refunds */}
        <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Refunds</span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowUturnLeftIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-rose-300 tracking-tight">
            {formatMoney(metrics.totalRefunds)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Approved item returns & customer refunds
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Settlement Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Settlement Breakdown Card */}
        <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <DocumentCheckIcon className="w-5 h-5 text-amber-400" />
            Store Settlement Status
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Distinction between received customer funds and distributed store payouts.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-xs font-medium text-slate-300">Pending Settlement</span>
              </div>
              <span className="text-sm font-bold text-amber-400">
                {formatMoney(metrics.pendingSettlement)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium text-slate-300">Settled to Stores</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {formatMoney(metrics.settledAmount)}
              </span>
            </div>

            <div className="pt-2 text-xs text-slate-500 leading-relaxed">
              * A successful payment on Ghuba is held until the return window elapses or scheduled payout runs.
            </div>
          </div>
        </div>

        {/* Transaction Status Counts */}
        <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-indigo-400" />
            Order Volume Distribution
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Marketplace checkout payment states for selected period.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="text-lg font-bold text-white">{metrics.successfulCount}</div>
                <div className="text-xs text-slate-400">Successful</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center gap-3">
              <ClockIcon className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <div className="text-lg font-bold text-white">{metrics.pendingCount}</div>
                <div className="text-xs text-slate-400">Pending</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center gap-3">
              <XCircleIcon className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <div className="text-lg font-bold text-white">{metrics.failedCount}</div>
                <div className="text-xs text-slate-400">Failed</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-700/60 flex items-center gap-3">
              <ArrowUturnLeftIcon className="w-6 h-6 text-indigo-400 shrink-0" />
              <div>
                <div className="text-lg font-bold text-white">{metrics.totalRefunds > 0 ? "Active" : "0"}</div>
                <div className="text-xs text-slate-400">Refunds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mathematical Integrity Card */}
        <div className="p-6 rounded-xl bg-slate-800/60 border border-slate-700">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ScaleIcon className="w-5 h-5 text-emerald-400" />
            Financial Balance Equation
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Authoritative accounting verification for Ghuba transactions.
          </p>

          <div className="mt-6 space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-700/50">
              <span className="text-slate-400">Gross Store Sales:</span>
              <span className="text-slate-200 font-semibold">{formatMoney(metrics.grossStoreSales)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-700/50">
              <span className="text-slate-400">Less Ghuba Fees:</span>
              <span className="text-purple-300 font-semibold">- {formatMoney(metrics.ghubaFeesEarned)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-700/50">
              <span className="text-slate-400">Less Refunds:</span>
              <span className="text-rose-300 font-semibold">- {formatMoney(metrics.totalRefunds)}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-sm bg-slate-900/80 px-3 rounded-lg text-emerald-400 mt-3 border border-emerald-500/20">
              <span>Net Store Payout:</span>
              <span>{formatMoney(metrics.netPayableToStores)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Participating Stores in Ghuba */}
      <div className="rounded-xl bg-slate-800/80 border border-slate-700 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-700/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Top Participating Stores on Ghuba</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Store-level revenue attribution preserving individual merchant earnings within marketplace orders.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-700 text-slate-300 font-medium">
            {metrics.topStores.length} Stores Active
          </span>
        </div>

        {metrics.topStores.length === 0 ? (
          <div className="p-12 text-center">
            <BuildingStorefrontIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <div className="text-sm font-medium text-slate-300">No Ghuba marketplace sales recorded yet</div>
            <div className="text-xs text-slate-500 mt-1">
              Sales made through Ghuba checkout will automatically attribute to each participating merchant here.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Store / Merchant</th>
                  <th className="py-3.5 px-4 font-semibold">Orders Completed</th>
                  <th className="py-3.5 px-4 font-semibold">Gross Attributed Sales</th>
                  <th className="py-3.5 px-4 font-semibold">Est. Ghuba Fee (5%)</th>
                  <th className="py-3.5 px-4 font-semibold">Est. Net Store Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {metrics.topStores.map((s, idx) => {
                  const estFee = Math.round(s.gross * 0.05 * 100) / 100;
                  const estNet = Math.round((s.gross - estFee) * 100) / 100;
                  return (
                    <tr key={s.companyId} className="hover:bg-slate-700/40 transition">
                      <td className="py-3 px-4 font-medium text-white flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-700 text-[10px] flex items-center justify-center font-bold text-slate-300">
                          {idx + 1}
                        </span>
                        <span>{s.storeName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-medium">{s.orders}</td>
                      <td className="py-3 px-4 font-bold text-white">{formatMoney(s.gross)}</td>
                      <td className="py-3 px-4 text-purple-300 font-medium">{formatMoney(estFee)}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{formatMoney(estNet)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
