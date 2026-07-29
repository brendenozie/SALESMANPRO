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

// 1. Added proper TypeScript interfaces for better maintainability and error catching
interface Product {
  id: string | number;
  name?: string;
  price?: number;
  [key: string]: any; // Catch-all for other product properties
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
  
  // 2. Strongly typed the liked items state
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  
  const toggleLike = (id: string | number) => {
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 3. Fallback for missing category data
  if (!category) return null;

  const hasBrands = category.allBrands && category.allBrands.length > 0;
  const hasProducts = shopItems && shopItems.length > 0;

  return (
    <>
      <section className="py-12 md:py-24 bg-white dark:bg-[#080808] transition-colors duration-500 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6">
          
          {/* Header Section - Optimized for Mobile & Tablet */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-16 gap-6">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  {category.icon || <RectangleGroupIcon className="w-5 h-5" />}
                </span>
                <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                  Featured Collection
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
                {category.name} <span className="text-amber-500 italic block sm:inline mt-1 sm:mt-0">Showcase</span>
              </h2>
            </div>

            <button
              onClick={() => router.push(`/ghuba/productlist?category=${category.id}`)}
              className="group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-[#080808]"
              aria-label={`View all ${category.name} products`}
            >
              <span>View All</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            
            {/* Brand Curator Sidebar */}
            <aside className="lg:col-span-3 space-y-6 md:space-y-8 order-1 lg:order-1">
              {hasBrands && (
                <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 md:p-8">
                  <div className="relative z-10">
                    <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-4 md:mb-6 flex items-center gap-2">
                      Top Brands
                    </h3>
                    
                    {/* 4. Improved mobile scrolling with edge-to-edge bleed and snap behavior */}
                    <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar snap-x snap-mandatory -mx-5 px-5 lg:mx-0 lg:px-0">
                      {category.allBrands!.slice(0, 6).map((brand, index) => (
                        <button
                          key={brand}
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => router.push(`/ghuba/productlist?category=${category.id}&brand=${brand}`)}
                          className="snap-start animate-slide-in-right opacity-0 fill-mode-forwards group flex shrink-0 lg:shrink flex-row items-center justify-between p-3 md:p-4 bg-white dark:bg-zinc-800 rounded-xl md:rounded-2xl border border-transparent hover:border-amber-500/50 hover:shadow-xl focus:border-amber-500 focus:outline-none transition-all cursor-pointer w-[160px] lg:w-full"
                        >
                          <span className="text-xs md:text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-500 transition-colors truncate pr-2">
                            {brand}
                          </span>
                          <CheckBadgeIcon className="w-5 h-5 shrink-0 text-zinc-300 dark:text-zinc-700 group-hover:text-amber-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                </div>
              )}

              {/* Promotional Mini-Banner (Hidden on smaller screens to save space) */}
              <div className="hidden lg:block relative h-64 rounded-[2.5rem] bg-amber-500 p-8 overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-amber-500/20 transition-all">
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <h4 className="text-white text-2xl font-black uppercase leading-tight">
                    Premium <br /> Selections
                  </h4>
                  <p className="text-amber-900/60 text-xs font-bold uppercase tracking-widest">
                    Verified Quality
                  </p>
                </div>
                <RectangleGroupIcon className="absolute -bottom-4 -right-4 w-32 h-32 text-amber-600/20 group-hover:scale-110 transition-transform duration-700" />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-9 order-2 lg:order-2">
              {hasProducts ? (
                // 5. Improved responsive grid: 2 cols on mobile, 3 on tablet, 3/4 on large screens
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                  {shopItems.map((product) => (
                    <div key={product.id} className="w-full flex justify-center">
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
                // 6. Intuitive Empty State
                <div className="w-full h-64 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/30 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-center p-6">
                  <ArchiveBoxXMarkIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mb-4" />
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                    We couldn't find any items in this collection right now. Check back later for restocks!
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
            transform: translateX(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .fill-mode-forwards {
          animation-fill-mode: forwards;
        }
        
        /* Hide scrollbar but maintain functionality */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </>
  );
};

export default Shop;