"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon,
  BellAlertIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightCircleIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const LibraryReservationsClient = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'ready'>('pending');

  const reservations = [
    { id: '1', book: 'The Midnight Library', member: 'Eleanor Shellstrop', requestDate: '2023-10-20', status: 'Pending', position: 1, expectedArrival: 'Oct 25' },
    { id: '2', book: 'Project Hail Mary', member: 'Chidi Anagonye', requestDate: '2023-10-18', status: 'Ready', position: 0, expectedArrival: 'Now Available' },
    { id: '3', book: 'The Song of Achilles', member: 'Tahani Al-Jamil', requestDate: '2023-10-22', status: 'Pending', position: 4, expectedArrival: 'Nov 02' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Reservations Glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-violet-500 rounded-full" />
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">Hold Requests</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Queue <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Management.</span>
            </h1>
          </div>

          <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Waitlist
            </button>
            <button 
              onClick={() => setActiveTab('ready')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'ready' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Ready for Pickup
            </button>
          </div>
        </header>

        {/* Reservation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reservations.map((res) => (
            <div key={res.id} className="relative group bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 hover:border-violet-500/40 transition-all overflow-hidden">
              
              {/* Top Row: Position Badge & Actions */}
              <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black border ${
                  res.status === 'Ready' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                }`}>
                  {res.status === 'Ready' ? 'AVAILABLE NOW' : `QUEUE POSITION: #${res.position}`}
                </div>
                <div className="flex gap-1">
                  <button className="p-2 hover:bg-rose-500/10 hover:text-rose-400 text-slate-600 rounded-lg transition-colors">
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Book Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">{res.book}</h3>
                <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>Requested by {res.member}</span>
                </div>
              </div>

              {/* Timeline Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-2xl border border-slate-800/50 mb-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Request Date</p>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CalendarIcon className="h-3.5 w-3.5 text-slate-500" />
                    {res.requestDate}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Est. Arrival</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {res.expectedArrival}
                  </div>
                </div>
              </div>

              {/* Interaction Bar */}
              {res.status === 'Ready' ? (
                <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all">
                  <BellAlertIcon className="h-4 w-4" />
                  Notify Member
                </button>
              ) : (
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                  <ArrowRightCircleIcon className="h-4 w-4" />
                  View Queue Details
                </button>
              )}

              {/* Sparkle effect for "Ready" items */}
              {res.status === 'Ready' && (
                <div className="absolute -top-6 -right-6 h-12 w-12 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
              )}
            </div>
          ))}

          {/* New Reservation Placeholder */}
          <button className="group border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all">
            <div className="p-4 bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform">
              <SparklesIcon className="h-6 w-6 text-violet-500" />
            </div>
            <span className="mt-4 font-bold text-slate-400 group-hover:text-violet-300">Create New Hold</span>
          </button>
        </div>
      </div>
    </main>
  );
};

export default LibraryReservationsClient;