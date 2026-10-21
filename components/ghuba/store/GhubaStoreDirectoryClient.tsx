"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  BuildingStorefrontIcon, 
  MapPinIcon, 
  CheckBadgeIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  StarIcon,
  SparklesIcon
} from "@heroicons/react/24/solid";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppIcon = FaWhatsapp as any;

export interface DirectoryStoreItem {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  category: string;
  variant?: string | null;
  tagline?: string | null;
  description?: string | null;
  address?: string | null;
  contactPhone?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  activeItemsCount: number;
}

interface GhubaStoreDirectoryClientProps {
  initialStores: DirectoryStoreItem[];
}

const CATEGORY_FILTERS = [
  { label: "All Stores", key: "all" },
  { label: "Restaurants & Food", key: "restaurant" },
  { label: "Tech & Gadgets", key: "tech" },
  { label: "Fashion & Apparel", key: "fashion" },
  { label: "Vehicles & Motors", key: "vehicle" },
  { label: "Retail & Groceries", key: "retail" },
  { label: "Services & Others", key: "service" },
];

const DEFAULT_BANNER = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80";

export default function GhubaStoreDirectoryClient({ initialStores }: GhubaStoreDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredStores = useMemo(() => {
    return initialStores.filter((store) => {
      // Category matching
      if (selectedCategory !== "all") {
        const cat = (store.category || "").toLowerCase();
        const varnt = (store.variant || "").toLowerCase();
        const combined = `${cat} ${varnt}`;

        if (selectedCategory === "restaurant" && !combined.includes("restaurant") && !combined.includes("food")) {
          return false;
        }
        if (selectedCategory === "tech" && !combined.includes("tech") && !combined.includes("gadget") && !combined.includes("electronic")) {
          return false;
        }
        if (selectedCategory === "fashion" && !combined.includes("fashion") && !combined.includes("apparel") && !combined.includes("cloth")) {
          return false;
        }
        if (selectedCategory === "vehicle" && !combined.includes("vehicle") && !combined.includes("auto") && !combined.includes("motor")) {
          return false;
        }
        if (selectedCategory === "retail" && !combined.includes("retail") && !combined.includes("commerce") && !combined.includes("shop")) {
          return false;
        }
        if (selectedCategory === "service" && !combined.includes("service") && !combined.includes("provider")) {
          return false;
        }
      }

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (store.name || "").toLowerCase().includes(q);
        const catMatch = (store.category || "").toLowerCase().includes(q);
        const addrMatch = (store.address || "").toLowerCase().includes(q);
        const descMatch = (store.tagline || store.description || "").toLowerCase().includes(q);
        return nameMatch || catMatch || addrMatch || descMatch;
      }

      return true;
    });
  }, [initialStores, selectedCategory, searchQuery]);

  return (
    <div className="w-full">
      {/* Search and Filters Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Live Search Input */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store name, CBD address, or category..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Stats Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-bold text-zinc-500 dark:text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Showing <strong className="text-zinc-900 dark:text-white">{filteredStores.length}</strong> Verified Merchant Stores
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-4 scrollbar-none select-none">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 scale-105"
                    : "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredStores.length === 0 ? (
          <div className="text-center py-20 px-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <BuildingStorefrontIcon className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1">
              No matching stores found
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mb-6">
              We couldn't find any verified merchant matching "{searchQuery}". Try selecting another category or resetting the search.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => {
              const bannerImg = store.bannerUrl || DEFAULT_BANNER;
              const storeAddress = store.address || "Nairobi CBD, Kenya";
              const rawPhone = store.contactPhone || "254706448146";
              const cleanPhone = rawPhone.replace(/\D/g, "");
              const formattedPhone = cleanPhone.startsWith("0") 
                ? `254${cleanPhone.slice(1)}` 
                : cleanPhone.startsWith("254") 
                  ? cleanPhone 
                  : `254${cleanPhone}`;
              const logoInitial = store.name ? store.name.charAt(0).toUpperCase() : "S";

              const normalizedDomain = store.domain
                ? store.domain.startsWith("http")
                  ? store.domain
                  : `https://${store.domain}`
                : null;
              const hasCustomDomain = !!normalizedDomain && !store.domain?.includes("ghuba.shop");
              const directStoreUrl = normalizedDomain || (store.slug && store.slug !== "ghuba" ? `/site/${store.slug}` : null);

              return (
                <div
                  key={store.id}
                  className="group bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Store Banner */}
                    <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
                      <Image
                        src={bannerImg}
                        alt={`${store.name} banner`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 contrast-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Category Badge & Verification Badge on banner */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-400 border border-white/10 shadow-sm">
                          {store.category || "Retail Store"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                          <CheckBadgeIcon className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>

                    {/* Store Identity & Details */}
                    <div className="p-6 relative -mt-10">
                      <div className="flex items-start gap-4 mb-3">
                        {/* Store Avatar Logo */}
                        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-zinc-900 shrink-0 overflow-hidden relative">
                          {store.logoUrl ? (
                            <Image
                              src={store.logoUrl}
                              alt={store.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <span>{logoInitial}</span>
                          )}
                        </div>

                        {/* Title and Stats */}
                        <div className="min-w-0 pt-2">
                          <h3 className="font-black text-lg text-zinc-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                            {store.name}
                          </h3>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                            {store.activeItemsCount > 0
                              ? `${store.activeItemsCount} In-Stock Catalog Items`
                              : "Verified Merchant Catalog"}
                          </span>
                        </div>
                      </div>

                      {/* Tagline / Description */}
                      {store.tagline && (
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                          {store.tagline}
                        </p>
                      )}

                      {/* Address */}
                      <p className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-4">
                        <MapPinIcon className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="truncate">{storeAddress}</span>
                      </p>

                      {/* M-Pesa Escrow Guarantee Strip */}
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-400 font-bold mb-4">
                        <ShieldCheckIcon className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="truncate">100% M-Pesa Escrow Protection</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-6 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 mt-auto flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Primary Action: Ghuba Store Page */}
                      <Link
                        href={`/ghuba/store/${store.slug}`}
                        className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                      >
                        <span>Visit Store</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Link>

                      {/* Direct WhatsApp CTA */}
                      <a
                        href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Hello ${store.name}, I found your verified store on Ghuba Marketplace.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {/* Secondary Link to External Domain or direct site if available */}
                    {directStoreUrl && (
                      <a
                        href={directStoreUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border border-zinc-200/60 dark:border-zinc-700/60"
                        title={`Visit ${store.name}'s independent website`}
                      >
                        <GlobeAltIcon className="w-3.5 h-3.5 text-amber-500" />
                        <span>{hasCustomDomain ? "Visit Official Domain" : "Direct Store Website"}</span>
                        <ArrowTopRightOnSquareIcon className="w-3 h-3 text-zinc-400" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
