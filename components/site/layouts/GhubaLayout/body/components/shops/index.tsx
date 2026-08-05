"use client";

import React, { useState, useCallback } from "react";
import { ArrowRightIcon, RectangleGroupIcon, CheckBadgeIcon, ArchiveBoxXMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import GhubaProductCard from "../GhubaProductCard";

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

  const hasBrands = category?.allBrands && category.allBrands.length > 0;
  const hasProducts = shopItems && shopItems.length > 0;

  const toggleLike = useCallback((id: string | number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  if (!category) return null;

  return (
    <section className="relative py-10 md:py-16 bg-white dark:bg-[#080808] transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-amber-500">{category.icon || <RectangleGroupIcon className="w-6 h-6" />}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-wider">Featured Collection</span>
              <h2 className="text-2xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-none">
                {category.name} <span className="text-amber-500 italic">Showcase</span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/ghuba/productlist?category=${category.id}`)}
            className="group flex items-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold uppercase tracking-wider text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all shrink-0"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-amber-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            {hasBrands && (
              <div className="rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">Top Brands</h3>
                  <SparklesIcon className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible scrollbar-none">
                  {category.allBrands!.slice(0, 6).map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => router.push(`/ghuba/productlist?category=${category.id}&brand=${brand}`)}
                      className="group flex shrink-0 lg:shrink items-center justify-between p-2.5 bg-white dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:border-amber-500 transition-all w-[140px] lg:w-full"
                    >
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-500 truncate pr-2">
                        {brand}
                      </span>
                      <CheckBadgeIcon className="w-4 h-4 shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-amber-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              onClick={() => router.push(`/ghuba/productlist?category=${category.id}`)}
              className="hidden lg:flex flex-col justify-between relative h-64 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 p-6 cursor-pointer shadow-lg hover:shadow-amber-500/25 transition-all"
            >
              <div className="space-y-1 z-10">
                <span className="text-amber-950 text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full inline-block backdrop-blur-sm">
                  Verified Quality
                </span>
                <h4 className="text-white text-2xl font-black uppercase leading-tight pt-2">
                  Premium <br /> Selections
                </h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white z-10">
                <span>Explore Catalog</span>
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            {hasProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {shopItems.map((product) => (
                  <div key={product.id} className="flex flex-col h-full w-full">
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
              <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center p-6">
                <ArchiveBoxXMarkIcon className="w-10 h-10 text-zinc-400 mb-3" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">No products available</h3>
                <p className="text-xs text-zinc-500 max-w-xs">We couldn't find any items in this collection right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shop;