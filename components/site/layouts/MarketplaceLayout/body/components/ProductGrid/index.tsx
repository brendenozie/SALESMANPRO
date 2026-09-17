// components/ProductGrid.jsx
"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoreForm } from "@/types/typings";

export function ProductGrid({
  storeFormData,
  activeFilters,
}: {
  storeFormData: StoreForm;
  activeFilters: { category: string | null; brand: string | null };
}) {
  const filteredProducts = useMemo(() => {
    return storeFormData.marketplaceListings?.filter((p) => {
      if (activeFilters.category && p.category !== activeFilters.category) return false;
      if (activeFilters.brand && p.brand !== activeFilters.brand) return false;
      return true;
    });
  }, [storeFormData, activeFilters]);

  return (
    <div className="flex-1">
      <AnimatePresence mode="wait">
        {filteredProducts && filteredProducts.length > 0 ? (
          <motion.div
            key="products"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full [contain:layout_style]"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="group cursor-pointer" // A little extra interactivity
              >
                <div className="p-6 flex flex-col items-center justify-center shadow-lg rounded-2xl bg-white dark:bg-gray-800 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-xl">
                  <img
                    src={product.images?.[0]?.url || ""}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="h-36 object-contain mb-4"
                  />
                  <div className="text-center mt-2">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                    <p className="font-extrabold text-xl mt-4 text-green-600">
                      ${product.finalPrice}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg">No products found.</p>
            <p className="text-sm mt-2">Try adjusting your filters or search terms.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}