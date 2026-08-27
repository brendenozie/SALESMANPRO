"use client";

import React, { useState } from "react";
import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  BoltIcon, 
  AdjustmentsVerticalIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PrinterIcon,
  EnvelopeIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

const StudentInvoicingClient = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const recentInvoices = [
    { id: 'INV-2026-9901', student: 'Aria Montgomery', grade: 'Grade 11-A', amount: 4500, status: 'Draft', date: 'Jan 15' },
    { id: 'INV-2026-9882', student: 'Liam Sterling', grade: 'Grade 09-C', amount: 3800, status: 'Published', date: 'Jan 14' },
    { id: 'INV-2026-9875', student: 'Sofia Chen', grade: 'Grade 11-A', amount: 4200, status: 'Published', date: 'Jan 14' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Revenue Generation</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Invoicing.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <AdjustmentsVerticalIcon className="h-4 w-4" /> Individual Adjustment
             </button>
             <button 
                onClick={() => setIsProcessing(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/40"
             >
                <BoltIcon className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} /> 
                {isProcessing ? 'Generating...' : 'Mass Generate Invoices'}
             </button>
          </div>
        </header>

        {/* Global Billing Status */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Unbilled Students', value: '1,240', icon: UserGroupIcon, color: 'text-amber-400' },
            { label: 'Draft Invoices', value: '42', icon: DocumentTextIcon, color: 'text-blue-400' },
            { label: 'Auto-Send Enabled', value: 'Yes', icon: EnvelopeIcon, color: 'text-emerald-400' },
            { label: 'Last Run', value: 'Jan 12', icon: ArrowPathIcon, color: 'text-slate-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Invoice Control Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden">
          <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative w-full md:w-96">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="text" 
                  placeholder="Filter by Student name or ID..." 
                  className="w-full bg-black/40 border border-slate-800 rounded-xl py-2 pl-12 pr-4 text-xs outline-none focus:border-emerald-500 transition-all"
                />
             </div>
             <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-white"><PrinterIcon className="h-5 w-5" /></button>
                <button className="p-2 text-slate-400 hover:text-white"><EnvelopeIcon className="h-5 w-5" /></button>
             </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                <th className="p-6">Invoice ID</th>
                <th className="p-6">Student & Grade</th>
                <th className="p-6">Amount</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                  <td className="p-6 text-xs font-mono text-slate-400">{inv.id}</td>
                  <td className="p-6">
                    <p className="text-sm font-bold text-white">{inv.student}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{inv.grade}</p>
                  </td>
                  <td className="p-6 text-sm font-black text-white">${inv.amount.toLocaleString()}</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                      inv.status === 'Draft' ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 bg-slate-800 hover:bg-emerald-600 text-white rounded-lg transition-all" title="Edit Adjustment">
                          <PencilSquareIcon className="h-4 w-4" />
                       </button>
                       <button className="px-4 py-2 bg-slate-800 hover:bg-white hover:text-black rounded-lg text-[10px] font-black uppercase transition-all">
                          View PDF
                       </button>
                    </div>
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

export default StudentInvoicingClient;