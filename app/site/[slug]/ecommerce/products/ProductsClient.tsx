"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";
import { MarketListingForm } from "@/types/typings";
import ProductCard from "@/components/site/layouts/EcommerceLayout/body/components/ProductCard";

/* -------------------------------------------------------------------------- */
/* Sub-Components */
/* -------------------------------------------------------------------------- */

const GlassOption = ({ active, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
      active 
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 translate-x-1" 
        : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-800"
    }`}
  >
    {children}
  </button>
);

/* -------------------------------------------------------------------------- */
/* Main Client Component */
/* -------------------------------------------------------------------------- */

export default function ProductsClient({
  initialListings,
  categories,
}: {
  initialListings: Array<MarketListingForm>;
  categories: any[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredListings = useMemo(() => {
    return initialListings
      .filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = !selectedCategory || item.category?.id === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === "priceAsc") return a.sellingPrice - b.sellingPrice;
        if (sortBy === "priceDesc") return b.sellingPrice - a.sellingPrice;
        return 0;
      });
  }, [initialListings, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-black transition-colors duration-300">
      
      {/* 1. STICKY NAVIGATION BAR - Fixed to Top */}
      {/* If your main site header is also sticky, change top-0 to top-[HEIGHT_OF_MAIN_HEADER] */}
      <nav className="mt-20 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Search premium essentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-gray-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher (Desktop Only) */}
            <div className="hidden md:flex bg-slate-100 dark:bg-gray-900 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600" : "text-slate-400"}`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-800 shadow-sm text-indigo-600" : "text-slate-400"}`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
            >
              <AdjustmentsHorizontalIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12">
        {/* 2. DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-32 space-y-10"> {/* top-32 accounts for nav height + padding */}
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-6 flex items-center gap-2">
                <FunnelIcon className="w-4 h-4" /> Collections
              </h3>
              <div className="space-y-1">
                <GlassOption active={!selectedCategory} onClick={() => setSelectedCategory("")}>
                  All Pieces
                </GlassOption>
                {categories.map((cat) => (
                  <GlassOption 
                    key={cat.id} 
                    active={selectedCategory === cat.id} 
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.displayName}
                  </GlassOption>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500 mb-6">
                Sort By
              </h3>
              <div className="space-y-1">
                {["newest", "priceAsc", "priceDesc"].map((sort) => (
                  <GlassOption 
                    key={sort} 
                    active={sortBy === sort} 
                    onClick={() => setSortBy(sort)}
                  >
                    {sort === "newest" ? "Latest Arrivals" : sort === "priceAsc" ? "Price: Low to High" : "Price: High to Low"}
                  </GlassOption>
                ))}
              </div>
            </section>
          </div>
        </aside>

        {/* 3. PRODUCT GRID */}
        <main className="flex-1">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.displayName : "Full Catalog"}
              <span className="ml-3 text-sm font-medium text-slate-400 dark:text-gray-600">
                ({filteredListings.length})
              </span>
            </h2>
          </div>

          <motion.div 
            layout
            className={`grid gap-8 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
          >
            <AnimatePresence mode="popLayout">
              {filteredListings.map((product, idx) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredListings.length === 0 && (
            <div className="py-40 text-center">
               <div className="inline-flex p-6 rounded-full bg-slate-100 dark:bg-gray-900 mb-4">
                 <XMarkIcon className="w-10 h-10 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">No results found</h3>
               <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </main>
      </div>

      {/* 4. MOBILE DRAWER */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
            />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-900 rounded-t-[3rem] p-8 lg:hidden max-h-[85vh] overflow-y-auto shadow-2xl"
            >
               <div className="w-12 h-1.5 bg-slate-200 dark:bg-gray-800 rounded-full mx-auto mb-8" />
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white">Filters</h2>
                 <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 dark:bg-gray-800 rounded-full">
                   <XMarkIcon className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="space-y-8">
                 <section>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Collections</h3>
                   <div className="grid grid-cols-2 gap-2">
                      <GlassOption active={!selectedCategory} onClick={() => {setSelectedCategory(""); setIsFilterOpen(false);}}>
                        All
                      </GlassOption>
                      {categories.map((cat) => (
                        <GlassOption 
                          key={cat.id} 
                          active={selectedCategory === cat.id} 
                          onClick={() => {setSelectedCategory(cat.id); setIsFilterOpen(false);}}
                        >
                          {cat.displayName}
                        </GlassOption>
                      ))}
                   </div>
                 </section>

                 <section className="pb-8">
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Sort By</h3>
                   <div className="space-y-2">
                      {["newest", "priceAsc", "priceDesc"].map((sort) => (
                        <GlassOption 
                          key={sort} 
                          active={sortBy === sort} 
                          onClick={() => {setSortBy(sort); setIsFilterOpen(false);}}
                        >
                          {sort === "newest" ? "Latest Arrivals" : sort === "priceAsc" ? "Price: Low to High" : "Price: High to Low"}
                        </GlassOption>
                      ))}
                   </div>
                 </section>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}