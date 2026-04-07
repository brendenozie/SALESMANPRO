"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  ArrowRightIcon, 
  BeakerIcon, 
  BugAntIcon, 
  TruckIcon, 
  SunIcon,
  SparklesIcon,
  RectangleGroupIcon
} from "@heroicons/react/24/outline";

/* --- 1. THEME & STYLE HELPERS --- */
const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80";

function resolveAgroStyle(index: number) {
  const themes = [
    { accent: "text-emerald-600", bg: "bg-emerald-50", border: "hover:border-emerald-200", dot: "bg-emerald-500" },
    { accent: "text-orange-600", bg: "bg-orange-50", border: "hover:border-orange-200", dot: "bg-orange-500" },
    { accent: "text-blue-600", bg: "bg-blue-50", border: "hover:border-blue-200", dot: "bg-blue-500" },
    { accent: "text-lime-600", bg: "bg-lime-50", border: "hover:border-lime-200", dot: "bg-lime-500" },
  ];
  const icons = [
    <BeakerIcon className="w-6 h-6" key="1" />,
    <BugAntIcon className="w-6 h-6" key="2" />,
    <TruckIcon className="w-6 h-6" key="3" />,
    <SunIcon className="w-6 h-6" key="4" />,
  ];
  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

/* --- 2. ANIMATIONS --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* --- 3. SUBCOMPONENTS --- */

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

function CategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const { theme } = resolveAgroStyle(index);
  const subCount = cat.subcategories?.length || 0;

  return (
    <motion.div variants={itemVariants} className="group h-full">
      <Link href={`/site/${storeSlug}/agrovetecommerce/products?category=${cat.id}`} className="block h-full">
        <div className="relative h-[420px] w-full overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
          <div className="h-3/5 w-full relative overflow-hidden">
            <Image
              src={cat.icon?.startsWith('http') ? cat.icon : FALLBACK_IMAGE_URL}
              alt={cat.displayName || ""}
              loader={customLoader}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 w-full p-8 bg-white/90 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} animate-pulse`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {subCount} Specialized Lines
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
              {cat.displayName}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium italic">Explore Department</p>
              <div className={`p-2 rounded-full ${theme.bg} ${theme.accent} transition-transform group-hover:translate-x-1`}>
                <ArrowRightIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SubcategoryTile({ sub, index, storeSlug }: { sub: ISubcategory; index: number; storeSlug: string }) {
  const { theme, icon } = resolveAgroStyle(index);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/site/${storeSlug}/agrovetecommerce/products?subcategory=${sub.id}`}>
        <div className={`group flex items-center gap-5 p-6 rounded-[2rem] bg-white border border-slate-100 transition-all hover:bg-slate-50 ${theme.border} hover:shadow-md`}>
          <div className={`h-14 w-14 flex items-center justify-center rounded-2xl ${theme.bg} ${theme.accent} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{sub.name}</h4>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">View Collection</p>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}

/* --- 4. MAIN PAGE --- */

export default function AgroCategoriesPage() {
  const store = useStore();
  const rawCategories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  const categories = useMemo(() => {
    return [...rawCategories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [rawCategories]);

  // DECISION LOGIC: If categories <= 2, we show subcategories as tiles.
  const showSubcategoriesAsPrimary = categories.length > 0 && categories.length <= 2;

  const elevatedSubcategories = useMemo(() => {
    if (!showSubcategoriesAsPrimary) return [];
    return categories.flatMap(cat => cat.subcategories || []).slice(0, 12);
  }, [categories, showSubcategoriesAsPrimary]);

  if (!storeSlug) return null;

  return (
    <main className="relative bg-[#fafaf9] min-h-screen py-32 overflow-hidden">
      {/* Decorative Bio-Patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] bg-orange-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 mb-4 bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              <SparklesIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                {showSubcategoriesAsPrimary ? "Specialized Categories" : "Main Departments"}
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter"
            >
              {showSubcategoriesAsPrimary ? (
                <>Targeted <span className="italic font-serif font-light text-orange-600">Solutions</span> for Growth.</>
              ) : (
                <>Essential <span className="italic font-serif font-light text-emerald-600">Supplies</span> for Every Cycle.</>
              )}
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-slate-500 font-medium max-w-xs border-l-2 border-emerald-500 pl-6"
          >
            {showSubcategoriesAsPrimary 
              ? "We've broken down our inventory into specific needs to help you find results faster."
              : "Bridging the gap between scientific research and field application."}
          </motion.p>
        </div>

        {/* DYNAMIC GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {showSubcategoriesAsPrimary ? (
            /* Layout A: Subcategory Tiles */
            <>
              {elevatedSubcategories.map((sub, idx) => (
                <SubcategoryTile key={sub.id} sub={sub} index={idx} storeSlug={storeSlug} />
              ))}
              {/* Optional: Add a call to action card if tiles are few */}
              {elevatedSubcategories.length < 4 && (
                <motion.div variants={itemVariants} className="col-span-full md:col-span-2 p-8 bg-emerald-900 rounded-[2.5rem] text-white flex items-center justify-between">
                   <div>
                    <h4 className="text-2xl font-bold mb-2">Need advice?</h4>
                    <p className="text-emerald-200">Consult our on-site vets for customized feed plans.</p>
                   </div>
                   <RectangleGroupIcon className="w-16 h-16 opacity-20" />
                </motion.div>
              )}
            </>
          ) : (
            /* Layout B: Main Category Cards */
            categories.map((cat, idx) => (
              <CategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
            ))
          )}
        </motion.div>
      </div>
    </main>
  );
}