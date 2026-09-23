"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  TagIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ShieldCheckIcon,
  ReceiptPercentIcon,
  CubeIcon,
  InformationCircleIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  FunnelIcon,
  CalendarIcon,
  ChevronRightIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
} from "@heroicons/react/24/outline";

interface FinanceHubProps {
  companyId: string;
  companySlug: string;
  companyName: string;
  currency: string;
  initialTab?: string;
}

export default function FinanceHubClient({
  companyId,
  companySlug,
  companyName,
  currency,
  initialTab = "overview",
}: FinanceHubProps) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Tab & Data states
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Time period filters
  const [dateRangePreset, setDateRangePreset] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data state
  const [overviewData, setOverviewData] = useState<any>(null);

  // Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: "Rent",
    description: "",
    vendor: "",
    amount: "",
    taxAmount: "0",
    paymentMethod: "CASH",
    reference: "",
    costCenter: "Operations",
    date: new Date().toISOString().slice(0, 10),
    receiptUrl: "",
    notes: "",
  });
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Invoice Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    paymentMethod: "MPESA",
    reference: "",
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Supplier Bill Payment Modal
  const [isBillPaymentModalOpen, setIsBillPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [billPaymentForm, setBillPaymentForm] = useState({
    amount: "",
    paymentMethod: "BANK",
    reference: "",
    notes: "",
  });
  const [isSubmittingBillPayment, setIsSubmittingBillPayment] = useState(false);

  // Auto-set dates based on preset
  useEffect(() => {
    const now = new Date();
    if (dateRangePreset === "thisMonth") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (dateRangePreset === "lastMonth") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
    } else if (dateRangePreset === "yearToDate") {
      const start = new Date(now.getFullYear(), 0, 1);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(now.toISOString().slice(0, 10));
    } else if (dateRangePreset === "all") {
      setStartDate("");
      setEndDate("");
    }
  }, [dateRangePreset]);

  // Fetch financial overview
  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ companyId });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/admin/finance/overview?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setOverviewData(json.data);
      } else {
        setError(json.error || "Failed to load financial data");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [companyId, startDate, endDate]);

  // Handle new expense creation
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    try {
      setIsSubmittingExpense(true);
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...expenseForm,
          companyId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsExpenseModalOpen(false);
        setExpenseForm({
          category: "Rent",
          description: "",
          vendor: "",
          amount: "",
          taxAmount: "0",
          paymentMethod: "CASH",
          reference: "",
          costCenter: "Operations",
          date: new Date().toISOString().slice(0, 10),
          receiptUrl: "",
          notes: "",
        });
        fetchOverview();
      } else {
        alert(json.error || "Failed to record expense");
      }
    } catch (err: any) {
      alert(err.message || "Failed to record expense");
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Handle record invoice payment
  const handleRecordInvoicePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      setIsSubmittingPayment(true);
      const res = await fetch(`/api/admin/invoices/${selectedInvoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_PAYMENT",
          amountPaid: paymentForm.amountPaid,
          paymentMethod: paymentForm.paymentMethod,
          reference: paymentForm.reference,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsPaymentModalOpen(false);
        setSelectedInvoice(null);
        fetchOverview();
      } else {
        alert(json.error || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Handle record supplier bill payment
  const handleRecordBillPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;

    try {
      setIsSubmittingBillPayment(true);
      const res = await fetch(`/api/admin/procurement/bills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId: selectedBill.id,
          amount: billPaymentForm.amount,
          paymentMethod: billPaymentForm.paymentMethod,
          reference: billPaymentForm.reference,
          notes: billPaymentForm.notes,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsBillPaymentModalOpen(false);
        setSelectedBill(null);
        fetchOverview();
      } else {
        alert(json.error || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setIsSubmittingBillPayment(false);
    }
  };

  const pnl = overviewData?.pnl;
  const cashFlow = overviewData?.cashFlow;
  const receivables = overviewData?.receivables;
  const payables = overviewData?.payables;
  const inventory = overviewData?.inventory;
  const tax = overviewData?.tax;
  const attentionItems = overviewData?.attentionItems || [];

  // Filtered lists for table search
  const filteredInvoices = useMemo(() => {
    if (!receivables?.invoices) return [];
    if (!searchTerm) return receivables.invoices;
    return receivables.invoices.filter((inv: any) =>
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [receivables?.invoices, searchTerm]);

  const filteredBills = useMemo(() => {
    if (!payables?.bills) return [];
    if (!searchTerm) return payables.bills;
    return payables.bills.filter((b: any) =>
      b.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payables?.bills, searchTerm]);

  const filteredCashMovements = useMemo(() => {
    if (!cashFlow?.movements) return [];
    if (!searchTerm) return cashFlow.movements;
    return cashFlow.movements.filter((m: any) =>
      m.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cashFlow?.movements, searchTerm]);

  // Theme Helpers
  const bgClass = isDarkMode
    ? "bg-slate-950 text-slate-100"
    : "bg-slate-50 text-slate-900";

  const cardBg = isDarkMode
    ? "bg-slate-900/70 border-slate-800/80 hover:border-slate-700/80 shadow-xl"
    : "bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md";

  const borderClass = isDarkMode ? "border-slate-800/80" : "border-slate-200";

  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-500";
  const textSubtle = isDarkMode ? "text-slate-300" : "text-slate-700";
  const textTitle = isDarkMode ? "text-white" : "text-slate-900";

  const inputBg = isDarkMode
    ? "bg-slate-900 border-slate-800 text-white focus:border-emerald-500 placeholder-slate-500"
    : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 placeholder-slate-400";

  const modalBg = isDarkMode
    ? "bg-slate-900 border-slate-800 text-white"
    : "bg-white border-slate-200 text-slate-900";

  return (
    <div className={`min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8 font-sans ${bgClass}`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TOP HEADER / ACTION BAR */}
        <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b pb-6 ${borderClass}`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-emerald-500 uppercase flex items-center gap-1">
                <SparklesIcon className="h-3.5 w-3.5" /> Business Operating System
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textTitle}`}>
              Finance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500">Operations.</span>
            </h1>
            <p className={`text-sm mt-1 ${textMuted}`}>
              Authoritative ledger, cash flow, balances, payables & margins for{" "}
              <span className={`font-semibold ${textSubtle}`}>{companyName}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>

            {/* Date Preset Selector */}
            <div className="relative">
              <select
                value={dateRangePreset}
                onChange={(e) => setDateRangePreset(e.target.value)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                  isDarkMode
                    ? "bg-slate-900 border border-slate-800 text-slate-200"
                    : "bg-white border border-slate-300 text-slate-800 shadow-sm"
                }`}
              >
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="yearToDate">Year to Date</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchOverview}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
              }`}
              title="Refresh Ledger Data"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" /> Record Expense
            </button>
          </div>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="underline hover:opacity-80">Dismiss</button>
          </div>
        )}

        {/* ATTENTION ITEMS BANNER */}
        {attentionItems.length > 0 && (
          <div className={`border rounded-2xl p-5 sm:p-6 backdrop-blur-md transition-all ${
            isDarkMode
              ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
              : "bg-amber-50/80 border-amber-200 text-amber-900 shadow-sm"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 animate-bounce" />
                <span>Requires Operational Action ({attentionItems.length})</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded-full uppercase">
                Priority
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {attentionItems.map((item: any) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isDarkMode ? "bg-slate-900/90 border-slate-800 hover:border-amber-500/50" : "bg-white border-slate-200 hover:border-amber-300 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className={`truncate ${textTitle}`}>{item.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        item.severity === "HIGH" ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${textMuted}`}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8 METRIC KPI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Net Revenue */}
          <div
            onClick={() => setActiveTab("pnl")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 group ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Net Revenue</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <ArrowTrendingUpIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {(pnl?.revenue?.netRevenue || 0).toLocaleString()}
            </div>
            <div className={`text-[11px] mt-1.5 flex items-center justify-between ${textMuted}`}>
              <span>Gross Sales</span>
              <span className={`font-semibold ${textSubtle}`}>{currency} {(pnl?.revenue?.grossSales || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* 2. COGS & Gross Margin */}
          <div
            onClick={() => setActiveTab("pnl")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 group ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>COGS & Margin</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ScaleIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {(pnl?.cogs?.totalCOGS || 0).toLocaleString()}
            </div>
            <div className="text-[11px] mt-1.5 flex items-center justify-between text-emerald-500 font-bold">
              <span>Gross Margin</span>
              <span>{(pnl?.profitability?.grossMarginPercentage || 0).toFixed(1)}%</span>
            </div>
          </div>

          {/* 3. Operating Expenses */}
          <div
            onClick={() => setActiveTab("expenses")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 group ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Expenses</span>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <ArrowTrendingDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {(pnl?.profitability?.totalOperatingExpenses || 0).toLocaleString()}
            </div>
            <div className={`text-[11px] mt-1.5 flex items-center justify-between ${textMuted}`}>
              <span>Categories</span>
              <span className={`font-semibold ${textSubtle}`}>{pnl?.expenseBreakdown?.length || 0} Active</span>
            </div>
          </div>

          {/* 4. Net Profit */}
          <div
            onClick={() => setActiveTab("pnl")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 group ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Net Profit</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <BanknotesIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${(pnl?.profitability?.netProfit || 0) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {currency} {(pnl?.profitability?.netProfit || 0).toLocaleString()}
            </div>
            <div className={`text-[11px] mt-1.5 flex items-center justify-between ${textMuted}`}>
              <span>Net Margin</span>
              <span className="font-bold text-emerald-500">{(pnl?.profitability?.netMarginPercentage || 0).toFixed(1)}%</span>
            </div>
          </div>

          {/* 5. Net Cash Movement */}
          <div
            onClick={() => setActiveTab("cashFlow")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 group ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Net Cash Flow</span>
              <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                <BanknotesIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {(cashFlow?.summary?.netCashMovement || 0).toLocaleString()}
            </div>
            <div className={`text-[11px] mt-1.5 flex items-center justify-between ${textMuted}`}>
              <span>In / Out</span>
              <span className={`font-semibold ${textSubtle}`}>
                +{(cashFlow?.summary?.totalCashIn || 0).toLocaleString()} / -{(cashFlow?.summary?.totalCashOut || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 6. Receivables (AR) */}
          <div
            onClick={() => setActiveTab("receivables")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 group ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Receivables (AR)</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <UserGroupIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {(receivables?.totalReceivables || 0).toLocaleString()}
            </div>
            <div className="text-[11px] mt-1.5 flex items-center justify-between text-amber-500 font-bold">
              <span>Overdue</span>
              <span>{currency} {(receivables?.totalOverdue || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* 7. Payables (AP) */}
          <div
            onClick={() => setActiveTab("payables")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 group ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Payables (AP)</span>
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <BuildingOffice2Icon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {(payables?.totalPayables || 0).toLocaleString()}
            </div>
            <div className="text-[11px] mt-1.5 flex items-center justify-between text-purple-500 font-bold">
              <span>Overdue</span>
              <span>{currency} {(payables?.totalOverdue || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* 8. Inventory Value */}
          <div
            onClick={() => setActiveTab("inventory")}
            className={`cursor-pointer rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 group ${cardBg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Stock Asset Value</span>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                <CubeIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {(inventory?.totalCostValue || 0).toLocaleString()}
            </div>
            <div className={`text-[11px] mt-1.5 flex items-center justify-between ${textMuted}`}>
              <span>In Stock</span>
              <span className={`font-semibold ${textSubtle}`}>{inventory?.totalUnitsInStock || 0} Units</span>
            </div>
          </div>

        </div>

        {/* MAIN TAB NAVIGATION & SEARCH BAR BAR */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${borderClass}`}>
          {/* Scrollable Tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "overview", label: "Overview & Health" },
              { id: "pnl", label: "Profit & Loss (P&L)" },
              { id: "cashFlow", label: "Cash Flow" },
              { id: "expenses", label: "Expenses" },
              { id: "receivables", label: "Receivables (AR)" },
              { id: "payables", label: "Payables (AP)" },
              { id: "tax", label: "Tax / VAT" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm("");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search for Table Tabs */}
          {["cashFlow", "receivables", "payables"].includes(activeTab) && (
            <div className="relative min-w-[220px]">
              <MagnifyingGlassIcon className={`h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl font-medium focus:outline-none transition-all ${inputBg}`}
              />
            </div>
          )}
        </div>

        {/* TAB 1: OVERVIEW & HEALTH */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Income Statement Summary */}
            <div className={`lg:col-span-2 rounded-2xl p-6 sm:p-8 border ${cardBg}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${textTitle}`}>Income Statement Summary</h3>
                  <p className={`text-xs ${textMuted}`}>Accrual-based financial performance snapshot</p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-500">
                  Audited
                </span>
              </div>

              <div className={`divide-y text-sm ${borderClass}`}>
                <div className="flex justify-between py-3">
                  <span className={textMuted}>Gross Sales</span>
                  <span className={`font-semibold ${textTitle}`}>{currency} {(pnl?.revenue?.grossSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 text-rose-500 font-medium">
                  <span>Less Returns & Refunds</span>
                  <span>- {currency} {(pnl?.revenue?.returnsAndRefunds || 0).toLocaleString()}</span>
                </div>
                <div className={`flex justify-between py-3 font-bold ${textTitle}`}>
                  <span>Net Revenue</span>
                  <span>{currency} {(pnl?.revenue?.netRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 text-blue-500 font-medium">
                  <span>Less Cost of Goods Sold (COGS)</span>
                  <span>- {currency} {(pnl?.cogs?.totalCOGS || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3.5 font-extrabold text-emerald-500 text-base">
                  <span>Gross Profit</span>
                  <span>{currency} {(pnl?.profitability?.grossProfit || 0).toLocaleString()} ({(pnl?.profitability?.grossMarginPercentage || 0).toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between py-3 text-rose-500 font-medium">
                  <span>Less Operating Expenses</span>
                  <span>- {currency} {(pnl?.profitability?.totalOperatingExpenses || 0).toLocaleString()}</span>
                </div>
                <div className={`flex justify-between py-4 font-black text-xl rounded-xl px-4 mt-2 ${
                  isDarkMode ? "bg-slate-800/50" : "bg-slate-100"
                }`}>
                  <span className={textTitle}>Net Operating Profit</span>
                  <span className={(pnl?.profitability?.netProfit || 0) >= 0 ? "text-emerald-500" : "text-rose-500"}>
                    {currency} {(pnl?.profitability?.netProfit || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Breakdown Widget */}
            <div className={`rounded-2xl p-6 sm:p-8 border flex flex-col justify-between ${cardBg}`}>
              <div>
                <h3 className={`text-lg font-bold mb-1 ${textTitle}`}>Expense Breakdown</h3>
                <p className={`text-xs mb-6 ${textMuted}`}>Distribution across operating centers</p>

                <div className="space-y-4">
                  {pnl?.expenseBreakdown?.length === 0 ? (
                    <div className={`py-12 text-center text-xs ${textMuted}`}>No operating expenses recorded yet.</div>
                  ) : (
                    pnl?.expenseBreakdown?.slice(0, 6).map((item: any) => (
                      <div key={item.category} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className={textSubtle}>{item.category}</span>
                          <span className={textTitle}>{currency} {item.amount.toLocaleString()} ({item.percentage}%)</span>
                        </div>
                        <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-slate-100"}`}>
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className={`w-full mt-6 py-3 rounded-xl text-xs font-bold transition-all border ${
                  isDarkMode
                    ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 shadow-sm"
                }`}
              >
                + Record New Expense
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: FULL PROFIT & LOSS STATEMENT */}
        {activeTab === "pnl" && (
          <div className={`rounded-2xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-2xl font-black ${textTitle}`}>Income Statement (Profit & Loss)</h2>
                <p className={`text-xs mt-0.5 ${textMuted}`}>Audited performance report for {companyName}</p>
              </div>
              <button
                onClick={() => window.print()}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isDarkMode
                    ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                }`}
              >
                <DocumentArrowDownIcon className="h-4 w-4 text-emerald-500" /> Print / Export
              </button>
            </div>

            <div className={`divide-y text-sm ${borderClass}`}>
              <div className="py-4">
                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">1. Operating Revenue</h4>
                <div className="space-y-2.5 pl-4">
                  <div className="flex justify-between">
                    <span className={textMuted}>Gross Sales from Completed Orders</span>
                    <span className={`font-semibold ${textTitle}`}>{currency} {(pnl?.revenue?.grossSales || 0).toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between ${textMuted}`}>
                    <span>Promotional Discounts Applied</span>
                    <span>- {currency} {(pnl?.revenue?.discounts || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-500 font-medium">
                    <span>Customer Returns & Refunds</span>
                    <span>- {currency} {(pnl?.revenue?.returnsAndRefunds || 0).toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between font-bold pt-2.5 border-t ${borderClass} ${textTitle}`}>
                    <span>Total Net Revenue</span>
                    <span>{currency} {(pnl?.revenue?.netRevenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-3">2. Cost of Goods Sold (COGS)</h4>
                <div className="space-y-2.5 pl-4">
                  <div className="flex justify-between">
                    <span className={textMuted}>Inventory Cost of Units Sold ({pnl?.cogs?.itemsSold || 0} Units)</span>
                    <span className="text-rose-500 font-medium">- {currency} {(pnl?.cogs?.totalCOGS || 0).toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between font-black text-emerald-500 pt-2.5 border-t ${borderClass} text-base`}>
                    <span>Gross Profit</span>
                    <span>{currency} {(pnl?.profitability?.grossProfit || 0).toLocaleString()} ({(pnl?.profitability?.grossMarginPercentage || 0).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3">3. Operating Expenses</h4>
                <div className="space-y-2.5 pl-4">
                  {pnl?.expenseBreakdown?.map((cat: any) => (
                    <div key={cat.category} className="flex justify-between">
                      <span className={textMuted}>{cat.category} ({cat.count} records)</span>
                      <span className={`font-semibold ${textSubtle}`}>{currency} {cat.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className={`flex justify-between font-bold pt-2.5 border-t ${borderClass} ${textTitle}`}>
                    <span>Total Operating Expenses</span>
                    <span className="text-rose-500">- {currency} {(pnl?.profitability?.totalOperatingExpenses || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="py-6">
                <div className={`flex justify-between font-black text-xl sm:text-2xl p-5 rounded-2xl border ${
                  isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-slate-100 border-slate-200"
                }`}>
                  <span className={textTitle}>Net Profit</span>
                  <span className={(pnl?.profitability?.netProfit || 0) >= 0 ? "text-emerald-500" : "text-rose-500"}>
                    {currency} {(pnl?.profitability?.netProfit || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CASH FLOW */}
        {activeTab === "cashFlow" && (
          <div className={`rounded-2xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
            <div>
              <h2 className={`text-2xl font-black ${textTitle}`}>Cash Flow Statement</h2>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Direct liquidity movement across payments, expenses, and supplier settlements</p>
            </div>

            {/* In vs Out Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 sm:p-5 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-emerald-50/60 border-emerald-100"}`}>
                <div className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">Total Cash In</div>
                <div className="text-2xl font-black text-emerald-500 mt-1">
                  +{currency} {(cashFlow?.summary?.totalCashIn || 0).toLocaleString()}
                </div>
              </div>
              <div className={`p-4 sm:p-5 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-rose-50/60 border-rose-100"}`}>
                <div className="text-xs font-extrabold uppercase text-rose-600 dark:text-rose-400">Total Cash Out</div>
                <div className="text-2xl font-black text-rose-500 mt-1">
                  -{currency} {(cashFlow?.summary?.totalCashOut || 0).toLocaleString()}
                </div>
              </div>
              <div className={`p-4 sm:p-5 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                <div className={`text-xs font-extrabold uppercase ${textMuted}`}>Net Cash Movement</div>
                <div className={`text-2xl font-black mt-1 ${textTitle}`}>
                  {currency} {(cashFlow?.summary?.netCashMovement || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Cash Movements Ledger Table */}
            <div>
              <h3 className={`text-base font-bold mb-3 ${textTitle}`}>Recent Cash Activity</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase font-bold border-b ${
                    isDarkMode ? "bg-slate-900/90 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    <tr>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderClass}`}>
                    {filteredCashMovements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={`py-12 text-center ${textMuted}`}>
                          No cash transactions match your query.
                        </td>
                      </tr>
                    ) : (
                      filteredCashMovements.map((m: any, idx: number) => (
                        <tr key={idx} className={`transition-colors ${isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}>
                          <td className={`py-3.5 px-4 whitespace-nowrap font-medium ${textSubtle}`}>{new Date(m.date).toLocaleDateString()}</td>
                          <td className={`py-3.5 px-4 font-bold ${textTitle}`}>{m.source}</td>
                          <td className={`py-3.5 px-4 ${textMuted}`}>{m.category}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                              m.type === "IN" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            }`}>
                              {m.type}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-bold text-sm ${
                            m.type === "IN" ? "text-emerald-500" : "text-rose-500"
                          }`}>
                            {m.type === "IN" ? "+" : "-"}{currency} {m.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXPENSES */}
        {activeTab === "expenses" && (
          <div className={`rounded-2xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className={`text-2xl font-black ${textTitle}`}>Expense Management</h2>
                <p className={`text-xs mt-0.5 ${textMuted}`}>Record and monitor operational expenses, utilities, and vendor charges</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
              >
                + Record New Expense
              </button>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {pnl?.expenseBreakdown?.map((cat: any) => (
                <div key={cat.category} className={`p-4 rounded-xl border ${
                  isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className={`text-[10px] font-extrabold uppercase truncate ${textMuted}`}>{cat.category}</div>
                  <div className={`text-base font-black mt-1 ${textTitle}`}>{currency} {cat.amount.toLocaleString()}</div>
                  <div className={`text-[9px] mt-0.5 ${textMuted}`}>{cat.count} records</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACCOUNTS RECEIVABLE */}
        {activeTab === "receivables" && (
          <div className={`rounded-2xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
            <div>
              <h2 className={`text-2xl font-black ${textTitle}`}>Accounts Receivable (AR)</h2>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Track unpaid customer invoices, credit sales, and aging balances</p>
            </div>

            {/* Aging Buckets */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <div className={`text-[10px] uppercase font-bold ${textMuted}`}>Current</div>
                <div className={`text-lg font-black mt-1 ${textTitle}`}>{currency} {(receivables?.aging?.current || 0).toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-amber-50 border-amber-200"}`}>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold">1 - 30 Days</div>
                <div className="text-lg font-black text-amber-500 mt-1">{currency} {(receivables?.aging?.days1to30 || 0).toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-amber-100/50 border-amber-300"}`}>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold">31 - 60 Days</div>
                <div className="text-lg font-black text-amber-600 mt-1">{currency} {(receivables?.aging?.days31to60 || 0).toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-rose-50 border-rose-200"}`}>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold">61 - 90 Days</div>
                <div className="text-lg font-black text-rose-500 mt-1">{currency} {(receivables?.aging?.days61to90 || 0).toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-rose-100/50 border-rose-300"}`}>
                <div className="text-[10px] text-rose-700 dark:text-rose-500 uppercase font-bold">90+ Days</div>
                <div className="text-lg font-black text-rose-600 mt-1">{currency} {(receivables?.aging?.daysOver90 || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Unpaid Invoices Table */}
            <div>
              <h3 className={`text-base font-bold mb-3 ${textTitle}`}>Outstanding Customer Invoices</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase font-bold border-b ${
                    isDarkMode ? "bg-slate-900/90 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    <tr>
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Due Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Amount Due</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderClass}`}>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`py-12 text-center ${textMuted}`}>
                          No outstanding invoices found.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv: any) => (
                        <tr key={inv.id} className={`transition-colors ${isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}>
                          <td className={`py-3.5 px-4 font-bold ${textTitle}`}>{inv.invoiceNumber}</td>
                          <td className="py-3.5 px-4">
                            <div className={`font-bold ${textSubtle}`}>{inv.customerName}</div>
                            {inv.customerEmail && <div className={`text-[10px] ${textMuted}`}>{inv.customerEmail}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className={textSubtle}>{new Date(inv.dueDate).toLocaleDateString()}</div>
                            {inv.daysOverdue > 0 && (
                              <div className="text-[10px] text-rose-500 font-bold">{inv.daysOverdue} days overdue</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {inv.status}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-black text-sm ${textTitle}`}>
                            {currency} {inv.amountDue.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentForm({
                                  amountPaid: inv.amountDue.toString(),
                                  paymentMethod: "MPESA",
                                  reference: "",
                                });
                                setIsPaymentModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all shadow"
                            >
                              Record Payment
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ACCOUNTS PAYABLE */}
        {activeTab === "payables" && (
          <div className={`rounded-2xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
            <div>
              <h2 className={`text-2xl font-black ${textTitle}`}>Accounts Payable (AP)</h2>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Supplier bills, procurement invoices, and scheduled payments</p>
            </div>

            {/* Aging Buckets */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <div className={`text-[10px] uppercase font-bold ${textMuted}`}>Current</div>
                <div className={`text-lg font-black mt-1 ${textTitle}`}>{currency} {(payables?.aging?.current || 0).toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-purple-50 border-purple-200"}`}>
                <div className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold">1 - 30 Days</div>
                <div className="text-lg font-black text-purple-500 mt-1">{currency} {(payables?.aging?.days1to30 || 0).toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-purple-100/50 border-purple-300"}`}>
                <div className="text-[10px] text-purple-700 dark:text-purple-400 uppercase font-bold">31 - 60 Days</div>
                <div className="text-lg font-black text-purple-600 mt-1">{currency} {(payables?.aging?.days31to60 || 0).toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-rose-50 border-rose-200"}`}>
                <div className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-bold">61 - 90 Days</div>
                <div className="text-lg font-black text-rose-500 mt-1">{currency} {(payables?.aging?.days61to90 || 0).toLocaleString()}</div>
              </div>
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-rose-100/50 border-rose-300"}`}>
                <div className="text-[10px] text-rose-700 dark:text-rose-500 uppercase font-bold">90+ Days</div>
                <div className="text-lg font-black text-rose-600 mt-1">{currency} {(payables?.aging?.daysOver90 || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Supplier Bills Table */}
            <div>
              <h3 className={`text-base font-bold mb-3 ${textTitle}`}>Outstanding Supplier Bills</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className={`uppercase font-bold border-b ${
                    isDarkMode ? "bg-slate-900/90 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}>
                    <tr>
                      <th className="py-3.5 px-4">Bill #</th>
                      <th className="py-3.5 px-4">Supplier</th>
                      <th className="py-3.5 px-4">Due Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Amount Due</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderClass}`}>
                    {filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={`py-12 text-center ${textMuted}`}>
                          No outstanding supplier bills found.
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((b: any) => (
                        <tr key={b.id} className={`transition-colors ${isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}>
                          <td className={`py-3.5 px-4 font-bold ${textTitle}`}>{b.billNumber}</td>
                          <td className={`py-3.5 px-4 font-semibold ${textSubtle}`}>{b.supplierName}</td>
                          <td className="py-3.5 px-4">
                            <div className={textSubtle}>{new Date(b.dueDate).toLocaleDateString()}</div>
                            {b.daysOverdue > 0 && (
                              <div className="text-[10px] text-rose-500 font-bold">{b.daysOverdue} days overdue</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/10 text-purple-500 border border-purple-500/20">
                              {b.status}
                            </span>
                          </td>
                          <td className={`py-3.5 px-4 text-right font-black text-sm ${textTitle}`}>
                            {currency} {b.amountDue.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedBill(b);
                                setBillPaymentForm({
                                  amount: b.amountDue.toString(),
                                  paymentMethod: "BANK",
                                  reference: "",
                                  notes: "",
                                });
                                setIsBillPaymentModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-all shadow"
                            >
                              Pay Bill
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TAX / VAT */}
        {activeTab === "tax" && (
          <div className={`rounded-2xl p-6 sm:p-8 border space-y-6 ${cardBg}`}>
            <div>
              <h2 className={`text-2xl font-black ${textTitle}`}>Tax & VAT Reporting</h2>
              <p className={`text-xs mt-0.5 ${textMuted}`}>Summary of tax collected on sales vs tax paid on procurement and operating expenses</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-emerald-50/50 border-emerald-100"}`}>
                <div className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Output Tax (Collected on Sales)</div>
                <div className="text-3xl font-black text-emerald-500 mt-2">
                  {currency} {(tax?.taxCollectedOnSales || 0).toLocaleString()}
                </div>
                <p className={`text-[11px] mt-2 ${textMuted}`}>From completed customer orders & invoices</p>
              </div>

              <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-rose-50/50 border-rose-100"}`}>
                <div className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400">Input Tax (Paid on Expenses & POs)</div>
                <div className="text-3xl font-black text-rose-500 mt-2">
                  {currency} {((tax?.taxPaidOnExpenses || 0) + (tax?.taxPaidOnProcurement || 0)).toLocaleString()}
                </div>
                <p className={`text-[11px] mt-2 ${textMuted}`}>Claimable input VAT on business purchases</p>
              </div>

              <div className={`p-6 rounded-2xl border ${isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                <div className={`text-xs font-bold uppercase ${textMuted}`}>Net VAT / Tax Payable</div>
                <div className={`text-3xl font-black mt-2 ${(tax?.netTaxPayable || 0) >= 0 ? "text-amber-500" : "text-emerald-500"}`}>
                  {currency} {(tax?.netTaxPayable || 0).toLocaleString()}
                </div>
                <p className={`text-[11px] mt-2 ${textMuted}`}>Net tax due to revenue authority for selected period</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: RECORD EXPENSE */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border transition-all ${modalBg}`}>
            <div className={`flex justify-between items-center border-b pb-3 ${borderClass}`}>
              <h3 className={`text-lg font-bold ${textTitle}`}>Record Operating Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className={`hover:opacity-70 ${textMuted}`}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                >
                  <option value="Rent">Rent</option>
                  <option value="Salaries & Wages">Salaries & Wages</option>
                  <option value="Electricity & Water">Electricity & Water</option>
                  <option value="Internet & Phone">Internet & Phone</option>
                  <option value="Fuel & Transport">Fuel & Transport</option>
                  <option value="Advertising & Marketing">Advertising & Marketing</option>
                  <option value="Packaging & Delivery">Packaging & Delivery</option>
                  <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                  <option value="Software & Subscriptions">Software & Subscriptions</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Bank & M-Pesa Charges">Bank & M-Pesa Charges</option>
                  <option value="Taxes & Licenses">Taxes & Licenses</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office rent for March"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${textSubtle}`}>Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-black ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSubtle}`}>Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="Landlord, Power Co."
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${textSubtle}`}>Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                  >
                    <option value="CASH">Cash</option>
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSubtle}`}>Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Reference / Receipt Code</label>
                <input
                  type="text"
                  placeholder="e.g. MPESA-Q49129 or Cheque #102"
                  value={expenseForm.reference}
                  onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                />
              </div>

              <div className={`flex justify-end gap-2 pt-4 border-t ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isSubmittingExpense ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD INVOICE PAYMENT */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border transition-all ${modalBg}`}>
            <div className={`flex justify-between items-center border-b pb-3 ${borderClass}`}>
              <h3 className={`text-base font-bold ${textTitle}`}>Record Invoice Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className={`hover:opacity-70 ${textMuted}`}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className={`text-xs space-y-1.5 p-3.5 rounded-xl border ${
              isDarkMode ? "bg-slate-800/40 border-slate-700/60" : "bg-slate-50 border-slate-200"
            }`}>
              <div><span className={`font-bold ${textSubtle}`}>Invoice:</span> <span className={textTitle}>{selectedInvoice.invoiceNumber}</span></div>
              <div><span className={`font-bold ${textSubtle}`}>Customer:</span> <span className={textTitle}>{selectedInvoice.customerName}</span></div>
              <div><span className={`font-bold ${textSubtle}`}>Amount Due:</span> <span className="font-extrabold text-emerald-500">{currency} {selectedInvoice.amountDue.toLocaleString()}</span></div>
            </div>
            <form onSubmit={handleRecordInvoicePayment} className="space-y-3.5 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Amount Paid ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-black ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                >
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Reference / Code</label>
                <input
                  type="text"
                  placeholder="e.g. Transaction reference or receipt #"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                />
              </div>
              <div className={`flex justify-end gap-2 pt-4 border-t ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all disabled:opacity-50"
                >
                  {isSubmittingPayment ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAY SUPPLIER BILL */}
      {isBillPaymentModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border transition-all ${modalBg}`}>
            <div className={`flex justify-between items-center border-b pb-3 ${borderClass}`}>
              <h3 className={`text-base font-bold ${textTitle}`}>Pay Supplier Bill</h3>
              <button onClick={() => setIsBillPaymentModalOpen(false)} className={`hover:opacity-70 ${textMuted}`}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className={`text-xs space-y-1.5 p-3.5 rounded-xl border ${
              isDarkMode ? "bg-slate-800/40 border-slate-700/60" : "bg-slate-50 border-slate-200"
            }`}>
              <div><span className={`font-bold ${textSubtle}`}>Bill #:</span> <span className={textTitle}>{selectedBill.billNumber}</span></div>
              <div><span className={`font-bold ${textSubtle}`}>Supplier:</span> <span className={textTitle}>{selectedBill.supplierName}</span></div>
              <div><span className={`font-bold ${textSubtle}`}>Amount Due:</span> <span className="font-extrabold text-purple-500">{currency} {selectedBill.amountDue.toLocaleString()}</span></div>
            </div>
            <form onSubmit={handleRecordBillPayment} className="space-y-3.5 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Amount to Pay ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={billPaymentForm.amount}
                  onChange={(e) => setBillPaymentForm({ ...billPaymentForm, amount: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-black ${inputBg}`}
                />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Payment Method</label>
                <select
                  value={billPaymentForm.paymentMethod}
                  onChange={(e) => setBillPaymentForm({ ...billPaymentForm, paymentMethod: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                >
                  <option value="BANK">Bank Transfer</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Payment Reference</label>
                <input
                  type="text"
                  placeholder="Bank ref, Cheque #, etc."
                  value={billPaymentForm.reference}
                  onChange={(e) => setBillPaymentForm({ ...billPaymentForm, reference: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                />
              </div>
              <div className={`flex justify-end gap-2 pt-4 border-t ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => setIsBillPaymentModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBillPayment}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isSubmittingBillPayment ? "Processing..." : "Record Settlement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}