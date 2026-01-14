"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { 
  Square3Stack3DIcon, 
  MapPinIcon, 
  ShieldCheckIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsVerticalIcon,
  ArrowPathIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";

const LibraryInventoryClient = () => {
  const [search, setSearch] = useState("");

  const inventoryItems = [
    { id: 'INV-7721', title: 'Deep Learning', category: 'Technology', shelf: 'A-12', condition: 'Mint', integrity: 100, lastAudit: '2023-12-01' },
    { id: 'INV-4402', title: 'The Art of War', category: 'Philosophy', shelf: 'C-04', condition: 'Fair', integrity: 82, lastAudit: '2023-11-15' },
    { id: 'INV-9910', title: 'Introduction to Algorithms', category: 'Education', shelf: 'A-02', condition: 'Good', integrity: 95, lastAudit: '2023-12-05' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      
      {/* Structural Background Glow */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Asset Management</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Inventory.</span>
            </h1>
          </div>

          <div className="flex gap-4">
             <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-md flex flex-col">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Integrity</span>
                <span className="text-xl font-black text-emerald-400">94.2%</span>
             </div>
             <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                <ShieldCheckIcon className="h-5 w-5" />
                Start Audit
             </button>
          </div>
        </header>

        {/* Search & Tool Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter inventory by Tag ID, Title, or Shelf..."
              className="w-full bg-slate-900/40 border border-slate-800 focus:border-blue-500/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
            <AdjustmentsVerticalIcon className="h-5 w-5" />
            Advanced
          </button>
        </div>

        {/* Inventory Items List */}
        <div className="space-y-4">
          {inventoryItems.map((item) => (
            <div key={item.id} className="group relative bg-slate-900/20 border border-slate-800/60 rounded-3xl p-6 hover:bg-slate-900/40 transition-all overflow-hidden">
              
              {/* Animated Progress bar background for Integrity */}
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500/5 transition-all duration-1000"
                style={{ width: `${item.integrity}%` }}
              />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                {/* ID & Title */}
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 border border-slate-700/50">
                    <ArchiveBoxIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">{item.title}</h4>
                    <p className="text-xs font-mono text-slate-500 tracking-tighter">{item.id}</p>
                  </div>
                </div>

                {/* Location & Meta */}
                <div className="md:col-span-3 flex items-center gap-6">
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Shelf Location</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPinIcon className="h-3.5 w-3.5 text-blue-500" />
                      {item.shelf}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Condition</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      item.condition === 'Mint' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {item.condition}
                    </span>
                  </div>
                </div>

                {/* Integrity Score */}
                <div className="md:col-span-3">
                  <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase mb-2">
                    <span>Physical Integrity</span>
                    <span className={item.integrity < 90 ? 'text-amber-400' : 'text-emerald-400'}>{item.integrity}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.integrity < 90 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${item.integrity}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button title="Update Location" className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all">
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                  <button title="Flag Issue" className="p-3 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all">
                    <ExclamationCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default LibraryInventoryClient;