"use client";

import React, { useState } from "react";
import { 
  PlusIcon, 
  ArrowRightIcon, 
  ShoppingCartIcon,
  RectangleGroupIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import GhubaProductCard from "../GhubaProductCard";

const Shop = ({ addToCart, category, shopItems }: any) => {
  const router = useRouter();
  const [likedItems, setLikedItems] = useState<any>({});
    
  const toggleLike = (id: any) => {
    setLikedItems((prev: any) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="py-12 md:py-24 bg-white dark:bg-[#080808] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        
        {/* Header Section - Optimized for Mobile */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                {category?.icon || <RectangleGroupIcon className="w-5 h-5" />}
              </span>
              <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                Featured Collection
              </span>
            </div>
            <h2 className="text-3xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
              {category?.name} <span className="text-amber-500 italic">Showcase</span>
            </h2>
          </div>

          <motion.button
            onClick={() => router.push(`/ghuba/productlist?category=${category?.id}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group w-full md:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition-all text-sm"
          >
            <span>View All</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Curator Sidebar - Collapsible spacing on mobile */}
          <aside className="lg:col-span-3 space-y-6 md:space-y-8 order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-5 md:p-8">
              <div className="relative z-10">
                <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-4 md:mb-6 flex items-center gap-2">
                  Top Brands
                </h3>
                {/* Scrollable brands on mobile to save vertical space */}
                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                  {category?.allBrands?.slice(0, 6).map((brand: any, index: number) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => router.push(`/ghuba/productlist?category=${category?.id}&brand=${brand}`)}
                      className="group flex shrink-0 lg:shrink flex-row items-center justify-between p-3 md:p-4 bg-white dark:bg-zinc-800 rounded-xl md:rounded-2xl border border-transparent hover:border-amber-500/50 hover:shadow-xl transition-all cursor-pointer min-w-[140px] lg:min-w-full"
                    >
                      <span className="text-xs md:text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-500 transition-colors">
                        {brand}
                      </span>
                      <CheckBadgeIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-amber-500 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Promotional Mini-Banner */}
            <div className="hidden lg:block relative h-64 rounded-[2.5rem] bg-amber-500 p-8 overflow-hidden group">
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

          {/* Product Grid - 2 COLUMNS ON MOBILE */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8">
              {shopItems?.data?.map((product: any) => (
                <div key={product.id} className="w-full">
                  <GhubaProductCard 
                    product={product} 
                    toggleLike={toggleLike} 
                    likedItems={likedItems} 
                    addToCart={addToCart} 
                  />
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default Shop;