"use client";

import React, { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time period filters
  const [dateRangePreset, setDateRangePreset] = useState("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Data states
  const [overviewData, setOverviewData] = useState<any>(null);

  // Modals
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

  // Payment recording modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    paymentMethod: "MPESA",
    reference: "",
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Supplier Bill payment modal
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                Business Operating System
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Finance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Operations.</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Authoritative financial statements, cash movements, receivables, payables, and profitability for <span className="font-bold text-slate-200">{companyName}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Preset Selector */}
            <select
              value={dateRangePreset}
              onChange={(e) => setDateRangePreset(e.target.value)}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="yearToDate">Year to Date</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={fetchOverview}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-900/30 transition-all transform active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" /> Record Expense
            </button>
          </div>
        </div>

        {/* Attention Items Banner (if any) */}
        {attentionItems.length > 0 && (
          <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <span>Requires Attention Today ({attentionItems.length})</span>
              </div>
              <span className="text-[10px] text-amber-400/80 uppercase font-semibold">Priority Operations</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {attentionItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                      <span className="truncate">{item.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-black ${
                        item.severity === "HIGH" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8 Metric KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Net Revenue */}
          <div
            onClick={() => setActiveTab("pnl")}
            className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Revenue</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <ArrowTrendingUpIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {currency} {(pnl?.revenue?.netRevenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Gross: {currency} {(pnl?.revenue?.grossSales || 0).toLocaleString()}
            </div>
          </div>

          {/* 2. Cost of Goods Sold & Margin */}
          <div
            onClick={() => setActiveTab("pnl")}
            className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">COGS & Margin</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <ScaleIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {currency} {(pnl?.cogs?.totalCOGS || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1">
              Gross Margin: {(pnl?.profitability?.grossMarginPercentage || 0).toFixed(1)}%
            </div>
          </div>

          {/* 3. Operating Expenses */}
          <div
            onClick={() => setActiveTab("expenses")}
            className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expenses</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <ArrowTrendingDownIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {currency} {(pnl?.profitability?.totalOperatingExpenses || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {pnl?.expenseBreakdown?.length || 0} Categories Active
            </div>
          </div>

          {/* 4. Net Profit */}
          <div
            onClick={() => setActiveTab("pnl")}
            className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                <BanknotesIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl font-black ${(pnl?.profitability?.netProfit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {currency} {(pnl?.profitability?.netProfit || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Net Margin: {(pnl?.profitability?.netMarginPercentage || 0).toFixed(1)}%
            </div>
          </div>

          {/* 5. Net Cash Movement */}
          <div
            onClick={() => setActiveTab("cashFlow")}
            className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-teal-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Cash Flow</span>
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-black transition-colors">
                <BanknotesIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {currency} {(cashFlow?.summary?.netCashMovement || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              In: {(cashFlow?.summary?.totalCashIn || 0).toLocaleString()} | Out: {(cashFlow?.summary?.totalCashOut || 0).toLocaleString()}
            </div>
          </div>

          {/* 6. Accounts Receivable (Owed by Customers) */}
          <div
            onClick={() => setActiveTab("receivables")}
            className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receivables (AR)</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                <UserGroupIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {currency} {(receivables?.totalReceivables || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-400 font-semibold mt-1">
              Overdue: {currency} {(receivables?.totalOverdue || 0).toLocaleString()}
            </div>
          </div>

          {/* 7. Accounts Payable (Owed to Suppliers) */}
          <div
            onClick={() => setActiveTab("payables")}
            className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payables (AP)</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <BuildingOffice2Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {currency} {(payables?.totalPayables || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-purple-400 font-semibold mt-1">
              Overdue: {currency} {(payables?.totalOverdue || 0).toLocaleString()}
            </div>
          </div>

          {/* 8. Stock Asset Valuation */}
          <div
            onClick={() => setActiveTab("inventory")}
            className="cursor-pointer bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-5 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Value</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                <CubeIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">
              {currency} {(inventory?.totalCostValue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {inventory?.totalUnitsInStock || 0} Units in Stock
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 overflow-x-auto no-scrollbar pb-2">
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
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & HEALTH */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Profit & Loss Snapshot */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Income Statement Summary</h3>
                <span className="text-xs text-slate-400">Accrual-based</span>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-300">Gross Sales</span>
                  <span className="font-semibold text-white">{currency} {(pnl?.revenue?.grossSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-rose-400">
                  <span>Less Returns & Refunds</span>
                  <span>- {currency} {(pnl?.revenue?.returnsAndRefunds || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 font-bold text-slate-100">
                  <span>Net Revenue</span>
                  <span>{currency} {(pnl?.revenue?.netRevenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-blue-400">
                  <span>Less Cost of Goods Sold (COGS)</span>
                  <span>- {currency} {(pnl?.cogs?.totalCOGS || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-slate-700 font-extrabold text-base text-emerald-400">
                  <span>Gross Profit</span>
                  <span>{currency} {(pnl?.profitability?.grossProfit || 0).toLocaleString()} ({(pnl?.profitability?.grossMarginPercentage || 0).toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800 text-rose-400">
                  <span>Less Operating Expenses</span>
                  <span>- {currency} {(pnl?.profitability?.totalOperatingExpenses || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-4 font-black text-xl text-white bg-slate-800/40 px-4 rounded-xl">
                  <span>Net Operating Profit</span>
                  <span className={(pnl?.profitability?.netProfit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {currency} {(pnl?.profitability?.netProfit || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Expense Distribution Widget */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {pnl?.expenseBreakdown?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No operating expenses recorded yet.</p>
                ) : (
                  pnl?.expenseBreakdown?.slice(0, 6).map((item: any) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.category}</span>
                        <span className="text-white">{currency} {item.amount.toLocaleString()} ({item.percentage}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                + Add New Expense
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: FULL PROFIT & LOSS */}
        {activeTab === "pnl" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Income Statement (Profit & Loss)</h2>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive audited performance for {companyName}</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4" /> Print / Export
              </button>
            </div>

            <div className="divide-y divide-slate-800 text-sm">
              <div className="py-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">1. Operating Revenue</h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Gross Sales from Completed Orders</span>
                    <span className="text-white font-medium">{currency} {(pnl?.revenue?.grossSales || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Promotional Discounts Applied</span>
                    <span>- {currency} {(pnl?.revenue?.discounts || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Customer Returns & Refunds</span>
                    <span>- {currency} {(pnl?.revenue?.returnsAndRefunds || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800/60">
                    <span>Total Net Revenue</span>
                    <span>{currency} {(pnl?.revenue?.netRevenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">2. Cost of Goods Sold (COGS)</h4>
                <div className="space-y-2 pl-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Inventory Cost of Units Sold ({pnl?.cogs?.itemsSold || 0} Units)</span>
                    <span className="text-rose-400 font-medium">- {currency} {(pnl?.cogs?.totalCOGS || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-emerald-400 pt-2 border-t border-slate-800/60 text-base">
                    <span>Gross Profit</span>
                    <span>{currency} {(pnl?.profitability?.grossProfit || 0).toLocaleString()} ({(pnl?.profitability?.grossMarginPercentage || 0).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              <div className="py-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">3. Operating Expenses</h4>
                <div className="space-y-2 pl-4">
                  {pnl?.expenseBreakdown?.map((cat: any) => (
                    <div key={cat.category} className="flex justify-between text-slate-300">
                      <span>{cat.category} ({cat.count} records)</span>
                      <span>{currency} {cat.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-white pt-2 border-t border-slate-800/60">
                    <span>Total Operating Expenses</span>
                    <span className="text-rose-400">- {currency} {(pnl?.profitability?.totalOperatingExpenses || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="py-6">
                <div className="flex justify-between font-black text-2xl text-white bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
                  <span>Net Profit</span>
                  <span className={(pnl?.profitability?.netProfit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {currency} {(pnl?.profitability?.netProfit || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CASH FLOW */}
        {activeTab === "cashFlow" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Cash Flow Statement</h2>
                <p className="text-xs text-slate-400 mt-0.5">Direct liquidity movement across payments, expenses, and supplier settlements</p>
              </div>
            </div>

            {/* In vs Out Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-semibold">Total Cash In</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  +{currency} {(cashFlow?.summary?.totalCashIn || 0).toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-semibold">Total Cash Out</div>
                <div className="text-2xl font-black text-rose-400 mt-1">
                  -{currency} {(cashFlow?.summary?.totalCashOut || 0).toLocaleString()}
                </div>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-semibold">Net Cash Movement</div>
                <div className="text-2xl font-black text-white mt-1">
                  {currency} {(cashFlow?.summary?.netCashMovement || 0).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Cash Movements Ledger */}
            <div>
              <h3 className="text-base font-bold text-white mb-3">Recent Cash Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cashFlow?.movements?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">No cash transactions in selected period.</td>
                      </tr>
                    ) : (
                      cashFlow?.movements?.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">{new Date(m.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-semibold text-white">{m.source}</td>
                          <td className="py-3 px-4">{m.category}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                              m.type === "IN" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            }`}>
                              {m.type}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-right font-bold ${
                            m.type === "IN" ? "text-emerald-400" : "text-rose-400"
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
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Expense Management</h2>
                <p className="text-xs text-slate-400 mt-0.5">Record and monitor all operational expenses, utilities, and vendor charges</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
              >
                + Record New Expense
              </button>
            </div>

            {/* Category breakdown cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {pnl?.expenseBreakdown?.map((cat: any) => (
                <div key={cat.category} className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase truncate">{cat.category}</div>
                  <div className="text-base font-black text-white mt-1">{currency} {cat.amount.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-500">{cat.count} bills</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ACCOUNTS RECEIVABLE */}
        {activeTab === "receivables" && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Accounts Receivable (AR)</h2>
                <p className="text-xs text-slate-400 mt-0.5">Track unpaid customer invoices, credit sales, and aging balances</p>
              </div>
            </div>

            {/* Aging Buckets */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Current (Not Due)</div>
                <div className="text-lg font-black text-white mt-1">{currency} {(receivables?.aging?.current || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-amber-400 uppercase font-bold">1 - 30 Days</div>
                <div className="text-lg font-black text-amber-400 mt-1">{currency} {(receivables?.aging?.days1to30 || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-amber-500 uppercase font-bold">31 - 60 Days</div>
                <div className="text-lg font-black text-amber-500 mt-1">{currency} {(receivables?.aging?.days31to60 || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-rose-400 uppercase font-bold">61 - 90 Days</div>
                <div className="text-lg font-black text-rose-400 mt-1">{currency} {(receivables?.aging?.days61to90 || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-rose-500 uppercase font-bold">90+ Days Overdue</div>
                <div className="text-lg font-black text-rose-500 mt-1">{currency} {(receivables?.aging?.daysOver90 || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Unpaid Invoices Table */}
            <div>
              <h3 className="text-base font-bold text-white mb-3">Outstanding Customer Invoices</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount Due</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {receivables?.invoices?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">All customer invoices are fully settled! No outstanding balances.</td>
                      </tr>
                    ) : (
                      receivables?.invoices?.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{inv.invoiceNumber}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{inv.customerName}</div>
                            {inv.customerEmail && <div className="text-[10px] text-slate-500">{inv.customerEmail}</div>}
                          </td>
                          <td className="py-3 px-4">
                            <div>{new Date(inv.dueDate).toLocaleDateString()}</div>
                            {inv.daysOverdue > 0 && (
                              <div className="text-[10px] text-rose-400 font-bold">{inv.daysOverdue} days overdue</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400">
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-white">
                            {currency} {inv.amountDue.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
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
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
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
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Accounts Payable (AP)</h2>
                <p className="text-xs text-slate-400 mt-0.5">Supplier bills, procurement invoices, and scheduled payments</p>
              </div>
            </div>

            {/* Aging Buckets */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Current</div>
                <div className="text-lg font-black text-white mt-1">{currency} {(payables?.aging?.current || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-amber-400 uppercase font-bold">1 - 30 Days</div>
                <div className="text-lg font-black text-amber-400 mt-1">{currency} {(payables?.aging?.days1to30 || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-amber-500 uppercase font-bold">31 - 60 Days</div>
                <div className="text-lg font-black text-amber-500 mt-1">{currency} {(payables?.aging?.days31to60 || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-rose-400 uppercase font-bold">61 - 90 Days</div>
                <div className="text-lg font-black text-rose-400 mt-1">{currency} {(payables?.aging?.days61to90 || 0).toLocaleString()}</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-[10px] text-rose-500 uppercase font-bold">90+ Days</div>
                <div className="text-lg font-black text-rose-500 mt-1">{currency} {(payables?.aging?.daysOver90 || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Supplier Bills Table */}
            <div>
              <h3 className="text-base font-bold text-white mb-3">Outstanding Supplier Bills</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Bill #</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Amount Due</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {payables?.bills?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">No outstanding supplier bills. All procurement is settled.</td>
                      </tr>
                    ) : (
                      payables?.bills?.map((b: any) => (
                        <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{b.billNumber}</td>
                          <td className="py-3 px-4 font-semibold text-slate-200">{b.supplierName}</td>
                          <td className="py-3 px-4">
                            <div>{new Date(b.dueDate).toLocaleDateString()}</div>
                            {b.daysOverdue > 0 && (
                              <div className="text-[10px] text-rose-400 font-bold">{b.daysOverdue} days overdue</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/20 text-purple-400">
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-black text-white">
                            {currency} {b.amountDue.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
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
                              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold"
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
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">Tax & VAT Reporting</h2>
              <p className="text-xs text-slate-400 mt-0.5">Summary of tax collected on sales vs tax paid on procurement and operating expenses</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-xs font-bold text-slate-400 uppercase">Output Tax (Collected on Sales)</div>
                <div className="text-3xl font-black text-emerald-400 mt-2">
                  {currency} {(tax?.taxCollectedOnSales || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">From completed customer orders & invoices</p>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-xs font-bold text-slate-400 uppercase">Input Tax (Paid on Expenses & POs)</div>
                <div className="text-3xl font-black text-rose-400 mt-2">
                  {currency} {((tax?.taxPaidOnExpenses || 0) + (tax?.taxPaidOnProcurement || 0)).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Claimable input VAT on business purchases</p>
              </div>

              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-xs font-bold text-slate-400 uppercase">Net VAT / Tax Payable</div>
                <div className={`text-3xl font-black mt-2 ${(tax?.netTaxPayable || 0) >= 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {currency} {(tax?.netTaxPayable || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Net tax due to revenue authority for selected period</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: Record Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Record Operating Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
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
                <label className="block text-slate-400 font-bold mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office rent for March"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="Landlord, Power Co., etc."
                    value={expenseForm.vendor}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK">Bank Transfer</option>
                    <option value="CARD">Credit / Debit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Reference / Receipt Number</label>
                <input
                  type="text"
                  placeholder="e.g. MPESA-Q49129 or Cheque #102"
                  value={expenseForm.reference}
                  onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExpense}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSubmittingExpense ? "Saving..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Invoice Payment */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Record Invoice Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="text-xs text-slate-400 space-y-1 bg-slate-800/40 p-3 rounded-xl">
              <div><span className="font-bold text-slate-200">Invoice:</span> {selectedInvoice.invoiceNumber}</div>
              <div><span className="font-bold text-slate-200">Customer:</span> {selectedInvoice.customerName}</div>
              <div><span className="font-bold text-slate-200">Amount Due:</span> {currency} {selectedInvoice.amountDue.toLocaleString()}</div>
            </div>
            <form onSubmit={handleRecordInvoicePayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Amount Paid ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Reference / Code</label>
                <input
                  type="text"
                  placeholder="e.g. Transaction reference or receipt #"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500"
                >
                  {isSubmittingPayment ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pay Supplier Bill */}
      {isBillPaymentModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Pay Supplier Bill</h3>
              <button onClick={() => setIsBillPaymentModalOpen(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="text-xs text-slate-400 space-y-1 bg-slate-800/40 p-3 rounded-xl">
              <div><span className="font-bold text-slate-200">Bill #:</span> {selectedBill.billNumber}</div>
              <div><span className="font-bold text-slate-200">Supplier:</span> {selectedBill.supplierName}</div>
              <div><span className="font-bold text-slate-200">Amount Due:</span> {currency} {selectedBill.amountDue.toLocaleString()}</div>
            </div>
            <form onSubmit={handleRecordBillPayment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Amount to Pay ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={billPaymentForm.amount}
                  onChange={(e) => setBillPaymentForm({ ...billPaymentForm, amount: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Payment Method</label>
                <select
                  value={billPaymentForm.paymentMethod}
                  onChange={(e) => setBillPaymentForm({ ...billPaymentForm, paymentMethod: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  <option value="BANK">Bank Transfer</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Payment Reference</label>
                <input
                  type="text"
                  placeholder="Bank ref, Cheque #, etc."
                  value={billPaymentForm.reference}
                  onChange={(e) => setBillPaymentForm({ ...billPaymentForm, reference: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBillPaymentModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBillPayment}
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500"
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
