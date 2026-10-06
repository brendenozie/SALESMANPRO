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
  UserIcon,
  GiftIcon,
  StarIcon
} from "@heroicons/react/24/outline";

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
    <ShoppingBagIcon className="w-5 h-5 md:w-6 md:h-6" key="1" />,
    <TagIcon className="w-5 h-5 md:w-6 md:h-6" key="2" />,
    <GiftIcon className="w-5 h-5 md:w-6 md:h-6" key="3" />,
    <StarIcon className="w-5 h-5 md:w-6 md:h-6" key="4" />,
  ];

  return { theme: themes[index % themes.length], icon: icons[index % icons.length] };
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const { theme } = resolveRetailStyle(index);
  const catSlug = safeSlug(cat.categoryId || cat.category?.id || cat.displayName || `category-${index}`);
  const subCount = cat.subcategories?.filter((s) => s.visible).length || 0;

  return (
    <motion.div 
      variants={itemVariants} 
      whileTap={{ scale: 0.98 }}
      className="group relative h-full"
    >
      <Link href={`/ecommerce/products?category=${cat.categoryId || cat.category?.id || catSlug}`} className="block h-full">
        {/* Adjusted mobile height down to 300px, and reduced edge radius to match compact frame scales */}
        <div className="relative h-[300px] sm:h-[360px] md:h-[420px] w-full overflow-hidden rounded-[1.8rem] sm:rounded-[2.5rem] bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800/60 transition-all duration-500 group-hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] dark:group-hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] md:group-hover:-translate-y-1.5">
          <div className="h-full w-full overflow-hidden relative">
            <Image decoding="async"
              src={cat.category?.image || FALLBACK_IMAGE_URL}
              alt={cat.displayName || ""}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
            />
            {/* Smooth dark overlay mask variant across background layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/80 dark:to-black/95" />
          </div>

          {/* Floated content on text card context layer to remain entirely clear inside 2 columns */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 md:p-8 flex flex-col justify-end text-white z-10">
            <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
              <span className={`h-1.5 w-1.5 rounded-full ${theme.dot} animate-pulse`} />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/70">
                {subCount} Collections
              </span>
            </div>
            {/* Dynamic text size ensures strings wrap dynamically without overflowing element frames */}
            <h3 className="text-base sm:text-xl md:text-2xl font-bold leading-tight mb-1 sm:mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
              {cat.displayName}
            </h3>
            <div className="flex items-center justify-between opacity-90 group-hover:opacity-100 transition-opacity">
              <p className="text-[11px] sm:text-xs text-white/60 font-medium italic truncate">Explore Items</p>
              <div className={`p-1.5 sm:p-2 rounded-full bg-white/10 backdrop-blur-md text-white transition-transform group-hover:translate-x-1`}>
                <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
    <motion.div variants={itemVariants} whileTap={{ scale: 0.97 }}>
      <Link href={`/ecommerce/products?subcategory=${sub.slug || sub.name}`}>
        {/* Adjusted spacing values from p-6 to responsive p-3.5 mobile paddings */}
        <div className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3.5 sm:p-5 md:p-6 h-full rounded-[1.5rem] sm:rounded-[2rem] bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 transition-all hover:bg-slate-50 dark:hover:bg-gray-800/40 ${theme.border} hover:shadow-md`}>
          <div className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex items-center justify-center rounded-xl sm:rounded-2xl shrink-0 ${theme.bg} ${theme.accent} group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0 w-full">
            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{sub.name}</h4>
            <p className="text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Explore</p>
          </div>
          <ArrowRightIcon className="hidden sm:block w-4 h-4 text-slate-300 dark:text-gray-600 group-hover:text-indigo-500 transition-all" />
        </div>
      </Link>
    </motion.div>
  );
}

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
    <section className="relative bg-[#fafaf9] dark:bg-black py-16 sm:py-24 md:py-32 overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-40 dark:opacity-20 pointer-events-none">
        <div className="absolute top-20 right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-10 left-[-5%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-rose-100/50 dark:bg-rose-900/20 rounded-full blur-[70px] sm:blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 md:mb-20 gap-6 text-left">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 mb-3 bg-white dark:bg-gray-900 px-3.5 py-1 rounded-full border border-slate-200 dark:border-gray-800 shadow-sm"
            >
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
                {isFew ? "Trending Now" : "Browse by Category"}
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.15] md:leading-[1.1] tracking-tighter"
            >
              {isFew ? (
                <>Premium <span className="italic font-serif font-light text-rose-600 dark:text-rose-400">Picks</span> for You.</>
              ) : (
                <>Curated <span className="italic font-serif font-light text-indigo-600 dark:text-indigo-400">Collections</span>.</>
              )}
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-gray-400 font-medium max-w-xs border-l-2 border-indigo-500 pl-4 md:pl-6"
          >
            {isFew 
              ? "Handpicked fashion and lifestyle essentials to elevate your everyday."
              : "Quality, style, and comfort delivered right to your doorstep."}
          </motion.p>
        </div>

        {/* CRITICAL TRANSFORMATION: 
          Replaced `grid-cols-1` with `grid-cols-2` on the base breakpoint to show twice as many items simultaneously on mobile screens.
        */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4"
        >
          {isFew ? (
            <>
              {limitedSubcategories.length > 0 ? (
                limitedSubcategories.map((sub, idx) => (
                  <SubcategoryTile key={sub.id || idx} sub={sub} index={idx} />
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white dark:bg-gray-900 rounded-[1.8rem] sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-gray-800">
                   <CubeTransparentIcon className="w-10 h-10 mx-auto text-slate-300 dark:text-gray-700 mb-3" />
                   <p className="text-sm text-slate-400 dark:text-gray-500 font-medium">No items available yet.</p>
                </div>
              )}
            </>
          ) : (
            <>
              {categoriesToShow.map((cat, idx) => (
                <CategoryCard key={cat.id} cat={cat} index={idx} />
              ))}
              
              {/* Special Styling Promotion Tile - Handled gracefully within 2-column configurations */}
              <motion.div 
                variants={itemVariants} 
                whileTap={{ scale: 0.98 }}
                className="flex flex-col justify-between p-5 sm:p-8 md:p-10 bg-gray-900 dark:bg-indigo-950 rounded-[1.8rem] sm:rounded-[2.5rem] text-white group cursor-pointer overflow-hidden relative min-h-[300px] sm:min-h-0"
              >
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 sm:opacity-10 group-hover:scale-105 transition-transform">
                    <UserIcon className="w-24 h-24 sm:w-32 sm:h-32" />
                </div>
                <RectangleGroupIcon className="w-8 h-8 sm:w-12 sm:h-12 text-indigo-400 relative z-10" />
                <div className="relative z-10 mt-auto">
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight mb-3 sm:mb-4">Want Personal Styling?</p>
                  <Link href="/contact" className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-400 hover:text-white transition-colors">
                    Talk to Us <ArrowRightIcon className="w-3.5 h-3.5" />
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