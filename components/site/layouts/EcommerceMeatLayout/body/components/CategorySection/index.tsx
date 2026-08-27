'use client';

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowRightIcon,
  FireIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  BeakerIcon,
  CheckBadgeIcon,
  CubeTransparentIcon
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Constants & Shared Logic */
/* -------------------------------------------------------------------------- */
const FALLBACK_MEAT_URL = "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=800&q=80";

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

function resolveTheme(index: number) {
  const themes = [
    { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", glow: "shadow-red-900/20", icon: <FireIcon className="w-5 h-5" /> },
    { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-900/20", icon: <SparklesIcon className="w-5 h-5" /> },
    { text: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", glow: "shadow-blue-900/20", icon: <BeakerIcon className="w-5 h-5" /> },
  ];
  return themes[index % themes.length];
}

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function SubcategoryTile({ sub, index }: { sub: ISubcategory; index: number }) {
  const theme = resolveTheme(index + 1);

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -8, scale: 1.02 }} className="group">
      <Link href={`/meatecommerce/products?subcategory=${sub.id || sub.name}`}>
        <div className={`relative flex flex-col justify-between p-8 h-72 rounded-[2.5rem] bg-stone-50 dark:bg-stone-900/40 backdrop-blur-xl border border-stone-200 dark:${theme.border} transition-all duration-500 group-hover:bg-white dark:group-hover:bg-stone-800/60 group-hover:shadow-2xl group-hover:shadow-stone-200 dark:group-hover:${theme.glow}`}>
          <div className="flex justify-between items-start">
            <div className={`p-4 rounded-2xl ${theme.bg} ${theme.text}`}>
              {theme.icon}
            </div>
            <div className="w-10 h-10 rounded-full border border-stone-200 dark:border-white/10 flex items-center justify-center bg-white dark:bg-stone-950/50">
              <CheckBadgeIcon className="w-5 h-5 text-stone-300 dark:text-white/20 group-hover:text-red-500 transition-colors" />
            </div>
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${theme.text}`}>Signature Cut</p>
            <h4 className="text-2xl font-black text-stone-900 dark:text-white leading-tight group-hover:text-red-500 transition-colors">{sub.name}</h4>
          </div>
          <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <ArrowRightIcon className={`w-6 h-6 ${theme.text}`} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoryHeroCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const theme = resolveTheme(index);
  const subCount = cat.subcategories?.filter((s) => s.visible).length || 0;

  return (
    <motion.div variants={itemVariants} className="lg:col-span-2 group h-full">
      <Link href={`/meatecommerce/products?category=${cat.id || index}`} className="block h-full">
        <div className={`relative h-[550px] w-full overflow-hidden rounded-[3.5rem] bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-white/5 transition-all duration-700 group-hover:border-red-600/30 group-hover:shadow-2xl`}>
          <Image
            src={FALLBACK_MEAT_URL}
            alt={cat.displayName || ""}
            fill
            loader={customLoader}
            className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 dark:opacity-60 group-hover:opacity-100 dark:group-hover:opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 dark:from-stone-950 via-transparent to-transparent" />
          
          <div className="absolute bottom-0 w-full p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className={`h-2.5 w-2.5 rounded-full ${theme.text.replace('text', 'bg')} animate-pulse`} />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/90 dark:text-white/60">
                {subCount} Artisan Selections
              </span>
            </div>
            <h3 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-[0.85]">
              {cat.displayName}
            </h3>
            <div className="flex items-center justify-between pt-8 border-t border-white/20">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60 group-hover:text-red-500 transition-colors">Explore Category</span>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-white group-hover:bg-red-600 group-hover:scale-110 transition-all">
                <ArrowRightIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function UnifiedMeatHub({ store }: { store: StoreForm | null }) {
  const categories = useMemo(() => {
    return (store?.StoreCategory ?? []).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  const displaySubs = useMemo(() => {
    return categories.flatMap(c => c.subcategories?.filter(s => s.visible) || []).slice(0, 8);
  }, [categories]);

  return (
    <section className="relative bg-white dark:bg-[#080808] py-32 overflow-hidden transition-colors duration-700">
      {/* Background Ambient Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 dark:bg-red-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-200/50 dark:bg-stone-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-8">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-12">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-red-600" />
              <span className="text-red-600 dark:text-red-500 text-[11px] font-black uppercase tracking-[0.5em]">The Master Counter</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }}
              className="text-7xl md:text-9xl font-black text-stone-900 dark:text-white leading-[0.8] tracking-tighter"
            >
              Cuts of <br /> <span className="italic font-serif font-light text-red-600">Distinction.</span>
            </motion.h2>
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="lg:text-right">
             <p className="text-xl text-stone-500 dark:text-stone-400 font-medium max-w-xs mb-8">
              Precision butchery meets ethical sourcing for Nairobi's most discerning palates.
             </p>
             <Link href="/meatecommerce/products" className="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] text-stone-900 dark:text-white hover:text-red-600 transition-colors group">
               View Full Inventory <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
             </Link>
          </motion.div>
        </div>

        {/* BENTO GRID */}
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {categories[0] && <CategoryHeroCard cat={categories[0]} index={0} />}

          {/* Wholesale Card */}
          <motion.div variants={itemVariants} className="relative p-12 rounded-[3.5rem] bg-stone-900 text-white overflow-hidden flex flex-col justify-between group lg:col-span-2 shadow-2xl shadow-stone-950/20">
            <div className="absolute -top-12 -right-12 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheckIcon className="w-80 h-80 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-red-900/40">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-5xl font-black leading-[0.9] tracking-tighter mb-6">Commercial <br/> <span className="text-red-500">Solutions</span></h3>
              <p className="text-stone-300 text-lg font-medium max-w-sm">Bespoke bulk supply for Nairobi's leading steakhouses and hospitality groups.</p>
            </div>
            <Link href="/meatecommerce/products" className="relative z-10 flex items-center gap-4 font-black uppercase text-[10px] tracking-[0.3em] text-white group-hover:text-red-500 transition-colors">
              Get Wholesale Access <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </motion.div>

          {/* Discovery Grid */}
          <div className="lg:col-span-4 mt-8">
            <div className="flex items-center justify-between mb-12">
               <h3 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">Prime Selection</h3>
               <div className="flex gap-1.5">
                  <div className="w-8 h-1 bg-red-600 rounded-full" />
                  <div className="w-2 h-1 bg-stone-200 dark:bg-stone-800 rounded-full" />
               </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {displaySubs.length > 0 ? (
                displaySubs.map((sub, idx) => (
                  <SubcategoryTile key={sub.id || idx} sub={sub} index={idx} />
                ))
              ) : (
                <div className="col-span-full py-24 text-center border-2 border-dashed border-stone-200 dark:border-white/5 rounded-[3.5rem]">
                  <CubeTransparentIcon className="w-16 h-16 text-stone-300 dark:text-stone-800 mx-auto mb-6 animate-pulse" />
                  <p className="text-stone-400 dark:text-stone-600 font-black uppercase tracking-[0.4em] text-xs">Waiting for today's arrival</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}