"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  BookOpenIcon, 
  HashtagIcon, 
  CursorArrowRaysIcon,
  NewspaperIcon,
  ArrowLongRightIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME HELPERS (Modern Print Palette) --- */
const FALLBACK_BLOG = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80";

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

function resolveBlogStyle(index: number) {
  const themes = [
    { accent: "text-amber-500", bg: "bg-amber-500", decoration: "underline decoration-amber-200", label: "Deep Dives" },
    { accent: "text-indigo-500", bg: "bg-indigo-500", decoration: "underline decoration-indigo-200", label: "Quick Reads" },
    { accent: "text-emerald-500", bg: "bg-emerald-500", decoration: "underline decoration-emerald-200", label: "The Archives" },
  ];
  return themes[index % themes.length];
}

/* --- 2. ANIMATIONS (Literary & Fluid) --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1] } 
  },
};

/* --- 3. SUBCOMPONENTS --- */

function BlogCategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const theme = resolveBlogStyle(index);
  const isLarge = index % 3 === 0; // Asymmetric rhythm

  return (
    <motion.div 
      variants={cardVariants} 
      className={`group relative ${isLarge ? 'md:col-span-2' : 'md:col-span-1'}`}
    >
      <Link href={`/blog/products?category=${cat.id}`} className="block h-full">
        <div className="relative h-[500px] w-full overflow-hidden bg-white group-hover:bg-stone-50 transition-colors duration-500 flex flex-col">
          
          {/* Magazine Cover Visual */}
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={cat.image || (cat.icon?.startsWith('http') ? cat.icon : FALLBACK_BLOG)}
              alt={cat.displayName || ""}
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              loader={loader}
            />
            {/* Minimalist Overlay */}
            <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500" />
          </div>

          {/* Content: Editorial Clarity */}
          <div className="p-10 border-x border-b border-stone-100">
            <div className="flex items-center justify-between mb-6">
               <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.accent}`}>
                 {theme.label}
               </span>
               <span className="text-[10px] font-medium text-stone-400 font-mono">
                 0{index + 1} / CATEGORY
               </span>
            </div>
            
            <h3 className={`text-4xl font-light text-stone-900 mb-6 tracking-tight leading-none group-hover:italic transition-all duration-300 ${theme.decoration} decoration-4 underline-offset-8`}>
              {cat.displayName}
            </h3>
            
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Articles</span>
                     <span className="text-xl font-serif italic text-stone-900">{cat.subcategories?.length || 12}+</span>
                  </div>
                  <div className="w-px h-8 bg-stone-200" />
                  <div className="flex flex-col">
                     <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Est. Reading</span>
                     <span className="text-xl font-serif italic text-stone-900">85 min</span>
                  </div>
               </div>
               
               <ArrowLongRightIcon className="w-8 h-8 text-stone-300 group-hover:text-stone-900 group-hover:translate-x-4 transition-all duration-500" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function BlogCategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="bg-white min-h-screen py-32 overflow-hidden relative">
      {/* Background Grid Pattern: Subtle Paper Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        
        {/* Header: Serif Elegance */}
        <div className="flex flex-col border-b border-stone-900 pb-20 mb-24">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 mb-10"
          >
            <span className="px-3 py-1 bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest">Volume 01</span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">The Digital Thought-Leader</span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-8xl md:text-[13rem] font-light text-stone-900 leading-[0.75] tracking-tighter"
          >
            Curated <br />
            <span className="font-serif italic text-stone-400">Knowledge.</span>
          </motion.h1>
          
          <div className="mt-16 flex flex-col md:flex-row justify-between md:items-end gap-10">
             <p className="text-xl text-stone-500 max-w-lg font-medium leading-relaxed">
               "Exploring the intersection of technology, culture, and entrepreneurship in Nairobi's evolving digital landscape."
             </p>
             <div className="flex gap-4">
                <button className="px-8 py-4 bg-stone-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-colors">
                   Subscribe
                </button>
                <div className="w-14 h-14 rounded-full border border-stone-200 flex items-center justify-center">
                   <HashtagIcon className="w-5 h-5 text-stone-400" />
                </div>
             </div>
          </div>
        </div>

        {/* Dynamic Grid: Asymmetric Flow */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-y-20 gap-x-12"
        >
          {categories.map((cat, idx) => (
            <BlogCategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}

          {/* Newsletter / Contribution Card */}
          <motion.div variants={cardVariants} className="md:col-span-1 bg-stone-100 p-12 flex flex-col justify-between group relative overflow-hidden">
              <div className="relative z-10">
                <NewspaperIcon className="w-12 h-12 text-stone-900 mb-8" />
                <h4 className="text-4xl font-serif italic mb-6">Write for <br /> the Duka.</h4>
                <p className="text-sm text-stone-500 font-medium leading-relaxed">Join our circle of contributors and share your insights with a global audience.</p>
              </div>

              <div className="relative z-10 pt-10">
                 <button className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-stone-900 hover:gap-6 transition-all">
                    Submit Pitch <ArrowLongRightIcon className="w-6 h-6" />
                 </button>
              </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}