"use client";

import React, { useState } from "react";
import { 
  ArrowRightIcon, 
  RectangleGroupIcon,
  CheckBadgeIcon,
  ArchiveBoxXMarkIcon
} from "@heroicons/react/24/outline";
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
  shopItems: Product[];
}

const Shop: React.FC<ShopProps> = ({ addToCart, category, shopItems = [] }) => {
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  
  const toggleLike = (id: string | number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!category) return null;

  const hasBrands = category.allBrands && category.allBrands.length > 0;
  const hasProducts = shopItems && shopItems.length > 0;

  return (
    <>
      <section className="py-8 md:py-16 bg-white dark:bg-[#080808] transition-colors duration-500 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-10 gap-4">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="p-1.5 md:p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  {category.icon || <RectangleGroupIcon className="w-5 h-5" />}
                </span>
                <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                  Featured Collection
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
                {category.name} <span className="text-amber-500 italic block sm:inline mt-1 sm:mt-0">Showcase</span>
              </h2>
            </div>

            <button
              onClick={() => router.push(`/ghuba/productlist?category=${category.id}`)}
              className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label={`View all ${category.name} products`}
            >
              <span>View All</span>
              <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Brand Curator Sidebar */}
            <aside className="lg:col-span-3 space-y-4 md:space-y-6 order-1 lg:order-1">
              {hasBrands && (
                <div className="relative overflow-hidden rounded-2xl md:rounded-[2rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 md:p-6">
                  <div className="relative z-10">
                    <h3 className="text-base md:text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-3 md:mb-4 flex items-center gap-2">
                      Top Brands
                    </h3>
                    
                    <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0">
                      {category.allBrands!.slice(0, 6).map((brand, index) => (
                        <button
                          key={brand}
                          style={{ animationDelay: `${index * 80}ms` }}
                          onClick={() => router.push(`/ghuba/productlist?category=${category.id}&brand=${brand}`)}
                          className="snap-start animate-slide-in-right opacity-0 fill-mode-forwards group flex shrink-0 lg:shrink flex-row items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-xl border border-transparent hover:border-amber-500/50 hover:shadow-lg focus:border-amber-500 focus:outline-none transition-all cursor-pointer w-[140px] lg:w-full"
                        >
                          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-500 transition-colors truncate pr-2">
                            {brand}
                          </span>
                          <CheckBadgeIcon className="w-4 h-4 shrink-0 text-zinc-300 dark:text-zinc-700 group-hover:text-amber-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                </div>
              )}

              {/* Promotional Banner */}
              <div className="hidden lg:block relative h-56 rounded-[2rem] bg-amber-500 p-6 overflow-hidden group cursor-pointer hover:shadow-xl hover:shadow-amber-500/20 transition-all">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <h4 className="text-white text-xl font-black uppercase leading-tight">
                    Premium <br /> Selections
                  </h4>
                  <p className="text-amber-900/70 text-[10px] font-bold uppercase tracking-widest">
                    Verified Quality
                  </p>
                </div>
                <RectangleGroupIcon className="absolute -bottom-4 -right-4 w-28 h-28 text-amber-600/20 group-hover:scale-110 transition-transform duration-700" />
              </div>
            </aside>

            {/* Main Product Grid */}
            <div className="lg:col-span-9 order-2 lg:order-2">
              {hasProducts ? (
                /* 
                   KEY FIXES:
                   - Reduced gap size (`gap-2.5 sm:gap-4 md:gap-5`) to eliminate large empty spaces.
                   - Replaced `w-full flex justify-center` with `flex flex-col items-stretch` so 
                     cards occupy equal width and height across rows without shrinking.
                */
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
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
                <div className="w-full h-56 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center p-6">
                  <ArchiveBoxXMarkIcon className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mb-3" />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">No products found</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                    We couldn't find any items in this collection right now.
                  </p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fill-mode-forwards {
          animation-fill-mode: forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Shop;