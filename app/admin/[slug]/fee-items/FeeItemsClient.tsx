"use client";

import React, { useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import AddEditFeeItemModal from "./AddEditFeeItemModal";
import DeleteFeeItemModal from "./DeleteFeeItemModal";
import { FeeItem } from "@/lib/data";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  initialFeeItems: FeeItem[];
  schoolId: string;
}

const FeeItemsClient: React.FC<Props> = ({ initialFeeItems, schoolId }) => {
  const [feeItems, setFeeItems] = useState(initialFeeItems);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<FeeItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<FeeItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredItems = useMemo(() => {
    return feeItems.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [feeItems, search]);

  const refresh = async () => {
    const res = await fetch(
      `${apiBaseUrl}/admin/fee-items?companyId=${schoolId}`,
      { credentials: "include" }
    );
    if (res.ok) setFeeItems((await res.json()).data);
  };

  const handleSave = async (data: Partial<FeeItem>) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Saving fee item...");

    try {
      const res = await fetch(
        editingItem
          ? `${apiBaseUrl}/admin/fee-items/${editingItem.id}`
          : `${apiBaseUrl}/admin/fee-items`,
        {
          method: editingItem ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, companyId: schoolId }),
        }
      );

      if (!res.ok) throw new Error("Save failed");
      await refresh();
      toast.success("Fee item saved", { id: toastId });
      setShowModal(false);
    } catch {
      toast.error("Failed to save fee item", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);

    try {
      await fetch(
        `${apiBaseUrl}/admin/fee-items/${deletingItem.id}`,
        { method: "DELETE", credentials: "include" }
      );
      await refresh();
      toast.success("Fee item deleted");
      setDeletingItem(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-gray-100 p-6">
      <Toaster />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Fee Items</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest">
            Fee configuration
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold"
        >
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          New Fee Item
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <MagnifyingGlassIcon className="h-4 w-4 absolute left-4 top-3 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search fee items..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-10 text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="text-[10px] uppercase text-gray-500 bg-gray-800/40">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Applies To</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 font-semibold">{item.name}</td>
                <td className="px-6 py-4">
                  {item.currency} {item.defaultAmount}
                </td>
                <td className="px-6 py-4 text-xs">
                  {item.applicableTo}
                  {item.applicableRef && ` · ${item.applicableRef}`}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowModal(true);
                    }}
                    className="p-2 hover:bg-gray-800 rounded-lg"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-2 hover:bg-red-900/30 rounded-lg"
                  >
                    <TrashIcon className="h-4 w-4 text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddEditFeeItemModal
        isOpen={showModal}
        feeItem={editingItem}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      <DeleteFeeItemModal
        isOpen={!!deletingItem}
        itemName={deletingItem?.name}
        onClose={() => setDeletingItem(null)}
        onConfirm={confirmDelete}
        isSubmitting={isSubmitting}
      />
    </main>
  );
};

export default FeeItemsClient;
