"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  WrenchScrewdriverIcon, 
  FireIcon, 
  Battery50Icon,
  BoltIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  Square3Stack3DIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Power & Velocity) --- */
const FALLBACK_CAR = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


function resolveAutoStyle(index: number) {
  const themes = [
    { accent: "text-orange-500", bg: "bg-orange-500", glow: "shadow-orange-500/20", tag: "Performance" },
    { accent: "text-blue-500", bg: "bg-blue-500", glow: "shadow-blue-500/20", tag: "Electric/Hybrid" },
    { accent: "text-stone-400", bg: "bg-stone-500", glow: "shadow-stone-500/20", tag: "Executive" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Aggressive & Smooth) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function AutoCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveAutoStyle(index);

  return (
    <motion.div variants={cardVariants} className="group relative">
      <Link href={`/automotive/products?category=${cat.id}`} className="block">
        <div className="relative h-[550px] w-full overflow-hidden rounded-br-[5rem] bg-stone-900 shadow-2xl transition-all duration-700 group-hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
          
          {/* Main Visual */}
          <div className="absolute inset-0">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_CAR)}
              alt={cat.displayName || ""}
              fill
              loader={loader}
              className="object-cover transition-transform duration-[1.5s] group-hover:scale-110 group-hover:-translate-x-4 grayscale group-hover:grayscale-0"
            />
            {/* High-Contrast Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-700" />
          </div>

          {/* Performance Badge */}
          <div className="absolute top-8 left-8 z-20">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${theme.bg} animate-pulse`} />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white">{theme.tag}</span>
             </div>
          </div>

          {/* Core Content */}
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <div className="mb-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700">
               <div className="flex gap-6 items-center">
                  <div className="flex items-center gap-2">
                     <BoltIcon className="w-4 h-4 text-orange-500" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">Fast Track</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Square3Stack3DIcon className="w-4 h-4 text-blue-400" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300">42+ Units</span>
                  </div>
               </div>
            </div>

            <h3 className="text-6xl font-black italic uppercase tracking-tighter mb-8 leading-[0.8]">
              {cat.displayName}
            </h3>
            
            {/* Visual CTA */}
            <div className="flex items-center gap-4 border-l-2 border-white/20 pl-6 group-hover:border-orange-500 transition-colors">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 group-hover:text-white transition-colors">Inspect Inventory</span>
               <ChevronRightIcon className="w-5 h-5 text-white translate-x-0 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function AutoCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-stone-950 min-h-screen py-32 overflow-hidden selection:bg-orange-500 selection:text-black">
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Engineered for Speed */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12 border-b border-white/5 pb-20">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <FireIcon className="w-6 h-6 text-orange-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500">Global Automotive Exchange</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-8xl md:text-[11rem] font-black italic uppercase text-white leading-[0.75] tracking-tighter"
            >
              Drive <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #f97316' }}>Supreme.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-end text-right max-w-xs"
          >
             <div className="w-12 h-1 bg-orange-600 mb-6" />
             <p className="text-xs text-stone-400 font-bold leading-relaxed uppercase tracking-widest">
               "Nairobi's premier destination for high-spec engineering and off-road capability."
             </p>
          </motion.div>
        </div>

        {/* The Grid: Dynamic & Aggressive */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10"
        >
          {categories.map((cat, idx) => (
            <AutoCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Workshop/Service CTA */}
          <motion.div variants={cardVariants} className="lg:col-span-2 bg-stone-900 rounded-br-[5rem] p-16 text-white flex flex-col md:flex-row justify-between items-center group relative overflow-hidden border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-transparent" />
              
              <div className="relative z-10 max-w-xl mb-10 md:mb-0">
                <WrenchScrewdriverIcon className="w-12 h-12 text-orange-500 mb-8" />
                <h4 className="text-5xl font-black uppercase italic leading-tight mb-4 tracking-tighter">Elite <br /> Maintenance.</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-loose">Schedule factory-grade servicing and performance tuning for your machine.</p>
              </div>

              <button className="relative z-10 px-16 py-8 bg-white text-stone-950 rounded-sm font-black text-[10px] uppercase tracking-[0.5em] hover:bg-orange-600 hover:text-white transition-all shadow-2xl">
                Book Service
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}