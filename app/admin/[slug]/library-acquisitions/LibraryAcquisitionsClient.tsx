"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  CheckCircleIcon,
  SunIcon,
  MoonIcon
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

interface Props {
  initialOrders?: Acquisition[];
  schoolId?: string;
}

const LibraryAcquisitionsClient: React.FC<Props> = ({ initialOrders = [], schoolId = "" }) => {
  const [orders, setOrders] = useState<Acquisition[]>(initialOrders);
  const [filter, setFilter] = useState('All Stages');
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Sync Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const filteredOrders = useMemo(() => {
    if (filter === 'All Stages') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  const handleReceiveOrder = async (orderId: string) => {
    if (!confirm("Mark as received? This adds units to Master Inventory.")) return;
    const loader = toast.loading("Updating logistics...");
    
    try {
      const res = await fetch(`/api/admin/library/acquisitions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: 'Received', companyId: schoolId })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Received', date: 'Just now' } : o));
        toast.success("Inventory updated successfully", { id: loader });
      }
    } catch (err) {
      toast.error("Operation failed", { id: loader });
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'In Transit': return 'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400';
      case 'Requested': return 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400';
      case 'Processing': return 'text-lime-600 bg-lime-500/10 border-lime-500/20 dark:text-lime-400';
      case 'Received': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400';
      default: return 'text-slate-600 bg-slate-500/10 border-slate-500/20 dark:text-slate-400';
    }
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-8 font-sans transition-colors duration-300">
        <Toaster position="top-right" />
        
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-10 bg-lime-500 rounded-full" />
                <span className="text-lime-600 dark:text-lime-500 text-[10px] font-black uppercase tracking-[0.2em]">Inventory Pipeline</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Stock <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-teal-600 dark:from-lime-400 dark:to-teal-500">Acquisitions.</span>
              </h1>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto">
              {/* <button 
                onClick={toggleTheme}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-lime-500/50 transition-colors"
              >
                {theme === "dark" ? <SunIcon className="h-5 w-5 text-orange-400" /> : <MoonIcon className="h-5 w-5 text-slate-600" />}
              </button> */}

              <div className="relative flex-grow xl:w-48">
                <FunnelIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer focus:ring-2 ring-lime-500/20"
                >
                  <option>All Stages</option>
                  <option>Requested</option>
                  <option>Processing</option>
                  <option>In Transit</option>
                  <option>Received</option>
                </select>
              </div>

              <button className="flex items-center gap-2 px-6 py-3 bg-lime-600 hover:bg-lime-500 text-white rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-lime-900/10">
                <ShoppingBagIcon className="h-4 w-4" />
                New Order
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-xl dark:hover:bg-slate-800/40 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-[10px] text-slate-400">{order.id}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusStyles(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{order.title}</h3>
                <p className="text-xs text-slate-500 mb-6">From <span className="font-medium text-slate-700 dark:text-slate-300">{order.vendor}</span></p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-black/30 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Quantity</p>
                    <div className="flex items-center gap-2 text-sm font-mono text-slate-900 dark:text-white">
                      <ArchiveBoxIcon className="h-4 w-4 text-slate-400" />
                      {order.qty}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/30 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Investment</p>
                    <div className="flex items-center gap-2 text-sm font-mono text-slate-900 dark:text-white">
                      <CurrencyDollarIcon className="h-4 w-4 text-lime-500" />
                      {order.cost.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                  <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                    <ArrowPathIcon className="h-3 w-3" /> {order.date}
                  </div>
                  {order.status !== 'Received' ? (
                    <button 
                      onClick={() => handleReceiveOrder(order.id)}
                      className="text-[10px] font-black uppercase tracking-wider text-lime-600 dark:text-lime-400 hover:text-lime-700 dark:hover:text-lime-300 transition-colors"
                    >
                      Receive Units
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                      <CheckCircleIcon className="h-4 w-4" /> Cataloged
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-lime-50 to-teal-50 dark:from-lime-900/20 dark:to-teal-900/20 border border-lime-100 dark:border-lime-500/20 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 bg-lime-500/10 rounded-xl flex items-center justify-center mb-4">
                  <BeakerIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Smart Suggestions</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Based on trends, we suggest acquiring 3 more copies of "Quantum Computing 101".
                </p>
              </div>
              <button className="mt-6 text-[10px] font-black uppercase text-lime-700 dark:text-lime-400 tracking-widest hover:underline text-left">
                View Analytics →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LibraryAcquisitionsClient;