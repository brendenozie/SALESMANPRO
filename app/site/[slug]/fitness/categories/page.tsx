"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  BoltIcon, 
  SparklesIcon, 
  HeartIcon, 
  FireIcon,
  UserGroupIcon,
  ArrowUpRightIcon,
  BeakerIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS (Kinetic & Electric) --- */
const FALLBACK_GYM = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

function resolveFitnessStyle(index: number) {
  const themes = [
    { accent: "text-[#DFFF00]", bg: "bg-[#DFFF00]", glow: "shadow-[#DFFF00]/20", label: "High Intensity" },
    { accent: "text-rose-500", bg: "bg-rose-500", glow: "shadow-rose-500/20", label: "Recovery & Zen" },
    { accent: "text-cyan-400", bg: "bg-cyan-400", glow: "shadow-cyan-400/20", label: "Performance Labs" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Explosive & Sharp) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, rotateX: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotateX: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function FitnessCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveFitnessStyle(index);

  return (
    <motion.div variants={cardVariants} className="group relative perspective-1000">
      <Link href={`/site/${storeSlug}/ecommerce/products?category=${cat.id}`} className="block">
        <div className="relative h-[600px] w-full overflow-hidden rounded-[2rem] bg-stone-900 border border-white/5 transition-all duration-700 group-hover:border-[#DFFF00]/30 group-hover:shadow-[0_0_80px_-20px_rgba(223,255,0,0.15)]">
          
          {/* Main Visual */}
          <div className="absolute inset-0">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_GYM)}
              alt={cat.displayName || ""}
              loader={loader}
              fill
              className="object-cover transition-all duration-[1s] group-hover:scale-110 group-hover:rotate-1"
            />
            {/* Dynamic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90 group-hover:opacity-60 transition-opacity" />
          </div>

          {/* Kinetic Energy Bar (Top) */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white/10 overflow-hidden">
             <motion.div 
               animate={{ x: ["-100%", "100%"] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className={`w-1/2 h-full ${theme.bg}`}
             />
          </div>

          {/* Status Badge */}
          <div className="absolute top-8 left-8">
             <div className="flex items-center gap-2 px-4 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                <FireIcon className={`w-3 h-3 ${theme.accent} animate-pulse`} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">{theme.label}</span>
             </div>
          </div>

          {/* Core Content */}
          <div className="absolute inset-x-0 bottom-0 p-10">
            <div className="flex items-end justify-between mb-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <UserGroupIcon className="w-4 h-4 text-stone-400" />
                     <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">342 Active Now</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <BoltIcon className={`w-4 h-4 ${theme.accent}`} />
                     <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Elite Programs</span>
                  </div>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <ArrowUpRightIcon className="w-6 h-6 text-white" />
               </div>
            </div>

            <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.8] mb-6 group-hover:text-[#DFFF00] transition-colors">
              {cat.displayName}
            </h3>
            
            <p className="text-stone-400 text-xs font-bold leading-relaxed uppercase tracking-widest max-w-xs line-clamp-2">
              Engineered for those who refuse to settle. Pushing the boundaries of human potential in {cat.displayName?.toLowerCase()}.
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function FitnessCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-black min-h-screen py-32 overflow-hidden selection:bg-[#DFFF00] selection:text-black">
      {/* Decorative Scan-line Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: The Performance Hub */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12 border-b border-white/5 pb-20">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-10"
            >
               <BoltIcon className="w-6 h-6 text-[#DFFF00] drop-shadow-[0_0_10px_rgba(223,255,0,0.5)]" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500">Peak Performance Network • 2026</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-8xl md:text-[12rem] font-black italic text-white leading-[0.7] tracking-tighter uppercase"
            >
              Push <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #DFFF00' }}>Boundaries.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 bg-white/5 backdrop-blur-2xl border-l-4 border-[#DFFF00] rounded-r-3xl max-w-sm shadow-2xl"
          >
             <p className="text-xs text-stone-300 font-bold leading-loose uppercase tracking-widest">
               "Nairobi's elite ecosystem for physiological transformation and mental grit. This is the lab where legends are forged."
             </p>
          </motion.div>
        </div>

        {/* The Grid: The Arena */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {categories.map((cat, idx) => (
            <FitnessCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Supplement/Labs CTA */}
          <motion.div variants={cardVariants} className="lg:col-span-1 bg-[#DFFF00] rounded-[2rem] p-12 text-black flex flex-col justify-between group relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
              
              <div className="relative z-10">
                <BeakerIcon className="w-12 h-12 text-black mb-8" />
                <h4 className="text-4xl font-black italic leading-tight mb-4 tracking-tighter uppercase">Biohack <br /> Your Prep.</h4>
                <p className="text-[10px] text-black/60 font-black uppercase tracking-widest leading-loose">Access pharmaceutical-grade supplements and personalized nutrition protocols designed for high-performance athletes.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-6 bg-black text-[#DFFF00] rounded-xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-stone-800 transition-all shadow-xl">
                Explore The Labs
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}