"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, EyeDropperIcon, MagnifyingGlassCircleIcon, MapPinIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline';


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
    heroSlides?: any;
    programTypes?: IStoreCategory[];
    locations?: ILocation[];
    goals?: IGoal[];
}

interface Props {
    storeFormData?: StoreForm;
    onSearch: (filters: FitnessFilters) => void;
}

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

// Framer Motion variants for dropdown content
const dropdownVariants = {
    hidden: { opacity: 0, height: 0, scaleY: 0.95 },
    visible: {
        opacity: 1,
        height: "auto",
        scaleY: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut",
        },
    },
    exit: { opacity: 0, height: 0, scaleY: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
};

export default function FilterBar({ storeFormData = defaultStoreFormData, onSearch }: Props) {
    const [filters, setFilters] = useState<FitnessFilters>({});
    const [matchCount, setMatchCount] = useState(0);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const programTypes = storeFormData.programTypes || defaultStoreFormData.programTypes;
    const locations = storeFormData.locations || defaultStoreFormData.locations;
    const goals = storeFormData.goals || defaultStoreFormData.goals;

    useEffect(() => {
        const currentCount = 500 - (Object.keys(filters).length * 50) + (Math.random() * 20);
        setMatchCount(Math.max(0, Math.floor(currentCount)));
    }, [filters]);

    const handleClearFilters = () => {
        setFilters({});
        onSearch({});
        setOpenDropdown(null);
    };

    const handleSelect = (key: keyof FitnessFilters, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: prev[key] === value ? undefined : value };
            onSearch(newFilters);
            return newFilters;
        });
    };

    const handleToggleDropdown = (dropdownName: string) => {
        setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
    };

    const filterCategories = [
        { name: 'Program', key: 'program', icon: TagIcon, options: programTypes },
        { name: 'Location', key: 'location', icon: MapPinIcon, options: locations },
        { name: 'Goal', key: 'goal', icon: EyeDropperIcon, options: goals },
    ];

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <motion.div
            className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-4 py-4 shadow-lg border-b border-gray-200 font-sans transition-all duration-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Search Input (optional, but a good fit here) */}
                <div className="relative w-full md:w-auto md:flex-grow">
                    <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search for a program..."
                        value={filters.searchTerm || ''}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
                    />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex w-full md:w-auto items-center justify-center gap-2 md:gap-4 flex-wrap">
                    {filterCategories.map((category) => (
                        <div key={category.key} className="relative">
                            <motion.button
                                type="button"
                                onClick={() => handleToggleDropdown(category.key)}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300
                                    ${filters[category.key as keyof FitnessFilters] ? 'bg-indigo-600 text-white border-transparent shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'}
                                `}
                            >
                                <category.icon className="h-5 w-5" />
                                <span className="font-semibold text-sm">{category.name}</span>
                                <motion.div
                                    animate={{ rotate: openDropdown === category.key ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDownIcon className="h-5 w-5" />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {openDropdown === category.key && (
                                    <motion.div
                                        className="absolute top-full mt-2 w-max max-h-60 overflow-y-auto left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-4 border border-gray-100 z-30"
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        style={{ transformOrigin: 'top center' }}
                                    >
                                        <div className="flex flex-col gap-2">
                                            {category.options.map((option) => (
                                                <motion.button
                                                    key={option.id}
                                                    onClick={() => {
                                                        handleSelect(category.key as keyof FitnessFilters, option.id);
                                                        setOpenDropdown(null);
                                                    }}
                                                    whileHover={{ x: 5 }}
                                                    className={`
                                                        px-4 py-2 text-sm font-medium rounded-md text-left transition-all duration-200
                                                        ${filters[category.key as keyof FitnessFilters] === option.id
                                                            ? 'bg-indigo-100 text-indigo-700 font-bold'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                        }
                                                    `}
                                                >
                                                    {option.name || option.displayName}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Match Count & Clear Button */}
                <div className="flex-shrink-0 mt-4 md:mt-0 flex flex-col md:flex-row items-center gap-4 text-center">
                    <motion.div
                        className="flex flex-col items-center leading-none"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className="text-4xl font-extrabold text-gray-900 drop-shadow-sm">{matchCount}</span>
                        <span className="text-xs text-gray-500 font-semibold uppercase">Programs Found</span>
                    </motion.div>
                    {activeFilterCount > 0 && (
                        <motion.button
                            onClick={handleClearFilters}
                            whileTap={{ scale: 0.95 }}
                            className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-all duration-200 flex items-center gap-1"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            Clear All ({activeFilterCount})
                        </motion.button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
