"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  SparklesIcon, 
  CakeIcon, 
  GiftTopIcon, 
  HeartIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME & STYLE HELPERS (Delicious Palette) --- */
const FALLBACK_CAKE_IMAGE = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80";

function resolveCakeStyle(index: number) {
  const themes = [
    { accent: "text-rose-600", bg: "bg-rose-50", border: "hover:border-rose-200", gradient: "from-rose-500 to-pink-600" },
    { accent: "text-amber-700", bg: "bg-amber-50", border: "hover:border-amber-200", gradient: "from-amber-600 to-yellow-700" },
    { accent: "text-purple-600", bg: "bg-purple-50", border: "hover:border-purple-200", gradient: "from-purple-500 to-indigo-600" },
    { accent: "text-emerald-700", bg: "bg-emerald-50", border: "hover:border-emerald-200", gradient: "from-emerald-600 to-teal-700" },
  ];
  const icons = [
    <CakeIcon className="w-6 h-6" key="1" />,
    <SparklesIcon className="w-6 h-6" key="2" />,
    <GiftTopIcon className="w-6 h-6" key="3" />,
    <HeartIcon className="w-6 h-6" key="4" />,
  ];
  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

/* --- 2. ANIMATIONS (Smooth & Elegant) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
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

function CakeCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const { theme } = resolveCakeStyle(index);
  const isImageUrl = cat.image || cat.icon?.startsWith("http") || cat.icon?.startsWith("/");

  return (
    <motion.div variants={itemVariants} className="group h-full">
      <Link href={`/site/${storeSlug}/ecommerce/products?category=${cat.id}`} className="block h-full">
        <div className="relative h-[480px] w-full overflow-hidden rounded-[2.5rem] bg-white shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-3">
          
          {/* Zooming Image Layer */}
          <div className="h-full w-full relative overflow-hidden">
            <Image
              src={isImageUrl ? cat.image || cat.icon || FALLBACK_CAKE_IMAGE : FALLBACK_CAKE_IMAGE}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              loader={imageLoader}
            />
            {/* Elegant Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          </div>

          {/* Text Content Overlay */}
          <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
            <motion.span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mb-2">
              Freshly Baked
            </motion.span>
            <h3 className="text-4xl font-serif italic mb-4 group-hover:tracking-wide transition-all duration-500">
              {cat.displayName}
            </h3>
            
            <div className="flex items-center justify-between overflow-hidden">
               <div className="h-px w-0 group-hover:w-12 bg-white/50 transition-all duration-500" />
               <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                  <ArrowRightIcon className="w-5 h-5" />
               </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CakeSubTile({ sub, index, storeSlug }: { sub: ISubcategory; index: number; storeSlug: string }) {
  const { theme, icon } = resolveCakeStyle(index);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/site/${storeSlug}/ecommerce/products?subcategory=${sub.id}`}>
        <div className={`group relative p-8 rounded-[2rem] bg-white border border-slate-100 overflow-hidden transition-all hover:shadow-xl`}>
          {/* Subtle Background Pattern */}
          <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
            {icon}
          </div>
          
          <div className={`w-12 h-12 rounded-xl ${theme.bg} ${theme.accent} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          
          <h4 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-amber-700 transition-colors">{sub.name}</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exquisite Taste</p>
          
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
            <span>Browse Selection</span>
            <ArrowRightIcon className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function CakeDukaCategoriesPage() {
  const store = useStore();
  const rawCategories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  const categories = useMemo(() => {
    return [...rawCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawCategories]);

  // Logic: Pivot to subcategories if the store specializes in just one or two main cake types
  const showSubAsPrimary = categories.length > 0 && categories.length <= 2;

  const elevatedSubs = useMemo(() => {
    if (!showSubAsPrimary) return [];
    return categories.flatMap(cat => cat.subcategories || []).slice(0, 8);
  }, [categories, showSubAsPrimary]);

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fffcf9] min-h-screen py-32 overflow-hidden relative">
      {/* Soft Gold Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-50 rounded-full blur-[100px] -z-10" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        {/* Header: Luxury Patisserie Style */}
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 flex items-center gap-4"
          >
            <div className="h-px w-8 bg-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-600">Established 2026</span>
            <div className="h-px w-8 bg-amber-400" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif italic text-slate-900 leading-[0.9] tracking-tighter"
          >
            A Slice of <br />
            <span className="font-sans font-black text-amber-700 not-italic">Heaven.</span>
          </motion.h1>
          
          <p className="mt-10 text-slate-500 font-medium max-w-lg leading-relaxed italic">
            "Artisanal creations crafted in Nairobi, designed to turn every celebration into a masterpiece."
          </p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid grid-cols-1 gap-8 ${showSubAsPrimary ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
        >
          {showSubAsPrimary ? (
             elevatedSubs.map((sub, idx) => (
              <CakeSubTile key={sub.id} sub={sub} index={idx} storeSlug={storeSlug} />
            ))
          ) : (
            categories.map((cat, idx) => (
              <CakeCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
            ))
          )}

          {/* The "Custom Order" Bento Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between group cursor-pointer overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <CakeIcon className="w-12 h-12 text-amber-400 relative z-10" />
              <div className="relative z-10">
                <p className="text-3xl font-serif italic mb-4">Custom Cake <br /> Design</p>
                <p className="text-xs text-slate-400 mb-6 font-medium">Have a specific vision? Our master bakers will bring it to life.</p>
                <Link href="/custom" className="inline-flex items-center gap-2 font-bold text-amber-400 group-hover:text-white transition-colors">
                  Inquire Now <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}