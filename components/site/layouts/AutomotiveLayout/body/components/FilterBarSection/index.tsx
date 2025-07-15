"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/20/solid"; // More modern chevron
import clsx from "clsx"; // For conditional class names

// Dummy data for vehicle types (replace with your actual data)
const vehicleTypes = [
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
  "Hatchback",
  "Minivan",
  "Motorcycle",
];

export default function FilterBarSection() {
  const [buyRent, setBuyRent] = useState<"buy" | "rent">("buy");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [year, setYear] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Animation variants
  const filterBarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const mobileFiltersVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // Helper for input styling
  const inputStyle =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out";
  const selectStyle =
    "w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out cursor-pointer";

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={filterBarVariants}
      className="sticky top-0 z-40 bg-white shadow-lg px-4 py-4 md:py-3 rounded-b-2xl md:rounded-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Toggle Buy / Rent */}
        <div className="flex items-center gap-2 mb-3 md:mb-0">
          <button
            className={clsx(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out",
              buyRent === "buy"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => setBuyRent("buy")}
          >
            Buy
          </button>
          <button
            className={clsx(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out",
              buyRent === "rent"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => setBuyRent("rent")}
          >
            Rent
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-grow w-full">
          <input type="text" placeholder="Location" className={inputStyle} />
          <input
            type="number"
            placeholder="Min Price"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className={inputStyle}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className={inputStyle}
          />
          <div className="relative">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className={selectStyle}
            >
              <option value="">Vehicle Type</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <input
            type="number"
            placeholder="Year (e.g., 2020)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={inputStyle}
          />
        </div>

        {/* Mobile Toggle Button and Apply Button */}
        <div className="flex items-center gap-3 mt-3 md:mt-0 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out"
          >
            More Filters <ChevronDownIcon className="w-4 h-4" />
          </button>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition duration-300 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
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
            {/* These are duplicate inputs for demonstration. In a real app, you might want to manage state more centrally or re-render a single set of filter components */}
            <input type="text" placeholder="Location" className={inputStyle} />
            <input
              type="number"
              placeholder="Min Price"
              className={inputStyle}
            />
            <input
              type="number"
              placeholder="Max Price"
              className={inputStyle}
            />
            <div className="relative">
              <select className={selectStyle}>
                <option value="">Vehicle Type</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <input type="number" placeholder="Year" className={inputStyle} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}