"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  PrinterIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  FunnelIcon,
  BanknotesIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentCheckIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface InvoicingClientProps {
  companyId: string;
  companySlug: string;
  currency: string;
  companyName: string;
}

export default function InvoicingClient({
  companyId,
  companySlug,
  currency,
  companyName,
}: InvoicingClientProps) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data states
  const [invoices, setInvoices] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalBilled: 0, totalOutstanding: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // New Invoice form
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: "",
    terms: "Payment due within 30 days of invoice date.",
    items: [
      { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 },
    ],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    paymentMethod: "MPESA",
    reference: "",
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Fetch invoices from API
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      if (filterStatus !== "All") params.append("status", filterStatus);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/invoices?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setInvoices(json.data.invoices || []);
        if (json.data.metrics) {
          setMetrics(json.data.metrics);
        }
      }
    } catch (err) {
      console.error("Fetch invoices error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [companyId, filterStatus]);

  // Handle line item addition & change
  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (form.items.length <= 1) return;
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  // Compute live subtotal, tax, and total
  const computedTotals = useMemo(() => {
    return form.items.reduce(
      (acc, it) => {
        const gross = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
        const discount = gross * ((Number(it.discount) || 0) / 100);
        const net = gross - discount;
        const tax = net * ((Number(it.taxRate) || 0) / 100);
        acc.subtotal += net;
        acc.tax += tax;
        acc.total += net + tax;
        return acc;
      },
      { subtotal: 0, tax: 0, total: 0 }
    );
  }, [form.items]);

  // Submit invoice creation
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      alert("Customer name is required.");
      return;
    }
    if (form.items.some((it) => !it.description.trim() || Number(it.unitPrice) <= 0)) {
      alert("Please ensure all items have a description and valid price.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          companyId,
          currency,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsCreateModalOpen(false);
        setForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          notes: "",
          terms: "Payment due within 30 days of invoice date.",
          items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 }],
        });
        fetchInvoices();
      } else {
        alert(json.error || "Failed to create invoice");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit payment against invoice
  const handleRecordPayment = async (e: React.FormEvent) => {
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
        fetchInvoices();
      } else {
        alert(json.error || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Partially Paid
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Overdue
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
    }
  };

  // Theme Styling Helpers
  const bgClass = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBg = isDarkMode
    ? "bg-slate-900/70 border-slate-800/80 hover:border-slate-700/80 shadow-xl backdrop-blur-md"
    : "bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md backdrop-blur-md";
  const borderClass = isDarkMode ? "border-slate-800/80" : "border-slate-200";
  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-500";
  const textSubtle = isDarkMode ? "text-slate-300" : "text-slate-700";
  const textTitle = isDarkMode ? "text-white" : "text-slate-900";
  const inputBg = isDarkMode
    ? "bg-slate-900 border-slate-800 text-white focus:border-blue-500 placeholder-slate-500"
    : "bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder-slate-400";
  const modalBg = isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";

  return (
    <div className={`min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8 font-sans ${bgClass}`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER / TOP ACTION BAR */}
        <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b pb-6 ${borderClass}`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase flex items-center gap-1">
                <SparklesIcon className="h-3.5 w-3.5" /> Billing & Revenue Suite
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textTitle}`}>
              Invoicing & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">Receivables.</span>
            </h1>
            <p className={`text-sm mt-1 ${textMuted}`}>
              Create commercial invoices, manage collections, and track customer balances for{" "}
              <span className={`font-semibold ${textSubtle}`}>{companyName}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Switcher Toggle */}
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

            {/* Refresh Button */}
            <button
              onClick={fetchInvoices}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
              }`}
              title="Refresh Invoices"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" /> Create New Invoice
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Total Billed */}
          <div className={`rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 ${cardBg}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Total Invoiced</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <ClipboardDocumentListIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {metrics.totalBilled.toLocaleString()}
            </div>
            <div className={`text-[11px] mt-2 flex items-center gap-1 ${textMuted}`}>
              <span>Gross cumulative billed sales</span>
            </div>
          </div>

          {/* Total Collected */}
          <div className={`rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 ${cardBg}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Total Collected</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircleIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500">
              {currency} {metrics.totalPaid.toLocaleString()}
            </div>
            <div className={`text-[11px] mt-2 flex items-center justify-between ${textMuted}`}>
              <span>Collection Rate</span>
              <span className="font-bold text-emerald-500">
                {metrics.totalBilled > 0
                  ? ((metrics.totalPaid / metrics.totalBilled) * 100).toFixed(1)
                  : "0.0"}%
              </span>
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className={`rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 ${cardBg}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Outstanding AR</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <ClockIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500">
              {currency} {metrics.totalOutstanding.toLocaleString()}
            </div>
            <div className={`text-[11px] mt-2 flex items-center justify-between ${textMuted}`}>
              <span>Pending Receivables</span>
              <span className="font-bold text-amber-500">
                {invoices.filter((i) => i.amountDue > 0).length} Invoices
              </span>
            </div>
          </div>

        </div>

        {/* CONTROLS: SEARCH & STATUS FILTER TAB BAR */}
        <div className={`flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 p-3 rounded-2xl border transition-all ${
          isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              placeholder="Search by invoice #, customer name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchInvoices()}
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl font-medium focus:outline-none transition-all ${inputBg}`}
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {["All", "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {st === "PARTIALLY_PAID" ? "Partially Paid" : st}
              </button>
            ))}
          </div>
        </div>

        {/* INVOICES TABLE DATA LIST */}
        <div className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase font-bold border-b transition-colors ${
                isDarkMode ? "bg-slate-900/90 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                <tr>
                  <th className="py-4 px-5">Invoice #</th>
                  <th className="py-4 px-5">Customer Details</th>
                  <th className="py-4 px-5">Issue Date</th>
                  <th className="py-4 px-5">Due Date</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Total Amount</th>
                  <th className="py-4 px-5 text-right">Balance Due</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderClass}`}>
                {loading ? (
                  <tr>
                    <td colSpan={8} className={`py-16 text-center ${textMuted}`}>
                      <ArrowPathIcon className="h-7 w-7 animate-spin mx-auto mb-3 text-blue-500" />
                      <span className="font-semibold text-xs">Loading commercial ledger...</span>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={`py-16 text-center ${textMuted}`}>
                      <ClipboardDocumentListIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-sm">No Invoices Found</p>
                      <p className="text-xs mt-1">Click "Create New Invoice" to issue your first invoice.</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className={`transition-colors ${
                        isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className={`py-4 px-5 font-extrabold whitespace-nowrap ${textTitle}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {inv.invoiceNumber}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className={`font-bold text-sm ${textSubtle}`}>{inv.customerName}</div>
                        {inv.customerEmail && (
                          <div className={`text-[10px] ${textMuted}`}>{inv.customerEmail}</div>
                        )}
                      </td>
                      <td className={`py-4 px-5 whitespace-nowrap font-medium ${textSubtle}`}>
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className={`py-4 px-5 whitespace-nowrap font-medium ${textSubtle}`}>
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">{getStatusBadge(inv.status)}</td>
                      <td className={`py-4 px-5 text-right font-extrabold text-sm whitespace-nowrap ${textTitle}`}>
                        {currency} {inv.amount.toLocaleString()}
                      </td>
                      <td className={`py-4 px-5 text-right font-black text-sm whitespace-nowrap ${
                        inv.amountDue > 0 ? "text-amber-500" : "text-emerald-500"
                      }`}>
                        {currency} {inv.amountDue.toLocaleString()}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsViewModalOpen(true);
                            }}
                            className={`p-2 rounded-xl transition-all border ${
                              isDarkMode
                                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                            }`}
                            title="View / Print Official Invoice"
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </button>

                          {inv.amountDue > 0 && (
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
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all transform active:scale-95"
                            >
                              Receive Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODAL 1: CREATE INVOICE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border transition-all my-8 ${modalBg}`}>
            
            {/* Modal Header */}
            <div className={`flex justify-between items-center border-b pb-4 ${borderClass}`}>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">New Transaction</span>
                <h3 className={`text-xl font-black ${textTitle}`}>Create Business Invoice</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className={`p-2 rounded-xl hover:opacity-70 ${textMuted}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-5 text-xs">
              
              {/* Section 1: Customer Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold uppercase text-[11px] text-blue-500 tracking-wider">Customer Information</h4>
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border ${
                  isDarkMode ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <label className={`block font-bold mb-1.5 ${textSubtle}`}>Customer / Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corporation"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold mb-1.5 ${textSubtle}`}>Customer Email</label>
                    <input
                      type="email"
                      placeholder="accounts@acme.com"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold mb-1.5 ${textSubtle}`}>Due Date *</label>
                    <input
                      type="date"
                      required
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Line Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold uppercase text-[11px] text-blue-500 tracking-wider">Invoice Items</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-400 font-bold text-[11px]"
                  >
                    <PlusIcon className="h-3.5 w-3.5 stroke-[3px]" /> Add Item
                  </button>
                </div>

                <div className="space-y-2.5">
                  {form.items.map((it, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 gap-2 p-3 rounded-xl border items-center transition-all ${
                        isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="col-span-5">
                        <label className={`block text-[9px] font-bold uppercase mb-1 ${textMuted}`}>Description</label>
                        <input
                          type="text"
                          required
                          placeholder="Product or Service name"
                          value={it.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          className={`w-full p-2 rounded-lg border font-medium ${inputBg}`}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className={`block text-[9px] font-bold uppercase mb-1 ${textMuted}`}>Qty</label>
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="1"
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className={`w-full p-2 rounded-lg border text-center font-bold ${inputBg}`}
                        />
                      </div>
                      <div className="col-span-3">
                        <label className={`block text-[9px] font-bold uppercase mb-1 ${textMuted}`}>Unit Price ({currency})</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={it.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                          className={`w-full p-2 rounded-lg border font-bold ${inputBg}`}
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <label className={`block text-[9px] font-bold uppercase mb-1 ${textMuted}`}>Total</label>
                        <span className={`font-black ${textTitle}`}>
                          {((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)).toLocaleString()}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end items-end pt-4">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Remove Line Item"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className={`w-72 space-y-2 p-4 rounded-xl border ${
                  isDarkMode ? "bg-slate-950/70 border-slate-800" : "bg-slate-100 border-slate-200"
                }`}>
                  <div className={`flex justify-between ${textMuted}`}>
                    <span>Subtotal:</span>
                    <span className="font-bold">{currency} {computedTotals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between ${textMuted}`}>
                    <span>Estimated Tax (16%):</span>
                    <span className="font-bold">{currency} {computedTotals.tax.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between font-black text-sm pt-2 border-t ${borderClass} ${textTitle}`}>
                    <span>Total Amount Due:</span>
                    <span className="text-blue-500">{currency} {computedTotals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Terms & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${textSubtle}`}>Terms & Conditions</label>
                  <input
                    type="text"
                    value={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSubtle}`}>Notes / Payment Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank details or payment paybill numbers"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className={`flex justify-end gap-3 pt-4 border-t ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                    isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Generating Invoice..." : "Generate Invoice"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border transition-all ${modalBg}`}>
            <div className={`flex justify-between items-center border-b pb-3 ${borderClass}`}>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Receivables Settlement</span>
                <h3 className={`text-base font-bold ${textTitle}`}>Record Customer Payment</h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className={`hover:opacity-70 ${textMuted}`}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className={`text-xs space-y-2 p-3.5 rounded-xl border ${
              isDarkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex justify-between"><span className={textMuted}>Invoice #:</span> <span className={`font-bold ${textTitle}`}>{selectedInvoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className={textMuted}>Customer:</span> <span className={`font-bold ${textTitle}`}>{selectedInvoice.customerName}</span></div>
              <div className="flex justify-between"><span className={textMuted}>Total Billed:</span> <span className={`font-bold ${textTitle}`}>{currency} {selectedInvoice.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className={textMuted}>Current Balance Due:</span> <span className="font-black text-amber-500">{currency} {selectedInvoice.amountDue.toLocaleString()}</span></div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Amount Received ({currency})</label>
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
                  <option value="MPESA">M-Pesa Mobile Money</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="BANK">Bank Wire / EFT</option>
                  <option value="CARD">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Transaction Reference / Code</label>
                <input
                  type="text"
                  placeholder="e.g. MPESA Ref Code or Bank Receipt #"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isSubmittingPayment ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW / PRINT OFFICIAL INVOICE */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl my-8 print:p-0 print:shadow-none print:m-0">
            
            {/* Invoice Print Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-xl">
                  <DocumentCheckIcon className="h-6 w-6" /> {companyName}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Commercial Invoice & Delivery Statement</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{selectedInvoice.invoiceNumber}</span>
                <p className="text-xs text-slate-500 mt-1">Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                <p className="text-xs text-rose-600 font-bold">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">Billed To:</span>
                <div className="text-sm font-bold text-slate-900 mt-1">{selectedInvoice.customerName}</div>
                {selectedInvoice.customerEmail && <div className="text-slate-600 mt-0.5">{selectedInvoice.customerEmail}</div>}
                {selectedInvoice.customerPhone && <div className="text-slate-600">{selectedInvoice.customerPhone}</div>}
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">Payment Status:</span>
                <div className="mt-1 font-black text-sm">{selectedInvoice.status}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3 px-4 font-semibold text-slate-800">{it.description}</td>
                      <td className="py-3 px-4 text-center font-medium">{it.quantity}</td>
                      <td className="py-3 px-4 text-right font-medium">{currency} {it.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{currency} {it.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Breakdown */}
            <div className="flex justify-end">
              <div className="w-60 space-y-1.5 text-right text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{currency} {(selectedInvoice.subtotal || selectedInvoice.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-sm pt-1.5 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span>{currency} {selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Amount Paid:</span>
                  <span>{currency} {(selectedInvoice.amountPaid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-rose-600 text-base pt-1.5 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span>{currency} {selectedInvoice.amountDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.terms && (
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3">
                <span className="font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Terms & Conditions</span>
                {selectedInvoice.terms}
              </div>
            )}

            {/* Action Bar (Hidden on print) */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-5 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <PrinterIcon className="h-4 w-4" /> Print / Save PDF
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}