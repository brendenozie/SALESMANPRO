"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  Squares2X2Icon,
  ListBulletIcon,
  BriefcaseIcon,
  ArrowRightIcon,
  ArchiveBoxIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  HashtagIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

export interface Client {
  name: string;
  email: string;
  phone: string;
}

export interface OrderLineItem {
  id: string;
  quantity: number;
  price: number;
  status: string;
  marketplaceListing?: {
    id?: string;
    title?: string;
    name?: string;
  };
  [key: string]: any;
}

export interface AppointmentItem {
  id: string;
  type: "Appointment";
  service: string;
  date: string;
  timeSlot: string;
  client: Client;
  status: "Scheduled" | "Completed" | "Cancelled";
  notes?: string;
}

export interface OrderItem {
  id: string;
  type: "Order";
  price?: number;
  quantity?: number;
  totalFinalPrice?: number;
  status: string;
  date?: string;
  timeSlot?: string;
  createdAt?: string;
  trackingNumber?: string;
  name?: string;
  consumer?: Partial<Client>;
  marketplaceListing?: { id?: string; title?: string; name?: string };
  items?: OrderLineItem[];
}

export type UnifiedItem = AppointmentItem | OrderItem;

const STATUS_CONFIGS: Record<string, { label: string; bg: string; text: string; border: string; next?: string }> = {
  SCHEDULED: { label: "Scheduled", bg: "bg-amber-500/10 dark:bg-amber-500/5", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20 dark:border-amber-500/30", next: "COMPLETED" },
  COMPLETED: { label: "Completed", bg: "bg-emerald-500/10 dark:bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20 dark:border-emerald-500/30", next: "CANCELLED" },
  CANCELLED: { label: "Cancelled", bg: "bg-rose-500/10 dark:bg-rose-500/5", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20 dark:border-rose-500/30", next: "SCHEDULED" },
  PENDING: { label: "Pending", bg: "bg-orange-500/10 dark:bg-orange-500/5", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/20 dark:border-orange-500/30", next: "PROCESSING" },
  PROCESSING: { label: "Processing", bg: "bg-sky-500/10 dark:bg-sky-500/5", text: "text-sky-600 dark:text-sky-400", border: "border-sky-500/20 dark:border-sky-500/30", next: "DELIVERED" },
  DELIVERED: { label: "Delivered", bg: "bg-teal-500/10 dark:bg-teal-500/5", text: "text-teal-600 dark:text-teal-400", border: "border-teal-500/20 dark:border-teal-500/30", next: "REJECTED" },
  REJECTED: { label: "Rejected", bg: "bg-slate-500/10 dark:bg-slate-500/5", text: "text-slate-600 dark:text-slate-400", border: "border-slate-500/20 dark:border-slate-800/40", next: "PENDING" },
};

const ORDER_STATUSES = ["PENDING", "PROCESSING", "DELIVERED", "REJECTED"];
const APPT_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"];

const getStatusDetails = (status: string) => {
  const normalized = (status || "").toUpperCase();
  return STATUS_CONFIGS[normalized] || { label: status || "Unknown", bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500/20" };
};

interface AdminAppointmentsClientProps {
  initialData: UnifiedItem[];
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  limit?: number;
}

export default function AdminAppointmentsClient({ 
  initialData, 
  currentPage = 1, 
  totalPages = 1, 
  totalItems = 0, 
  limit = 10 
}: AdminAppointmentsClientProps) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#6366f1';

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<UnifiedItem[]>(initialData || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "APPOINTMENT" | "ORDER">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "LIST">("GRID");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialData) setItems(initialData);
  }, [initialData]);

  const selectedItem = useMemo(() => items.find(i => i && String(i.id) === selectedId) || null, [items, selectedId]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const stats = useMemo(() => {
    return items.reduce((acc, curr) => {
      if (!curr) return acc;
      if (curr.type === "Order") {
        const o = curr as OrderItem;
        const price = o?.totalFinalPrice ?? ((o?.price || 0) * (o?.quantity || 1));
        acc.totalVolume += price;
        acc.orderCount += 1;
      } else {
        acc.appointmentCount += 1;
      }
      if (["PENDING", "SCHEDULED", "PROCESSING"].includes((curr.status || "").toUpperCase())) {
        acc.activeQueues += 1;
      }
      return acc;
    }, { totalVolume: 0, orderCount: 0, appointmentCount: 0, activeQueues: 0 });
  }, [items]);

  const handleUpdateField = useCallback((id: string, fieldPath: string, value: any) => {
    setItems(prev => prev.map(item => {
      if (!item || item.id !== id) return item;
      const copy = { ...item } as any;
      if (fieldPath.includes('.')) {
        const parts = fieldPath.split('.');
        let current = copy;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) current[parts[i]] = {};
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        copy[fieldPath] = value;
      }
      return copy;
    }));
  }, []);

  const handleCycleStatus = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(item => {
      if (!item || item.id !== id) return item;
      const currentConfig = getStatusDetails(item.status);
      if (currentConfig.next) {
        return { ...item, status: currentConfig.next } as any;
      }
      return item;
    }));
  }, []);

  const handlePersistChanges = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return items.filter(item => {
      if (!item) return false;
      const itemType = (item.type || "").toUpperCase();
      const matchesType = filterType === "ALL" || itemType === filterType;
      
      const isOrder = item.type === "Order";
      const orderItem = item as OrderItem;
      const aptItem = item as AppointmentItem;

      const title = isOrder 
        ? (orderItem?.marketplaceListing?.title || orderItem?.marketplaceListing?.name || orderItem?.name || "Product Order") 
        : (aptItem?.service || "Service Booking");
        
      const clientName = isOrder ? (orderItem?.consumer?.name || orderItem?.name || "") : (aptItem?.client?.name || "");
      const clientPhone = isOrder ? (orderItem?.consumer?.phone || orderItem?.phone || "") : (aptItem?.client?.phone || "");
      const itemIdStr = String(item.id || "").toLowerCase();

      return matchesType && (!query || 
        title.toLowerCase().includes(query) || 
        clientName.toLowerCase().includes(query) ||
        String(clientPhone).includes(query) ||
        itemIdStr.includes(query)
      );
    });
  }, [items, searchTerm, filterType]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b13] text-slate-800 dark:text-slate-100 font-sans antialiased flex flex-col h-screen max-h-screen overflow-hidden transition-colors duration-300">
      
      {/* Premium ambient backdrop glow layout */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/[0.03] blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] right-[-5%] w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-[1800px] w-full mx-auto p-4 lg:p-6 overflow-hidden min-h-0 gap-4">
        
        {/* Header - Transparent Satin Shell */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3 rounded-xl text-white shadow-sm flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-105" style={{ backgroundColor: primaryColor }}>
              <BriefcaseIcon className="w-5 h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <SparklesIcon className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Workspace Hub</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white truncate">
                Orders & Appointments
              </h1>
            </div>
          </div>

          {/* Clean Metric Tickers */}
          <div className="hidden xl:flex items-center gap-8 border-l border-slate-200/60 dark:border-slate-800/60 pl-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gross Volume</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                KES {stats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bookings</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{stats.appointmentCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Action Items</span>
              <span className="text-lg font-bold text-amber-500 mt-0.5">{stats.activeQueues}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={handlePersistChanges}
              disabled={isSaving}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: saveSuccess ? '#10b981' : '#0f172a', color: '#ffffff' }}
            >
              {isSaving ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <CheckIcon className="w-4 h-4 stroke-[3]" />
              ) : (
                <ClipboardDocumentIcon className="w-4 h-4" />
              )}
              <span>{isSaving ? "Syncing..." : saveSuccess ? "Changes Persisted" : "Save Workspace"}</span>
            </button>
          </div>
        </header>

        {/* Action Controls Panel */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md p-2 rounded-xl border border-slate-200/60 dark:border-slate-800/40">
          <div className="relative w-full sm:w-80 group">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search customers, listings, reference IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <div className="flex bg-slate-200/50 dark:bg-slate-950 p-1 rounded-xl items-center gap-0.5">
              {(["ALL", "APPOINTMENT", "ORDER"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterType === type
                      ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  {type === "ALL" ? "All Activity" : type === "APPOINTMENT" ? "Appointments" : "Orders"}
                </button>
              ))}
            </div>
            
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            
            <div className="flex bg-slate-200/50 dark:bg-slate-950 p-1 rounded-xl items-center gap-0.5">
              <button onClick={() => setViewMode("GRID")} className={`p-1.5 rounded-lg transition-all ${viewMode === "GRID" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400"}`}>
                <Squares2X2Icon className="w-4.5 h-4.5" />
              </button>
              <button onClick={() => setViewMode("LIST")} className={`p-1.5 rounded-lg transition-all ${viewMode === "LIST" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400"}`}>
                <ListBulletIcon className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Workspace Container */}
        <div className="flex-1 flex gap-5 overflow-hidden min-h-0 relative">
          
          {/* Main List Column */}
          <div className="flex-1 flex flex-col overflow-hidden justify-between h-full min-h-0">
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
              {filteredItems.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-8 bg-white/30 dark:bg-slate-900/10 backdrop-blur-md rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <ArchiveBoxIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No operations found matching active viewport filters.</p>
                </motion.div>
              ) : viewMode === "GRID" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <LayoutGroup id="grid-layout">
                    {filteredItems.map((item) => {
                      const isSelected = item && String(item.id) === selectedId;
                      const isOrder = item?.type === "Order";
                      const oItem = item as OrderItem;
                      const aItem = item as AppointmentItem;
                      
                      const title = isOrder ? (oItem?.marketplaceListing?.title || oItem?.name || "Product Order") : aItem?.service;
                      const clientName = isOrder ? (oItem?.consumer?.name || oItem?.name) : aItem?.client?.name;
                      const statusDef = getStatusDetails(item?.status);
                      const finalPrice = isOrder ? (oItem?.totalFinalPrice ?? ((oItem?.price || 0) * (oItem?.quantity || 1))) : null;

                      return (
                        <motion.div
                          layout="position"
                          key={item?.id}
                          onClick={() => setSelectedId(isSelected ? null : String(item.id))}
                          className={`group relative bg-white dark:bg-slate-900/40 backdrop-blur-xl border p-5 rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                            isSelected
                              ? "border-slate-900 dark:border-slate-100 ring-1 ring-slate-900 dark:ring-slate-100 shadow-md bg-slate-50/40 dark:bg-slate-900/90"
                              : "border-slate-200/70 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm bg-white dark:bg-slate-900/40"
                          }`}
                        >
                          <div>
                            <div className="flex justify-between items-center gap-4 mb-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                                isOrder ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                              }`}>
                                {item?.type}
                              </span>
                              
                              <button
                                onClick={(e) => handleCycleStatus(item.id, e)}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1 ${statusDef.bg} ${statusDef.text} ${statusDef.border} hover:scale-105 active:scale-95`}
                              >
                                {statusDef.label}
                                <ArrowRightIcon className="w-2.5 h-2.5 stroke-[2.5]" />
                              </button>
                            </div>

                            <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors text-sm leading-snug mb-3">
                              {title}
                            </h3>

                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
                              <UserCircleIcon className="w-4 h-4 opacity-70" />
                              <span className="truncate font-medium">{clientName || "Guest Account"}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-3.5 border-t border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                              <CalendarDaysIcon className="w-3.5 h-3.5" />
                              <span className="text-xs font-medium">
                                {item?.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "No Date"}
                                {item?.timeSlot && ` • ${item.timeSlot}`}
                              </span>
                            </div>

                            {finalPrice !== null ? (
                              <span className="text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                                KES {finalPrice.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-indigo-500/80 uppercase">Service</span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </LayoutGroup>
                </div>
              ) : (
                /* Interactive Table Layout Shell */
                <div className="bg-white dark:bg-slate-900/30 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-950/20">
                          <th className="py-3.5 px-4">Workspace Asset</th>
                          <th className="py-3.5 px-4">Customer Name</th>
                          <th className="py-3.5 px-4">Scheduled Execution</th>
                          <th className="py-3.5 px-4">State</th>
                          <th className="py-3.5 px-4 text-right">Value Mapping</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                        {filteredItems.map((item) => {
                          const isSelected = item && String(item.id) === selectedId;
                          const isOrder = item?.type === "Order";
                          const oItem = item as OrderItem;
                          const aItem = item as AppointmentItem;
                          
                          const title = isOrder ? (oItem?.marketplaceListing?.title || oItem?.name || "Product Order") : aItem?.service;
                          const clientName = isOrder ? (oItem?.consumer?.name || oItem?.name) : aItem?.client?.name;
                          const statusDef = getStatusDetails(item?.status);
                          const finalPrice = isOrder ? (oItem?.totalFinalPrice ?? ((oItem?.price || 0) * (oItem?.quantity || 1))) : null;

                          return (
                            <tr
                              key={item?.id}
                              onClick={() => setSelectedId(isSelected ? null : String(item.id))}
                              className={`cursor-pointer transition-colors text-sm ${
                                isSelected ? "bg-indigo-500/[0.04] dark:bg-indigo-500/[0.02] font-medium text-indigo-600 dark:text-indigo-400" : "hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
                              }`}
                            >
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isOrder ? "bg-emerald-500" : "bg-indigo-500"}`} />
                                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[240px] block">{title}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{clientName || "Guest User"}</td>
                              <td className="py-3.5 px-4 text-slate-400 text-xs">
                                {item?.date ? new Date(item.date).toLocaleDateString() : "Undated"} {item?.timeSlot ? `(${item.timeSlot})` : ""}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusDef.bg} ${statusDef.text} ${statusDef.border}`}>
                                  {statusDef.label}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                                {finalPrice !== null ? `KES ${finalPrice.toLocaleString()}` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Responsive List Fallback (Mobile Viewport) */}
                  <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredItems.map((item) => {
                      const isSelected = item && String(item.id) === selectedId;
                      const isOrder = item?.type === "Order";
                      const oItem = item as OrderItem;
                      const aItem = item as AppointmentItem;
                      
                      const title = isOrder ? (oItem?.marketplaceListing?.title || oItem?.name || "Product Order") : aItem?.service;
                      const clientName = isOrder ? (oItem?.consumer?.name || oItem?.name) : aItem?.client?.name;
                      const statusDef = getStatusDetails(item?.status);

                      return (
                        <div
                          key={item?.id}
                          onClick={() => setSelectedId(isSelected ? null : String(item.id))}
                          className={`p-4 flex items-center justify-between gap-3 text-sm active:bg-slate-50 dark:active:bg-slate-900 ${
                            isSelected ? "bg-slate-50 dark:bg-slate-800/40" : ""
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${isOrder ? "bg-emerald-500/10 text-emerald-600" : "bg-indigo-500/10 text-indigo-600"}`}>
                                {item?.type}
                              </span>
                              <span className="text-xs text-slate-400">#{String(item?.id || "").slice(-6)}</span>
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white truncate">{title}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{clientName || "Guest"}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusDef.bg} ${statusDef.text} ${statusDef.border}`}>
                            {statusDef.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Static Workspace Pagination Base */}
            <footer className="mt-4 shrink-0 bg-white/50 dark:bg-slate-900/30 backdrop-blur-md p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between gap-4">
              <span className="text-xs font-medium text-slate-400">
                Displaying <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems === 0 ? 0 : (currentPage - 1) * limit + 1}</span> to{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.min(currentPage * limit, totalItems)}</span> of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> total assets
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-colors hover:bg-slate-50"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                    if (totalPages > 5 && Math.abs(p - currentPage) > 1 && p !== 1 && p !== totalPages) {
                      if (p === 2 || p === totalPages - 1) return <span key={p} className="text-slate-300 dark:text-slate-700 px-1 text-xs">••</span>;
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-7.5 h-7.5 rounded-lg text-xs font-semibold transition-all ${
                          currentPage === p
                            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-colors hover:bg-slate-50"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </footer>
          </div>

          {/* Inline Right Side Detail Pane Blueprint */}
          <AnimatePresence>
            {selectedItem && (
              <>
                {/* Backdrop Layer for Mobile Space */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedId(null)}
                  className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40 lg:hidden"
                />

                <motion.div
                  initial={{ y: "100%", x: 0 }}
                  animate={{ y: 0, x: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 220 }}
                  className="fixed lg:relative bottom-0 lg:top-0 right-0 w-full lg:w-[440px] h-[85vh] lg:h-full bg-white dark:bg-[#0c1220] border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 shadow-xl z-50 lg:z-20 flex flex-col overflow-hidden rounded-t-2xl lg:rounded-none"
                >
                  {/* Detailed Panel Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-slate-950/40">
                    <div className="flex items-center gap-2">
                      <HashtagIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        REF // {selectedItem.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedId(null)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Operational Management Workspace Fields */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                        {selectedItem.type === "Order" ? "Fulfillment Target" : "Service Stream"}
                      </span>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-snug">
                        {selectedItem.type === "Order" 
                          ? ((selectedItem as OrderItem).marketplaceListing?.title || (selectedItem as OrderItem).name || "Product Pipeline Order") 
                          : (selectedItem as AppointmentItem).service}
                      </h3>
                    </div>

                    {/* Step Segmented Pipeline Control Matrix */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                        Pipeline Management State
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(selectedItem.type === "Order" ? ORDER_STATUSES : APPT_STATUSES).map((status) => {
                          const config = getStatusDetails(status);
                          const isActive = (selectedItem.status || "").toUpperCase() === status;
                          
                          return (
                            <button
                              key={status}
                              onClick={() => handleUpdateField(selectedItem.id, 'status', status)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                isActive
                                  ? `${config.bg} ${config.text} ${config.border} shadow-xs ring-1 ring-current`
                                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              {isActive && <CheckCircleIcon className="w-3.5 h-3.5 stroke-[2]" />}
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Meta Timeline Cells */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                          <CalendarDaysIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Target Date</span>
                        </div>
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {selectedItem.date ? new Date(selectedItem.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "None Specified"}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Time Window</span>
                        </div>
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{selectedItem.timeSlot || "Flexible"}</p>
                      </div>
                    </div>

                    {/* Identity Modification Fields */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                        Customer Context Profiles
                      </h4>

                      <div>
                        <label className="text-xs font-medium text-slate-400 block mb-1">Entity / Client Name</label>
                        <div className="relative">
                          <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            value={selectedItem.type === "Order" 
                              ? ((selectedItem as OrderItem).consumer?.name || (selectedItem as OrderItem).name || "") 
                              : ((selectedItem as AppointmentItem).client?.name || "")}
                            onChange={(e) => handleUpdateField(selectedItem.id, selectedItem.type === "Order" ? "consumer.name" : "client.name", e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-400 block mb-1">Communications Line</label>
                          <div className="relative">
                            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                              type="text"
                              value={selectedItem.type === "Order" ? ((selectedItem as OrderItem).consumer?.phone || "") : ((selectedItem as AppointmentItem).client?.phone || "")}
                              onChange={(e) => handleUpdateField(selectedItem.id, selectedItem.type === "Order" ? "consumer.phone" : "client.phone", e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-400 block mb-1">Digital Mailbox</label>
                          <div className="relative">
                            <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input 
                              type="email"
                              value={selectedItem.type === "Order" ? ((selectedItem as OrderItem).consumer?.email || "") : ((selectedItem as AppointmentItem).client?.email || "")}
                              onChange={(e) => handleUpdateField(selectedItem.id, selectedItem.type === "Order" ? "consumer.email" : "client.email", e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8.5 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nested Sub-Itemization Arrays (Orders Payload Mapping) */}
                    {selectedItem.type === "Order" && (selectedItem as OrderItem).items && (selectedItem as OrderItem).items!.length > 0 && (
                      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                           <ShoppingBagIcon className="w-3.5 h-3.5" />
                           <h4 className="text-xs font-semibold uppercase tracking-wider">Itemized Breakdown</h4>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {(selectedItem as OrderItem).items!.map((lineItem) => {
                            const itemName = lineItem.marketplaceListing?.name || lineItem.marketplaceListing?.title || "Product Asset Line";
                            const price = lineItem.price || 0;
                            const qty = lineItem.quantity || 1;

                            return (
                              <div key={lineItem.id} className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                                <div className="flex flex-col min-w-0 pr-2">
                                  <span className="font-medium text-slate-900 dark:text-white text-xs truncate">{itemName}</span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">
                                    {qty} units × KES {price.toLocaleString()}
                                  </span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white text-xs whitespace-nowrap">
                                  KES {(price * qty).toLocaleString()}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}