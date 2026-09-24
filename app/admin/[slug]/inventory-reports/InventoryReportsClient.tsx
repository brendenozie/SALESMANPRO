"use client";

import React from "react";
import { 
  PresentationChartBarIcon, 
  TrashIcon, 
  ScaleIcon, 
  ArrowDownTrayIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  CircleStackIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface Props {
  initialKpis?: any[];
  schoolId?: string;
}

const InventoryReportsClient = ({ initialKpis, schoolId }: Props) => {
  const kpis = initialKpis || [
    { label: 'Total Asset Value', value: '$0', delta: 'Nominal', icon: ScaleIcon, color: 'text-amber-400' },
    { label: 'Stock Items Managed', value: '0', delta: 'Current', icon: ArrowTrendingUpIcon, color: 'text-emerald-400' },
    { label: 'Maintenance Ratio', value: '0%', delta: 'Optimal', icon: TrashIcon, color: 'text-rose-400' },
    { label: 'Audit Verification', value: '100%', delta: 'Verified', icon: CircleStackIcon, color: 'text-blue-400' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-amber-500 rounded-full" />
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Logistics Intelligence</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Inventory <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Insights.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold">
                <CalendarIcon className="h-4 w-4" /> Fiscal Year 2026
             </button>
             <button className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-amber-900/40">
                <ArrowDownTrayIcon className="h-4 w-4" /> Download Audit PDF
             </button>
          </div>
        </header>

        {/* Global Asset KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {kpis.map((stat: any, i: number) => {
            const Icon = stat.icon || ScaleIcon;
            return (
              <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] hover:border-amber-500/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Icon className={`h-6 w-6 ${stat.color || "text-amber-400"}`} />
                  <span className={`text-[10px] font-black ${stat.delta?.startsWith?.('+') ? 'text-emerald-400' : 'text-slate-500'}`}>{stat.delta}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
              </div>
            );
          })}
        </div>

        {/* Analytical Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Stock Consumption & Turnover */}
          <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <PresentationChartBarIcon className="h-4 w-4 text-amber-500" />
                  Consumption Velocity by Category
               </h3>
               <div className="flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Monthly Avg</span>
               </div>
            </div>
            
            <div className="space-y-8">
               {[
                 { label: 'IT Consumables', usage: 88, turnover: '4.1x' },
                 { label: 'Lab Chemicals', usage: 62, turnover: '2.5x' },
                 { label: 'Office Stationery', usage: 45, turnover: '1.8x' },
                 { label: 'Sports Equipment', usage: 20, turnover: '0.9x' },
               ].map((row, i) => (
                 <div key={i} className="group">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-xs font-bold text-slate-300">{row.label}</span>
                       <span className="text-[10px] font-black text-amber-500 uppercase">Turnover: {row.turnover}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 group-hover:brightness-125 transition-all" style={{ width: `${row.usage}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Wastage & Loss Analysis */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <h3 className="text-sm font-black uppercase text-white tracking-widest mb-8 flex items-center gap-2">
               <ExclamationTriangleIcon className="h-4 w-4 text-rose-500" />
               Loss & Wastage
            </h3>
            <div className="space-y-6">
               <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Major Loss Event</p>
                  <p className="text-sm font-bold text-white mt-1 italic">Chemical Leakage (Lab 3)</p>
                  <p className="text-xs text-rose-400 mt-2">-$450.00 Estimated Value</p>
               </div>

               <div className="pt-4 border-t border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Wastage Reasons</p>
                  <div className="flex flex-col gap-3">
                     {[
                       { reason: 'Expired Chemicals', val: '65%', color: 'bg-rose-500' },
                       { reason: 'Damage in Handling', val: '25%', color: 'bg-orange-500' },
                       { reason: 'Theft/Unaccounted', val: '10%', color: 'bg-slate-600' },
                     ].map((item, i) => (
                       <div key={i} className="flex items-center gap-3">
                          <div className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                          <span className="text-[11px] text-slate-400 flex-grow">{item.reason}</span>
                          <span className="text-[11px] font-black text-white">{item.val}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default InventoryReportsClient;