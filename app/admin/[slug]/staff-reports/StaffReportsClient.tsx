"use client";

import React, { useEffect, useState } from "react";
import { 
  ChartPieIcon, 
  ArrowTrendingUpIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  FunnelIcon,
  DocumentChartBarIcon
} from "@heroicons/react/24/outline";

const StaffReportsClient = ({ companyId }: { companyId: string }) => {

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await fetch(`/api/admin/reports?companyId=${companyId}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    };
    fetchAnalytics();
  }, [companyId]);

  const handleExport = () => {
    // Basic CSV Generator Logic
    const headers = "Department,Cost,StaffCount\n";
    const rows = data.departments.map((d: any) => `${d.dept},${d.raw},1`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `HR_Report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-cyan-500 font-black text-[10px] uppercase tracking-widest">Aggregating Institutional Data...</p>
      </div>
    </div>
  );


  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-cyan-500 rounded-full" />
              <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Workforce Intelligence</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              HR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Analytics.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold">
                <CalendarIcon className="h-4 w-4" /> Academic Year 2025-26
             </button>
             <button  onClick={handleExport} className="flex items-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-cyan-900/40">
                <ArrowDownTrayIcon className="h-4 w-4" /> Export Data
             </button>
          </div>
        </header>

        {/* Top-Level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard label="Retention Rate" value={`${data.metrics.retentionRate}%`} delta="+2%" icon={UserGroupIcon} color="text-emerald-400" />
          <KPICard label="Monthly Payroll" value={`$${(data.metrics.monthlyPayroll/1000).toFixed(1)}k`} delta="Nominal" icon={CurrencyDollarIcon} color="text-cyan-400" />
                    
          {[
            { label: 'Retention Rate', value: '91.4%', delta: '+2%', icon: UserGroupIcon, color: 'text-emerald-400' },
            { label: 'Monthly Payroll', value: '$142.5k', delta: 'Nominal', icon: CurrencyDollarIcon, color: 'text-cyan-400' },
            { label: 'Avg Attendance', value: '96.2%', delta: '-0.5%', icon: ChartPieIcon, color: 'text-blue-400' },
            { label: 'Diversity Index', value: '0.78', delta: '+0.1', icon: DocumentChartBarIcon, color: 'text-indigo-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] hover:border-cyan-500/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <span className={`text-[10px] font-black ${stat.delta.startsWith('+') ? 'text-emerald-400' : 'text-slate-500'}`}>{stat.delta}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1 italic">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Strategic Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Bar Chart mapping using data.departments */}
           <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
              <div className="h-64 flex items-end gap-6 px-4">
                {data.departments.map((item: any, i: number) => (
                  <div key={i} className="flex-grow flex flex-col items-center gap-3 group">
                     <div className="w-full bg-cyan-500/20 rounded-t-xl overflow-hidden h-full relative flex items-end">
                        <div 
                          className="w-full bg-cyan-500 group-hover:bg-cyan-400 transition-all" 
                          style={{ height: `${(item.val / Math.max(...data.departments.map((d:any)=>d.val))) * 100}%` }} 
                        />
                     </div>
                     <span className="text-[9px] font-bold text-slate-500 uppercase">{item.dept}</span>
                  </div>
                ))}
              </div>
           </div>
          
          {/* Departmental Cost Distribution */}
          <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-cyan-400" />
                  Departmental Cost Analysis
               </h3>
               <button className="text-[10px] text-slate-500 hover:text-cyan-400 font-bold uppercase tracking-tighter">View Detailed Ledger</button>
            </div>
            
            <div className="h-64 flex items-end gap-6 px-4">
               {[
                 { dept: 'Sci', val: 95, color: 'bg-cyan-500' },
                 { dept: 'Math', val: 70, color: 'bg-blue-500' },
                 { dept: 'IT', val: 85, color: 'bg-indigo-500' },
                 { dept: 'Admin', val: 60, color: 'bg-slate-700' },
                 { dept: 'Arts', val: 45, color: 'bg-blue-400' },
                 { dept: 'Sports', val: 30, color: 'bg-cyan-600' }
               ].map((item, i) => (
                 <div key={i} className="flex-grow flex flex-col items-center gap-3 group">
                    <div className="w-full relative">
                       <div 
                         className={`w-full ${item.color} rounded-t-xl group-hover:brightness-125 transition-all shadow-lg shadow-cyan-900/10`} 
                         style={{ height: `${item.val * 2}px` }} 
                       />
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[9px] font-black px-2 py-1 rounded">
                          ${(item.val * 1.5).toFixed(1)}k
                       </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase">{item.dept}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Diversity & Demographics */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <h3 className="text-sm font-black uppercase text-white tracking-widest mb-8">Staff Diversity</h3>
            <div className="space-y-10">
               {/* Gender Diversity */}
               <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-3">
                     <span>Gender Balance</span>
                     <span className="text-cyan-400">54% F / 46% M</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full flex overflow-hidden">
                     <div className="h-full bg-cyan-500" style={{ width: '54%' }} />
                     <div className="h-full bg-blue-700" style={{ width: '46%' }} />
                  </div>
               </div>

               {/* Employment Type */}
               <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contract Composition</p>
                  {[
                    { label: 'Permanent', val: 78, color: 'bg-emerald-500' },
                    { label: 'Contractual', val: 15, color: 'bg-amber-500' },
                    { label: 'Visiting', val: 7, color: 'bg-indigo-500' },
                  ].map((type, i) => (
                    <div key={i} className="flex items-center gap-4">
                       <div className={`h-2 w-2 rounded-full ${type.color}`} />
                       <span className="text-xs text-slate-400 font-medium flex-grow">{type.label}</span>
                       <span className="text-xs font-black text-white">{type.val}%</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="mt-10 p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-[2rem]">
               <p className="text-[10px] text-slate-400 leading-relaxed italic text-center">
                 "Faculty diversity has increased by 12% since Q1, aligning with institutional inclusion goals."
               </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default StaffReportsClient;

const KPICard = ({ label, value, delta, icon: Icon, color }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
    <div className="flex justify-between items-start mb-4">
      <Icon className={`h-6 w-6 ${color}`} />
      <span className="text-[10px] font-black text-emerald-400">{delta}</span>
    </div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-white mt-1 italic">{value}</h3>
  </div>
);