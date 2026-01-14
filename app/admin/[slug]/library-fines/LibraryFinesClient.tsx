"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  BanknotesIcon, 
  CreditCardIcon, 
  ShieldExclamationIcon,
  ArrowPathIcon,
  ReceiptPercentIcon,
  UserCircleIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

const LibraryFinesClient = () => {
  const [search, setSearch] = useState("");

  const fines = [
    { id: '1', member: 'Alex Rivera', book: 'The Great Gatsby', daysOverdue: 12, amount: 24.00, status: 'Unpaid' },
    { id: '2', member: 'Marcus Wright', book: 'Atomic Habits', daysOverdue: 21, amount: 42.50, status: 'Unpaid' },
    { id: '3', member: 'Sarah Chen', book: 'Clean Code', daysOverdue: 0, amount: 5.00, status: 'Paid' },
  ];

  const totalOutstanding = fines
    .filter(f => f.status === 'Unpaid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Financial Glow Background */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-amber-500 rounded-full" />
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Revenue & Penalties</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Fine <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">Management.</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
            <div className="h-12 w-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
              <BanknotesIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Outstanding</p>
              <p className="text-2xl font-black text-white">${totalOutstanding.toFixed(2)}</p>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative">
             <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by member or book title..."
              className="w-full bg-slate-900/40 border border-slate-800 focus:border-amber-500/50 rounded-2xl py-4 px-6 outline-none transition-all"
             />
          </div>
          <button className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all border border-slate-700">
            <ReceiptPercentIcon className="h-5 w-5" />
            Bulk Waiver
          </button>
        </div>

        {/* Fines Ledger */}
        <div className="grid grid-cols-1 gap-4">
          {fines.map((fine) => (
            <div key={fine.id} className="group relative overflow-hidden bg-slate-900/20 border border-slate-800/60 rounded-3xl p-6 hover:bg-slate-900/40 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Member & Book Info */}
                <div className="flex items-center gap-5">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border shadow-inner ${
                    fine.status === 'Paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}>
                    {fine.status === 'Paid' ? <CheckBadgeIcon className="h-8 w-8" /> : <ShieldExclamationIcon className="h-8 w-8" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {fine.member}
                      {fine.status === 'Unpaid' && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />}
                    </h3>
                    <p className="text-sm text-slate-500">For: <span className="italic">"{fine.book}"</span></p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex flex-wrap items-center gap-8 md:gap-12">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Delay</p>
                    <p className="text-sm font-mono text-slate-300">{fine.daysOverdue} Days</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Amount</p>
                    <p className={`text-xl font-black ${fine.status === 'Paid' ? 'text-slate-500 line-through' : 'text-amber-400'}`}>
                      ${fine.amount.toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Status & CTA */}
                  <div className="flex items-center gap-3">
                    {fine.status === 'Unpaid' ? (
                      <>
                        <button className="p-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-all transform active:scale-95 flex items-center gap-2 text-xs">
                          <CreditCardIcon className="h-4 w-4" />
                          Collect Payment
                        </button>
                        <button className="p-3 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all">
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        Cleared
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Decorative Progress bar for "Overdue Gravity" */}
              {fine.status === 'Unpaid' && (
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-600/0 via-amber-600/40 to-amber-600/0 w-full" />
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LibraryFinesClient;