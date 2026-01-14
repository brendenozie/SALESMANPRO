"use client";

import React, { useMemo, useState } from "react";
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
} from "@heroicons/react/24/outline";

// Note: Ensure you have chart.js and react-chartjs-2 installed
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Internal Sub-Components
import SummaryCard from "./SummaryCard"; // Reusable stat card
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
  
  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [loggingPaymentRecord, setLoggingPaymentRecord] = useState<any>(null);

  // Financial Summary
  const stats = useMemo(() => {
    const totalDue = feeRecords.reduce((acc: number, curr: any) => acc + (curr.calculatedTotalFeesDue || 0), 0);
    const totalPaid = feeRecords.reduce((acc: number, curr: any) => acc + (curr.amountPaid || 0), 0);
    const balance = totalDue - totalPaid;
    return { totalDue, totalPaid, balance };
  }, [feeRecords]);

  const chartData = {
    labels: ["Collected", "Pending"],
    datasets: [{
      data: [stats.totalPaid, stats.balance],
      backgroundColor: ["#10B981", "#F43F5E"],
      borderWidth: 0,
      hoverOffset: 20,
    }]
  };

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-slate-200 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Financial Treasury
            </h1>
            <p className="text-slate-500 font-medium">Manage tuition, items, and school revenue</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowBatchModal(true)}
              className="group flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-sm font-bold transition-all"
            >
              <SparklesIcon className="h-5 w-5 text-indigo-400" />
              Batch Process
            </button>
            <button 
              onClick={() => setShowRecordModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
            >
              <PlusCircleIcon className="h-5 w-5" />
              New Record
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-slate-900/50 border border-slate-800 w-fit rounded-2xl">
          {[
            { id: "overview", label: "Overview", icon: ChartBarIcon },
            { id: "records", label: "Student Records", icon: UsersIcon },
            { id: "items", label: "Fee Catalog", icon: Squares2X2Icon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                ? "bg-slate-800 text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Revenue" value={`$${stats.totalPaid.toLocaleString()}`} icon={BanknotesIcon} color="emerald" />
                <SummaryCard title="Outstanding" value={`$${stats.balance.toLocaleString()}`} icon={ArrowPathIcon} color="rose" />
                <SummaryCard title="Collection Rate" value={`${((stats.totalPaid / stats.totalDue) * 100 || 0).toFixed(1)}%`} icon={ChartBarIcon} color="indigo" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-md">
                   <h3 className="text-lg font-bold mb-6">Revenue Distribution</h3>
                   <div className="h-80">
                      <Bar 
                        data={{
                          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                          datasets: [{ label: 'Revenue', data: [12000, 19000, 15000, 25000, 22000, 30000], backgroundColor: '#6366f1', borderRadius: 8 }]
                        }}
                        options={{ maintainAspectRatio: false, plugins: { legend: { display: false }}}}
                      />
                   </div>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-md flex flex-col items-center justify-center">
                  <h3 className="text-lg font-bold mb-6 w-full text-left">Payment Status</h3>
                  <div className="h-64 w-64">
                    <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* RECORDS TAB */}
          {activeTab === "records" && (
            <motion.div 
              key="records"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    placeholder="Search by student name or ID..."
                    className="w-full bg-slate-950/50 border border-slate-700/30 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors">
                  <FunnelIcon className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/30 text-[10px] uppercase font-black tracking-[0.15em] text-slate-500">
                    <tr>
                      <th className="px-8 py-5">Student Info</th>
                      <th className="px-8 py-5">Period</th>
                      <th className="px-8 py-5">Amount Due</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-right">Balance</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {feeRecords.map((record: any) => (
                      <FeeRecordRow key={record.id} record={record} onLogPayment={() => setLoggingPaymentRecord(record)} onEditRecord={() => setEditingRecord(record)} onDeleteRecord={() => {}} />
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logic-specific Modals */}
      <ApplyBatchFeeModal 
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        feeItems={initialFeeItemsData}
        academicLevels={allAcademicLevels}
        classrooms={allClassrooms} 
        onApply={() => {}} 
        isSubmitting={false}        
      />
      
      <AddEditFeeRecordModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        students={initialStudentsData}
      />

      <LogPaymentModal
        isOpen={!!loggingPaymentRecord}
        onClose={() => setLoggingPaymentRecord(null)}
        feeRecord={loggingPaymentRecord}
        onSavePayment={() => {}}
        isSubmitting={false}
      />
      
    </main>
  );
};

export default FeesClient;