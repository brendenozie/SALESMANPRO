"use client";

import React, { useState } from "react";
import { 
  BanknotesIcon, 
  ReceiptPercentIcon, 
  ArrowDownTrayIcon, 
  CreditCardIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  CalculatorIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

const PayrollManagementClient = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const payrollData = [
    { id: 'PAY-771', staff: 'Dr. Alistair Cook', base: 4500, bonus: 500, tax: 600, net: 4400, status: 'Generated' },
    { id: 'PAY-772', staff: 'Sarah Jenkins', base: 3800, bonus: 200, tax: 450, net: 3550, status: 'Pending' },
    { id: 'PAY-773', staff: 'David Chen', base: 4200, bonus: 0, tax: 520, net: 3680, status: 'Generated' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-amber-500 rounded-full" />
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Financial Compliance</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Payroll <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Engine.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <CalculatorIcon className="h-4 w-4" /> Edit Salary Structure
             </button>
             <button 
               onClick={() => setIsProcessing(true)}
               className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-amber-900/40"
             >
                <ArrowDownTrayIcon className="h-4 w-4 stroke-[3px]" /> 
                {isProcessing ? 'Processing Batch...' : 'Run Monthly Payroll'}
             </button>
          </div>
        </header>

        {/* Financial Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Liability (Jan)</p>
                <h3 className="text-3xl font-black text-white mt-1">$142,500.00</h3>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
                   Approved by Board
                </div>
             </div>
             <BanknotesIcon className="h-24 w-24 absolute -right-6 -bottom-6 text-white/[0.03] rotate-12" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Statutory Deductions</p>
             <h3 className="text-3xl font-black text-rose-500 mt-1">$18,420.15</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium italic">Estimated Income Tax + Social Security</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-b-4 border-b-amber-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Disbursement Status</p>
             <h3 className="text-3xl font-black text-white mt-1">Pending</h3>
             <p className="mt-4 text-[10px] text-amber-500 font-bold uppercase animate-pulse">Schedule for: Jan 28th</p>
          </div>
        </div>

        {/* Payroll Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <DocumentCheckIcon className="h-5 w-5 text-amber-500" />
              January Disbursement Log
            </h3>
            <div className="flex gap-4">
               <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" /> 88 Paid
               </span>
               <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                  <div className="h-2 w-2 rounded-full bg-amber-500" /> 12 Pending
               </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Staff Member</th>
                  <th className="p-6">Gross Base</th>
                  <th className="p-6">Bonuses/Adj.</th>
                  <th className="p-6">Deductions</th>
                  <th className="p-6">Net Payable</th>
                  <th className="p-6 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {payrollData.map((row) => (
                  <tr key={row.id} className="group hover:bg-amber-500/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{row.staff}</p>
                      <p className="text-[10px] font-mono text-slate-600">{row.id}</p>
                    </td>
                    <td className="p-6 text-xs text-slate-400 font-mono">${row.base.toLocaleString()}</td>
                    <td className="p-6 text-xs text-emerald-500 font-mono">
                       {row.bonus > 0 ? `+$${row.bonus}` : '--'}
                    </td>
                    <td className="p-6 text-xs text-rose-500 font-mono">-${row.tax}</td>
                    <td className="p-6">
                      <p className="text-sm font-black text-white italic">${row.net.toLocaleString()}</p>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        row.status === 'Generated' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 bg-slate-800 hover:bg-white hover:text-black rounded-lg transition-all">
                        <ArrowDownTrayIcon className="h-4 w-4" />
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

export default PayrollManagementClient;