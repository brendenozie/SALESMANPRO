"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  SparklesIcon, 
  HeartIcon, 
  SunIcon,
  ShoppingBagIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Botanical Palette) --- */
const FALLBACK_FLOWERS = "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80";


const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;


function resolveFloralStyle(index: number) {
  const themes = [
    { accent: "text-rose-500", bg: "bg-rose-50/50", glow: "shadow-rose-200/40", label: "Romance & Roses" },
    { accent: "text-emerald-600", bg: "bg-emerald-50/50", glow: "shadow-emerald-200/40", label: "Greenery & Foliage" },
    { accent: "text-amber-500", bg: "bg-amber-50/50", glow: "shadow-amber-200/40", label: "Sun-Kissed Blooms" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Breathing & Organic) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: "blur(0px)",
    transition: { duration: 1, ease: [0.19, 1, 0.22, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function FlowerCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveFloralStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <Link href={`/site/${storeSlug}/flowersecommerce/products?category=${cat.id}`} className="block">
        <div className="relative h-[600px] w-full overflow-hidden rounded-[4rem] bg-white border border-rose-50 transition-all duration-1000 group-hover:shadow-[0_40px_80px_-20px_rgba(251,113,133,0.15)] group-hover:-translate-y-4">
          
          {/* Subtle Grainy Paper Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-20 mix-blend-multiply" 
               style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")` }} />

          {/* Floral Visual */}
          <div className="h-full w-full relative overflow-hidden">
            <Image
              src={cat.icon?.startsWith('http') ? cat.icon : FALLBACK_FLOWERS}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-[3s] group-hover:scale-110"
              loader={imageLoader}
            />
            
            {/* Soft Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          </div>

          {/* Floating Content Label */}
          <div className="absolute bottom-10 left-10 right-10 p-10 rounded-[3rem] bg-white/60 backdrop-blur-2xl border border-white/50 text-center transform transition-transform duration-700 group-hover:translate-y-[-10px]">
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.accent} mb-4 block`}>
              {theme.label}
            </span>
            
            <h3 className="text-4xl font-light text-slate-900 mb-6 tracking-tight italic font-serif">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center justify-center gap-4 text-slate-400">
               <div className="h-px w-8 bg-slate-200" />
               <span className="text-[10px] font-bold uppercase tracking-widest italic">{cat.subcategories?.length || 0} Varieties</span>
               <div className="h-px w-8 bg-slate-200" />
            </div>

            <div className="mt-8 flex justify-center">
               <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:w-full group-hover:rounded-2xl transition-all duration-700 overflow-hidden">
                  <span className="hidden group-hover:block text-[10px] font-black uppercase tracking-widest mr-2">Browse Garden</span>
                  <ArrowRightIcon className="w-4 h-4" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function FlowersCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fffcfc] min-h-screen py-32 overflow-hidden relative">
      {/* Soft Ethereal Background Blobs */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-rose-100/30 rounded-full blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-50/40 rounded-full blur-[120px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Poetic & Graceful */}
        <div className="text-center mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="h-px w-12 bg-rose-300" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-rose-400">Nairobi’s Artisan Florist</span>
            <div className="h-px w-12 bg-rose-300" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-9xl font-light text-slate-900 leading-[0.85] tracking-tighter"
          >
            Curating <br />
            <span className="italic font-serif font-light text-rose-500 underline decoration-rose-100 underline-offset-[12px]">Emotions.</span>
          </motion.h1>
          
          <p className="mt-12 text-slate-500 font-medium italic text-lg max-w-xl mx-auto">
            "Every stem is hand-picked at dawn. We don't just deliver flowers; we deliver the moments that matter."
          </p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
        >
          {categories.map((cat, idx) => (
            <div key={cat.id} className={idx % 2 !== 0 ? "lg:mt-32" : ""}>
               <FlowerCategoryCard cat={cat} index={idx} storeSlug={storeSlug} />
            </div>
          ))}

          {/* "Same Day Delivery" Specialty Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-emerald-900 rounded-[4rem] p-16 text-white flex flex-col justify-between group overflow-hidden relative shadow-2xl shadow-emerald-900/20">
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-[2s]" />
              
              <div className="relative z-10">
                <SunIcon className="w-12 h-12 text-emerald-400 mb-10" />
                <h4 className="text-5xl font-light leading-[0.9] mb-6 uppercase tracking-tight">Express <br /> <span className="italic font-serif text-emerald-400 lowercase">Freshness.</span></h4>
                <p className="text-sm text-emerald-100/60 font-medium leading-relaxed max-w-xs">Ordered by 10 AM, delivered by sunset. Guaranteed fresh from the Rift Valley farms.</p>
              </div>

              <div className="mt-16 flex items-center gap-6">
                 <Link href="/flowersecommerce/delivery" className="relative z-10 inline-flex items-center gap-4 bg-white text-emerald-900 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all">
                   Track Bouquet <ShoppingBagIcon className="w-4 h-4" />
                 </Link>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-emerald-400">Available in</span>
                    <span className="text-xs font-bold">Nairobi & Kiambu</span>
                 </div>
              </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}