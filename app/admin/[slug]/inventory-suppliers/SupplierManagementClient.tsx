"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
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
  CurrencyDollarIcon,
  MapPinIcon,
  TagIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EyeIcon,
  UserIcon,
  IdentificationIcon,
  CheckCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxPin?: string;
  category?: string;
  paymentTerms?: string;
  notes?: string;
  rating?: number;
  status?: string;
  outstandingBalance?: number;
  totalPurchases?: number;
  createdAt?: string;
}

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
      } else {
        setNotification({ type: "error", message: json.error || "Failed to fetch suppliers." });
      }
    } catch (err: any) {
      console.error("Fetch suppliers error:", err);
      setNotification({ type: "error", message: err.message || "Failed to load supplier directory." });
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
      setNotification({ type: "error", message: "Supplier company name is required." });
      return;
    }

    try {
      setIsSubmitting(true);
      setNotification(null);
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
        setNotification({ type: "success", message: `Vendor "${form.name}" successfully onboarded!` });
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
        setNotification({ type: "error", message: json.error || "Failed to onboard supplier" });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to onboard supplier" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Executive summary metrics
  const metrics = useMemo(() => {
    const total = suppliers.length;
    const categoriesCount = new Set(suppliers.map((s) => s.category).filter(Boolean)).size;
    const totalOutstandingAP = suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);
    const totalPurchasesVolume = suppliers.reduce((acc, s) => acc + (s.totalPurchases || 0), 0);

    return { total, categoriesCount, totalOutstandingAP, totalPurchasesVolume };
  }, [suppliers]);

  // Categories list for filter tabs
  const categories = useMemo(() => {
    const cats = Array.from(new Set(suppliers.map((s) => s.category).filter(Boolean))) as string[];
    return ["ALL", ...cats];
  }, [suppliers]);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
        (s.category && s.category.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = selectedCategory === "ALL" || s.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [suppliers, search, selectedCategory]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Bar */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
              <span className="text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-widest">
                Procurement & Sourcing
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Supplier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-600 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400">Network</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Active vendor directory, payment terms, tax profiles, and accounts payable commitments for <span className="font-bold text-slate-800 dark:text-slate-200">{companyName}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/${companySlug}/purchase-orders`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95"
            >
              <DocumentTextIcon className="h-4 w-4 text-emerald-500" />
              Purchase Orders
            </Link>
            <Link
              href={`/admin/${companySlug}/finance`}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95"
            >
              <CurrencyDollarIcon className="h-4 w-4 text-indigo-500" />
              Accounts Payable
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white dark:text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-blue-600/20 dark:shadow-blue-500/20 active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[2.5]" />
              Onboard Vendor
            </button>
          </div>
        </header>

        {/* Executive Stats Summary */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Vendors</span>
              <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                <BuildingOffice2Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{metrics.total}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Active supplier profiles</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Categories</span>
              <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <TagIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{metrics.categoriesCount}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Product & service verticals</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Outstanding AP</span>
              <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                <ClockIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 truncate">
              {currency} {metrics.totalOutstandingAP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Pending vendor invoices</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Purchases Volume</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <CurrencyDollarIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 truncate">
              {currency} {metrics.totalPurchasesVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cumulative order total</p>
          </div>
        </section>

        {/* Notifications Alert */}
        {notification && (
          <div
            className={`p-4 rounded-2xl text-xs flex justify-between items-center shadow-xs border ${
              notification.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              ) : (
                <XMarkIcon className="h-5 w-5 text-rose-500" />
              )}
              <span className="font-semibold">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Controls & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          {/* Category Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar p-0.5">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-extrabold tracking-wider transition-all rounded-xl whitespace-nowrap ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-blue-500/20 dark:text-blue-300 dark:border dark:border-blue-500/30 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  {cat === "ALL" ? "All Categories" : cat}
                </button>
              );
            })}
          </div>

          {/* Search Input & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[260px] flex-grow">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor, contact, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchSuppliers()}
                className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              onClick={fetchSuppliers}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all active:scale-95"
              title="Refresh Directory"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Suppliers Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ArrowPathIcon className="h-9 w-9 animate-spin text-blue-500 mb-3" />
            <p className="text-xs font-bold tracking-wide">Syncing supplier network...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-xs">
            <BuildingOffice2Icon className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No Suppliers Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              No vendor records match your active category or search query. Onboard a new supplier to start issuing Purchase Orders.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-md active:scale-95"
            >
              + Onboard First Supplier
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSuppliers.map((vendor) => (
              <div
                key={vendor.id}
                className="group bg-white dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/70 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black shadow-xs">
                      <BuildingOffice2Icon className="h-6 w-6" />
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 mb-1">
                        <StarSolid className="h-3.5 w-3.5" />
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {vendor.rating ? vendor.rating.toFixed(1) : "5.0"}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                        <ShieldCheckIcon className="h-3 w-3 inline mr-1" />
                        {vendor.status || "Verified"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                      {vendor.name}
                    </h3>
                    <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">
                      {vendor.category || "General Vendor"}
                    </p>
                  </div>

                  {/* Details List */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    {vendor.contactPerson && (
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <UserIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="font-semibold truncate">{vendor.contactPerson}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <PhoneIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <EnvelopeIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    {vendor.paymentTerms && (
                      <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                        <ClockIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>Terms: <strong className="text-slate-800 dark:text-slate-200">{vendor.paymentTerms}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Outstanding AP</div>
                    <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {currency} {(vendor.outstandingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingSupplier(vendor)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all active:scale-95"
                      title="View Profile Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/admin/${companySlug}/purchase-orders`}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 active:scale-95"
                    >
                      Issue PO
                      <ChevronRightIcon className="h-3 w-3 stroke-[3]" />
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Footer Info Banner */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4 shadow-xs">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Centralized Vendor & Tax Pin Directory</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Maintain verified tax identification numbers, contact leads, and negotiated payment terms. All purchase orders generated under a vendor automatically reconcile with Accounts Payable.
            </p>
          </div>
        </div>

      </div>

      {/* MODAL: ONBOARD VENDOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 my-8 text-left shadow-2xl space-y-5">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Onboard New Supplier</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Add vendor profile to supply chain & procurement network</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Company / Supplier Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Wholesalers Ltd"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="Account Manager Name"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="Electronics, Raw Materials..."
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+254 700 000 000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="orders@supplier.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Payment Terms
                  </label>
                  <select
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Cash On Delivery">Cash On Delivery (COD)</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Tax / VAT PIN
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. P051234567Z"
                    value={form.taxPin}
                    onChange={(e) => setForm({ ...form, taxPin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Office / Warehouse Address
                </label>
                <input
                  type="text"
                  placeholder="Street, City, Building Number"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional sourcing notes, bank details, or secondary contacts..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white dark:text-slate-950 rounded-xl font-black transition-all disabled:opacity-50 shadow-md active:scale-95"
                >
                  {isSubmitting ? "Onboarding..." : "Onboard Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW SUPPLIER DETAILS */}
      {viewingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-left shadow-2xl space-y-5">
            
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-black">
                  <BuildingOffice2Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{viewingSupplier.name}</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">{viewingSupplier.category || "General Vendor"}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingSupplier(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Outstanding AP</span>
                  <p className="font-black text-amber-600 dark:text-amber-400 text-sm mt-0.5">
                    {currency} {(viewingSupplier.outstandingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Total Purchases</span>
                  <p className="font-black text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                    {currency} {(viewingSupplier.totalPurchases || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {viewingSupplier.contactPerson && (
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 font-bold w-24">Contact:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{viewingSupplier.contactPerson}</span>
                  </div>
                )}
                {viewingSupplier.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 font-bold w-24">Phone:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{viewingSupplier.phone}</span>
                  </div>
                )}
                {viewingSupplier.email && (
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 font-bold w-24">Email:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{viewingSupplier.email}</span>
                  </div>
                )}
                {viewingSupplier.paymentTerms && (
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 font-bold w-24">Terms:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{viewingSupplier.paymentTerms}</span>
                  </div>
                )}
                {viewingSupplier.taxPin && (
                  <div className="flex items-center gap-2">
                    <IdentificationIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-500 font-bold w-24">Tax / VAT PIN:</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">{viewingSupplier.taxPin}</span>
                  </div>
                )}
                {viewingSupplier.address && (
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-slate-500 font-bold w-24 shrink-0">Address:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{viewingSupplier.address}</span>
                  </div>
                )}
              </div>

              {viewingSupplier.notes && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 mt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Notes:</span>
                  {viewingSupplier.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewingSupplier(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}