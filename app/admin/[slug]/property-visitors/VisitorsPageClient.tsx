"use client";

import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  UserPlusIcon, 
  IdentificationIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  CameraIcon,
  MagnifyingGlassIcon,
  UserIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import CheckInModal from "./CheckInModal";

const OVERSTAY_THRESHOLD_MINUTES = 240; // 4 Hours

const checkOverstay = (checkIn: string, checkOut: string | null) => {
  if (checkOut) return false;
  const start = new Date(checkIn).getTime();
  const now = new Date().getTime();
  return (now - start) / 60000 > OVERSTAY_THRESHOLD_MINUTES;
};

const VisitorsPageClient = ({ initialLogs, schoolId }: any) => {
  const [logs, setLogs] = useState(initialLogs || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const getDuration = (checkIn: string, checkOut: string | null) => {
    const start = new Date(checkIn).getTime();
    const end = checkOut ? new Date(checkOut).getTime() : new Date().getTime();
    const diffInMinutes = Math.floor((end - start) / 60000);
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const hours = Math.floor(diffInMinutes / 60);
    const mins = diffInMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleCheckOut = async (id: string) => {
    const promise = fetch("/api/admin/property/visitors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    toast.promise(promise, {
      loading: 'Recording departure...',
      success: () => {
        setLogs((current: any) => 
          current.map((l: any) => l.id === id ? { ...l, status: 'CHECKED_OUT', checkOut: new Date().toISOString() } : l)
        );
        return "Visitor checked out.";
      },
      error: 'Update failed.'
    });
  };

  const stats = {
    inPremise: logs?.filter((l: any) => l.status === 'ACTIVE').length,
    overstayCount: logs?.filter((l: any) => l.status === 'ACTIVE' && checkOverstay(l.checkIn, l.checkOut)).length,
    todayTotal: logs?.length
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const overstayers = logs.filter((l: any) => l.status === 'ACTIVE' && checkOverstay(l.checkIn, l.checkOut));
      if (overstayers.length > 0) {
        toast.error(`Security Alert: ${overstayers.length} overstaying visitor(s)!`, {
          icon: '🚨',
          duration: 6000,
        });
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [logs]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Gatekeeping & Access</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Visitor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Registry.</span>
            </h1>
          </div>

          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/40">
            <UserPlusIcon className="h-5 w-5" />
            Check-In Visitor
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">In-Premise</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.inPremise?.toString().padStart(2, '0')} Guests</h3>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] border-l-4 border-l-amber-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overstay Alerts</p>
            <h3 className={`text-3xl font-black mt-1 ${stats.overstayCount > 0 ? 'text-rose-500' : 'text-white'}`}>
              {stats.overstayCount?.toString().padStart(2, '0')} Warnings
            </h3>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's Total</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.todayTotal?.toString().padStart(2, '0')} Entries</h3>
          </div>
        </div>

        {/* Search & Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
             <div className="flex items-center gap-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Live Activity Log</h3>
             </div>
             <div className="relative w-full md:w-64">
               <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
               <input 
                 onChange={(e) => setSearchTerm(e.target.value)} 
                 className="w-full bg-black/40 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-blue-500" 
                 placeholder="Filter by name..." 
               />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Visitor Details</th>
                  <th className="p-6">Visit Target</th>
                  <th className="p-6">ID / Image</th>
                  <th className="p-6">Time Stats</th>
                  <th className="p-6 text-right">Departure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {logs
                  .filter((l: any) => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((log: any) => {
                    const isOverstaying = checkOverstay(log.checkIn, log.checkOut);
                    const visitingUser = log.student || log.educator;
                    const isStaffVisit = !!log.educator;

                    return (
                      <tr key={log.id} className={`transition-all ${isOverstaying ? 'bg-rose-500/5 animate-pulse-subtle border-l-2 border-rose-500' : 'hover:bg-blue-500/[0.02]'}`}>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 overflow-hidden">
                              {log.idImageUrl ? (
                                <img src={log.idImageUrl} className="h-full w-full object-cover" alt="ID" />
                              ) : (
                                <CameraIcon className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{log.name}</p>
                              <p className="text-[10px] font-mono text-slate-600 tracking-tighter">ID: {log.id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-300 font-medium">{log.relation}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              {isStaffVisit ? <AcademicCapIcon className="h-3 w-3 text-amber-500" /> : <UserIcon className="h-3 w-3 text-blue-400" />}
                              <span className={`text-[10px] font-bold uppercase ${isStaffVisit ? 'text-amber-500' : 'text-blue-400'}`}>
                                {visitingUser?.firstName || visitingUser?.user?.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <IdentificationIcon className="h-4 w-4 text-slate-600" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase">{log.idType || "N/A"}</span>
                          </div>
                        </td>

                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <ClockIcon className={`h-4 w-4 ${isOverstaying ? 'text-rose-500' : 'text-blue-500'}`} />
                              <span className={`text-xs font-bold ${isOverstaying ? 'text-rose-400' : 'text-white'}`}>
                                {getDuration(log.checkIn, log.checkOut)}
                              </span>
                            </div>
                            {isOverstaying && (
                              <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">🚨 Overstay Alert</span>
                            )}
                          </div>
                        </td>

                        <td className="p-6 text-right">
                          {log.status === 'ACTIVE' ? (
                            <button 
                              onClick={() => handleCheckOut(log.id)}
                              className="px-4 py-2 bg-slate-800 hover:bg-rose-900/30 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase transition-all"
                            >
                              Check Out
                            </button>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black uppercase text-slate-600 flex items-center gap-1">
                                <ShieldCheckIcon className="h-3.5 w-3.5" /> Departed
                              </span>
                              <span className="text-[9px] text-slate-700 font-mono">
                                {new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CheckInModal 
          schoolId={schoolId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newLog: any) => setLogs((prev: any) => [newLog, ...prev])}
        />
      )}
    </main>
  );
};

export default VisitorsPageClient;