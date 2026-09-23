"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  CheckBadgeIcon,
  SunIcon,
  MoonIcon
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
  shelfLocation?: string; // Added for search compatibility
}

interface Props {
  initialItems?: InventoryItem[];
  schoolId?: string;
}

const LibraryInventoryClient: React.FC<Props> = ({ initialItems = [], schoolId = "" }) => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Theme Persistence
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

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.shelfLocation?.toLowerCase().includes(search.toLowerCase()) ||
      item.shelf.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, items]);

  const handleAuditItem = async (id: string) => {
    const loader = toast.loading("Verifying asset...");
    try {
      const res = await fetch(`/api/admin/library/inventory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id, integrity: 100 })
      });

      if (res.ok) {
        setItems(prev => prev.map(item => 
          item.id === id ? { ...item, lastAudit: new Date().toLocaleDateString(), integrity: 100 } : item
        ));
        toast.success("Asset Verified", { id: loader });
      }
    } catch (err) {
      toast.error("Audit sync failed.", { id: loader });
    }
  };

  const flagAsset = async (id: string) => {
    const damage = window.prompt("Assess damage level (0-100% integrity):", "80");
    if (damage && !isNaN(Number(damage))) {
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, integrity: Number(damage) } : item
      ));
      toast.error(`Asset Flagged: Integrity set to ${damage}%`);
    }
  };

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-8 transition-colors duration-300">
        <Toaster position="top-right" />

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-1 w-12 bg-blue-600 dark:bg-blue-500 rounded-full" />
                <span className="text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Asset Management</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Inventory.</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* <button 
                onClick={toggleTheme}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500/50 transition-colors"
              >
                {theme === "dark" ? <SunIcon className="h-5 w-5 text-orange-400" /> : <MoonIcon className="h-5 w-5 text-slate-600" />}
              </button> */}
              
              <div className="px-6 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Items Loaded</span>
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">{filteredItems.length}</span>
              </div>
              
              <button 
                onClick={() => toast.loading("Scanning network...")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <ShieldCheckIcon className="h-5 w-5" />
                Start Audit
              </button>
            </div>
          </header>

          {/* Search */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-grow">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by ID, Title, or Shelf..."
                className="w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-4 outline-none transition-all"
              />
            </div>
            <button className="px-6 py-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
              <AdjustmentsVerticalIcon className="h-5 w-5" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="group relative bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:shadow-lg transition-all">
                <div className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-6">
                  <div className="md:col-span-4 flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <ArchiveBoxIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs font-mono text-slate-500">{item.id}</p>
                    </div>
                  </div>

                  <div className="md:col-span-3 flex items-center gap-6">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Shelf</p>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <MapPinIcon className="h-3.5 w-3.5 text-blue-500" />
                        {item.shelf}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Last Audit</p>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{item.lastAudit}</span>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-2">
                      <span>Integrity</span>
                      <span className={item.integrity < 90 ? 'text-amber-500' : 'text-emerald-500'}>{item.integrity}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.integrity < 90 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${item.integrity}%` }} />
                    </div>
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-2">
                    <button onClick={() => handleAuditItem(item.id)} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all">
                      <CheckBadgeIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => flagAsset(item.id)} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all">
                      <ExclamationCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LibraryInventoryClient;