"use client";

import React, { useState, useEffect } from 'react'; // Import useEffect
import { motion } from 'framer-motion';
// You might not need Image, ArrowRightIcon, ScaleIcon, CurrencyDollarIcon, LightBulbIcon, UsersIcon in FilterBar specifically
// but keeping them in the global context for now as they were in your original provided code.
import { ArrowRightIcon } from '@heroicons/react/24/solid'; // Keeping ArrowRightIcon as an example if you want a reset icon

// Placeholder data for filters - you'll replace this with your actual data
const intensities = ["Low", "Medium", "High", "Intense"];
const formats = ["In-Person", "Virtual", "Hybrid"];

// Framer Motion variants for staggered animations
const containerVariants = {
    hidden: { opacity: 0, y: -20 }, // Slightly more pronounced initial hidden state
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            staggerChildren: 0.1, // Faster stagger for snappier appearance
            delayChildren: 0.1,
            duration: 0.6, // Longer overall transition for smoothness
            ease: "easeOut",
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 }, // Small vertical slide
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

// ----------------------------------------------------------------------------
// FilterBar: sticky filters for duration, intensity, price, format (Enhanced)
// ----------------------------------------------------------------------------
export default function FilterBar() {
    const [duration, setDuration] = useState(30);
    const [intensity, setIntensity] = useState<string[]>([]); // Explicitly type as string array
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]); // Explicitly type as tuple
    const [format, setFormat] = useState<string[]>([]); // Explicitly type as string array
    const [matchCount, setMatchCount] = useState(0);

    useEffect(() => {
        // This is a mock calculation. In a real app, you'd fetch data based on filters.
        // For demonstration, let's make it a bit more dynamic.
        const currentCount = 500 - (duration * 2) - (priceRange[0] / 5) + (intensity.length * 10) + (format.length * 5);
        setMatchCount(Math.max(0, Math.floor(currentCount))); // Ensure non-negative and integer
    }, [duration, intensity, priceRange, format]); // Depend on all filter states

    const toggleSelection = (value: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
        setter(list.includes(value) ? list.filter((i) => i !== value) : [...list, value]);
    };

    const handleClearFilters = () => {
        setDuration(30);
        setIntensity([]);
        setPriceRange([0, 200]);
        setFormat([]);
    };

    return (
        <motion.div
            className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg p-5 shadow-xl border-b border-gray-100" // More prominent background, blur, shadow, and border
            variants={containerVariants} // Apply container variants for initial animation
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6"> {/* Max width for content, better spacing */}

                {/* Duration Slider */}
                <motion.div className="flex flex-col items-start min-w-[160px]" variants={itemVariants}> {/* Aligned left, min-width */}
                    <label htmlFor="duration" className="text-sm font-semibold text-gray-800 mb-2">
                        Duration <span className="font-normal text-gray-500">({duration} min)</span>
                    </label>
                    <input
                        id="duration"
                        type="range"
                        min={15}
                        max={120} // Increased max duration for more flexibility
                        step={15}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full md:w-36 h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-primary-dark transition-all duration-200 ease-in-out [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-hover [&::-webkit-slider-thumb]:shadow-md" // Custom thumb styling, smooth transitions
                        aria-valuetext={`${duration} minutes`}
                        aria-label="Filter by duration"
                    />
                </motion.div>

                {/* Intensity Toggles */}
                <motion.div className="flex flex-col items-start min-w-[200px]" variants={itemVariants}>
                    <span className="text-sm font-semibold text-gray-800 mb-2">Intensity</span>
                    <div className="flex flex-wrap gap-2"> {/* Use flex-wrap for better mobile layout */}
                        {intensities.map((level) => (
                            <motion.button
                                key={level}
                                onClick={() => toggleSelection(level, intensity, setIntensity)}
                                whileTap={{ scale: 0.9 }} // More pronounced tap effect
                                whileHover={{ scale: 1.05, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }} // Hover effect
                                className={`px-4 py-2 rounded-full border transition-all duration-300 text-sm font-medium whitespace-nowrap ${ // Consistent padding, whitespace
                                    intensity.includes(level)
                                        ? "bg-primary-dark text-white border-primary-dark shadow-md"
                                        : "bg-white text-gray-700 border-gray-300 hover:border-primary-light hover:text-primary-dark" // Subtle hover on unselected
                                }`}
                                aria-pressed={intensity.includes(level)}
                                aria-label={`Toggle intensity ${level}`}
                            >
                                {level}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Price Range Inputs */}
                <motion.div className="flex flex-col items-start min-w-[180px]" variants={itemVariants}>
                    <label className="text-sm font-semibold text-gray-800 mb-2">Price ($)</label>
                    <div className="flex items-center space-x-2 w-full">
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Math.max(0, +e.target.value), priceRange[1]])} // Prevent negative min price
                            className="w-20 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
                            aria-label="Minimum price"
                            placeholder="Min"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Math.max(priceRange[0], +e.target.value)])} // Ensure max is not less than min
                            className="w-20 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-all duration-200"
                            aria-label="Maximum price"
                            placeholder="Max"
                        />
                    </div>
                </motion.div>

                {/* Format Checkboxes */}
                <motion.div className="flex flex-col items-start min-w-[160px]" variants={itemVariants}>
                    <span className="text-sm font-semibold text-gray-800 mb-2">Format</span>
                    <div className="flex flex-wrap gap-x-4 gap-y-2"> {/* Gap for checkboxes */}
                        {formats.map((f) => (
                            <motion.label
                                key={f}
                                className="flex items-center space-x-2 text-sm font-medium text-gray-700 cursor-pointer group" // Added group for hover effects
                                whileHover={{ x: 3 }} // Subtle slide on hover
                                variants={itemVariants} // Apply to label for staggered appearance
                            >
                                <input
                                    type="checkbox"
                                    checked={format.includes(f)}
                                    onChange={() => toggleSelection(f, format, setFormat)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary-dark focus:ring-primary-dark transition-colors duration-200" // Styled checkbox
                                    aria-label={`Toggle format ${f}`}
                                />
                                <span className="select-none group-hover:text-primary-dark transition-colors duration-200">{f}</span> {/* Text color change on hover */}
                            </motion.label>
                        ))}
                    </div>
                </motion.div>

                {/* Match Count & Clear */}
                <motion.div className="flex flex-col items-center md:items-end ml-auto gap-2" variants={itemVariants}> {/* Aligned right on desktop */}
                    <span className="text-base md:text-lg font-bold text-primary-dark">
                        <span className="text-2xl font-extrabold">{matchCount}</span> Programs Found
                    </span>
                    <motion.button
                        onClick={handleClearFilters}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ x: 5 }} // Subtle slide on hover
                        className="text-sm font-semibold text-gray-600 hover:text-primary-dark transition-all duration-200 flex items-center space-x-1"
                        aria-label="Clear all filters"
                    >
                        <span>Clear All Filters</span>
                        {/* <ArrowRightIcon className="h-4 w-4 rotate-180" /> Optional: Add a reset icon */}
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Remember to update your tailwind.config.js with these colors if you haven't already:
/*
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1', // A nice vibrant indigo
          light: '#818CF8',
          dark: '#4F46E5', // Slightly darker for accents/buttons
          hover: '#4338CA', // Even darker for hover states
          accent: '#A78BFA', // A brighter accent for highlights
        },
      },
    },
  },
  plugins: [],
}
*/