"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import { ArrowRightIcon, ScaleIcon, CurrencyDollarIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// New variants for the feature icons
const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
};

// ----------------------------------------------------------------------------
// FilterBar: sticky filters for duration, intensity, price, format
// ----------------------------------------------------------------------------
export default function  FilterBar() {
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [format, setFormat] = useState([]);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    // Example mock: matchCount = 100 - duration - priceRange[0]/2
    const count = Math.max(0, 100 - duration - priceRange[0] / 2);
    setMatchCount(count);
  }, [duration, priceRange]);

  const toggleSelection = (value:any, list:any, setter:any) => {
    setter(list.includes(value) ? list.filter((i:any) => i !== value) : [...list, value]);
  };

  return (
    <motion.div
      className="sticky top-0 z-20 bg-white bg-opacity-80 backdrop-blur-md p-4 shadow-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Duration Slider */}
        <div className="flex flex-col">
          <label htmlFor="duration" className="text-sm font-medium text-gray-700">
            Duration (min)
          </label>
          <input
            id="duration"
            type="range"
            min={15}
            max={60}
            step={15}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-40 h-2 accent-primary"
            aria-valuetext={`${duration} minutes`}
          />
          <span className="text-xs text-gray-600">{duration} min</span>
        </div>

        {/* Intensity Toggles */}
        <div className="flex items-center space-x-2">
          {intensities.map((level:any) => (
            <motion.button
              key={level}
              onClick={() => toggleSelection(level, intensity, setIntensity)}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1 rounded-full border transition-all text-sm font-medium ${
                // intensity.includes(level)
                  // ? "bg-primary text-white border-primary"
                  // : 
                  "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {level}
            </motion.button>
          ))}
        </div>

        {/* Price Range Inputs */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Price ($)</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
              className="w-16 p-1 border rounded-lg"
              aria-label="Min price"
            />
            <span>-</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
              className="w-16 p-1 border rounded-lg"
              aria-label="Max price"
            />
          </div>
        </div>

        {/* Format Checkboxes */}
        <div className="flex items-center space-x-2">
          {formats.map((f:any) => (
            <motion.label
              key={f}
              className="flex items-center space-x-1 text-sm cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              <input
                type="checkbox"
                // checked={format.includes(f)}
                onChange={() => toggleSelection(f, format, setFormat)}
                className="accent-primary"
              />
              <span className="select-none">{f}</span>
            </motion.label>
          ))}
        </div>

        {/* Match Count & Clear */}
        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">{matchCount} programs found</span>
          <button
            onClick={() => {
              setDuration(30);
              setIntensity([]);
              setPriceRange([0, 200]);
              setFormat([]);
            }}
            className="text-sm text-primary hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
}