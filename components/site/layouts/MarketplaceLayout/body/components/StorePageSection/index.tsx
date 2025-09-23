"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

export default function StorePage() {
  const { storeFormData } = useStoreContext();

  // Destructure live data with fallbacks
  const {
    StoreCategory = [],
    marketplaceListings = [],
    themeSettings = {},
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || "#f97316";
  const secondary = themeSettings?.secondaryColor || "#3b82f6";

  const [activeFilters, setActiveFilters] = useState<{
    category: string | null;
    brand: string | null;
  }>({ category: null, brand: null });

  // Filter logic
  const filteredProducts = useMemo(() => {
    return marketplaceListings?.filter((p) => {
      if (activeFilters.category && p.category !== activeFilters.category) return false;
      if (activeFilters.brand && p.brand !== activeFilters.brand) return false;
      return true;
    });
  }, [marketplaceListings, activeFilters]);

  const clearFilters = () => setActiveFilters({ category: null, brand: null });

  const handleCategoryClick = (categoryName: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      category: prev.category === categoryName ? null : categoryName,
      brand: null, // reset brand when switching categories
    }));
  };

  const handleBrandClick = (brandName: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      brand: prev.brand === brandName ? null : brandName,
    }));
  };

  return (
    <div className="relative min-h-screen py-12 px-4 md:px-8 bg-gray-100 text-gray-800 overflow-hidden">
      {/* Background Radial Gradient */}
      <div className="absolute inset-0 z-0 radial-gradient-to-br from-gray-200 to-transparent opacity-50 blur-xl" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-12">
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r"
            style={{ backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})` }}
          >
            Our Products
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <motion.aside
            className="lg:col-span-1 p-6 space-y-8 rounded-3xl backdrop-blur-md bg-white/30 border border-gray-200 h-fit lg:sticky top-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Filters</h2>

            <AnimatePresence>
              {(activeFilters.category || activeFilters.brand) && (
                <motion.button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors py-2 px-4 rounded-full border border-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <TrashIcon className="h-4 w-4" />
                  Clear All Filters
                </motion.button>
              )}
            </AnimatePresence>

            {/* Categories */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-gray-900">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {StoreCategory.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.displayName || "")}
                    className={`py-2 px-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 
                      ${activeFilters.category === cat.displayName
                        ? `text-white shadow-md`
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    style={
                      activeFilters.category === cat.displayName
                        ? { backgroundColor: primary }
                        : {}
                    }
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
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="font-bold text-lg mt-4 mb-4 text-gray-900">Brands</h3>
                  <div className="flex flex-wrap gap-2">
                    {StoreCategory.find((c) => c.displayName === activeFilters.category)
                      ?.allBrands.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => handleBrandClick(brand)}
                          className={`py-2 px-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105
                            ${activeFilters.brand === brand
                              ? `text-white shadow-md`
                              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                          style={
                            activeFilters.brand === brand
                              ? { backgroundColor: secondary }
                              : {}
                          }
                        >
                          {brand}
                        </button>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {filteredProducts && filteredProducts.length > 0 ? (
                <motion.div
                  key="products"
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } },
                  }}
                >
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="group cursor-pointer transform hover:-translate-y-2 transition-transform duration-300"
                    >
                      <div className="relative overflow-hidden flex flex-col items-center p-6 shadow-xl rounded-2xl backdrop-blur-lg bg-white/50 border border-gray-200">
                        <img
                          src={product.images?.[0]?.url || "https://placehold.co/200x200/52525B/ffffff?text=Image"}
                          alt={product.name}
                          className="h-40 w-full object-contain mb-4 transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="text-center mt-2 w-full">
                          <h4 className="font-semibold text-xl text-gray-900 mb-1">
                            {product.name}
                          </h4>
                          <p className="text-sm text-gray-600">{product.brand}</p>
                          <p className="font-extrabold text-2xl mt-4" style={{ color: primary }}>
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
                  <p className="text-sm mt-2">Try adjusting your filters.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
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
    </div>
  );
}
