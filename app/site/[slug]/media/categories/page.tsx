"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  PlayIcon, 
  MusicalNoteIcon, 
  TvIcon, 
  TicketIcon,
  FireIcon,
  SparklesIcon,
  ArrowRightIcon,
  RadioIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS (Vibrant Pulse) --- */
const FALLBACK_MEDIA = "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


function resolveMediaStyle(index: number) {
  const themes = [
    { accent: "text-red-600", bg: "bg-red-600", shadow: "shadow-red-500/20", label: "Live Now" },
    { accent: "text-indigo-500", bg: "bg-indigo-500", shadow: "shadow-indigo-500/20", label: "New Release" },
    { accent: "text-amber-500", bg: "bg-amber-500", shadow: "shadow-amber-500/20", label: "Trending" },
  ];
  return themes[index % themes.length];
}

/* --- 2. SUBCOMPONENTS --- */

function MediaCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveMediaStyle(index);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group relative"
    >
      <Link href={`/site/${storeSlug}/media/products?category=${cat.id}`} className="block">
        <div className="relative h-[600px] w-full overflow-hidden rounded-[2.5rem] bg-stone-100 dark:bg-stone-900 transition-all duration-700 group-hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)]">
          
          {/* Main Visual with Zoom Effect */}
          <div className="absolute inset-0">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_MEDIA)}
              alt={cat.displayName || ""}
              loader={loader}
              fill
              className="object-cover transition-all duration-[2s] group-hover:scale-110 group-hover:rotate-1"
            />
            {/* Overlay Gradient (Adaptive) */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity" />
          </div>

          {/* Interaction Layer */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
             <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                <PlayIcon className="w-10 h-10 text-white" />
             </div>
          </div>

          {/* Content Box */}
          <div className="absolute inset-x-0 bottom-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-6">
               <div className={`px-3 py-1 rounded-md ${theme.bg} text-[9px] font-black uppercase tracking-widest text-white`}>
                 {theme.label}
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">0{index + 1} / CAT</span>
            </div>

            <h3 className="text-5xl font-black text-white mb-6 tracking-tighter leading-[0.8] uppercase italic">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-stone-950 bg-stone-800 overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?u=${cat.id}${i}`} alt="user" />
                    </div>
                  ))}
                  <span className="pl-5 text-[10px] font-bold text-stone-400 self-center">+2.4k active</span>
               </div>
               
               <ArrowRightIcon className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 3. MAIN PAGE --- */

export default function MediaCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-white dark:bg-stone-950 min-h-screen py-32 transition-colors duration-500 selection:bg-red-600 selection:text-white">
      <div className="container mx-auto max-w-7xl px-6">
        
        {/* Header: The Broadcast Lobby */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-10"
            >
              <RadioIcon className="w-6 h-6 text-red-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500 dark:text-stone-400">Live Entertainment Network</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-8xl md:text-[12rem] font-black text-stone-950 dark:text-white leading-[0.7] tracking-tighter uppercase italic"
            >
              Infinite <br />
              <span className="text-transparent font-sans" style={{ WebkitTextStroke: '2px currentColor' }}>Stories.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-[2.5rem] backdrop-blur-xl max-w-sm"
          >
             <div className="flex items-center gap-4 mb-4">
                <FireIcon className="w-6 h-6 text-orange-500" />
                <span className="text-xs font-bold text-stone-900 dark:text-white tracking-widest uppercase">Popular in Nairobi</span>
             </div>
             <p className="text-xs text-stone-500 dark:text-stone-400 font-bold leading-relaxed uppercase tracking-widest">
               From Afro-fusion sets to indie film screenings—explore the pulse of the 254's creative scene.
             </p>
          </motion.div>
        </div>

        {/* The Grid: Cinematic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {categories.map((cat, idx) => (
            <MediaCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Creator Portal CTA */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="lg:col-span-1 bg-red-600 rounded-[3rem] p-12 text-white flex flex-col justify-between group overflow-hidden relative shadow-2xl shadow-red-500/20"
          >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />
              
              <div className="relative z-10">
                <SparklesIcon className="w-12 h-12 text-white mb-8" />
                <h4 className="text-4xl font-black leading-tight mb-4 tracking-tighter uppercase italic">Upload <br /> Your Art.</h4>
                <p className="text-[11px] text-red-100 font-black uppercase tracking-widest leading-loose">Join 5,000+ African creators distributing content directly to their fans. No middleman.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-6 bg-white text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-stone-900 hover:text-white transition-all">
                Launch Creator Studio
              </button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}