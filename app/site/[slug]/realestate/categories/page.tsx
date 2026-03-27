"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  HomeModernIcon, 
  BuildingOffice2Icon, 
  SparklesIcon,
  MapPinIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  ScaleIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Quiet Luxury) --- */
const FALLBACK_ESTATE = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80";

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function resolveEstateStyle(index: number) {
  const themes = [
    { accent: "text-amber-600", bg: "bg-amber-600", label: "Premium Selection", vibe: "Modern Minimalism" },
    { accent: "text-stone-400", bg: "bg-stone-500", label: "New Development", vibe: "Urban Sophistication" },
    { accent: "text-emerald-700", bg: "bg-emerald-700", label: "Green Living", vibe: "Eco-Conscious" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Slow & Precise) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function EstateCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveEstateStyle(index);

  return (
    <motion.div variants={cardVariants} className="group cursor-pointer">
      <Link href={`/site/${storeSlug}/realestate/products?category=${cat.id}`} className="block">
        <div className="relative h-[700px] w-full overflow-hidden rounded-[1rem] bg-stone-100 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-stone-900/10">
          
          {/* Main Visual */}
          <div className="absolute inset-0">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_ESTATE)}
              alt={cat.displayName || ""}
              loader={customLoader}
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            {/* Soft Editorial Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
          </div>

          {/* Top Info Bar */}
          <div className="absolute top-8 inset-x-8 z-20 flex justify-between items-start">
             <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-sm border border-stone-200">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-900">{theme.label}</span>
             </div>
             <div className="w-12 h-12 bg-stone-950 rounded-full flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-500">
                <ArrowRightIcon className="w-5 h-5 -rotate-45" />
             </div>
          </div>

          {/* Core Content */}
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <div className="flex items-center gap-3 mb-4">
               <div className={`w-1 h-8 ${theme.bg}`} />
               <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">
                 {theme.vibe}
               </span>
            </div>

            <h3 className="text-5xl font-serif italic mb-6 tracking-tight leading-none">
              {cat.displayName}
            </h3>
            
            {/* Detail Reveal on Hover */}
            <div className="grid grid-cols-2 gap-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100 border-t border-white/10 pt-8">
               <div className="flex items-center gap-3">
                  <ScaleIcon className="w-5 h-5 text-stone-400" />
                  <span className="text-[11px] font-medium uppercase tracking-widest text-stone-200">Flexible Plans</span>
               </div>
               <div className="flex items-center gap-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-stone-400" />
                  <span className="text-[11px] font-medium uppercase tracking-widest text-stone-200">High ROI Potential</span>
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function RealEstateCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fcfaf7] min-h-screen py-32 overflow-hidden relative selection:bg-stone-900 selection:text-white">
      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Editorial & Sophisticated */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12 border-b border-stone-200 pb-20">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="w-10 h-[1px] bg-stone-900" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-900">Nairobi Property Portfolio</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-serif italic text-stone-950 leading-[0.8] tracking-tighter"
            >
              Refined <br />
              <span className="font-sans font-black not-italic uppercase tracking-tight">Spaces.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-end text-right max-w-xs"
          >
             <MapPinIcon className="w-6 h-6 mb-4 text-stone-400" />
             <p className="text-xs text-stone-600 font-medium leading-relaxed uppercase tracking-[0.2em]">
               Curating the finest residential and commercial opportunities in East Africa’s most vibrant hubs.
             </p>
          </motion.div>
        </div>

        {/* The Grid: Spacious & Breathable */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-16"
        >
          {categories.map((cat, idx) => (
            <EstateCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Investor Portal CTA */}
          <motion.div variants={cardVariants} className="md:col-span-2 bg-stone-950 rounded-[1rem] p-16 text-white flex flex-col md:flex-row justify-between items-center group relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none" />
              
              <div className="relative z-10 max-w-xl mb-10 md:mb-0">
                <SparklesIcon className="w-12 h-12 text-amber-500 mb-8" />
                <h4 className="text-5xl font-serif italic leading-tight mb-4 tracking-tight">Investment Grade Portfolio</h4>
                <p className="text-xs text-stone-400 font-medium uppercase tracking-[0.3em] leading-loose">Access off-market listings and institutional-grade data for Nairobi's high-growth corridors.</p>
              </div>

              <button className="relative z-10 px-12 py-6 bg-white text-stone-950 rounded-full font-black text-[10px] uppercase tracking-[0.5em] hover:bg-amber-600 hover:text-white transition-all shadow-xl">
                Join Investor Circle
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}