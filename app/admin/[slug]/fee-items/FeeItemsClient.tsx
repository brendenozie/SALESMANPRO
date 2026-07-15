"use client";

import React, { useMemo, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import AddEditFeeItemModal from "./AddEditFeeItemModal";
import DeleteFeeItemModal from "./DeleteFeeItemModal";
import { FeeItem } from "@/lib/data";
import { AcademicLevelOption } from "../schoolAnnouncements/AdminAnnouncementsPage";
import { ClassRoomOption } from "../students/StudentsClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  initialFeeItems: FeeItem[];
  allAcademicLevels: AcademicLevelOption[];
  allClassrooms: ClassRoomOption[];
  schoolId: string;
}

const FeeItemsClient: React.FC<Props> = ({ 
  initialFeeItems, 
  schoolId, 
  allAcademicLevels, 
  allClassrooms 
}) => {
  const [feeItems, setFeeItems] = useState<FeeItem[]>(initialFeeItems);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<FeeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FeeItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Sync theme configurations with system element hierarchy
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Calculated Analytics State
  const totalItems = feeItems.length;
  
  const avgFee = useMemo(() => {
    if (!totalItems) return "0.00";
    const totalAmount = feeItems.reduce((acc, curr) => acc + Number(curr.defaultAmount), 0);
    return (totalAmount / totalItems).toFixed(2);
  }, [feeItems, totalItems]);

  const uniqueAudiencesCount = useMemo(() => {
    const audiences = new Set(feeItems.map(item => item.applicableTo));
    return audiences.size;
  }, [feeItems]);

  const filteredItems = useMemo(() => {
    return feeItems.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [feeItems, search]);

  const refresh = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fee-items?companyId=${schoolId}`, { credentials: "include" });
      if (res.ok) {
        const json = await res.json();
        setFeeItems(json.data || []);
        toast.success("Billing ledger synchronized");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Could not pull live fee configurations");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async (data: Partial<FeeItem>) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Processing transaction...");
    try {
      const res = await fetch(
        editingItem ? `${apiBaseUrl}/admin/fee-items/${editingItem.id}` : `${apiBaseUrl}/admin/fee-items`,
        {
          method: editingItem ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, companyId: schoolId }),
        }
      );
      if (!res.ok) throw new Error();
      
      const resRefresh = await fetch(`${apiBaseUrl}/admin/fee-items?companyId=${schoolId}`, { credentials: "include" });
      if (resRefresh.ok) {
        const json = await resRefresh.json();
        setFeeItems(json.data || []);
      }
      
      toast.success(editingItem ? "Fee item structural update successful" : "New billing standard created", { id: toastId });
      setShowModal(false);
    } catch {
      toast.error("An error occurred during submission", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Removing fee entry...");
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fee-items/${deletingItem.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();

      const resRefresh = await fetch(`${apiBaseUrl}/admin/fee-items?companyId=${schoolId}`, { credentials: "include" });
      if (resRefresh.ok) {
        const json = await resRefresh.json();
        setFeeItems(json.data || []);
      }

      toast.success("Fee item deleted successfully", { id: toastId });
      setDeletingItem(null);
    } catch {
      toast.error("Failed to delete selected item", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Maps IDs to user-readable Academic Level or Classroom titles
  const getAudienceLabel = (item: FeeItem) => {
    // if (!item.applicableToId) return "All Students";
    
    // const matchedLevel = allAcademicLevels.find(level => level.id === item.applicableToId);
    // if (matchedLevel) return matchedLevel.name;

    // const matchedClassroom = allClassrooms.find(cls => cls.id === item.applicableToId);
    // if (matchedClassroom) return matchedClassroom.name;

    return "Specific Group";
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-200 p-4 md:p-8 lg:p-12 font-sans transition-colors duration-200">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: darkMode ? "#0f172a" : "#ffffff",
            color: darkMode ? "#f1f5f9" : "#0f172a",
            border: darkMode ? "1px solid #1e293b" : "1px solid #e2e8f0",
            borderRadius: "1rem",
            fontSize: "12px",
            fontWeight: "bold"
          }
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Control Rail */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400">
              Accounts & Ledger Configuration
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 text-slate-500 hover:text-slate-850 dark:hover:text-white transition-all shadow-sm"
              title="Synchronize records"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isSyncing ? "animate-spin text-indigo-500" : ""}`} />
            </button>
            {/* <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
              aria-label="Toggle visual theme state"
            >
              {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button> */}
          </div>
        </div>

        {/* Header Section */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">Institutional Billing</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Fee Structure
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-500 max-w-md font-medium">
              Establish standardized tuition components, schedule auxiliary items, and target specific academic demographics.
            </p>
          </div>

          <button
            onClick={() => { setEditingItem(null); setShowModal(true); }}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm w-full sm:w-auto shrink-0"
          >
            <PlusCircleIcon className="h-4 w-4 stroke-[2]" /> Create Fee Item
          </button>
        </header>

        {/* Quick Insights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard 
            icon={<BanknotesIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} 
            label="Total Fee Types" 
            value={totalItems} 
          />
          <StatCard 
            icon={<AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />} 
            label="Average Amount" 
            value={`$${avgFee}`} 
          />
          <StatCard 
            icon={<UserGroupIcon className="w-5 h-5 text-amber-600 dark:text-amber-500" />} 
            label="Active Audiences" 
            value={`${uniqueAudiencesCount} Segments`} 
          />
        </div>

        {/* Dynamic Filter Section & Live Data Table */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <MagnifyingGlassIcon className="h-4.5 w-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Find a fee item by name..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Showing {filteredItems.length} of {totalItems} entries
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-850">
                  <th className="px-8 py-4 font-black">Fee Description</th>
                  <th className="px-8 py-4 font-black">Standard Amount</th>
                  <th className="px-8 py-4 font-black">Target Audience</th>
                  <th className="px-8 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredItems.map(item => (
                  <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="px-8 py-5">
                      <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm">
                        {item.name}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-tight">
                        {item.currency} {Number(item.defaultAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-wider border border-slate-200/40 dark:border-slate-850">
                          {item.applicableTo}
                        </span>
                        <span className="text-slate-450 dark:text-slate-500 text-xs font-medium">
                          {getAudienceLabel(item)}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingItem(item); setShowModal(true); }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
                          title="Modify item specifications"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 rounded-xl transition-all"
                          title="Remove item"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredItems.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex p-4 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850/60 mb-4">
                  <MagnifyingGlassIcon className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-400 dark:text-slate-500 font-semibold text-xs uppercase tracking-wider">No matching fee listings found</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals Container Section */}
      <AddEditFeeItemModal 
        isOpen={showModal} 
        feeItem={editingItem} 
        schoolId={schoolId} 
        allAcademicLevels={allAcademicLevels} 
        allClassrooms={allClassrooms}
        onClose={() => setShowModal(false)} 
        onSave={handleSave} 
        isSubmitting={isSubmitting} 
      />

      <DeleteFeeItemModal 
        isOpen={!!deletingItem} 
        itemName={deletingItem?.name} 
        onClose={() => setDeletingItem(null)} 
        onConfirm={handleDeleteConfirm} 
        isSubmitting={isSubmitting} 
      />
    </main>
  );
};

// Sub-component for Stats Cards
const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center gap-4 shadow-sm min-h-[6.5rem]">
    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-slate-400 dark:text-slate-550 text-[10px] font-black uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-950 dark:text-white mt-0.5">{value}</p>
    </div>
  </div>
);

export default FeeItemsClient;