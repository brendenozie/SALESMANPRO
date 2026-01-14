"use client";

import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
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

const FeeItemsClient: React.FC<Props> = ({ initialFeeItems, schoolId, allAcademicLevels, allClassrooms }) => {
  const [feeItems, setFeeItems] = useState(initialFeeItems);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<FeeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FeeItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived Stats
  const totalItems = feeItems.length;
  const avgFee = useMemo(() => 
    totalItems ? (feeItems.reduce((acc, curr) => acc + Number(curr.defaultAmount), 0) / totalItems).toFixed(2) : 0
  , [feeItems]);

  const filteredItems = useMemo(() => {
    return feeItems.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [feeItems, search]);

  const refresh = async () => {
    const res = await fetch(`${apiBaseUrl}/admin/fee-items?companyId=${schoolId}`, { credentials: "include" });
    if (res.ok) setFeeItems((await res.json()).data);
  };

  const handleSave = async (data: Partial<FeeItem>) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Processing...");
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
      await refresh();
      toast.success("Fee updated successfully", { id: toastId });
      setShowModal(false);
    } catch {
      toast.error("An error occurred", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-slate-200 p-4 md:p-8 font-sans">
      <Toaster position="top-right" />

      {/* Header & Action Bar */}
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Fee Structure
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage and configure school billing items</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setShowModal(true); }}
            className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all px-6 py-3 rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-500/20"
          >
            <PlusCircleIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Create Fee Item
          </button>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={<BanknotesIcon className="w-6 h-6 text-emerald-400" />} label="Total Fee Types" value={totalItems} />
          <StatCard icon={<AdjustmentsHorizontalIcon className="w-6 h-6 text-indigo-400" />} label="Average Amount" value={`$${avgFee}`} />
          <StatCard icon={<UserGroupIcon className="w-6 h-6 text-amber-400" />} label="Active Categories" value="Global" />
        </div>

        {/* Filter & Table Container */}
        <section className="bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-slate-800/60 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Find a fee item..."
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[11px] uppercase tracking-wider bg-slate-800/20">
                  <th className="px-8 py-5">Fee Description</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Target Audience</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredItems.map(item => (
                  <tr key={item.id} className="group hover:bg-slate-800/20 transition-colors">
                    <td className="px-8 py-5">
                      <span className="font-medium text-slate-100 group-hover:text-indigo-300 transition-colors">{item.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-mono tracking-tighter">
                        {item.currency} {item.defaultAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                          {item.applicableTo}
                        </span>
                        {item.applicableRef && (
                          <span className="text-xs text-slate-500">→ {item.applicableRef}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingItem(item); setShowModal(true); }}
                          className="p-2.5 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="p-2.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-all"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredItems.length === 0 && (
              <div className="py-20 text-center">
                <div className="inline-flex p-4 rounded-full bg-slate-800/40 mb-4">
                  <MagnifyingGlassIcon className="h-8 w-8 text-slate-600" />
                </div>
                <p className="text-slate-400">No fee items matching your search</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      <AddEditFeeItemModal isOpen={showModal} feeItem={editingItem} 
      schoolId={schoolId} allAcademicLevels={allAcademicLevels} allClassrooms={allClassrooms}
      onClose={() => setShowModal(false)} onSave={handleSave} isSubmitting={isSubmitting} />
      <DeleteFeeItemModal isOpen={!!deletingItem} itemName={deletingItem?.name} onClose={() => setDeletingItem(null)} onConfirm={() => {}} isSubmitting={isSubmitting} />
    </main>
  );
};

// Sub-component for Stats
const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
  <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl flex items-center gap-4">
    <div className="p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </div>
  </div>
);

export default FeeItemsClient;