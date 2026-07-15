"use client";

import React, { useMemo, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircleIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  UsersIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  SparklesIcon,
  FunnelIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

import SummaryCard from "./SummaryCard";
import FeeRecordRow from "./FeeRecordRow";
import ApplyBatchFeeModal from "./ApplyBatchFeeModal";
import AddEditFeeRecordModal from "./AddEditFeeRecordModal";
import LogPaymentModal from "./LogPaymentModal";

const FeesClient = ({ 
  initialFeeRecordsData, 
  initialStudentsData, 
  initialFeeItemsData, 
  schoolId,
  allAcademicLevels,
  allClassrooms 
}: any) => {
  const [activeTab, setActiveTab] = useState<"overview" | "records" | "items">("overview");
  const [feeRecords, setFeeRecords] = useState(initialFeeRecordsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Modals State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [loggingPaymentRecord, setLoggingPaymentRecord] = useState<any>(null);

  // Theme Engine Sync
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Financial Analytics Engine
  const stats = useMemo(() => {
    const totalDue = feeRecords?.reduce((acc: number, curr: any) => {
      const feeItems = curr.appliedFeeItems || [];
      const recordTotal = feeItems.reduce((s: number, i: any) => s + (i.amount || 0), 0);
      return acc + recordTotal;
    }, 0) ?? 0;

    const totalPaid = feeRecords && feeRecords.length > 0 
      ? feeRecords.reduce((acc: number, curr: any) => acc + (curr.amountPaid || 0), 0) 
      : 0;
      
    const balance = totalDue - totalPaid;
    return { totalDue, totalPaid, balance };
  }, [feeRecords]);

  // Dynamic Chart Configurations
  const chartTextColor = darkMode ? "#94a3b8" : "#475569";
  const chartGridColor = darkMode ? "#1e293b" : "#f1f5f9";

  const pieChartData = {
    labels: ["Collected", "Pending"],
    datasets: [{
      data: [stats.totalPaid, stats.balance],
      backgroundColor: ["#10B981", "#F43F5E"],
      borderColor: darkMode ? "#0f172a" : "#ffffff",
      borderWidth: 2,
      hoverOffset: 10,
    }]
  };
  
  // API Handlers
  const handleApplyBatchSave = async (data: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Processing bulk assignment...");
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fees/batch-apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, schoolId }),
      });
      if (!res.ok) throw new Error();
      await refresh();
      toast.success("Batch parameters deployed successfully", { id: toastId });
      setShowBatchModal(false);
    } catch {
      toast.error("Process failed during execution", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEditFeeRecordSave = async (data: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Committing ledger record...");
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fees`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, schoolId }),
      });
      if (!res.ok) throw new Error((await res.json())?.message || "Transaction aborted");
      await refresh();
      toast.success("Record integrity verified and saved", { id: toastId });
      setShowRecordModal(false);
      setEditingRecord(null);
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogPaymentSave = async (data: any) => {
    if (!loggingPaymentRecord) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Verifying payment ledger...");
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fees/${loggingPaymentRecord.id}/payments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      await refresh();
      toast.success("Payment securely logged", { id: toastId });
      setLoggingPaymentRecord(null);
    } catch {
      toast.error("Payment authorization failed", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const refresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/student-fee-records?companyId=${schoolId}`, { credentials: "include" });
      if (res.ok) {
        setFeeRecords((await res.json()).data);
        toast.success("System data synchronized");
      }
    } catch {
      toast.error("Synchronization fault");
    } finally {
      setIsRefreshing(false);
    }
  };

  const downloadInvoice = (recordId: string) => window.open(`${apiBaseUrl}/admin/fees/invoice/${recordId}`, "_blank");
  const downloadReceipt = (paymentId: string) => window.open(`${apiBaseUrl}/admin/fees/receipt/${paymentId}`, "_blank");

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 font-sans transition-colors duration-200">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: darkMode ? "#0f172a" : "#ffffff",
            color: darkMode ? "#f1f5f9" : "#0f172a",
            border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            fontSize: "12px",
            fontWeight: "bold"
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Control Rail */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Financial Administration Module
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
              title="Synchronize Records"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-500" : ""}`} />
            </button>
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
            >
              {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button> */}
          </div>
        </div>

        {/* Master Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Financial Treasury
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md font-medium">
              Monitor systemic revenue, orchestrate batch tuition protocols, and oversee individual ledger accounts.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button 
              onClick={() => setShowBatchModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <SparklesIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Batch Process
            </button>
            <button 
              onClick={() => setShowRecordModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
            >
              <PlusCircleIcon className="h-4 w-4 stroke-[2]" /> New Record
            </button>
          </div>
        </header>

        {/* Navigation Architecture */}
        <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full sm:w-fit rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: ChartBarIcon },
            { id: "records", label: "Ledger Records", icon: UsersIcon },
            { id: "items", label: "Item Catalog", icon: Squares2X2Icon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700/50" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 border border-transparent"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contextual Views */}
        <AnimatePresence mode="wait">
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <SummaryCard title="Total Revenue" value={`$${stats.totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={BanknotesIcon} color="emerald" />
                <SummaryCard title="Outstanding Balances" value={`$${stats.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={ArrowPathIcon} color="rose" />
                <SummaryCard title="Collection Ratio" value={`${((stats.totalPaid / (stats.totalDue || 1)) * 100).toFixed(1)}%`} icon={ChartBarIcon} color="indigo" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Bar Chart Panel */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col">
                   <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6">Revenue Trajectory</h3>
                   <div className="flex-1 min-h-[300px]">
                      <Bar 
                        data={{
                          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                          datasets: [{ 
                            label: 'Revenue', 
                            data: [12000, 19000, 15000, 25000, 22000, 30000], 
                            backgroundColor: '#4f46e5', 
                            borderRadius: 6,
                            barThickness: 32,
                          }]
                        }}
                        options={{ 
                          maintainAspectRatio: false, 
                          plugins: { legend: { display: false } },
                          scales: {
                            x: { grid: { display: false }, ticks: { color: chartTextColor, font: { family: 'inherit', size: 11, weight: 'bold' } } },
                            y: { grid: { color: chartGridColor }, ticks: { color: chartTextColor, font: { family: 'inherit', size: 11, weight: 'bold' } } }
                          }
                        }}
                      />
                   </div>
                </div>

                {/* Pie Chart Panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col items-center">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-6 w-full text-left">Liquidity Status</h3>
                  <div className="relative h-64 w-64 mt-auto mb-auto">
                    <Pie 
                      data={pieChartData} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { color: chartTextColor, padding: 20, font: { family: 'inherit', size: 11, weight: 'bold' } } }
                        }
                      }} 
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB: RECORDS */}
          {activeTab === "records" && (
            <motion.div 
              key="records"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-850 flex flex-col md:flex-row justify-between gap-4 items-center">
                <div className="relative w-full md:w-96">
                  <MagnifyingGlassIcon className="h-4.5 w-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    placeholder="Search by student identity parameters..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg">
                  <FunnelIcon className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] uppercase font-black tracking-[0.15em] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-850">
                    <tr>
                      <th className="px-8 py-4">Student Identity</th>
                      <th className="px-8 py-4">Academic Term</th>
                      <th className="px-8 py-4">Total Obligation</th>
                      <th className="px-8 py-4 text-center">Clearance Status</th>
                      <th className="px-8 py-4 text-right">Deficit</th>
                      <th className="px-8 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {feeRecords && feeRecords.length > 0 ? feeRecords.map((record: any) => (
                      <FeeRecordRow 
                        key={record.id} 
                        record={record} 
                        onLogPayment={() => setLoggingPaymentRecord(record)} 
                        onEditRecord={() => setEditingRecord(record)} 
                        onDeleteRecord={() => {}} 
                        onDownloadInvoice={() => downloadInvoice(record.id)} 
                      />
                    )) : (
                      <tr>
                        <td colSpan={6} className="px-8 py-16 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
                          No ledger records identified in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: ITEMS */}
          {activeTab === "items" && (
            <motion.div
              key="items"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center text-center shadow-sm">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
                  <Squares2X2Icon className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Architectural Fee Catalog</h2>
                <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">Review the structural baseline components for billing items mapped to your organization.</p>
              </div>

              {!initialFeeItemsData || initialFeeItemsData.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">The master item catalog is currently empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {initialFeeItemsData.map((item: any) => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between group hover:border-indigo-500/50 transition-colors">
                      <div className="mb-4">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">{item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description || "No description provided."}</p>
                      </div>
                      <div className="flex justify-between items-end mt-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Base Cost</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ${Number(item.defaultAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Logic-specific Modal Components */}
      <ApplyBatchFeeModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        feeItems={initialFeeItemsData}
        academicLevels={allAcademicLevels}
        classrooms={allClassrooms}
        onApply={handleApplyBatchSave}
        isSubmitting={isSubmitting}
      />

      <AddEditFeeRecordModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        students={initialStudentsData}
        feeItems={initialFeeItemsData}
        feeRecord={editingRecord}
        allAcademicLevels={allAcademicLevels}
        allClassrooms={allClassrooms}
        onSave={handleAddEditFeeRecordSave}
        isSubmitting={isSubmitting}
      />

      <LogPaymentModal
        isOpen={!!loggingPaymentRecord}
        onClose={() => setLoggingPaymentRecord(null)}
        feeRecord={loggingPaymentRecord}
        onSavePayment={handleLogPaymentSave}
        isSubmitting={isSubmitting}
        onDownloadReceipt={downloadReceipt}
      />
      
    </main>
  );
};

export default FeesClient;