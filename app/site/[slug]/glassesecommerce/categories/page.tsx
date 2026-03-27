"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  EyeIcon, 
  SunIcon, 
  SparklesIcon,
  MagnifyingGlassIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME & STYLE HELPERS (Optical Clarity) --- */
const FALLBACK_GLASSES = "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=800&q=80";

function resolveGlassesStyle(index: number) {
  const themes = [
    { accent: "text-blue-500", bg: "bg-blue-50/50", border: "border-blue-100", label: "Precision Blue" },
    { accent: "text-indigo-500", bg: "bg-indigo-50/50", border: "border-indigo-100", label: "Modern Minimal" },
    { accent: "text-slate-900", bg: "bg-slate-100/50", border: "border-slate-200", label: "Classic Noir" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (The "Focus" Effect) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(8px)", scale: 0.95 },
  visible: { 
    opacity: 1, 
    filter: "blur(0px)", 
    scale: 1, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */
const customLoader = ({ src }: { src: string }) => {
  return src.startsWith("http") ? src : FALLBACK_GLASSES;
};

function GlassesCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveGlassesStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <Link href={`/site/${storeSlug}/glassesecommerce/products?category=${cat.id}`} className="block">
        <div className="relative h-[550px] w-full overflow-hidden rounded-[2rem] bg-white border border-slate-100 transition-all duration-700 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
          
          {/* Main Visual: Refractive Lens Effect */}
          <div className="h-2/3 w-full relative overflow-hidden bg-slate-50">
            <Image
              src={cat.icon?.startsWith('http') ? cat.icon : FALLBACK_GLASSES}
              alt={cat.displayName || ""}
              loader={customLoader}
              fill
              className="object-cover transition-all duration-1000 grayscale group-hover:grayscale-0 group-hover:scale-110"
            />
            
            {/* The "Lens" Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent opacity-60" />
            
            {/* Floating Frame Icon */}
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
               <ArrowUpRightIcon className="w-5 h-5 text-slate-900" />
            </div>
          </div>

          <div className="p-10 -mt-16 relative z-10 bg-white/80 backdrop-blur-xl h-full rounded-t-[3rem]">
            <div className="mb-4 overflow-hidden">
               <span className={`inline-block text-[10px] font-black uppercase tracking-[0.3em] ${theme.accent} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`}>
                 {theme.label}
               </span>
            </div>
            
            <h3 className="text-4xl font-light text-slate-900 mb-4 tracking-tight group-hover:tracking-widest transition-all duration-700">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center gap-6">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Collections</span>
                  <span className="text-lg font-bold text-slate-800">{cat.subcategories?.length || 0}+</span>
               </div>
               <div className="h-8 w-px bg-slate-100" />
               <p className="text-xs text-slate-400 font-medium max-w-[140px] leading-relaxed">
                 Handcrafted frames for every face shape.
               </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */



export default function GlassesCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#f8fafc] min-h-screen py-32 overflow-hidden relative">
      {/* Refractive Light Patterns */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/60 rounded-full blur-[100px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Minimal & Crisp */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-28 gap-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <EyeIcon className="w-5 h-5 text-blue-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Nairobi Optical Studio</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-light text-slate-900 leading-[0.9] tracking-tighter"
            >
              Clear Vision, <br />
              <span className="italic font-serif font-light text-blue-500 underline decoration-blue-100 underline-offset-8">Sharp Style.</span>
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-slate-500 font-medium max-w-xs border-l-2 border-slate-200 pl-8 leading-relaxed italic"
          >
            "See the world as it was meant to be seen. Precision-engineered lenses meet runway-ready frames."
          </motion.p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {categories.map((cat, idx) => (
            <GlassesCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* "Virtual Try-On" Bento Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-slate-900 rounded-[2rem] p-12 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <SparklesIcon className="w-12 h-12 text-blue-400 mb-8" />
                <h4 className="text-3xl font-light leading-tight mb-4 uppercase tracking-tight">AR Virtual <br /> <span className="text-blue-400 italic font-serif">Try-On</span></h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">Not sure which frame fits? Use your camera to preview any pair instantly.</p>
              </div>

              <button className="relative z-10 w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all transform group-hover:translate-y-[-5px]">
                Launch Camera
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}