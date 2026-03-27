"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  BeakerIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  ShoppingBagIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Honey & Amber) --- */
const FALLBACK_HONEY = "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80";


const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;


function resolveHoneyStyle(index: number) {
  const themes = [
    { accent: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-700/30", blob: "bg-amber-400" },
    { accent: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-700/30", blob: "bg-orange-400" },
    { accent: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700/30", blob: "bg-yellow-500" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Fluid & Viscous) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function HoneyCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveHoneyStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative">
      <Link href={`/site/${storeSlug}/ecommerce/products?category=${cat.id}`} className="block">
        <div className="relative h-[500px] w-full overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-700 hover:shadow-2xl hover:shadow-amber-500/10">
          
          {/* Image with Liquid Zoom */}
          <div className="h-2/3 w-full relative overflow-hidden">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_HONEY)}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              loader={imageLoader}
            />
            {/* Amber Glass Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent" />
          </div>

          <div className="p-8 text-center -mt-12 relative z-10">
            <div className={`mx-auto w-16 h-1 bg-gradient-to-r ${theme.blob} to-transparent rounded-full mb-6 opacity-0 group-hover:opacity-100 group-hover:w-24 transition-all duration-700`} />
            
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight italic font-serif">
              {cat.displayName}
            </h3>
            
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-400 mb-6">
              {cat.subcategories?.length || 0} Varieties
            </p>

            <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-amber-500 transition-colors">
              <span>View Collection</span>
              <ArrowRightIcon className="w-4 h-4 translate-x-0 group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function HoneyCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fffdfa] dark:bg-slate-950 min-h-screen py-32 transition-colors duration-500 relative overflow-hidden">
      
      {/* Decorative Honeycomb Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='45' viewBox='0 0 52 45' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M26 0l26 15v30L26 45 0 30V15z' fill='%23d97706' fill-rule='evenodd'/%3E%3C/svg%3E")`, backgroundSize: '52px 45px' }} 
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Organic & Elegant */}
        <div className="max-w-3xl mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-12 h-[2px] bg-amber-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-400">Pure Kenyan Nectar</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter"
          >
            Nature's Gold, <br />
            <span className="italic font-serif font-light text-amber-500">Unfiltered.</span>
          </motion.h1>
          
          <p className="mt-8 text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
            "From the wild forests of Baringo to the blossoms of the Rift Valley, discover honey as nature intended."
          </p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {categories.map((cat, idx) => (
            <HoneyCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Unique "Bee-Sustain" Bento Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-amber-500 dark:bg-amber-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="relative z-10">
                <ShieldCheckIcon className="w-12 h-12 mb-6" />
                <h4 className="text-3xl font-black leading-tight mb-4 text-white">Sustainable <br /> Beekeeping</h4>
                <p className="text-sm text-amber-100 font-medium mb-8">Every jar supports local Kenyan beekeepers and protects our vital ecosystems.</p>
              </div>

              <Link href="/impact" className="relative z-10 inline-flex items-center gap-3 bg-white text-amber-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-50 transition-colors">
                Our Impact <ShoppingBagIcon className="w-4 h-4" />
              </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}