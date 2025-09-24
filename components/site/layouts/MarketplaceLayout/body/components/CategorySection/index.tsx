"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { IStoreCategory, StoreForm } from "@/types/typings";

export interface CategoryCarouselProps {
  storeFormData: StoreForm | null;
}

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 10 },
  },
};

export default function CategoryCarousel({ storeFormData }: CategoryCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const { clientWidth, scrollLeft } = carouselRef.current;
    const delta = dir === "left" ? -clientWidth * 0.7 : clientWidth * 0.7;
    carouselRef.current.scrollTo({ left: scrollLeft + delta, behavior: "smooth" });
  };

  // Map store categories or fallback
  const cats: IStoreCategory[] =
    storeFormData?.StoreCategory?.length
      ? storeFormData.StoreCategory
      : [
          { id: "1", displayName: "Bags", icon: "👜", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
          { id: "2", displayName: "Sneakers", icon: "👟", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
          { id: "3", displayName: "Watches", icon: "⌚", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
          { id: "4", displayName: "Audio", icon: "🎧", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
          { id: "5", displayName: "Tech", icon: "💻", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
          { id: "6", displayName: "Sunglasses", icon: "🕶️", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
          { id: "7", displayName: "Apparel", icon: "👕", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
          { id: "8", displayName: "Books", icon: "📚", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
          { id: "9", displayName: "Travel", icon: "✈️", categoryId : '', sortOrder: 0, visible: true, subcategories: [], allBrands:[] },
        ];

  return (
    <section className="relative py-20 bg-gray-50 text-gray-900 overflow-hidden">
      {/* Background Radial Gradient */}
      <div className="absolute inset-0 z-0 radial-gradient-to-br from-gray-200 to-transparent opacity-50 blur-xl" />

      <div className="container mx-auto relative px-4 z-10">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700">
            Explore Top Categories
          </span>
        </motion.h2>

        {/* Carousel */}
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
            className="absolute left-0 top-1/2 -translate-y-1/2 transform bg-white/60 backdrop-blur-sm p-3 rounded-full shadow-lg z-20 transition hover:scale-110 hover:bg-gray-200/80"
            aria-label="Previous category"
          >
            <ChevronLeftIcon className="h-7 w-7 text-gray-600" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 transform bg-white/60 backdrop-blur-sm p-3 rounded-full shadow-lg z-20 transition hover:scale-110 hover:bg-gray-200/80"
            aria-label="Next category"
          >
            <ChevronRightIcon className="h-7 w-7 text-gray-600" />
          </button>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-8 px-4 py-6 scrollbar-hide snap-x snap-mandatory"
          >
            {cats.map((c) => {
              const categoryName = c.displayName || c.category?.name || "Category";
              return (
                <motion.div
                  key={c.id}
                  className="snap-center flex-shrink-0 w-48"
                  variants={itemVariants}
                >
                  <a href={`/shop?category=${encodeURIComponent(categoryName.toLowerCase())}`}>
                    <motion.div
                      className="flex flex-col items-center p-8 bg-white/50 rounded-3xl border border-gray-200 backdrop-blur-lg cursor-pointer"
                      whileHover={{
                        scale: 1.05,
                        y: -8,
                        boxShadow: "0px 15px 30px rgba(0,0,0,0.1)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      {/* Icon handling */}
                      <motion.div
                        className="w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-gradient-to-tr from-blue-500 to-purple-600 shadow-xl"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {c.icon?.startsWith("http") ? (
                          <img
                            src={c.icon}
                            alt={categoryName}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <span>{c.icon || "📦"}</span>
                        )}
                      </motion.div>

                      <span className="mt-8 text-lg font-bold text-gray-800 text-center">
                        {categoryName}
                      </span>
                    </motion.div>
                  </a>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .radial-gradient-to-br {
          background-image: radial-gradient(
            circle at top left,
            var(--tw-gradient-from),
            var(--tw-gradient-to)
          );
        }
      `}</style>
    </section>
  );
}
