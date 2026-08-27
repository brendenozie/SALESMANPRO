"use client";

import React, { useState } from "react";
import { 
  QrCodeIcon, 
  MapPinIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  PlusIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

const StockListClient = () => {
  const stockItems = [
    { sku: 'IT-LAP-042', name: 'MacBook Air M2', category: 'IT Hardware', location: 'Locker-A1', stock: 12, min: 5, unit: 'pcs', value: '$14,400' },
    { sku: 'SCI-CHM-88', name: 'Hydrochloric Acid', category: 'Lab Chemicals', location: 'Hazmat-Room', stock: 4, min: 10, unit: 'Liters', value: '$320' },
    { sku: 'STN-PAP-01', name: 'A4 Paper (80gsm)', category: 'Stationery', location: 'Main-Store', stock: 450, min: 100, unit: 'Reams', value: '$2,250' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">Inventory Granularity</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Stock <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Ledger.</span>
            </h1>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
             <div className="relative flex-grow lg:w-80">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search SKU, Name or Location..." 
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:border-orange-500 outline-none transition-all"
                />
             </div>
             <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-orange-900/40">
                <PlusIcon className="h-4 w-4 stroke-[3px]" /> Add Item
             </button>
          </div>
        </header>

        {/* Filters & Bulk Actions */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-2">
                <FunnelIcon className="h-3.5 w-3.5" /> Filter Category
              </button>
              <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all flex items-center gap-2">
                <MapPinIcon className="h-3.5 w-3.5" /> Floor Map
              </button>
           </div>
           <button className="text-[10px] font-black uppercase text-orange-500 hover:underline">Generate Bulk QR Labels</button>
        </div>

        {/* Stock Ledger Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <th className="p-6">Item Detail & SKU</th>
                <th className="p-6">Physical Location</th>
                <th className="p-6">Quantity</th>
                <th className="p-6">Stock Status</th>
                <th className="p-6">Total Value</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {stockItems.map((item) => (
                <tr key={item.sku} className="group hover:bg-orange-500/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-orange-400 transition-colors">
                        <ArchiveBoxIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-600 mt-0.5">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 border border-slate-700 w-fit rounded-lg">
                       <MapPinIcon className="h-3.5 w-3.5 text-orange-500" />
                       <span className="text-[10px] font-bold text-slate-300 uppercase">{item.location}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-sm font-black text-white">{item.stock} <span className="text-[10px] font-normal text-slate-500 uppercase">{item.unit}</span></p>
                  </td>
                  <td className="p-6">
                    {item.stock <= item.min ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        <ExclamationCircleIcon className="h-3.5 w-3.5" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-sm font-mono text-slate-400 font-bold">{item.value}</td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button className="p-2 bg-slate-800 hover:bg-white hover:text-black rounded-lg transition-all title='Generate QR Code'">
                          <QrCodeIcon className="h-4 w-4" />
                       </button>
                       <button className="p-2 bg-slate-800 hover:bg-orange-600 text-white rounded-lg transition-all">
                          <ArrowPathIcon className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default StockListClient;