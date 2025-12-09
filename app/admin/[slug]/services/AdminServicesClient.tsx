"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
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
  ChevronDownIcon,
  InboxIcon
} from "@heroicons/react/24/outline";

import Image from "next/image";
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm } from "@/types/typings";
import ServiceListingForm from "./components/ServiceListingForm";

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// -----------------------------------------------------------
// ANIMATION VARIANTS
// -----------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// -----------------------------------------------------------
// SUB-COMPONENTS
// -----------------------------------------------------------

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-600 ring-emerald-500/30",
    PENDING: "bg-amber-50 text-amber-600 ring-amber-500/30",
    REJECTED: "bg-rose-50 text-rose-600 ring-rose-500/30",
  };
  
  const Icon = status === "ACTIVE" ? CheckCircleIcon : status === "PENDING" ? ClockIcon : status === "REJECTED" ? XCircleIcon : NoSymbolIcon;
  const defaultStyle = "bg-slate-50 text-slate-600 ring-slate-500/30";

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${styles[status] || defaultStyle}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

// -----------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------

export default function AdminServicesClient({
  initialServices,
  categoriesData,
  companyId,
  paymentOptions,
  deliveryMethods
}: any) {
  const [services, setServices] = useState<MarketListingForm[]>(initialServices);
  const [editingService, setEditingService] = useState<MarketListingForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // NEW: View Toggle
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#4F46E5";

  // --- FETCHING & FILTERING LOGIC (Identical to original, kept for functionality) ---
  const fetchServices = async (pageNum: number) => {
    try {
      const res = await fetch(`/api/admin/my-market-place?companyId=${companyId}&page=${pageNum}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      const list = json?.data?.results || json?.data?.listing || json || [];
      const formatted = list.map((i: any) => ({ ...i, createdAt: i.createdAt ? new Date(i.createdAt) : null }));
      if (pageNum === 1) setServices(formatted);
      else setServices(prev => [...prev, ...formatted]);
    } catch (e) {
      console.error("SERVICE FETCH ERROR:", e);
    }
  };

  useEffect(() => {
    if (companyId) fetchServices(page);
  }, [page]);

  const processedServices = useMemo(() => {
    let list = [...services];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      list = list.filter(x => x.name?.toLowerCase().includes(s) || x.status?.toLowerCase().includes(s));
    }
    if (sortConfig) {
      list.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [services, searchTerm, sortConfig]);

  const handleSort = (key: keyof MarketListingForm) => {
    setSortConfig((current: any) => ({ key, direction: current?.direction === "asc" ? "desc" : "asc" }));
  };

  // --- ACTIONS ---
  const openCreate = () => { setEditingService(null); setIsFormModalOpen(true); };
  const openEdit = (svc: MarketListingForm) => { setEditingService(svc); setIsFormModalOpen(true); };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await fetch(`/api/admin/post-market-list/${id}`, { method: "DELETE" });
      setServices(prev => prev.filter(s => s.id !== id));
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
      const json = await res.json();
      if (data.id) setServices(prev => prev.map(s => (s.id === data.id ? json.data : s)));
      else setServices(prev => [json.data, ...prev]);
      setIsFormModalOpen(false);
    } catch (err) { console.error(err); }
  };

  // -----------------------------------------------------------
  // RENDER HELPERS
  // -----------------------------------------------------------

  const EmptyState = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <InboxIcon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No services found</h3>
      <p className="text-gray-500 max-w-sm mt-1">
        {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first service listing."}
      </p>
      {!searchTerm && (
        <button onClick={openCreate} className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-500">
          Create new service &rarr;
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Services</h1>
          <p className="text-gray-500 mt-1">Manage your market listings and pricing.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-xl shadow-md transition-all"
          style={{ backgroundColor: primaryColor }}
        >
          <PlusIcon className="w-5 h-5" />
          Add Service
        </motion.button>
      </div>

      {/* TOOLBAR */}
      <div className="sticky top-4 z-20 flex flex-col md:flex-row items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-2 rounded-2xl border border-gray-200/50 dark:border-gray-800 shadow-sm mb-8">
        {/* Search */}
        <div className="relative flex-1 w-full md:w-auto">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            className="w-full bg-transparent pl-10 pr-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
            placeholder="Search by name, category, or status..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />

        {/* Actions Group */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Filter/Sort (Visual only for now, could be expanded) */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors text-gray-700 dark:text-gray-300">
            <FunnelIcon className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        {processedServices.length === 0 ? (
          <EmptyState key="empty" />
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {processedServices.map((service: any) => (
              <motion.div
                key={service.id}
                variants={itemVariants}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Image Area */}
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  {service?.images?.[0] ? (
                    <Image
                      fill
                      alt={service.name}
                      loader={loader}
                      src={service.images[0].url || service.images[0]}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <PhotoIcon className="w-10 text-gray-300" />
                    </div>
                  )}
                  {/* Floating Status */}
                  <div className="absolute top-3 right-3 backdrop-blur-md bg-white/80 dark:bg-black/50 rounded-full px-2 py-1 shadow-sm">
                    <StatusBadge status={service.status} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {categoriesData.find((c: any) => c.id === service.productCategoryId)?.name || "Service"}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{service.description || "No description provided."}</p>
                  
                  <div className="flex items-end justify-between pt-4 border-t border-gray-50 dark:border-gray-800 mt-auto">
                    <div className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                      {service.currency || "$"} {Number(service.sellingPrice).toLocaleString()}
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(service)} className="p-2 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-gray-600 transition-colors">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(service.id)} className="p-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-600 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* LIST VIEW */
          <motion.div
            key="list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-950">
                <tr>
                  {[
                    { label: "Service Details", key: "name", width: "w-[40%]" },
                    { label: "Category", key: "productCategoryId" },
                    { label: "Price", key: "sellingPrice" },
                    { label: "Status", key: "status" },
                    { label: "", key: "actions" }
                  ].map(h => (
                    <th
                      key={h.key}
                      onClick={() => h.key !== 'actions' && handleSort(h.key as any)}
                      className={`px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${h.width || ''} ${h.key !== 'actions' ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        {h.label}
                        {h.key !== 'actions' && <ArrowsUpDownIcon className="w-3 h-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {processedServices.map((service: any) => (
                  <motion.tr
                    key={service.id}
                    variants={itemVariants}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-200 dark:border-gray-700">
                          {service?.images?.[0] ? (
                            <Image fill alt="" loader={loader} src={service.images[0].url || service.images[0]} className="object-cover" />
                          ) : (
                            <PhotoIcon className="w-6 h-6 m-auto text-gray-400 absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{service.name}</div>
                          <div className="text-sm text-gray-500 max-w-[200px] truncate">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categoriesData.find((c: any) => c.id === service.productCategoryId)?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 dark:text-white">
                      {Number(service.sellingPrice).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={service.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(service)} className="text-indigo-600 hover:text-indigo-900 dark:hover:text-indigo-400 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                           <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(service.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOAD MORE */}
      <div className="flex justify-center mt-12 mb-6">
        <button
          onClick={() => setPage(p => p + 1)}
          className="group relative px-6 py-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md text-sm font-medium text-gray-600 dark:text-gray-300 transition-all active:scale-95"
        >
          <span className="flex items-center gap-2">
            Load More Results
            <ChevronDownIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </span>
        </button>
      </div>

      {/* MODAL */}
      <ServiceListingForm
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSubmit}
        initialData={editingService}
        productCategories={categoriesData}
        paymentOptions={paymentOptions}
        deliveryMethods={deliveryMethods}
      />
    </div>
  );
}