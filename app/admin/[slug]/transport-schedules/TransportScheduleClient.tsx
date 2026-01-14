"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  TruckIcon, 
  UserCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  PrinterIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const TransportScheduleClient = () => {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const shifts = [
    { id: 'S-001', route: 'North Circuit', time: '06:30 - 08:30', driver: 'Robert Fox', vehicle: 'BUS-101', status: 'In Progress' },
    { id: 'S-002', route: 'Downtown Exp', time: '07:00 - 09:00', driver: 'Jane Cooper', vehicle: 'BUS-202', status: 'Scheduled' },
    { id: 'S-003', route: 'Staff Shuttle', time: '08:00 - 09:30', driver: 'Cody Fisher', vehicle: 'VAN-05', status: 'Standby' },
    { id: 'S-004', route: 'North Circuit (PM)', time: '14:30 - 16:30', driver: 'Robert Fox', vehicle: 'BUS-101', status: 'Scheduled' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Schedule Grid Glow */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,_rgba(16,185,129,0.03)_0%,_transparent_40%)] -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">Temporal Coordination</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">Schedule.</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
              <button 
                onClick={() => setView('daily')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'daily' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              > Daily </button>
              <button 
                onClick={() => setView('weekly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'weekly' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              > Weekly </button>
            </div>
            <button className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
              <PrinterIcon className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-emerald-50 transition-all active:scale-95">
              <CalendarDaysIcon className="h-4 w-4" />
              Create Shift
            </button>
          </div>
        </header>

        {/* Date Navigator */}
        <div className="flex items-center justify-between mb-8 bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><ChevronLeftIcon className="h-4 w-4" /></button>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Wednesday, Jan 14, 2026</h2>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><ChevronRightIcon className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filters Applied: 0</span>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
            <div className="col-span-3">Route Detail</div>
            <div className="col-span-2 text-center">Time Slot</div>
            <div className="col-span-2">Pilot</div>
            <div className="col-span-2">Vehicle</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Edit</div>
          </div>

          {shifts.map((shift) => (
            <div key={shift.id} className="grid grid-cols-12 items-center p-6 bg-slate-900/20 border border-slate-800/60 rounded-3xl hover:bg-slate-800/40 transition-all group">
              {/* Route */}
              <div className="col-span-3">
                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{shift.route}</p>
                <p className="text-[10px] font-mono text-slate-500">{shift.id}</p>
              </div>

              {/* Time */}
              <div className="col-span-2 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 rounded-lg border border-slate-800">
                  <ClockIcon className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs font-mono text-slate-300">{shift.time}</span>
                </div>
              </div>

              {/* Pilot */}
              <div className="col-span-2 flex items-center gap-3">
                <UserCircleIcon className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-300">{shift.driver}</span>
              </div>

              {/* Vehicle */}
              <div className="col-span-2 flex items-center gap-3">
                <TruckIcon className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-mono text-slate-300">{shift.vehicle}</span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                  shift.status === 'In Progress' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                  shift.status === 'Scheduled' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  <span className={`h-1 w-1 rounded-full ${shift.status === 'In Progress' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                  {shift.status}
                </span>
              </div>

              {/* Edit */}
              <div className="col-span-1 text-right">
                <button className="p-2 text-slate-600 hover:text-white transition-colors">
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default TransportScheduleClient;