'use client';

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";
import { ArrowRightIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/outline";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=1000&auto=format&fit=crop";
const MAX_SUB_TILES = 8;

const customLoader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

/* -------------------------------------------------------------------------- */
/* LOGIC-HEAVY SUB-COMPONENTS */
/* -------------------------------------------------------------------------- */

// 1. The "Hero" Style Category Card (Used when many categories exist)
function CategoryCard({ cat, index }: { cat: IStoreCategory; index: number }) {
  const isLarge = index === 0 || index === 3; 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`relative group overflow-hidden rounded-[2rem] bg-white ${
        isLarge ? "md:col-span-2 md:row-span-2 h-[550px]" : "h-[265px]"
      }`}
    >
      <Link href={`/glassesecommerce/products?category=${cat.category?.id || cat.categoryId || cat.displayName}`} className="block h-full w-full">
        <Image decoding="async"
          src={(cat as any).imageUrl || (cat as any).image || FALLBACK_IMAGE}
          alt={cat.displayName || ""}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F3A852] mb-1">
                  {cat.subcategories?.length || 0} Collections
                </p>
                <h3 className="text-2xl font-serif text-white">{cat.displayName}</h3>
              </div>
              <PlusIcon className="h-6 w-6 text-white group-hover:rotate-90 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// 2. The "Interactive" Subcategory Tile (Used when categories are few)
function SubcategoryTile({ sub, index }: { sub: ISubcategory; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="group relative h-48 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm"
    >
      <Link href={`/glassesecommerce/products?subcategory=${sub.name}`} className="block h-full w-full p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="w-10 h-10 rounded-xl bg-[#FDF8F4] flex items-center justify-center text-[#0D4C4F]">
             <SparklesIcon className="w-5 h-5" />
          </div>
          <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#F3A852] group-hover:translate-x-1 transition-all" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#0D4C4F] transition-colors">{sub.name}</h4>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Explore Style</p>
        </div>
        {/* Subtle hover background decoration */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[#F3A852]/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN SECTION COMPONENT */
/* -------------------------------------------------------------------------- */

export default function SmartCategoriesSection({ store }: { store: StoreForm | null }) {
  // LOGIC: Filter visible categories and sort them
  const categoriesToShow = useMemo(() => {
    const raw = (store?.StoreCategory ?? [])
      .filter((c) => c.visible !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return raw.length > 0 ? raw : []; 
  }, [store]);

  // LOGIC: Determine if we should show Subcategories as tiles (if 2 or fewer categories)
  const isFewCategories = categoriesToShow.length <= 2;

  // LOGIC: Extract subcategories for the "Few Categories" view
  const subTiles = useMemo(() => {
    if (!isFewCategories) return [];
    let list: ISubcategory[] = [];
    categoriesToShow.forEach((cat) => {
      if (cat.subcategories) {
        const filtered = cat.subcategories
          .filter((s) => s.visible !== false)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        list = [...list, ...filtered];
      }
    });
    return list.slice(0, MAX_SUB_TILES);
  }, [categoriesToShow, isFewCategories]);

  return (
    <section className="relative py-24 bg-[#FDF8F4] overflow-hidden">
      {/* Background visual detail */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F3A852]/5 skew-x-12 translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        
        {/* Header Logic: Adapts Title based on content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#0D4C4F]" />
              <span className="text-xs font-black uppercase tracking-[0.4em] text-[#0D4C4F]">
                {isFewCategories ? "Specific Selections" : "The Collections"}
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-gray-900 leading-[1.1]">
              {isFewCategories ? (
                <>Curated <span className="italic font-light">Sub-Styles</span></>
              ) : (
                <>Browse by <span className="italic font-light">Category</span></>
              )}
            </h2>
          </div>
          <p className="mt-6 md:mt-0 text-gray-500 max-w-[240px] text-sm leading-relaxed italic">
            {isFewCategories 
              ? "Deep dive into our most popular specific frame types."
              : "Every frame tells a story. Find yours within our diverse galleries."}
          </p>
        </div>

        {/* Content Logic: Switches Grid Layout based on content type */}
        {isFewCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subTiles.length > 0 ? (
              subTiles.map((sub, idx) => (
                <SubcategoryTile key={sub.id || idx} sub={sub} index={idx} />
              ))
            ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-[2rem]">
                    <p className="text-gray-400 font-serif italic text-xl">No sub-styles found in this collection.</p>
                </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-fr">
            {categoriesToShow.map((cat, idx) => (
              <CategoryCard key={cat.id || idx} cat={cat} index={idx} />
            ))}
          </div>
        )}

        {/* Action Logic */}
        <div className="mt-16 flex justify-center">
            <Link 
              href="/glassesecommerce/products" 
              className="group px-12 py-5 bg-[#0D4C4F] text-white rounded-full flex items-center gap-4 hover:bg-black transition-all"
            >
                <span className="text-xs font-black uppercase tracking-[0.2em]">Explore Full Catalog</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
        </div>
      </div>
    </section>
  );
}