"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import {
  CurrencyDollarIcon,
  GlobeAltIcon,
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
  BanknotesIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { PlatformGlobalMetrics } from "@/lib/payments/reportingService";

interface SuperAdminPaymentsClientProps {
  initialMetrics: PlatformGlobalMetrics;
}

export default function SuperAdminPaymentsClient({
  initialMetrics,
}: SuperAdminPaymentsClientProps) {
  const [metrics, setMetrics] = useState<PlatformGlobalMetrics>(initialMetrics);
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

        const res = await fetch(`/api/super-admin/payments?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setMetrics(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load platform payment metrics:", err);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <GlobeAltIcon className="w-3.5 h-3.5" />
                SalesmanPro Platform Finance
              </span>
              <span className="text-xs text-slate-400">Global Financial Visibility Layer</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Global Platform Payment Intelligence
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Total transaction volume, Ghuba vs direct store processing, platform subscription revenue, and multi-gateway telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/ai"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 transition"
            >
              <SparklesIcon className="w-4 h-4" />
              AI Infrastructure
            </Link>
            <button
              onClick={() => fetchMetrics(period)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50"
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
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
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
                className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
              <span className="text-xs text-slate-500">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1 text-xs rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
              <button
                onClick={() => fetchMetrics("custom")}
                className="px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Ghuba Intelligence Hero Card (Answers Prompt Req #15) */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <SparklesIcon className="w-3.5 h-3.5" />
              Prominent Metric
            </span>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white">
              How much money has been received through Ghuba?
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Aggregated Gross Merchandise Value (GMV) processed on behalf of stores through the Ghuba marketplace.
            </p>
          </div>

          <div className="text-right md:min-w-[240px]">
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Ghuba Payment Volume
            </div>
            <div className="mt-1 text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatMoney(metrics.ghubaPaymentVolume)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Ghuba Retained Fees: <span className="text-purple-300 font-semibold">{formatMoney(metrics.ghubaFees)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Financial Distinction KPI Grid (Answers Prompt Req #14) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Platform Payment Volume */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Payment Volume (TPV)</span>
            <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <CurrencyDollarIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-white tracking-tight">
            {formatMoney(metrics.totalPaymentVolume)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {metrics.successfulPaymentsCount} successful transactions
          </div>
        </div>

        {/* Direct Store Gateways */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Direct Store Volume</span>
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <BuildingStorefrontIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-teal-300 tracking-tight">
            {formatMoney(metrics.directStorePaymentVolume)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Stores' own M-Pesa, Paystack, Stripe & POS
          </div>
        </div>

        {/* SalesmanPro Platform Revenue */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Platform SaaS Revenue</span>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-purple-300 tracking-tight">
            {formatMoney(metrics.platformRevenue)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Software subscriptions & platform charges
          </div>
        </div>

        {/* Merchant Net Volume */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Store Net Amounts</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ScaleIcon className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-400 tracking-tight">
            {formatMoney(metrics.storeNetAmounts)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Merchant earnings net of fees & refunds
          </div>
        </div>
      </div>

      {/* Breakdowns & Gateways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Payment Channels */}
        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-indigo-400" />
            Volume by Sales Channel
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Origin of transactions across storefronts, marketplace, WhatsApp, and POS.
          </p>

          <div className="mt-6 space-y-3">
            {Object.entries(metrics.channelBreakdown || {}).map(([chan, data]) => {
              const pct =
                metrics.totalPaymentVolume > 0
                  ? Math.round((data.volume / metrics.totalPaymentVolume) * 100)
                  : 0;
              return (
                <div key={chan} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-white tracking-wide">{chan}</span>
                    <span className="text-slate-300 font-bold">
                      {formatMoney(data.volume)}{" "}
                      <span className="text-slate-500 font-normal">({data.count} txns, {pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Providers */}
        <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <CreditCardIcon className="w-5 h-5 text-emerald-400" />
            Volume by Payment Gateway / Provider
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Performance and volume across configured payment rails (M-Pesa, Paystack, Stripe, PayPal).
          </p>

          <div className="mt-6 space-y-3">
            {Object.keys(metrics.providerBreakdown || {}).length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No provider transaction volume in this period.
              </div>
            ) : (
              Object.entries(metrics.providerBreakdown).map(([prov, data]) => {
                const pct =
                  metrics.totalPaymentVolume > 0
                    ? Math.round((data.volume / metrics.totalPaymentVolume) * 100)
                    : 0;
                return (
                  <div key={prov} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-white tracking-wide">{prov}</span>
                      <span className="text-slate-300 font-bold">
                        {formatMoney(data.volume)}{" "}
                        <span className="text-slate-500 font-normal">({data.count} txns, {pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Global Transaction Status Distribution */}
      <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
          Global Transaction Health & Status
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Distribution of completed, pending, failed, and refunded payments across the SalesmanPro network.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
            <CheckCircleIcon className="w-7 h-7 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xl font-bold text-white">{metrics.successfulPaymentsCount}</div>
              <div className="text-xs text-slate-400">Completed Payments</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
            <ClockIcon className="w-7 h-7 text-amber-400 shrink-0" />
            <div>
              <div className="text-xl font-bold text-white">{metrics.pendingPaymentsCount}</div>
              <div className="text-xs text-slate-400">Pending Authorization</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
            <XCircleIcon className="w-7 h-7 text-rose-400 shrink-0" />
            <div>
              <div className="text-xl font-bold text-white">{metrics.failedPaymentsCount}</div>
              <div className="text-xs text-slate-400">Failed / Cancelled</div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-3">
            <ArrowUturnLeftIcon className="w-7 h-7 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xl font-bold text-white">{formatMoney(metrics.totalRefunds)}</div>
              <div className="text-xs text-slate-400">Total Refunds</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
