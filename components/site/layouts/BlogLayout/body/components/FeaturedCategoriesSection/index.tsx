"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";
import { IStoreCategory } from "@/types/typings";

// ---------------------------------------------------------
// 1. ICON MAPPING UTILITIES
// ---------------------------------------------------------

const ICONS = {
  tech: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  clothing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  health: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  home: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  books: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  art: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  star: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  sparkle: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  cube: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
};

const resolveCategoryStyle = (name: string, index: number) => {
  const lowerName = name.toLowerCase();
  let icon = ICONS.cube;

  if (lowerName.includes("tech") || lowerName.includes("computer") || lowerName.includes("electr")) icon = ICONS.tech;
  else if (lowerName.includes("cloth") || lowerName.includes("fashion") || lowerName.includes("wear")) icon = ICONS.clothing;
  else if (lowerName.includes("health") || lowerName.includes("beauty") || lowerName.includes("life")) icon = ICONS.health;
  else if (lowerName.includes("home") || lowerName.includes("garden") || lowerName.includes("decor")) icon = ICONS.home;
  else if (lowerName.includes("book") || lowerName.includes("read") || lowerName.includes("educat")) icon = ICONS.books;
  else if (lowerName.includes("art") || lowerName.includes("design")) icon = ICONS.art;
  else {
    const generics = [ICONS.star, ICONS.sparkle, ICONS.cube];
    icon = generics[index % generics.length];
  }

  return { icon };
};

interface FeaturedCategoriesSectionProps {
  StoreCategory: IStoreCategory[];
}

const FeaturedCategoriesSection = ({ StoreCategory }: FeaturedCategoriesSectionProps) => {
  const { storeFormData } = useStoreContext() || {};
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";

  const itemsToShow = useMemo(() => {
    let rawItems: any[] = [];
    
    if (Array.isArray(StoreCategory) && StoreCategory.length > 0) {
      if (StoreCategory.length < 5) {
        rawItems = StoreCategory.flatMap((cat) => cat.subcategories || []).map(sub => ({
          displayName: sub.name,
          count: null
        }));
      } else {
        rawItems = StoreCategory.map((cat) => ({
          displayName: cat.displayName,
          count: ""
        }));
      }
    } else {
      rawItems = [
        { displayName: "Technology", count: 120 },
        { displayName: "Fashion", count: 85 },
        { displayName: "Home & Garden", count: 40 },
        { displayName: "Health", count: 32 },
        { displayName: "Books", count: 15 },
        { displayName: "Art", count: 9 },
      ];
    }

    return rawItems.slice(0, 12).map((item, idx) => {
      const { icon } = resolveCategoryStyle(item.displayName || "", idx);
      return { ...item, icon };
    });
  }, [StoreCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
  };

  return (
    <section className="w-full bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* ===== TOP DESCRIPTIVE HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-slate-900">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase mb-2">
              Browse Collections
            </h2>
            <p className="text-sm text-slate-400 font-normal">
              Select a specialized category to filter premium available assets and inventories.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <a 
              href="/blog/categories" 
              className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              View All Categories
              <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* ===== CATEGORIES GRID INTERFACE ===== */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-slate-900 border border-slate-900 rounded-lg overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-20px" }}
        >
          {itemsToShow.map((item, idx) => {
            const [isHovered, setIsHovered] = React.useState(false);

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-slate-950 p-6 flex flex-col items-start justify-between min-h-[160px] relative transition-colors duration-200 group cursor-pointer"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  borderBottom: isHovered ? `2px solid ${primaryColor}` : '2px solid transparent',
                  marginBottom: '-2px' // Resolves shifts from changing borders cleanly
                }}
                onClick={() => {
                    const categorySlug = item.category?.id || item.categoryId || item.displayName?.toLowerCase().replace(/\s+/g, '-');
                    window.location.href = `/blog/listings?category=${categorySlug}`;
                  }
                }
              >
                {/* Upper Metric and Frame Action Icon Wrapper */}
                <div className="w-full flex items-center justify-between text-slate-400 group-hover:text-white transition-colors">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {item.icon}
                  </div>
                  <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>

                {/* Lower Identity Text Blocks */}
                <div className="mt-6 w-full">
                  <h3 className="font-semibold text-slate-200 text-sm tracking-wide group-hover:text-white transition-colors truncate">
                    {item.displayName}
                  </h3>
                  {item.count ? (
                    <span className="block text-xs font-mono text-slate-500 mt-1 uppercase tracking-tight">
                      {item.count} Items
                    </span>
                  ) : (
                    <span className="block text-xs font-mono text-slate-500 mt-1 uppercase tracking-tight">
                      Explore
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
};

export default FeaturedCategoriesSection;