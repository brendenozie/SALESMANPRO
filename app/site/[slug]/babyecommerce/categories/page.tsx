"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  HeartIcon, 
  StarIcon, 
  FaceSmileIcon, 
  GiftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/solid";

/* --- 1. THEME & STYLE HELPERS (Soft Pastels) --- */
const FALLBACK_BABY_IMAGE = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80";

function resolveBabyStyle(index: number) {
  const themes = [
    { accent: "text-blue-400", bg: "bg-blue-50", border: "hover:border-blue-200", shadow: "shadow-blue-100", label: "Little Gents" },
    { accent: "text-rose-400", bg: "bg-rose-50", border: "hover:border-rose-200", shadow: "shadow-rose-100", label: "Sweet Hearts" },
    { accent: "text-amber-400", bg: "bg-amber-50", border: "hover:border-amber-200", shadow: "shadow-amber-100", label: "Sunshines" },
    { accent: "text-purple-400", bg: "bg-purple-50", border: "hover:border-purple-200", shadow: "shadow-purple-100", label: "Tiny Tots" },
  ];
  const icons = [
    <HeartIcon className="w-6 h-6" key="1" />,
    <StarIcon className="w-6 h-6" key="2" />,
    <FaceSmileIcon className="w-6 h-6" key="3" />,
    <GiftIcon className="w-6 h-6" key="4" />,
  ];
  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

/* --- 2. ANIMATIONS (Bouncy & Gentle) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

const customLoader = ({ src }: { src: string }) => {
  return src;
};

function BabyCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const { theme } = resolveBabyStyle(index);
  const isImageUrl = cat.icon?.startsWith("http") || cat.icon?.startsWith("/");

  return (
    <motion.div variants={itemVariants} className="group h-full">
      <Link href={`/site/${storeSlug}/babyecommerce/products?category=${cat.id}`} className="block h-full">
        <div className={`relative h-[440px] w-full overflow-hidden rounded-[3rem] bg-white border-4 border-white transition-all duration-500 hover:shadow-2xl ${theme.shadow} hover:-rotate-1`}>
          
          {/* Image with Soft Mask */}
          <div className="h-2/3 w-full relative overflow-hidden">
            <Image
              src={isImageUrl ? cat.icon! : FALLBACK_BABY_IMAGE}
              alt={cat.displayName || ""}
              loader={customLoader}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Soft Pastel Overlay */}
            <div className={`absolute inset-0 ${theme.bg} opacity-20 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 w-full p-8 text-center">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${theme.bg} ${theme.accent} mb-4`}>
               <span className="text-[9px] font-black uppercase tracking-widest">{theme.label}</span>
            </div>
            
            <h3 className="text-3xl font-bold text-slate-800 mb-2 tracking-tight group-hover:scale-105 transition-transform">
              {cat.displayName}
            </h3>
            
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {cat.subcategories?.length || 0} Collections
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function BabySubTile({ sub, index, storeSlug }: { sub: ISubcategory; index: number; storeSlug: string }) {
  const { theme, icon } = resolveBabyStyle(index);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/site/${storeSlug}/babyecommerce/products?subcategory=${sub.id}`}>
        <div className={`group flex flex-col items-center gap-4 p-8 rounded-[3rem] bg-white border-2 border-transparent transition-all hover:bg-white ${theme.border} hover:shadow-xl`}>
          <div className={`h-20 w-20 flex items-center justify-center rounded-full ${theme.bg} ${theme.accent} group-hover:bounce transition-all shadow-inner`}>
            {icon}
          </div>
          <div className="text-center">
            <h4 className="font-bold text-slate-800 group-hover:text-slate-900">{sub.name}</h4>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${theme.accent}`}>Shop Now</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function BabyDukaCategoriesPage() {
  const store = useStore();
  const rawCategories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  const categories = useMemo(() => {
    return [...rawCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawCategories]);

  const showSubAsPrimary = categories.length > 0 && categories.length <= 2;

  const elevatedSubs = useMemo(() => {
    if (!showSubAsPrimary) return [];
    return categories.flatMap(cat => cat.subcategories || []).slice(0, 8);
  }, [categories, showSubAsPrimary]);

  if (!storeSlug) return null;

  return (
    <main className="bg-[#fffdfb] min-h-screen py-32 overflow-hidden relative">
      {/* Playful Decorative Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-64 h-64 bg-rose-100 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-blue-100 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        {/* Header: Soft & Bubbly */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <HeartIcon className="w-8 h-8 text-rose-400 animate-pulse" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-slate-800 leading-[1] tracking-tighter"
          >
            Tiny Treasures <br />
            <span className="text-rose-400 italic">Big Love.</span>
          </motion.h1>
          
          <p className="mt-8 text-slate-500 font-medium text-lg italic">
            "Everything your little one needs, from first steps to sweet dreams."
          </p>
        </div>

        {/* Dynamic Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid grid-cols-1 gap-10 ${showSubAsPrimary ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
        >
          {showSubAsPrimary ? (
             elevatedSubs.map((sub, idx) => (
              <BabySubTile key={sub.id} sub={sub} index={idx} storeSlug={storeSlug} />
            ))
          ) : (
            categories.map((cat, idx) => (
              <BabyCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
            ))
          )}

          {/* Special Promo Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1 bg-gradient-to-br from-rose-400 to-orange-300 rounded-[3rem] p-10 text-white flex flex-col justify-between overflow-hidden relative">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full" />
              <StarIcon className="w-12 h-12 mb-4" />
              <div>
                <p className="text-3xl font-black leading-none mb-4">Baby Shower <br /> Gifting</p>
                <Link href="/gifts" className="text-sm font-black uppercase tracking-widest bg-white text-rose-400 px-6 py-3 rounded-full inline-block">Explore Guide</Link>
              </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}