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
 * Premium, Soft Pastel Color Profiles perfectly suited for a boutique Baby Store.
 */
function resolveCategoryTheme(index: number) {
  const themes = [
    { 
      bg: "bg-rose-50/80 dark:bg-rose-950/20", 
      iconBg: "bg-rose-100 dark:bg-rose-900/40", 
      text: "text-rose-600 dark:text-rose-300", 
      border: "border-rose-100 dark:border-rose-900/30",
      glow: "shadow-rose-200/50 dark:shadow-rose-950/50"
    },
    { 
      bg: "bg-sky-50/80 dark:bg-sky-950/20", 
      iconBg: "bg-sky-100 dark:bg-sky-900/40", 
      text: "text-sky-600 dark:text-sky-300", 
      border: "border-sky-100 dark:border-sky-900/30",
      glow: "shadow-sky-200/50 dark:shadow-sky-950/50"
    },
    { 
      bg: "bg-purple-50/80 dark:bg-purple-950/20", 
      iconBg: "bg-purple-100 dark:bg-purple-900/40", 
      text: "text-purple-600 dark:text-purple-300", 
      border: "border-purple-100 dark:border-purple-900/30",
      glow: "shadow-purple-200/50 dark:shadow-purple-950/50"
    },
    { 
      bg: "bg-amber-50/80 dark:bg-amber-950/20", 
      iconBg: "bg-amber-100 dark:bg-amber-900/40", 
      text: "text-amber-600 dark:text-amber-300", 
      border: "border-amber-100 dark:border-amber-900/30",
      glow: "shadow-amber-200/50 dark:shadow-amber-950/50"
    },
    { 
      bg: "bg-emerald-50/80 dark:bg-emerald-950/20", 
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40", 
      text: "text-emerald-600 dark:text-emerald-300", 
      border: "border-emerald-100 dark:border-emerald-900/30",
      glow: "shadow-emerald-200/50 dark:shadow-emerald-950/50"
    },
  ];
  return themes[index % themes.length];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1, 
    transition: { type: "spring", stiffness: 110, damping: 16 } 
  },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const theme = resolveCategoryTheme(index);
  const catSlug = safeSlug(cat.displayName || "category");
  const imageUrl = cat.image || cat.category?.image || "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80";

  return (
    <motion.div variants={cardVariants} className="flex-shrink-0 group py-4">
      <Link
        href={`/babyecommerce/products?category=${cat.categoryId || cat.category?.id || catSlug}`}
        className="flex flex-col items-center w-48 md:w-60 block"
      >
        <div className={`relative w-full aspect-[4/5] rounded-[3rem] ${theme.bg} border ${theme.border} backdrop-blur-sm transition-all duration-500 ease-out group-hover:shadow-2xl ${theme.glow} group-hover:-translate-y-3 flex flex-col items-center justify-between p-7 text-center overflow-visible`}>
          
          {/* Enhanced Magic Aura backdrop */}
          <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full ${theme.iconBg} opacity-30 blur-2xl group-hover:scale-130 group-hover:opacity-50 transition-all duration-700`} />
          
          {/* Floating Product Image Container */}
          <div className="relative w-32 h-32 md:w-36 md:h-36 mt-2 transition-all duration-500 ease-out group-hover:scale-110 group-hover:-translate-y-4 drop-shadow-xl z-10">
            <Image
              src={imageUrl}
              alt={cat.displayName || "Category"}
              fill
              loader={customLoader}
              className="object-contain"
            />
          </div>

          {/* Typography Footer */}
          <div className="w-full z-10 mt-auto">
             <h3 className="font-extrabold tracking-tight text-base md:text-xl text-zinc-800 dark:text-zinc-100 leading-tight">
                {cat.displayName}
             </h3>
             <div className="mt-2 overflow-hidden h-5 flex justify-center items-center gap-1">
                <span className={`text-[11px] font-black uppercase tracking-widest ${theme.text} transform translate-y-6 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-1`}>
                  Explore <ArrowRightIcon className="h-3 w-3" />
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
    <motion.div variants={cardVariants} whileHover={{ y: -4, scale: 1.02 }} className="h-full">
      <Link href={`/babyecommerce/products?subcategory=${sub.slug || sub.name}`} className="block h-full">
        <div className="relative h-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-5 rounded-[2rem] shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:shadow-none flex items-center justify-between overflow-hidden">
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${theme.bg}`} />
          
          <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
            {sub.name}
          </span>
          
          <div className={`w-9 h-9 rounded-xl ${theme.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1`}>
            <ArrowRightIcon className={`h-4 w-4 ${theme.text}`} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CategoriesSectionV5({ StoreCategory, themeSettings }: { StoreCategory: IStoreCategory[]; themeSettings: any }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = themeSettings?.primaryColor || '#F472B6';

  const categoriesToShow = useMemo(() => {
    return (StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [StoreCategory]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 4;

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
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (categoriesToShow.length === 0) return null;

  return (
    <section className="relative bg-[#FAF9F6] dark:bg-zinc-950 py-24 lg:py-32 transition-colors duration-500 overflow-hidden">
      {/* Decorative Warm Baby-Store Gradients */}
      <div 
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] -mr-48 -mt-48 opacity-25 mix-blend-multiply dark:mix-blend-normal transition-colors duration-1000"
        style={{ backgroundColor: primaryColor }}
      />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-200 dark:bg-sky-900/30 rounded-full blur-[130px] -ml-48 -mb-48 opacity-25 mix-blend-multiply dark:mix-blend-normal" />

      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2.5 mb-4"
            >
              <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-md">
                <SparklesIcon className="h-4 w-4" style={{ color: primaryColor }} />
              </div>
              <span className="font-extrabold text-[11px] uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
                {isFew ? "Handpicked Collections" : "Curated for Tiny Dreamers"}
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-950 dark:text-white leading-[1.05] tracking-tight whitespace-pre-line">
              {isFew ? "Pure Intent,\nSimple Choices" : "Explore Our\nLittle Worlds"}
            </h2>
          </div>

          {/* Navigation Handles */}
          {!isFew && (
            <div className="flex space-x-3 self-end">
              <button
                onClick={() => scroll("left")}
                aria-label="Scroll Left"
                className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition-all duration-300 active:scale-95 shadow-sm"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => scroll("right")}
                aria-label="Scroll Right"
                className="w-14 h-14 rounded-2xl text-white flex items-center justify-center hover:brightness-105 transition-all duration-300 active:scale-95 shadow-lg"
                style={{ backgroundColor: primaryColor, boxShadow: `0 12px 24px -6px ${primaryColor}55` }}
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* Horizontal Carousel Viewport */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-6 md:space-x-8 pb-8 -mx-6 px-6 snap-x snap-mandatory"
        >
          {categoriesToShow.map((cat, idx) => (
            <div key={cat.id || idx} className="snap-start">
              <CategoryCard cat={cat} index={idx} />
            </div>
          ))}
        </motion.div>

        {/* Dynamic Nested Subcategory Pill Grid */}
        <AnimatePresence>
          {isFew && subcategoriesForGrid.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-16 pt-16 border-t border-zinc-200/60 dark:border-zinc-800/60"
            >
              <div className="flex items-center gap-4 mb-10">
                <span className="font-extrabold text-[11px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">Dive Deeper</span>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {subcategoriesForGrid.map((sub, idx) => (
                  <SubcategoryPill key={sub.id || idx} sub={sub} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Micro-Interaction Scroll Track for Mobile Devices */}
        {!isFew && (
          <div className="md:hidden flex justify-center mt-4">
            <div className="h-1 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: [-20, 50, -20] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-8 rounded-full" 
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}