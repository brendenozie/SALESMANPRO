"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  BeakerIcon, 
  CurrencyDollarIcon, 
  TruckIcon, 
  ChartBarIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  BoltIcon,
  ArrowTrendingDownIcon
} from "@heroicons/react/24/outline";

const FuelLogsClient = () => {
  const [logs] = useState([
    { id: 'FL-440', date: '2026-01-14', vehicle: 'BUS-101', volume: '85.5L', cost: 145.35, station: 'Shell Central', odometer: '12,450 km' },
    { id: 'FL-439', date: '2026-01-13', vehicle: 'BUS-202', volume: '110.0L', cost: 187.00, station: 'City Gas Hub', odometer: '44,890 km' },
    { id: 'FL-438', date: '2026-01-12', vehicle: 'VAN-05', volume: '40.2L', cost: 68.34, station: 'Shell Central', odometer: '8,210 km' },
  ]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Fuel Gradient Background */}
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-400 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Resource Consumption</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fuel <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Intelligence.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all font-bold text-xs">
              <DocumentArrowDownIcon className="h-4 w-4" />
              Download Report
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/40">
              <BeakerIcon className="h-4 w-4" />
              Log Refuel
            </button>
          </div>
        </header>

        {/* Consumption Efficiency Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Avg. Price/Litre</p>
              <h3 className="text-2xl font-black text-white mt-1">$1.70</h3>
              <div className="flex items-center gap-1 text-emerald-400 text-[10px] mt-2 font-bold">
                <ArrowTrendingDownIcon className="h-3 w-3" />
                2.4% vs last month
              </div>
            </div>
            <BoltIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Volume (30d)</p>
              <h3 className="text-2xl font-black text-white mt-1">2,450.8 Liters</h3>
              <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-tighter italic">Fleet Wide consumption</p>
            </div>
            <ChartBarIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors" />
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Total Expenditure</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">$4,166.36</h3>
              <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase">Settled Invoices</p>
            </div>
            <CurrencyDollarIcon className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors" />
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-emerald-400" />
              Recent Refueling Entries
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Live Sync Active</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Timestamp</th>
                  <th className="p-6">Vehicle</th>
                  <th className="p-6">Station / Vendor</th>
                  <th className="p-6">Odometer</th>
                  <th className="p-6">Quantity</th>
                  <th className="p-6 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <p className="text-xs text-slate-300 font-medium">{log.date}</p>
                      <p className="text-[9px] font-mono text-slate-600 mt-0.5">{log.id}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <TruckIcon className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-bold text-white">{log.vehicle}</span>
                      </div>
                    </td>
                    <td className="p-6 text-xs text-slate-400">{log.station}</td>
                    <td className="p-6 font-mono text-xs text-slate-500">{log.odometer}</td>
                    <td className="p-6">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-black rounded-lg border border-emerald-500/20">
                        {log.volume}
                      </span>
                    </td>
                    <td className="p-6 text-right font-black text-sm text-white">
                      ${log.cost.toFixed(2)}
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

export default FuelLogsClient;