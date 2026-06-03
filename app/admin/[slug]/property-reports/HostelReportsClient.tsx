"use client";

import React, { useEffect, useState } from "react";
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  WrenchScrewdriverIcon, 
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";


const HostelReportsClient = ({ schoolId }: { schoolId: string }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/property/analytics?companyId=${schoolId}`)
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      });
  }, [schoolId]);

  const handleExport = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Occupancy,${data.occupancy}\n`
      + `MTTR,${data.mttr}\n`
      + `Visitors,${data.visitors}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hostel_report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success("Report Exported");
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500">Calculating Intelligence...</div>;

  const kpis = [
    { label: 'Avg Occupancy', value: data?.occupancy, delta: '+2.1%', icon: UsersIcon, color: 'text-indigo-400' },
    { label: 'Revenue Target', value: data?.revenue, delta: '98%', icon: CurrencyDollarIcon, color: 'text-emerald-400' },
    { label: 'MTTR (Repair Time)', value: data?.mttr, delta: '-12%', icon: WrenchScrewdriverIcon, color: 'text-rose-400' },
    { label: 'Visitor Volume', value: data?.visitors, delta: 'Weekly', icon: ChartBarIcon, color: 'text-blue-400' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Data & Intelligence</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Hostel <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Analytics.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all text-xs font-bold">
                <CalendarDaysIcon className="h-4 w-4" /> Last 30 Days
             </button>
             <button onClick={handleExport}  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-indigo-900/40">
                <ArrowDownTrayIcon className="h-4 w-4" /> Export Report
             </button>
          </div>
        </header>

        {/* Top-Level KPIs */}
        {/* Top-Level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {kpis.map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] group hover:border-indigo-500/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <span className="text-[10px] font-black text-slate-500">{stat.delta}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1 italic">{stat.value}</h3>
            </div>
          ))}
        </div>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Avg Occupancy', value: '94.2%', delta: '+2.1%', icon: UsersIcon, color: 'text-indigo-400' },
            { label: 'Revenue Target', value: '$84.5k', delta: '98%', icon: CurrencyDollarIcon, color: 'text-emerald-400' },
            { label: 'MTTR (Repair Time)', value: '4.2 hrs', delta: '-12%', icon: WrenchScrewdriverIcon, color: 'text-rose-400' },
            { label: 'Visitor Volume', value: '142', delta: 'Weekly', icon: ChartBarIcon, color: 'text-blue-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] group hover:border-indigo-500/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                <span className="text-[10px] font-black text-slate-500">{stat.delta}</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1 italic">{stat.value}</h3>
            </div>
          ))}
        </div> */}

        {/* Detailed Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Fee Collection Trend */}
          <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400" />
                  Monthly Fee Realization
               </h3>
               <div className="flex gap-2">
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" /><span className="text-[9px] text-slate-500 font-bold uppercase">Expected</span></div>
                  <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[9px] text-slate-500 font-bold uppercase">Collected</span></div>
               </div>
            </div>
            
            <div className="h-64 flex items-end gap-4 px-2">
               {[60, 45, 90, 75, 85, 95, 100].map((h, i) => (
                 <div key={i} className="flex-grow flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end gap-1 h-full">
                       <div className="flex-grow bg-indigo-500/20 rounded-t-md group-hover:bg-indigo-500/40 transition-all" style={{ height: '100%' }} />
                       <div className="flex-grow bg-emerald-500 rounded-t-md shadow-[0_0_15px_rgba(16,185,129,0.2)]" style={{ height: `${h}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-600">Week {i+1}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Occupancy Breakdown by Wing */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <h3 className="text-sm font-black uppercase text-white tracking-widest mb-8">Live Wing Distribution</h3>
            <div className="space-y-8">
                {data?.wingData.map((wing: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-3">
                       <span className="text-slate-400 uppercase tracking-tighter">{wing.label}</span>
                       <span className="text-white">{wing.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className={`h-full ${wing.color} rounded-full transition-all duration-1000`} style={{ width: `${wing.val}%` }} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <h3 className="text-sm font-black uppercase text-white tracking-widest mb-8">Wing Distribution</h3>
            <div className="space-y-8">
               {[
                 { label: 'North Wing (Boys)', val: 98, color: 'bg-indigo-500' },
                 { label: 'South Wing (Girls)', val: 92, color: 'bg-violet-500' },
                 { label: 'Executive Suite', val: 45, color: 'bg-slate-700' },
               ].map((wing, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-3">
                       <span className="text-slate-400 uppercase tracking-tighter">{wing.label}</span>
                       <span className="text-white">{wing.val}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className={`h-full ${wing.color} rounded-full`} style={{ width: `${wing.val}%` }} />
                    </div>
                 </div>
               ))}
            </div>
            <div className="mt-12 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
               <p className="text-[10px] text-slate-400 leading-relaxed italic">
                 "North Wing is reaching capacity. Suggest re-allocating 10 beds from Executive for the upcoming semester."
               </p>
            </div>
          </div> */}

        </div>
      </div>
    </main>
  );
};

export default HostelReportsClient;