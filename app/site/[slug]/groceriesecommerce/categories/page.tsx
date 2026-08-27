"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  ShoppingBagIcon, 
  SunIcon, 
  SparklesIcon,
  GlobeAltIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Organic Earth Tones) --- */
const FALLBACK_GROCERY = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80";

function resolveGroceryStyle(index: number) {
  const themes = [
    { accent: "text-emerald-600", bg: "bg-emerald-50/50", glow: "shadow-emerald-200/40", label: "Farm Fresh" },
    { accent: "text-orange-500", bg: "bg-orange-50/50", glow: "shadow-orange-200/40", label: "Sunrise Harvest" },
    { accent: "text-amber-600", bg: "bg-amber-50/50", glow: "shadow-amber-200/40", label: "Organic Pantry" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Floating & Natural) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;


function GroceryCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveGroceryStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <Link href={`/groceriesecommerce/products?category=${cat.id}`} className="block">
        <div className="relative h-[550px] w-full overflow-hidden rounded-[3rem] bg-white border border-stone-100 transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)]">
          
          {/* Natural Sun-Flare Overlay */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10" />

          {/* Product Category Visual */}
          <div className="h-2/3 w-full relative overflow-hidden bg-stone-50">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_GROCERY)}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                loader={imageLoader}
            />
            {/* Soft Edge Fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-80" />
          </div>

          {/* Content Card: Floating Glassmorphism */}
          <div className="p-10 -mt-20 relative z-20 mx-4 rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-sm group-hover:bg-white transition-colors duration-500">
            <div className="flex items-center justify-between mb-4">
               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.accent}`}>
                 {theme.label}
               </span>
               <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <ChevronRightIcon className="w-4 h-4 text-stone-400" />
               </div>
            </div>
            
            <h3 className="text-3xl font-bold text-stone-900 mb-2 tracking-tight">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center gap-3">
               <div className="flex -space-x-1">
                  {[1,2].map(i => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center">
                       <SparklesIcon className="w-2 h-2 text-emerald-600" />
                    </div>
                  ))}
               </div>
               <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                 {cat.subcategories?.length || 0} Local Sources
               </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function GroceryCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fdfcfb] min-h-screen py-32 overflow-hidden relative">
      {/* Background Decorative: Soft Garden Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50/50 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-50/40 rounded-full blur-[120px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Earthy & Welcoming */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-28 gap-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <SunIcon className="w-5 h-5 text-orange-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-400">Fresh from the Highlands</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-black text-stone-900 leading-[0.8] tracking-tighter"
            >
              The Daily <br />
              <span className="text-emerald-600 italic font-serif font-light underline decoration-emerald-100 underline-offset-8">Abundance.</span>
            </motion.h1>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-stone-500 font-medium max-w-[280px] border-l-2 border-stone-100 pl-8 leading-relaxed"
          >
            "Hand-picked at dawn, delivered by dusk. Nairobi's cleanest local produce pantry."
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
            <GroceryCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* "Support Local" Community Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-emerald-900 rounded-[3rem] p-12 text-white flex flex-col justify-between group overflow-hidden relative shadow-2xl shadow-emerald-900/20">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <GlobeAltIcon className="w-12 h-12 text-emerald-400 mb-8" />
                <h4 className="text-4xl font-light leading-tight mb-4 tracking-tight uppercase">Support <br /> <span className="text-emerald-400 italic font-serif">Our Farmers</span></h4>
                <p className="text-sm text-emerald-100/60 font-medium leading-relaxed">Direct trade from Limuru to your kitchen. 100% of profits go back to the soil.</p>
              </div>

              <button className="relative z-10 mt-12 w-full py-5 bg-white text-emerald-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all">
                Meet the Growers
              </button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}