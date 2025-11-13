"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/20/solid"; // Added FunnelIcon
import clsx from "clsx";
import { IStoreCategory } from "@/types/typings";
import { IFilters } from "../HeroSection";

interface TrendingLocation {
  name: string;
  slug?: string;
}



interface FilterBarSectionProps {
  store?: { StoreCategory?: IStoreCategory[] } | null;
  trendingLocations?: TrendingLocation[];
  filters: Partial<IFilters>; // Use the explicit interface
  setFilters: (filters: Partial<IFilters>) => void;
  onSearch: (e: React.FormEvent) => void;
}

// --- Reusable Filter Input Component ---
const FilterInput: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  options?: TrendingLocation[] | IStoreCategory[];
}> = ({ label, value, onChange, type = "text", options }) => {
  const inputStyle =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out";
  const selectStyle =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out cursor-pointer";

  if (options && options.length > 0) {
    return (
      <div className="relative">
        <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={selectStyle}>
          <option value="">{label}</option>
          {options.map((item) => (
            <option key={('id' in item ? item.id : item.slug || item.name)} value={('displayName' in item ? item.displayName || "" : "")}>
              {'displayName' in item ? item.displayName : "item.name"}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    );
  }

  return (
    <input
      type={type}
      placeholder={label}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={inputStyle}
    />
  );
};


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

  const handleSetFilters = (key: keyof IFilters, value: string | boolean) => {
    setFilters({ ...filters, [key]: value });
  };
  
  // Default isBuy to true if undefined
  const isBuy = filters.isBuy ?? true; 

  return (
    <motion.form
      onSubmit={onSearch}
      initial="hidden"
      animate="visible"
      variants={filterBarVariants}
      className="sticky top-0 z-40 bg-white shadow-lg px-4 py-3 rounded-b-2xl md:rounded-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        
        {/* --- ROW 1: PRIMARY FILTERS (Mobile Compact) --- */}
        <div className="flex items-stretch justify-between gap-3">
          
          {/* 1. Toggle Buy / Rent */}
          <div className="flex items-center flex-shrink-0 gap-2">
            <button
              type="button"
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out",
                isBuy
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              onClick={() => handleSetFilters('isBuy', true)}
            >
              Buy
            </button>
            <button
              type="button"
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out",
                !isBuy
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
              onClick={() => handleSetFilters('isBuy', false)}
            >
              Rent
            </button>
          </div>

          {/* 2. Location (Primary Mobile Filter) */}
          <div className="hidden md:block flex-1">
             <FilterInput
                label="Location"
                value={filters.location || ''}
                onChange={(v) => handleSetFilters('location', v)}
                options={trendingLocations}
              />
          </div>

          {/* 3. Mobile/Tablet Collapse Button */}
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center justify-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-blue-600 border border-gray-300 hover:bg-blue-50 transition duration-200 ease-in-out md:hidden flex-shrink-0"
          >
            <FunnelIcon className="w-5 h-5" />
            {showMobileFilters ? "Hide" : "More"} Filters
          </button>
          
          {/* 4. Apply Button (Always Visible) */}
          <button
            type="submit"
            className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0"
          >
            Apply Filters
          </button>
        </div>

        {/* --- ROW 2: DESKTOP FULL GRID --- */}
        {/* This row uses a compact 4-column layout for better desktop space utilization */}
        <div className="hidden md:grid grid-cols-4 gap-3"> 
           {/* Location is already here for desktop view */}
            <div className="col-span-1">
             <FilterInput
                label="Location"
                value={filters.location || ''}
                onChange={(v) => handleSetFilters('location', v)}
                options={trendingLocations}
              />
            </div>
          
            <div className="col-span-1">
              <FilterInput
                label="Vehicle Type"
                value={filters.vehicleType || ''}
                onChange={(v) => handleSetFilters('vehicleType', v)}
                options={categories}
              />
            </div>

            <div className="col-span-1 grid grid-cols-2 gap-3">
              <FilterInput
                label="Min Price"
                value={filters.minPrice || ''}
                onChange={(v) => handleSetFilters('minPrice', v)}
                type="number"
              />
              <FilterInput
                label="Max Price"
                value={filters.maxPrice || ''}
                onChange={(v) => handleSetFilters('maxPrice', v)}
                type="number"
              />
            </div>

             <div className="col-span-1 grid grid-cols-2 gap-3">
                 <FilterInput
                    label="Year"
                    value={filters.year || ''}
                    onChange={(v) => handleSetFilters('year', v)}
                    type="number"
                  />
                  {/* Empty slot or small button if needed */}
             </div>
        </div>

        {/* --- Mobile Collapsible Panel --- */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={mobileFiltersVariants}
              className="md:hidden pt-3 border-t border-gray-200 space-y-3 overflow-hidden"
            >
              {/* Note: Location is deliberately excluded as it's in the top row */}

              <FilterInput
                label="Min Price"
                value={filters.minPrice || ''}
                onChange={(v) => handleSetFilters('minPrice', v)}
                type="number"
              />
              <FilterInput
                label="Max Price"
                value={filters.maxPrice || ''}
                onChange={(v) => handleSetFilters('maxPrice', v)}
                type="number"
              />
              
              <FilterInput
                label="Vehicle Type"
                value={filters.vehicleType || ''}
                onChange={(v) => handleSetFilters('vehicleType', v)}
                options={categories}
              />

              <FilterInput
                label="Year"
                value={filters.year || ''}
                onChange={(v) => handleSetFilters('year', v)}
                type="number"
              />
              
              {/* Separate Apply button for mobile panel for clear action */}
              <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition duration-300 ease-in-out shadow-md"
              >
                  Apply Filters
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}