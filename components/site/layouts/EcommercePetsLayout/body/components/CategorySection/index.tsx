'use client';

import React, { useMemo, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { StoreForm, IStoreCategory, ISubcategory } from "@/types/typings";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon, 
  ArrowRightIcon,
  RectangleGroupIcon 
} from "@heroicons/react/24/outline";

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

function resolveCategoryTheme(index: number) {
  const themes = [
    { bg: "bg-sky-50", iconBg: "bg-sky-100", text: "text-sky-600", accent: "bg-sky-400" },
    { bg: "bg-rose-50", iconBg: "bg-rose-100", text: "text-rose-600", accent: "bg-rose-400" },
    { bg: "bg-amber-50", iconBg: "bg-amber-100", text: "text-amber-600", accent: "bg-amber-400" },
    { bg: "bg-indigo-50", iconBg: "bg-indigo-100", text: "text-indigo-600", accent: "bg-indigo-400" },
  ];
  return themes[index % themes.length];
}

/* -------------------------------------------------------------------------- */
/* Subcategory Component */
/* -------------------------------------------------------------------------- */

function SubcategoryPill({ sub, index }: { sub: ISubcategory; index: number }) {
  const theme = resolveCategoryTheme(index);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/ecommerce/products?subcategory=${sub.slug || sub.name}`}>
        <div className="group relative bg-white border border-slate-100 p-5 rounded-[2rem] transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:border-transparent overflow-hidden">
          <div className="relative flex items-center justify-between z-10">
            <span className="font-black text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
              {sub.name}
            </span>
            <div className={`w-9 h-9 rounded-2xl ${theme.bg} flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500`}>
              <ArrowRightIcon className={`h-4 w-4 ${theme.text}`} />
            </div>
          </div>
          {/* Subtle Hover Background Fill */}
          <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-5 ${theme.accent}`} />
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function CategoriesSection({ store }: { store: StoreForm | null }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = store?.themeSettings?.primaryColor || '#0EA5E9';

  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  // Logic to determine if we show the detailed subcategory grid
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
    <section className="relative bg-[#FDFCFB] py-32 overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="h-6 w-6" style={{ color: primaryColor }} />
              <span className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-400">
                {isFew ? "Curated Essentials" : "Browse by Species"}
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              {isFew ? "Tailored Just\nFor Them" : "Explore Our\nLittle Worlds"}
            </h2>
          </div>

          {!isFew && (
            <div className="flex gap-4">
              <button onClick={() => scroll("left")} className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all"><ChevronLeftIcon className="h-6 w-6" /></button>
              <button onClick={() => scroll("right")} className="w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-lg transition-all" style={{ backgroundColor: primaryColor }}><ChevronRightIcon className="h-6 w-6" /></button>
            </div>
          )}
        </div>

        {/* Categories Main Gallery */}
        <div
          ref={scrollRef}
          className={`flex overflow-x-auto scrollbar-hide space-x-8 pb-4 -mx-4 px-4 ${isFew ? 'justify-start md:justify-center' : ''}`}
        >
          {categoriesToShow.map((cat, idx) => {
             const theme = resolveCategoryTheme(idx);
             return (
               <Link key={cat.id || idx} href={`/ecommerce/products?category=${safeSlug(cat.displayName || cat.category?.name)}`} className="flex-shrink-0 group">
                 <div className={`relative w-64 md:w-80 aspect-[4/5] rounded-[3.5rem] ${theme.bg} transition-all duration-700 group-hover:shadow-2xl group-hover:-translate-y-4 border-2 border-transparent group-hover:border-white overflow-hidden flex flex-col items-center justify-center p-10`}>
                    <div className="relative w-40 h-40 mb-8 rounded-full transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
                      <Image 
                        src={ cat.category?.image || "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400"} 
                        alt="" fill loader={customLoader} className="object-contain" 
                      />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">{cat.displayName}</h3>
                 </div>
               </Link>
             )
          })}
        </div>

        {/* SUBCATEGORY GRID (Conditional Functionality Restored) */}
        <AnimatePresence>
          {isFew && subcategoriesForGrid.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mt-20 pt-20 border-t border-slate-100"
            >
              <div className="flex items-center gap-6 mb-12">
                <span className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">Specific Collections</span>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {subcategoriesForGrid.map((sub, idx) => (
                  <SubcategoryPill key={sub.id || idx} sub={sub} index={idx} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}