"use client";

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

function resolveCategoryTheme(index: number) {
  const themes = [
    { bg: "bg-pink-50", iconBg: "bg-pink-100", text: "text-pink-600", accent: "bg-pink-400" },
    { bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-600", accent: "bg-blue-400" },
    { bg: "bg-purple-50", iconBg: "bg-purple-100", text: "text-purple-600", accent: "bg-purple-400" },
    { bg: "bg-amber-50", iconBg: "bg-amber-100", text: "text-amber-600", accent: "bg-amber-400" },
    { bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-600", accent: "bg-emerald-400" },
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
  const imageUrl = cat.icon || "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80";

  return (
    <motion.div variants={cardVariants} className="flex-shrink-0 group">
      <Link
        href={`/ecommerce/products?category=${catSlug}`}
        className="flex flex-col items-center w-40 md:w-48"
      >
        <div className={`relative w-full aspect-[4/5] rounded-[3rem] ${theme.bg} transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-black/5 group-hover:-translate-y-3 flex flex-col items-center justify-center p-6 border-2 border-transparent group-hover:border-white`}>
          
          {/* Decorative Floating Circle behind icon */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full ${theme.iconBg} opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
          
          <div className="relative w-24 h-24 mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <Image
              src={imageUrl}
              alt={cat.displayName || "Category"}
              fill
              loader={customLoader}
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-6 left-0 right-0 px-4 text-center">
             <h3 className={`font-black tracking-tight text-sm md:text-base leading-tight ${theme.text}`}>
                {cat.displayName}
             </h3>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Shop Now
             </span>
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
        <div className="relative group bg-white border border-slate-100 p-4 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-transparent overflow-hidden">
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${theme.accent}`} />
          <div className="relative flex items-center justify-between">
            <span className="font-black text-sm text-slate-700 group-hover:text-slate-900">{sub.name}</span>
            <div className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform`}>
              <ArrowRightIcon className={`h-4 w-4 ${theme.text}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Export */
/* -------------------------------------------------------------------------- */

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
    <section className="relative bg-[#FAFAFA] py-24 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-100/50 rounded-full blur-[100px] -mr-48 -mt-24" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[100px] -ml-48 -mb-24" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="p-2 rounded-lg bg-white shadow-sm">
                <SparklesIcon className="h-5 w-5" style={{ color: primaryColor }} />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">
                {isFew ? "Specific Collections" : "Curated for you"}
              </span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {isFew ? "Find Exactly What You Need" : "Top Picks for Little Ones"}
            </h2>
          </div>

          {!isFew && (
            <div className="flex space-x-4">
              <button
                onClick={() => scroll("left")}
                className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center hover:shadow-xl transition-all active:scale-90"
              >
                <ChevronLeftIcon className="h-6 w-6 text-slate-900" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-14 h-14 rounded-2xl text-white shadow-lg flex items-center justify-center hover:shadow-2xl transition-all active:scale-90"
                style={{ backgroundColor: primaryColor }}
              >
                <ChevronRightIcon className="h-6 w-6" />
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
          className="flex overflow-x-auto scrollbar-hide space-x-8 pb-12 -mx-6 px-6"
        >
          {categoriesToShow.map((cat, idx) => (
            <CategoryCard key={cat.id || idx} cat={cat} index={idx} />
          ))}
        </motion.div>

        {/* Subcategory Grid */}
        <AnimatePresence>
          {isFew && subcategoriesForGrid.length > 0 && (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              className="mt-16"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="font-black text-xs uppercase tracking-widest text-slate-400">Deep Dive</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {subcategoriesForGrid.map((sub, idx) => (
                  <SubcategoryPill key={sub.id || idx} sub={sub} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Indicator */}
        {!isFew && (
          <div className="md:hidden flex justify-center mt-4">
            <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                animate={{ x: [-20, 40, -20] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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