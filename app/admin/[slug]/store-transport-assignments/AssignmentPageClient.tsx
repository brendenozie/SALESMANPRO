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
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  MapIcon
} from "@heroicons/react/24/outline";

const AssignmentPageClient = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState([
    { id: 'ASGN-701', driver: 'Robert Fox', vehicle: 'BUS-101', type: 'Bus', shift: 'Morning', status: 'Verified', expires: '08:30 PM', license: 'CDL-A' },
    { id: 'ASGN-702', driver: 'Jane Cooper', vehicle: 'BUS-202', type: 'Bus', shift: 'Full-Day', status: 'In Transit', expires: '05:00 PM', license: 'CDL-B' },
    { id: 'ASGN-705', driver: 'Cody Fisher', vehicle: 'VAN-05', type: 'Van', shift: 'Evening', status: 'Pending', expires: '11:00 PM', license: 'Standard' },
  ]);

  const handleRelease = (id: string) => {
    toast.error(`Unpairing protocol initiated for ${id}`, {
      icon: '🔓',
      style: { background: '#1e1b4b', color: '#fff' }
    });
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <Toaster position="top-right" />
      
      {/* Structural Glow & Grid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-indigo-500 rounded-full" />
              <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Operational Readiness</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight italic">
              Tactical <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-blue-400 to-indigo-600">Assignments.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs uppercase tracking-widest">
               <MapIcon className="h-4 w-4" />
               Live View
            </button>
            <button className="group flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
              <PlusIcon className="h-5 w-5 stroke-[3px]" />
              Initialize Pairing
            </button>
          </div>
        </header>

        {/* Intelligence & Control Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <div className="lg:col-span-3 relative group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by driver, plate, or shift protocol..."
              className="w-full bg-slate-900/30 border border-slate-800/60 rounded-[1.5rem] py-5 pl-14 pr-6 text-sm focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600 backdrop-blur-sm"
            />
          </div>
          
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-[1.5rem] px-6 py-4 flex items-center gap-4 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Alert Matrix</p>
              <p className="text-[11px] font-bold text-amber-200/80 leading-tight">
                02 Critical Unassigned Shifts
              </p>
            </div>
          </div>
        </div>

        {/* Deployment Stack */}
        <div className="space-y-4">
          {assignments.map((asgn) => (
            <div 
              key={asgn.id} 
              className="group relative bg-[#0F1115]/60 border border-slate-800/60 rounded-[2.5rem] p-2 hover:border-indigo-500/40 transition-all duration-500"
            >
              <div className="bg-[#05070A]/40 rounded-[2.2rem] p-6 flex flex-col xl:flex-row items-center justify-between gap-8 transition-colors group-hover:bg-[#05070A]/20">
                
                {/* Operator Identity */}
                <div className="flex items-center gap-5 w-full xl:w-1/3">
                  <div className="relative">
                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-500/20 to-slate-800 rounded-[1.5rem] flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <UserCircleIcon className="h-10 w-10" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-indigo-600 rounded-lg border-2 border-[#05070A] flex items-center justify-center">
                        <ShieldCheckIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Designated Operator</p>
                    <h4 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors tracking-tight">{asgn.driver}</h4>
                    <p className="text-[10px] font-mono text-indigo-500/60 font-bold">{asgn.license} Verified</p>
                  </div>
                </div>

                {/* Connection Core */}
                <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100 transition-all duration-700">
                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Active Pairing</span>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                    <ArrowsRightLeftIcon className="h-6 w-6 text-indigo-400 rotate-90 xl:rotate-0 transition-transform duration-700 group-hover:scale-110" />
                </div>

                {/* Deployed Asset */}
                <div className="flex items-center gap-5 w-full xl:w-1/3 xl:justify-end text-right">
                  <div className="order-2 xl:order-1">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Assigned Asset</p>
                    <h4 className="text-xl font-black text-white tracking-tight">{asgn.vehicle}</h4>
                    <span className="inline-block px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded mt-1 border border-blue-500/20">
                        {asgn.type} Module
                    </span>
                  </div>
                  <div className="order-1 xl:order-2 h-16 w-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <TruckIcon className="h-8 w-8" />
                  </div>
                </div>

                {/* Protocol Actions */}
                <div className="flex items-center gap-4 w-full xl:w-auto pt-6 xl:pt-0 border-t xl:border-t-0 border-slate-800/50">
                  <div className="flex-1 xl:flex-none bg-slate-900/80 px-5 py-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <ClockIcon className="h-4 w-4 text-indigo-500" />
                      {asgn.shift} Shift
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1 font-bold">Protocol ends @ {asgn.expires}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleRelease(asgn.id)}
                      className="px-6 py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/20 active:scale-95"
                    >
                        Terminate
                    </button>
                    <button className="p-3.5 bg-slate-800/50 text-slate-500 hover:text-white rounded-2xl transition-colors border border-slate-800">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Unique ID Badge */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 xl:left-auto xl:right-10 xl:translate-x-0">
                <span className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                    REF: {asgn.id}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <footer className="mt-12 p-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex gap-10">
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Pairings</p>
                    <p className="text-xl font-black text-white">0{assignments.length}</p>
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Now</p>
                    <p className="text-xl font-black text-emerald-500">02</p>
                </div>
            </div>
            <p className="text-[10px] font-mono text-slate-600 uppercase">System Status: All protocols verified and compliant</p>
        </footer>
      </div>
    </main>
  );
};

export default AssignmentPageClient;