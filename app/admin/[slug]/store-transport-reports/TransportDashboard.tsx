"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  SignalIcon, ExclamationCircleIcon, BoltIcon,
  ClockIcon, ShieldCheckIcon 
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface DashboardProps {
  initialData: any;
  schoolId: string;
}

const TransportDashboard = ({ initialData, schoolId }: DashboardProps) => {
  const [data] = useState(initialData);

  // Helper for metrics fallback
  const metrics = data?.metrics || {
    activeBuses: "0/0",
    onTimeRate: "0%",
    avgFuel: "0.0",
    safetyIncidents: "0",
    healthRate: "0%"
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full -z-10 animate-pulse" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Data Sync</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fleet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Command Center.</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
            <ClockIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-mono font-bold">{format(new Date(), 'MMM dd, yyyy | hh:mm aa')}</span>
          </div>
        </header>

        {/* Top Tier Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Fleet', value: metrics.activeBuses, sub: 'Units currently dispatched', color: 'text-blue-400' },
            { label: 'On-Time Perf.', value: metrics.onTimeRate, sub: 'Daily trip accuracy', color: 'text-emerald-400' },
            { label: 'Avg Fuel Economy', value: `${metrics.avgFuel} km/L`, sub: 'Fleet-wide average', color: 'text-yellow-400' },
            { label: 'Safety Incidents', value: metrics.safetyIncidents, sub: 'Last 30 Days', color: 'text-indigo-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all shadow-xl">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h2 className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</h2>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Alerts Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-rose-500" />
                  Critical Status
                </h3>
                <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded">{data?.alerts?.length || 0} ACTIVE</span>
              </div>
              
              <div className="space-y-4">
                {data?.alerts?.map((alert: any, i: number) => (
                  <div key={i} className="p-4 bg-black/40 border border-slate-800 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-rose-500/30 transition-all">
                    <div>
                      <p className="text-xs font-black text-white">{alert.bus}</p>
                      <p className="text-[10px] text-rose-400 uppercase font-bold">{alert.issue}</p>
                    </div>
                    <SignalIcon className="h-4 w-4 text-slate-700 group-hover:text-rose-500" />
                  </div>
                ))}
                {(!data?.alerts || data.alerts.length === 0) && (
                  <p className="text-center text-xs text-slate-600 py-10 italic">No active fleet alerts</p>
                )}
              </div>
            </div>
          </div>

          {/* Efficiency & Health */}
          <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Utilization Trends</h3>
                <p className="text-xs text-slate-500 uppercase tracking-tighter">7-Day Fuel & Distance Correlation</p>
              </div>
            </div>

            {/* Bars */}
            <div className="relative h-64 w-full mt-10 flex items-end justify-between gap-4 px-4">
              {data?.efficiencyData?.map((h: number, i: number) => (
                <div key={i} className="relative flex-grow group">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg transition-all duration-500 hover:brightness-125" 
                    style={{ height: `${h}%` }}
                  />
                  <p className="mt-4 text-[10px] text-slate-600 text-center font-bold italic font-mono">D-{i+1}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <ShieldCheckIcon className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Fleet Health</p>
                  <p className="text-sm font-bold text-white">{metrics.healthRate} Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <BoltIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Energy Index</p>
                  <p className="text-sm font-bold text-white">Optimal Range</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TransportDashboard;