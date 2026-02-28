"use client";

import React, { useMemo, useRef } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from "@heroicons/react/24/outline";

const MAX_SUBCATEGORIES_GRID = 12;

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

function resolveCategoryStyle(index: number) {
  const themes = [
    { bg: "bg-[#FFF0F6]", text: "text-pink-600", border: "hover:border-pink-200" },
    { bg: "bg-[#EBF4FF]", text: "text-blue-600", border: "hover:border-blue-200" },
    { bg: "bg-[#F0FFF4]", text: "text-green-600", border: "hover:border-green-200" },
    { bg: "bg-[#FFF9DB]", text: "text-yellow-600", border: "hover:border-yellow-200" },
    { bg: "bg-[#F3F0FF]", text: "text-purple-600", border: "hover:border-purple-200" },
    { bg: "bg-[#FFF5F5]", text: "text-red-600", border: "hover:border-red-200" },
  ];
  return themes[index % themes.length];
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCircle({ cat, index }: { cat: IStoreCategory; index: number }) {
  const catSlug = safeSlug(cat.displayName || "category"); //cat.slug || 
  const { bg } = resolveCategoryStyle(index);
  const imageUrl = cat.icon ||  "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80";//

  return (
    <motion.div variants={itemVariants} className="flex-shrink-0">
      <Link
        href={`/ecommerce/products?category=${catSlug}`}
        className="flex flex-col items-center group cursor-pointer"
      >
        <div
          className={`w-32 h-32 md:w-36 md:h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 ${bg}`}
        >
          <div className="relative w-20 h-20 transition-transform duration-500 group-hover:scale-110">
            <Image
              src={imageUrl}
              alt={cat.displayName || "Category"}
              fill
              loader={customLoader}
              className="object-contain p-2"
            />
          </div>
        </div>

        <h3 className="mt-4 font-black text-gray-900 text-center text-sm md:text-base group-hover:text-pink-500 transition-colors">
          {cat.displayName}
        </h3>
        <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
          {cat.subcategories?.filter(s => s.visible).length || 0} Collections
        </p>
      </Link>
    </motion.div>
  );
}

function SubcategoryPill({ sub, index }: { sub: ISubcategory; index: number }) {
  const { bg, text, border } = resolveCategoryStyle(index);
  return (
    <motion.div variants={itemVariants}>
      <Link href={`/ecommerce/products?subcategory=${sub.slug || sub.name}`}>
        <div className={`flex items-center justify-between p-4 rounded-2xl border border-gray-100 transition-all ${bg} ${border} group shadow-sm hover:shadow-md`}>
          <span className={`font-black text-sm ${text}`}>{sub.name}</span>
          <div className="bg-white/50 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRightIcon className={`h-4 w-4 ${text}`} />
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
    return list.slice(0, MAX_SUBCATEGORIES_GRID);
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
    <section className="relative bg-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-2"
            >
              <SparklesIcon className="h-4 w-4 text-pink-500" />
              <span className="text-pink-500 font-black text-sm uppercase tracking-widest">
                {isFew ? "Specific Collections" : "Curated for you"}
              </span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              {isFew ? "Find Exactly What You Need" : "Top Picks for Little Ones"}
            </h2>
          </div>

          {!isFew && (
            <div className="hidden md:flex space-x-3">
              <button
                onClick={() => scroll("left")}
                className="p-3 rounded-full bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 transition-all text-gray-400 hover:text-gray-900"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-3 rounded-full bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 transition-all text-gray-400 hover:text-gray-900"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        {/* Categories Circle Scroll */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-8 pb-8 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {categoriesToShow.map((cat, idx) => (
            <CategoryCircle key={cat.id || idx} cat={cat} index={idx} />
          ))}
        </motion.div>

        {/* Subcategory Grid - Only shows if categories are few */}
        {isFew && subcategoriesForGrid.length > 0 && (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            transition={{ staggerChildren: 0.05, delayChildren: 0.2 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {subcategoriesForGrid.map((sub, idx) => (
              <SubcategoryPill key={sub.id || idx} sub={sub} index={idx} />
            ))}
          </motion.div>
        )}

        {/* Mobile Indicator */}
        {!isFew && (
          <div className="md:hidden flex justify-center mt-4">
            <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-pink-400 w-1/3 animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}