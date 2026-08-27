"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  Square3Stack3DIcon, 
  ArrowRightIcon,
  HomeIcon
} from "@heroicons/react/24/outline";

/* --- Animations: Calm & Structural --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
};

const customLoader = ({ src }: { src: string }) => src;

export default function FurnitureCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fcfaf8] dark:bg-[#0c0c0c] min-h-screen pt-32 pb-24">
      
      {/* 1. MINIMAL ARCHITECTURAL HEADER */}
      <header className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-4 text-amber-700 dark:text-amber-500"
        >
          <HomeIcon className="w-4 h-4" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Interior curation</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-5xl md:text-7xl font-light tracking-tight text-slate-900 dark:text-white mb-6"
        >
          Design Your <span className="italic font-serif text-slate-400">Sanctuary</span>
        </motion.h1>
        
        <div className="w-12 h-px bg-slate-300 dark:bg-gray-800 mx-auto" />
      </header>

      {/* 2. BENTO-STYLED CATEGORY GRID */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[280px]"
        >
          {categories.map((cat, idx) => {
            // Create a "Bento" feel by varying the span of cards
            // Card 1: Large square, Card 2: Tall, Card 3: Wide, etc.
            const spans = [
              "md:col-span-2 md:row-span-2", // Large Square
              "md:col-span-2 md:row-span-1", // Horizontal
              "md:col-span-2 md:row-span-1", // Horizontal
              "md:col-span-3 md:row-span-2", // Hero Wide
              "md:col-span-3 md:row-span-2", // Hero Wide
            ];
            const currentSpan = spans[idx % spans.length];

            return (
              <motion.div key={cat.id} variants={cardVariants} className={currentSpan}>
                <FurnitureCategoryCard cat={cat} storeSlug={storeSlug} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 opacity-50 font-serif italic">
          Curating collections...
        </div>
      )}
    </main>
  );
}

/* --- The Card: "Space & Form" --- */
function FurnitureCategoryCard({ cat, storeSlug }: { cat: IStoreCategory; storeSlug: string }) {
  const isImageUrl = cat.image || cat.icon?.startsWith("http") || cat.icon?.startsWith("/");
  const categoryName = cat.displayName || "Unstructured";

  return (
    <Link 
      href={`/furnitureecommerce/products?category=${cat.id}`} 
      className="group relative h-full w-full block overflow-hidden rounded-xl bg-white dark:bg-[#151515] border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      {/* Background Image with subtle parallax-ish zoom */}
      <div className="absolute inset-0 z-0 transition-transform duration-1000 ease-out group-hover:scale-105">
        {isImageUrl ? (
          <Image
            src={cat.image || cat.icon || "https://via.placeholder.com/600x800?text=No+Image"}
            alt={categoryName}
            loader={customLoader}
            fill
            className="object-cover brightness-[0.9] dark:brightness-[0.7] group-hover:brightness-100 transition-all"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-gray-900">
             <Square3Stack3DIcon className="w-12 h-12 text-slate-200 dark:text-gray-800" />
          </div>
        )}
        {/* Soft Linear Gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
      </div>

      {/* Floating Content Label */}
      <div className="absolute bottom-0 left-0 p-8 z-10 w-full flex items-end justify-between">
        <div>
           <p className="text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase mb-1">
             Explore Range
           </p>
           <h3 className="text-2xl md:text-3xl font-light tracking-tight text-white leading-none">
             {categoryName}
           </h3>
        </div>
        
        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
           <ArrowRightIcon className="w-5 h-5" />
        </div>
      </div>

      {/* Glassmorphism Border Effect on Hover */}
      <div className="absolute inset-0 border-[0px] group-hover:border-[12px] border-white/5 transition-all duration-500 pointer-events-none" />
    </Link>
  );
}