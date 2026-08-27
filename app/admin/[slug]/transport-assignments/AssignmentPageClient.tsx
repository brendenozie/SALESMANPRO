"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  LinkIcon, 
  UserCircleIcon, 
  TruckIcon, 
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

const AssignmentPageClient = () => {
  const [assignments] = useState([
    { id: 'ASGN-701', driver: 'Robert Fox', vehicle: 'BUS-101', type: 'Bus', shift: 'Morning', status: 'Verified', expires: '08:30 PM' },
    { id: 'ASGN-702', driver: 'Jane Cooper', vehicle: 'BUS-202', type: 'Bus', shift: 'Full-Day', status: 'In Transit', expires: '05:00 PM' },
    { id: 'ASGN-705', driver: 'Cody Fisher', vehicle: 'VAN-05', type: 'Van', shift: 'Evening', status: 'Pending', expires: '11:00 PM' },
  ]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Structural Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Asset Pairing Hub</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Tactical <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">Assignments.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-bold text-sm transition-all shadow-lg shadow-indigo-900/40 active:scale-95">
            <LinkIcon className="h-5 w-5" />
            New Pairing
          </button>
        </header>

        {/* Search & Intelligence Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              placeholder="Search by Driver Name or Vehicle Plate..."
              className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-indigo-500/50 outline-none transition-all"
            />
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-1 flex items-center gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
            <p className="text-[10px] font-bold text-amber-200 leading-tight uppercase">
              2 Drivers unassigned <br/> for tomorrow's shift
            </p>
          </div>
        </div>

        {/* Assignment Grid */}
        <div className="grid grid-cols-1 gap-4">
          {assignments.map((asgn) => (
            <div key={asgn.id} className="group relative bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/40 transition-all">
              <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
                
                {/* Driver Block */}
                <div className="flex items-center gap-4 w-full xl:w-1/4">
                  <div className="h-14 w-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <UserCircleIcon className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Operator</p>
                    <h4 className="text-lg font-black text-white">{asgn.driver}</h4>
                  </div>
                </div>

                {/* Transition Icon */}
                <div className="hidden xl:flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                  <ArrowsRightLeftIcon className="h-5 w-5 text-indigo-500 group-hover:rotate-180 transition-transform duration-500" />
                </div>

                {/* Vehicle Block */}
                <div className="flex items-center gap-4 w-full xl:w-1/4">
                  <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <TruckIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Deployed Asset</p>
                    <h4 className="text-lg font-black text-white">{asgn.vehicle}</h4>
                    <span className="text-[10px] font-mono text-slate-600">{asgn.type} Unit</span>
                  </div>
                </div>

                {/* Shift & Compliance */}
                <div className="flex flex-wrap items-center gap-6 w-full xl:w-auto">
                  <div className="bg-black/40 px-4 py-2 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <ClockIcon className="h-4 w-4" />
                      {asgn.shift}
                    </div>
                    <p className="text-[9px] text-slate-600 mt-1 uppercase">Ends {asgn.expires}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      asgn.status === 'Verified' ? 'text-emerald-400' : 'text-indigo-400 animate-pulse'
                    }`}>
                      {asgn.status}
                    </span>
                  </div>

                  <button className="p-3 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-2xl transition-all">
                    Release Pairing
                  </button>
                </div>
              </div>

              {/* Unique ID Badge */}
              <div className="absolute top-2 right-6">
                <span className="text-[9px] font-mono text-slate-800 tracking-tighter">{asgn.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AssignmentPageClient;