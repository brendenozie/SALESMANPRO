"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  TagIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import LogExpenseModal from "./LogExpenseModal";

interface ExpenseTrackingClientProps {
  companyId: string;
  initialExpenses?: any[]; // Optional prop for initial expenses data
}
const ExpenseTrackingClient = ({ companyId, initialExpenses = [] }: ExpenseTrackingClientProps) => {
  const [expenses, setExpenses] = useState<any[]>(initialExpenses);
  const [isLoading, setIsLoading] = useState(true);
  // Inside your ExpenseTrackingClient component:

const [isModalOpen, setIsModalOpen] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);

// Add this inside your ExpenseTrackingClient component

const handleDeleteExpense = async (id: string) => {
  if (!confirm("Are you sure you want to void this expense? This action cannot be undone.")) return;

  try {
    const res = await fetch(`/api/admin/expenses/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      // Optimistic Update: Filter out the deleted item from state immediately
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert("Failed to delete the record. Please try again.");
    }
  } catch (error) {
    // console.error("Delete error:", error);
  }
};

const handleSaveExpense = async (data: any) => {
  setIsSubmitting(true);
  try {
    const response = await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        companyId: companyId, // Replace with real context
      }),
    });

    if (response.ok) {
      // Refresh the list
      const updatedExpenses = await fetch(`/api/admin/expenses?companyId=${encodeURIComponent(companyId)}`).then(res => res.json());
      setExpenses(updatedExpenses);
      setIsModalOpen(false);
    }
  } catch (error) {
    // console.error("Failed to save expense", error);
  } finally {
    setIsSubmitting(false);
  }
};

const fetchExpenses = async () => {
  try {
    const res = await fetch(`/api/admin/expenses?companyId=${encodeURIComponent(companyId)}`);
    const data = await res.json();
    setExpenses(data);
  } catch (err) {
    // console.error("Fetch error", err);
  } finally {
    setIsLoading(false);
  }
};

  // 1. Fetch Data
  // useEffect(() => {
    
  //   fetchExpenses();
  // }, [companyId]);

  // 2. Dynamic KPI Calculations
  const stats = useMemo(() => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const pending = expenses
      .filter(e => e.status !== "Paid")
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // Simple logic to find most frequent category
    const categories = expenses.map(e => e.category);
    const topCategory = categories.sort((a,b) =>
          categories.filter(v => v===a).length - categories.filter(v => v===b).length
    ).pop() || "None";

    return { total, pending, topCategory };
  }, [expenses]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header (Keep your current styling) */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
             <div className="flex items-center gap-2 mb-2">
               <span className="h-1 w-10 bg-rose-500 rounded-full" />
               <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em]">Outflow & Liabilities</span>
             </div>
             <h1 className="text-4xl font-extrabold text-white tracking-tight">
               Expense <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-500">Tracking.</span>
             </h1>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold text-xs">
                <CloudArrowUpIcon className="h-4 w-4" /> Bulk Upload
             </button>
                   
              {/* // Update your JSX button: */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-rose-900/40"
              >
                <PlusIcon className="h-4 w-4 stroke-[3px]" /> Log New Expense
              </button>
          </div>
        </header>

        {/* Dynamic KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Outflow (MTD)</p>
             <h3 className="text-3xl font-black text-white mt-1">${stats.total.toLocaleString()}</h3>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-b-4 border-b-rose-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Approval</p>
             <h3 className="text-3xl font-black text-white mt-1">${stats.pending.toLocaleString()}</h3>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Expense Category</p>
             <h3 className="text-3xl font-black text-white mt-1 italic">{stats.topCategory}</h3>
          </div>
        </div>

        {/* Expense Ledger Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <th className="p-6">Date & ID</th>
                <th className="p-6">Description & Vendor</th>
                <th className="p-6">Category</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {isLoading ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-500">Loading expenses...</td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="group hover:bg-rose-500/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="text-xs font-bold text-white">
                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600 mt-1">{exp.expenseId}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-white leading-tight">{exp.description}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">{exp.vendor}</p>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-2">
                          <TagIcon className="h-3.5 w-3.5 text-slate-600" />
                          <span className="text-[10px] font-black uppercase text-slate-400">{exp.category}</span>
                       </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-black text-white">${exp.amount.toLocaleString()}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        exp.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Existing Receipt Button */}
                        <button className="p-2 bg-slate-800 hover:bg-white hover:text-black rounded-lg transition-all" title="View Voucher">
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>

                        {/* New Delete/Void Button */}
                        <button 
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="p-2 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg transition-all text-rose-500/50" 
                          title="Void Transaction"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
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

      {/* // Add the modal at the bottom of your main return: */}
      <LogExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveExpense}
        isSubmitting={isSubmitting}
      />
    </main>
  );
};

export default ExpenseTrackingClient;