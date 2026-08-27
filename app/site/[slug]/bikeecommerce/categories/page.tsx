"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  ShieldCheckIcon, 
  MapIcon, 
  FlagIcon,
  WrenchIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Performance Palette) --- */
const FALLBACK_BIKE = "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80";


const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;


function resolveBikeStyle(index: number) {
  const themes = [
    { accent: "text-red-600", bg: "bg-red-600", border: "group-hover:border-red-600/50", label: "Mountain & Trail" },
    { accent: "text-blue-500", bg: "bg-blue-600", border: "group-hover:border-blue-500/50", label: "Road & Speed" },
    { accent: "text-amber-500", bg: "bg-amber-600", border: "group-hover:border-amber-500/50", label: "Urban & Commute" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Kinetic Motion) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20, skewX: -2 },
  visible: { 
    opacity: 1, 
    x: 0, 
    skewX: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function BikeCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveBikeStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <Link href={`/bikeecommerce/products?category=${cat.id}`} className="block">
        <div className={`relative h-[650px] w-full overflow-hidden bg-white border-l-8 border-slate-100 transition-all duration-500 ${theme.border} group-hover:border-l-[16px]`}>
          
          {/* Subtle Speed Lines Pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none z-10" 
               style={{ backgroundImage: `repeatinglinear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)`, backgroundSize: '10px 10px' }} />

          {/* Asset Image: Wide Angle Focus */}
          <div className="h-[70%] w-full relative overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
            <Image
              src={cat.icon?.startsWith('http') ? cat.icon : FALLBACK_BIKE}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
                loader={imageLoader}
            />
            {/* Hard Angle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Content Area: Mechanical & Bold */}
          <div className="p-10 relative z-20">
            <div className="flex items-center gap-3 mb-4">
               <div className={`h-1 w-8 ${theme.bg}`} />
               <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.accent}`}>
                 {theme.label}
               </span>
            </div>
            
            <h3 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Models</span>
                  <span className="text-xl font-bold text-slate-900">{cat.subcategories?.length || 0}+ Series</span>
               </div>
               
               <div className={`w-16 h-16 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 transform group-hover:rotate-[-45deg]`}>
                  <ChevronRightIcon className="w-6 h-6" />
               </div>
            </div>
          </div>

          {/* Hover Accents */}
          <div className={`absolute top-0 right-0 w-1 h-0 ${theme.bg} transition-all duration-500 group-hover:h-full`} />
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function BikeCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-white min-h-screen py-32 overflow-hidden relative">
      {/* Decorative Track Grid */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.01] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Industrial & Kinetic */}
        <div className="mb-32">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            className="h-2 bg-slate-900 mb-10"
          />
          
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-8xl md:text-[12rem] font-black text-slate-900 leading-[0.75] tracking-tighter uppercase italic"
          >
            Own <br />
            The <span className="text-transparent" style={{ WebkitTextStroke: '2px #0f172a' }}>Road.</span>
          </motion.h1>
          
          <div className="mt-16 flex flex-col md:flex-row gap-12 md:items-center">
             <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.4em] max-w-sm">
               "Nairobi’s premier destination for high-performance cycling and professional maintenance."
             </p>
             <div className="flex gap-8">
                <div className="flex flex-col">
                   <span className="text-3xl font-black italic">500+</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Frames Sold</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-3xl font-black italic">24h</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Pro Service</span>
                </div>
             </div>
          </div>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-slate-100"
        >
          {categories.map((cat, idx) => (
            <BikeCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* "Service Lab" Specialty Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-slate-900 p-16 text-white flex flex-col justify-between group relative overflow-hidden">
              {/* Mechanical Background Element */}
              <div className="absolute -right-16 -bottom-16 opacity-5 group-hover:rotate-90 transition-transform duration-1000">
                 <WrenchIcon className="w-80 h-80" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 border-2 border-red-600 mb-10 flex items-center justify-center">
                   <div className="w-4 h-4 bg-red-600 animate-pulse" />
                </div>
                <h4 className="text-5xl font-black italic mb-6 leading-none uppercase">The <br /> Service <br /> Lab</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xs">Hydraulic bleeding, gear indexing, and full carbon frame diagnostics in the heart of Nairobi.</p>
              </div>

              <button className="relative z-10 mt-12 group flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] hover:text-red-500 transition-colors">
                Book Maintenance <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}