"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  ArrowsRightLeftIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon
} from "@heroicons/react/24/outline";

interface Issuance {
  id: string;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  status: 'Current' | 'Overdue' | 'Returned';
}

const IssuanceRecordsClient = () => {
  const [search, setSearch] = useState("");

  const records: Issuance[] = [
    { id: '1', bookTitle: 'The Great Gatsby', memberName: 'Alex Rivera', issueDate: '2023-10-01', dueDate: '2023-10-15', status: 'Overdue' },
    { id: '2', bookTitle: 'Clean Code', memberName: 'Sarah Chen', issueDate: '2023-10-10', dueDate: '2023-10-24', status: 'Current' },
    { id: '3', bookTitle: 'Atomic Habits', memberName: 'Marcus Wright', issueDate: '2023-09-20', dueDate: '2023-10-04', status: 'Returned' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Background Radial Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-xs font-bold uppercase tracking-[0.2em]">Circulation Desk</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Issuance <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Ledger.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <div className="hidden lg:flex items-center gap-6 px-6 py-3 bg-slate-900/40 border border-slate-800 rounded-2xl mr-4">
               <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Active</p>
                  <p className="text-lg font-bold text-blue-400">24</p>
               </div>
               <div className="w-px h-8 bg-slate-800" />
               <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Overdue</p>
                  <p className="text-lg font-bold text-rose-500">3</p>
               </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              <ArrowsRightLeftIcon className="h-5 w-5" />
              <span>New Transaction</span>
            </button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative group mb-10">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by book title or member name..."
            className="w-full bg-slate-900/40 border border-slate-800 focus:border-blue-500/50 rounded-2xl py-4 pl-12 outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Records Table/List */}
        <div className="space-y-4">
          <div className="grid grid-cols-12 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
            <div className="col-span-5">Book & Member Details</div>
            <div className="col-span-3">Timeline</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {records.map((record) => (
            <div key={record.id} className="grid grid-cols-12 items-center p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl hover:bg-slate-800/40 hover:border-blue-500/30 transition-all group">
              {/* Info Section */}
              <div className="col-span-5 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                  record.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                }`}>
                   {record.status === 'Returned' ? <CheckCircleIcon className="h-6 w-6" /> : <ClockIcon className="h-6 w-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">{record.bookTitle}</h4>
                  <p className="text-sm text-slate-500">Issued to <span className="text-slate-300">{record.memberName}</span></p>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="col-span-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  <span>{record.issueDate}</span>
                  <span className="text-slate-700">→</span>
                  <span className={record.status === 'Overdue' ? 'text-rose-400 font-bold' : ''}>{record.dueDate}</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                  record.status === 'Overdue' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 
                  record.status === 'Returned' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}>
                  <span className={`h-1 w-1 rounded-full ${record.status === 'Overdue' ? 'bg-rose-500' : record.status === 'Returned' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  {record.status}
                </span>
              </div>

              {/* Actions Section */}
              <div className="col-span-2 flex justify-end gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all">
                  <ArrowPathIcon className="h-4 w-4" />
                  Return
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default IssuanceRecordsClient;