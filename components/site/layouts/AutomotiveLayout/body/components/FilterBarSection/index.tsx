"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { IStoreCategory } from "@/types/typings";

interface TrendingLocation {
  name: string;
  slug?: string;
}

interface FilterBarSectionProps {
  store?: { StoreCategory?: IStoreCategory[] } | null;
  trendingLocations?: TrendingLocation[];
  filters: any;
  setFilters: (filters: any) => void;
  onSearch: (e: React.FormEvent) => void;
}

export default function FilterBarSection({
  store,
  trendingLocations = [],
  filters,
  setFilters,
  onSearch,
}: FilterBarSectionProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = store?.StoreCategory ?? [];

  const filterBarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const mobileFiltersVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const inputStyle =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out";
  const selectStyle =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out cursor-pointer";

  return (
    <motion.form
      onSubmit={onSearch}
      initial="hidden"
      animate="visible"
      variants={filterBarVariants}
      className="sticky top-0 z-40 bg-white shadow-lg px-4 py-4 md:py-3 rounded-b-2xl md:rounded-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Toggle Buy / Rent */}
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <button
            type="button"
            className={clsx(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out",
              // filters.isBuy
              //   ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
              //   : 
                "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => setFilters({ ...filters, isBuy: true })}
          >
            Buy
          </button>
          <button
            type="button"
            className={clsx(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out",
              // !filters.isBuy
              //   ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
              //   : 
                "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => setFilters({ ...filters, isBuy: false })}
          >
            Rent
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-grow w-full">
          {/* Location */}
          <div className="relative">
            <select
              value={""}
              // filters.location || 
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className={selectStyle}
            >
              <option value="">Location</option>
              {trendingLocations.map((loc) => (
                <option key={loc.slug || loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Min Price */}
          <input
            type="number"
            placeholder="Min Price"
            value={""}
            // filters.minPrice || 
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className={inputStyle}
          />

          {/* Max Price */}
          <input
            type="number"
            placeholder="Max Price"
            value={""}
            // filters.maxPrice || 
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className={inputStyle}
          />

          {/* Vehicle Type */}
          <div className="relative">
            <select
              value={""}
              // filters.vehicleType || 
              onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
              className={selectStyle}
            >
              <option value="">Vehicle Type</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.displayName||''}>
                  {cat.displayName}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Year */}
          <input
            type="number"
            placeholder="Year (e.g., 2020)"
            value={""}
            // filters.year || 
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className={inputStyle}
          />
        </div>

        {/* Apply Button */}
        <div className="flex items-center gap-3 mt-3 md:mt-0 w-full md:w-auto justify-between md:justify-start">
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
          >
            More Filters <ChevronDownIcon className="w-4 h-4" />
          </button>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Panel */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={mobileFiltersVariants}
            className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3 overflow-hidden"
          >
            {/* Duplicate filter fields for mobile */}
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice || ""}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className={inputStyle}
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice || ""}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className={inputStyle}
            />
            <div className="relative">
              <select
                value={filters.vehicleType || ""}
                onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
                className={selectStyle}
              >
                <option value="">Vehicle Type</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.displayName||''}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <input
              type="number"
              placeholder="Year"
              value={filters.year || ""}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className={inputStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
