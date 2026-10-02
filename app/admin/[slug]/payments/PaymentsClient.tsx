"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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
  ScaleIcon,
  ArrowTrendingUpIcon,
  PaperAirplaneIcon,
  InformationCircleIcon,
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
  // Navigation State
  const [activeMainTab, setActiveMainTab] = useState<"TRANSACTIONS" | "SETTLEMENTS">("TRANSACTIONS");

  // Payment Data State
  const [metrics, setMetrics] = useState<StorePaymentMetrics>(initialMetrics);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>(initialTransactions);
  const [pagination, setPagination] = useState(initialPagination);

  // Settlement & Withdrawal State
  const [settlementData, setSettlementData] = useState<{
    balance: {
      availableBalance: number;
      reservedBalance: number;
      lifetimeEarnings: number;
      lifetimeWithdrawn: number;
      pendingSettlement: number;
      currency: string;
    };
    withdrawals: any[];
    ledgerEntries: any[];
  } | null>(null);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(false);

  // Request Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [payoutMethod, setPayoutMethod] = useState<"MPESA_B2C" | "BANK_TRANSFER" | "PAYSTACK_TRANSFER">("MPESA_B2C");
  const [destinationPhone, setDestinationPhone] = useState("");
  const [destinationBank, setDestinationBank] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("");
  const [destinationName, setDestinationName] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<any | null>(null);

  // Filters State
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

  // Fetch updated transactions on filter change
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

  // Fetch Settlement & Withdrawal Balance
  const fetchSettlementData = useCallback(async () => {
    setIsLoadingSettlements(true);
    try {
      const res = await fetch(`/api/admin/withdrawals?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSettlementData(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch settlement data:", err);
    } finally {
      setIsLoadingSettlements(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchSettlementData();
  }, [fetchSettlementData]);

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

  // Submit Withdrawal Request
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum < 100) {
      setWithdrawError("Minimum withdrawal amount is KES 100.00");
      return;
    }

    const available = settlementData?.balance.availableBalance ?? metrics.ghuba.netStoreAmount;
    if (amountNum > available) {
      setWithdrawError(`Requested amount exceeds available balance (KES ${available.toLocaleString()})`);
      return;
    }

    const destinationDetails: any = {};
    if (payoutMethod === "MPESA_B2C") {
      if (!destinationPhone.trim()) {
        setWithdrawError("Please enter a valid M-Pesa phone number");
        return;
      }
      destinationDetails.phone = destinationPhone.trim();
      destinationDetails.recipientName = destinationName.trim() || undefined;
    } else if (payoutMethod === "BANK_TRANSFER") {
      if (!destinationBank.trim() || !destinationAccount.trim()) {
        setWithdrawError("Please provide both bank name and account number");
        return;
      }
      destinationDetails.bankName = destinationBank.trim();
      destinationDetails.accountNumber = destinationAccount.trim();
      destinationDetails.recipientName = destinationName.trim() || undefined;
    } else {
      destinationDetails.recipientCode = destinationAccount.trim();
      destinationDetails.recipientName = destinationName.trim() || undefined;
    }

    setIsSubmittingWithdrawal(true);
    try {
      const res = await fetch("/api/admin/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          amount: amountNum,
          payoutMethod,
          destinationDetails,
          notes: withdrawNotes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to submit withdrawal request");
      }

      setWithdrawSuccess(json.data.withdrawal);
      setWithdrawAmount("");
      setWithdrawNotes("");
      fetchSettlementData();
    } catch (err: any) {
      setWithdrawError(err.message || "Error submitting withdrawal");
    } finally {
      setIsSubmittingWithdrawal(false);
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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <BuildingStorefrontIcon className="w-3.5 h-3.5" /> Ghuba
        </span>
      );
    }
    if (c.includes("WHATSAPP")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" /> WhatsApp
        </span>
      );
    }
    if (c.includes("POS")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <BanknotesIcon className="w-3.5 h-3.5" /> POS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        Direct Store
      </span>
    );
  };

  const getProviderIcon = (prov: string) => {
    const p = String(prov).toUpperCase();
    if (p.includes("MPESA")) return <DevicePhoneMobileIcon className="w-4 h-4 text-emerald-600" />;
    if (p.includes("PAYSTACK") || p.includes("STRIPE") || p.includes("PAYPAL") || p.includes("CARD")) {
      return <CreditCardIcon className="w-4 h-4 text-blue-600" />;
    }
    if (p.includes("CASH") || p.includes("COD") || p.includes("PICKUP")) {
      return <BanknotesIcon className="w-4 h-4 text-amber-600" />;
    }
    return <BuildingStorefrontIcon className="w-4 h-4 text-purple-600" />;
  };

  const getStatusBadge = (st: string) => {
    const s = String(st).toUpperCase();
    if (s === "COMPLETED" || s === "PAID") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircleIcon className="w-3.5 h-3.5" /> Paid
        </span>
      );
    }
    if (s === "PENDING" || s === "INITIATED" || s === "REQUESTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <ClockIcon className="w-3.5 h-3.5" /> Pending
        </span>
      );
    }
    if (s === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <CheckCircleIcon className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    if (s === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Processing
        </span>
      );
    }
    if (s === "REFUNDED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <ArrowUturnLeftIcon className="w-3.5 h-3.5" /> Refunded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <XCircleIcon className="w-3.5 h-3.5" /> {s}
      </span>
    );
  };

  const availableBalance = settlementData?.balance?.availableBalance ?? metrics.ghuba.netStoreAmount;
  const reservedBalance = settlementData?.balance?.reservedBalance ?? 0;

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
              Track store direct payments, Ghuba sales, settlements, and gateway performance for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{companyName}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                fetchData(pagination.page);
                fetchSettlementData();
              }}
              disabled={isLoading || isLoadingSettlements}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title="Refresh payment data"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
            </button>

            <button
              onClick={() => {
                setIsWithdrawModalOpen(true);
                setWithdrawError(null);
                setWithdrawSuccess(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition transform active:scale-95"
            >
              <BanknotesIcon className="w-4 h-4" />
              <span>Request Withdrawal</span>
            </button>
          </div>
        </div>

        {/* PRIMARY TAB SWITCHER */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveMainTab("TRANSACTIONS")}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeMainTab === "TRANSACTIONS"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            <span>Transactions & Revenue</span>
          </button>

          <button
            onClick={() => setActiveMainTab("SETTLEMENTS")}
            className={`py-3 px-6 text-sm font-bold border-b-2 transition flex items-center gap-2 relative ${
              activeMainTab === "SETTLEMENTS"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <BanknotesIcon className="w-4 h-4" />
            <span>Settlement & Withdrawals</span>
            {availableBalance > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* TAB 1: TRANSACTIONS & REVENUE */}
        {activeMainTab === "TRANSACTIONS" && (
          <div className="space-y-6">
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      period === p.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {period === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs text-slate-400">to</span>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={() => fetchData(1)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* METRICS OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received</span>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                    <CurrencyDollarIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(metrics.totalReceived)}
                </div>
                <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                  <span>{metrics.counts.completed} transactions</span>
                  <span className="font-semibold text-emerald-600">Net: {formatCurrency(metrics.netReceived)}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Direct</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <CreditCardIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  {formatCurrency(metrics.directPayments)}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Storefront, WhatsApp & POS Direct
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ghuba Marketplace</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                    <BuildingStorefrontIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                  {formatCurrency(metrics.ghubaPayments)}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Platform-collected marketplace sales
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Volume</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
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
                  <button
                    onClick={() => {
                      setIsWithdrawModalOpen(true);
                      setWithdrawError(null);
                      setWithdrawSuccess(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg transition"
                  >
                    Withdraw Funds (KES {availableBalance.toLocaleString()})
                  </button>
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
                    <span className="text-xs text-purple-200 block">Withdrawable</span>
                    <span className="text-xl font-black text-cyan-200">{formatCurrency(availableBalance)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSACTIONS TABLE SECTION */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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
                      <th className="py-3.5 px-4">Transaction / Date</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Channel & Method</th>
                      <th className="py-3.5 px-4 text-right">Gross</th>
                      <th className="py-3.5 px-4 text-right">Fee</th>
                      <th className="py-3.5 px-4 text-right">Net</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          No transactions found for the selected period.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-semibold text-slate-900 dark:text-white block">
                              {tx.transactionId}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(tx.date).toLocaleDateString("en-KE", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800 dark:text-slate-200 block">
                              {tx.customerName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              Ref: {tx.trackingNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {getChannelBadge(tx.channel)}
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                {getProviderIcon(tx.provider)} {tx.provider}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold">
                            {formatCurrency(tx.grossAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-500">
                            {tx.feeAmount > 0 ? `-${formatCurrency(tx.feeAmount)}` : "KES 0.00"}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(tx.netAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getStatusBadge(tx.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleViewDetails(tx.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                              title="Audit drilldown"
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
                    Showing Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
                  </span>
                  <div className="flex items-center gap-1">
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
          </div>
        )}

        {/* TAB 2: SETTLEMENT & WITHDRAWALS */}
        {activeMainTab === "SETTLEMENTS" && (
          <div className="space-y-6">
            {/* Balance Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-emerald-500/30 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Available for Withdrawal</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <BanknotesIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(availableBalance)}
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setIsWithdrawModalOpen(true);
                      setWithdrawError(null);
                      setWithdrawSuccess(null);
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition"
                  >
                    Request Payout Now
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">In-Flight / Reserved</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  {formatCurrency(reservedBalance)}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Pending review or payout execution by Super Admin
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lifetime Withdrawn</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {formatCurrency(settlementData?.balance?.lifetimeWithdrawn ?? 0)}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Total successfully disbursed to store accounts
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Net Sales</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                    <ArrowTrendingUpIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                  {formatCurrency(settlementData?.balance?.lifetimeEarnings ?? metrics.ghuba.netStoreAmount)}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Cumulative net entitlement after marketplace fees
                </p>
              </div>
            </div>

            {/* WITHDRAWAL HISTORY TABLE */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Withdrawal & Settlement Requests</h3>
                  <p className="text-xs text-slate-500">Track submitted withdrawal lifecycles from request to bank/M-Pesa deposit.</p>
                </div>
                <button
                  onClick={fetchSettlementData}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 transition"
                  title="Reload history"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isLoadingSettlements ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4">Request Ref / Date</th>
                      <th className="py-3.5 px-4">Method & Destination</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4 text-right">Net Payout</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4">Provider Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {!settlementData?.withdrawals || settlementData.withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          No withdrawal requests submitted yet. You can request payout of your eligible balance anytime.
                        </td>
                      </tr>
                    ) : (
                      settlementData.withdrawals.map((w: any) => (
                        <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block">
                              {w.reference}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(w.createdAt).toLocaleDateString("en-KE", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800 dark:text-slate-200 block">
                              {w.payoutMethod}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {w.destinationDetails?.phone
                                ? `Phone: ${w.destinationDetails.phone}`
                                : w.destinationDetails?.accountNumber
                                ? `${w.destinationDetails.bankName || "Bank"}: ••••${w.destinationDetails.accountNumber.slice(-4)}`
                                : "Registered Account"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-semibold">
                            {formatCurrency(w.amount)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(w.netPayout)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getStatusBadge(w.status)}
                            {w.rejectionReason && (
                              <span className="block text-[10px] text-rose-500 mt-1 max-w-[150px] truncate" title={w.rejectionReason}>
                                Reason: {w.rejectionReason}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {w.providerReference ? (
                              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px]">
                                {w.providerReference}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Awaiting Execution</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IMMUTABLE LEDGER ENTRIES */}
            {settlementData?.ledgerEntries && settlementData.ledgerEntries.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-indigo-600" />
                    <span>Store Transaction Ledger (Audit Trail)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Immutable ledger mutations tracking balance additions, reservations, and releases.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Entry Type</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {settlementData.ledgerEntries.map((l: any) => (
                        <tr key={l.id} className="hover:bg-slate-50/40">
                          <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                            {new Date(l.createdAt).toLocaleString("en-KE")}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {l.entryType}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                            {l.reference}
                          </td>
                          <td className={`py-2.5 px-4 text-right font-bold ${l.amount < 0 ? "text-rose-500" : "text-emerald-600"}`}>
                            {l.amount > 0 ? `+${formatCurrency(l.amount)}` : formatCurrency(l.amount)}
                          </td>
                          <td className="py-2.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(l.balanceAfter)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* REQUEST WITHDRAWAL MODAL */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <BanknotesIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Request Settlement Withdrawal</h3>
                    <p className="text-xs text-slate-500">Withdraw available Ghuba earnings directly to your account</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {withdrawSuccess ? (
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircleIcon className="w-7 h-7" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white">Withdrawal Submitted!</h4>
                  <p className="text-xs text-slate-500">
                    Your request for <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(withdrawSuccess.amount)}</span> has been queued.
                    Funds have been reserved and sent to Super Admin for approval.
                  </p>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono text-xs text-slate-700 dark:text-slate-300">
                    Reference: <span className="font-bold text-indigo-600">{withdrawSuccess.reference}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsWithdrawModalOpen(false);
                      setWithdrawSuccess(null);
                      setActiveMainTab("SETTLEMENTS");
                    }}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow hover:bg-indigo-700 transition"
                  >
                    View in Settlement History
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdrawalSubmit} className="p-6 space-y-4 text-xs">
                  {/* Balance Display */}
                  <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">Available Balance</span>
                      <span className="text-lg font-black text-emerald-900 dark:text-emerald-300">
                        {formatCurrency(availableBalance)}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded font-bold">
                      Ready
                    </span>
                  </div>

                  {withdrawError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {withdrawError}
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Withdrawal Amount (KES)</label>
                    <input
                      type="number"
                      step="any"
                      min="100"
                      max={availableBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      required
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {/* Quick percentage buttons */}
                    <div className="flex gap-2 pt-1">
                      {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setWithdrawAmount((availableBalance * pct).toFixed(2))}
                          className="flex-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          {pct === 1.0 ? "MAX" : `${pct * 100}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payout Method */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Payout Method</label>
                    <select
                      value={payoutMethod}
                      onChange={(e: any) => setPayoutMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                    >
                      <option value="MPESA_B2C">M-Pesa B2C (Mobile Money Payout)</option>
                      <option value="BANK_TRANSFER">Bank Wire Transfer (EFT)</option>
                      <option value="PAYSTACK_TRANSFER">Paystack Recipient Account</option>
                    </select>
                  </div>

                  {/* Dynamic Destination Inputs */}
                  {payoutMethod === "MPESA_B2C" ? (
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 dark:text-slate-300">Recipient M-Pesa Phone Number</label>
                      <input
                        type="text"
                        placeholder="2547XXXXXXXX"
                        value={destinationPhone}
                        onChange={(e) => setDestinationPhone(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Bank Name</label>
                        <input
                          type="text"
                          placeholder="e.g. KCB, Equity"
                          value={destinationBank}
                          onChange={(e) => setDestinationBank(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 dark:text-slate-300">Account Number</label>
                        <input
                          type="text"
                          placeholder="Account No."
                          value={destinationAccount}
                          onChange={(e) => setDestinationAccount(e.target.value)}
                          required
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Recipient Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="Account Holder Name"
                      value={destinationName}
                      onChange={(e) => setDestinationName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Notes / Reason (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Weekly settlement withdrawal"
                      value={withdrawNotes}
                      onChange={(e) => setWithdrawNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingWithdrawal || availableBalance <= 0}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition disabled:opacity-50"
                    >
                      {isSubmittingWithdrawal ? "Reserving Funds..." : "Submit Withdrawal"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

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
