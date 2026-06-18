"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  FireIcon, 
  MapIcon, 
  WrenchIcon,
  LifebuoyIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS (Combustion Palette) --- */
const FALLBACK_MOTO = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80";

function resolveMotoStyle(index: number) {
  const themes = [
    { accent: "text-orange-500", bg: "bg-orange-600", border: "border-orange-500/20", label: "Street & Naked" },
    { accent: "text-red-500", bg: "bg-red-600", border: "border-red-500/20", label: "Superbike & Track" },
    { accent: "text-amber-500", bg: "bg-amber-600", border: "border-amber-500/20", label: "Adventure & Tourer" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Industrial & Heavy) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;


function MotoCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveMotoStyle(index);

  return (
    <motion.div variants={cardVariants} className="group relative">
      <Link href={`/motorcycleecommerce/products?category=${cat.id}`} className="block">
        <div className={`relative h-[500px] w-full overflow-hidden bg-zinc-900 rounded-3xl border ${theme.border} transition-all duration-500 hover:shadow-[0_0_50px_rgba(249,115,22,0.1)]`}>
          
          {/* Background Heat Haze Effect (CSS Mesh Gradient) */}
          <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_50%,_rgba(249,115,22,0.15),_transparent_70%)]" />

          {/* Hero Image: Cinematic Low Angle */}
          <div className="h-full w-full relative overflow-hidden">
            <Image
              src={cat.icon?.startsWith('http') ? cat.icon : FALLBACK_MOTO}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-[3s] group-hover:scale-110 group-hover:rotate-1"
              loader={imageLoader}
            />
            {/* Hard Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
          </div>

          {/* Floating Content: Industrial Labels */}
          <div className="absolute bottom-0 left-0 w-full p-10 z-20">
            <div className="flex items-center gap-3 mb-4">
               <div className={`h-4 w-1 ${theme.bg}`} />
               <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.accent}`}>
                 {theme.label}
               </span>
            </div>
            
            <h3 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-8">
               <div className="flex gap-10">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Engine Class</span>
                     <span className="text-lg font-bold text-white italic">250cc — 1200cc</span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">In Stock</span>
                     <span className="text-lg font-bold text-white italic">{cat.subcategories?.length || 0}+ Units</span>
                  </div>
               </div>
               
               <div className="w-16 h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center transform group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
                  <ArrowUpRightIcon className="w-6 h-6" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function MotoCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-zinc-950 min-h-screen py-32 overflow-hidden relative selection:bg-orange-500 selection:text-white">
      
      {/* Background Decals: Mechanical Blueprints */}
      <div className="absolute top-20 right-[-100px] text-[20rem] font-black text-white/[0.02] leading-none select-none pointer-events-none italic uppercase">
        Torque
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Aggressive & Kinetic */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4 mb-8"
            >
              <FireIcon className="w-6 h-6 text-orange-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-500">Official Nairobi Dealership</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-8xl md:text-[11rem] font-black text-white leading-[0.7] tracking-tighter uppercase italic"
            >
              Fuel Your <br />
              <span className="text-transparent" style={{ WebkitTextStroke: '2px #f97316' }}>Freedom.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 bg-zinc-900 border-l-4 border-orange-500 max-w-sm hidden lg:block"
          >
             <p className="text-sm text-zinc-400 font-bold leading-relaxed uppercase italic">
               "From the mud of the Rift Valley to the tarmac of Mombasa Road, we provide the machine for your journey."
             </p>
          </motion.div>
        </div>

        {/* Dynamic Grid: 2-Column Power Layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-10"
        >
          {categories.map((cat, idx) => (
            <MotoCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* "Rider Safety" Specialized Card */}
          <motion.div variants={cardVariants} className="lg:col-span-2 bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-16 text-white flex flex-col md:flex-row justify-between items-center group overflow-hidden relative border border-orange-400/20">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              
              <div className="relative z-10 max-w-xl">
                <LifebuoyIcon className="w-12 h-12 mb-8 text-zinc-900" />
                <h4 className="text-5xl font-black leading-none mb-6 uppercase italic">Pro-Shield <br /> Gear Lab</h4>
                <p className="text-lg font-bold text-zinc-900/80 leading-relaxed uppercase italic">Every bike comes with a complimentary safety diagnostic and rider orientation session.</p>
              </div>

              <div className="relative z-10 mt-12 md:mt-0">
                 <button className="px-12 py-6 bg-zinc-950 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:text-zinc-950 transition-all shadow-2xl">
                   Explore Protection
                 </button>
              </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}