"use client";

import React, { useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  BanknotesIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  PrinterIcon,
  CheckCircleIcon,
  XMarkIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";

interface OnlinePaymentsClientProps {
  companyId: string;
  schoolSlug: string;
  initialTransactions: any[];
  initialSummary: any;
  invoices: any[];
  students: any[];
}

export default function OnlinePaymentsClient({
  companyId,
  schoolSlug,
  initialTransactions = [],
  initialSummary = {},
  invoices = [],
  students = [],
}: OnlinePaymentsClientProps) {
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [summary, setSummary] = useState<any>(initialSummary);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [logForm, setLogForm] = useState({
    studentFeeRecordId: invoices[0]?.id || "",
    amount: "",
    paymentMethod: "MPESA",
    reference: "",
    payerName: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    notes: "School tuition payment",
  });

  // Refresh API
  const refreshTransactions = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/fee-transactions?companyId=${encodeURIComponent(companyId)}`);
      const data = await res.json();
      if (data?.success && data?.data) {
        setTransactions(data.data.transactions || []);
        setSummary(data.data.summary || {});
      }
    } catch {
      toast.error("Failed to refresh transactions.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMethod =
        methodFilter === "ALL" ||
        t.paymentMethod?.toLowerCase() === methodFilter.toLowerCase();

      return matchesSearch && matchesMethod;
    });
  }, [transactions, searchTerm, methodFilter]);

  // Handle Log Payment Submit
  const handleLogPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.amount || parseFloat(logForm.amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Processing and logging payment...");
    try {
      const res = await fetch("/api/admin/fee-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          ...logForm,
          amount: parseFloat(logForm.amount),
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to log payment.");
      }
      toast.success("Payment recorded and receipt issued!", { id: toastId });
      setShowLogModal(false);
      setLogForm((prev) => ({ ...prev, amount: "", reference: "", payerName: "" }));
      await refreshTransactions();

      if (result.data?.payment) {
        setSelectedReceipt({
          ...result.data.payment,
          studentName: invoices.find((i) => i.id === logForm.studentFeeRecordId)?.studentName,
          admissionNumber: invoices.find((i) => i.id === logForm.studentFeeRecordId)?.admissionNumber,
          studentClass: invoices.find((i) => i.id === logForm.studentFeeRecordId)?.studentClass,
          balance: result.data.studentFeeRecord?.balance,
          totalDue: result.data.studentFeeRecord?.totalDue,
          amountPaid: result.data.studentFeeRecord?.amountPaid,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Payment logging failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-700/60 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-8 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">
                Real-Time Payments & Receipts Ledger
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              School <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Payment Transactions</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify digital receipts, log offline fees, and reconcile M-Pesa, bank, and cash collections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refreshTransactions()}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-900/40"
            >
              <PlusCircleIcon className="h-4 w-4" /> Log Student Payment
            </button>
          </div>
        </header>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Volume</span>
              <BanknotesIcon className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              KES {(summary.totalVolume || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2">{summary.transactionCount || transactions.length} recorded receipts</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">M-Pesa Collections</span>
              <DevicePhoneMobileIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">
              KES {(summary.mpesaVolume || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-500/80 mt-2 font-semibold">Mobile money payments</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Deposits</span>
              <BuildingLibraryIcon className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-blue-400">
              KES {(summary.bankVolume || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-blue-400/80 mt-2 font-semibold">Direct bank wire / transfers</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Over Counter</span>
              <ReceiptPercentIcon className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400">
              KES {(summary.cashVolume || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-amber-400/80 mt-2 font-semibold">Cashier recorded payments</p>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-slate-800/30 border border-slate-700/60 rounded-3xl overflow-hidden backdrop-blur-xl">
          {/* Controls Bar */}
          <div className="p-6 border-b border-slate-700/60 bg-slate-800/40 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by receipt #, student name, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 pl-12 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Payment Channels</option>
                <option value="MPESA">M-Pesa</option>
                <option value="BANK">Bank Deposit</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-700/60 bg-slate-900/30">
                  <th className="p-4 sm:p-5">Receipt #</th>
                  <th className="p-4 sm:p-5">Student</th>
                  <th className="p-4 sm:p-5">Term & Year</th>
                  <th className="p-4 sm:p-5">Amount (KES)</th>
                  <th className="p-4 sm:p-5">Channel</th>
                  <th className="p-4 sm:p-5">Reference / TXN</th>
                  <th className="p-4 sm:p-5">Date</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <CreditCardIcon className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                      <p className="text-sm font-semibold text-slate-300">No payment transactions recorded</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Record a fee payment to generate an official digital receipt.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 sm:p-5 text-xs font-mono font-bold text-indigo-400">
                        {t.receiptNumber}
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-white text-xs sm:text-sm">{t.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Adm: {t.admissionNumber} • {t.studentClass}
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-xs text-slate-300">
                        <div>{t.term}</div>
                        <div className="text-[10px] text-slate-500">{t.academicYear}</div>
                      </td>
                      <td className="p-4 sm:p-5 text-xs font-bold text-emerald-400">
                        KES {(t.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 sm:p-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 border border-slate-700 text-slate-300">
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-xs font-mono text-slate-400">
                        {t.reference}
                      </td>
                      <td className="p-4 sm:p-5 text-xs text-slate-400">
                        {t.paymentDate}
                      </td>
                      <td className="p-4 sm:p-5 text-right">
                        <button
                          onClick={() => setSelectedReceipt(t)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all"
                        >
                          <PrinterIcon className="h-3.5 w-3.5" /> Receipt
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

      {/* ======================================================== */}
      {/* MODAL 1: RECORD OFFLINE / MANUAL PAYMENT                 */}
      {/* ======================================================== */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center">
                <PlusCircleIcon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Record Student Payment</h3>
                <p className="text-xs text-slate-400">Log cash, bank deposit, or M-Pesa transaction</p>
              </div>
            </div>

            <form onSubmit={handleLogPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Student Invoice</label>
                <select
                  required
                  value={logForm.studentFeeRecordId}
                  onChange={(e) => setLogForm({ ...logForm, studentFeeRecordId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="">Choose student fee bill...</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.studentName} (Adm: {inv.admissionNumber}) — Due: KES {inv.balance?.toLocaleString()} ({inv.term} {inv.academicYear})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Amount (KES)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 15000"
                    value={logForm.amount}
                    onChange={(e) => setLogForm({ ...logForm, amount: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Payment Method</label>
                  <select
                    value={logForm.paymentMethod}
                    onChange={(e) => setLogForm({ ...logForm, paymentMethod: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="MPESA">M-Pesa</option>
                    <option value="BANK">Bank Deposit / Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CARD">Credit/Debit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Reference / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. QHJ729108K or Bank Slip #0492"
                  value={logForm.reference}
                  onChange={(e) => setLogForm({ ...logForm, reference: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Payer Name</label>
                  <input
                    type="text"
                    placeholder="Parent / Guardian Name"
                    value={logForm.payerName}
                    onChange={(e) => setLogForm({ ...logForm, payerName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={logForm.paymentDate}
                    onChange={(e) => setLogForm({ ...logForm, paymentDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-900/40"
                >
                  {isSubmitting ? "Logging..." : "Issue Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PRINTABLE OFFICIAL FEE RECEIPT                  */}
      {/* ======================================================== */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div id="printable-receipt" className="space-y-6">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <div className="text-xl font-black text-slate-900 uppercase">Official Payment Receipt</div>
                  <p className="text-xs text-slate-500 mt-1">Receipt #{selectedReceipt.receiptNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1 justify-end">
                    <CheckCircleIcon className="h-4 w-4" /> Payment Confirmed
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Date: {selectedReceipt.paymentDate || selectedReceipt.date}</div>
                </div>
              </div>

              {/* Student & Payer Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Received From / Student</div>
                  <div className="text-sm font-bold text-slate-900">{selectedReceipt.studentName || selectedReceipt.payerName}</div>
                  {selectedReceipt.admissionNumber && (
                    <div className="text-slate-600 mt-0.5">Admission: {selectedReceipt.admissionNumber}</div>
                  )}
                  {selectedReceipt.studentClass && (
                    <div className="text-slate-600">Class: {selectedReceipt.studentClass}</div>
                  )}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Transaction Info</div>
                  <div className="font-bold text-slate-800">Method: {selectedReceipt.paymentMethod || selectedReceipt.method}</div>
                  <div className="text-slate-600 mt-0.5 font-mono">Ref: {selectedReceipt.reference}</div>
                  {selectedReceipt.academicYear && (
                    <div className="text-slate-600">Period: {selectedReceipt.term} {selectedReceipt.academicYear}</div>
                  )}
                </div>
              </div>

              {/* Amount Box */}
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Amount Paid</span>
                  <div className="text-3xl font-black text-emerald-800">
                    KES {(Number(selectedReceipt.amount) || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Status</span>
                  <div className="text-xs font-bold text-emerald-700 uppercase">Cleared</div>
                </div>
              </div>

              {/* Remaining Balance if available */}
              {selectedReceipt.balance !== undefined && (
                <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <span>Remaining Balance for Period:</span>
                  <span className="font-black text-rose-600">
                    KES {(Number(selectedReceipt.balance) || 0).toLocaleString()}
                  </span>
                </div>
              )}

              {/* Footer signature line */}
              <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-400">
                <div>
                  <p>Computer generated receipt.</p>
                  <p>Valid without physical stamp.</p>
                </div>
                <div className="text-right">
                  <div className="h-8 border-b border-slate-300 w-36 mb-1" />
                  <p className="font-semibold text-slate-600">Authorized Bursar / Cashier</p>
                </div>
              </div>

              {/* Print Button */}
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <PrinterIcon className="h-4 w-4" /> Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}