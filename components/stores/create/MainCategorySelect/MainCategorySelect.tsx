"use client";

import React, { useState, useMemo, ChangeEvent } from "react";
import { MagnifyingGlassIcon, XMarkIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface CategoryVariant {
  name: string;
  link: string;
  description: string;
  tag: "New" | "Popular" | "Standard" | "Recommended" | "Trending" | "Featured" | "Limited" | "Exclusive" | "Best Seller" | "Top Rated" | "Editor's Choice" | "Customer Favorite" | "Hot" | "Must Have" | "Essential" | "Premium" | "Advanced" | "Professional" | "Ultimate";
  desktopPreviewImage?: string;
  mobilePreviewImage?: string;
}

interface Category {
  name: string;
  icon?: string;
  variants: CategoryVariant[];
}

export interface CategorySelectProps {
  siteCategories: Category[];
  category: string;
  variant?: string | null | undefined;
  next?: () => void;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export default function MainCategorySelect({
  siteCategories = [],
  category,
  variant,
  next,
  handleChange,
}: CategorySelectProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(
    () => (siteCategories || []).filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search, siteCategories]
  );

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-10 w-full max-w-6xl mx-auto py-4"
    >
      <header className="text-center space-y-3 max-w-2xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight"
        >
          Select your <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Industry</span>
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg"
        >
          Choose the category that best fits your business so we can customize the right setup and templates for you.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-lg mx-auto mt-6 group"
        >
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search categories (e.g., Online Store, Agency, SaaS...)"
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      </header>

      <motion.div 
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {filteredCategories.map((cat, idx) => {
          const isSelected = cat.name === category;

          return (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.04, 0.3), ease: "easeOut" }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                handleChange({ target: { name: 'category', value: cat.name } } as any);
                if (next) next();
              }}
              className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center text-center group min-h-[140px] cursor-pointer ${
                isSelected
                  ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10"
                  : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 shadow-sm hover:shadow-md"
              }`}
            >
              {isSelected && (
                <span className="absolute top-3 right-3 text-indigo-600 dark:text-indigo-400">
                  <CheckCircleIcon className="h-5 w-5" />
                </span>
              )}

              <span className="text-4xl mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 transform-gpu">
                {cat.icon || '💼'}
              </span>
              
              <span className={`font-bold text-xs sm:text-sm tracking-tight uppercase ${
                isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-800 dark:text-zinc-200"
              }`}>
                {cat.name}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {filteredCategories.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center py-12 text-zinc-500 dark:text-zinc-400 space-y-2"
        >
          <p className="text-base font-medium">No categories match "{search}"</p>
          <p className="text-xs text-zinc-400">Try searching for a different keyword or clear your search.</p>
        </motion.div>
      )}
    </motion.div>
  );
}