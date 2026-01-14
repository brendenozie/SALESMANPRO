"use client";

import React from "react";
import { 
  BanknotesIcon, 
  ReceiptPercentIcon, 
  CalculatorIcon, 
  PlusIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";

const FeeStructureClient = () => {
  const structures = [
    { id: 'FEE-2026-SR', grade: 'Senior Secondary', total: 4500, components: ['Tuition', 'Lab', 'Sports'], status: 'Active' },
    { id: 'FEE-2026-JR', grade: 'Junior Secondary', total: 3800, components: ['Tuition', 'Arts', 'Library'], status: 'Active' },
    { id: 'FEE-2026-PR', grade: 'Primary School', total: 2500, components: ['Tuition', 'Meals', 'Transport'], status: 'Draft' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Fiscal Configuration</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fee <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Architecture.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <ReceiptPercentIcon className="h-4 w-4" /> Discount Rules
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/40">
                <PlusIcon className="h-4 w-4 stroke-[3px]" /> Create Fee Group
             </button>
          </div>
        </header>

        {/* Financial Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Revenue</p>
            <h3 className="text-3xl font-black text-white mt-1">$842,000</h3>
            <p className="mt-4 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Academic Year 2026</p>
          </div>
          
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-b-4 border-b-emerald-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Fee Groups</p>
            <h3 className="text-3xl font-black text-white mt-1">14 Categories</h3>
            <p className="mt-4 text-[10px] text-slate-500 font-medium italic">Across 3 Campuses</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collection Rate Avg</p>
            <h3 className="text-3xl font-black text-white mt-1">92%</h3>
            <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[92%]" />
            </div>
          </div>
        </div>

        {/* Fee Structures Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {structures.map((fee) => (
            <div key={fee.id} className="group bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8 hover:bg-emerald-500/[0.02] hover:border-emerald-500/30 transition-all relative">
              <div className="flex justify-between items-start mb-8">
                 <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <BanknotesIcon className="h-6 w-6" />
                 </div>
                 <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                    fee.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                 }`}>
                    {fee.status}
                 </span>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-black text-white italic">{fee.grade}</h3>
                <p className="text-[10px] font-mono text-slate-600 mt-1 uppercase tracking-tighter">Reference: {fee.id}</p>
              </div>

              <div className="space-y-3 mb-8">
                {fee.components.map((comp, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-800/50">
                    <span className="text-xs text-slate-400">{comp}</span>
                    <span className="text-xs font-bold text-slate-200 tracking-tight">Included</span>
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between pt-6 border-t border-slate-800/50">
                 <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Per Student</p>
                    <p className="text-2xl font-black text-white italic">${fee.total.toLocaleString()}</p>
                 </div>
                 <button className="p-3 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl transition-all">
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                 </button>
              </div>
            </div>
          ))}

          {/* New Structure Placeholder */}
          <button className="border-2 border-dashed border-slate-800 rounded-[3rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all group">
            <div className="h-14 w-14 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 group-hover:text-emerald-500 transition-colors">
              <CalculatorIcon className="h-7 w-7" />
            </div>
            <p className="text-xs font-black uppercase text-slate-600 tracking-widest group-hover:text-slate-300">Add New Fee Tier</p>
          </button>
        </div>
      </div>
    </main>
  );
};

export default FeeStructureClient;