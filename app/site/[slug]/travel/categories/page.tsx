"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  GlobeAsiaAustraliaIcon, 
  MapIcon, 
  SunIcon,
  CloudIcon,
  MapPinIcon,
  ArrowLongRightIcon,
  CameraIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Earth & Horizon) --- */
const FALLBACK_TRAVEL = "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

function resolveTravelStyle(index: number) {
  const themes = [
    { accent: "text-amber-600", bg: "bg-amber-600", vibe: "Safari / Wild", temp: "28°C" },
    { accent: "text-cyan-600", bg: "bg-cyan-600", vibe: "Coastal / Zen", temp: "30°C" },
    { accent: "text-emerald-700", bg: "bg-emerald-700", vibe: "Highlands / Mist", temp: "18°C" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Fluid & Atmospheric) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function TravelCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveTravelStyle(index);

  return (
    <motion.div variants={cardVariants} className="group relative">
      <Link href={`/site/${storeSlug}/travel/products?category=${cat.id}`} className="block">
        <div className="relative h-[650px] w-full overflow-hidden rounded-[3rem] bg-stone-200 transition-all duration-1000 group-hover:shadow-[0_50px_100px_-30px_rgba(0,0,0,0.3)]">
          
          {/* Main Visual */}
          <div className="absolute inset-0">
            <Image
              src={cat.icon?.startsWith('http') ? cat.icon : FALLBACK_TRAVEL}
              alt={cat.displayName || ""}
              fill
              loader={loader}
              className="object-cover transition-transform duration-[3s] group-hover:scale-110"
            />
            {/* Soft Editorial Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-stone-950/90 opacity-80" />
          </div>

          {/* Top Metadata: "The Stamp" */}
          <div className="absolute top-10 left-10 right-10 flex justify-between items-start z-20">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 flex items-center gap-3">
                <MapPinIcon className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">Magical Kenya</span>
             </div>
             <div className="text-right">
                <p className="text-white font-mono text-xl font-bold leading-none">{theme.temp}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/60">{theme.vibe}</p>
             </div>
          </div>

          {/* Interaction Layer: The "Viewfinder" */}
          <div className="absolute inset-0 border-[1px] border-white/0 group-hover:border-white/20 transition-all duration-700 m-6 rounded-[2rem] pointer-events-none" />

          {/* Core Content */}
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <motion.div className="mb-4 flex items-center gap-2">
               <div className={`w-8 h-[1px] ${theme.bg}`} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Expedition 0{index + 1}</span>
            </motion.div>

            <h3 className="text-6xl font-serif italic tracking-tighter mb-8 group-hover:translate-x-3 transition-transform duration-700">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center justify-between">
               <p className="text-xs text-stone-400 font-medium max-w-[200px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                 Discover hidden gems and curated stays in the heart of {cat.displayName?.toLowerCase()}.
               </p>
               <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                  <ArrowLongRightIcon className="w-6 h-6" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function TravelCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#F9F7F2] min-h-screen py-32 overflow-hidden selection:bg-emerald-800 selection:text-white">
      {/* Subtle Topography Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/topography.png')]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: The Explorer's Journal */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-10"
            >
              <GlobeAsiaAustraliaIcon className="w-6 h-6 text-emerald-800" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500">Uncharted Territory • 2026</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-8xl md:text-[11rem] font-serif italic text-stone-900 leading-[0.75] tracking-tighter"
            >
              Find Your <br />
              <span className="font-sans font-black uppercase text-transparent" style={{ WebkitTextStroke: '1.5px #1c1917' }}>Wild.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 bg-white/50 backdrop-blur-xl border border-stone-200 rounded-[2.5rem] max-w-sm shadow-xl"
          >
             <div className="flex items-center gap-3 mb-6">
                <CameraIcon className="w-5 h-5 text-emerald-700" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-800">Featured Gallery</span>
             </div>
             <p className="text-xs text-stone-500 font-bold leading-loose uppercase tracking-widest italic">
               "From the salt-sprayed ruins of Gedi to the red dust of Tsavo—every path tells a story."
             </p>
          </motion.div>
        </div>

        {/* The Grid: The Storyboard */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((cat, idx) => (
            <TravelCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Book Experience CTA */}
          <motion.div variants={cardVariants} className="lg:col-span-1 bg-emerald-900 rounded-[3.5rem] p-12 text-white flex flex-col justify-between group relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523805081446-ed9a9c8cb7ff?auto=format&fit=crop&w=800&q=80')] opacity-20 mix-blend-overlay grayscale" />
              
              <div className="relative z-10">
                <SunIcon className="w-12 h-12 text-amber-400 mb-8 animate-spin-slow" />
                <h4 className="text-4xl font-serif italic leading-tight mb-4 tracking-tight">Custom <br /> Itineraries.</h4>
                <p className="text-[10px] text-emerald-200 font-bold uppercase tracking-widest leading-loose">Work with our local guides to map out a journey that exists on no map. Pure, raw, and yours.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-6 bg-white text-emerald-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-amber-400 hover:text-emerald-950 transition-all shadow-xl">
                Start My Story
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}