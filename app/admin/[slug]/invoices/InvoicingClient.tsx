"use client";

import React, { useState, useEffect } from "react";
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
  const computedTotals = form.items.reduce(
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

  // Submit invoice creation
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      alert("Customer name is required.");
      return;
    }
    if (form.items.some((it) => !it.description.trim() || it.unitPrice <= 0)) {
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
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>;
      case "PARTIALLY_PAID":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">Partially Paid</span>;
      case "OVERDUE":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">Overdue</span>;
      case "DRAFT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-500/10 text-slate-400 border border-slate-500/20">Draft</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-[11px] font-bold tracking-widest text-blue-400 uppercase">
                Accounts Receivable & Invoicing
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
              Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Invoices.</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Create, track, and reconcile customer invoices, credit sales, and receivables.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/40 transition-all active:scale-95"
          >
            <PlusIcon className="h-4 w-4 stroke-[3px]" /> Create New Invoice
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
              <span>Total Billed</span>
              <ClipboardDocumentListIcon className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white mt-2">
              {currency} {metrics.totalBilled.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
              <span>Total Collected</span>
              <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-2">
              {currency} {metrics.totalPaid.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
              <span>Outstanding Balance</span>
              <ClockIcon className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-2">
              {currency} {metrics.totalOutstanding.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/60">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by invoice #, customer name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchInvoices()}
              className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {["All", "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-4 px-5">Invoice #</th>
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Issue Date</th>
                  <th className="py-4 px-5">Due Date</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Total</th>
                  <th className="py-4 px-5 text-right">Amount Due</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
                      Loading invoices...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No invoices found. Click "Create New Invoice" to generate an invoice.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5 font-bold text-white whitespace-nowrap">{inv.invoiceNumber}</td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-200">{inv.customerName}</div>
                        {inv.customerEmail && <div className="text-[10px] text-slate-500">{inv.customerEmail}</div>}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">{new Date(inv.issueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-5 whitespace-nowrap">{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td className="py-4 px-5">{getStatusBadge(inv.status)}</td>
                      <td className="py-4 px-5 text-right font-bold text-white whitespace-nowrap">
                        {currency} {inv.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-5 text-right font-black text-amber-400 whitespace-nowrap">
                        {currency} {inv.amountDue.toLocaleString()}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                            title="View / Print Invoice"
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
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                            >
                              Receive Pay
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

      {/* MODAL: CREATE INVOICE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create New Business Invoice</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer / Client Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe or Acme Corp"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Customer Email</label>
                  <input
                    type="email"
                    placeholder="billing@customer.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-400 hover:text-blue-300 font-bold text-[11px]"
                  >
                    + Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {form.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-800/30 p-2.5 rounded-xl border border-slate-800 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={it.description}
                          onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={it.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          placeholder="Unit Price"
                          value={it.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                        />
                      </div>
                      <div className="col-span-1 text-center font-bold text-white">
                        {currency} {((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString()}
                      </div>
                      <div className="col-span-1 text-center">
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1"
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
                <div className="w-64 space-y-1 text-right bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>{currency} {computedTotals.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax:</span>
                    <span>{currency} {computedTotals.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-white text-sm pt-1 border-t border-slate-700">
                    <span>Total Due:</span>
                    <span>{currency} {computedTotals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Terms & Conditions</label>
                  <input
                    type="text"
                    value={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Notes / Instructions</label>
                  <input
                    type="text"
                    placeholder="Bank details or payment instructions"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD INVOICE PAYMENT */}
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
              <div><span className="font-bold text-slate-200">Total Billed:</span> {currency} {selectedInvoice.amount.toLocaleString()}</div>
              <div><span className="font-bold text-slate-200">Balance Due:</span> {currency} {selectedInvoice.amountDue.toLocaleString()}</div>
            </div>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
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
                  <option value="CARD">Credit / Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">Payment Reference</label>
                <input
                  type="text"
                  placeholder="Receipt #, transaction ref, etc."
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

      {/* MODAL: VIEW / PRINT INVOICE */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl my-8">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{companyName}</h2>
                <p className="text-xs text-slate-500">Official Commercial Invoice</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-blue-600">{selectedInvoice.invoiceNumber}</span>
                <p className="text-xs text-slate-500">Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                <p className="text-xs text-rose-600 font-bold">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-500 uppercase">Bill To:</span>
                <div className="text-sm font-bold text-slate-900 mt-1">{selectedInvoice.customerName}</div>
                {selectedInvoice.customerEmail && <div>{selectedInvoice.customerEmail}</div>}
                {selectedInvoice.customerPhone && <div>{selectedInvoice.customerPhone}</div>}
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-500 uppercase">Status:</span>
                <div className="mt-1 font-black text-sm">{selectedInvoice.status}</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2.5 px-4 font-semibold">{it.description}</td>
                      <td className="py-2.5 px-4 text-center">{it.quantity}</td>
                      <td className="py-2.5 px-4 text-right">{currency} {it.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-bold">{currency} {it.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-56 space-y-1 text-right text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>{currency} {(selectedInvoice.subtotal || selectedInvoice.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span>{currency} {selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Amount Paid:</span>
                  <span>{currency} {(selectedInvoice.amountPaid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-rose-600 text-base pt-1 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span>{currency} {selectedInvoice.amountDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.terms && (
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3">
                <span className="font-bold">Terms:</span> {selectedInvoice.terms}
              </div>
            )}

            <div className="flex justify-between items-center border-t border-slate-200 pt-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
              >
                <PrinterIcon className="h-4 w-4" /> Print / Save as PDF
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
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
