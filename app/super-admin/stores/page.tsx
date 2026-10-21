"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  ShoppingBagIcon,
  TagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  category?: string | null;
  variant?: string | null;
  tagline?: string | null;
  description?: string | null;
  address?: string | null;
  contactEmail?: string;
  contactPhone?: string | null;
  showOnGhuba?: boolean | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  _count?: {
    marketplaceListings: number;
    Product: number;
  };
}

interface Counts {
  total: number;
  approved: number;
  pending: number;
}

export default function SuperAdminStoresPage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [counts, setCounts] = useState<Counts>({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.set("filter", filter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/super-admin/stores/showcase?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setStores(data.stores || []);
        if (data.counts) setCounts(data.counts);
      } else {
        toast.error(data.message || "Failed to load stores");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error loading stores");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleToggleShowcase = async (store: StoreItem) => {
    const nextStatus = !store.showOnGhuba;
    setProcessingId(store.id);

    try {
      const res = await fetch("/api/super-admin/stores/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: store.id,
          showOnGhuba: nextStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          nextStatus
            ? `Approved "${store.name}" for Ghuba showcase!`
            : `Revoked Ghuba showcase for "${store.name}".`
        );
        // Optimistic update
        setStores((prev) =>
          prev.map((s) => (s.id === store.id ? { ...s, showOnGhuba: nextStatus } : s))
        );
        setCounts((prev) => ({
          ...prev,
          approved: nextStatus ? prev.approved + 1 : Math.max(0, prev.approved - 1),
          pending: nextStatus ? Math.max(0, prev.pending - 1) : prev.pending + 1,
        }));
      } else {
        toast.error(data.message || "Failed to update showcase status");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <Toaster position="top-right" />

      {/* Top Banner Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/dashboards"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Back to Dashboards & Stores</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <BuildingStorefrontIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Store Showcase Approvals
              </h1>
              <p className="text-xs text-slate-400">
                Authorize merchant stores to be highlighted and discovered on the Ghuba marketplace (ghuba.shop).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboards"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            My Stores Dashboard
          </Link>
          <button
            onClick={fetchStores}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all active:scale-95"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Merchant Stores
          </span>
          <div className="text-3xl font-black text-white mt-1">{counts.total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Registered businesses on SalesmanPro</p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Showcased on Ghuba
            </span>
            <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-300 mt-1">{counts.approved}</div>
          <p className="text-[11px] text-emerald-500/80 mt-1">Live in directory & store spotlight</p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Pending / Unapproved
            </span>
            <XCircleIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300 mt-1">{counts.pending}</div>
          <p className="text-[11px] text-amber-500/80 mt-1">Hidden from public Ghuba showcase</p>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All Stores ({counts.total})
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "approved"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            Showcased ({counts.approved})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "pending"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            Pending / Hidden ({counts.pending})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores, slug, email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Stores List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-500 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Loading registered stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8 space-y-3">
          <BuildingStorefrontIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Stores Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search
              ? "No stores matched your search query. Try clearing the filter."
              : "No stores match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => {
            const isApproved = Boolean(store.showOnGhuba);
            const isProcessing = processingId === store.id;

            return (
              <div
                key={store.id}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Store Profile Info */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {store.logoUrl ? (
                      <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-black text-amber-500">
                        {store.name?.charAt(0) || "S"}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white truncate">{store.name}</h3>
                      {store.category && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          <TagIcon className="w-2.5 h-2.5" />
                          {store.category}
                        </span>
                      )}
                      {store.domain && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-950/40 text-blue-400 border border-blue-800/40">
                          <GlobeAltIcon className="w-2.5 h-2.5" />
                          {store.domain}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>Slug: <strong className="text-slate-300 font-mono">/{store.slug}</strong></span>
                      {store.user && (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <UserIcon className="w-3 h-3 text-slate-500" />
                          {store.user.name ? `${store.user.name} (${store.user.email})` : store.user.email}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <ShoppingBagIcon className="w-3 h-3 text-slate-500" />
                        {store._count?.marketplaceListings || 0} active listings
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  {/* Status Indicator */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      isApproved
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {isApproved ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Showcased on Ghuba</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Hidden / Unapproved</span>
                      </>
                    )}
                  </div>

                  {/* Toggle Approval Button */}
                  <button
                    onClick={() => handleToggleShowcase(store)}
                    disabled={isProcessing}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 ${
                      isApproved
                        ? "bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-800/40"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                    }`}
                  >
                    {isProcessing ? (
                      <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    ) : isApproved ? (
                      <XCircleIcon className="w-3.5 h-3.5" />
                    ) : (
                      <ShieldCheckIcon className="w-3.5 h-3.5" />
                    )}
                    <span>{isApproved ? "Revoke Showcase" : "Approve for Ghuba"}</span>
                  </button>

                  {/* Manage Store Admin Link */}
                  <Link
                    href={`/admin/${store.slug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 hover:text-white"
                    title={`Manage ${store.name} Admin Dashboard`}
                  >
                    <Cog6ToothIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Manage Admin</span>
                  </Link>

                  {/* Preview on Ghuba */}
                  <Link
                    href={`/ghuba/store/${store.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 hover:text-white"
                    title={`Preview ${store.name} on Ghuba`}
                  >
                    <span>Preview Ghuba</span>
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 text-slate-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
