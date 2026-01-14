"use client";

import React, { useState } from "react";
import { 
  CubeIcon, 
  ArrowPathIcon, 
  ArchiveBoxIcon, 
  ShoppingBagIcon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  TagIcon,
  TruckIcon
} from "@heroicons/react/24/outline";

const HostelInventoryClient = () => {
  const inventory = [
    { id: 'AST-101', item: 'Memory Foam Mattress', cat: 'Furniture', stock: 12, min: 5, unit: 'pcs', status: 'Healthy' },
    { id: 'CON-502', item: 'Industrial Detergent', cat: 'Cleaning', stock: 4, min: 10, unit: 'liters', status: 'Low Stock' },
    { id: 'AST-205', item: 'Steel Bed Frame', cat: 'Furniture', stock: 48, min: 10, unit: 'pcs', status: 'Healthy' },
    { id: 'EQP-099', item: 'Commercial Washer', cat: 'Laundry', stock: 6, min: 1, unit: 'units', status: 'Repair Needed' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-teal-500 rounded-full" />
              <span className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em]">Supply Chain & Assets</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Hostel <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Stock.</span>
            </h1>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
              <TruckIcon className="h-4 w-4" />
              Restock Order
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-teal-900/40">
              <PlusCircleIcon className="h-4 w-4" />
              Add New Item
            </button>
          </div>
        </header>

        {/* Inventory Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Assets', value: '420', icon: CubeIcon, color: 'text-teal-400' },
            { label: 'Low Stock Alerts', value: '03', icon: ExclamationCircleIcon, color: 'text-rose-500' },
            { label: 'Pending Repairs', value: '01', icon: ArrowPathIcon, color: 'text-amber-500' },
            { label: 'Value on Hand', value: '$12,400', icon: TagIcon, color: 'text-blue-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-3`} />
              <p className="text-[10px] font-bold text-slate-500 uppercase">{stat.label}</p>
              <h3 className="text-2xl font-black text-white">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Stock Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <th className="p-6">Asset / Item Name</th>
                <th className="p-6">Category</th>
                <th className="p-6">Stock Level</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {inventory.map((item) => (
                <tr key={item.id} className="group hover:bg-teal-500/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                        <ArchiveBoxIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.item}</p>
                        <p className="text-[10px] font-mono text-slate-600">{item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {item.cat}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white">{item.stock}</span>
                      <span className="text-[10px] text-slate-600 uppercase font-bold">{item.unit}</span>
                      <div className="flex-grow h-1 max-w-[60px] bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.stock <= item.min ? 'bg-rose-500' : 'bg-teal-500'}`} 
                          style={{ width: `${Math.min((item.stock/item.min)*50, 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${
                      item.status === 'Healthy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                      item.status === 'Low Stock' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-[10px] font-black uppercase text-teal-400 hover:text-white transition-colors">
                      Audit Log
                    </button>
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

export default HostelInventoryClient;