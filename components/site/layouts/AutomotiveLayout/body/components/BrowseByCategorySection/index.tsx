"use client";

import React, { useMemo } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { StoreForm, ISubcategory, IStoreCategory } from "@/types/typings";

/* -------------------------------------------------------------------------- */
/* Constants & Mock Data */
/* -------------------------------------------------------------------------- */
const FALLBACK_ICON = "🚗";

const fallbackSubcategories: ISubcategory[] = [
  { id: "sedan", name: "Sedan", slug: "sedan", sortOrder: 0, visible: true, icon: "🚗" },
  { id: "suv", name: "SUV", slug: "suv", sortOrder: 1, visible: true, icon: "🚙" },
  { id: "truck", name: "Truck", slug: "truck", sortOrder: 2, visible: true, icon: "🚚" },
  { id: "sports", name: "Sports", slug: "sports", sortOrder: 3, visible: true, icon: "🏎️" },
  { id: "electric", name: "Electric", slug: "electric", sortOrder: 4, visible: true, icon: "⚡" },
  { id: "luxury", name: "Luxury", slug: "luxury", sortOrder: 5, visible: true, icon: "💎" },
  { id: "van", name: "Van", slug: "van", sortOrder: 6, visible: true, icon: "🚐" },
  { id: "bike", name: "Motorcycle", slug: "motorcycle", sortOrder: 7, visible: true, icon: "🏍️" },
];

/* -------------------------------------------------------------------------- */
/* Animation Variants */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

/**
 * Technical Grid Pattern for that "Blueprint/Engineering" feel
 */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06]">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="1" fill="none"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  </div>
);

/**
 * Individual Subcategory Card
 */
const SubcategoryCard = ({ subcat }: { subcat: ISubcategory }) => {
  const icon = subcat.icon || FALLBACK_ICON;
  const hasImageIcon = icon.startsWith("http");

  return (
    <motion.div variants={itemVariants} className="h-full">
      <Link href={`/search?subcategory=${subcat.slug}`} passHref legacyBehavior>
        <a className="group relative flex flex-col items-center justify-between h-52 w-full p-6
                      rounded-[2rem] overflow-hidden transition-all duration-500 ease-out
                      bg-white dark:bg-white/5 
                      border border-gray-100 dark:border-white/10
                      hover:border-[color:var(--primary)]/50 dark:hover:border-[color:var(--primary)]/50
                      hover:shadow-[0_20px_40px_-15px_rgba(var(--primary-rgb),0.15)]
                      active:scale-[0.98]">
          
          {/* 1. Dynamic Hover Gradient Background */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out"
            style={{ 
              background: `radial-gradient(circle at 50% 120%, rgba(var(--primary-rgb), 0.15), transparent 70%)` 
            }}
          />

          {/* 2. Floating Icon Bubble */}
          <div className="relative z-10 flex-1 flex items-center justify-center w-full">
             {/* Back Glow */}
             <div className="absolute w-24 h-24 bg-[color:var(--primary)] blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full" />
             
             <div className="relative flex items-center justify-center w-20 h-20 
                             rounded-2xl bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm
                             shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]
                             border border-gray-100 dark:border-white/10
                             group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
                             group-hover:bg-white dark:group-hover:bg-gray-800
                             group-hover:shadow-xl">
                
                {hasImageIcon ? (
                    <img src={icon} alt={subcat.name} className="w-10 h-10 object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all" />
                ) : (
                    <span className="text-4xl filter drop-shadow-sm group-hover:drop-shadow-md transition-all">{icon}</span>
                )}
             </div>
          </div>

          {/* 3. Sliding Text Interaction */}
          <div className="relative z-10 w-full text-center mt-2">
             <span className="block text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-[color:var(--primary)] transition-colors duration-300">
                {subcat.name}
             </span>
             
             {/* The Slide-Up Container */}
             <div className="h-5 overflow-hidden mt-1 relative">
                <div className="flex flex-col items-center w-full transition-transform duration-300 ease-out group-hover:-translate-y-5">
                    {/* State 1: Default Text */}
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 h-5 flex items-center justify-center w-full">
                      View Listings
                    </span>
                    {/* State 2: Hover Action */}
                    <span className="text-xs font-bold text-[color:var(--secondary)] flex items-center justify-center gap-1 h-5 w-full">
                        Explore <ArrowRightIcon className="w-3 h-3" />
                    </span>
                </div>
             </div>
          </div>

          {/* 4. Status Light (Top Right Corner) */}
          <div className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
             <div className="w-2 h-2 rounded-full bg-[color:var(--secondary)] shadow-[0_0_8px_var(--secondary)] animate-pulse" />
          </div>

        </a>
      </Link>
    </motion.div>
  );
};
const SubcategoryCardV1 = ({ subcat }: { subcat: ISubcategory }) => {
  const icon = subcat.icon || FALLBACK_ICON;
  const hasImageIcon = icon.startsWith("http");

  return (
    <motion.div variants={itemVariants}>
      <Link href={`/search?subcategory=${subcat.slug}`} passHref legacyBehavior>
        <a className="group relative flex flex-col items-center justify-between h-48 p-6 rounded-3xl overflow-hidden transition-all duration-500 
                      bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                      hover:shadow-2xl hover:-translate-y-2 hover:border-[color:var(--primary)] dark:hover:border-[color:var(--primary)]">
          
          {/* Hover Gradient Background */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
            style={{ background: `radial-gradient(circle at center, var(--primary), transparent 70%)` }}
          />

          {/* Icon Container */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div 
              className="relative flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-500 
                         bg-gray-50 dark:bg-gray-800 group-hover:scale-110 group-hover:rotate-3"
              style={{ boxShadow: '0 0 0 1px rgba(var(--primary-rgb), 0.1)' }}
            >
              {/* Inner Glow on Hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[color:var(--primary)]" />
              
              {hasImageIcon ? (
                <img src={icon} alt={subcat.name} className="w-12 h-12 object-contain drop-shadow-md group-hover:drop-shadow-xl transition-all" />
              ) : (
                <span className="text-4xl filter drop-shadow-sm group-hover:drop-shadow-lg transition-all">{icon}</span>
              )}
            </div>
          </div>

          {/* Text & Action */}
          <div className="relative z-10 w-full text-center mt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[color:var(--primary)] transition-colors duration-300">
              {subcat.name}
            </h3>
            
            <div className="flex items-center justify-center gap-1 mt-1 text-xs font-semibold text-gray-400 group-hover:text-[color:var(--secondary)] transition-colors opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 duration-300">
              <span>Browse</span>
              <ArrowRightIcon className="w-3 h-3" />
            </div>
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
  // 1. Extract Colors & Theme
  const theme = store?.themeSettings || {};
  const primaryColor = theme.primaryColor || "#3b82f6"; // Default Blue
  const secondaryColor = theme.secondaryColor || "#f59e0b"; // Default Amber

  // Helper to convert hex to rgb for CSS variable opacity usage
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "59, 130, 246";
  };

  // 2. Process Data
  const subcategories = useMemo(() => {
    const allSubcategories: ISubcategory[] = [];
    (store?.StoreCategory ?? []).forEach((cat: IStoreCategory) => {
      if (Array.isArray(cat.subcategories)) {
        allSubcategories.push(...cat.subcategories.filter(s => s.visible !== false));
      }
    });
    return allSubcategories.length > 0 ? allSubcategories : fallbackSubcategories;
  }, [store]);

  const limitedSubcategories = subcategories.slice(0, 10); // Show top 10

  // 3. Inject CSS Variables for clean cleaner styling
  const sectionStyle = {
    "--primary": primaryColor,
    "--primary-rgb": hexToRgb(primaryColor),
    "--secondary": secondaryColor,
  } as React.CSSProperties;

  return (
    <section 
      id="automotive-categories" 
      className="relative py-24 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden"
      style={sectionStyle}
    >
      <GridPattern />
      
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[color:var(--primary)] opacity-10 blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[color:var(--secondary)] opacity-10 blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm mb-6"
          >
            <SparklesIcon className="w-4 h-4 text-[color:var(--secondary)]" />
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Find Your Drive</span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-black tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--secondary)]">Type</span>
          </motion.h2>

          <motion.p 
             className="text-lg text-gray-600 dark:text-gray-400"
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
          >
            From agile sports cars to rugged trucks, filter our inventory to find the perfect chassis for your lifestyle.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {limitedSubcategories.map((subcat) => (
            <SubcategoryCard key={subcat.slug} subcat={subcat} />
          ))}
        </motion.div>

        {/* Footer Action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/search" passHref legacyBehavior>
            <a className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white rounded-full shadow-xl transition-transform duration-300 hover:scale-105 active:scale-95"
               style={{ background: `linear-gradient(135deg, var(--primary), var(--secondary))` }}>
              View Full Inventory
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </a>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}