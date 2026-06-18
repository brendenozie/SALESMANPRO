"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory } from "@/types/typings";
import { useStore } from "@/contexts/StoreContext";
import { 
  ArrowRightIcon, 
  SparklesIcon, 
  ShoppingBagIcon,
  TagIcon,
  GiftIcon,
  StarIcon
} from "@heroicons/react/24/outline";

/* --- Style Resolver for Categories without Images --- */
function resolveCategoryStyle(index: number) {
  const themes = [
    { accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", dot: "bg-indigo-500" },
    { accent: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", dot: "bg-rose-500" },
    { accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", dot: "bg-amber-500" },
    { accent: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/40", dot: "bg-cyan-500" },
  ];
  const icons = [<ShoppingBagIcon key="1" />, <TagIcon key="2" />, <GiftIcon key="3" />, <StarIcon key="4" />];
  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

/* --- Animations --- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

/* --- Main Component --- */
export default function CategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) return null;

  return (
    <main className="relative bg-[#fafaf9] dark:bg-black min-h-screen py-32 overflow-hidden transition-colors duration-300">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 dark:opacity-20 pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-indigo-100/50 dark:bg-indigo-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-[-5%] w-[500px] h-[500px] bg-rose-100/50 dark:bg-rose-900/30 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="max-w-3xl mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 mb-6 bg-white dark:bg-gray-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-gray-800 shadow-sm"
          >
            <SparklesIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">The Catalog</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter"
          >
            Explore <span className="italic font-serif font-light text-indigo-600 dark:text-indigo-400">Collections</span>
          </motion.h1>
          <p className="mt-6 text-lg text-slate-500 dark:text-gray-400 font-medium max-w-md border-l-2 border-indigo-500 pl-6">
            Everything you need, curated into thoughtful categories for your lifestyle.
          </p>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {categories.map((cat, idx) => (
            <CategoryCard key={cat.id} cat={cat} index={idx} storeSlug={storeSlug} />
          ))}
        </motion.div>

        {categories.length === 0 && (
          <div className="py-40 text-center bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-gray-800">
            <p className="text-slate-400 font-medium">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}

/* --- Card Sub-component --- */
function CategoryCard({ cat, index, storeSlug }: { cat: IStoreCategory; index: number; storeSlug: string }) {
  const { theme, icon } = resolveCategoryStyle(index);
  const isImageUrl = cat.icon?.startsWith("http") || cat.icon?.startsWith("/");
  const categoryName = cat.displayName || "Category";
  const subCount = cat.subcategories?.length || 0;

  return (
    <motion.div variants={itemVariants} className="group h-full">
      <Link href={`/ecommerce/products?category=${cat.id}`} className="block h-full">
        <div className="relative h-[450px] overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 group-hover:-translate-y-2">
          
          {/* Image / Icon Section */}
          <div className="h-2/3 w-full relative overflow-hidden bg-slate-50 dark:bg-gray-800 flex items-center justify-center">
            {isImageUrl ? (
              <Image
                src={cat.icon!}
                alt={categoryName}
                fill
                loader={customLoader}
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
            ) : (
              <div className={`w-24 h-24 rounded-3xl ${theme.bg} ${theme.accent} flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                <div className="w-12 h-12">{icon}</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900" />
          </div>

          {/* Details Section */}
          <div className="absolute bottom-0 w-full p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} animate-pulse`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {subCount} Collections
              </span>
            </div>
            
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors">
              {categoryName}
            </h3>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                Browse Collection
              </span>
              <div className={`p-3 rounded-2xl ${theme.bg} ${theme.accent} group-hover:scale-110 transition-all`}>
                <ArrowRightIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}