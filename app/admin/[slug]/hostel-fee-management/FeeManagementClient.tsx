"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  ArrowPathIcon, 
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  FunnelIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";

const FeeManagementClient = () => {
  const [fees] = useState([
    { id: 'INV-2026-01', student: 'Marcus Holloway', room: '101', rent: 1200, mess: 450, total: 1650, status: 'Paid', date: 'Jan 05' },
    { id: 'INV-2026-02', student: 'Elena Fisher', room: '204', rent: 1000, mess: 450, total: 1450, status: 'Overdue', date: 'Jan 01' },
    { id: 'INV-2026-03', student: 'Arthur Morgan', room: '105', rent: 1200, mess: 450, total: 1650, status: 'Partial', date: 'Jan 08' },
  ]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Financial Operations</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fee <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Ledger.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              Monthly Audit
            </button>
            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/40">
              Collect Payment
            </button>
          </div>
        </header>

        {/* Revenue Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Revenue (Jan)</p>
            <h3 className="text-3xl font-black text-white mt-1">$42,850.00</h3>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
              <ArrowPathIcon className="h-3 w-3" /> Updated 5m ago
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Outstanding</p>
            <h3 className="text-3xl font-black text-rose-500 mt-1">$3,420.15</h3>
            <p className="mt-4 text-[10px] text-slate-500 font-medium">From 12 Residents</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2.5rem] relative overflow-hidden group">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collection Rate</p>
            <h3 className="text-3xl font-black text-white mt-1">92.4%</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%]" />
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5 text-emerald-400" />
              Resident Invoices
            </h3>
            <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
              <FunnelIcon className="h-4 w-4" /> Filter
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Resident / Invoice</th>
                  <th className="p-6">Hostel Rent</th>
                  <th className="p-6">Mess Bill</th>
                  <th className="p-6">Total Amount</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {fees.map((inv) => (
                  <tr key={inv.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{inv.student}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-600">{inv.id}</span>
                        <span className="h-1 w-1 bg-slate-800 rounded-full" />
                        <span className="text-[10px] text-slate-500">Room {inv.room}</span>
                      </div>
                    </td>
                    <td className="p-6 text-xs text-slate-400 font-mono">${inv.rent.toFixed(2)}</td>
                    <td className="p-6 text-xs text-slate-400 font-mono">${inv.mess.toFixed(2)}</td>
                    <td className="p-6">
                      <p className="text-sm font-black text-white">${inv.total.toFixed(2)}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Due: {inv.date}</p>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        inv.status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        inv.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {inv.status === 'Paid' ? <CheckBadgeIcon className="h-3 w-3" /> : <ExclamationCircleIcon className="h-3 w-3" />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 text-slate-600 hover:text-emerald-400 transition-colors">
                        <ArrowUpRightIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FeeManagementClient;