"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStateContext } from "@/contexts/ContextProvider";
import DishCard from "./DishCard";

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=80`;

export default function SignatureDishes({
  marketplaceListings = [],
  StoreCategory = [],
  themeSettings,
}: any) {
  
  const [activeCategory, setActiveCategory] = useState("all-menu");

  const primaryColor = themeSettings?.primaryColor || "#FF5722";

  const categories = useMemo(() => {
    return [
      { id: "all-menu", displayName: "Full Menu" },
      ...StoreCategory.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    ];
  }, [StoreCategory]);

  const filteredDishes = useMemo(() => {
    if (activeCategory === "all-menu") return marketplaceListings;
    return marketplaceListings.filter((dish) => dish.category?.categoryId === activeCategory);
  }, [activeCategory, marketplaceListings]);

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- HEADER STRATEGY --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="h-px w-8 bg-zinc-300 dark:bg-zinc-700" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Chef's Selection</span>
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-serif italic text-zinc-900 dark:text-white tracking-tighter leading-none">
              Signature <span style={{ color: primaryColor }}>Dishes</span>
            </h2>
          </div>

          {/* Premium Category Scroller */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.categoryId || cat.category.id || "all-menu")}
                className={`whitespace-nowrap px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
                  activeCategory === cat.id 
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white" 
                  : "bg-transparent text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300"
                }`}
              >
                {cat.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* --- MENU GRID --- */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredDishes.map((dish, idx) => (
              <DishCard 
                dish={dish} 
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

