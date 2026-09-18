"use client";

import React, { useState, useEffect } from "react";
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
  ShieldCheckIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface Props {
  companyId: string;
  companySlug: string;
  currency: string;
  companyName: string;
}

export default function SupplierManagementClient({
  companyId,
  companySlug,
  currency,
  companyName,
}: Props) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    taxPin: "",
    category: "General Merchandise",
    paymentTerms: "Net 30",
    notes: "",
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/procurement/suppliers?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSuppliers(json.data || []);
      }
    } catch (err) {
      console.error("Fetch suppliers error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [companyId]);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Supplier name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/procurement/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          companyId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setForm({
          name: "",
          contactPerson: "",
          email: "",
          phone: "",
          address: "",
          taxPin: "",
          category: "General Merchandise",
          paymentTerms: "Net 30",
          notes: "",
        });
        fetchSuppliers();
      } else {
        alert(json.error || "Failed to onboard supplier");
      }
    } catch (err: any) {
      alert(err.message || "Failed to onboard supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Procurement & Sourcing
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Supplier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Network.</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active vendor profiles, payment terms, and procurement history for {companyName}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSuppliers}
              className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-900/40"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" /> Onboard New Vendor
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="flex items-center gap-2 max-w-md bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800">
          <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, category, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSuppliers()}
            className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        {/* Suppliers Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
            Loading supplier directory...
          </div>
        ) : suppliers.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800 p-8">
            <BuildingOffice2Icon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Suppliers Onboarded Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              Add your vendors and manufacturers to generate Purchase Orders and track accounts payable.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
            >
              + Onboard First Supplier
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {suppliers.map((vendor) => (
              <div
                key={vendor.id}
                className="group bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:bg-slate-900/70 hover:border-blue-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400">
                      <BuildingOffice2Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-amber-400 mb-1">
                        <StarSolid className="h-3.5 w-3.5" />
                        <span className="text-xs font-black text-white">{vendor.rating || 5.0}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {vendor.status || "Verified"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">
                      {vendor.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      {vendor.category}
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                    {vendor.contactPerson && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] uppercase font-bold w-16">Contact:</span>
                        <span className="font-semibold text-white">{vendor.contactPerson}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-3.5 w-3.5 text-slate-500" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-3.5 w-3.5 text-slate-500" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.paymentTerms && (
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-3.5 w-3.5 text-slate-500" />
                        <span>Terms: {vendor.paymentTerms}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Outstanding AP</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">
                      {currency} {(vendor.outstandingBalance || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Total Purchases</div>
                    <div className="text-sm font-bold text-slate-200 mt-0.5">
                      {currency} {(vendor.totalPurchases || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL: ONBOARD VENDOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Onboard New Supplier</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Wholesalers Ltd"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Account Manager"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Electronics, Raw Materials, etc."
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 700 000 000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="orders@supplier.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Payment Terms</label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Cash On Delivery">Cash On Delivery (COD)</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Tax / VAT PIN</label>
                  <input
                    type="text"
                    placeholder="e.g. P051234567Z"
                    value={form.taxPin}
                    onChange={(e) => setForm({ ...form, taxPin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Onboarding..." : "Onboard Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}