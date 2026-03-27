"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  SpeakerWaveIcon, 
  Battery50Icon, 
  MusicalNoteIcon,
  CpuChipIcon,
  ArrowRightCircleIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Studio Precision) --- */
const FALLBACK_AUDIO = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

function resolveAudioStyle(index: number) {
  const themes = [
    { accent: "text-blue-400", glow: "shadow-blue-500/10", border: "group-hover:border-blue-500/30", label: "Active Noise Cancelling" },
    { accent: "text-purple-400", glow: "shadow-purple-500/10", border: "group-hover:border-purple-500/30", label: "Audiophile Grade" },
    { accent: "text-emerald-400", glow: "shadow-emerald-500/10", border: "group-hover:border-emerald-500/30", label: "Ultra-Portable" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Pulse & Frequency) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function AudioCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveAudioStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <Link href={`/site/${storeSlug}/earphonesecommerce/products?category=${cat.id}`} className="block">
        <div className={`relative h-[580px] w-full overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/5 transition-all duration-700 ${theme.border} ${theme.glow}`}>
          
          {/* Waveform Decorative Background */}
          <div className="absolute top-10 right-10 opacity-[0.05] group-hover:opacity-[0.15] transition-opacity duration-1000">
             <SpeakerWaveIcon className="w-40 h-40 text-white" />
          </div>

          {/* Product Image: High Definition Focus */}
          <div className="h-1/2 w-full relative overflow-hidden p-8">
            <div className="relative h-full w-full rounded-3xl overflow-hidden">
               <Image
                src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_AUDIO)}
                alt={cat.displayName || ""}
                fill
                className="object-contain transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                loader={imageLoader}
               />
            </div>
          </div>

          {/* Content Section: Tech-Forward */}
          <div className="p-10 pt-4">
            <div className={`text-[9px] font-black uppercase tracking-[0.3em] ${theme.accent} mb-4 flex items-center gap-2`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              {theme.label}
            </div>
            
            <h3 className="text-4xl font-bold text-white mb-4 tracking-tight">
              {cat.displayName}
            </h3>
            
            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-[220px] mb-8">
              Engineered for clarity. Tuned for the streets of Nairobi.
            </p>

            <div className="flex items-center justify-between">
               <div className="flex gap-4">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-600 uppercase">Drivers</span>
                     <span className="text-xs font-bold text-slate-300">Titanium</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-600 uppercase">Latency</span>
                     <span className="text-xs font-bold text-slate-300">40ms</span>
                  </div>
               </div>
               
               <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:bg-white group-hover:text-slate-950 transition-all duration-500 group-hover:scale-110">
                  <ArrowRightCircleIcon className="w-7 h-7" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function AudioCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-black min-h-screen py-32 overflow-hidden relative">
      {/* Background Ambience: Blue/Purple Studio Glow */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[180px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Immersive & Bold */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Precision Audio Engineering</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter"
            >
              Pure Sound. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Zero Noise.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md max-w-xs"
          >
             <MusicalNoteIcon className="w-8 h-8 text-blue-400 mb-4" />
             <p className="text-sm text-slate-400 font-bold leading-relaxed">
               "Experience 360° Spatial Audio designed for the modern Kenyan lifestyle."
             </p>
          </motion.div>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((cat, idx) => (
            <AudioCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* "Battery & Tech" Tech-Spec Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] p-12 text-white flex flex-col justify-between group overflow-hidden relative border border-white/10">
              <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110">
                <Battery50Icon className="w-64 h-64" />
              </div>
              
              <div className="relative z-10">
                <CpuChipIcon className="w-10 h-10 text-emerald-400 mb-8" />
                <h4 className="text-3xl font-black leading-tight mb-4 uppercase italic">Hyper-Efficiency <br /> Processing</h4>
                <p className="text-sm text-slate-400 font-medium">Up to 60 hours of playtime on a single 15-minute charge.</p>
              </div>

              <button className="relative z-10 mt-12 inline-flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] text-blue-400 hover:text-white transition-colors">
                Explore the Tech <ArrowRightCircleIcon className="w-5 h-5" />
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}