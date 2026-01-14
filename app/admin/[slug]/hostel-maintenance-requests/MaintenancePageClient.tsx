"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  WrenchIcon, 
  LightBulbIcon, 
  BeakerIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

const MaintenancePageClient = () => {
  const [filter, setFilter] = useState('active');

  const tickets = [
    { id: 'TKT-1022', room: '103', category: 'Plumbing', issue: 'Leaking Faucet', priority: 'High', status: 'In Progress', time: '2h ago' },
    { id: 'TKT-1025', room: '402', category: 'Electrical', issue: 'AC not cooling', priority: 'Medium', status: 'Pending', time: '5h ago' },
    { id: 'TKT-1018', room: '210', category: 'Furniture', issue: 'Broken Chair Leg', priority: 'Low', status: 'Completed', time: '1d ago' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10" 
           style={{ backgroundImage: 'radial-gradient(#f97316 1px, transparent 0)', backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Facility Upkeep</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Tickets.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-[2rem] font-bold text-sm transition-all shadow-lg shadow-orange-900/40">
            <PlusIcon className="h-5 w-5 stroke-[3px]" />
            File New Request
          </button>
        </header>

        {/* Priority Filter Bar */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['All Tickets', 'Active', 'High Priority', 'Completed'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setFilter(tab.toLowerCase())}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                filter === tab.toLowerCase() ? 'bg-white text-black border-white' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:border-slate-600'
              }`}
            > {tab} </button>
          ))}
        </div>

        {/* Ticket List */}
        <div className="space-y-4">
          {tickets.map((tkt) => (
            <div key={tkt.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/40 transition-all border-l-4" 
                 style={{ borderLeftColor: tkt.priority === 'High' ? '#ef4444' : tkt.priority === 'Medium' ? '#f59e0b' : '#3b82f6' }}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* Identification */}
                <div className="flex items-center gap-6 w-full lg:w-1/3">
                  <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center text-orange-400">
                    {tkt.category === 'Plumbing' && <BeakerIcon className="h-7 w-7" />}
                    {tkt.category === 'Electrical' && <LightBulbIcon className="h-7 w-7" />}
                    {tkt.category === 'Furniture' && <WrenchIcon className="h-7 w-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-slate-500">{tkt.id}</span>
                      <span className="h-1 w-1 bg-slate-700 rounded-full" />
                      <span className="text-[10px] font-black text-orange-500 uppercase">Room {tkt.room}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-orange-200 transition-colors">{tkt.issue}</h4>
                  </div>
                </div>

                {/* Status Pills */}
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-xl border border-slate-800">
                    <ClockIcon className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-400 font-medium">{tkt.time}</span>
                  </div>

                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                    tkt.status === 'In Progress' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                    tkt.status === 'Pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {tkt.status === 'In Progress' ? <ClockIcon className="h-4 w-4 animate-spin-slow" /> : <CheckCircleIcon className="h-4 w-4" />}
                    <span className="text-xs font-black uppercase tracking-tighter">{tkt.status}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                  <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                  </button>
                  <button className="px-6 py-3 bg-slate-800 hover:bg-white hover:text-black text-white rounded-xl text-xs font-bold transition-all">
                    Assign Technician
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Diagnostic Insight Section */}
        <div className="mt-12 p-8 bg-gradient-to-br from-slate-900 to-black border border-slate-800 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500">
                 <ExclamationTriangleIcon className="h-10 w-10" />
              </div>
              <div>
                 <h4 className="text-xl font-bold text-white italic">Facility Health Warning</h4>
                 <p className="text-sm text-slate-500 max-w-md">The average resolution time for <span className="text-orange-400">Plumbing</span> has increased by 15% this week. Suggesting preventative pipe inspections in Wing B.</p>
              </div>
           </div>
           <button className="px-8 py-3 border border-orange-500/50 text-orange-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-orange-500 hover:text-white transition-all">
              Run Diagnostics
           </button>
        </div>
      </div>
    </main>
  );
};

export default MaintenancePageClient;