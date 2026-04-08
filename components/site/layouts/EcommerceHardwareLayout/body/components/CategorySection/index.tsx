'use client';

import React, { useMemo, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Square3Stack3DIcon, 
  ArrowUpRightIcon 
} from "@heroicons/react/24/solid";

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

function safeSlug(value?: string, fallback = "category") {
  if (!value) return fallback;
  return String(value).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 120, damping: 20 } 
  },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index, primaryColor }: { cat: IStoreCategory; index: number; primaryColor: string }) {
  const catSlug = safeSlug(cat.displayName || "category");
  const imageUrl = cat.image || cat.category?.image || "https://images.unsplash.com/photo-1581244276891-6bc618f3a697";

  return (
    <motion.div variants={cardVariants} className="flex-shrink-0 group">
      <Link
        href={`/hardwareecommerce/products?category=${cat.categoryId || cat.category?.id || catSlug}`}
        className="flex flex-col w-64 md:w-72"
      >
        <div className="relative w-full aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-500 group-hover:border-amber-500 overflow-hidden">
          
          {/* Industrial Numbering */}
          <span className="absolute top-6 left-6 text-[10px] font-black text-zinc-400 dark:text-zinc-600 group-hover:text-amber-500 transition-colors z-20">
            0{index + 1} //
          </span>

          {/* Technical Drawing Background Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
               style={{ backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
          
          <div className="relative w-full h-3/5 mt-10 p-8 transition-transform duration-700 group-hover:scale-110">
            <Image
              src={imageUrl}
              alt={cat.displayName || "Category"}
              fill
              loader={customLoader}
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white dark:from-zinc-900 via-white/80 dark:via-zinc-900/80 to-transparent">
              <h3 className="font-black tracking-tighter text-xl md:text-2xl uppercase leading-none text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">
                {cat.displayName}
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Inventory Ready</span>
                <ArrowUpRightIcon className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SubcategoryPill({ sub }: { sub: ISubcategory }) {
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/hardwareecommerce/products?subcategory=${sub.slug || sub.name}`}>
        <div className="group flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 hover:border-amber-500 transition-all duration-300">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Module</span>
            <span className="font-black text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{sub.name}</span>
          </div>
          <div className="w-10 h-10 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all">
            <ArrowUpRightIcon className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HardwareCategoriesSection({ store }: { store: StoreForm | null }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryColor = store?.themeSettings?.primaryColor || '#F59E0B';

  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

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
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (categoriesToShow.length === 0) return null;

  return (
    <section className="relative bg-white dark:bg-[#080808] py-24 transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-4"
            >
              <Square3Stack3DIcon className="h-6 w-6 text-amber-500" />
              <span className="font-black text-[10px] uppercase tracking-[0.5em] text-zinc-400">
                Departmental Catalog
              </span>
            </motion.div>
            <h2 className="text-5xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter uppercase">
              {isFew ? "Engineered\nSelections" : "Industrial\nSolutions"}
            </h2>
          </div>

          {!isFew && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-14 h-14 bg-zinc-900 dark:bg-amber-500 text-white flex items-center justify-center hover:bg-zinc-800 transition-all"
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
          className="flex overflow-x-auto scrollbar-hide space-x-6 pb-12"
        >
          {categoriesToShow.map((cat, idx) => (
            <CategoryCard key={cat.id || idx} cat={cat} index={idx} primaryColor={primaryColor} />
          ))}
        </motion.div>

        {/* Subcategory Grid */}
        <AnimatePresence>
          {isFew && subcategoriesForGrid.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="mt-16 pt-16 border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-10">
                <h4 className="font-black text-sm uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Technical Sub-Departments</h4>
                <div className="h-[2px] w-32 bg-amber-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border-l border-t border-zinc-200 dark:border-zinc-800">
                {subcategoriesForGrid.map((sub, idx) => (
                  <SubcategoryPill key={sub.id || idx} sub={sub} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}