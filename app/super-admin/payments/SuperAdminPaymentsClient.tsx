"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  InformationCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { PlatformGlobalMetrics } from "@/lib/payments/reportingService";

interface SuperAdminPaymentsClientProps {
  initialMetrics: PlatformGlobalMetrics;
}

export default function SuperAdminPaymentsClient({
  initialMetrics,
}: SuperAdminPaymentsClientProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "WITHDRAWALS" | "TRANSACTIONS" | "OPERATIONS">("OVERVIEW");

  // Overview / Metrics State
  const [metrics, setMetrics] = useState<PlatformGlobalMetrics>(initialMetrics);
  const [period, setPeriod] = useState<string>("30days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // -------------------------------------------------------------
  // WITHDRAWAL APPROVAL QUEUE STATE
  // -------------------------------------------------------------
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalAggregates, setWithdrawalAggregates] = useState<{
    totalPendingCount: number;
    totalPendingAmount: number;
    totalApprovedCount: number;
    totalApprovedAmount: number;
    totalPaidCount: number;
    totalPaidAmount: number;
    totalRejectedCount: number;
  }>({
    totalPendingCount: 0,
    totalPendingAmount: 0,
    totalApprovedCount: 0,
    totalApprovedAmount: 0,
    totalPaidCount: 0,
    totalPaidAmount: 0,
    totalRejectedCount: 0,
  });
  const [withdrawalPagination, setWithdrawalPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  });
  const [withdrawalStatus, setWithdrawalStatus] = useState<string>("ALL");
  const [withdrawalSearch, setWithdrawalSearch] = useState<string>("");
  const [isLoadingWithdrawals, setIsLoadingWithdrawals] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Withdrawal Modals State
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    withdrawal: any | null;
    reason: string;
    isSubmitting: boolean;
    error: string | null;
  }>({
    open: false,
    withdrawal: null,
    reason: "",
    isSubmitting: false,
    error: null,
  });

  const [executeModal, setExecuteModal] = useState<{
    open: boolean;
    withdrawal: any | null;
    providerReference: string;
    notes: string;
    isSubmitting: boolean;
    error: string | null;
  }>({
    open: false,
    withdrawal: null,
    providerReference: "",
    notes: "",
    isSubmitting: false,
    error: null,
  });

  const [withdrawalDetailsModal, setWithdrawalDetailsModal] = useState<{
    open: boolean;
    withdrawal: any | null;
  }>({
    open: false,
    withdrawal: null,
  });

  // -------------------------------------------------------------
  // PAYMENT OPERATIONS & TILL VERIFICATION STATE
  // -------------------------------------------------------------
  const [operationsData, setOperationsData] = useState<any | null>(null);
  const [isLoadingOperations, setIsLoadingOperations] = useState<boolean>(false);
  const [tillActionModal, setTillActionModal] = useState<{
    open: boolean;
    type: "ORDER" | "SUBSCRIPTION";
    action: "ADMIN_CONFIRM" | "SUPER_VERIFY" | "REJECT";
    item: any | null;
    statementRef: string;
    notes: string;
    isSubmitting: boolean;
    error: string | null;
  }>({
    open: false,
    type: "ORDER",
    action: "SUPER_VERIFY",
    item: null,
    statementRef: "",
    notes: "",
    isSubmitting: false,
    error: null,
  });

  // -------------------------------------------------------------
  // GLOBAL TRANSACTION EXPLORER STATE
  // -------------------------------------------------------------
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txCompanies, setTxCompanies] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [txPagination, setTxPagination] = useState({
    page: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 1,
  });
  const [txCompanyId, setTxCompanyId] = useState<string>("ALL");
  const [txChannel, setTxChannel] = useState<string>("ALL");
  const [txProvider, setTxProvider] = useState<string>("ALL");
  const [txStatus, setTxStatus] = useState<string>("ALL");
  const [txSearch, setTxSearch] = useState<string>("");
  const [txPeriod, setTxPeriod] = useState<string>("30days");
  const [txCustomStart, setTxCustomStart] = useState<string>("");
  const [txCustomEnd, setTxCustomEnd] = useState<string>("");
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(false);
  const [isExportingTx, setIsExportingTx] = useState<boolean>(false);

  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // -------------------------------------------------------------
  // DATA FETCHING HANDLERS
  // -------------------------------------------------------------
  const fetchMetrics = useCallback(
    async (selectedPeriod = period) => {
      setIsLoadingMetrics(true);
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
        setIsLoadingMetrics(false);
      }
    },
    [period, customStart, customEnd]
  );

  const fetchWithdrawals = useCallback(
    async (page = 1) => {
      setIsLoadingWithdrawals(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "20",
          status: withdrawalStatus,
        });
        if (withdrawalSearch.trim()) {
          params.append("search", withdrawalSearch.trim());
        }

        const res = await fetch(`/api/super-admin/withdrawals?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setWithdrawals(json.data.withdrawals || []);
            if (json.data.aggregates) {
              setWithdrawalAggregates(json.data.aggregates);
            }
            if (json.data.pagination) {
              setWithdrawalPagination(json.data.pagination);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load super admin withdrawals:", err);
      } finally {
        setIsLoadingWithdrawals(false);
      }
    },
    [withdrawalStatus, withdrawalSearch]
  );

  const fetchTransactions = useCallback(
    async (page = 1) => {
      setIsLoadingTx(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "25",
          companyId: txCompanyId,
          channel: txChannel,
          provider: txProvider,
          status: txStatus,
          period: txPeriod,
        });
        if (txSearch.trim()) {
          params.append("search", txSearch.trim());
        }
        if (txPeriod === "custom") {
          if (txCustomStart) params.append("startDate", txCustomStart);
          if (txCustomEnd) params.append("endDate", txCustomEnd);
        }

        const res = await fetch(`/api/super-admin/transactions?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setTransactions(json.data.transactions || []);
            if (json.data.companies) {
              setTxCompanies(json.data.companies);
            }
            if (json.data.pagination) {
              setTxPagination(json.data.pagination);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load super admin transactions:", err);
      } finally {
        setIsLoadingTx(false);
      }
    },
    [txCompanyId, txChannel, txProvider, txStatus, txSearch, txPeriod, txCustomStart, txCustomEnd]
  );

  const fetchOperations = useCallback(async () => {
    setIsLoadingOperations(true);
    try {
      const res = await fetch("/api/super-admin/payments/operations");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setOperationsData(json);
        }
      }
    } catch (err) {
      console.error("Failed to load operations telemetry:", err);
    } finally {
      setIsLoadingOperations(false);
    }
  }, []);

  const submitTillAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tillActionModal.item) return;

    setTillActionModal((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      let endpoint = "";
      let payload: any = {};

      const isSub = tillActionModal.type === "SUBSCRIPTION";
      const idKey = isSub ? "subscriptionId" : "orderId";

      if (tillActionModal.action === "ADMIN_CONFIRM") {
        endpoint = "/api/payments/till/admin-confirm";
        payload = {
          [idKey]: tillActionModal.item.id,
          notes: tillActionModal.notes || "Admin review confirmed",
        };
      } else if (tillActionModal.action === "SUPER_VERIFY") {
        endpoint = "/api/payments/till/super-verify";
        payload = {
          [idKey]: tillActionModal.item.id,
          verifiedStatementReference: tillActionModal.statementRef,
          notes: tillActionModal.notes || "Authoritative statement match verified by Super-Admin",
        };
      } else if (tillActionModal.action === "REJECT") {
        endpoint = "/api/payments/till/reject";
        payload = {
          [idKey]: tillActionModal.item.id,
          rejectionReason: tillActionModal.notes || "Payment verification failed",
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Failed to process Till payment action");
      }

      setTillActionModal({
        open: false,
        type: "ORDER",
        action: "SUPER_VERIFY",
        item: null,
        statementRef: "",
        notes: "",
        isSubmitting: false,
        error: null,
      });

      // Refresh operations data
      await fetchOperations();
    } catch (err: any) {
      setTillActionModal((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err.message || "Action failed",
      }));
    }
  };

  // Lazy load data when switching tabs
  useEffect(() => {
    if (activeTab === "WITHDRAWALS" && withdrawals.length === 0) {
      fetchWithdrawals(1);
    } else if (activeTab === "TRANSACTIONS" && transactions.length === 0) {
      fetchTransactions(1);
    } else if (activeTab === "OPERATIONS" && !operationsData) {
      fetchOperations();
    }
  }, [activeTab, withdrawals.length, transactions.length, operationsData, fetchWithdrawals, fetchTransactions, fetchOperations]);

  // -------------------------------------------------------------
  // WITHDRAWAL ACTIONS (APPROVE / REJECT / EXECUTE)
  // -------------------------------------------------------------
  const handleApproveWithdrawal = async (withdrawalId: string) => {
    if (!confirm("Are you sure you want to APPROVE this withdrawal request? This confirms compliance and moves it to ready-for-payout state.")) {
      return;
    }
    setActionLoadingId(withdrawalId);
    try {
      const res = await fetch(`/api/super-admin/withdrawals/${withdrawalId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Approved by Super Admin via Payments Hub" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to approve withdrawal");
      }
      // Refresh list
      fetchWithdrawals(withdrawalPagination.page);
    } catch (err: any) {
      alert(`Approval error: ${err.message || "Failed to approve"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const submitRejectWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.withdrawal) return;
    if (!rejectModal.reason.trim()) {
      setRejectModal((prev) => ({ ...prev, error: "Rejection reason is required." }));
      return;
    }

    setRejectModal((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const res = await fetch(`/api/super-admin/withdrawals/${rejectModal.withdrawal.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectModal.reason.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to reject withdrawal");
      }

      setRejectModal({
        open: false,
        withdrawal: null,
        reason: "",
        isSubmitting: false,
        error: null,
      });
      fetchWithdrawals(withdrawalPagination.page);
    } catch (err: any) {
      setRejectModal((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err.message || "Failed to reject withdrawal",
      }));
    }
  };

  const submitExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!executeModal.withdrawal) return;
    if (!executeModal.providerReference.trim()) {
      setExecuteModal((prev) => ({
        ...prev,
        error: "Provider Reference / Transaction Receipt ID is strictly required to verify disbursement.",
      }));
      return;
    }

    setExecuteModal((prev) => ({ ...prev, isSubmitting: true, error: null }));
    try {
      const res = await fetch(`/api/super-admin/withdrawals/${executeModal.withdrawal.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerReference: executeModal.providerReference.trim(),
          metadata: {
            notes: executeModal.notes.trim() || undefined,
            executedByRole: "SUPER_ADMIN",
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to disburse funds");
      }

      setExecuteModal({
        open: false,
        withdrawal: null,
        providerReference: "",
        notes: "",
        isSubmitting: false,
        error: null,
      });
      fetchWithdrawals(withdrawalPagination.page);
    } catch (err: any) {
      setExecuteModal((prev) => ({
        ...prev,
        isSubmitting: false,
        error: err.message || "Failed to disburse funds",
      }));
    }
  };

  // CSV Export for Global Transactions
  const handleExportTransactions = () => {
    if (!transactions || transactions.length === 0) {
      alert("No transactions available to export.");
      return;
    }
    setIsExportingTx(true);
    try {
      const headers = [
        "Transaction ID",
        "Order #",
        "Company",
        "Sales Channel",
        "Provider",
        "Amount",
        "Platform Fee",
        "Net Store Amount",
        "Status",
        "Customer",
        "Created At",
      ];

      const csvRows = transactions.map((t) => [
        `"${t.reference || t.id}"`,
        `"${t.orderNumber || ""}"`,
        `"${t.companyName || ""}"`,
        `"${t.channel || ""}"`,
        `"${t.provider || ""}"`,
        t.amount || 0,
        t.fee || 0,
        t.netStoreAmount || 0,
        `"${t.status || ""}"`,
        `"${t.customerPhone || t.customerEmail || ""}"`,
        `"${t.createdAt ? new Date(t.createdAt).toISOString() : ""}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `salesmanpro_global_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExportingTx(false);
    }
  };

  const formatMoney = (amount: number = 0) => {
    return `KES ${Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusBadge = (st: string) => {
    const s = String(st).toUpperCase();
    if (s === "PAID" || s === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircleIcon className="w-3.5 h-3.5" /> Paid
        </span>
      );
    }
    if (s === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <CheckIcon className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    if (s === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> Processing
        </span>
      );
    }
    if (s === "PENDING" || s === "REQUESTED" || s === "UNDER_REVIEW") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ClockIcon className="w-3.5 h-3.5" /> Pending Review
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircleIcon className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    }
    if (s === "REFUNDED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <ArrowUturnLeftIcon className="w-3.5 h-3.5" /> Refunded
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircleIcon className="w-3.5 h-3.5" /> {s}
      </span>
    );
  };

  const getChannelBadge = (ch: string) => {
    const c = String(ch).toUpperCase();
    if (c.includes("GHUBA")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
          <BuildingStorefrontIcon className="w-3.5 h-3.5" /> Ghuba
        </span>
      );
    }
    if (c.includes("WHATSAPP")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" /> WhatsApp
        </span>
      );
    }
    if (c.includes("POS")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <BanknotesIcon className="w-3.5 h-3.5" /> POS Retail
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        Storefront Online
      </span>
    );
  };

  const getProviderIcon = (prov: string) => {
    const p = String(prov).toUpperCase();
    if (p.includes("MPESA")) return <DevicePhoneMobileIcon className="w-4 h-4 text-emerald-400" />;
    if (p.includes("PAYSTACK") || p.includes("STRIPE") || p.includes("PAYPAL") || p.includes("CARD")) {
      return <CreditCardIcon className="w-4 h-4 text-blue-400" />;
    }
    if (p.includes("CASH") || p.includes("COD") || p.includes("PICKUP")) {
      return <BanknotesIcon className="w-4 h-4 text-amber-400" />;
    }
    return <BuildingStorefrontIcon className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <GlobeAltIcon className="w-3.5 h-3.5" />
                SalesmanPro Platform Finance
              </span>
              <span className="text-xs text-slate-400">Global Financial Visibility & Settlement Layer</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-white">
              Global Platform Payment Intelligence
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Total transaction volume, Ghuba vs direct store processing, merchant withdrawal approval queue, and global transaction explorer.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/super-admin/ai"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800 transition"
            >
              <SparklesIcon className="w-4 h-4" />
              AI Infrastructure
            </Link>
            <button
              onClick={() => {
                if (activeTab === "OVERVIEW") fetchMetrics(period);
                else if (activeTab === "WITHDRAWALS") fetchWithdrawals(withdrawalPagination.page);
                else if (activeTab === "TRANSACTIONS") fetchTransactions(txPagination.page);
                else if (activeTab === "OPERATIONS") fetchOperations();
              }}
              disabled={isLoadingMetrics || isLoadingWithdrawals || isLoadingTx || isLoadingOperations}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${
                  isLoadingMetrics || isLoadingWithdrawals || isLoadingTx || isLoadingOperations ? "animate-spin" : ""
                }`}
              />
              Refresh Data
            </button>
          </div>
        </div>

        {/* PRIMARY TAB NAVIGATION */}
        <div className="mt-6 flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={`py-3 px-5 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "OVERVIEW"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowTrendingUpIcon className="w-4 h-4" />
            <span>Platform Overview & Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab("WITHDRAWALS")}
            className={`py-3 px-5 text-sm font-bold border-b-2 transition flex items-center gap-2 relative ${
              activeTab === "WITHDRAWALS"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BanknotesIcon className="w-4 h-4" />
            <span>Withdrawal Approval Queue</span>
            {withdrawalAggregates.totalPendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {withdrawalAggregates.totalPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("TRANSACTIONS")}
            className={`py-3 px-5 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === "TRANSACTIONS"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span>Global Transaction Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab("OPERATIONS")}
            className={`py-3 px-5 text-sm font-bold border-b-2 transition flex items-center gap-2 relative ${
              activeTab === "OPERATIONS"
                ? "border-amber-500 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Payment Operations & Till Verification</span>
            {operationsData?.tillQueue && (operationsData.tillQueue.totalPendingOrders > 0 || operationsData.tillQueue.totalPendingSubscriptions > 0) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {operationsData.tillQueue.totalPendingOrders + operationsData.tillQueue.totalPendingSubscriptions}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & TELEMETRY                               */}
      {/* ========================================================= */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Date Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
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
                onClick={() => {
                  setPeriod(p.id);
                  if (p.id !== "custom") fetchMetrics(p.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
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
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-500">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => fetchMetrics("custom")}
                  className="px-3 py-1 text-xs rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Prominent Ghuba Intelligence Hero Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border border-emerald-500/30 shadow-lg relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Marketplace Settlement Metric
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white">
                  How much money has been received through Ghuba?
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Aggregated Gross Merchandise Value (GMV) processed on behalf of stores through the Ghuba marketplace.
                </p>
              </div>

              <div className="text-left md:text-right md:min-w-[240px]">
                <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                  Ghuba Payment Volume
                </div>
                <div className="mt-1 text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatMoney(metrics.ghubaPaymentVolume)}
                </div>
                <div className="mt-1 text-xs text-slate-400">
                  Ghuba Retained Platform Fees:{" "}
                  <span className="text-purple-300 font-semibold">{formatMoney(metrics.ghubaFees)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Global Financial Distinction KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Payment Volume (TPV)</span>
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
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

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Direct Store Volume</span>
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
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

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Platform SaaS Revenue</span>
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
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

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Store Net Amounts</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Channels */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <ShoppingBagIcon className="w-5 h-5 text-indigo-400" />
                Volume by Sales Channel
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Origin of transactions across storefronts, marketplace, WhatsApp, and POS.
              </p>

              <div className="mt-6 space-y-3">
                {Object.entries(metrics.channelBreakdown || {}).map(([chan, entry]) => {
                  const data = entry as { volume: number; count: number };
                  const pct =
                    metrics.totalPaymentVolume > 0
                      ? Math.round((data.volume / metrics.totalPaymentVolume) * 100)
                      : 0;
                  return (
                    <div key={chan} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
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
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
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
                  Object.entries(metrics.providerBreakdown).map(([prov, entry]) => {
                    const data = entry as { volume: number; count: number };
                    const pct =
                      metrics.totalPaymentVolume > 0
                        ? Math.round((data.volume / metrics.totalPaymentVolume) * 100)
                        : 0;
                    return (
                      <div key={prov} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
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
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
              Global Transaction Health & Status
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Distribution of completed, pending, failed, and refunded payments across the SalesmanPro network.
            </p>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <CheckCircleIcon className="w-7 h-7 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xl font-bold text-white">{metrics.successfulPaymentsCount}</div>
                  <div className="text-xs text-slate-400">Completed Payments</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <ClockIcon className="w-7 h-7 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xl font-bold text-white">{metrics.pendingPaymentsCount}</div>
                  <div className="text-xs text-slate-400">Pending Authorization</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <XCircleIcon className="w-7 h-7 text-rose-400 shrink-0" />
                <div>
                  <div className="text-xl font-bold text-white">{metrics.failedPaymentsCount}</div>
                  <div className="text-xs text-slate-400">Failed / Cancelled</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <ArrowUturnLeftIcon className="w-7 h-7 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-xl font-bold text-white">{formatMoney(metrics.totalRefunds)}</div>
                  <div className="text-xs text-slate-400">Total Refunds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: WITHDRAWAL APPROVAL QUEUE                          */}
      {/* ========================================================= */}
      {activeTab === "WITHDRAWALS" && (
        <div className="space-y-6">
          {/* Withdrawal Aggregates KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">Pending Review & Action</span>
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <ClockIcon className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-amber-300">
                {formatMoney(withdrawalAggregates.totalPendingAmount)}
              </div>
              <div className="mt-1 text-xs text-amber-400/80">
                {withdrawalAggregates.totalPendingCount} request(s) awaiting approval
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-400">Approved & Ready for Payout</span>
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <CheckIcon className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-blue-300">
                {formatMoney(withdrawalAggregates.totalApprovedAmount)}
              </div>
              <div className="mt-1 text-xs text-blue-400/80">
                {withdrawalAggregates.totalApprovedCount} request(s) cleared for disbursement
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">Lifetime Disbursed (Paid)</span>
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <BanknotesIcon className="w-5 h-5" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-300">
                {formatMoney(withdrawalAggregates.totalPaidAmount)}
              </div>
              <div className="mt-1 text-xs text-emerald-400/80">
                {withdrawalAggregates.totalPaidCount} successful disbursements
              </div>
            </div>
          </div>

          {/* Queue Filter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                <FunnelIcon className="w-3.5 h-3.5" /> Status:
              </span>
              {[
                { id: "ALL", label: "All Requests" },
                { id: "REQUESTED", label: "Pending Review" },
                { id: "APPROVED", label: "Approved (Ready)" },
                { id: "PROCESSING", label: "Processing" },
                { id: "PAID", label: "Paid" },
                { id: "REJECTED", label: "Rejected" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setWithdrawalStatus(st.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    withdrawalStatus === st.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search store, ref, phone..."
                  value={withdrawalSearch}
                  onChange={(e) => setWithdrawalSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchWithdrawals(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => fetchWithdrawals(1)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Search
              </button>
            </div>
          </div>

          {/* Withdrawals Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Request Ref</th>
                    <th className="py-3.5 px-4">Merchant / Store</th>
                    <th className="py-3.5 px-4">Payout Method & Details</th>
                    <th className="py-3.5 px-4 text-right">Requested Amount</th>
                    <th className="py-3.5 px-4 text-right">Net Payout</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Super Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoadingWithdrawals ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                        Loading withdrawal approval queue...
                      </td>
                    </tr>
                  ) : withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No withdrawal requests found matching the active filter.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-white block">
                            {w.reference}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {new Date(w.createdAt).toLocaleDateString("en-KE", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-white block">
                            {w.company?.name || "Unknown Store"}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Req by: {w.requestedBy?.name || w.requestedBy?.email || "Store Admin"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-200 block">
                            {w.payoutMethod}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {w.destinationDetails?.phone
                              ? `M-Pesa: ${w.destinationDetails.phone}`
                              : w.destinationDetails?.accountNumber
                              ? `${w.destinationDetails.bankName || "Bank"}: ••••${w.destinationDetails.accountNumber.slice(-4)}`
                              : "Registered Rails"}
                          </span>
                          {w.destinationDetails?.recipientName && (
                            <span className="text-[10px] text-slate-500 block">
                              Name: {w.destinationDetails.recipientName}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-medium text-slate-300">
                          {formatMoney(w.amount)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                          {formatMoney(w.netPayout)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(w.status)}
                          {w.providerReference && (
                            <span className="block text-[10px] font-mono text-emerald-400 mt-1">
                              Ref: {w.providerReference}
                            </span>
                          )}
                          {w.rejectionReason && (
                            <span className="block text-[10px] text-rose-400 mt-1 max-w-[140px] truncate mx-auto" title={w.rejectionReason}>
                              {w.rejectionReason}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          {/* Details Button */}
                          <button
                            onClick={() => setWithdrawalDetailsModal({ open: true, withdrawal: w })}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Inspect Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>

                          {/* Pending Review Actions */}
                          {(w.status === "REQUESTED" || w.status === "UNDER_REVIEW") && (
                            <>
                              <button
                                onClick={() => handleApproveWithdrawal(w.id)}
                                disabled={actionLoadingId === w.id}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
                              >
                                {actionLoadingId === w.id ? "Approving..." : "Approve"}
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModal({
                                    open: true,
                                    withdrawal: w,
                                    reason: "",
                                    isSubmitting: false,
                                    error: null,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 transition"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Approved Actions -> Disburse / Execute */}
                          {w.status === "APPROVED" && (
                            <>
                              <button
                                onClick={() =>
                                  setExecuteModal({
                                    open: true,
                                    withdrawal: w,
                                    providerReference: "",
                                    notes: "",
                                    isSubmitting: false,
                                    error: null,
                                  })
                                }
                                className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                              >
                                Disburse Payout
                              </button>
                              <button
                                onClick={() =>
                                  setRejectModal({
                                    open: true,
                                    withdrawal: w,
                                    reason: "",
                                    isSubmitting: false,
                                    error: null,
                                  })
                                }
                                className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {withdrawalPagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing page {withdrawalPagination.page} of {withdrawalPagination.totalPages} ({withdrawalPagination.totalCount} total requests)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchWithdrawals(withdrawalPagination.page - 1)}
                    disabled={withdrawalPagination.page <= 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchWithdrawals(withdrawalPagination.page + 1)}
                    disabled={withdrawalPagination.page >= withdrawalPagination.totalPages}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GLOBAL TRANSACTION EXPLORER                        */}
      {/* ========================================================= */}
      {activeTab === "TRANSACTIONS" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Store Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Merchant Store
                </label>
                <select
                  value={txCompanyId}
                  onChange={(e) => setTxCompanyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Stores</option>
                  {txCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales Channel Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Sales Channel
                </label>
                <select
                  value={txChannel}
                  onChange={(e) => setTxChannel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Channels</option>
                  <option value="GHUBA_MARKETPLACE">Ghuba Marketplace</option>
                  <option value="STOREFRONT_ONLINE">Storefront Direct</option>
                  <option value="WHATSAPP_COMMERCE">WhatsApp Commerce</option>
                  <option value="POS_RETAIL">POS Retail</option>
                </select>
              </div>

              {/* Provider Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Payment Gateway
                </label>
                <select
                  value={txProvider}
                  onChange={(e) => setTxProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Gateways</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="PAYSTACK">Paystack</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CASH">Cash / COD</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Status
                </label>
                <select
                  value={txStatus}
                  onChange={(e) => setTxStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>

              {/* Period Filter */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Timeframe
                </label>
                <select
                  value={txPeriod}
                  onChange={(e) => setTxPeriod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="thisMonth">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by transaction ID, order #, customer phone/email..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchTransactions(1);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchTransactions(1)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition"
                >
                  Apply Filters
                </button>

                <button
                  onClick={handleExportTransactions}
                  disabled={isExportingTx || transactions.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>{isExportingTx ? "Exporting..." : "Export CSV"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Transaction / Order</th>
                    <th className="py-3.5 px-4">Store</th>
                    <th className="py-3.5 px-4">Channel & Gateway</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4 text-right">Gross Amount</th>
                    <th className="py-3.5 px-4 text-right">Net Store</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {isLoadingTx ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                        Querying global platform transactions...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-white block">
                            {tx.reference}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {tx.orderNumber ? `Order #${tx.orderNumber}` : tx.sourceModel} •{" "}
                            {new Date(tx.createdAt).toLocaleDateString("en-KE", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-200">
                          {tx.companyName || "Unknown Store"}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {getChannelBadge(tx.channel)}
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                              {getProviderIcon(tx.provider)} {tx.provider}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300">
                          <span className="block font-mono text-[11px]">
                            {tx.customerPhone || tx.customerEmail || "Guest Checkout"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-medium text-slate-200">
                          {formatMoney(tx.amount)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                          {formatMoney(tx.netStoreAmount)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {getStatusBadge(tx.status)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedTx(tx)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                            title="Inspect Transaction"
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

            {/* Pagination Controls */}
            {txPagination.totalPages > 1 && (
              <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing page {txPagination.page} of {txPagination.totalPages} ({txPagination.totalCount} total transactions)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchTransactions(txPagination.page - 1)}
                    disabled={txPagination.page <= 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => fetchTransactions(txPagination.page + 1)}
                    disabled={txPagination.page >= txPagination.totalPages}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: PAYMENT OPERATIONS & TILL VERIFICATION             */}
      {/* ========================================================= */}
      {activeTab === "OPERATIONS" && (
        <div className="space-y-6">
          {/* Top Operational Status Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShieldCheckIcon className="w-3.5 h-3.5" />
                    Authoritative Payment Operations
                  </span>
                  <span className="text-xs text-slate-400">
                    Safaricom Daraja 2.0 • Paystack • Multi-tenant Ledger Isolation
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-bold text-white">
                  Payment Infrastructure Readiness & Audit Queue
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Authoritative gateway telemetry, two-stage manual Till confirmation queue, AI credit purchase monitoring, and settlement integrity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchOperations}
                  disabled={isLoadingOperations}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2"
                >
                  <ArrowPathIcon className={`w-3.5 h-3.5 ${isLoadingOperations ? "animate-spin" : ""}`} />
                  Refresh Operations
                </button>
              </div>
            </div>
          </div>

          {/* 1. GATEWAY HEALTH & ISOLATION STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Safaricom M-Pesa STK Push */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <DevicePhoneMobileIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Safaricom Daraja 2.0</h3>
                    <p className="text-[11px] text-slate-400">STK Push & M-Pesa Rails</p>
                  </div>
                </div>
                {operationsData?.gateways?.mpesa?.status === "CONFIGURED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircleIcon className="w-3 h-3" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ClockIcon className="w-3 h-3" /> Incomplete
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Environment:</span>
                  <span className="font-semibold text-slate-200">
                    {operationsData?.gateways?.mpesa?.environment || "Detecting..."}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Shortcode:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {operationsData?.gateways?.mpesa?.shortcode || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Transaction Type:</span>
                  <span className="font-mono text-slate-300">
                    {operationsData?.gateways?.mpesa?.transactionType || "CustomerPayBillOnline"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Callback Host:</span>
                  <span className="font-mono text-slate-300">
                    {operationsData?.gateways?.mpesa?.callbackUrlHost || "salesmanpro.store"}
                  </span>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-amber-400">Operational Notice:</span> STK Push credentials enable customer incoming payments. Note: Automated B2C Rider payouts require distinct B2C Initiator credentials.
              </div>
            </div>

            {/* Paystack Gateway */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <CreditCardIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Paystack Gateway</h3>
                    <p className="text-[11px] text-slate-400">Cards, Apple Pay & Bank Rails</p>
                  </div>
                </div>
                {operationsData?.gateways?.paystack?.status === "CONFIGURED" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircleIcon className="w-3 h-3" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ClockIcon className="w-3 h-3" /> Incomplete
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Environment:</span>
                  <span className="font-semibold text-slate-200">
                    {operationsData?.gateways?.paystack?.environment || "Detecting..."}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Public Key:</span>
                  <span className="font-mono font-bold text-blue-400">
                    {operationsData?.gateways?.paystack?.publicKeyPrefix ? `${operationsData.gateways.paystack.publicKeyPrefix}***` : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">HMAC Webhook:</span>
                  <span className="font-mono text-emerald-400 font-semibold">Active & Validated</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Isolation Policy:</span>
                  <span className="text-slate-300">Server-Side Canonical Resolver</span>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-blue-400">Ghuba Managed:</span> All Ghuba-managed store checkouts automatically route to platform Paystack keys while crediting store settlement balances.
              </div>
            </div>

            {/* Platform Fallback Till */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <BuildingStorefrontIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Platform Till Fallback</h3>
                    <p className="text-[11px] text-slate-400">Buy Goods / Till Rails</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheckIcon className="w-3 h-3" /> Two-Stage Audit
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Platform Till Number:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {operationsData?.gateways?.till?.tillNumber || "4934444"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Account Name:</span>
                  <span className="text-slate-200">
                    {operationsData?.gateways?.till?.accountName || "SalesmanPro / Ghuba"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Stage 1 Approval:</span>
                  <span className="text-slate-300">Admin Receipt Review</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Stage 2 Approval:</span>
                  <span className="text-amber-400 font-semibold">Super-Admin Statement Match</span>
                </div>
              </div>
              <div className="mt-3 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-rose-400">Fraud Safeguard:</span> Orders remain Unfulfilled and pending until Stage 2 Super-Admin verification against actual Safaricom statements is complete.
              </div>
            </div>
          </div>

          {/* 2. TWO-STAGE TILL VERIFICATION QUEUE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-amber-400" />
                  Manual Till Verification Queue
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Two-stage audit workflow: Admin checks customer submission &rarr; Super-Admin matches bank statement to verify payment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {operationsData?.tillQueue?.totalPendingOrders ?? 0} Pending Order(s)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  {operationsData?.tillQueue?.totalPendingSubscriptions ?? 0} Pending Subscription(s)
                </span>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order / Tracking</th>
                    <th className="py-3 px-4">Customer & Store</th>
                    <th className="py-3 px-4">Claimed Ref</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Verification Stage</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Audit Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {(!operationsData?.tillQueue?.pendingOrders || operationsData.tillQueue.pendingOrders.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        <CheckCircleIcon className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
                        No pending Till order payments requiring verification.
                      </td>
                    </tr>
                  ) : (
                    operationsData.tillQueue.pendingOrders.map((ord: any) => (
                      <tr key={ord.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-mono">
                            {ord.trackingNumber || ord.id.slice(-8)}
                          </div>
                          <div className="text-[11px] text-slate-400">{ord.name || "Customer Order"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200">{ord.customerPhone || ord.customerEmail || "N/A"}</div>
                          <div className="text-[11px] text-purple-400">{ord.company?.name || "Merchant Store"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {ord.mpesaReference || ord.notes?.match(/Ref:\s*([A-Z0-9]+)/i)?.[1] || "CLAIMED"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          {formatMoney(ord.totalAmount)}
                        </td>
                        <td className="py-3 px-4">
                          {ord.verificationStage === "STAGE_2_SUPER_ADMIN_VERIFY" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                              <ShieldCheckIcon className="w-3 h-3" />
                              Stage 2: Super-Admin Verify
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              <ClockIcon className="w-3 h-3" />
                              Stage 1: Admin Review
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString("en-KE")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.verificationStage === "STAGE_1_ADMIN_CONFIRM" && (
                              <button
                                onClick={() =>
                                  setTillActionModal({
                                    open: true,
                                    type: "ORDER",
                                    action: "ADMIN_CONFIRM",
                                    item: ord,
                                    statementRef: "",
                                    notes: "",
                                    isSubmitting: false,
                                    error: null,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                              >
                                Admin Confirm
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setTillActionModal({
                                  open: true,
                                  type: "ORDER",
                                  action: "SUPER_VERIFY",
                                  item: ord,
                                  statementRef: ord.mpesaReference || "",
                                  notes: "",
                                  isSubmitting: false,
                                  error: null,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                            >
                              Super-Admin Verify
                            </button>

                            <button
                              onClick={() =>
                                setTillActionModal({
                                  open: true,
                                  type: "ORDER",
                                  action: "REJECT",
                                  item: ord,
                                  statementRef: "",
                                  notes: "",
                                  isSubmitting: false,
                                  error: null,
                                })
                              }
                              className="px-2 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. AI CREDITS & SETTLEMENT BALANCES OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Credit Platform Telemetry */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Credit Purchase Telemetry</h3>
                    <p className="text-[11px] text-slate-400">Platform-owned AI top-up revenue</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {operationsData?.aiCredits?.totalPurchasedCredits?.toLocaleString() ?? 0} Credits
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 my-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Purchases</div>
                  <div className="text-lg font-black text-white mt-1">
                    {operationsData?.aiCredits?.totalPurchaseTransactions ?? 0}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Purchased Credits</div>
                  <div className="text-lg font-black text-purple-400 mt-1">
                    {operationsData?.aiCredits?.totalPurchasedCredits?.toLocaleString() ?? 0}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Consumed Credits</div>
                  <div className="text-lg font-black text-slate-300 mt-1">
                    {operationsData?.aiCredits?.totalUsedCredits?.toLocaleString() ?? 0}
                  </div>
                </div>
              </div>

              <div className="text-xs">
                <div className="font-semibold text-slate-300 mb-2">Recent AI Top-Up Transactions</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(!operationsData?.aiCredits?.recentPurchases || operationsData.aiCredits.recentPurchases.length === 0) ? (
                    <div className="text-slate-500 py-3 text-center">No AI credit purchases recorded yet.</div>
                  ) : (
                    operationsData.aiCredits.recentPurchases.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white">{tx.companyName}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Ref: {tx.reference || tx.id.slice(-8)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-purple-400">+{tx.credits} Credits</span>
                          <span className="text-[10px] text-slate-400 block">{getStatusBadge(tx.status)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Merchant Settlement Funds vs Platform Revenue */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ScaleIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ghuba Collections & Settlement Liabilities</h3>
                    <p className="text-[11px] text-slate-400">Strict separation of platform vs merchant funds</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {operationsData?.settlements?.totalStoresTracked ?? 0} Stores Tracked
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Lifetime Gross Collected</div>
                  <div className="text-base font-black text-white mt-1">
                    {formatMoney(operationsData?.settlements?.lifetimeMerchantGrossCollected)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Platform collection account</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Disbursed to Merchants</div>
                  <div className="text-base font-black text-emerald-400 mt-1">
                    {formatMoney(operationsData?.settlements?.totalPaidOutToMerchants)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Verified completed withdrawals</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Outstanding Merchant Funds</div>
                  <div className="text-base font-black text-amber-400 mt-1">
                    {formatMoney(operationsData?.settlements?.outstandingMerchantLiabilities)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Owed to merchants (Available)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Pending Rider Payouts</div>
                  <div className="text-base font-black text-blue-400 mt-1">
                    {formatMoney(operationsData?.riderPayouts?.pendingPayoutAmount)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {operationsData?.riderPayouts?.pendingPayoutRequests ?? 0} Rider payout requests
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <span className="font-semibold text-emerald-400">Canonical Accounting Principle:</span> When Ghuba collects KES 5,000 for a merchant, the gross enters Ghuba's platform account, but the system records the exact merchant credit and platform fee in <span className="font-mono text-slate-300">TransactionLedger</span>. Merchant funds are liabilities, not platform income.
              </div>
            </div>
          </div>

          {/* 4. RECENT SYSTEM PAYMENT FAILURES */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <ExclamationTriangleIcon className="w-4 h-4 text-rose-400" />
              Recent Payment Failure Logs (Platform-Wide)
            </h3>
            {(!operationsData?.recentFailures || operationsData.recentFailures.length === 0) ? (
              <div className="text-slate-500 text-xs py-4 text-center">No payment failures detected in recent transactions.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-950/60 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Order / Tracking</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Gateway</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Transaction ID</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {operationsData.recentFailures.map((f: any) => (
                      <tr key={f.id} className="hover:bg-slate-800/20">
                        <td className="py-2.5 px-3 font-mono font-semibold text-white">{f.trackingNumber}</td>
                        <td className="py-2.5 px-3 text-slate-300">{f.customerName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{f.provider}</td>
                        <td className="py-2.5 px-3 font-bold text-rose-400">{formatMoney(f.amount)}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{f.transactionId || f.id.slice(-8)}</td>
                        <td className="py-2.5 px-3 text-slate-400">{new Date(f.date).toLocaleDateString("en-KE")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REJECT WITHDRAWAL REQUEST                          */}
      {/* ========================================================= */}
      {rejectModal.open && rejectModal.withdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <XCircleIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reject Withdrawal Request</h3>
                  <p className="text-xs text-slate-400">
                    Ref: <span className="font-mono text-slate-300">{rejectModal.withdrawal.reference}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectModal({ open: false, withdrawal: null, reason: "", isSubmitting: false, error: null })}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitRejectWithdrawal} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div>Store: <span className="font-semibold text-white">{rejectModal.withdrawal.company?.name}</span></div>
                <div>Amount to Refund: <span className="font-bold text-amber-400">{formatMoney(rejectModal.withdrawal.amount)}</span></div>
                <div className="text-[11px] text-slate-500 mt-2">
                  Rejecting this request will automatically unlock the reserved balance and return it to the merchant's available balance in the financial ledger.
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Rejection Reason <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. M-Pesa recipient phone mismatch with registered store director."
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {rejectModal.error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {rejectModal.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, withdrawal: null, reason: "", isSubmitting: false, error: null })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectModal.isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50"
                >
                  {rejectModal.isSubmitting ? "Rejecting..." : "Confirm Rejection & Unlock Balance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EXECUTE DISBURSEMENT / PAYOUT                      */}
      {/* ========================================================= */}
      {executeModal.open && executeModal.withdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <BanknotesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Disburse Payout & Mark as Paid</h3>
                  <p className="text-xs text-slate-400">
                    Ref: <span className="font-mono text-slate-300">{executeModal.withdrawal.reference}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExecuteModal({ open: false, withdrawal: null, providerReference: "", notes: "", isSubmitting: false, error: null })}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitExecutePayout} className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Store:</span>
                  <span className="font-semibold text-white">{executeModal.withdrawal.company?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination Rails:</span>
                  <span className="font-mono text-slate-200">{executeModal.withdrawal.payoutMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account / Phone:</span>
                  <span className="font-mono font-bold text-white">
                    {executeModal.withdrawal.destinationDetails?.phone ||
                      `${executeModal.withdrawal.destinationDetails?.bankName}: ${executeModal.withdrawal.destinationDetails?.accountNumber}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Net Disbursement Amount:</span>
                  <span className="font-black text-emerald-400 text-sm">{formatMoney(executeModal.withdrawal.netPayout)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  External Provider Reference / Receipt Code <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. QDF56789XX (Safaricom B2C Ref) or WIRE-98234-KE"
                  value={executeModal.providerReference}
                  onChange={(e) => setExecuteModal((prev) => ({ ...prev, providerReference: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Required audit proof verifying actual fund transfer through Safaricom B2C or bank wire rails.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Optional Settlement Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Disbursed via standard batch B2C."
                  value={executeModal.notes}
                  onChange={(e) => setExecuteModal((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              {executeModal.error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {executeModal.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setExecuteModal({ open: false, withdrawal: null, providerReference: "", notes: "", isSubmitting: false, error: null })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={executeModal.isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50"
                >
                  {executeModal.isSubmitting ? "Disbursing..." : "Confirm Payout Execution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: WITHDRAWAL DETAILS                                 */}
      {/* ========================================================= */}
      {withdrawalDetailsModal.open && withdrawalDetailsModal.withdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 text-blue-400" />
                Withdrawal Audit Details
              </h3>
              <button
                onClick={() => setWithdrawalDetailsModal({ open: false, withdrawal: null })}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono font-bold text-white">{withdrawalDetailsModal.withdrawal.reference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span>{getStatusBadge(withdrawalDetailsModal.withdrawal.status)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Store / Company:</span>
                <span className="font-semibold text-white">{withdrawalDetailsModal.withdrawal.company?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Requested By:</span>
                <span className="text-slate-200">
                  {withdrawalDetailsModal.withdrawal.requestedBy?.name || withdrawalDetailsModal.withdrawal.requestedBy?.email}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Amount:</span>
                <span className="font-medium text-slate-200">{formatMoney(withdrawalDetailsModal.withdrawal.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Net Payout:</span>
                <span className="font-bold text-emerald-400">{formatMoney(withdrawalDetailsModal.withdrawal.netPayout)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Payout Method:</span>
                <span className="font-mono text-slate-200">{withdrawalDetailsModal.withdrawal.payoutMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Destination:</span>
                <span className="font-mono text-white">
                  {JSON.stringify(withdrawalDetailsModal.withdrawal.destinationDetails)}
                </span>
              </div>
              {withdrawalDetailsModal.withdrawal.providerReference && (
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Provider Receipt:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {withdrawalDetailsModal.withdrawal.providerReference}
                  </span>
                </div>
              )}
              {withdrawalDetailsModal.withdrawal.rejectionReason && (
                <div className="py-2 text-rose-400">
                  <span className="font-semibold block mb-0.5">Rejection Reason:</span>
                  <p className="bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/20">
                    {withdrawalDetailsModal.withdrawal.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setWithdrawalDetailsModal({ open: false, withdrawal: null })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TRANSACTION DETAILS                                */}
      {/* ========================================================= */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5 text-purple-400" />
                Global Transaction Details
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Transaction ID / Ref:</span>
                <span className="font-mono font-bold text-white">{selectedTx.reference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Order #:</span>
                <span className="font-mono text-slate-200">{selectedTx.orderNumber || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Store / Company:</span>
                <span className="font-semibold text-white">{selectedTx.companyName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Sales Channel:</span>
                <span>{getChannelBadge(selectedTx.channel)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Gateway Provider:</span>
                <span className="font-mono text-slate-200">{selectedTx.provider}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span>{getStatusBadge(selectedTx.status)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Gross Amount:</span>
                <span className="font-bold text-white">{formatMoney(selectedTx.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Platform / Gateway Fee:</span>
                <span className="text-purple-400">{formatMoney(selectedTx.fee)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Store Net Amount:</span>
                <span className="font-bold text-emerald-400">{formatMoney(selectedTx.netStoreAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Customer Contact:</span>
                <span className="font-mono text-slate-200">
                  {selectedTx.customerPhone || selectedTx.customerEmail || "Guest"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Created Timestamp:</span>
                <span className="text-slate-300">
                  {new Date(selectedTx.createdAt).toLocaleString("en-KE")}
                </span>
              </div>
              {selectedTx.notes && (
                <div className="py-2 text-slate-300">
                  <span className="font-semibold block mb-0.5 text-slate-400">Notes / Remarks:</span>
                  <p className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">{selectedTx.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TILL PAYMENT ACTION (ADMIN / SUPER-ADMIN / REJECT) */}
      {/* ========================================================= */}
      {tillActionModal.open && tillActionModal.item && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  tillActionModal.action === "SUPER_VERIFY"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : tillActionModal.action === "ADMIN_CONFIRM"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {tillActionModal.action === "SUPER_VERIFY"
                      ? "Super-Admin Authoritative Till Verification"
                      : tillActionModal.action === "ADMIN_CONFIRM"
                      ? "Stage 1 Admin Receipt Review"
                      : "Reject Till Payment"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Order Ref: <span className="font-mono text-slate-300">{tillActionModal.item.trackingNumber || tillActionModal.item.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTillActionModal({ open: false, type: "ORDER", action: "SUPER_VERIFY", item: null, statementRef: "", notes: "", isSubmitting: false, error: null })}
                className="text-slate-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitTillAction} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <div>Customer: <span className="font-semibold text-white">{tillActionModal.item.customerPhone || tillActionModal.item.customerEmail || tillActionModal.item.name}</span></div>
                <div>Claimed Reference: <span className="font-mono font-bold text-amber-300">{tillActionModal.item.mpesaReference || "N/A"}</span></div>
                <div>Payable Amount: <span className="font-bold text-emerald-400">{formatMoney(tillActionModal.item.totalAmount)}</span></div>
                {tillActionModal.action === "SUPER_VERIFY" && (
                  <div className="text-[11px] text-amber-400 mt-2">
                    Super-Admin Rule: Match the claimed M-Pesa reference against your actual Safaricom Daraja Till statement before final approval.
                  </div>
                )}
              </div>

              {tillActionModal.action === "SUPER_VERIFY" && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Verified Statement Reference <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QDF56789XX (Matched in Safaricom Portal)"
                    value={tillActionModal.statementRef}
                    onChange={(e) => setTillActionModal((prev) => ({ ...prev, statementRef: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Authoritative proof that money entered the platform's Till account.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {tillActionModal.action === "REJECT" ? "Rejection Reason *" : "Audit Remarks / Notes"}
                </label>
                <textarea
                  rows={2}
                  required={tillActionModal.action === "REJECT"}
                  placeholder={
                    tillActionModal.action === "REJECT"
                      ? "e.g. Code does not appear on official statement, or amount mismatch."
                      : "Optional audit notes..."
                  }
                  value={tillActionModal.notes}
                  onChange={(e) => setTillActionModal((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-slate-600"
                />
              </div>

              {tillActionModal.error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {tillActionModal.error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTillActionModal({ open: false, type: "ORDER", action: "SUPER_VERIFY", item: null, statementRef: "", notes: "", isSubmitting: false, error: null })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tillActionModal.isSubmitting}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition disabled:opacity-50 text-white ${
                    tillActionModal.action === "REJECT"
                      ? "bg-rose-600 hover:bg-rose-500"
                      : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  {tillActionModal.isSubmitting
                    ? "Processing..."
                    : tillActionModal.action === "SUPER_VERIFY"
                    ? "Confirm Super-Admin Verification"
                    : tillActionModal.action === "ADMIN_CONFIRM"
                    ? "Confirm Admin Review"
                    : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
