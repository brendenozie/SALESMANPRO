"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  StarIcon,
  ShoppingBagIcon,
  EyeIcon,
  MinusIcon,
  PlusIcon,
  FireIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { useStateContext } from "@/contexts/ContextProvider";

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=80`;

export default function SignatureDishes({
  marketplaceListings = [],
  StoreCategory = [],
  themeSettings,
}: any) {
  const { cart, addToCart, decreaseQuantity } = useStateContext();
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
                onClick={() => setActiveCategory(cat.id)}
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
                key={dish.id} 
                dish={dish} 
                idx={idx} 
                primaryColor={primaryColor} 
                quantity={cart.find((item: any) => item.id === dish.id)?.quantity || 0}
                onAdd={() => addToCart(dish)}
                onSub={() => decreaseQuantity(dish.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function DishCard({ dish, idx, primaryColor, quantity, onAdd, onSub }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: idx * 0.05 }}
      className="group relative flex flex-col bg-zinc-50 dark:bg-zinc-900/40 rounded-[2.5rem] p-4 border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-500"
    >
      {/* Image Core */}
      <div className="relative aspect-[16/11] w-full rounded-[2rem] overflow-hidden mb-6">
        <Image
          src={dish.images?.[0] || "/placeholder-food.jpg"}
          alt={dish.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loader={loader}
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <FireIcon className="w-3 h-3 text-orange-500" />
                <span className="text-[9px] font-black uppercase text-zinc-900">Popular</span>
            </div>
        </div>

        {/* Quick Actions Hover Overlay */}
        <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button 
                onClick={() => window.open(`/restaurent/products/${dish.id}`, '_blank')}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 shadow-xl hover:scale-110 transition-transform">
                <EyeIcon className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl hover:scale-110 transition-transform">
                <HeartOutlineIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 pb-2 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tighter leading-tight">
                {dish.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                <StarIcon className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">4.9</span>
            </div>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-6 font-medium">
            {dish.description || "Indulge in our chef's hand-crafted masterpiece using only the finest seasonal ingredients."}
        </p>

        <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-1.5 text-zinc-400">
                <ClockIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">15-20 min</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-zinc-300" />
            <div className="text-xl font-black text-zinc-900 dark:text-white">
                <span className="text-xs font-bold mr-1 text-zinc-400">KSh</span>
                {dish.finalPrice?.toLocaleString()}
            </div>
        </div>

        {/* --- DYNAMIC ACTION POD --- */}
        <div className="mt-auto">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div 
                key="qty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between bg-zinc-900 dark:bg-white rounded-2xl p-1.5 shadow-xl shadow-zinc-900/20"
              >
                <button onClick={onSub} className="p-3 text-white dark:text-zinc-900 hover:bg-white/10 dark:hover:bg-zinc-100 rounded-xl transition-colors">
                  <MinusIcon className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-white dark:text-zinc-900">{quantity}</span>
                    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter">In Cart</span>
                </div>
                <button onClick={onAdd} className="p-3 text-white dark:text-zinc-900 hover:bg-white/10 dark:hover:bg-zinc-100 rounded-xl transition-colors">
                  <PlusIcon className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="add"
                whileTap={{ scale: 0.97 }}
                onClick={onAdd}
                className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-2xl transition-all"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                Order Dish
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}