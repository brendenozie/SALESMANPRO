'use client';

import React, { useMemo, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowUpRightIcon,
  SparklesIcon,
  Squares2X2Icon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop";

const customLoader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  },
};

/* -------------------------------------------------------------------------- */
/* Sub-Components */
/* -------------------------------------------------------------------------- */

function SubcategoryPill({ sub, index }: { sub: ISubcategory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/earphonesecommerce/products?subcategory=${sub.slug || sub.name}`}>
        <div className="group relative bg-white/5 border border-white/10 p-6 rounded-3xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 overflow-hidden">
          <div className="relative flex items-center justify-between z-10">
            <div>
               <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1 block">Series {index + 1}</span>
               <span className="font-black text-lg text-white uppercase tracking-tighter">
                {sub.name}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
              <ChevronRightIcon className="h-5 w-5" />
            </div>
          </div>
          {/* Audio Waveform Decor */}
          <div className="absolute bottom-0 right-10 flex gap-1 opacity-10 group-hover:opacity-30 transition-opacity">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-white rounded-full animate-pulse" 
                style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.2}s` }} 
              />
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategoryPortal({ cat, index }: { cat: IStoreCategory; index: number }) {
  const [hovered, setHovered] = useState(false);
  const imageUrl = (cat as any).imageUrl || (cat as any).image || FALLBACK_IMAGE_URL;

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-[500px] w-full group cursor-pointer"
    >
      <Link href={`/earphonesecommerce/products?category=${cat.categoryId || cat.categoryId || cat.displayName}`} className="block h-full w-full">
        <div className="relative h-full w-full overflow-hidden rounded-[3rem] border border-white/10 bg-[#0a0a0a]">
          <motion.div 
            animate={{ scale: hovered ? 1.05 : 1, opacity: hovered ? 0.7 : 0.5 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src={imageUrl}
              alt={cat.displayName || "Category"}
              fill
              loader={customLoader}
              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
            />
          </motion.div>

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

          <div className="absolute inset-0 p-10 flex flex-col justify-end">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-10 bg-white" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/40">Portal 0{index + 1}</span>
            </div>
            
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
              {cat.displayName}
            </h3>

            <div className="overflow-hidden">
               <motion.div 
                 animate={{ y: hovered ? 0 : 40 }}
                 className="flex items-center justify-between text-white"
               >
                 <span className="text-[10px] font-black uppercase tracking-widest border-b border-white/50 pb-1">Enter Frequency</span>
                 <ArrowUpRightIcon className="w-6 h-6" />
               </motion.div>
            </div>
          </div>

          <div className="absolute top-8 right-8 h-14 w-14 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
             <Squares2X2Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function CategoriesSectionAudiophile({ store }: { store: StoreForm | null }) {
  const categories = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  const isFew = categories.length > 0 && categories.length <= 2;

  const subcategoriesForGrid = useMemo(() => {
    if (!isFew) return [];
    let list: ISubcategory[] = [];
    categories.forEach((cat) => {
      if (cat.subcategories) {
        list.push(...cat.subcategories.filter((s) => s.visible ?? true));
      }
    });
    return list.slice(0, 8);
  }, [categories, isFew]);

  const primaryColor = store?.themeSettings?.primaryColor || '#FFFFFF';

  return (
    <section className="relative bg-[#050505] py-32 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <SparklesIcon className="w-5 h-5 text-white/40" />
              <span className="text-xs font-bold tracking-[.5em] uppercase text-white/30">Premium Audio Modules</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic"
            >
              Select Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/40 to-transparent">
                Sonic Path.
              </span>
            </motion.h2>
          </div>

          <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="text-white/30 text-xl font-light max-w-xs leading-relaxed italic"
          >
            Precision tuned categories for the discerning listener. Pure sound, zero compromise.
          </motion.p>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 ${isFew ? 'lg:flex lg:justify-center' : ''}`}
        >
          {categories.map((cat, idx) => (
            <div key={cat.id} className={isFew ? 'w-full lg:w-[450px]' : ''}>
                <CategoryPortal cat={cat} index={idx} />
            </div>
          ))}
        </motion.div>

        {/* Subcategory Grid (Functional Integration) */}
        <AnimatePresence>
          {isFew && subcategoriesForGrid.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-32 pt-32 border-t border-white/5"
            >
              <div className="flex items-center gap-8 mb-16">
                <span className="font-black text-xs uppercase tracking-[0.6em] text-white/20 whitespace-nowrap">Dive into Detail</span>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {subcategoriesForGrid.map((sub, idx) => (
                  <SubcategoryPill key={sub.id || idx} sub={sub} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-32 flex justify-center"
        >
          <Link href="/earphonesecommerce/categories" className="group relative px-16 py-6 rounded-full border border-white/10 transition-all">
            <div className="absolute inset-0 bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-bottom rounded-full" />
            <span className="relative z-10 text-white group-hover:text-black font-black uppercase tracking-[0.2em] text-xs flex items-center gap-4">
              Explore Full Universe <ArrowUpRightIcon className="w-5 h-5" />
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}