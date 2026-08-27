"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  TagIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  PlusIcon,
  TrashIcon,
  InboxIcon
} from "@heroicons/react/24/outline";
import LogExpenseModal from "./LogExpenseModal";

interface ExpenseTrackingClientProps {
  companyId: string;
  initialExpenses?: any[];
}

const ExpenseTrackingClient = ({ companyId, initialExpenses = [] }: ExpenseTrackingClientProps) => {
  const [expenses, setExpenses] = useState<any[]>(initialExpenses);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch logic on mount
  useEffect(() => {
    fetchExpenses();
  }, [companyId]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/expenses?companyId=${encodeURIComponent(companyId)}`);
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to void this expense? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/expenses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExpenses((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete the record. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
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
          companyId: companyId,
        }),
      });

      if (response.ok) {
        const updatedExpenses = await fetch(`/api/admin/expenses?companyId=${encodeURIComponent(companyId)}`).then(res => res.json());
        setExpenses(updatedExpenses);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to save expense", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic KPI Calculations
  const stats = useMemo(() => {
    const total = expenses && expenses.length > 0 && expenses.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const pending = expenses && expenses.length > 0 && expenses
      .filter(e => e.status !== "Paid")
      .reduce((acc, curr) => acc + curr.amount, 0)
      || 0;
    
    const categories = expenses && expenses.length > 0 && expenses.map(e => e.category) || [];
    const topCategory = categories.length > 0 
      ? categories.sort((a, b) =>
          categories.filter(v => v === a).length - categories.filter(v => v === b).length
        ).pop() 
      : "None";

    return { total, pending, topCategory };
  }, [expenses]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-6 md:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-8 bg-rose-500 rounded-full" />
              <span className="text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                Outflow & Liabilities
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Expense <span className="text-rose-600 dark:text-rose-400">Tracking</span>
            </h1>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors shadow-sm">
              <CloudArrowUpIcon className="h-4 w-4" /> Bulk Upload
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" /> Log New Expense
            </button>
          </div>
        </header>

        {/* Dynamic KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Outflow (MTD)</p>
            <h3 className="text-3xl font-bold text-slate-950 dark:text-white mt-2">${stats.total.toLocaleString()}</h3>
          </div>
          
          <div className="bg-white dark:bg-slate-900/50 border-l-4 border-l-rose-500 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Awaiting Approval</p>
            <h3 className="text-3xl font-bold text-slate-950 dark:text-white mt-2">${stats.pending.toLocaleString()}</h3>
          </div>
          
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Expense Category</p>
            <h3 className="text-3xl font-bold text-slate-950 dark:text-white mt-2 capitalize">{stats.topCategory}</h3>
          </div>
        </div>

        {/* Expense Ledger Table */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                <tr className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  <th className="py-4 px-6">Date & ID</th>
                  <th className="py-4 px-6">Description & Vendor</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {isLoading ? (
                  // Loading Skeleton Rows
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-6 px-6">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36 mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-24"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-14"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : expenses.length === 0 ? (
                  // Elegant Empty State
                  <tr>
                    <td colSpan={6} className="py-16 px-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-full mb-3 text-slate-400 dark:text-slate-500">
                          <InboxIcon className="h-6 w-6" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No expenses tracked</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                          Get started by adding your first operational expense to build out your ledger.
                        </p>
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <PlusIcon className="h-3.5 w-3.5" /> Log First Expense
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                   expenses.length > 0 && expenses.map((exp) => (
                    <tr key={exp.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors duration-150">
                      <td className="py-5 px-6">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{exp.expenseId}</p>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{exp.description}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-0.5">{exp.vendor}</p>
                      </td>
                      <td className="py-5 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/40 dark:border-slate-700/30">
                          <TagIcon className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                          <span className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-300">{exp.category}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">${exp.amount.toLocaleString()}</p>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          exp.status === 'Paid' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" 
                            title="View Voucher"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>

                          <button 
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-600 dark:text-rose-500/70 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all" 
                            title="Void Transaction"
                          >
                            <TrashIcon className="w-4 h-4" />
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
      </div>

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