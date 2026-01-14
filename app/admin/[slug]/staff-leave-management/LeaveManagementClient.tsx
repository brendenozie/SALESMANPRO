"use client";

import React, { useState } from "react";
import { 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  UserIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const LeaveManagementClient = () => {
  const [activeTab, setActiveTab] = useState("Pending");

  const leaveRequests = [
    { id: 'LR-401', staff: 'Sarah Jenkins', type: 'Maternity', duration: '90 Days', start: 'Feb 01', status: 'Pending', backup: 'David Chen' },
    { id: 'LR-405', staff: 'Dr. Alistair Cook', type: 'Sick Leave', duration: '2 Days', start: 'Jan 15', status: 'Approved', backup: 'None' },
    { id: 'LR-398', staff: 'Robert Fox', type: 'Vacation', duration: '5 Days', start: 'Mar 10', status: 'Pending', backup: 'Elena Rodriguez' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-violet-500 rounded-full" />
              <span className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em]">Workforce Continuity</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Leave <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Governance.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <CalendarIcon className="h-4 w-4" /> Policy Settings
             </button>
             <button className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-violet-900/40">
                Post Leave Request
             </button>
          </div>
        </header>

        {/* Continuity & Availability KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Currently on Leave</p>
             <h3 className="text-3xl font-black text-white mt-1">12 Staff</h3>
             <p className="mt-4 text-[10px] text-violet-400 font-bold uppercase">8.5% of Total Workforce</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-l-4 border-l-amber-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Approvals</p>
             <h3 className="text-3xl font-black text-amber-500 mt-1">05 Requests</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium">Critical: 2 High-priority depts</p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Continuity Risk</p>
             <h3 className="text-3xl font-black text-emerald-500 mt-1">Low</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium italic">Backups assigned for all absences</p>
          </div>
        </div>

        {/* Requests Filter */}
        <div className="flex gap-6 mb-8 border-b border-slate-800 pb-4">
           {['All', 'Pending', 'Approved', 'Declined'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-violet-400' : 'text-slate-600 hover:text-slate-300'}`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Leave Request List */}
        <div className="space-y-4">
          {leaveRequests.map((req) => (
            <div key={req.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-6 hover:bg-slate-900/40 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Staff & Type */}
                <div className="flex items-center gap-6 lg:w-1/4">
                  <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-violet-400">
                    <UserIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-white italic">{req.staff}</h4>
                    <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest">{req.type}</span>
                  </div>
                </div>

                {/* Duration & Date */}
                <div className="flex items-center gap-10">
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Duration</p>
                      <p className="text-sm font-black text-slate-200">{req.duration}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Starts On</p>
                      <p className="text-sm font-black text-slate-200">{req.start}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Backup Assigned</p>
                      <p className="text-sm font-bold text-indigo-400">{req.backup}</p>
                   </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-4 ml-auto">
                   <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                   </button>
                   {req.status === 'Pending' ? (
                     <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase transition-all">
                           <XCircleIcon className="h-4 w-4" /> Decline
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase transition-all">
                           <CheckCircleIcon className="h-4 w-4" /> Approve
                        </button>
                     </div>
                   ) : (
                     <div className="px-5 py-2.5 bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4" /> {req.status}
                     </div>
                   )}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LeaveManagementClient;