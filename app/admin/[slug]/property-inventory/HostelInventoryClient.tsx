"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  CubeIcon, ArchiveBoxIcon, PlusCircleIcon, 
  ExclamationCircleIcon, TagIcon, TruckIcon 
} from "@heroicons/react/24/outline";
import RestockOrderModal from "./RestockOrderModal";

const HostelInventoryClient = ({ initialItems, schoolId }: any) => {

  const [items, setItems] = useState(initialItems);  
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  // Quick Adjustment Logic
  const adjustStock = async (id: string, amount: number) => {
    const item = items.find((i: any) => i.dbId === id);
    const newStock = Math.max(0, item.stock + amount);

    try {
      const res = await fetch(`/api/admin/hostel/inventory/${id}/adjust`, {
        method: 'PATCH',
        body: JSON.stringify({ stock: newStock }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        setItems(items.map((i: any) => i.dbId === id ? { ...i, stock: newStock } : i));
        toast.success(`${item.item} updated`);
      }
    } catch (err) {
      toast.error("Adjustment failed");
    }
  };

  const stats = {
    totalValue: items?.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0),
    lowStock: items?.filter((i: any) => i.stock <= i.min).length,
    totalAssets: items?.length
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
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
            <button onClick={() => setIsRestockOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-teal-900/40">
              <PlusCircleIcon className="h-4 w-4" /> Add New Item
            </button>
          </div>
          
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Items" value={stats?.totalAssets} icon={CubeIcon} color="text-teal-400" />
          <StatCard label="Low Stock" value={stats?.lowStock} icon={ExclamationCircleIcon} color="text-rose-500" />
          <StatCard label="Inventory Value" value={`$${stats?.totalValue?.toLocaleString() || 0}`} icon={TagIcon} color="text-blue-400" />
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl border-b-4 border-b-teal-500/50">
            <TruckIcon className="h-5 w-5 text-emerald-400 mb-3" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Next Delivery</p>
            <h3 className="text-xl font-black text-white italic">In 2 Days</h3>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                <th className="p-6">Asset / Item Name</th>
                <th className="p-6">Category</th>
                <th className="p-6">Stock Level</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Adjustment</th>
                <th className="p-6">Primary Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {items?.map((item: any) => (
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
                    <span className="px-3 py-1 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 uppercase">{item.cat}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-white">{item.stock}</span>
                      <span className="text-[10px] text-slate-600 uppercase font-bold">{item.unit}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <StatusBadge status={item.stock <= item.min ? 'Low Stock' : 'Healthy'} />
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => adjustStock(item.dbId, -1)} className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold hover:bg-rose-500/20 transition-all">-</button>
                       <button onClick={() => adjustStock(item.dbId, 1)} className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 text-white font-bold hover:bg-teal-500/20 transition-all">+</button>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-teal-500 uppercase">Primary Source</span>
                      <span className="text-xs text-white font-medium">{item.vendorName || 'Unassigned'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        {/* // The Rendering (place at the bottom of the component) */}
        {isRestockOpen && (
          <RestockOrderModal 
            inventory={items} 
            schoolId={schoolId}
            onClose={() => setIsRestockOpen(false)}
            onSuccess={() => {
              // In a real scenario, you'd re-fetch data from the server here
              // fetchInventory();
            }}
          />
        )}
    </main>
  );
};

// Sub-components for cleaner code
const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
    <Icon className={`h-5 w-5 ${color} mb-3`} />
    <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
    <h3 className="text-2xl font-black text-white">{value}</h3>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    'Healthy': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    'Low Stock': 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
  };
  return (
    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default HostelInventoryClient;