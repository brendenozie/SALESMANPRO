"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
  BuildingStorefrontIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StorePaymentMetrics, PaymentTransactionItem } from "@/lib/payments/reportingService";

interface PaymentsClientProps {
  companyId: string;
  companyName: string;
  slug: string;
  initialMetrics: StorePaymentMetrics;
  initialTransactions: PaymentTransactionItem[];
  initialPagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export default function PaymentsClient({
  companyId,
  companyName,
  slug,
  initialMetrics,
  initialTransactions,
  initialPagination,
}: PaymentsClientProps) {
  // State
  const [metrics, setMetrics] = useState<StorePaymentMetrics>(initialMetrics);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>(initialTransactions);
  const [pagination, setPagination] = useState(initialPagination);

  const [period, setPeriod] = useState<string>("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [providerFilter, setProviderFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch updated data on filter change
  const fetchData = useCallback(
    async (pageToLoad = 1) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          companyId,
          period,
          page: String(pageToLoad),
          pageSize: "25",
        });

        if (period === "custom") {
          if (customStart) params.append("startDate", customStart);
          if (customEnd) params.append("endDate", customEnd);
        }
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        if (channelFilter !== "ALL") params.append("channel", channelFilter);
        if (providerFilter !== "ALL") params.append("provider", providerFilter);
        if (searchQuery.trim()) params.append("search", searchQuery.trim());

        const res = await fetch(`/api/admin/payments?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setMetrics(json.data.metrics);
            setTransactions(json.data.transactions);
            setPagination(json.data.pagination);
          }
        }
      } catch (err) {
        console.error("Failed to load payments:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [companyId, period, customStart, customEnd, statusFilter, channelFilter, providerFilter, searchQuery]
  );

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (newPeriod !== "custom") {
      setTimeout(() => fetchData(1), 50);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1);
  };

  // Export CSV
  const handleExport = () => {
    setIsExporting(true);
    const params = new URLSearchParams({
      companyId,
      period,
    });
    if (period === "custom") {
      if (customStart) params.append("startDate", customStart);
      if (customEnd) params.append("endDate", customEnd);
    }
    if (statusFilter !== "ALL") params.append("status", statusFilter);
    if (channelFilter !== "ALL") params.append("channel", channelFilter);
    if (providerFilter !== "ALL") params.append("provider", providerFilter);
    if (searchQuery.trim()) params.append("search", searchQuery.trim());

    window.location.href = `/api/admin/payments/export?${params.toString()}`;
    setTimeout(() => setIsExporting(false), 2000);
  };

  // View Details
  const handleViewDetails = async (paymentId: string) => {
    setIsLoadingDetails(true);
    setSelectedTransaction(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSelectedTransaction(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `KES ${Number(val || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getChannelBadge = (ch: string) => {
    const c = String(ch).toUpperCase();
    if (c.includes("GHUBA")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <BuildingStorefrontIcon className="w-3.5 h-3.5" /> Ghuba
        </span>
      );
    }
    if (c.includes("WHATSAPP")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" /> WhatsApp
        </span>
      );
    }
    if (c.includes("POS")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <BanknotesIcon className="w-3.5 h-3.5" /> POS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <CreditCardIcon className="w-3.5 h-3.5" /> Direct
      </span>
    );
  };

  const getStatusBadge = (st: string) => {
    const s = String(st).toUpperCase();
    if (s === "COMPLETED" || s === "SUCCESS") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <CheckCircleIcon className="w-3.5 h-3.5" /> Paid
        </span>
      );
    }
    if (s === "PENDING" || s === "INITIATED" || s === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <ClockIcon className="w-3.5 h-3.5" /> Pending
        </span>
      );
    }
    if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
          <ArrowUturnLeftIcon className="w-3.5 h-3.5" /> Refunded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
        <XCircleIcon className="w-3.5 h-3.5" /> Failed
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Payments & Revenue Intelligence
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Authoritative
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track store direct payments, Ghuba sales, settlements, and gateway performance for <span className="font-semibold text-slate-700 dark:text-slate-200">{companyName}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(pagination.page)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title="Refresh payment data"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
            </button>
          </div>
        </div>

        {/* DATE RANGE FILTER BAR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7days", label: "7 Days" },
              { id: "30days", label: "30 Days" },
              { id: "thisMonth", label: "This Month" },
              { id: "lastMonth", label: "Last Month" },
              { id: "custom", label: "Custom Range" },
              { id: "all", label: "All Time" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePeriodChange(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  period === p.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <button
                onClick={() => fetchData(1)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        {/* PRIMARY KPI METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Received */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Received</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <CurrencyDollarIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatCurrency(metrics.totalReceived)}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 mr-1">
                {metrics.counts.completed}
              </span>{" "}
              successful transactions
            </div>
          </div>

          {/* Net Store Revenue */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Store Received</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {formatCurrency(metrics.netReceived)}
            </div>
            <p className="mt-2 text-xs text-slate-500">Gross minus fees & legitimate refunds</p>
          </div>

          {/* Ghuba Marketplace Sales */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-sm bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Ghuba Sales
              </span>
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/60">
                <BuildingStorefrontIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-900 dark:text-purple-100">
              {formatCurrency(metrics.ghubaPayments)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-purple-700 dark:text-purple-300">
              <span>{metrics.ghuba.ordersCount} orders</span>
              <span>Net: {formatCurrency(metrics.ghuba.netStoreAmount)}</span>
            </div>
          </div>

          {/* Pending / Unsettled */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending & Refunds</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                <ClockIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
              {formatCurrency(metrics.pendingAmount)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{metrics.counts.pending} pending</span>
              <span className="text-rose-500">Refunds: {formatCurrency(metrics.refundedAmount)}</span>
            </div>
          </div>
        </div>

        {/* GHUBA DEEP DIVE SECTION */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold">Ghuba Marketplace Settlement Intelligence</h3>
                </div>
                <p className="text-xs text-purple-200">
                  Payments received via Ghuba on behalf of {companyName}. Clear separation of customer payments, Ghuba commissions, and net store payout.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20">
                Multi-Store Attributed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-xs text-purple-200 block">Orders</span>
                <span className="text-xl font-black">{metrics.ghuba.ordersCount}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-xs text-purple-200 block">Gross Sales</span>
                <span className="text-xl font-black">{formatCurrency(metrics.ghuba.grossSales)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-xs text-purple-200 block">Ghuba Fees</span>
                <span className="text-xl font-black text-amber-300">{formatCurrency(metrics.ghuba.ghubaFees)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-xs text-purple-200 block">Refunds</span>
                <span className="text-xl font-black text-rose-300">{formatCurrency(metrics.ghuba.refunds)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-xs text-purple-200 block">Net Store Amount</span>
                <span className="text-xl font-black text-emerald-300">{formatCurrency(metrics.ghuba.netStoreAmount)}</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <span className="text-xs text-purple-200 block">Pending Payout</span>
                <span className="text-xl font-black text-cyan-200">{formatCurrency(metrics.ghuba.pendingSettlement)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BREAKDOWN WIDGETS: CHANNELS & PROVIDERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Channels Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-indigo-600" />
              <span>Payment Channel Breakdown</span>
            </h3>
            <div className="space-y-3">
              {Object.entries(metrics.channels).map(([name, data]) => {
                const pct = metrics.totalReceived > 0 ? (data.gross / metrics.totalReceived) * 100 : 0;
                return (
                  <div key={name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{name} ({data.count} txns)</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(data.gross)} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Providers Breakdown */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-emerald-600" />
              <span>Payment Provider Breakdown</span>
            </h3>
            <div className="space-y-3">
              {Object.keys(metrics.providers).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No payment providers recorded yet.</p>
              ) : (
                Object.entries(metrics.providers).map(([name, data]) => {
                  const pct = metrics.totalReceived > 0 ? (data.gross / metrics.totalReceived) * 100 : 0;
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{name} ({data.count} txns)</span>
                        <span className="text-slate-900 dark:text-white">{formatCurrency(data.gross)} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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

        {/* TRANSACTIONS TABLE SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Table Search & Filters */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, order, customer name..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setTimeout(() => fetchData(1), 50);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>

              <select
                value={channelFilter}
                onChange={(e) => {
                  setChannelFilter(e.target.value);
                  setTimeout(() => fetchData(1), 50);
                }}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
              >
                <option value="ALL">All Channels</option>
                <option value="WEBSITE">Store Direct</option>
                <option value="GHUBA">Ghuba</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="POS">POS</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Transaction / Order</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4 text-right">Gross</th>
                  <th className="py-3 px-4 text-right">Fee</th>
                  <th className="py-3 px-4 text-right">Net</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <CreditCardIcon className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="font-semibold text-sm">No payment records found</p>
                        <p className="text-xs">Try adjusting your date range or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr
                      key={txn.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {new Date(txn.date).toLocaleDateString("en-KE", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {txn.transactionId}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {txn.trackingNumber}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {txn.customerName}
                      </td>

                      <td className="py-3 px-4">
                        {getChannelBadge(txn.channel)}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {txn.provider}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(txn.grossAmount)}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500">
                        {txn.feeAmount > 0 ? formatCurrency(txn.feeAmount) : "-"}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(txn.netAmount)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(txn.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewDetails(txn.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                          title="View Payment Audit Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchData(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PAYMENT DETAIL MODAL */}
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold">Payment Audit Record</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedTransaction.payment.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Status & Amount Hero */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-bold">Gross Amount</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(selectedTransaction.payment.grossAmount)}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(selectedTransaction.payment.status)}
                  </div>
                </div>

                {/* Financial Attribution */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Fees</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {formatCurrency(selectedTransaction.payment.feeAmount)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Refunds</span>
                    <span className="font-bold text-rose-600">
                      {formatCurrency(selectedTransaction.payment.refundAmount)}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    <span className="text-emerald-600 dark:text-emerald-400 block text-[11px]">Store Net</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(selectedTransaction.payment.netAmount)}
                    </span>
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500">Channel</span>
                    <span className="font-semibold">{selectedTransaction.payment.channel}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500">Provider</span>
                    <span className="font-semibold">{selectedTransaction.payment.provider}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500">Transaction Reference</span>
                    <span className="font-mono">{selectedTransaction.payment.transactionId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500">Order Tracking</span>
                    <span className="font-mono">{selectedTransaction.order?.trackingNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
                    <span className="text-slate-500">Customer</span>
                    <span>{selectedTransaction.order?.customerName || "Guest"} ({selectedTransaction.order?.email || "No email"})</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Settlement Status</span>
                    <span className="font-bold text-indigo-600">{selectedTransaction.payment.settlementStatus}</span>
                  </div>
                </div>

                {/* Items in this Order */}
                {selectedTransaction.order?.items && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h4 className="font-bold mb-2">Order Items Attributed to Store</h4>
                    <div className="space-y-1.5">
                      {selectedTransaction.order.items.map((it: any) => (
                        <div key={it.id} className="flex justify-between items-center py-1.5 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                          <span>{it.name} (x{it.quantity})</span>
                          <span className="font-semibold">{formatCurrency(it.totalPrice || it.price * it.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-right">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
