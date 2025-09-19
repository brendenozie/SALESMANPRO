"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
// import Link from "next/link"; // Removed to fix the compilation error
import { IStoreCategory, StoreForm } from "@/types/typings";

export interface CategoryCarouselProps {
  storeFormData: StoreForm | null;
}

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

export default function CategoryCarousel({ storeFormData }: CategoryCarouselProps) {
  const carouselRef = useRef(null);

  // Scroll handler for the carousel
  const scroll = (dir) => {
    if (!carouselRef.current) return;
    const { clientWidth, scrollLeft } = carouselRef.current;
    const delta = dir === "left" ? -clientWidth * 0.7 : clientWidth * 0.7;
    carouselRef.current.scrollTo({ left: scrollLeft + delta, behavior: "smooth" });
  };

  // Use categories from storeFormData or a compelling fallback
  const cats =
    storeFormData?.StoreCategory?.length
      ? storeFormData.StoreCategory
      : [
          { id: "1", displayName: "Bags", icon: "👜" },
          { id: "2", displayName: "Sneakers", icon: "👟" },
          { id: "3", displayName: "Watches", icon: "⌚" },
          { id: "4", displayName: "Audio", icon: "🎧" },
          { id: "5", displayName: "Tech", icon: "💻" },
          { id: "6", displayName: "Sunglasses", icon: "🕶️" },
          { id: "7", displayName: "Apparel", icon: "👕" },
          { id: "8", displayName: "Books", icon: "📚" },
          { id: "9", displayName: "Travel", icon: "✈️" },
        ];

  return (
    <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute -top-20 -left-20 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto relative px-4">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center text-gray-900 dark:text-gray-50 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Explore Top Categories
        </motion.h2>

        {/* Carousel Container */}
        <motion.div
          className="relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 transform bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-full shadow-lg z-10 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 animate-pulse-once"
            aria-label="Previous category"
          >
            <ChevronLeftIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 transform bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-3 rounded-full shadow-lg z-10 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 animate-pulse-once"
            aria-label="Next category"
          >
            <ChevronRightIcon className="h-7 w-7 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Carousel */}
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-8 px-4 py-6 scrollbar-hide snap-x snap-mandatory"
          >
            {cats.map((c) => (
              <motion.div
                key={c.id}
                className="snap-center flex-shrink-0 w-44"
                variants={itemVariants}
              >
                <a href={`/shop?category=${c.displayName?.toLowerCase()}`}>
                  <motion.div
                    className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 cursor-pointer"
                    whileHover={{ scale: 1.05, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <motion.div
                      className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-4xl text-blue-600 dark:text-blue-300 shadow-md"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {c.icon}
                    </motion.div>
                    <span className="mt-6 text-lg font-bold text-gray-800 dark:text-gray-100 text-center">
                      {c.displayName}
                    </span>
                  </motion.div>
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
