"use client";

import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { 
  UserPlusIcon, 
  IdentificationIcon, 
  ClockIcon, 
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  CameraIcon,
  UserGroupIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import CheckInModal from "./CheckInModal";

const VisitorsPageClient = ({ initialLogs, schoolId }: any) => {
  const [logs, setLogs] = useState(initialLogs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to calculate time elapsed for active visitors
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
    const promise = fetch("/api/admin/hostel/visitors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    toast.promise(promise, {
      loading: 'Recording departure...',
      success: (res) => {
        setLogs(logs.map((l: any) => l.id === id ? { ...l, status: 'CHECKED_OUT', checkOut: new Date().toISOString() } : l));
        return "Visitor checked out.";
      },
      error: 'Update failed.'
    });
  };

  const stats = {
    inPremise: logs?.filter((l: any) => l.status === 'ACTIVE').length,
    todayTotal: logs?.length
  };

  // const [logs] = useState([
  //   { id: 'VIS-902', name: 'Jonathan Wick', relation: 'Parent', student: 'Marcus H.', checkIn: '14:20', duration: '40m', status: 'Active', idType: 'Driver License' },
  //   { id: 'VIS-899', name: 'Sarah Connor', relation: 'Guardian', student: 'Elena F.', checkIn: '10:15', duration: '2h 10m', status: 'Checked Out', idType: 'National ID' },
  //   { id: 'VIS-905', name: 'Peter Parker', relation: 'Sibling', student: 'Arthur M.', checkIn: '15:10', duration: '10m', status: 'Active', idType: 'Student ID' },
  // ]);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Security Scanning Beam Effect */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-scan -z-10" />

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

          <div className="flex gap-3 w-full lg:w-auto">
            <button onClick={() => setIsModalOpen(true)} className="flex-grow lg:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-blue-900/40">
              <UserPlusIcon className="h-5 w-5" />
              Check-In Visitor
            </button>
            
          </div>
        </header>

        {/* Live Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] border-l-4 border-l-blue-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Currently In-Premise</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.inPremise?.toString().padStart(2, '0')} Guests</h3>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] border-l-4 border-l-amber-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overstay Warnings</p>
            <h3 className="text-3xl font-black text-amber-500 mt-1">02 Alerts</h3>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] border-l-4 border-l-emerald-500">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's Total</p>
            <h3 className="text-3xl font-black text-white mt-1">{stats.todayTotal?.toString().padStart(2, '0')} Entries</h3>
          </div>
        </div>

        {/* Visitor Log Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/50">
             <div className="flex items-center gap-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Activity</h3>
               <div className="px-3 py-1 bg-black rounded-full border border-slate-800 text-[10px] font-mono text-blue-400">Live Sync</div>
             </div>
             <div className="relative w-full md:w-64">
               <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
               <input onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:border-blue-500" placeholder="Search visitors..." />
             </div>
          </div>

          <div className="overflow-x-auto">
            <tbody className="divide-y divide-slate-800/30">
                {logs && logs
                  .filter((l: any) => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((log: any) => (
                  <tr key={log.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                          <CameraIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{log.name}</p>
                          <p className="text-[10px] font-mono text-slate-600">VIS-{log.id.slice(-4).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-slate-300 font-medium">{log.relation}</p>
                      <p className="text-[10px] text-blue-400 font-bold uppercase">To visit: {log.student?.name}</p>
                    </td>
                    <td className="p-6 font-mono text-xs text-slate-400">
                       {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-6">
                       <span className={`text-xs font-bold ${log.status === 'ACTIVE' ? 'text-white' : 'text-slate-500'}`}>
                         {getDuration(log.checkIn, log.checkOut)}
                       </span>
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
                        <span className="text-[10px] font-black uppercase text-slate-600 flex items-center justify-end gap-1">
                          <ShieldCheckIcon className="h-3.5 w-3.5" /> Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            {/* <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Visitor Details</th>
                  <th className="p-6">Relation / Student</th>
                  <th className="p-6">ID Verification</th>
                  <th className="p-6">Check-In</th>
                  <th className="p-6">Stay Duration</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                          <CameraIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{log.name}</p>
                          <p className="text-[10px] font-mono text-slate-600">{log.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-slate-300 font-medium">{log.relation}</p>
                      <p className="text-[10px] text-blue-400 font-bold uppercase">To visit: {log.student}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <IdentificationIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{log.idType}</span>
                      </div>
                    </td>
                    <td className="p-6 font-mono text-xs text-slate-400">{log.checkIn}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <ClockIcon className={`h-4 w-4 ${log.status === 'Active' ? 'text-blue-500' : 'text-slate-600'}`} />
                        <span className={`text-xs font-bold ${log.status === 'Active' ? 'text-white' : 'text-slate-500'}`}>{log.duration}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      {log.status === 'Active' ? (
                        <button className="px-4 py-2 bg-slate-800 hover:bg-rose-900/30 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase transition-all">
                          Check Out
                        </button>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-slate-600 flex items-center justify-end gap-1">
                          <ShieldCheckIcon className="h-3.5 w-3.5" /> Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> */}
          </div>
        </div>
      </div>

      {/* // Render */}
      {isModalOpen && (
        <CheckInModal 
          schoolId={schoolId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newLog: any) => setLogs([newLog, ...logs])}
        />
      )}

    </main>
  );
};

export default VisitorsPageClient;