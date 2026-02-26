"use client";

import React, { useMemo, useRef } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const MAX_SUBCATEGORIES = 12;

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
 * Resolves soft pastel backgrounds to match the AxeMart design
 */
function resolveCategoryStyle(index: number) {
  const themes = [
    { bg: "bg-[#FFF0F6]", text: "text-pink-600" }, // Pink
    { bg: "bg-[#EBF4FF]", text: "text-blue-600" }, // Blue
    { bg: "bg-[#F0FFF4]", text: "text-green-600" }, // Green
    { bg: "bg-[#FFF9DB]", text: "text-yellow-600" }, // Yellow
    { bg: "bg-[#F3F0FF]", text: "text-purple-600" }, // Purple
    { bg: "bg-[#FFF5F5]", text: "text-red-600" },   // Red
  ];
  return themes[index % themes.length];
}

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function CategoryCircle({
  cat,
  index,
}: {
  cat: IStoreCategory;
  index: number;
}) {
  const catSlug = safeSlug(cat.categoryId || cat.displayName || "category");
  const { bg } = resolveCategoryStyle(index);
  const imageUrl = (cat as any).imageUrl || (cat as any).image || "/placeholder-icon.png";

  return (
    <Link
      href={`/ecommerce/products?category=${catSlug}`}
      className="flex-shrink-0 flex flex-col items-center group cursor-pointer"
    >
      {/* Icon Container - The "Squircle" */}
      <div
        className={`w-32 h-32 md:w-36 md:h-36 rounded-[2.5rem] flex items-center justify-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 ${bg}`}
      >
        <div className="relative w-20 h-20 transition-transform duration-500 group-hover:scale-110">
          <Image
            src={imageUrl}
            alt={cat.displayName || "Category"}
            fill
            loader={customLoader}
            className="object-contain"
          />
        </div>
      </div>

      {/* Label */}
      <h3 className="mt-4 font-black text-gray-900 text-center text-sm md:text-base group-hover:text-pink-500 transition-colors">
        {cat.displayName}
      </h3>
      <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
        {cat.subcategories?.length || 0} Collections
      </p>
    </Link>
  );
}

export default function CategoriesSectionV5({
  store,
}: {
  store: StoreForm | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Logic: Filter and sort categories
  const categoriesToShow = useMemo(() => {
    return (store?.StoreCategory ?? [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [store]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (categoriesToShow.length === 0) return null;

  return (
    <section className="relative bg-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-pink-500 font-black text-sm uppercase tracking-widest">
              Curated for you
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2">
              Top Picks for Little Ones
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="hidden md:flex space-x-3">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-full bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 transition-all text-gray-400 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-full bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 transition-all text-gray-400 hover:text-gray-900"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide space-x-8 pb-8 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {categoriesToShow.map((cat, idx) => (
            <CategoryCircle
              key={cat.id || idx}
              cat={cat}
              index={idx}
            />
          ))}
        </div>

        {/* Mobile Indicator */}
        <div className="md:hidden flex justify-center mt-4">
          <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-pink-400 w-1/3 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}