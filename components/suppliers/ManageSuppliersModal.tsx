"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CubeIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export interface SupplierItem {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  productCount?: number;
  createdAt?: string;
}

interface ManageSuppliersModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  onSuppliersChanged?: () => void;
}

export default function ManageSuppliersModal({
  isOpen,
  onClose,
  companyId,
  onSuppliersChanged,
}: ManageSuppliersModalProps) {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/suppliers?companyId=${encodeURIComponent(companyId)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSuppliers(data.data || []);
      }
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      resetForm();
    }
  }, [isOpen, companyId]);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setContactName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setNotes("");
  };

  const startEdit = (supplier: SupplierItem) => {
    setIsEditing(true);
    setEditingId(supplier.id);
    setName(supplier.name);
    setContactName(supplier.contactName || "");
    setPhone(supplier.phone || "");
    setEmail(supplier.email || "");
    setAddress(supplier.address || "");
    setNotes(supplier.notes || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: editingId || undefined,
        companyId,
        name: name.trim(),
        contactName: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save supplier");
      }

      toast.success(editingId ? "Supplier updated" : "Supplier created");
      resetForm();
      fetchSuppliers();
      onSuppliersChanged?.();
    } catch (err: any) {
      toast.error(err.message || "Error saving supplier");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (supplier: SupplierItem) => {
    if (!confirm(`Are you sure you want to remove supplier "${supplier.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/suppliers?id=${supplier.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Supplier removed");
        fetchSuppliers();
        onSuppliersChanged?.();
      } else {
        throw new Error(data.error || "Failed to remove supplier");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete supplier");
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.contactName && s.contactName.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white dark:from-gray-900 dark:to-gray-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-200 dark:shadow-none">
              <BuildingStorefrontIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                Supplier & Vendor Management
              </h2>
              <p className="text-xs text-gray-500">
                Manage product suppliers, vendor contacts, and inventory sourcing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Two Columns (Form on left, List on right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-800">
          {/* Left: Supplier Form */}
          <div className="lg:col-span-5 p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                {isEditing ? <PencilSquareIcon className="w-4 h-4 text-indigo-600" /> : <PlusIcon className="w-4 h-4 text-indigo-600" />}
                <span>{isEditing ? "Edit Supplier" : "Add New Supplier"}</span>
              </h3>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Supplier Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Wholesale Ltd"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +254 712 345678"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. orders@acme.com"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Warehouse / Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Godown 4, Industrial Area, Nairobi"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Terms / Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Net 30 payment terms, deliveries on Tuesdays"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-1.5"
              >
                {isSaving ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4" />
                )}
                <span>{editingId ? "Update Supplier" : "Save Supplier"}</span>
              </button>
            </form>
          </div>

          {/* Right: Supplier List */}
          <div className="lg:col-span-7 p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Active Suppliers ({suppliers.length})
              </h3>
              <div className="relative w-48 sm:w-60">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                <ArrowPathIcon className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Loading suppliers...</span>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                <BuildingStorefrontIcon className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">No suppliers found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Add your first supplier using the form on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredSuppliers.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/70 hover:border-indigo-300 dark:hover:border-indigo-600 transition flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {s.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold shrink-0">
                          {s.productCount} SKUs
                        </span>
                      </div>

                      {s.contactName && (
                        <p className="text-[11px] text-gray-500">Contact: {s.contactName}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-0.5">
                        {s.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <PhoneIcon className="w-3 h-3 text-emerald-500" /> {s.phone}
                          </span>
                        )}
                        {s.email && (
                          <span className="flex items-center gap-1">
                            <EnvelopeIcon className="w-3 h-3 text-indigo-400" /> {s.email}
                          </span>
                        )}
                        {s.address && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <MapPinIcon className="w-3 h-3 text-amber-500" /> {s.address}
                          </span>
                        )}
                      </div>

                      {s.notes && (
                        <p className="text-[10px] text-gray-400 italic pt-0.5 line-clamp-1">
                          Note: {s.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        title="Edit supplier"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                        title="Delete supplier"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
