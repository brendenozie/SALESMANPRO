"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  CalendarDaysIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  TagIcon,
  CurrencyDollarIcon,
  TruckIcon,
  PhoneIcon,
  EnvelopeIcon,
  FunnelIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";


export interface Client {
  name: string;
  email: string;
  phone: string;
}

export interface AppointmentItem {
  id: string;
  type: "Appointment"; // Added for explicit type checking
  service: string;
  date: string;
  timeSlot: string;
  client: Client;
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

export interface OrderItem {
  id: string;
  type: "Order"; // Added for explicit type checking
  price: number;
  quantity: number;
  status: string;
  date: string;
  timeSlot: string;
  consumer: Partial<Client>; // Use Partial if some fields can be missing
  marketplaceListing?: { id?: string; title?: string };
  order?: {
    id?: string;
    status?: string;
    rider?: string;
    createdAt?: string;
  };
}

export type UnifiedItem = AppointmentItem | OrderItem;
// --- HELPERS ---
const KANBAN_COLUMNS = {
  TO_DO: { label: "Incoming", gradient: "from-amber-400 to-orange-500", statuses: ["SCHEDULED", "PENDING"] },
  IN_PROGRESS: { label: "In Flight", gradient: "from-blue-400 to-indigo-600", statuses: ["PROCESSING"] },
  COMPLETED: { label: "Finished", gradient: "from-emerald-400 to-cyan-500", statuses: ["COMPLETED", "DELIVERED"] },
  CANCELED: { label: "Archived", gradient: "from-slate-400 to-slate-600", statuses: ["CANCELLED", "REJECTED", "FAILED"] },
};

const formatDateTime = (dateString?: string, timeString?: string) => {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + (timeString ? ` • ${timeString}` : '');
};

// --- COMPONENTS ---

const StatusPill = ({ status, type }: { status: string; type: string }) => {
  const isOrder = type === "Order";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm uppercase tracking-wider ${
      isOrder ? "bg-teal-500/10 border-teal-500/30 text-teal-600" : "bg-indigo-500/10 border-indigo-500/30 text-indigo-600"
    }`}>
      {status}
    </span>
  );
};

const GlassCard = ({ item, onClick, primaryColor }: any) => {
  const isOrder = item.type === "Order";
  const title = isOrder ? item.marketplaceListing?.title : item.service;
  const clientName = isOrder ? item.consumer?.name : item.client?.name;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      onClick={() => onClick(item)}
      className="group relative bg-white/70 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700/50 p-4 rounded-2xl cursor-pointer overflow-hidden transition-all"
    >
      {/* Type Accent */}
      <div className={`absolute top-0 left-0 w-1 h-full ${isOrder ? 'bg-teal-500' : 'bg-indigo-500'}`} />
      
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-lg ${isOrder ? 'bg-teal-500/10 text-teal-600' : 'bg-indigo-500/10 text-indigo-600'}`}>
          {isOrder ? <ShoppingCartIcon className="w-5 h-5" /> : <CalendarDaysIcon className="w-5 h-5" />}
        </div>
        <StatusPill status={item.status} type={item.type} />
      </div>

      <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <UserCircleIcon className="w-4 h-4" />
        <span className="truncate">{clientName}</span>
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-bold">Scheduled</span>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{formatDateTime(item.date, item.timeSlot)}</span>
        </div>
        {isOrder && item.price && (
          <div className="text-right">
             <span className="text-xs font-bold text-emerald-600">${item.price.toFixed(2)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function AdminAppointmentsClient({ initialData }: { initialData: any[] }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#6366f1';
  
  const [items, setItems] = useState(initialData || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Filter and Group
  const filteredGroups = useMemo(() => {
    const groups: any = { TO_DO: [], IN_PROGRESS: [], COMPLETED: [], CANCELED: [] };
    const search = searchTerm.toLowerCase();

    items.filter(item => {
      const title = (item.type === "Order" ? item.marketplaceListing?.title : item.service) || "";
      const client = (item.type === "Order" ? item.consumer?.name : item.client?.name) || "";
      return title.toLowerCase().includes(search) || client.toLowerCase().includes(search);
    }).forEach(item => {
      const status = item.status.toUpperCase();
      for (const [key, config] of Object.entries(KANBAN_COLUMNS)) {
        if (config.statuses.includes(status)) {
          groups[key].push(item);
          break;
        }
      }
    });
    return groups;
  }, [items, searchTerm]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 md:p-8 transition-colors duration-500">
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-teal-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-[1600px] mx-auto">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-indigo-600 tracking-widest uppercase">Operations</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500">Center</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search everything..."
                className="w-full md:w-80 pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none focus:ring-2 focus:ring-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <LayoutGroup>
            {Object.entries(KANBAN_COLUMNS).map(([key, config]) => (
              <div key={key} className="flex flex-col min-h-[70vh]">
                <div className="flex items-center justify-between mb-6 px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${config.gradient}`} />
                    <h2 className="font-black text-gray-700 dark:text-gray-300 uppercase tracking-tighter text-sm">
                      {config.label}
                    </h2>
                    <span className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
                      {filteredGroups[key].length}
                    </span>
                  </div>
                  <FunnelIcon className="w-4 h-4 text-gray-400 cursor-pointer hover:text-indigo-500" />
                </div>

                <div className="flex-1 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredGroups[key].map((item: any) => (
                      <GlassCard 
                        key={item.id} 
                        item={item} 
                        onClick={setSelectedItem} 
                        primaryColor={primaryColor} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </LayoutGroup>
        </div>
      </div>

      {/* Side Panel Overlay */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[70] p-8 flex flex-col"
            >
              <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>

              <div className="mb-8 mt-4">
                <StatusPill status={selectedItem.status} type={selectedItem.type} />
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-4">
                  {selectedItem.type === "Order" ? selectedItem.marketplaceListing?.title : selectedItem.service}
                </h2>
                <p className="text-gray-500 font-mono text-xs mt-1 uppercase tracking-widest">UID: {selectedItem.id.slice(0, 12)}</p>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <section>
                  <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Customer Profile</h4>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                        {(selectedItem.type === "Order" ? selectedItem.consumer?.name : selectedItem.client?.name)?.[0]}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedItem.type === "Order" ? selectedItem.consumer?.name : selectedItem.client?.name}</p>
                         <p className="text-xs text-gray-500">{selectedItem.type === "Order" ? selectedItem.consumer?.email : selectedItem.client?.email}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold hover:shadow-md transition-all">
                         <PhoneIcon className="w-4 h-4 text-indigo-500" /> Call
                       </button>
                       <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-xs font-bold hover:shadow-md transition-all">
                         <EnvelopeIcon className="w-4 h-4 text-teal-500" /> Email
                       </button>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Logistics & Timing</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                       <ClockIcon className="w-5 h-5 text-gray-400 mb-2" />
                       <p className="text-[10px] text-gray-400 uppercase font-bold">Time Slot</p>
                       <p className="text-sm font-bold">{selectedItem.timeSlot || "Anytime"}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                       <CalendarDaysIcon className="w-5 h-5 text-gray-400 mb-2" />
                       <p className="text-[10px] text-gray-400 uppercase font-bold">Date</p>
                       <p className="text-sm font-bold">{selectedItem.date}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase px-2">Action Center</p>
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Update Status
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}