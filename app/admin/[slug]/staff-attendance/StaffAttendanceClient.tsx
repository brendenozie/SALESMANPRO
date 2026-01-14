"use client";

import React, { useState } from "react";
import { 
  ClockIcon, 
  MapPinIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon,
  FingerPrintIcon,
  ArrowPathIcon,
  CalendarIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";

const StaffAttendanceClient = () => {
  const [view, setView] = useState("Daily");

  const attendanceSummary = [
    { id: 'EMP-101', name: 'Dr. Cook', checkIn: '07:45 AM', checkOut: '--:--', status: 'Present', mode: 'Biometric' },
    { id: 'EMP-205', name: 'Sarah J.', checkIn: '08:15 AM', checkOut: '--:--', status: 'Late', mode: 'Mobile GPS' },
    { id: 'EMP-312', name: 'Robert Fox', checkIn: '--:--', checkOut: '--:--', status: 'Absent', mode: 'N/A' },
    { id: 'EMP-088', name: 'Marcus V.', checkIn: '07:30 AM', checkOut: '04:00 PM', status: 'Completed', mode: 'RFID' },
  ];

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

        {/* Real-time Status KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Present Now</p>
            <h3 className="text-3xl font-black text-white mt-1">112</h3>
            <p className="text-[9px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
              <CheckCircleIcon className="h-3 w-3" /> 92% of Total Staff
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-amber-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Late Arrivals</p>
            <h3 className="text-3xl font-black text-white mt-1">08</h3>
            <p className="text-[9px] text-amber-500 font-bold mt-2 uppercase tracking-tighter italic animate-pulse">Attention Required</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-l-4 border-l-rose-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Absent</p>
            <h3 className="text-3xl font-black text-white mt-1">04</h3>
            <p className="text-[9px] text-slate-500 font-bold mt-2">Approved Leaves: 03</p>
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
            <button className="text-xs text-slate-500 hover:text-white flex items-center gap-1">
              <ArrowPathIcon className="h-4 w-4" /> Refresh Data
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
                {attendanceSummary.map((log) => (
                  <tr key={log.id} className="group hover:bg-lime-500/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">{log.name}</p>
                      <p className="text-[10px] font-mono text-slate-600">{log.id}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {log.mode === 'Biometric' ? <FingerPrintIcon className="h-4 w-4 text-blue-400" /> : <MapPinIcon className="h-4 w-4 text-slate-500" />}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.mode}</span>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-xs text-slate-400">{log.checkIn}</td>
                    <td className="p-6 font-mono text-xs text-slate-400">{log.checkOut}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        log.status === 'Present' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        log.status === 'Late' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        log.status === 'Absent' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
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
    </main>
  );
};

export default StaffAttendanceClient;