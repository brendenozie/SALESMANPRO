"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon, TruckIcon } from "@heroicons/react/24/outline";
import { StoreForm, ISubcategory, IStoreCategory } from "@/types/typings";

/* -------------------------------------------------------------------------- */
/* Constants & Commercial Mock Fallbacks */
/* -------------------------------------------------------------------------- */
const FALLBACK_ICON = "🚛";

const fallbackSubcategories: ISubcategory[] = [
  { id: "tipper", name: "Tipper Trucks", slug: "tipper-trucks", sortOrder: 0, visible: true, icon: "🚛" },
  { id: "prime-mover", name: "Prime Movers", slug: "prime-movers", sortOrder: 1, visible: true, icon: "🚜" },
  { id: "box-body", name: "Box Body", slug: "box-body", sortOrder: 2, visible: true, icon: "🚚" },
  { id: "flatbed", name: "Flatbed Trailers", slug: "flatbed-trailers", sortOrder: 3, visible: true, icon: "🛣️" },
  { id: "tanker", name: "Fuel Tankers", slug: "fuel-tankers", sortOrder: 4, visible: true, icon: "⚓" },
  { id: "buses", name: "Commercial Buses", slug: "commercial-buses", sortOrder: 5, visible: true, icon: "🚌" },
  { id: "machinery", name: "Excavators & Diggers", slug: "excavators-diggers", sortOrder: 6, visible: true, icon: "🏗️" },
  { id: "pickup", name: "Commercial Pickups", slug: "commercial-pickups", sortOrder: 7, visible: true, icon: "🛻" },
];

/* -------------------------------------------------------------------------- */
/* Animation Variants */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
};

/* -------------------------------------------------------------------------- */
/* Subcomponents */
/* -------------------------------------------------------------------------- */

/**
 * Industrial Engineering Blueprint Grid
 */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.05]">
    <svg className="w-full h-full text-slate-900 dark:text-white" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="industrial-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 32L32 0H16L0 16M32 32V16L16 32" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#industrial-grid)" />
    </svg>
  </div>
);

/**
 * Individual Subcategory Tile
 */
const SubcategoryCard = ({ subcat }: { subcat: ISubcategory }) => {
  const icon = subcat.icon || FALLBACK_ICON;
  const hasImageIcon = icon.startsWith("http");

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Link href={`/automotive/listings?subcategory=${subcat.name}`} passHref legacyBehavior>
        <a className="group relative flex flex-col items-center justify-between h-48 w-full p-5 rounded-3xl transition-all duration-300 ease-out bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 dark:hover:border-amber-500/40 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-amber-500/10 active:scale-[0.98] overflow-hidden">
          
          {/* Subtle Dynamic Ambient Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_100%,rgba(245,158,11,0.12),transparent_70%)] pointer-events-none" />

          {/* Icon Stage */}
          <div className="relative z-10 flex-1 flex items-center justify-center w-full">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:scale-110 group-hover:border-amber-500/40 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-all duration-300">
              {hasImageIcon ? (
                <img src={icon} alt={subcat.name} className="w-8 h-8 object-contain drop-shadow-sm" />
              ) : (
                <span className="text-3xl filter drop-shadow-sm">{icon}</span>
              )}
            </div>
          </div>

          {/* Card Typography & Interaction */}
          <div className="relative z-10 w-full text-center">
            <span className="block text-sm font-extrabold uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300 line-clamp-1">
              {subcat.name}
            </span>

            {/* Slide Interaction */}
            <div className="h-4 overflow-hidden mt-1 relative">
              <div className="flex flex-col items-center w-full transition-transform duration-300 ease-out group-hover:-translate-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 h-4 flex items-center justify-center">
                  View Category
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 h-4">
                  Explore <ArrowRightIcon className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Active Status Pulse */}
          <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
          </div>
        </a>
      </Link>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

type AutomotiveSubcategoriesSectionProps = {
  store: StoreForm | null;
};

export default function AutomotiveSubcategoriesSection({ store }: AutomotiveSubcategoriesSectionProps) {
  // Extract Categories from Store
  const subcategories = useMemo(() => {
    const allSubcategories: ISubcategory[] = [];
    (store?.StoreCategory ?? []).forEach((cat: IStoreCategory) => {
      if (Array.isArray(cat.subcategories)) {
        allSubcategories.push(...cat.subcategories.filter((s) => s.visible !== false));
      }
    });
    return allSubcategories.length > 0 ? allSubcategories : fallbackSubcategories;
  }, [store]);

  const limitedSubcategories = subcategories.slice(0, 10);

  return (
    <section
      id="automotive-categories"
      className="relative py-20 md:py-28 bg-slate-50 dark:bg-[#080B10] text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800/80 overflow-hidden transition-colors duration-300"
    >
      <GridPattern />

      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 dark:bg-amber-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Industrial Equipment Classifications</span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Browse By <span className="text-amber-500 dark:text-amber-400">Category</span>
          </motion.h2>

          <motion.p
            className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Filter commercial inventory by specialized machinery, haulage configuration, or heavy-duty chassis type.
          </motion.p>
        </div>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
        >
          {limitedSubcategories.map((subcat) => (
            <SubcategoryCard key={subcat.slug} subcat={subcat} />
          ))}
        </motion.div>

        {/* Action Button */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/automotive/categories" passHref legacyBehavior>
            <a className="inline-flex items-center justify-center px-8 py-4 text-xs font-extrabold uppercase tracking-wider rounded-xl text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95">
              <span>View All Categories</span>
              <TruckIcon className="w-4 h-4 ml-2.5" />
            </a>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}