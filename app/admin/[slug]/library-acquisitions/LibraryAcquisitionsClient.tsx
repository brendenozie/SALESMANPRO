"use client";

import React, { useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  FunnelIcon,
  ArrowPathIcon,
  BeakerIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

interface Acquisition {
  id: string;
  title: string;
  qty: number;
  cost: number;
  status: 'Requested' | 'Processing' | 'In Transit' | 'Received';
  date: string;
  vendor: string;
}

const LibraryAcquisitionsClient = ({ initialOrders = [], schoolId = "" }) => {
  const [orders, setOrders] = useState<Acquisition[]>(initialOrders);
  const [filter, setFilter] = useState('All Stages');

  const filteredOrders = useMemo(() => {
    if (filter === 'All Stages') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  const handleReceiveOrder = async (orderId: string) => {
    toast.loading("Integrating units into inventory...");
    
    // Simulate API call to update status and create inventory records
    setTimeout(() => {
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: 'Received', date: new Date().toISOString().split('T')[0] } : o
      ));
      toast.dismiss();
      toast.success("Stock Received! Units added to catalog.");
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Requested': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Processing': return 'text-lime-400 bg-lime-500/10 border-lime-500/20';
      case 'Received': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-lime-500/5 blur-[100px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-lime-500 rounded-full" />
              <span className="text-lime-500 text-[10px] font-black uppercase tracking-[0.2em]">New Inventory Pipeline</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Stock <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-teal-500">Acquisitions.</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="flex-grow xl:w-64 relative">
              <FunnelIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs appearance-none focus:ring-2 focus:ring-lime-500/50 outline-none text-white cursor-pointer"
              >
                <option>All Stages</option>
                <option>Requested</option>
                <option>Processing</option>
                <option>In Transit</option>
                <option>Received</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold text-xs hover:bg-lime-50 transition-all active:scale-95">
              <ShoppingBagIcon className="h-4 w-4" />
              New Purchase Order
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="group bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 hover:bg-slate-800/40 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-[10px] text-slate-500 tracking-tighter">{order.id}</span>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border transition-colors ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-lime-400 transition-colors line-clamp-1">
                {order.title}
              </h3>
              <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
                From <span className="text-slate-300 font-medium">{order.vendor}</span>
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-black/30 rounded-2xl p-3 border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Quantity</p>
                  <div className="flex items-center gap-2 text-sm text-white font-mono">
                    <ArchiveBoxIcon className="h-4 w-4 text-slate-500" />
                    {order.qty} Units
                  </div>
                </div>
                <div className="bg-black/30 rounded-2xl p-3 border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Investment</p>
                  <div className="flex items-center gap-2 text-sm text-white font-mono">
                    <CurrencyDollarIcon className="h-4 w-4 text-lime-500" />
                    {order.cost.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <ArrowPathIcon className="h-3.5 w-3.5" />
                  Updated {order.date}
                </div>
                
                {order.status !== 'Received' ? (
                  <button 
                    onClick={() => handleReceiveOrder(order.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-lime-600 text-slate-400 hover:text-white rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider"
                  >
                    <ClipboardDocumentCheckIcon className="h-4 w-4" />
                    Mark Received
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase">
                    <CheckCircleIcon className="h-4 w-4" />
                    Cataloged
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-br from-lime-900/20 to-teal-900/20 border border-lime-500/20 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 bg-lime-500/20 rounded-xl flex items-center justify-center mb-4">
                <BeakerIcon className="h-6 w-6 text-lime-400" />
              </div>
              <h4 className="font-bold text-white">Smart Suggestions</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Based on your checkout trends, we suggest acquiring 3 more copies of <span className="text-lime-400 italic">"Quantum Computing 101"</span>.
              </p>
            </div>
            <button className="mt-6 text-[10px] font-black uppercase text-lime-400 tracking-widest hover:text-lime-300 transition-colors text-left">
              View Analytics →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LibraryAcquisitionsClient;