// components/FilterSidebar.jsx
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StoreForm } from "@/types/typings";

const buttonVariants = {
  default: "bg-gray-800 text-white shadow-sm ring-2 ring-gray-800",
  outline: "bg-gray-100 text-gray-800 ring-2 ring-transparent hover:bg-gray-200",
};

export function FilterSidebar({
  storeFormData,
  activeFilters,
  setActiveFilters,
}: {
  storeFormData: StoreForm;
  activeFilters: { category: string | null; brand: string | null };
  setActiveFilters: React.Dispatch<
    React.SetStateAction<{ category: string | null; brand: string | null }>
  >;
}) {
  const clearFilters = () => {
    setActiveFilters({ category: null, brand: null });
  };

  return (
    <aside className="w-64 p-6 space-y-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Clear All Filters */}
      {(activeFilters.category || activeFilters.brand) && (
        <motion.button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.035 21H7.965a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear All
        </motion.button>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {storeFormData?.StoreCategory.map((cat) => (
            <button
              key={cat.id}
              className={`py-2 px-4 rounded-full font-medium transition-all duration-20
                ${activeFilters.category === cat.displayName
                  ? buttonVariants.default
                  : buttonVariants.outline}
                `
              }
              // onClick={() =>
              //   setActiveFilters((prev) => ({
              //     ...prev,
              //     category: prev.category === cat.displayName ? null : cat.displayName,
              //     brand: null,
              //   }))
              // }
            >
              {cat.displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Brands (dependent on selected category) */}
      <AnimatePresence>
        {activeFilters.category && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">Brands</h3>
            <div className="flex flex-wrap gap-2">
              {storeFormData.StoreCategory
                .find((c) => c.displayName === activeFilters.category)
                ?.allBrands.map((brand) => (
                  <button
                    key={brand}
                    className={`
                      py-2 px-4 rounded-full font-medium transition-all duration-200
                      ${activeFilters.brand === brand
                        ? buttonVariants.default
                        : buttonVariants.outline
                      }
                    `}
                    onClick={() =>
                      setActiveFilters((prev) => ({
                        ...prev,
                        brand: prev.brand === brand ? null : brand,
                      }))
                    }
                  >
                    {brand}
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}