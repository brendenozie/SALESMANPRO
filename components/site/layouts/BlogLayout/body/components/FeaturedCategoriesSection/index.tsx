"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { IStoreCategory } from "@/types/typings";

// ---------------------------------------------------------
// 1. ICON MAPPING UTILITIES
// ---------------------------------------------------------

// A set of distinct icons to use when we match a keyword
const ICONS = {
  tech: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  clothing: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  health: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  home: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  books: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  art: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  // Generic fallback shapes
  star: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  sparkle: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  cube: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
};

// Helper to pick color themes
const THEMES = [
  { text: "text-blue-400", border: "group-hover:border-blue-500/30", glow: "from-blue-500/20" },
  { text: "text-emerald-400", border: "group-hover:border-emerald-500/30", glow: "from-emerald-500/20" },
  { text: "text-purple-400", border: "group-hover:border-purple-500/30", glow: "from-purple-500/20" },
  { text: "text-pink-400", border: "group-hover:border-pink-500/30", glow: "from-pink-500/20" },
  { text: "text-amber-400", border: "group-hover:border-amber-500/30", glow: "from-amber-500/20" },
];

// The Main Resolver Function
const resolveCategoryStyle = (name: string, index: number) => {
  const lowerName = name.toLowerCase();

  // 1. Icon Logic
  let icon = ICONS.cube; // Default
  if (lowerName.includes("tech") || lowerName.includes("computer") || lowerName.includes("electr")) icon = ICONS.tech;
  else if (lowerName.includes("cloth") || lowerName.includes("fashion") || lowerName.includes("wear")) icon = ICONS.clothing;
  else if (lowerName.includes("health") || lowerName.includes("beauty") || lowerName.includes("life")) icon = ICONS.health;
  else if (lowerName.includes("home") || lowerName.includes("garden") || lowerName.includes("decor")) icon = ICONS.home;
  else if (lowerName.includes("book") || lowerName.includes("read") || lowerName.includes("educat")) icon = ICONS.books;
  else if (lowerName.includes("art") || lowerName.includes("design")) icon = ICONS.art;
  else {
    // If unknown, cycle through generic cool shapes based on index
    const generics = [ICONS.star, ICONS.sparkle, ICONS.cube];
    icon = generics[index % generics.length];
  }

  // 2. Color Logic (Deterministic based on index to keep grid colorful but consistent)
  const theme = THEMES[index % THEMES.length];

  return { icon, theme };
};


interface FeaturedCategoriesSectionProps {
  StoreCategory: IStoreCategory[];
}

const FeaturedCategoriesSection = ({ StoreCategory }: FeaturedCategoriesSectionProps) => {

  const itemsToShow = useMemo(() => {
    let rawItems: any[] = [];
    
    // Determine source data
    if (Array.isArray(StoreCategory) && StoreCategory.length > 0) {
      if (StoreCategory.length < 5) {
        // Case: Subcategories
        rawItems = StoreCategory.flatMap((cat) => cat.subcategories || []).map(sub => ({
          displayName: sub.name,
          count: null
        }));
      } else {
        // Case: Main Categories
        rawItems = StoreCategory.map((cat) => ({
          displayName: cat.displayName,
          count: "" // or cat.count if available
        }));
      }
    } else {
      // Mock Fallback
      rawItems = [
        { displayName: "Technology", count: 120 },
        { displayName: "Fashion", count: 85 },
        { displayName: "Home & Garden", count: 40 },
        { displayName: "Health", count: 32 },
        { displayName: "Books", count: 15 },
        { displayName: "Art", count: 9 },
      ];
    }

    // Map the raw items to include the resolved styling
    return rawItems.slice(0, 12).map((item, idx) => {
      const { icon, theme } = resolveCategoryStyle(item.displayName || "", idx);
      return { ...item, icon, theme };
    });

  }, [StoreCategory]);

  // ---------------------------------------------------------
  // VARIANTS
  // ---------------------------------------------------------
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring", stiffness: 90, damping: 14 }
    },
  };

  return (
    <section className="relative py-24 bg-slate-950 font-sans overflow-hidden">
      {/* Background Ambient Light */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
            Browse by Category
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-teal-400 mx-auto rounded-full mb-6"/>
          <p className="text-lg text-slate-400">
            Discover your next favorite item from our wide range of collections.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {itemsToShow.map((item, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="group relative h-full"
            >
              {/* Glass Card */}
              <div className={`
                h-full relative flex flex-col items-center justify-center p-6 rounded-2xl 
                bg-slate-900/40 border border-white/5 
                backdrop-blur-md transition-all duration-500 
                hover:bg-slate-800/60 hover:shadow-xl hover:-translate-y-2
                ${item.theme.border}
              `}>
                
                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.theme.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                {/* Icon Circle */}
                <div className="relative z-10 mb-4">
                  <div className={`
                    w-14 h-14 rounded-full flex items-center justify-center 
                    bg-slate-800 shadow-inner border border-white/5 
                    group-hover:scale-110 transition-transform duration-300
                    ${item.theme.text}
                  `}>
                    {item.icon}
                  </div>
                </div>

                {/* Text */}
                <div className="relative z-10 text-center">
                  <h4 className="font-bold text-slate-200 text-sm sm:text-base group-hover:text-white transition-colors">
                    {item.displayName}
                  </h4>
                  {item.count && (
                    <span className="block mt-1 text-xs font-medium text-slate-500 group-hover:text-slate-400">
                      {item.count} products
                    </span>
                  )}
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Simple CTA */}
        <div className="mt-16 text-center">
          <a href="/categories" className="text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-indigo-500 pb-1">
            View All Categories
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategoriesSection;