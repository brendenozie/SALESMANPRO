"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  UserCircleIcon, 
  MagnifyingGlassIcon, 
  PhoneIcon, 
  ShieldCheckIcon, 
  MapPinIcon,
  IdentificationIcon,
  FunnelIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

const ResidentsPageClient = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const residents = [
    { id: 'STU-4401', name: 'Marcus Holloway', room: '101', grade: '12th', bloodGroup: 'O+', parent: 'John Holloway', phone: '+1 555-0234', status: 'In-House' },
    { id: 'STU-3922', name: 'Elena Fisher', room: '204', grade: '10th', bloodGroup: 'A-', parent: 'Sarah Fisher', phone: '+1 555-9981', status: 'On-Leave' },
    { id: 'STU-4105', name: 'Arthur Morgan', room: '105', grade: '11th', bloodGroup: 'B+', parent: 'Mary Morgan', phone: '+1 555-7762', status: 'In-House' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-purple-500 rounded-full" />
              <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">Occupancy Ledger</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Resident <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Directory.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-80">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search name, room, or ID..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-purple-500 outline-none transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Resident Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {residents.map((resident) => (
            <div key={resident.id} className="group bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/50 hover:border-purple-500/30 transition-all relative overflow-hidden">
              
              {/* Profile Top Section */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-slate-800 rounded-[1.5rem] flex items-center justify-center border border-slate-700 group-hover:border-purple-500/50 transition-colors">
                    <UserCircleIcon className="h-10 w-10 text-slate-500 group-hover:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{resident.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[9px] font-black rounded uppercase">{resident.id}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Grade {resident.grade}</span>
                    </div>
                  </div>
                </div>
                <button className="text-slate-600 hover:text-white transition-colors">
                  <EllipsisVerticalIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Status & Location Info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/40 rounded-2xl p-4 border border-slate-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPinIcon className="h-3.5 w-3.5 text-purple-500" />
                    <p className="text-[9px] font-bold text-slate-600 uppercase">Assigned Room</p>
                  </div>
                  <p className="text-lg font-black text-white italic">Room {resident.room}</p>
                </div>
                <div className="bg-black/40 rounded-2xl p-4 border border-slate-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                    <p className="text-[9px] font-bold text-slate-600 uppercase">Status</p>
                  </div>
                  <p className={`text-sm font-bold ${resident.status === 'In-House' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {resident.status}
                  </p>
                </div>
              </div>

              {/* Emergency / Contact Footer */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-2">
                    <IdentificationIcon className="h-4 w-4" />
                    Parent: {resident.parent}
                  </span>
                  <span className="text-rose-400 font-black">{resident.bloodGroup}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-grow flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-purple-600 rounded-xl text-xs font-bold transition-all">
                    <PhoneIcon className="h-4 w-4" />
                    Emergency Call
                  </button>
                </div>
              </div>

              {/* Background ID Decoration */}
              <span className="absolute -bottom-4 -right-2 text-6xl font-black text-white/[0.02] pointer-events-none select-none italic">
                {resident.room}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default ResidentsPageClient;