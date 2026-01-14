"use client";

import React from "react";
import { Toaster } from "react-hot-toast";
import { 
  SignalIcon, 
  ExclamationCircleIcon, 
  ChartBarIcon, 
  MapIcon, 
  BoltIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

const TransportDashboard = () => {
  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Background Pulse Effect */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full -z-10 animate-pulse" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">System Live</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fleet <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Command Center.</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
            <ClockIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-mono font-bold">Jan 14, 2026 | 07:45 AM</span>
          </div>
        </header>

        {/* Top Tier Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Buses', value: '14/18', sub: '4 in Reserve', color: 'text-blue-400' },
            { label: 'On-Time Perf.', value: '92%', sub: '+2% from Yesterday', color: 'text-emerald-400' },
            { label: 'Avg Fuel Economy', value: '8.4 km/L', sub: 'Target: 8.0 km/L', color: 'text-yellow-400' },
            { label: 'Safety Incidents', value: '0', sub: 'Last 30 Days', color: 'text-indigo-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h2 className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</h2>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Active Alerts & Delays */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <ExclamationCircleIcon className="h-5 w-5 text-rose-500" />
                  Active Alerts
                </h3>
                <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black rounded">3 CRITICAL</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { bus: 'BUS-202', issue: '15min Delay', route: 'Downtown', type: 'Traffic' },
                  { bus: 'BUS-105', issue: 'Fuel Low', route: 'West Loop', type: 'Hardware' },
                  { bus: 'VAN-03', issue: 'Route Deviation', route: 'Staff', type: 'Safety' },
                ].map((alert, i) => (
                  <div key={i} className="p-4 bg-black/40 border border-slate-800 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-rose-500/30 transition-all">
                    <div>
                      <p className="text-xs font-black text-white">{alert.bus}</p>
                      <p className="text-[10px] text-rose-400">{alert.issue} • {alert.type}</p>
                    </div>
                    <SignalIcon className="h-4 w-4 text-slate-700 group-hover:text-rose-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-[2rem] p-6">
              <h4 className="font-bold text-white mb-2">Smart Route Check</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Weather conditions on <span className="text-blue-400 italic">North Circuit</span> are worsening. Suggesting 10-minute early departure for afternoon shifts.
              </p>
            </div>
          </div>

          {/* Right: Fuel & Efficiency Charts */}
          <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white">Efficiency Metrics</h3>
                <p className="text-xs text-slate-500">Weekly Fleet Performance & Consumption</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-800 text-[10px] font-bold rounded-lg hover:bg-slate-700 transition-colors">7 DAYS</button>
                <button className="px-4 py-2 bg-blue-600 text-[10px] font-bold rounded-lg">30 DAYS</button>
              </div>
            </div>

            {/* Fuel Consumption Mock Chart */}
            <div className="relative h-64 w-full mt-10 flex items-end justify-between gap-4 px-4">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="w-full border-t border-slate-800/50" />
                ))}
              </div>
              
              {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} className="relative flex-grow group">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-lg transition-all duration-500 hover:brightness-125" 
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h}%
                  </div>
                  <p className="mt-4 text-[10px] text-slate-600 text-center font-bold">D-0{i+1}</p>
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
                  <p className="text-sm font-bold text-white">96% Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                  <BoltIcon className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Peak Demand</p>
                  <p className="text-sm font-bold text-white">07:30 - 08:15</p>
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