"use client";

import React, { useState, useMemo } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  DocumentTextIcon,
  UserGroupIcon,
  BoltIcon,
  AdjustmentsVerticalIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PrinterIcon,
  EnvelopeIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  BanknotesIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface StudentInvoicingClientProps {
  companyId: string;
  schoolSlug: string;
  initialInvoices: any[];
  initialSummary: any;
  students: any[];
  classrooms: any[];
  feeStructures: any[];
}

export default function StudentInvoicingClient({
  companyId,
  schoolSlug,
  initialInvoices = [],
  initialSummary = {},
  students = [],
  classrooms = [],
  feeStructures = [],
}: StudentInvoicingClientProps) {
  const [invoices, setInvoices] = useState<any[]>(initialInvoices);
  const [summary, setSummary] = useState<any>(initialSummary);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [classFilter, setClassFilter] = useState("ALL");

  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Batch Form State
  const currentYear = new Date().getFullYear();
  const [batchForm, setBatchForm] = useState({
    academicYear: `${currentYear}/${currentYear + 1}`,
    term: "Term 1",
    classroomId: "",
    feeStructureId: feeStructures[0]?.id || "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  // Individual Form State
  const [adjustForm, setAdjustForm] = useState({
    studentId: students[0]?.id || "",
    academicYear: `${currentYear}/${currentYear + 1}`,
    term: "Term 1",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    items: [{ name: "Tuition Fee", amount: 15000 }],
  });

  // Refresh data from API
  const refreshInvoices = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/admin/fee-invoices?companyId=${encodeURIComponent(companyId)}`);
      const data = await res.json();
      if (data?.success && data?.data) {
        setInvoices(data.data.invoices || []);
        setSummary(data.data.summary || {});
      }
    } catch {
      toast.error("Failed to refresh invoices.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || inv.paymentStatus?.toUpperCase() === statusFilter.toUpperCase();

      const matchesClass =
        classFilter === "ALL" ||
        inv.studentClass?.toLowerCase() === classFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [invoices, searchTerm, statusFilter, classFilter]);

  // Handle Batch Generation Submit
  const handleBatchGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Deploying mass student invoices...");
    try {
      const res = await fetch("/api/admin/fee-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "batch",
          companyId,
          ...batchForm,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to generate invoices.");
      }
      toast.success(result.message || "Invoices generated successfully!", { id: toastId });
      setShowBatchModal(false);
      await refreshInvoices();
    } catch (err: any) {
      toast.error(err.message || "Mass generation failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Individual Adjustment Submit
  const handleSaveIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Saving individual invoice record...");
    try {
      const res = await fetch("/api/admin/fee-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "individual",
          companyId,
          ...adjustForm,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to save invoice.");
      }
      toast.success("Individual invoice updated successfully!", { id: toastId });
      setShowAdjustModal(false);
      await refreshInvoices();
    } catch (err: any) {
      toast.error(err.message || "Save failed.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to add/remove custom line items in individual modal
  const addLineItem = () => {
    setAdjustForm((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", amount: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    setAdjustForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    setAdjustForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-700/60 backdrop-blur-xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-8 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                Academic Billing & Invoicing
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Invoices & Fees</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Issue term bills, apply automated fee structures, and manage individual student adjustments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => refreshInvoices()}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              onClick={() => setShowAdjustModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 rounded-xl font-bold text-xs transition-all shadow-md"
            >
              <AdjustmentsVerticalIcon className="h-4 w-4 text-emerald-400" /> Individual Adjustment
            </button>
            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/40"
            >
              <BoltIcon className="h-4 w-4" /> Mass Generate Invoices
            </button>
          </div>
        </header>

        {/* Financial KPI Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoiced</span>
              <DocumentTextIcon className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              KES {(summary.totalInvoiced || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2">Across {summary.count || invoices.length} student records</p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected</span>
              <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">
              KES {(summary.totalCollected || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-500/80 mt-2 font-semibold">
              {summary.collectionRate || 0}% collection rate
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Debt</span>
              <ExclamationCircleIcon className="h-5 w-5 text-rose-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400">
              KES {(summary.totalOutstanding || 0).toLocaleString()}
            </h3>
            <p className="text-[11px] text-rose-400/80 mt-2 font-semibold">
              {summary.unpaidCount || 0} unpaid • {summary.partialCount || 0} partial
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-3xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Invoices</span>
              <UserGroupIcon className="h-5 w-5 text-teal-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-teal-300">
              {summary.paidCount || 0} <span className="text-sm font-medium text-slate-400">/ {summary.count || invoices.length}</span>
            </h3>
            <p className="text-[11px] text-teal-400/80 mt-2 font-semibold">Fully cleared accounts</p>
          </div>
        </div>

        {/* Invoices Table Section */}
        <div className="bg-slate-800/30 border border-slate-700/60 rounded-3xl overflow-hidden backdrop-blur-xl">
          {/* Controls Bar */}
          <div className="p-6 border-b border-slate-700/60 bg-slate-800/40 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, admission number or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 pl-12 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>

              {/* Classrooms Filter */}
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Classes</option>
                {classrooms.map((c: any) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-700/60 bg-slate-900/30">
                  <th className="p-4 sm:p-5">Invoice #</th>
                  <th className="p-4 sm:p-5">Student & Details</th>
                  <th className="p-4 sm:p-5">Period</th>
                  <th className="p-4 sm:p-5">Total Billed</th>
                  <th className="p-4 sm:p-5">Paid</th>
                  <th className="p-4 sm:p-5">Balance</th>
                  <th className="p-4 sm:p-5">Status</th>
                  <th className="p-4 sm:p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-400">
                      <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                      <p className="text-sm font-semibold text-slate-300">No student invoices found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Generate mass invoices or create an individual bill to get started.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 sm:p-5 text-xs font-mono font-bold text-emerald-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4 sm:p-5">
                        <div className="font-bold text-white text-xs sm:text-sm">{inv.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Adm: {inv.admissionNumber} • {inv.studentClass}
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-xs text-slate-300">
                        <div>{inv.term}</div>
                        <div className="text-[10px] text-slate-500">{inv.academicYear}</div>
                      </td>
                      <td className="p-4 sm:p-5 text-xs font-bold text-white">
                        KES {(inv.totalDue || 0).toLocaleString()}
                      </td>
                      <td className="p-4 sm:p-5 text-xs font-bold text-emerald-400">
                        KES {(inv.amountPaid || 0).toLocaleString()}
                      </td>
                      <td className="p-4 sm:p-5 text-xs font-bold text-rose-400">
                        KES {(inv.balance || 0).toLocaleString()}
                      </td>
                      <td className="p-4 sm:p-5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.paymentStatus === "Paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : inv.paymentStatus === "Partially Paid"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-right">
                        <button
                          onClick={() => setSelectedInvoiceForPrint(inv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all"
                        >
                          <PrinterIcon className="h-3.5 w-3.5" /> View / Print
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
      {/* MODAL 1: MASS GENERATE INVOICES                           */}
      {/* ======================================================== */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setShowBatchModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                <BoltIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Mass Generate Invoices</h3>
                <p className="text-xs text-slate-400">Bill entire school or selected classroom automatically</p>
              </div>
            </div>

            <form onSubmit={handleBatchGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  value={batchForm.academicYear}
                  onChange={(e) => setBatchForm({ ...batchForm, academicYear: e.target.value })}
                  placeholder="e.g. 2026/2027"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Academic Term</label>
                <select
                  value={batchForm.term}
                  onChange={(e) => setBatchForm({ ...batchForm, term: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Classroom (Optional)</label>
                <select
                  value={batchForm.classroomId}
                  onChange={(e) => setBatchForm({ ...batchForm, classroomId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="">All Classrooms (Entire School)</option>
                  {classrooms.map((c: any) => (
                    <option key={c.id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Fee Structure Template</label>
                <select
                  value={batchForm.feeStructureId}
                  onChange={(e) => setBatchForm({ ...batchForm, feeStructureId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                >
                  <option value="">Default Fee Items Snapshot</option>
                  {feeStructures.map((fs: any) => (
                    <option key={fs.id} value={fs.id}>
                      {fs.name} ({fs.year} - {fs.term || "Annual"}) - KES {fs.amount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={batchForm.dueDate}
                  onChange={(e) => setBatchForm({ ...batchForm, dueDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40"
                >
                  {isSubmitting ? "Generating..." : "Generate Invoices"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: INDIVIDUAL STUDENT INVOICE ADJUSTMENT             */}
      {/* ======================================================== */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAdjustModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                <AdjustmentsVerticalIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Student Fee Adjustment</h3>
                <p className="text-xs text-slate-400">Custom invoice items, scholarships or adjustments</p>
              </div>
            </div>

            <form onSubmit={handleSaveIndividual} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Student</label>
                <select
                  value={adjustForm.studentId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, studentId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} (Adm: {s.admissionNumber} - {s.currentClass || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={adjustForm.academicYear}
                    onChange={(e) => setAdjustForm({ ...adjustForm, academicYear: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Term</label>
                  <select
                    value={adjustForm.term}
                    onChange={(e) => setAdjustForm({ ...adjustForm, term: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={adjustForm.dueDate}
                  onChange={(e) => setAdjustForm({ ...adjustForm, dueDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Line Items */}
              <div className="border-t border-slate-800 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-300">Invoice Line Items</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    <PlusIcon className="h-3.5 w-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {adjustForm.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Item name (e.g., Tuition, Lab, Uniform)"
                        required
                        value={item.name}
                        onChange={(e) => updateLineItem(idx, "name", e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        required
                        value={item.amount}
                        onChange={(e) => updateLineItem(idx, "amount", parseFloat(e.target.value) || 0)}
                        className="w-28 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                      />
                      {adjustForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-right text-xs font-bold text-slate-300">
                  Total Due: KES{" "}
                  {adjustForm.items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString()}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/40"
                >
                  {isSubmitting ? "Saving..." : "Save Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PRINTABLE INVOICE / RECEIPT VIEW                */}
      {/* ======================================================== */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInvoiceForPrint(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {/* Printable Invoice Card */}
            <div id="printable-invoice" className="space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    Official Student Fee Invoice
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Invoice #{selectedInvoiceForPrint.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">Billing Period</div>
                  <div className="text-sm font-black text-slate-800">
                    {selectedInvoiceForPrint.term} • {selectedInvoiceForPrint.academicYear}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Due: {selectedInvoiceForPrint.dueDate}</div>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Billed To</div>
                  <div className="text-sm font-bold text-slate-900">{selectedInvoiceForPrint.studentName}</div>
                  <div className="text-xs text-slate-600">Admission No: {selectedInvoiceForPrint.admissionNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Class & Level</div>
                  <div className="text-sm font-bold text-slate-900">{selectedInvoiceForPrint.studentClass}</div>
                  <div className="text-xs text-slate-600">Level: {selectedInvoiceForPrint.academicLevel}</div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-right">Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedInvoiceForPrint.appliedFeeItems || []).map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="py-3 font-medium text-slate-800">{item.name}</td>
                        <td className="py-3 text-right font-bold text-slate-900">
                          {(Number(item.amount) || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Total Invoiced:</span>
                  <span className="font-bold text-slate-900">
                    KES {(selectedInvoiceForPrint.totalDue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Amount Paid:</span>
                  <span className="font-bold">
                    KES {(selectedInvoiceForPrint.amountPaid || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-rose-600 border-t border-slate-200 pt-2">
                  <span>Balance Due:</span>
                  <span>KES {(selectedInvoiceForPrint.balance || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Print action buttons */}
              <div className="pt-6 flex justify-end gap-3 border-t border-slate-200">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <PrinterIcon className="h-4 w-4" /> Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}