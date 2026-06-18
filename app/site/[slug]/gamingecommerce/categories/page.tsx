"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  CpuChipIcon, 
  RocketLaunchIcon, 
  VariableIcon,
  BoltIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (RGB & Performance) --- */
const FALLBACK_GAMING = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80";

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

function resolveGamingStyle(index: number) {
  const themes = [
    { accent: "text-cyan-400", glow: "shadow-cyan-500/20", border: "group-hover:border-cyan-500/50", label: "Pro Series" },
    { accent: "text-fuchsia-500", glow: "shadow-fuchsia-500/20", border: "group-hover:border-fuchsia-500/50", label: "Extreme Performance" },
    { accent: "text-lime-400", glow: "shadow-lime-500/20", border: "group-hover:border-lime-500/50", label: "Next-Gen Gear" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (144Hz Smoothness) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 120, damping: 20 } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function GamingCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveGamingStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <Link href={`/ecommerce/products?category=${cat.id}`} className="block">
        <div className={`relative h-[500px] w-full overflow-hidden rounded-[1.5rem] bg-slate-900 border border-white/5 transition-all duration-500 ${theme.border} ${theme.glow} hover:bg-slate-800/50`}>
          
          {/* Scanline Effect Overlay */}
          <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03]" 
               style={{ backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))`, backgroundSize: '100% 2px, 3px 100%' }} />

          {/* Asset Image */}
          <div className="h-[60%] w-full relative overflow-hidden">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_GAMING)}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              loader={imageLoader}
            />
            {/* Dark Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          </div>

          {/* Content Area */}
          <div className="p-8 relative z-10">
            <div className="flex items-center gap-2 mb-4">
               <div className={`w-2 h-2 rounded-full animate-pulse ${theme.accent.replace('text', 'bg')}`} />
               <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.accent}`}>
                 {theme.label}
               </span>
            </div>
            
            <h3 className="text-3xl font-black text-white mb-2 tracking-tight uppercase group-hover:translate-x-2 transition-transform duration-300">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center justify-between mt-6">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                       <VariableIcon className="w-3 h-3 text-slate-500" />
                    </div>
                  ))}
                  <span className="pl-4 text-[10px] text-slate-500 font-bold self-center uppercase tracking-widest">
                    {cat.subcategories?.length || 0} Tier Units
                  </span>
               </div>
               <div className={`p-3 rounded-xl bg-white/5 text-white group-hover:bg-white group-hover:text-slate-900 transition-all`}>
                  <ChevronRightIcon className="w-4 h-4" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function GamingCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-slate-950 min-h-screen py-32 text-white overflow-hidden relative">
      {/* Background HUD Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 border border-white/5 rounded-full opacity-20 animate-spin-slow pointer-events-none" />
      <div className="absolute bottom-40 right-10 w-96 h-96 border-l border-t border-fuchsia-500/10 rounded-tl-[100px] pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Aggressive & Kinetic */}
        <div className="mb-24">
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className="w-20 h-1 bg-cyan-500 mb-8 origin-left"
          />
          
          <motion.h1 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-7xl md:text-9xl font-black text-white leading-[0.8] tracking-tighter uppercase italic"
          >
            Level <br />
            <span className="text-transparent stroke-text" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>Up Your</span> <br />
            <span className="text-cyan-400">Arsenel.</span>
          </motion.h1>
          
          <p className="mt-12 text-slate-400 font-bold text-sm uppercase tracking-[0.3em] max-w-md">
            "High-latency is for the weak. Gear up with Kenya's most advanced competitive gaming hardware."
          </p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((cat, idx) => (
            <GamingCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* "Build Your Rig" Special Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-[1.5rem] p-10 flex flex-col justify-between group overflow-hidden relative shadow-2xl shadow-indigo-500/20">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <CpuChipIcon className="w-12 h-12 text-white mb-8" />
                <h4 className="text-4xl font-black leading-[0.9] mb-4 uppercase">PC Master <br /> Builder</h4>
                <p className="text-sm text-indigo-100 font-medium">Custom liquid-cooled configurations built by local pros.</p>
              </div>

              <Link href="/custom-rigs" className="relative z-10 inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                Enter Laboratory <RocketLaunchIcon className="w-4 h-4" />
              </Link>
          </motion.div>
        </motion.div>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .stroke-text {
          paint-order: stroke fill;
        }
      `}</style>
    </main>
  );
}