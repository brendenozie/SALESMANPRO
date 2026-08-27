"use client";

import React, { useState } from "react";
import { 
  DocumentPlusIcon, 
  ClockIcon, 
  CheckBadgeIcon, 
  TruckIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

const PurchaseOrdersClient = () => {
  const [activeTab, setActiveTab] = useState("Pending");

  const orders = [
    { id: 'PO-2026-001', supplier: 'Global Tech Solutions', amount: 12400.00, date: 'Jan 12, 2026', status: 'Pending', items: 12 },
    { id: 'PO-2026-004', supplier: 'LabPro Chemicals', amount: 850.50, date: 'Jan 10, 2026', status: 'Approved', items: 5 },
    { id: 'PO-2025-998', supplier: 'Elite Sports Gear', amount: 2100.00, date: 'Jan 05, 2026', status: 'In Transit', items: 25 },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">Financial Procurement Cycle</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Purchase <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Orders.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-emerald-900/40">
            <DocumentPlusIcon className="h-4 w-4 stroke-[2.5px]" /> Generate New PO
          </button>
        </header>

        {/* Procurement Funnel Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-800/50 pb-4 overflow-x-auto no-scrollbar">
          {['All', 'Drafts', 'Pending', 'Approved', 'In Transit', 'Delivered'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                activeTab === tab ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* PO List */}
        <div className="space-y-4">
          {orders.map((po) => (
            <div key={po.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6 hover:bg-slate-900/40 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* ID & Supplier */}
                <div className="flex items-center gap-5 lg:w-1/3">
                  <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-400">
                    <CurrencyDollarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">{po.id}</h3>
                    <p className="text-xs font-bold text-slate-500">{po.supplier}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-grow">
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Amount</p>
                      <p className="text-sm font-bold text-white">${po.amount.toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Date Issued</p>
                      <p className="text-sm font-bold text-slate-400">{po.date}</p>
                   </div>
                   <div className="hidden md:block">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Items Count</p>
                      <p className="text-sm font-bold text-slate-400">{po.items} SKUs</p>
                   </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                    po.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    po.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {po.status}
                  </span>
                  
                  <div className="h-8 w-[1px] bg-slate-800 mx-2" />
                  
                  {po.status === 'Pending' ? (
                    <div className="flex gap-2">
                       <button className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Reject Order">
                          <XCircleIcon className="h-5 w-5" />
                       </button>
                       <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all">
                          Authorize
                       </button>
                    </div>
                  ) : (
                    <button className="p-2 text-slate-400 hover:text-white transition-all">
                       <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Logistics Context */}
        <div className="mt-10 p-6 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex items-center gap-6">
           <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
              <TruckIcon className="h-6 w-6" />
           </div>
           <div>
              <h4 className="text-sm font-bold text-white">Logistics Overview</h4>
              <p className="text-xs text-slate-500 mt-1">
                Currently tracking <span className="text-blue-400 font-bold">4 inbound shipments</span>. 
                Estimated arrival for PO-2025-998 is <span className="text-white font-bold">Tomorrow, 10:00 AM</span>.
              </p>
           </div>
        </div>
      </div>
    </main>
  );
};

export default PurchaseOrdersClient;