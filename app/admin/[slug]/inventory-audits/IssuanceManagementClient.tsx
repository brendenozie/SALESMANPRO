"use client";

import React, { useState } from "react";
import { 
  UserCircleIcon, 
  ArrowsRightLeftIcon, 
  ClipboardDocumentCheckIcon, 
  CalendarIcon,
  HandThumbUpIcon,
  ShieldCheckIcon,
  ArrowPathRoundedSquareIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

const IssuanceManagementClient = () => {
  const [filter, setFilter] = useState("All");

  const issuanceRecords = [
    { id: 'ISS-881', item: 'MacBook Air M2 (IT-LAP-042)', staff: 'Sarah Jenkins', dept: 'Mathematics', date: 'Jan 10', type: 'Fixed Asset', status: 'In Use' },
    { id: 'ISS-885', item: 'Hydrochloric Acid (2L)', staff: 'Dr. Alistair Cook', dept: 'Science', date: 'Jan 14', type: 'Consumable', status: 'Consumed' },
    { id: 'ISS-889', item: 'Basketball Set (x12)', staff: 'Marcus V.', dept: 'Sports', date: 'Jan 12', type: 'Returnable', status: 'Overdue' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-teal-500 rounded-full" />
              <span className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em]">Custody & Assignment</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Item <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Issuance.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-teal-900/40">
            <ArrowsRightLeftIcon className="h-4 w-4 stroke-[2.5px]" /> Process New Issuance
          </button>
        </header>

        {/* Issuance Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Assignments</p>
             <h3 className="text-3xl font-black text-white mt-1">142</h3>
             <p className="mt-4 text-[10px] text-teal-400 font-bold uppercase">Laptops, Tools, & Keys</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-l-4 border-l-rose-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Returns</p>
             <h3 className="text-3xl font-black text-rose-500 mt-1">08 Items</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium italic">High Risk: 2 Assets</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dept. Usage (This Month)</p>
             <h3 className="text-3xl font-black text-white mt-1">$4,200</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lead: Science Dept</p>
          </div>
        </div>

        {/* Issuance Ledger */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Assignment Log</h3>
            <div className="flex bg-black/40 p-1 rounded-xl border border-slate-800">
               {['All', 'Fixed', 'Consumable'].map(t => (
                 <button 
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${filter === t ? 'bg-teal-600 text-white' : 'text-slate-500'}`}
                 >{t}</button>
               ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Issued Item</th>
                  <th className="p-6">Staff / Holder</th>
                  <th className="p-6">Date</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Acknowledgement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {issuanceRecords.map((rec) => (
                  <tr key={rec.id} className="group hover:bg-teal-500/[0.02] transition-colors">
                    <td className="p-6">
                      <p className="text-sm font-bold text-white leading-tight">{rec.item}</p>
                      <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest">{rec.type}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <UserCircleIcon className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-200">{rec.staff}</p>
                            <p className="text-[9px] text-slate-600 font-bold">{rec.dept}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-6 text-xs text-slate-400 font-mono">{rec.date}</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        rec.status === 'In Use' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                        rec.status === 'Consumed' ? 'bg-slate-800 text-slate-500 border-slate-700' :
                        'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                       <button className="flex items-center gap-2 ml-auto px-4 py-2 bg-slate-800 hover:bg-white hover:text-black rounded-xl text-[10px] font-black uppercase transition-all">
                          <ClipboardDocumentCheckIcon className="h-4 w-4" /> View Digital Slip
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default IssuanceManagementClient;