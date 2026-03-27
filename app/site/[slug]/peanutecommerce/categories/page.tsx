"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  SparklesIcon, 
  FireIcon, 
  HandRaisedIcon,
  ShoppingBagIcon,
  ArrowLongRightIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME & STYLE HELPERS (Toasted Palette) --- */
const FALLBACK_PEANUT_IMAGE = "https://images.unsplash.com/photo-1567333160914-1b0aee708baf?auto=format&fit=crop&w=800&q=80";

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

function resolvePeanutStyle(index: number) {
  const themes = [
    { accent: "text-amber-800", bg: "bg-amber-50", border: "hover:border-amber-200", shadow: "shadow-amber-900/5", label: "Slow Roasted" },
    { accent: "text-orange-900", bg: "bg-orange-50", border: "hover:border-orange-200", shadow: "shadow-orange-900/5", label: "Spiced & Bold" },
    { accent: "text-stone-800", bg: "bg-stone-50", border: "hover:border-stone-200", shadow: "shadow-stone-900/5", label: "Pure & Raw" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Crunchy & Bold) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function PeanutCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolvePeanutStyle(index);
  const isImageUrl = cat.image || cat.icon?.startsWith("http") || cat.icon?.startsWith("/");

  return (
    <motion.div variants={itemVariants} className="group">
      <Link href={`/site/${storeSlug}/ecommerce/products?category=${cat.id}`} className="block">
        <div className={`relative h-[520px] rounded-[3rem] bg-white overflow-hidden transition-all duration-500 border border-stone-100 hover:shadow-2xl ${theme.shadow} hover:-translate-y-2`}>
          
          {/* Texture Overlay (Burlap/Grain) */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-20" 
               style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")` }} />

          {/* Image Section */}
          <div className="h-1/2 w-full relative overflow-hidden p-6 pb-0">
            <div className="relative h-full w-full rounded-[2rem] overflow-hidden">
                <Image
                src={isImageUrl ? cat.image || cat.icon! : FALLBACK_PEANUT_IMAGE}
                alt={cat.displayName || ""}
                fill
                loader={imageLoader}
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>
          </div>

          <div className="p-10 flex flex-col items-center text-center">
            <span className={`inline-block px-4 py-1 rounded-full ${theme.bg} ${theme.accent} text-[9px] font-black uppercase tracking-[0.2em] mb-4`}>
              {theme.label}
            </span>
            
            <h3 className="text-4xl font-black text-stone-900 mb-3 tracking-tight">
              {cat.displayName}
            </h3>
            
            <p className="text-sm text-stone-500 font-medium leading-relaxed max-w-[200px] mb-6">
              Hand-selected Kenyan nuts, prepared in small batches.
            </p>

            <div className={`w-12 h-12 rounded-full ${theme.bg} ${theme.accent} flex items-center justify-center group-hover:w-full group-hover:rounded-2xl transition-all duration-500 overflow-hidden`}>
               <span className="hidden group-hover:block text-xs font-black uppercase tracking-widest mr-2">Shop Category</span>
               <ArrowLongRightIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function PeanutsCategoriesPage() {
  const store = useStore();
  const rawCategories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  const categories = useMemo(() => {
    return [...rawCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawCategories]);

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fcfaf7] min-h-screen py-32 overflow-hidden relative">
      {/* Earthy Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-200/40 rounded-full blur-[100px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Earthy & Authentic */}
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-stone-900 text-white p-4 rounded-2xl rotate-3 shadow-xl"
          >
            <FireIcon className="w-6 h-6" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-stone-900 leading-[0.9] tracking-tighter mb-8"
          >
            The Crunch <br />
            <span className="italic font-serif font-light text-amber-800">Of Baringo.</span>
          </motion.h1>
          
          <p className="max-w-xl text-stone-500 font-bold text-lg leading-relaxed">
            "Freshly roasted in Nairobi. No additives, no shortcuts—just the honest taste of Kenyan soil."
          </p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((cat, idx) => (
            <PeanutCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* "Batch Quality" Bento Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-stone-900 rounded-[3rem] p-12 text-white flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <HandRaisedIcon className="w-48 h-48" />
              </div>
              
              <div>
                <SparklesIcon className="w-10 h-10 text-amber-500 mb-6" />
                <h4 className="text-3xl font-black leading-tight mb-4">Farm-to-Jar <br /> Transparency</h4>
                <p className="text-sm text-stone-400 font-medium">We track every batch back to the individual farm. Supporting Kenyan growers, one crunch at a time.</p>
              </div>

              <Link href="/farms" className="inline-flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.3em] text-amber-500 hover:text-white transition-colors mt-12">
                Learn About Our Farms <ArrowLongRightIcon className="w-5 h-5" />
              </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}