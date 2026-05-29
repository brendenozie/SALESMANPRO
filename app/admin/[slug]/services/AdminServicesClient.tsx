"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
  PencilSquareIcon,
  TrashIcon,
  PhotoIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  NoSymbolIcon,
  Squares2X2Icon,
  ListBulletIcon,
  InboxIcon,
  BanknotesIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

import Image from "next/image";
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm } from "@/types/typings";
import ServiceListingForm from "./components/ServiceListingForm";
import AddToProductMarketModal from "@/components/AddToProductMarketModal";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const LayersIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2L1 7L12 12L23 7L12 2Z" fill="currentColor" />
  </svg>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.01 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } }
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
    REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20",
  };
  const Icon = status === "ACTIVE" ? CheckCircleIcon : status === "PENDING" ? ClockIcon : status === "REJECTED" ? XCircleIcon : NoSymbolIcon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${styles[status] || "bg-slate-500/10 text-slate-600 ring-slate-500/20"}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

export default function AdminServicesClient({
  initialServices, // Expected format match from API response wrapper structure now
  categoriesData,
  companyId,
  // paymentOptions,
  // deliveryMethods
}: any) {
  // Extract server-side payloads safely on hydration phase initialization
  const [services, setServices] = useState<MarketListingForm[]>(initialServices?.results || []);
  const [meta, setMeta] = useState({
    total: initialServices?.meta?.total || 0,
    totalPages: initialServices?.meta?.totalPages || 1,
    limit: initialServices?.meta?.limit || 8
  });

  const [currentPage, setCurrentPage] = useState(initialServices?.meta?.page || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [editingService, setEditingService] = useState<MarketListingForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("ALL");
  const [sortConfig, setSortConfig] = useState<{ key: keyof MarketListingForm; direction: "asc" | "desc" } | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#4F46E5";

  // Aggregated pricing trends across the visible window frame context
  const avgPrice = useMemo(() => {
    return services.length ? Math.round(services.reduce((acc, s) => acc + Number(s.sellingPrice || 0), 0) / services.length) : 0;
  }, [services]);

  // --- DRIVER CORE EFFECT: SERVER PAGINATION CONTEXT FETCH ---
  const fetchServices = async (pageTarget: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/my-market-place?companyId=${companyId}&page=${pageTarget}&limit=${meta.limit}`, {
        cache: "no-store"
      });
      if (!res.ok) throw new Error("Network synchronization failed");
      const json = await res.json();
      
      // Target nesting path based directly on withApiHandler parsing schema output matching format
      const dataPayload = json?.data || json;
      
      setServices(dataPayload?.results || []);
      setMeta({
        total: dataPayload?.meta?.total || 0,
        totalPages: dataPayload?.meta?.totalPages || 1,
        limit: dataPayload?.meta?.limit || 8
      });
    } catch (e) {
      console.error("Error executing server pagination reload operation:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Synchronize internal layout frames on dependency index change triggers
  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage]);

  // Handle remaining sort and text search safely on the paginated block slice
  const processedServices = useMemo(() => {
    let list = [...services];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(x => x.name?.toLowerCase().includes(s) || x.description?.toLowerCase().includes(s));
    }
    if (activeCategoryFilter !== "ALL") {
      list = list.filter(x => x.productCategoryId === activeCategoryFilter);
    }
    if (sortConfig) {
      list.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [services, searchTerm, activeCategoryFilter, sortConfig]);

  // Clean bounds math values
  const currentRangeStart = (currentPage - 1) * meta.limit + 1;
  const currentRangeEnd = Math.min(currentPage * meta.limit, meta.total);

  const handleSort = (key: keyof MarketListingForm) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc"
    }));
  };

  const openCreate = () => { setEditingService(null); setIsFormModalOpen(true); };
  const openEdit = (svc: MarketListingForm) => { setEditingService(svc); setIsFormModalOpen(true); };
  
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this listing service?")) return;
    try {
      await fetch(`/api/admin/post-market-list/${id}`, { method: "DELETE" });
      setServices(prev => prev.filter(s => s.id !== id));
      setMeta(p => ({ ...p, total: p.total - 1 }));
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (data: MarketListingForm) => {
    try {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch(`/api/admin/post-market-list`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, companyId })
      });
      if (res.ok) {
        // Simple reload to let server compute true state adjustments
        fetchServices(currentPage);
        setIsFormModalOpen(false);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 transition-all duration-300">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Marketplace Listings</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm sm:text-base">Configure and monitor database assets matching runtime search configurations.</p>
          </div>
          <motion.button
            whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white shadow-lg shadow-indigo-600/10 transition-all self-start sm:self-center text-sm"
            style={{ backgroundColor: primaryColor }}
          >
            <PlusIcon className="w-5 h-5 stroke-[2.5]" />
            Add New Service
          </motion.button>
        </div>

        {/* STATS DECK */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Data Registry", val: meta.total, icon: LayersIcon, color: "text-blue-500" },
            { label: "Active Page Items", val: services.length, icon: CheckCircleIcon, color: "text-emerald-500" },
            { label: "Total Pages Available", val: meta.totalPages, icon: ClockIcon, color: "text-amber-500" },
            { label: "Page Avg Price", val: `$${avgPrice.toLocaleString()}`, icon: BanknotesIcon, color: "text-indigo-500" }
          ].map((card, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
                <h4 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">{card.val}</h4>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 ${card.color}`}>
                <card.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH AND INTERACTION CONTROLS */}
        <div className="sticky top-4 z-30 flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 pl-11 pr-4 py-2.5 rounded-xl text-sm outline-none context-ring"
                placeholder="Filter downloaded records view frame..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setActiveCategoryFilter("ALL")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeCategoryFilter === "ALL" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" : "bg-slate-50 dark:bg-slate-950 text-slate-500"}`}
              >
                All
              </button>
              {categoriesData.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeCategoryFilter === cat.id ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950" : "bg-slate-50 dark:bg-slate-950 text-slate-500"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end border-t xl:border-t-0 pt-3 xl:pt-0 border-slate-100 dark:border-slate-800">
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 p-1 rounded-xl">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-400'}`}>
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-400'}`}>
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTAINER SHELF RENDER OR OPACITY LOADER STATE LAYER */}
        <div className="relative min-h-[400px]">
          {isLoading && (
            <div className="absolute inset-0 bg-slate-50/40 dark:bg-slate-950/40 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-2xl transition-all">
              <div className="h-9 w-9 border-4 border-t-transparent animate-spin rounded-full" style={{ borderColor: `${primaryColor} transparent transparent transparent` }} />
            </div>
          )}

          <AnimatePresence mode="wait">
            {processedServices.length === 0 ? (
              <motion.div 
                key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900"
              >
                <InboxIcon className="w-12 h-12 text-slate-400 mb-3" />
                <h3 className="text-lg font-bold">No assets found</h3>
                <p className="text-slate-400 text-sm max-w-sm mt-1">No operational listings records found for your context parameters on this page index.</p>
              </motion.div>
            ) : viewMode === "grid" ? (
              <motion.div key="grid" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {processedServices.map((service: any) => (
                  <motion.div key={service.id} variants={itemVariants} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex flex-col overflow-hidden">
                    <div className="aspect-[16/11] relative bg-slate-100 dark:bg-slate-950">
                      {service?.images?.[0] ? (
                        <Image fill alt="" loader={loader} src={service.images[0].url || service.images[0]} className="object-cover" />
                      ) : (
                        <PhotoIcon className="w-8 text-slate-300 absolute inset-0 m-auto" />
                      )}
                      <div className="absolute top-3 right-3"><StatusBadge status={service.status} /></div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1"><TagIcon className="w-3 h-3 inline mr-1" />{(service?.category || "Uncategorized")}</span>
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">{service.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">{service.description || "No description provided."}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400">Price Rate</p>
                          <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{service.currency || "$"} {Number(service.sellingPrice).toLocaleString()}</div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(service)} className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 dark:bg-slate-800 rounded-xl"><PencilSquareIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(service.id)} className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-600 dark:bg-slate-800 rounded-xl"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div key="list" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                      {[{ label: "Service Details", key: "name", width: "w-[45%]" }, { label: "Category", key: "productCategoryId", width: "w-[20%]" }, { label: "Base Price", key: "sellingPrice", width: "w-[15%]" }, { label: "Status", key: "status", width: "w-[12%]" }, { label: "", key: "actions", width: "w-[8%]" }].map(h => (
                        <th key={h.key} onClick={() => h.key !== 'actions' && handleSort(h.key as any)} className={`px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider ${h.width} ${h.key !== 'actions' ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}>
                          <div className="flex items-center gap-1.5">{h.label}{h.key !== 'actions' && <ArrowsUpDownIcon className="w-3 h-3" />}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {processedServices.map((service: any) => (
                      <tr key={service.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200/60">
                              {service?.images?.[0] ? <Image fill alt="" loader={loader} src={service.images[0].url || service.images[0]} className="object-cover" /> : <PhotoIcon className="w-5 h-5 text-slate-300 absolute inset-0 m-auto" />}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{service.name}</div>
                              <div className="text-xs text-slate-400 max-w-[280px] truncate mt-0.5">{service.description || "No description provided."}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{categoriesData.find((c: any) => c.id === service.productCategoryId)?.name || "—"}</td>
                        <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900 dark:text-white">{service.currency || "$"} {Number(service.sellingPrice).toLocaleString()}</td>
                        <td className="px-6 py-4"><StatusBadge status={service.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(service)} className="text-slate-400 hover:text-indigo-600 p-1.5"><PencilSquareIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(service.id)} className="text-slate-400 hover:text-rose-600 p-1.5"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CONTROLS PANORAMA BAR */}
        {meta.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 px-6 py-4 rounded-2xl shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{currentRangeStart}</span> to{" "}
              <span className="font-bold text-slate-900 dark:text-white">{currentRangeEnd}</span> of{" "}
              <span className="font-bold text-slate-900 dark:text-white">{meta.total}</span> total registry rows
            </p>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-slate-950"
              >
                <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
              </button>

              {Array.from({ length: meta.totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                if (pageNum === 1 || pageNum === meta.totalPages || Math.abs(pageNum - currentPage) <= 1) {
                  return (
                    <button
                      key={pageNum}
                      disabled={isLoading}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-9 w-9 text-xs font-bold rounded-xl transition-all ${currentPage === pageNum ? "text-white" : "border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-950"}`}
                      style={currentPage === pageNum ? { backgroundColor: primaryColor } : {}}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === 2 || pageNum === meta.totalPages - 1) {
                  return <span key={pageNum} className="px-1 text-slate-400 text-xs font-bold select-none">...</span>;
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, meta.totalPages))}
                disabled={currentPage === meta.totalPages || isLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-slate-950"
              >
                <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* <ServiceListingForm
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSave={handleSubmit}
          initialData={editingService}
          productCategories={categoriesData}
          paymentOptions={paymentOptions}
          deliveryMethods={deliveryMethods}
        /> */}
          {isFormModalOpen && (
                <AddToProductMarketModal
                  showRequestProductModal={isFormModalOpen}
                  setShowRequestProductModal={setIsFormModalOpen}
                  product={null} 
                  marketListItem={editingService}
                  categories={categoriesData}
                  companyId={companyId}
                  locations={[]}
                />
              )}
      </div>
    </div>
  );
}