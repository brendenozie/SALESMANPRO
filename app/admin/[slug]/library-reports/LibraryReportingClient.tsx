"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  ChartBarIcon, 
  ArrowDownTrayIcon, 
  CalendarIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ArrowUpRightIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

const LibraryReportingClient = ({ initialStats, schoolId }: any) => {
  const [data, setData] = useState(initialStats);
  const [reportRange, setReportRange] = useState("Last 30 Days");

  const topCategories = [
    { name: 'Technology', count: 452, growth: '+12%' },
    { name: 'Philosophy', count: 284, growth: '+5%' },
    { name: 'Fiction', count: 890, growth: '+18%' },
  ];

  

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Analytics Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Data Insights</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Analytics.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-grow xl:w-48">
               <CalendarIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
               <select className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs appearance-none focus:ring-2 focus:ring-indigo-500/50 outline-none">
                  <option>Last 30 Days</option>
                  <option>Quarterly</option>
                  <option>Year to Date</option>
               </select>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-900/20">
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </header>

        {/* KPI Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
               <h2 className="text-2xl font-black text-white mt-1">{kpi.value}</h2>
            </div>
          ))}
        </div> */}

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800 rounded-3xl p-8">
             <h3 className="text-lg font-bold text-white mb-6">Popular Categories</h3>
             <div className="space-y-6">
               {data?.categories?.map((cat: any, i: number) => (
                 <div key={i}>
                   <div className="flex justify-between text-sm mb-2">
                     <span className="text-slate-300">{cat.name}</span>
                     <span className="text-indigo-400 font-bold">{cat.count} items</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full">
                     <div className="h-full bg-indigo-500" style={{ width: `${(cat.count / 100) * 100}%` }} />
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           {/* ... Utilization Charts ... */}
        </div>

        {/* High-Level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Circulation Rate', value: '78.4%', trend: '+4.2%', icon: ArrowTrendingUpIcon, color: 'text-emerald-400' },
            { label: 'Avg. Lending Time', value: '12 Days', trend: '-2 Days', icon: ChartBarIcon, color: 'text-indigo-400' },
            { label: 'Revenue Collected', value: '$2,450', trend: '+18%', icon: PresentationChartLineIcon, color: 'text-cyan-400' },
            { label: 'New Members', value: '142', trend: '+12%', icon: DocumentTextIcon, color: 'text-indigo-400' },
          ].map((kpi, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${kpi.color}`}>
                  {kpi.trend}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              <h2 className="text-2xl font-black text-white mt-1">{kpi.value}</h2>
            </div>
          ))}
        </div>

        {/* Reporting Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Module 1: Trending Categories */}
          <div className="lg:col-span-1 bg-slate-900/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6">Trending Categories</h3>
            <div className="space-y-6">
              {topCategories.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-300">{cat.name}</span>
                    <span className="text-xs text-indigo-400 font-bold">{cat.growth}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                      style={{ width: `${(cat.count / 1000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-10 w-full py-4 border border-dashed border-slate-700 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:text-white hover:border-slate-500 transition-all">
              View Detailed Breakdown
            </button>
          </div>

          {/* Module 2: System Health & Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-8">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-white">Resource Utilization</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Real-Time</span>
                  </div>
               </div>
               
               {/* Visual Placeholder for a Chart */}
               <div className="h-48 w-full flex items-end gap-2 px-2">
                 {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((val, i) => (
                   <div 
                    key={i} 
                    className="flex-grow bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t-lg transition-all cursor-pointer relative group"
                    style={{ height: `${val}%` }}
                   >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}%
                     </div>
                   </div>
                 ))}
               </div>
               <div className="flex justify-between mt-4 px-2">
                 <span className="text-[9px] font-bold text-slate-700 uppercase">Week 01</span>
                 <span className="text-[9px] font-bold text-slate-700 uppercase">Week 04</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-slate-800/40">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                      <FunnelIcon className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-sm">Fine Forecast</p>
                  </div>
                  <ArrowUpRightIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-all" />
               </div>
               <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-slate-800/40">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
                      <ChartBarIcon className="h-5 w-5" />
                    </div>
                    <p className="font-bold text-sm">Inventory Audit</p>
                  </div>
                  <ArrowUpRightIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-all" />
               </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default LibraryReportingClient;