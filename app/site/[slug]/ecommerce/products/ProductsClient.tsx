"use client";

import React, { useState, useMemo, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { MarketListingForm } from "@/types/typings";
import ProductCard from "@/components/site/layouts/EcommerceLayout/body/components/ProductCard";
import NoResultsFallback from "@/components/search/NoResultsFallback";

export default function ProductsClient({
  initialListings,
  categories,
  companyId,
  slug,
  totalPages: initialTotalPages,
}: {
  initialListings: Array<MarketListingForm>;
  categories: any[];
  companyId: string;
  slug: string;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || searchParams.get("q") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [listings, setListings] = useState<any[]>(initialListings || []);
  const [totalCount, setTotalCount] = useState<number>(initialListings?.length || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // URL state synchronization
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy && sortBy !== "newest") params.set("sort", sortBy);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [searchQuery, selectedCategory, sortBy, pathname, router]);

  // Server-side search execution against tenant endpoint
  const executeSearch = useCallback(
    async (q: string, cat: string, sort: string) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "48",
          sort: sort === "priceAsc" ? "price_asc" : sort === "priceDesc" ? "price_desc" : sort,
        });

        if (q.trim()) params.set("q", q.trim());
        if (cat) params.append("category", cat);

        const res = await fetch(`/api/stores/${slug}/search?${params}`);
        if (res.ok) {
          const json = await res.json();
          setListings(json.data || []);
          setTotalCount(json.meta?.total ?? (json.data || []).length);
        }
      } catch (err) {
        console.error("Failed to query store products:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [slug]
  );

  // Debounced search trigger when query, category, or sort changes
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(searchQuery, selectedCategory, sortBy);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortBy, executeSearch]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("newest");
  };

  const hasActiveFilters = Boolean(searchQuery.trim()) || Boolean(selectedCategory);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-black transition-colors duration-300">
      {/* Sticky Header / Search Filter Bar */}
      <nav className="sticky top-0 z-20 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search products in this store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 sm:py-3 bg-slate-100 dark:bg-zinc-900 border border-transparent focus:border-indigo-500 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-xs sm:text-sm outline-none text-zinc-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {isLoading && (
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border-none rounded-xl px-3 py-2 sm:py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none"
            >
              <option value="newest">Newest</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="discount">Discounts</option>
            </select>

            {/* View Switcher (Desktop Only) */}
            <div className="hidden md:flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }`}
                aria-label="Grid view"
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400"
                }`}
                aria-label="List view"
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20"
              aria-label="Filter categories"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-lg">
                "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-red-500">
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 rounded-lg">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("")} className="hover:text-red-500">
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-red-500 hover:underline ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex gap-8 lg:gap-12">
        {/* Desktop Sidebar Categories */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4 sticky top-36">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Categories
              </span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  All
                </button>
              )}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  !selectedCategory
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                All Categories
              </button>

              {categories.map((cat: any) => {
                const catName = cat.displayName || cat.name || cat;
                const isSelected = selectedCategory === catName;
                return (
                  <button
                    key={cat.id || catName}
                    onClick={() => setSelectedCategory(isSelected ? "" : catName)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Mobile Slide-over for Categories */}
        <AnimatePresence>
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsFilterOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-80 bg-white dark:bg-zinc-900 h-full p-6 shadow-2xl overflow-y-auto space-y-6"
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    Filter by Category
                  </span>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                      !selectedCategory
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    All Categories
                  </button>

                  {categories.map((cat: any) => {
                    const catName = cat.displayName || cat.name || cat;
                    const isSelected = selectedCategory === catName;
                    return (
                      <button
                        key={cat.id || catName}
                        onClick={() => {
                          setSelectedCategory(isSelected ? "" : catName);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {catName}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <main className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>Showing {listings.length} items</span>
          </div>

          {listings.length > 0 ? (
            <div
              className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {listings.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <NoResultsFallback
              searchTerm={searchQuery}
              category={selectedCategory}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              scope="STORE"
            />
          )}
        </main>
      </div>
    </div>
  );
}