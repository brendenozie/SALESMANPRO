"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  FireIcon, 
  ClockIcon, 
  StarIcon,
  MapPinIcon,
  ArrowRightCircleIcon,
  ShoppingBagIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME HELPERS (Culinary Warmth) --- */
const FALLBACK_FOOD = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

function resolveFoodStyle(index: number) {
  const themes = [
    { accent: "text-orange-500", bg: "bg-orange-500", shadow: "shadow-orange-900/20", label: "Sizzling Now" },
    { accent: "text-red-600", bg: "bg-red-600", shadow: "shadow-red-900/20", label: "Chef's Special" },
    { accent: "text-amber-500", bg: "bg-amber-500", shadow: "shadow-amber-900/20", label: "Local Favorite" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Fluid & Appetizing) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function RestaurantCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveFoodStyle(index);

  return (
    <motion.div variants={cardVariants} className="group relative">
      <Link href={`/restaurent/products?category=${cat.id}`} className="block">
        <div className="relative h-[600px] w-full overflow-hidden rounded-[3rem] bg-stone-900 shadow-2xl transition-all duration-700 group-hover:-translate-y-4">
          
          {/* Background Image with Parallax-like feel */}
          <div className="absolute inset-0">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_FOOD)}
              alt={cat.displayName || ""}
              fill
              className="object-cover opacity-70 transition-transform duration-[3s] group-hover:scale-110 group-hover:opacity-100"
              loader={loader}
            />
            {/* Deep Vignette for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent" />
          </div>

          {/* Interactive Badges */}
          <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                <FireIcon className={`w-4 h-4 ${theme.accent}`} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">{theme.label}</span>
             </div>
          </div>

          <div className="absolute top-8 right-8 z-20">
             <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xl group-hover:rotate-12 transition-transform">
                <ShoppingBagIcon className="w-6 h-6 text-stone-900" />
             </div>
          </div>

          {/* Content: The Reveal */}
          <div className="absolute inset-x-0 bottom-0 p-10">
            <div className="flex items-center gap-2 mb-4">
               <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <StarIcon key={s} className="w-3 h-3 text-amber-400" />)}
               </div>
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">(250+ Reviews)</span>
            </div>

            <h3 className="text-5xl font-black text-white mb-6 tracking-tighter leading-none group-hover:italic transition-all">
              {cat.displayName}
            </h3>
            
            <p className="text-stone-300 text-sm font-medium leading-relaxed mb-8 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              Discover authentic flavors crafted by top chefs in the heart of Nairobi. Fresh, local, and unforgettable.
            </p>

            <div className="flex items-center justify-between pt-8 border-t border-white/10">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-stone-500 uppercase">Avg. Prep</span>
                     <span className="text-lg font-bold text-white tracking-tighter">15-25 min</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-stone-500 uppercase">Popularity</span>
                     <span className="text-lg font-bold text-white tracking-tighter">High</span>
                  </div>
               </div>
               
               <ArrowRightCircleIcon className="w-12 h-12 text-white/20 group-hover:text-white transition-all" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function RestaurantCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-stone-950 min-h-screen py-32 overflow-hidden relative selection:bg-orange-500">
      {/* Dynamic Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: High-End Culinary Identity */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12 border-b border-white/5 pb-20">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 mb-10"
            >
              <div className="w-12 h-[1px] bg-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">The Nairobi Dining Scene</span>
            </motion.div>
            
            <motion.h1 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-8xl md:text-[12rem] font-black text-white leading-[0.75] tracking-tighter"
            >
              Taste <br />
              <span className="font-serif italic text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>Freedom.</span>
            </motion.h1>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-end gap-6"
          >
             <div className="flex items-center gap-3 text-white">
                <MapPinIcon className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-bold tracking-widest">NAIROBI, KENYA</span>
             </div>
             <p className="text-stone-500 text-right max-w-[200px] text-xs font-bold leading-relaxed uppercase tracking-widest italic">
               Curated selections from the city's finest kitchens, delivered to your door.
             </p>
          </motion.div>
        </div>

        {/* Dynamic Grid: Bold & Large */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          {categories.map((cat, idx) => (
            <RestaurantCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Join as Chef CTA */}
          <motion.div variants={cardVariants} className="md:col-span-1 lg:col-span-1 bg-orange-600 rounded-[3rem] p-12 text-white flex flex-col justify-between group overflow-hidden relative shadow-2xl">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-black/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <FireIcon className="w-16 h-16 text-white mb-8" />
                <h4 className="text-5xl font-black leading-tight mb-6 tracking-tighter italic">Join the <br /> Kitchen.</h4>
                <p className="text-sm text-orange-100 font-medium leading-relaxed">List your restaurant and reach thousands of hungry foodies across the region.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-6 bg-white text-stone-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl">
                Partner With Us
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}