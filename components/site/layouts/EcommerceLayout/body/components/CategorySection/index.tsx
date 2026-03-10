'use client';

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import {
  ArrowRightIcon,
  ShoppingBagIcon,
  TagIcon,
  RectangleGroupIcon,
  SparklesIcon,
  CubeTransparentIcon,
  TruckIcon,
  UserIcon,
  GiftIcon,
  StarIcon
} from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/* Constants & Helpers */
/* -------------------------------------------------------------------------- */
const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80";
const MAX_SUBCATEGORIES = 8;

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

function resolveRetailStyle(index: number) {
  const themes = [
    { accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40", border: "hover:border-indigo-200 dark:hover:border-indigo-800", dot: "bg-indigo-500", gradient: "from-indigo-600 to-violet-600" },
    { accent: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40", border: "hover:border-rose-200 dark:hover:border-rose-800", dot: "bg-rose-500", gradient: "from-rose-500 to-pink-600" },
    { accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "hover:border-amber-200 dark:hover:border-amber-800", dot: "bg-amber-500", gradient: "from-amber-500 to-orange-600" },
    { accent: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/40", border: "hover:border-cyan-200 dark:hover:border-cyan-800", dot: "bg-cyan-500", gradient: "from-cyan-500 to-blue-500" },
  ];
  
  const icons = [
    <ShoppingBagIcon className="w-6 h-6" key="1" />,
    <TagIcon className="w-6 h-6" key="2" />,
    <GiftIcon className="w-6 h-6" key="3" />,
    <StarIcon className="w-6 h-6" key="4" />,
  ];

  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const { theme } = resolveRetailStyle(index);
  const catSlug = safeSlug(cat.displayName || `category-${index}`);
  const subCount = cat.subcategories?.filter((s) => s.visible).length || 0;

  return (
    <motion.div variants={itemVariants} className="group relative h-full">
      <Link href={`/shop/catalog?category=${catSlug}`} className="block h-full">
        <div className="relative h-[420px] w-full overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 transition-all duration-500 group-hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] dark:group-hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] group-hover:-translate-y-2">
          <div className="h-3/5 w-full overflow-hidden relative">
            <Image
              src={cat.category?.image || FALLBACK_IMAGE_URL}
              alt={cat.displayName || ""}
              fill
              loader={customLoader}
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            {/* Gradient overlay adjusted for dark mode visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-900" />
          </div>

          <div className="absolute bottom-0 w-full p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} animate-pulse`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">
                {subCount} Collections
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {cat.displayName}
            </h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-gray-400 font-medium italic">Shop New Arrivals</p>
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

function SubcategoryTile({ sub, index }: { sub: ISubcategory; index: number }) {
  const { theme, icon } = resolveRetailStyle(index);

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/shop/catalog?subcategory=${sub.slug || sub.name}`}>
        <div className={`group flex items-center gap-5 p-6 rounded-[2rem] bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 transition-all hover:bg-slate-50 dark:hover:bg-gray-800/50 ${theme.border} hover:shadow-md`}>
          <div className={`h-14 w-14 flex items-center justify-center rounded-2xl ${theme.bg} ${theme.accent} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sub.name}</h4>
            <p className="text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-tighter">Explore Now</p>
          </div>
          <ArrowRightIcon className="w-4 h-4 text-slate-300 dark:text-gray-600 group-hover:text-indigo-500 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Section */
/* -------------------------------------------------------------------------- */

export default function RetailCategories({ store }: { store: StoreForm | null }) {
  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  const isFew = categoriesToShow.length > 0 && categoriesToShow.length <= 2;

  const limitedSubcategories = useMemo(() => {
    if (!isFew) return [];
    let list: ISubcategory[] = [];
    categoriesToShow.forEach((pcat) => {
      if (pcat.subcategories) {
        const subs = pcat.subcategories
          .filter((s) => s.visible ?? true)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .slice(0, 4); 
        list.push(...subs);
      }
    });
    return list.slice(0, MAX_SUBCATEGORIES);
  }, [categoriesToShow, isFew]);

  return (
    <section className="relative bg-[#fafaf9] dark:bg-black py-32 overflow-hidden transition-colors duration-300">
      {/* Background Decorative Patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 dark:opacity-20 pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-100/50 dark:bg-indigo-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-[-5%] w-[400px] h-[400px] bg-rose-100/50 dark:bg-rose-900/30 rounded-full blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 text-left">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 mb-4 bg-white dark:bg-gray-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-gray-800 shadow-sm"
            >
              <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                {isFew ? "Trending Now" : "Browse by Style"}
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter"
            >
              {isFew ? (
                <>Premium <span className="italic font-serif font-light text-rose-600 dark:text-rose-400">Picks</span> for You.</>
              ) : (
                <>Curated <span className="italic font-serif font-light text-indigo-600 dark:text-indigo-400">Collections</span> for Every Season.</>
              )}
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-lg text-slate-500 dark:text-gray-400 font-medium max-w-xs border-l-2 border-indigo-500 pl-6"
          >
            {isFew 
              ? "Handpicked fashion and lifestyle essentials to elevate your everyday."
              : "Quality, style, and comfort delivered right to your doorstep."}
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {isFew ? (
            <>
              {limitedSubcategories.length > 0 ? (
                limitedSubcategories.map((sub, idx) => (
                  <SubcategoryTile key={sub.id || idx} sub={sub} index={idx} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-gray-800">
                   <CubeTransparentIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-gray-700 mb-4" />
                   <p className="text-slate-500 dark:text-gray-500 font-medium">No items available in this category yet.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {categoriesToShow.map((cat, idx) => (
                <CategoryCard key={cat.id} cat={cat} index={idx} />
              ))}
              
              <motion.div variants={itemVariants} className="flex flex-col justify-between p-10 bg-gray-900 dark:bg-indigo-950 rounded-[2.5rem] text-white group cursor-pointer overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <UserIcon className="w-32 h-32" />
                </div>
                <RectangleGroupIcon className="w-12 h-12 text-indigo-400 relative z-10" />
                <div className="relative z-10">
                  <p className="text-3xl font-bold leading-tight mb-4">Want Personal Styling?</p>
                  <Link href="/contact" className="inline-flex items-center gap-2 font-bold text-indigo-400 hover:text-white transition-colors">
                    Talk to a Stylist <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}