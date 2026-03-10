'use client';

import React, { useMemo, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

/* -------------------------------------------------------------------------- */
/* Helpers & Themes */
/* -------------------------------------------------------------------------- */

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");
}

/**
 * Enhanced Themes for Baby Store (Light & Dark Compatible)
 */
function resolveCategoryTheme(index: number) {
  const themes = [
    { 
      bg: "bg-rose-50 dark:bg-rose-950/30", 
      iconBg: "bg-rose-100 dark:bg-rose-900/50", 
      text: "text-rose-600 dark:text-rose-400", 
      accent: "bg-rose-400" 
    },
    { 
      bg: "bg-sky-50 dark:bg-sky-950/30", 
      iconBg: "bg-sky-100 dark:bg-sky-900/50", 
      text: "text-sky-600 dark:text-sky-400", 
      accent: "bg-sky-400" 
    },
    { 
      bg: "bg-indigo-50 dark:bg-indigo-950/30", 
      iconBg: "bg-indigo-100 dark:bg-indigo-900/50", 
      text: "text-indigo-600 dark:text-indigo-400", 
      accent: "bg-indigo-400" 
    },
    { 
      bg: "bg-amber-50 dark:bg-amber-950/30", 
      iconBg: "bg-amber-100 dark:bg-amber-900/50", 
      text: "text-amber-600 dark:text-amber-400", 
      accent: "bg-amber-400" 
    },
    { 
      bg: "bg-emerald-50 dark:bg-emerald-950/30", 
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50", 
      text: "text-emerald-600 dark:text-emerald-400", 
      accent: "bg-emerald-400" 
    },
  ];
  return themes[index % themes.length];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const theme = resolveCategoryTheme(index);
  const catSlug = safeSlug(cat.displayName || "category");
  const imageUrl = cat.icon || cat.category?.image || "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80";

  return (
    <motion.div variants={cardVariants} className="flex-shrink-0 group">
      <Link
        href={`/ecommerce/products?category=${catSlug}`}
        className="flex flex-col items-center w-44 md:w-56"
      >
        <div className={`relative w-full aspect-[4/5] rounded-[3.5rem] ${theme.bg} transition-all duration-700 group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] group-hover:-translate-y-4 flex flex-col items-center justify-center p-8 border-2 border-transparent group-hover:border-white dark:group-hover:border-zinc-800`}>
          
          {/* Glowing Aura backdrop */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full ${theme.iconBg} opacity-40 blur-[40px] group-hover:scale-150 transition-transform duration-1000`} />
          
          <div className="relative w-28 h-28 mb-6 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-xl">
            <Image
              src={imageUrl}
              alt={cat.displayName || "Category"}
              fill
              loader={customLoader}
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-8 left-0 right-0 px-4 text-center">
             <h3 className={`font-black tracking-tight text-sm md:text-lg leading-tight transition-colors ${theme.text}`}>
                {cat.displayName}
             </h3>
             <div className="mt-2 overflow-hidden h-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  Shop Now
                </span>
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SubcategoryPill({ sub, index }: { sub: ISubcategory; index: number }) {
  const theme = resolveCategoryTheme(index);
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/ecommerce/products?subcategory=${sub.slug || sub.name}`}>
        <div className="relative group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-[2rem] transition-all duration-500 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-none hover:border-transparent overflow-hidden">
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${theme.accent}`} />
          <div className="relative flex items-center justify-between">
            <span className="font-black text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">{sub.name}</span>
            <div className={`w-9 h-9 rounded-2xl ${theme.bg} flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500`}>
              <ArrowRightIcon className={`h-4 w-4 ${theme.text}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSectionV5({ store }: { store: StoreForm | null }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = store?.themeSettings?.primaryColor || '#F472B6';

  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  const subcategoriesForGrid = useMemo(() => {
    if (!isFew) return [];
    let list: ISubcategory[] = [];
    categoriesToShow.forEach((cat) => {
      if (cat.subcategories) {
        list.push(...cat.subcategories.filter((s) => s.visible ?? true));
      }
    });
    return list.slice(0, 12);
  }, [categoriesToShow, isFew]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (categoriesToShow.length === 0) return null;

  return (
    <section className="relative bg-[#FAFAFA] dark:bg-zinc-950 py-32 transition-colors duration-500 overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -mr-64 -mt-32 opacity-30 transition-colors"
        style={{ backgroundColor: primaryColor }}
      />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400 dark:bg-blue-600 rounded-full blur-[120px] -ml-64 -mb-32 opacity-20" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                <SparklesIcon className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <span className="font-black text-[10px] uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
                {isFew ? "Specific Collections" : "Curated for Tiny Dreamers"}
              </span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter">
              {isFew ? "Pure Intent,\nSimple Choices" : "Explore Our\nLittle Worlds"}
            </h2>
          </div>

          {!isFew && (
            <div className="flex space-x-4">
              <button
                onClick={() => scroll("left")}
                className="w-16 h-16 rounded-[2rem] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-100 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900 transition-all active:scale-95 shadow-lg"
              >
                <ChevronLeftIcon className="h-7 w-7" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-16 h-16 rounded-[2rem] text-white flex items-center justify-center hover:brightness-110 transition-all active:scale-95 shadow-xl"
                style={{ backgroundColor: primaryColor, boxShadow: `0 20px 40px -10px ${primaryColor}66` }}
              >
                <ChevronRightIcon className="h-7 w-7" />
              </button>
            </div>
          )}
        </div>

        {/* Categories Card Scroll */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-10 pb-16 -mx-6 px-6"
        >
          {categoriesToShow.map((cat, idx) => (
            <CategoryCard key={cat.id || idx} cat={cat} index={idx} />
          ))}
        </motion.div>

        {/* Subcategory Grid */}
        <AnimatePresence>
          {isFew && subcategoriesForGrid.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-20 pt-20 border-t border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex items-center gap-6 mb-12">
                <span className="font-black text-[11px] uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600 whitespace-nowrap">Dive Deeper</span>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-100 dark:from-zinc-800 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {subcategoriesForGrid.map((sub, idx) => (
                  <SubcategoryPill key={sub.id || idx} sub={sub} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Custom Scroll Indicator */}
        {!isFew && (
          <div className="md:hidden flex justify-center mt-6">
            <div className="h-1 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: [-30, 60, -30] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-10 rounded-full" 
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}