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
import load from "@/assets/load.png";

const loaderProp = ({ src, width, quality }: any) => {
  return `${src}?w=${width || 800}&q=${quality || 75}`;
};

const Shop = ({ addToCart, category, shopItems }: any) => {
  const router = useRouter();

  return (
    <section className="py-24 bg-white dark:bg-[#080808] transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6">
        
        {/* Header with Category Context */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                {category?.icon || <RectangleGroupIcon className="w-5 h-5" />}
              </span>
              <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em]">
                Featured Collection
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
              {category?.name} <span className="text-amber-500 italic">Showcase</span>
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-3 px-8 py-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition-all"
          >
            <span>View All {category?.name}</span>
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Brand Curator Sidebar (Left - 3 Cols) */}
          <aside className="lg:col-span-3 space-y-8">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8">
              <div className="relative z-10">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                  Top Brands
                </h3>
                <div className="space-y-3">
                  {category?.allBrands?.slice(0, 6).map((brand: any, index: number) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-transparent hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all cursor-pointer"
                    >
                      <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-500 transition-colors">
                        {brand}
                      </span>
                      <CheckBadgeIcon className="w-4 h-4 text-zinc-300 dark:text-zinc-700 group-hover:text-amber-500 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>
              {/* Abstract BG Pattern */}
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

          {/* Product Grid (Right - 9 Cols) */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {shopItems?.data?.map((item: any) => (
                <ProductCard key={item.id} product={item} addToCart={addToCart} />
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({ product, addToCart }: any) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-zinc-900/30 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-500/30"
    >
      {/* Image Container */}
      <div 
        onClick={() => router.push(`/ghuba/product/${product.id}`)}
        className="relative aspect-square rounded-[2rem] overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
      >
        <Image
          fill
          loader={loaderProp}
          src={imageError ? load.src : (product.images?.[0] || product.image || "/fallback.png")}
          alt={product.title}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          onError={() => setImageError(true)}
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="bg-amber-500 text-white p-4 rounded-2xl shadow-xl flex items-center gap-2 font-bold"
          >
            <PlusIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 px-2 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter truncate w-2/3">
            {product.title}
          </h3>
          <span className="text-amber-500 font-black text-lg">
            ${product.finalPrice?.toFixed(2)}
          </span>
        </div>
        
        <p className="text-zinc-500 dark:text-zinc-500 text-xs font-medium line-clamp-1 leading-relaxed uppercase tracking-widest">
          {product.description || "Premium Quality Product"}
        </p>

        <div className="pt-4 flex items-center justify-between">
           <button 
             onClick={() => router.push(`/ghuba/product/${product.id}`)}
             className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-amber-500 transition-colors"
           >
             Details
           </button>
           
           <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="w-1 h-1 rounded-full bg-amber-500/30" />
              ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Shop;