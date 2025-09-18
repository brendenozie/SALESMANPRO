"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  TrophyIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Placeholder data and types for a hypothetical fitness store
interface FitnessFilters {
  searchTerm?: string;
  program?: string;
  location?: string;
  goal?: string;
}

interface IStoreCategory {
  id: string;
  displayName: string;
}

interface ILocation {
  name: string;
  id: string;
}

interface IGoal {
  name: string;
  id: string;
}

interface StoreForm {
  heroSlides?: any; // Not used here, but keeping for consistency
  programTypes?: IStoreCategory[];
  locations?: ILocation[];
  goals?: IGoal[];
}

interface Props {
  storeFormData?: StoreForm;
  onSearch: (filters: FitnessFilters) => void;
}

// Default data for demonstration if no props are provided
const defaultStoreFormData: StoreForm = {
  programTypes: [
    { id: "yoga", displayName: "Yoga" },
    { id: "pilates", displayName: "Pilates" },
    { id: "crossfit", displayName: "CrossFit" },
    { id: "weightlifting", displayName: "Weightlifting" },
    { id: "cardio", displayName: "Cardio" },
    { id: "nutrition", displayName: "Nutrition Coaching" },
  ],
  locations: [
    { id: "nyc", name: "New York" },
    { id: "la", name: "Los Angeles" },
    { id: "chicago", name: "Chicago" },
    { id: "online", name: "Online Classes" },
  ],
  goals: [
    { id: "weight-loss", name: "Weight Loss" },
    { id: "muscle-gain", name: "Muscle Gain" },
    { id: "flexibility", name: "Flexibility" },
    { id: "stress-reduction", name: "Stress Reduction" },
    { id: "wellness", name: "Overall Wellness" },
  ],
};

// Framer Motion variants for a more dynamic feel
const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function FilterBar({ storeFormData = defaultStoreFormData, onSearch }: Props) {
  const [filters, setFilters] = useState<FitnessFilters>({});
  const [matchCount, setMatchCount] = useState(0);

  const programTypes = storeFormData.programTypes || defaultStoreFormData.programTypes;
  const locations = storeFormData.locations || defaultStoreFormData.locations;
  const goals = storeFormData.goals || defaultStoreFormData.goals;

  // Mock function to simulate a search and update the match count
  useEffect(() => {
    // In a real application, you would make an API call here.
    // This is a placeholder to show the dynamic count.
    const currentCount = 500 - (Object.keys(filters).length * 50) + (Math.random() * 20);
    setMatchCount(Math.max(0, Math.floor(currentCount)));
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({});
    onSearch({});
  };

  const handleSelect = (key: keyof FitnessFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: prev[key] === value ? undefined : value };
      onSearch(newFilters);
      return newFilters;
    });
  };

  return (
    <motion.div
      className="sticky top-0 z-20 bg-gray-900/90 backdrop-blur-lg p-5 shadow-xl border-b border-gray-700"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Filter Pills Container */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 flex-grow">
          <motion.div className="flex flex-col items-start min-w-[160px]" variants={itemVariants}>
            <span className="text-sm font-semibold text-gray-200 mb-2">Program</span>
            <div className="flex flex-wrap gap-2">
              {programTypes.map((type) => (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelect('program', type.id)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-gray-700 ${
                    filters.program === type.id
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-purple-800/20"
                  }`}
                  aria-pressed={filters.program === type.id}
                  aria-label={`Toggle program type: ${type.displayName}`}
                >
                  {type.displayName}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div className="flex flex-col items-start min-w-[160px]" variants={itemVariants}>
            <span className="text-sm font-semibold text-gray-200 mb-2">Location</span>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <motion.button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelect('location', loc.id)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-gray-700 ${
                    filters.location === loc.id
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-indigo-800/20"
                  }`}
                  aria-pressed={filters.location === loc.id}
                  aria-label={`Toggle location: ${loc.name}`}
                >
                  {loc.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div className="flex flex-col items-start min-w-[160px]" variants={itemVariants}>
            <span className="text-sm font-semibold text-gray-200 mb-2">Goal</span>
            <div className="flex flex-wrap gap-2">
              {goals.map((g) => (
                <motion.button
                  key={g.id}
                  type="button"
                  onClick={() => handleSelect('goal', g.id)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border border-gray-700 ${
                    filters.goal === g.id
                      ? "bg-pink-600 text-white shadow-lg"
                      : "bg-gray-800 text-gray-300 hover:bg-pink-800/20"
                  }`}
                  aria-pressed={filters.goal === g.id}
                  aria-label={`Toggle goal: ${g.name}`}
                >
                  {g.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Match Count & Clear Button */}
        <motion.div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right" variants={itemVariants}>
          <span className="text-sm font-medium text-gray-300">
            <span className="text-3xl font-extrabold text-white">{matchCount}</span> Programs Found
          </span>
          <motion.button
            onClick={handleClearFilters}
            whileTap={{ scale: 0.95 }}
            className="text-sm font-semibold text-gray-400 hover:text-white transition-all duration-200 flex items-center gap-1"
            aria-label="Clear all filters"
          >
            <XMarkIcon className="h-4 w-4" />
            Clear All Filters
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
