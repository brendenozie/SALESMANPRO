"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  ArrowLongRightIcon, 
  HashtagIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/outline";

/* --- Animations: Smooth & Elegant --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] } 
  },
};

const customLoader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=80`;


export default function FashionCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-white dark:bg-[#0a0a0a] min-h-screen pt-32 pb-24 overflow-hidden">
      
      {/* 1. EDITORIAL HEADER */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-8 border-b border-slate-200 dark:border-gray-800 pb-12">
          <div className="max-w-2xl">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-bold tracking-[0.3em] uppercase text-indigo-600 mb-4"
            >
              The 2026 Collection
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl md:text-8xl font-light tracking-tighter text-slate-900 dark:text-white leading-none"
            >
              Curated <br />
              <span className="font-serif italic text-slate-400 dark:text-gray-600">Aesthetics</span>
            </motion.h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-[280px] text-sm text-slate-500 dark:text-gray-400 leading-relaxed font-medium italic"
          >
            "Fashion is the armor to survive the reality of everyday life." — Explore our curated departments.
          </motion.p>
        </div>
      </section>

      {/* 2. ALTERNATING LAYOUT GRID */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-y-24 gap-x-12"
        >
          {categories.map((cat, idx) => {
            // Editorial Layout Logic: Alternating widths/heights
            const isLarge = idx % 3 === 0;
            const gridSpan = isLarge ? "lg:col-span-7" : "lg:col-span-5";
            const marginTop = !isLarge && idx !== 0 ? "lg:mt-24" : "mt-0";

            return (
              <motion.div key={cat.id} variants={itemVariants} className={`${gridSpan} ${marginTop}`}>
                <FashionCategoryCard cat={cat} storeSlug={storeSlug} index={idx} isLarge={isLarge} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-40">
           <ShoppingBagIcon className="w-12 h-12 mx-auto text-slate-200 mb-4" />
           <p className="font-serif italic text-slate-400">The showroom is currently being prepared.</p>
        </div>
      )}
    </main>
  );
}

/* --- The Card: "Editorial Frame" --- */
function FashionCategoryCard({ cat, storeSlug, index, isLarge }: { cat: IStoreCategory; storeSlug: string; index: number; isLarge: boolean }) {
  const isImageUrl = cat.image || cat.icon?.startsWith("http") || cat.icon?.startsWith("/");
  const categoryName = cat.displayName || "Unlabeled";

  return (
    <Link href={`/${storeSlug}/fashionecommerce/products?category=${cat.id}`} className="group block">
      <div className="relative flex flex-col gap-6">
        
        {/* Image Container with "Photo Frame" feel */}
        <div className={`relative overflow-hidden bg-slate-100 dark:bg-gray-900 ${isLarge ? 'aspect-[4/5]' : 'aspect-square'}`}>
          {isImageUrl ? (
            <Image
              src={cat.image || "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"}
              alt={categoryName}
              loader={customLoader}
              fill
              className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
               <HashtagIcon className="w-20 h-20 text-slate-200 dark:text-gray-800" />
            </div>
          )}
          
          {/* Subtle Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          
          {/* Index Number (Editorial Detail) */}
          <span className="absolute top-6 left-6 text-[10px] font-black text-white mix-blend-difference tracking-widest">
            DEPT / 0{index + 1}
          </span>
        </div>

        {/* Info Area: Minimal & Sophisticated */}
        <div className="flex items-end justify-between border-b border-transparent group-hover:border-slate-200 dark:group-hover:border-gray-800 pb-4 transition-all">
          <div className="space-y-1">
            <h3 className="text-3xl font-light tracking-tighter text-slate-900 dark:text-white uppercase">
              {categoryName}
            </h3>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              {cat.subcategories?.length || 0} Collections
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 overflow-hidden">
             <span className="text-[10px] font-black uppercase tracking-widest translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
               Discover
             </span>
             <ArrowLongRightIcon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </Link>
  );
}