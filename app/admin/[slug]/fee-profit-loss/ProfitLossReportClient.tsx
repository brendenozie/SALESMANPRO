"use client";

import React from "react";
import { 
  PresentationChartLineIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  ScaleIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CircleStackIcon,
  BriefcaseIcon
} from "@heroicons/react/24/outline";

const ProfitLossReportClient = () => {
  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-amber-500 rounded-full" />
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Fiscal Intelligence</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              P&L <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Statement.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold">
                <CalendarIcon className="h-4 w-4" /> Jan - Dec 2026
             </button>
             <button className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg">
                <DocumentArrowDownIcon className="h-4 w-4" /> Export for Board
             </button>
          </div>
        </header>

        {/* The Big Picture: Net Position */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Total Net Surplus</p>
                <h2 className="text-6xl font-black text-white italic">$248,400.00</h2>
                <div className="flex items-center gap-2 mt-6 text-emerald-400 font-bold text-sm">
                   <ArrowTrendingUpIcon className="h-5 w-5" /> 
                   <span>+18.4% Net Margin Improvement</span>
                </div>
             </div>
             <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                <ScaleIcon className="h-40 w-40 text-amber-500" />
             </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] flex flex-col justify-center">
             <div className="mb-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Income</p>
                <p className="text-2xl font-bold text-emerald-400">$842,000</p>
             </div>
             <div className="h-[1px] w-full bg-slate-800 mb-6" />
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Expenses</p>
                <p className="text-2xl font-bold text-rose-500">($593,600)</p>
             </div>
          </div>
        </div>

        {/* Detailed Reconcilliation */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Revenue Breakdown */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <h3 className="text-sm font-black uppercase text-white tracking-widest mb-8 flex items-center gap-2">
               <CircleStackIcon className="h-5 w-5 text-emerald-500" /> Revenue Sources
            </h3>
            <div className="space-y-6">
               {[
                 { label: 'Tuition Fees', value: '$620,000', percent: 74 },
                 { label: 'Transport Services', value: '$112,000', percent: 13 },
                 { label: 'Hostel & Boarding', value: '$85,000', percent: 10 },
                 { label: 'Lab & Activity Fees', value: '$25,000', percent: 3 },
               ].map((item, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                       <span>{item.label}</span>
                       <span>{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full">
                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <h3 className="text-sm font-black uppercase text-white tracking-widest mb-8 flex items-center gap-2">
               <BriefcaseIcon className="h-5 w-5 text-rose-500" /> Operational Outflow
            </h3>
            <div className="space-y-6">
               {[
                 { label: 'Staff Salaries', value: '$410,000', percent: 69 },
                 { label: 'Facility Maintenance', value: '$92,000', percent: 15 },
                 { label: 'Utilities & Power', value: '$48,000', percent: 8 },
                 { label: 'Procurement (Stock)', value: '$43,600', percent: 8 },
               ].map((item, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
                       <span>{item.label}</span>
                       <span>{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full">
                       <div className="h-full bg-rose-500 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default ProfitLossReportClient;