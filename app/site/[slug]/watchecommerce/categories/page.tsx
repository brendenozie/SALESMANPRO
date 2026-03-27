"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  ClockIcon, 
  SparklesIcon, 
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME & STYLE HELPERS (Metallic & Luxury) --- */
const FALLBACK_WATCH_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

function resolveWatchStyle(index: number) {
  const themes = [
    { accent: "text-amber-500", bg: "bg-amber-50/10", border: "border-amber-500/20", glow: "shadow-amber-500/10" },
    { accent: "text-slate-300", bg: "bg-slate-50/10", border: "border-slate-500/20", glow: "shadow-slate-500/10" },
    { accent: "text-blue-400", bg: "bg-blue-50/10", border: "border-blue-500/20", glow: "shadow-blue-500/10" },
    { accent: "text-rose-400", bg: "bg-rose-50/10", border: "border-rose-500/20", glow: "shadow-rose-500/10" },
  ];
  const icons = [
    <ClockIcon className="w-6 h-6" key="1" />,
    <SparklesIcon className="w-6 h-6" key="2" />,
    <ShieldCheckIcon className="w-6 h-6" key="3" />,
    <WrenchScrewdriverIcon className="w-6 h-6" key="4" />,
  ];
  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

/* --- 2. ANIMATIONS (Mechanical & Precise) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.19, 1, 0.22, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function WatchCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const { theme } = resolveWatchStyle(index);

  return (
    <motion.div variants={itemVariants} className="group relative h-[550px] overflow-hidden rounded-[1rem]">
      <Link href={`/site/${storeSlug}/watchecommerce/products?category=${cat.id}`} className="block h-full">
        {/* Background Image with Zoom */}
        <Image
          src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_WATCH_IMAGE)}
          alt={cat.displayName || ""}
          fill
          className="object-cover transition-transform duration-[2s] group-hover:scale-110"
            loader={imageLoader}
        />
        
        {/* Dark Radial Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Content */}
        <div className="absolute inset-0 p-10 flex flex-col justify-end">
          <div className="overflow-hidden mb-2">
            <motion.p className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.accent} translate-y-full group-hover:translate-y-0 transition-transform duration-500`}>
              Premium Movement
            </motion.p>
          </div>
          
          <h3 className="text-4xl font-light tracking-tight text-white mb-6 group-hover:tracking-widest transition-all duration-700 uppercase">
            {cat.displayName}
          </h3>

          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
             <div className="h-px flex-1 bg-white/20" />
             <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Explore Series</span>
             <ArrowUpRightIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function WatchSubTile({ sub, index, storeSlug }: { sub: ISubcategory; index: number; storeSlug: string }) {
  const { theme, icon } = resolveWatchStyle(index);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/site/${storeSlug}/watchecommerce/products?subcategory=${sub.id}`} >
        <div className={`group p-8 bg-slate-900 border border-white/5 rounded-2xl hover:border-white/20 transition-all ${theme.glow}`}>
          <div className={`w-12 h-12 rounded-full border ${theme.border} ${theme.accent} flex items-center justify-center mb-6 group-hover:scale-110 transition-all`}>
            {icon}
          </div>
          <h4 className="text-xl font-medium text-white mb-2">{sub.name}</h4>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Master Craftsmanship</p>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function WatchCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  const isNiche = categories.length > 0 && categories.length <= 2;
  const elevatedSubs = useMemo(() => {
    return categories.flatMap(cat => cat.subcategories || []).slice(0, 8);
  }, [categories]);

  if (!storeSlug) return null;

  return (
    <main className="bg-slate-950 min-h-screen py-32 text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Luxury Header */}
        <div className="flex flex-col items-center text-center mb-28">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <ClockIcon className="w-6 h-6 text-amber-500 animate-[spin_10s_linear_infinite]" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-light tracking-tighter mb-8 uppercase"
          >
            The Art of <br />
            <span className="italic font-serif text-amber-500">Precision.</span>
          </motion.h1>
          
          <p className="max-w-xl text-slate-400 font-medium leading-relaxed tracking-wide">
            "Discover the Watch Duka collection—where Kenyan heritage meets world-class horology. Every second is a masterpiece."
          </p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid grid-cols-1 gap-6 ${isNiche ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}
        >
          {isNiche ? (
             elevatedSubs.map((sub, idx) => (
              <WatchSubTile key={sub.id} sub={sub} index={idx} storeSlug={storeSlug} />
            ))
          ) : (
            categories.map((cat, idx) => (
              <WatchCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
            ))
          )}

          {/* Expert Service Card */}
          {!isNiche && (
            <motion.div variants={itemVariants} className="relative group bg-slate-900 border border-white/5 rounded-[1rem] p-12 flex flex-col justify-between overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                <WrenchScrewdriverIcon className="w-10 h-10 text-amber-500 relative z-10" />
                <div className="relative z-10">
                  <h4 className="text-3xl font-light uppercase mb-4">Service & <br /> Restoral</h4>
                  <p className="text-xs text-slate-500 mb-8 leading-relaxed">Our master watchmakers provide full mechanical overhauls and cosmetic restoration.</p>
                  <Link href="/watchecommerce/service" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 hover:text-white transition-colors">
                    Book Service <ArrowUpRightIcon className="w-4 h-4" />
                  </Link>
                </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}