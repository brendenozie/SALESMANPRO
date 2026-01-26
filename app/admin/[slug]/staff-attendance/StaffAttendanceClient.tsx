"use client";

import React, { useState, useEffect } from "react";
import { 
  ClockIcon, MapPinIcon, CheckCircleIcon, FingerPrintIcon,
  ArrowPathIcon, ArrowUpRightIcon
} from "@heroicons/react/24/outline";
import ManualClockModal from "./ManualClockModal";

const StaffAttendanceClient = ({ initialData, companyId }: any) => {
  const [view, setView] = useState("Daily");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [logs, setLogs] = useState(initialData?.logs || []);
  const [stats, setStats] = useState(initialData?.stats || { present: 0, late: 0, absent: 0, total: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/attendance?companyId=${companyId}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-lime-500 rounded-full" />
              <span className="text-lime-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Presence Tracking</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Attendance <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">Intelligence.</span>
            </h1>
          </div>

          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
            {['Daily', 'Weekly', 'Monthly'].map(period => (
              <button 
                key={period}
                onClick={() => setView(period)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === period ? 'bg-lime-600 text-white' : 'text-slate-500 hover:text-white'}`}
              > {period} </button>
            ))}
          </div>
        </header>

        <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all border border-slate-700"
            >
              Manual Entry
            </button>
        </div>

        {/* Real-time Status KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Present Now</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.present}</h3>
            <p className="text-[9px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" /> {Math.round((stats.present / stats.total) * 100) || 0}% of Total Staff
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-amber-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Late Arrivals</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.late.toString().padStart(2, '0')}</h3>
            <p className="text-[9px] text-amber-500 font-bold mt-2 uppercase tracking-tighter italic animate-pulse">Attention Required</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-rose-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Absent</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.absent.toString().padStart(2, '0')}</h3>
            <p className="text-[9px] text-slate-500 font-bold mt-2">Check Leave Requests</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Clock-in</p>
            <h3 className="text-3xl font-black text-white mt-1">07:42 AM</h3>
            <p className="text-[9px] text-blue-400 font-bold mt-2">Target: 08:00 AM</p>
          </div>
        </div>

        {/* Live Logs Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-lime-500 animate-ping" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Attendance Log</h3>
            </div>
            <button 
              onClick={refreshData}
              disabled={refreshing}
              className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 
              {refreshing ? "Updating..." : "Refresh Data"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Staff Member</th>
                  <th className="p-6">Method</th>
                  <th className="p-6">Check In</th>
                  <th className="p-6">Check Out</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {logs.length === 0 ? (
                    <tr><td colSpan={6} className="p-20 text-center text-slate-500 text-xs italic">No activity recorded for today.</td></tr>
                ) : logs.map((log: any) => (
                  <tr key={log.id} className="group hover:bg-lime-500/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{log.user?.name}</p>
                      <p className="text-[10px] font-mono text-slate-600">{log.id.substring(0, 8)}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {log.method === 'BIOMETRIC' ? <FingerPrintIcon className="h-4 w-4 text-blue-400" /> : <MapPinIcon className="h-4 w-4 text-slate-500" />}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.method}</span>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-xs text-slate-400">{log.checkInTime || "--:--"}</td>
                    <td className="p-6 font-mono text-xs text-slate-400">{log.checkOutTime || "--:--"}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        log.status === 'PRESENT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        log.status === 'LATE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 text-slate-600 hover:text-lime-400 transition-colors">
                        <ArrowUpRightIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ManualClockModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
        companyId={companyId}
        onSuccess={refreshData} // Automatically reloads table after entry
      />
      
    </main>
  );
};

export default StaffAttendanceClient;