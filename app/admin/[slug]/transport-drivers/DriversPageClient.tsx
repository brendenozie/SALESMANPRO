"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  UserCircleIcon, 
  IdentificationIcon, 
  StarIcon, 
  PhoneIcon,
  ClockIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";

const DriversPageClient = () => {
  const [search, setSearch] = useState("");

  const drivers = [
    { 
      id: 'DRV-001', 
      name: 'Robert Fox', 
      license: 'Class A-Full', 
      rating: 4.9, 
      status: 'On Route', 
      experience: '8 Years', 
      expiry: '2028-05-12',
      contact: '+1 555-0102'
    },
    { 
      id: 'DRV-002', 
      name: 'Jane Cooper', 
      license: 'Class B-Sch', 
      rating: 4.7, 
      status: 'Available', 
      experience: '12 Years', 
      expiry: '2026-11-20',
      contact: '+1 555-0199'
    },
    { 
      id: 'DRV-003', 
      name: 'Cody Fisher', 
      license: 'Class A-Full', 
      rating: 5.0, 
      status: 'Off Duty', 
      experience: '5 Years', 
      expiry: '2027-02-15',
      contact: '+1 555-0144'
    },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-yellow-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-yellow-500 rounded-full" />
              <span className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em]">Personnel Registry</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fleet <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Pilots.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-6 py-3.5 bg-white text-black rounded-2xl font-bold text-xs hover:bg-yellow-50 transition-all active:scale-95 shadow-xl shadow-white/5">
            <IdentificationIcon className="h-5 w-5" />
            Register New Driver
          </button>
        </header>

        {/* Driver Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <div key={driver.id} className="group bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/60 transition-all relative overflow-hidden">
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 text-slate-500 group-hover:text-yellow-400 transition-colors">
                    <UserCircleIcon className="h-10 w-10" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-yellow-200 transition-colors">{driver.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{driver.id}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                  driver.status === 'On Route' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                  driver.status === 'Available' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {driver.status}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/30 rounded-2xl p-3 border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Safety Rating</p>
                  <div className="flex items-center gap-1.5 text-sm font-black text-yellow-500">
                    <StarIcon className="h-4 w-4 fill-yellow-500" />
                    {driver.rating}
                  </div>
                </div>
                <div className="bg-black/30 rounded-2xl p-3 border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Experience</p>
                  <div className="flex items-center gap-1.5 text-sm font-black text-slate-200">
                    <ShieldCheckIcon className="h-4 w-4 text-blue-400" />
                    {driver.experience}
                  </div>
                </div>
              </div>

              {/* Certification Info */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-2">
                    <DocumentCheckIcon className="h-4 w-4 text-slate-600" />
                    License: {driver.license}
                  </span>
                  <span className={`font-mono text-[10px] ${new Date(driver.expiry) < new Date() ? 'text-rose-500' : 'text-slate-500'}`}>
                    Exp: {driver.expiry}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <PhoneIcon className="h-4 w-4 text-slate-600" />
                  {driver.contact}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-grow py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">
                  View Schedule
                </button>
                <button className="p-3 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* New Driver Quick Invite */}
          <div className="border-2 border-dashed border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center group hover:border-yellow-500/30 transition-all cursor-pointer">
             <div className="h-14 w-14 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ClockIcon className="h-8 w-8 text-slate-700" />
             </div>
             <h4 className="font-bold text-slate-400">Manage Shifts</h4>
             <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-widest">Roster Configuration</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DriversPageClient;