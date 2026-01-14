"use client";

import React from "react";
import { 
  ArrowUpRightIcon, 
  ReceiptPercentIcon, 
  BanknotesIcon, 
  TagIcon,
  DocumentDuplicateIcon,
  CloudArrowUpIcon,
  ChartBarSquareIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

const ExpenseTrackingClient = () => {
  const expenses = [
    { id: 'EXP-4022', category: 'Utilities', description: 'Monthly Electricity Bill', vendor: 'City Power Grid', amount: 1250, status: 'Paid', date: 'Jan 14' },
    { id: 'EXP-4025', category: 'Procurement', description: 'Lab Chemicals Refill', vendor: 'LabPro Chemicals', amount: 850, status: 'Pending Approval', date: 'Jan 15' },
    { id: 'EXP-4028', category: 'Maintenance', description: 'AC Repair - Staff Room', vendor: 'CoolAir Services', amount: 320, status: 'Processing', date: 'Jan 15' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <CloudArrowUpIcon className="h-4 w-4" /> Bulk Upload Receipts
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-rose-900/40">
                <PlusIcon className="h-4 w-4 stroke-[3px]" /> Log New Expense
             </button>
          </div>
        </header>

        {/* Burn Rate KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Outflow (MTD)</p>
             <h3 className="text-3xl font-black text-white mt-1">$14,280.00</h3>
             <p className="mt-4 text-[10px] text-rose-400 font-bold uppercase tracking-widest">+12% vs Last Month</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-b-4 border-b-rose-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Awaiting Approval</p>
             <h3 className="text-3xl font-black text-white mt-1">$2,140.00</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium italic italic">5 Pending Vouchers</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Top Expense Category</p>
             <h3 className="text-3xl font-black text-white mt-1 italic">Utilities</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">34% of Monthly Budget</p>
          </div>
        </div>

        {/* Expense Ledger */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
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
              {expenses.map((exp) => (
                <tr key={exp.id} className="group hover:bg-rose-500/[0.02] transition-colors">
                  <td className="p-6">
                    <p className="text-xs font-bold text-white">{exp.date}</p>
                    <p className="text-[10px] font-mono text-slate-600 mt-1">{exp.id}</p>
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
                      exp.status === 'Pending Approval' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="p-2 bg-slate-800 hover:bg-white hover:text-black rounded-lg transition-all" title="View Voucher">
                       <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default ExpenseTrackingClient;