"use client";

import React, { useState } from "react";
import { 
  UserGroupIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  PhoneArrowUpRightIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  ChatBubbleLeftEllipsisIcon
} from "@heroicons/react/24/outline";

const HostelStaffClient = () => {
  const staff = [
    { id: 'STF-01', name: 'Commander Sarah', role: 'Head Warden', shift: 'Day (08:00 - 16:00)', status: 'On-Duty', contact: '+1 555-WARDEN', avatar: 'SW' },
    { id: 'STF-22', name: 'Officer Miller', role: 'Security', shift: 'Night (22:00 - 06:00)', status: 'Resting', contact: '+1 555-SEC-01', avatar: 'OM' },
    { id: 'STF-45', name: 'Elena Rodriguez', role: 'Cleaning Lead', shift: 'Mid (12:00 - 20:00)', status: 'On-Duty', contact: '+1 555-CLEAN', avatar: 'ER' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-violet-500 rounded-full" />
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">Personnel & Operations</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Duty <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">Roster.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
              <CalendarDaysIcon className="h-4 w-4" />
              Manage Schedule
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-violet-900/40">
              <IdentificationIcon className="h-4 w-4" />
              Onboard Staff
            </button>
          </div>
        </header>

        {/* Current Shift Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Warden Presence</p>
                <h3 className="text-3xl font-black text-white mt-1">02 / 03</h3>
              </div>
              <ShieldCheckIcon className="h-8 w-8 text-emerald-500/50" />
            </div>
            <p className="text-[10px] text-emerald-400 font-bold mt-4 uppercase">Minimum Safety Threshold Met</p>
          </div>
          
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Cleaners</p>
            <h3 className="text-3xl font-black text-white mt-1">08 Staff</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-4 uppercase tracking-tighter">Covering Wings A, B, & Common Area</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] border-b-4 border-b-violet-500/30">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Night Shift Handover</p>
            <h3 className="text-3xl font-black text-white mt-1">22:00</h3>
            <p className="text-[10px] text-violet-400 font-bold mt-4 uppercase animate-pulse italic">Pre-Shift Briefing in 15m</p>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/40 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg">
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">{member.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">{member.role}</span>
                       <span className="h-1 w-1 bg-slate-800 rounded-full" />
                       <span className="text-[10px] font-mono text-slate-600">{member.id}</span>
                    </div>
                  </div>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${member.status === 'On-Duty' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`} />
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-slate-800/50">
                  <ClockIcon className="h-4 w-4 text-slate-500" />
                  <p className="text-xs text-slate-300 font-medium">{member.shift}</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-slate-800/50">
                  <PhoneArrowUpRightIcon className="h-4 w-4 text-slate-500" />
                  <p className="text-xs font-mono text-slate-300 tracking-wider">{member.contact}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-grow py-3 bg-slate-800 hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2">
                  <ChatBubbleLeftEllipsisIcon className="h-4 w-4" /> Message
                </button>
                <button className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                  <IdentificationIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default HostelStaffClient;