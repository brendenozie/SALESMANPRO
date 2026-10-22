"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BuildingStorefrontIcon,
  PlusIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightIcon,
  CubeIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import GhubaQuickListingModal from "@/components/ghuba/seller/GhubaQuickListingModal";
import GhubaSellerOnboardingView from "@/components/ghuba/seller/GhubaSellerOnboardingView";

interface SellerStatus {
  authenticated: boolean;
  hasStore?: boolean;
  store?: {
    id: string;
    name: string;
    slug: string;
    category?: string;
    logoUrl?: string;
    address?: string;
    storeOrigin?: string;
  };
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  activeListingCount: number;
  limit: number;
  remainingSlots: number;
  isGrandfathered: boolean;
  thresholdState: "normal" | "warning_8" | "warning_9" | "limit_reached";
}

interface ListingItem {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  sellingPrice: number;
  quantity: number;
  images: string[];
  status: string;
  isAvailable: boolean;
  category?: string;
  createdAt: string;
}

export default function GhubaSellerHubPage() {
  const [status, setStatus] = useState<SellerStatus | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStatusAndListings = useCallback(async () => {
    try {
      const [statusRes, listingsRes] = await Promise.all([
        fetch("/api/ghuba/seller/status"),
        fetch("/api/ghuba/seller/listings"),
      ]);

      const statusData = await statusRes.json();
      setStatus(statusData);

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData.listings || []);
      }
    } catch (err) {
      console.error("Failed to load seller status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatusAndListings();
  }, [fetchStatusAndListings]);

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to remove this item? It will be unpublished from Ghuba and free up a listing slot.")) {
      return;
    }
    setDeletingId(listingId);
    try {
      const res = await fetch(`/api/ghuba/seller/listings/${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchStatusAndListings();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete listing");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (listing: ListingItem) => {
    try {
      const res = await fetch(`/api/ghuba/seller/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !listing.isAvailable }),
      });
      if (res.ok) {
        await fetchStatusAndListings();
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-zinc-500 animate-pulse">Loading Ghuba Seller Hub...</p>
      </div>
    );
  }

  // 1. Unauthenticated State
  if (!status || !status.authenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <BuildingStorefrontIcon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Ghuba Merchant Portal
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in to manage your marketplace items, track customer orders, and publish new products on Ghuba.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/signin?callbackUrl=/ghuba/seller"
              className="block w-full py-3 px-6 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              Sign In to Your Store
            </Link>
            <Link
              href="/signup?callbackUrl=/ghuba/seller"
              className="block w-full py-3 px-6 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm transition-colors"
            >
              Create Free Seller Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated but Needs Onboarding
  if (!status.hasStore || !status.store) {
    return (
      <GhubaSellerOnboardingView
        user={status.user!}
        onStoreCreated={() => fetchStatusAndListings()}
      />
    );
  }

  const { store, activeListingCount, limit, remainingSlots, thresholdState, isGrandfathered } = status;
  const progressPercent = Math.min(100, Math.round((activeListingCount / limit) * 100));

  return (
    <div className="min-h-screen bg-zinc-50/60 dark:bg-zinc-950/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 overflow-hidden flex items-center justify-center shrink-0">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <BuildingStorefrontIcon className="w-8 h-8 text-amber-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {store.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  Verified Merchant
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {store.category || "General Retail"} • {store.address || "Nairobi, KE"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/ghuba/store/${store.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
              View Public Store
              <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              Add Marketplace Item
            </button>
          </div>
        </div>

        {/* 10-Item Limit Capacity Meter & Contextual Warnings */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <CubeIcon className="w-5 h-5 text-amber-500" />
                Ghuba Marketplace Listing Capacity
              </h2>
              <p className="text-xs text-zinc-500">
                Free marketplace tier includes 10 active product listings visible to all Ghuba shoppers.
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">
                {activeListingCount}
              </span>
              <span className="text-sm text-zinc-500"> / {limit} slots used</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                activeListingCount >= limit
                  ? "bg-red-500"
                  : activeListingCount >= 8
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Contextual Warning Banners for 8, 9, 10 items */}
          {thresholdState === "warning_8" && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-medium">
                <SparklesIcon className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Your business is growing!</strong> You have 2 listing slots left (8/10). Expand your catalog with SalesmanPro Starter (25 listings + POS).
                </span>
              </div>
              <a
                href={`/api/auth/handover?target=https://salesmanpro.store/stores`}
                className="shrink-0 px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-sm transition-all text-center"
              >
                Explore Plans
              </a>
            </div>
          )}

          {thresholdState === "warning_9" && (
            <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-orange-800 dark:text-orange-300 font-medium">
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-orange-600 dark:text-orange-400" />
                <span>
                  <strong>Almost at capacity!</strong> Only 1 listing slot remaining (9/10). Upgrade to SalesmanPro to keep adding inventory without limits.
                </span>
              </div>
              <a
                href={`/api/auth/handover?target=https://salesmanpro.store/stores`}
                className="shrink-0 px-4 py-1.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-sm transition-all text-center"
              >
                Upgrade Now
              </a>
            </div>
          )}

          {thresholdState === "limit_reached" && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-red-800 dark:text-red-300 font-medium">
                <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
                <span>
                  <strong>Marketplace Listing Limit Reached ({activeListingCount}/{limit} items).</strong> To add more items, launch a dedicated website, or unlock POS inventory sync, upgrade to SalesmanPro Starter (KES 2,999/mo).
                </span>
              </div>
              <a
                href={`/api/auth/handover?target=https://salesmanpro.store/stores`}
                className="shrink-0 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold shadow-md transition-all text-center flex items-center justify-center gap-1.5"
              >
                Unlock SalesmanPro
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {isGrandfathered && (
            <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
              <CheckBadgeIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Grandfathered Store:</strong> You currently have {activeListingCount} active listings. All your existing listings remain active and visible on Ghuba.
              </span>
            </div>
          )}
        </div>

        {/* Listings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              My Active Listings ({listings.length})
            </h2>
            <span className="text-xs text-zinc-500">
              {remainingSlots} slots remaining
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <CubeIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  No items listed yet
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Add your first product to start showing up on Ghuba feeds, category pages, and search results.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <PlusIcon className="w-4 h-4 stroke-[3]" />
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between group hover:border-amber-500/50 transition-colors"
                >
                  <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <CubeIcon className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${
                          item.isAvailable
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-700 text-zinc-200"
                        }`}
                      >
                        {item.isAvailable ? "Available" : "Hidden"}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      KES {item.sellingPrice.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                        {item.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                      <span className="text-zinc-500">
                        Qty: <strong className="text-zinc-900 dark:text-white">{item.quantity}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            item.isAvailable
                              ? "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                              : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200"
                          }`}
                        >
                          {item.isAvailable ? "Hide" : "Show"}
                        </button>
                        <button
                          onClick={() => handleDeleteListing(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Listing"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Level Up to SalesmanPro Card (Milestone 5 & 6) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 text-white p-8 sm:p-10 border border-zinc-800 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <SparklesIcon className="w-4 h-4" />
              Power Your Business with SalesmanPro
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Graduate Beyond 10 Items?
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              SalesmanPro turns your Ghuba store into a full-scale commerce engine. Launch your own branded website (e.g. <code>{store.slug}.co.ke</code>), run a barcode POS at your physical shop, issue automated M-Pesa receipts, and manage multi-location staff.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Custom Domain & Online Store</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>25 to Unlimited Catalog Capacity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Counter POS & Offline Receipts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Automated M-Pesa Dispatches</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href={`/api/auth/handover?target=https://salesmanpro.store/admin/${store.slug}/website-builder`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
              >
                Open SalesmanPro Studio
                <ChevronRightIcon className="w-4 h-4 stroke-[3]" />
              </a>
              <a
                href={`/api/auth/handover?target=https://salesmanpro.store/stores`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors"
              >
                View Plans & Pricing
              </a>
            </div>
          </div>

          {/* Decorative Background Blob */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* Quick Listing Modal */}
      <GhubaQuickListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchStatusAndListings()}
        companyId={store.id}
        currentActiveCount={activeListingCount}
        listingLimit={limit}
      />
    </div>
  );
}
