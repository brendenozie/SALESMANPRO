"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardDocumentCheckIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  TrashIcon,
  ArrowRightCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

interface Props {
  companyId: string;
  companySlug: string;
  currency: string;
  companyName: string;
}

export default function QuotationsClient({
  companyId,
  companySlug,
  currency,
  companyName,
}: Props) {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalQuoted: 0, totalAccepted: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  // New Quote form
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: "",
    terms: "Quotation valid for 30 calendar days. 50% mobilization deposit upon acceptance.",
    items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      if (filterStatus !== "All") params.append("status", filterStatus);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/quotations?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuotations(json.data.quotations || []);
        if (json.data.metrics) {
          setMetrics(json.data.metrics);
        }
      }
    } catch (err) {
      console.error("Fetch quotations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [companyId, filterStatus]);

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

  const handleCreateQuotation = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/admin/quotations", {
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
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          notes: "",
          terms: "Quotation valid for 30 calendar days. 50% mobilization deposit upon acceptance.",
          items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 }],
        });
        fetchQuotations();
      } else {
        alert(json.error || "Failed to create quotation");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToInvoice = async (quote: any) => {
    if (!confirm(`Convert Quotation ${quote.quotationNumber} into a live Invoice? This will generate a formal Invoice with exact line items.`)) {
      return;
    }

    try {
      setIsConverting(true);
      const res = await fetch(`/api/admin/quotations/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONVERT_TO_INVOICE" }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Success! Generated Invoice #${json.data.invoice.invoiceNumber}.`);
        setIsViewModalOpen(false);
        fetchQuotations();
      } else {
        alert(json.error || "Failed to convert quotation");
      }
    } catch (err: any) {
      alert(err.message || "Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Accepted</span>;
      case "CONVERTED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Converted to Invoice</span>;
      case "SENT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">Sent to Client</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Expired</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Draft</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Commercial Pipeline
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Quotations & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-500 to-purple-600">Estimates</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Issue formal estimates, track commercial validity, and seamlessly convert accepted quotes to invoices for <strong className="text-slate-800 dark:text-slate-200">{companyName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuotations}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all"
              title="Refresh"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin text-sky-500" : ""}`} />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
            >
              <PlusIcon className="w-4 h-4 stroke-[3px]" /> Create New Quote
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pipeline Value</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {currency} {metrics.totalQuoted.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cumulative proposals created</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accepted Quoted Volume</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {currency} {metrics.totalAccepted.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Proposals verified by clients</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["All", "DRAFT", "SENT", "ACCEPTED", "CONVERTED", "EXPIRED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === st
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchQuotations()}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* QUOTATIONS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Quote #</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No quotations found. Click "Create New Quote" to begin.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">{q.quotationNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{q.customerName}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(q.issueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(q.expiryDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">{currency} {q.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(q.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedQuotation(q);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="View details"
                          >
                            View
                          </button>
                          <a
                            href={`/api/documents/quotation/${q.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 text-sky-600 dark:text-sky-400"
                            title="Print / View PDF"
                          >
                            <PrinterIcon className="w-4 h-4" />
                          </a>
                          <a
                            href={`/api/documents/quotation/${q.id}/pdf?download=true`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Download PDF"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </a>
                          {q.status !== "CONVERTED" && (
                            <button
                              onClick={() => handleConvertToInvoice(q)}
                              disabled={isConverting}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm"
                              title="Convert to formal Invoice"
                            >
                              <ArrowRightCircleIcon className="w-3.5 h-3.5" /> Convert
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

        {/* MODAL: CREATE QUOTATION */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
              
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">Proposal Generation</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Create Commercial Quotation</h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateQuotation} className="space-y-6 text-xs">
                
                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Customer / Entity Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corporation"
                      value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Validity Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Contact Email</label>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+254 700 000 000"
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold uppercase text-[11px] text-sky-600 dark:text-sky-400 tracking-wider">Line Items & Deliverables</h4>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-bold text-xs"
                    >
                      <PlusIcon className="w-3.5 h-3.5 stroke-[3px]" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {form.items.map((it, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 items-center">
                        <div className="col-span-5">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Description</label>
                          <input
                            type="text"
                            required
                            placeholder="Deliverable description"
                            value={it.description}
                            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Unit Rate ({currency})</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={it.unitPrice}
                            onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Total</label>
                          <span className="font-black text-slate-900 dark:text-white">
                            {((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)).toLocaleString()}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-end items-end pt-4">
                          {form.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                              title="Remove item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-bold">{currency} {computedTotals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated VAT (16%):</span>
                      <span className="font-bold">{currency} {computedTotals.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      <span>Total Quotation:</span>
                      <span className="text-sky-600 dark:text-sky-400">{currency} {computedTotals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Terms & Conditions</label>
                  <input
                    type="text"
                    value={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-md shadow-sky-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "Generating Quotation..." : "Generate Quotation"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL: VIEW QUOTATION */}
        {isViewModalOpen && selectedQuotation && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
              
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-black text-xl">
                    <ClipboardDocumentCheckIcon className="w-6 h-6" /> {companyName}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Commercial Quotation & Proposal</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{selectedQuotation.quotationNumber}</span>
                  <p className="text-xs text-slate-500 mt-1">Date: {new Date(selectedQuotation.issueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-rose-500 font-bold">Valid Until: {new Date(selectedQuotation.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-extrabold text-slate-400 uppercase text-[10px]">Client / Recipient:</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedQuotation.customerName}</div>
                {selectedQuotation.customerEmail && <div className="text-slate-500 mt-0.5">{selectedQuotation.customerEmail}</div>}
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedQuotation.items?.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-semibold">{it.description}</td>
                        <td className="py-2.5 px-3 text-center">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right">{currency} {it.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{currency} {it.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end text-xs">
                <div className="w-60 space-y-1 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{currency} {selectedQuotation.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax:</span>
                    <span>{currency} {selectedQuotation.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-sky-600 dark:text-sky-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Total Estimate:</span>
                    <span>{currency} {selectedQuotation.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/documents/quotation/${selectedQuotation.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <PrinterIcon className="w-4 h-4" /> Print / View PDF
                  </a>
                  <a
                    href={`/api/documents/quotation/${selectedQuotation.id}/pdf?download=true`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" /> Download PDF
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {selectedQuotation.status !== "CONVERTED" && (
                    <button
                      onClick={() => handleConvertToInvoice(selectedQuotation)}
                      disabled={isConverting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <ArrowRightCircleIcon className="w-4 h-4" /> Convert to Invoice
                    </button>
                  )}
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
