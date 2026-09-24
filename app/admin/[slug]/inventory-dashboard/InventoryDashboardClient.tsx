"use client";

import React from "react";
import { 
  CubeIcon, 
  ExclamationTriangleIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  ArrowPathIcon,
  CircleStackIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export interface InventoryDashboardProps {
  stats?: {
    totalSkus: number;
    outOfStock: number;
    ordersInTransit: number;
    inventoryValue: string;
  };
  alerts?: Array<{
    item: string;
    cat: string;
    stock: string;
    min: string;
    urgency: string;
  }>;
  categories?: Array<{
    label: string;
    val: number;
    color: string;
  }>;
  schoolId?: string;
}

const InventoryDashboardClient = ({
  stats = {
    totalSkus: 0,
    outOfStock: 0,
    ordersInTransit: 0,
    inventoryValue: "$0",
  },
  alerts = [],
  categories = [
    { label: 'IT Infrastructure', val: 40, color: 'bg-blue-500' },
    { label: 'Lab Equipment', val: 30, color: 'bg-orange-500' },
    { label: 'Furniture', val: 20, color: 'bg-emerald-500' },
    { label: 'Other', val: 10, color: 'bg-slate-700' },
  ],
  schoolId,
}: InventoryDashboardProps) => {
  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-orange-500 rounded-full" />
              <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">Asset Ledger & Logistics</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Central <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Inventory.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <DocumentTextIcon className="h-4 w-4" /> Audit Report
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-orange-900/40">
                <TruckIcon className="h-4 w-4" /> New Purchase Order
             </button>
          </div>
        </header>

        {/* Inventory Vital Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total SKUs', value: stats.totalSkus.toLocaleString(), icon: CircleStackIcon, color: 'text-blue-400' },
            { label: 'Out of Stock', value: stats.outOfStock.toLocaleString(), icon: ExclamationTriangleIcon, color: 'text-rose-500' },
            { label: 'Orders in Transit', value: stats.ordersInTransit.toLocaleString(), icon: TruckIcon, color: 'text-orange-400' },
            { label: 'Inventory Value', value: stats.inventoryValue, icon: CurrencyDollarIcon, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] group hover:border-orange-500/30 transition-all">
              <stat.icon className={`h-6 w-6 ${stat.color} mb-4`} />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-white mt-1 italic">{stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock Alerts Panel */}
          <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <ArrowPathIcon className="h-4 w-4 text-orange-500" />
                  Critical Restock Alerts
               </h3>
               {alerts.length > 0 ? (
                 <span className="text-[10px] text-rose-500 font-black uppercase bg-rose-500/10 px-2 py-1 rounded">Action Required ({alerts.length})</span>
               ) : (
                 <span className="text-[10px] text-emerald-400 font-black uppercase bg-emerald-500/10 px-2 py-1 rounded">Healthy</span>
               )}
            </div>
            
            <div className="space-y-4">
               {alerts.length === 0 ? (
                 <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
                   <CheckCircleIcon className="h-8 w-8 text-emerald-500 opacity-60" />
                   <p className="text-sm font-bold">All stock levels are optimal</p>
                   <p className="text-xs">No items currently below minimum threshold</p>
                 </div>
               ) : (
                 alerts.map((alert, i) => (
                   <div key={i} className="flex items-center justify-between p-5 bg-black/40 border border-slate-800 rounded-2xl group hover:bg-slate-800/50 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                            <ArchiveBoxIcon className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">{alert.item}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{alert.cat}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-rose-400">{alert.stock} left</p>
                         <p className="text-[9px] text-slate-600 font-bold italic underline">Min: {alert.min}</p>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>

          {/* Asset Category Distribution */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-8">
            <h3 className="text-sm font-black uppercase text-white tracking-widest mb-8">Asset Categories</h3>
            <div className="space-y-6">
               {categories.map((cat, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                       <span className="text-slate-400 uppercase tracking-tighter">{cat.label}</span>
                       <span className="text-white">{cat.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div className={`h-full ${cat.color}`} style={{ width: `${cat.val}%` }} />
                    </div>
                 </div>
               ))}
            </div>
            <div className="mt-12 text-center">
               <button className="text-[10px] font-black uppercase text-orange-500 hover:text-white transition-colors">
                 Manage All Categories &gt;
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default InventoryDashboardClient;