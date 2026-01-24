"use client";

import React, { useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  Square3Stack3DIcon, 
  MapPinIcon, 
  ShieldCheckIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsVerticalIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

interface InventoryItem {
  id: string;
  title: string;
  category: string;
  shelf: string;
  condition: string;
  integrity: number;
  lastAudit: string;
  status: 'In-Stock' | 'Auditing' | 'Missing';
}

const LibraryInventoryClient = ({ initialItems = [], schoolId = "" }) => {
  // const [search, setSearch] = useState("");
  // const [items, setItems] = useState<InventoryItem[]>(initialItems.length > 0 ? initialItems : [
  //   { id: 'INV-7721', title: 'Deep Learning', category: 'Technology', shelf: 'A-12', condition: 'Mint', integrity: 100, lastAudit: '2023-12-01', status: 'In-Stock' },
  //   { id: 'INV-4402', title: 'The Art of War', category: 'Philosophy', shelf: 'C-04', condition: 'Fair', integrity: 82, lastAudit: '2023-11-15', status: 'In-Stock' },
  //   { id: 'INV-9910', title: 'Introduction to Algorithms', category: 'Education', shelf: 'A-02', condition: 'Good', integrity: 95, lastAudit: '2023-12-05', status: 'In-Stock' },
  // ]);

  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>(initialItems);

  // Filter logic
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.shelfLocation?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  // DB Audit Function
  const handleAuditItem = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/library/inventory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id, integrity: 100 })
      });

      if (res.ok) {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, lastAudit: new Date().toISOString(), integrity: 100 } : item
        ));
        toast.success(`Asset Verified: Physical presence logged.`);
      }
    } catch (err) {
      toast.error("Audit sync failed.");
    }
  };

  // Flag Asset (Integrity reduction)
  const flagAsset = async (id: string) => {
    const damage = window.prompt("Assess damage level (0-100% integrity remaining):", "80");
    if (damage && !isNaN(Number(damage))) {
      try {
        await fetch(`/api/admin/library/inventory`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: id, integrity: Number(damage) })
        });
        
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, integrity: Number(damage) } : item
        ));
        toast.error(`Asset Flagged: Integrity dropped to ${damage}%`);
      } catch (err) {
        toast.error("Update failed.");
      }
    }
  };


  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items Loaded</span>
                <span className="text-xl font-black text-blue-400">{filteredItems.length}</span>
             </div>
             <button 
                onClick={() => toast.loading("Scanning network for RFID tags...")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
              >
                <ShieldCheckIcon className="h-5 w-5" />
                Start Audit
             </button>
          </div>
        </header>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow group">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter inventory by Tag ID, Title, or Shelf..."
              className="w-full bg-slate-900/40 border border-slate-800 focus:border-blue-500/50 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all">
            <AdjustmentsVerticalIcon className="h-5 w-5" />
            Sort
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="group relative bg-slate-900/20 border border-slate-800/60 rounded-3xl p-6 hover:bg-slate-900/40 transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500/5 transition-all duration-1000"
                style={{ width: `${item.integrity}%` }}
              />

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 border border-slate-700/50">
                    <ArchiveBoxIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-blue-300 transition-colors">{item.title}</h4>
                    <p className="text-xs font-mono text-slate-500 tracking-tighter">{item.id}</p>
                  </div>
                </div>

                <div className="md:col-span-3 flex items-center gap-6">
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Shelf Location</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPinIcon className="h-3.5 w-3.5 text-blue-500" />
                      {item.shelf}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Audit Status</p>
                    <span className="text-[9px] font-mono text-slate-500 italic">
                      {item.lastAudit}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <div className="flex justify-between text-[9px] font-bold text-slate-600 uppercase mb-2">
                    <span>Physical Integrity</span>
                    <span className={item.integrity < 90 ? 'text-amber-400' : 'text-emerald-400'}>{item.integrity}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${item.integrity < 90 ? 'bg-amber-500' : 'bg-blue-500'}`}
                      style={{ width: `${item.integrity}%` }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2">
                  <button 
                    onClick={() => handleAuditItem(item.id)}
                    title="Verify Presence" 
                    className="p-3 bg-slate-800 hover:bg-emerald-900/40 text-slate-400 hover:text-emerald-400 rounded-xl transition-all active:scale-90"
                  >
                    <CheckBadgeIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => flagAsset(item.id)}
                    title="Flag Issue" 
                    className="p-3 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                  >
                    <ExclamationCircleIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-20 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500 font-medium">No assets found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default LibraryInventoryClient;