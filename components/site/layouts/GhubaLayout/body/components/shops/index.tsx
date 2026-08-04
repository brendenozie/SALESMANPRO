"use client";

import React, { useState, useCallback } from "react";
import { 
  ArrowRightIcon, 
  RectangleGroupIcon,
  CheckBadgeIcon,
  ArchiveBoxXMarkIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import GhubaProductCard from "../GhubaProductCard";

// --- TYPES ---
interface Product {
  id: string | number;
  name?: string;
  price?: number;
  [key: string]: any;
}

interface Category {
  id: string | number;
  name: string;
  icon?: React.ReactNode;
  allBrands?: string[];
}

interface ShopProps {
  addToCart: (product: Product) => void;
  category: Category;
  shopItems?: Product[];
}

const Shop: React.FC<ShopProps> = ({ addToCart, category, shopItems = [] }) => {
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<Record<string | number, boolean>>({});

  const isLoading = !shopItems;
  const hasBrands = category?.allBrands && category.allBrands.length > 0;
  const hasProducts = shopItems && shopItems.length > 0;

  const toggleLike = useCallback((id: string | number) => {
    setLikedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  if (!category) return null;

  return (
    <section className="relative py-8 md:py-16 bg-white dark:bg-[#080808] transition-colors duration-300 overflow-hidden">
      
      {/* Decorative Background Accents */}
      <div className="absolute top-1/2 left-0 w-1/4 h-1/2 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none hidden sm:block" />
      <div className="absolute top-1/4 right-[-5%] w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Header Icon Badge */}
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-amber-500">
                {category.icon || <RectangleGroupIcon className="w-5 h-5 md:w-6 md:h-6" />}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-wider">
                Featured Collection
              </span>
              <h2 className="text-2xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                {category.name} <span className="text-amber-500 italic">Showcase</span>
              </h2>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => router.push(`/ghuba/productlist?category=${category.id}`)}
            className="group flex items-center gap-1.5 md:gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold uppercase tracking-wider text-[11px] md:text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 transition-all active:scale-95 shrink-0"
            aria-label={`View all ${category.name} products`}
          >
            <span>View All</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-amber-500" />
          </button>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* SIDEBAR: BRANDS & PROMO */}
          <aside className="lg:col-span-3 space-y-4 md:space-y-6">
            
            {/* Brand Curator Card */}
            {hasBrands && (
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 p-5 backdrop-blur-xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs md:text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      Top Brands
                    </h3>
                    <SparklesIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  
                  {/* Brand Buttons Container */}
                  <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none snap-x snap-mandatory -mx-2 px-2 lg:mx-0 lg:px-0">
                    {category.allBrands!.slice(0, 6).map((brand) => (
                      <button
                        key={brand}
                        onClick={() => router.push(`/ghuba/productlist?category=${category.id}&brand=${brand}`)}
                        className="snap-start group flex shrink-0 lg:shrink items-center justify-between p-2.5 bg-white dark:bg-zinc-800/80 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 hover:border-amber-500/50 transition-all cursor-pointer w-[140px] lg:w-full active:scale-98"
                      >
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-500 transition-colors truncate pr-2">
                          {brand}
                        </span>
                        <CheckBadgeIcon className="w-4 h-4 shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Promotional Banner */}
            <div 
              onClick={() => router.push(`/ghuba/productlist?category=${category.id}`)}
              className="hidden lg:flex flex-col justify-between relative h-60 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 overflow-hidden group cursor-pointer shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
            >
              <div className="relative z-10 space-y-1">
                <span className="text-amber-950 text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full inline-block backdrop-blur-sm">
                  Verified Quality
                </span>
                <h4 className="text-white text-2xl font-black uppercase leading-tight pt-2">
                  Premium <br /> Selections
                </h4>
              </div>

              <div className="relative z-10 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                <span>Explore Catalog</span>
                <ArrowRightIcon className="w-4 h-4" />
              </div>

              <RectangleGroupIcon className="absolute -bottom-6 -right-6 w-36 h-36 text-amber-400/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 pointer-events-none" />
            </div>
          </aside>

          {/* MAIN PRODUCT GRID */}
          <div className="lg:col-span-9">
            {isLoading ? (
              /* Skeleton Loading Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={`shop-skeleton-${index}`} className="space-y-3">
                    <div className="w-full h-[260px] sm:h-[300px] bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl" />
                    <div className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full" />
                    <div className="h-4 w-1/3 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            ) : hasProducts ? (
              /* Active Products Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {shopItems.map((product) => (
                  <div key={product.id} className="flex flex-col items-stretch h-full w-full">
                    <GhubaProductCard 
                      product={product} 
                      toggleLike={toggleLike} 
                      likedItems={likedItems} 
                      addToCart={addToCart} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center p-6 backdrop-blur-sm">
                <ArchiveBoxXMarkIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
                <h3 className="text-sm md:text-base font-bold text-zinc-900 dark:text-white mb-1">
                  No products available
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                  We couldn't find any items in the {category.name} collection right now.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Shop;