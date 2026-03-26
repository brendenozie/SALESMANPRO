"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  ArrowUpRightIcon, 
  BoltIcon, 
  CubeIcon,
  FireIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/solid";

/* --- Animations: High Energy --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", damping: 20, stiffness: 100 } 
  },
};

/* --- Main Page --- */
export default function ShoeCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="relative bg-white dark:bg-[#050505] min-h-screen pt-32 pb-20 overflow-hidden">
      
      {/* 1. ATHLETIC BACKDROP (Subtle slanted lines for speed) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[120%] h-[120%] border-[40px] border-indigo-500 rotate-12" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black italic text-indigo-500 uppercase tracking-tighter">
          MOVEMENT
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 2. SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
             <motion.span 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-block px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] skew-x-[-12deg]"
             >
               Spring 2026
             </motion.span>
             <motion.h1 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] text-slate-900 dark:text-white"
             >
               Find Your <br /> <span className="text-transparent stroke-text dark:text-indigo-500">Perfect Fit</span>
             </motion.h1>
          </div>
          <p className="max-w-xs text-slate-500 dark:text-gray-400 font-bold uppercase text-xs tracking-widest leading-relaxed">
            Performance gear tailored for the track, the court, and the streets.
          </p>
        </div>

        {/* 3. DYNAMIC MASONRY GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"
        >
          {categories.map((cat, idx) => {
            // Logic to vary card width for "Stunning" look
            const gridSpan = idx % 3 === 0 ? "lg:col-span-8" : "lg:col-span-4";
            return (
              <motion.div key={cat.id} variants={cardVariants} className={gridSpan}>
                <ShoeCategoryCard cat={cat} storeSlug={storeSlug} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style jsx global>{`
        .stroke-text {
          -webkit-text-stroke: 1.5px #1e1b4b;
        }
        .dark .stroke-text {
          -webkit-text-stroke: 1.5px #6366f1;
        }
      `}</style>
    </main>
  );
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
}

/* --- The Card: "Elite Performance" --- */
function ShoeCategoryCard({ cat, storeSlug }: { cat: IStoreCategory; storeSlug: string }) {
  const isImageUrl = cat.image?.startsWith("http") || cat.image?.startsWith("/") || cat.icon?.startsWith("http") || cat.icon?.startsWith("/");
  const categoryName = cat.displayName || "Performance";

  return (
    <Link href={`/${storeSlug}/products?category=${cat.id}`} className="group block h-[400px] relative overflow-hidden bg-slate-100 dark:bg-gray-900 rounded-3xl">
      
      {/* Image with zoom and slight rotation effect */}
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-2">
        {isImageUrl ? (
          <Image
            src={cat.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"}
            alt={categoryName}
            fill
            className="object-cover"
            loader={customLoader}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
             <BoltIcon className="w-40 h-40 text-slate-200 dark:text-gray-800" />
          </div>
        )}
        {/* Dynamic Overlay: Dark on bottom, hint of brand color on top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-indigo-600/10 opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-8 flex flex-col justify-between">
        <div className="flex justify-end">
          <div className="w-12 h-12 rounded-full border border-white/30 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRightIcon className="w-6 h-6" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <FireIcon className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
              {cat.subcategories?.length || 0} Models
            </span>
          </div>
          
          <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter group-hover:text-indigo-400 transition-colors">
            {categoryName}
          </h3>
          
          <div className="h-1 w-0 bg-indigo-500 mt-2 group-hover:w-full transition-all duration-500" />
          
          <p className="mt-4 text-sm font-medium text-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            Engineered for elite performance and everyday comfort.
          </p>
        </div>
      </div>
    </Link>
  );
}