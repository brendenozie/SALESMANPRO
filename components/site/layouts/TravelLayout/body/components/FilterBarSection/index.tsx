// FilterBar.tsx
"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Dummy data for filter options
const travelTypes = [
  "Adventure",
  "Relaxation",
  "Cultural",
  "Business",
  "Family",
  "Road Trip",
];

const regions = [
  "North America",
  "Europe",
  "Asia",
  "Africa",
  "South America",
  "Oceania",
];

// Reusable animation variants
const dropdownVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

/**
 * Enhanced FilterBar component with an intuitive and modern design.
 * - Replaces dropdowns with interactive "pill" buttons.
 * - Uses a cleaner, more spacious layout.
 * - Features refined hover and tap animations.
 */
export default function FilterBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [price, setPrice] = useState(2500);

  const handleApplyFilters = () => {
    console.log({ selectedTypes, selectedRegion, date, guests, price });
    alert("Applying filters! (Check console for data)");
    setIsExpanded(false); // Collapse the bar after applying filters
  };

  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSelectedRegion("");
    setDate("");
    setGuests(2);
    setPrice(2500);
    alert("Filters cleared!");
  };

  const toggleTravelType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-lg shadow-lg px-4 py-4 border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Advanced Filters
          </h2>
          <motion.button
            onClick={toggleExpansion}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-gray-800 rounded-full text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm hover:bg-indigo-100 dark:hover:bg-gray-700 transition duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isExpanded ? "Hide Filters" : "Show Filters"}
            <ChevronDownIcon
              className={`w-5 h-5 transform transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </motion.button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={dropdownVariants}
              className="overflow-hidden mt-6"
            >
              <div className="space-y-6">
                {/* Section for Travel Type Pills */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
                    Travel Type
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {travelTypes.map((type) => (
                      <motion.button
                        key={type}
                        type="button"
                        onClick={() => toggleTravelType(type)}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                          ${
                            selectedTypes.includes(type)
                              ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {type}
                        {selectedTypes.includes(type) && (
                          <CheckCircleIcon className="w-4 h-4 ml-2 inline-block" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Section for Region Pills */}
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
                    Region
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {regions.map((region) => (
                      <motion.button
                        key={region}
                        type="button"
                        onClick={() => setSelectedRegion(region)}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                          ${
                            selectedRegion === region
                              ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                          }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {region}
                        {selectedRegion === region && (
                          <CheckCircleIcon className="w-4 h-4 ml-2 inline-block" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Other Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end pt-4">
                  {/* Date Input */}
                  <div className="relative">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date
                    </label>
                    <CalendarDaysIcon className="absolute left-4 top-[3.25rem] -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 dark:bg-gray-800 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 shadow-sm"
                    />
                  </div>

                  {/* Guests Input */}
                  <div className="relative">
                    <label htmlFor="guests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Guests
                    </label>
                    <UserGroupIcon className="absolute left-4 top-[3.25rem] -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <input
                      id="guests"
                      type="number"
                      min={1}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      placeholder="Guests"
                      className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 dark:bg-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all duration-200 shadow-sm"
                    />
                  </div>

                  {/* Price Range Slider */}
                  <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col justify-center">
                    <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Budget: <span className="font-bold text-indigo-600 dark:text-indigo-400">${price}</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="priceRange"
                        type="range"
                        min={500}
                        max={5000}
                        step={100}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-1 sm:col-span-2 md:col-span-1 flex flex-col sm:flex-row md:flex-col gap-3">
                    <motion.button
                      onClick={handleApplyFilters}
                      className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold shadow-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                      Apply Filters
                    </motion.button>
                    <motion.button
                      onClick={handleClearFilters}
                      className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full px-6 py-3 font-semibold shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Clear Filters
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}