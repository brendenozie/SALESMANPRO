"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  FireIcon,
} from "@heroicons/react/24/outline";

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

interface HeroSlide {
  url: string;
  headline?: string;
  subline?: string;
  id?: string | number;
}

interface StoreForm {
  heroSlides?: HeroSlide[];
  programTypes?: IStoreCategory[];
  locations?: ILocation[];
  goals?: IGoal[];
}

interface Props {
  storeFormData?: StoreForm;
  onSearch: (filters: FitnessFilters) => void;
}

// Default fallback data
const defaultStoreFormData: StoreForm = {
  heroSlides: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1574680096145-af41443589b2?q=80&w=2940&auto=format&fit=crop",
      headline: "Forge Your Strength",
      subline: "Discover personalized training and nutrition programs.",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1549060156-f033066a3d90?q=80&w=2940&auto=format&fit=crop",
      headline: "Move with Purpose",
      subline: "Find the perfect class to challenge your body and uplift your spirit.",
    },
  ],
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
    { id: "online", name: "Online" },
  ],
  goals: [
    { id: "weight-loss", name: "Weight Loss" },
    { id: "muscle-gain", name: "Muscle Gain" },
    { id: "flexibility", name: "Flexibility" },
    { id: "stress-reduction", name: "Stress Reduction" },
    { id: "wellness", name: "Overall Wellness" },
  ],
};

// Motion variants
const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 50,
    scale: 0.95,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function HeroSection({
  storeFormData,
  onSearch,
}: Props) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [filters, setFilters] = useState<FitnessFilters>({});
  const [activeTab, setActiveTab] =
    useState<"programs" | "locations" | "goals">("programs");

  // ✅ Always merge with fallback data
  const data = storeFormData || {};
  const heroSlides = data.heroSlides?.length
    ? data.heroSlides
    : defaultStoreFormData.heroSlides!;
  const programTypes = data.programTypes?.length
    ? data.programTypes
    : defaultStoreFormData.programTypes!;
  const locations = data.locations?.length
    ? data.locations
    : defaultStoreFormData.locations!;
  const goals = data.goals?.length
    ? data.goals
    : defaultStoreFormData.goals!;

  const handleClearFilters = () => setFilters({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    setIsSearchModalOpen(false);
  };

  const handleSelect = (key: keyof FitnessFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-white font-sans">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroSlides[0].url}
                    alt={heroSlides[0].headline ?? "hero background"}
                    className="object-cover w-full h-full"
                />
            </div>

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-white/80 via-transparent to-white/80" />

            {/* Main Content */}
            <motion.div
                className="relative z-30 flex flex-col items-center justify-center h-full px-6 text-center text-gray-900 max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <motion.h1
                    className="mb-4 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight"
                >
                    {heroSlides[0]?.headline ?? "Your Fitness Journey Starts Here"}
                </motion.h1>
                <motion.p
                    className="mb-12 text-lg md:text-2xl max-w-4xl leading-relaxed font-light text-gray-600"
                >
                    {heroSlides[0]?.subline ?? "Find programs, trainers, and gyms to reach your health goals."}
                </motion.p>
                
                {/* Main Search Button */}
                <motion.button
                    onClick={() => setIsSearchModalOpen(true)}
                    whileHover={{ scale: 1.05, boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-full sm:w-auto px-12 py-5 text-lg font-bold rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-gray-900 shadow-xl transition-all duration-300 overflow-hidden group hover:from-teal-500 hover:to-cyan-600"
                >
                    <MagnifyingGlassIcon className="w-6 h-6 mr-3 inline-block relative z-10 animate-pulse-fast" />
                    <span className="relative z-10">Find Your Path</span>
                </motion.button>

                {/* Trending Section */}
                <div className="absolute bottom-16 sm:bottom-18 z-40 w-full px-6 sm:px-0">
                    <div className="bg-gray-50/70 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-xl max-w-md mx-auto">
                        <h3 className="text-sm sm:text-lg font-semibold text-gray-800 flex items-center mb-4 uppercase tracking-wider">
                            <FireIcon className="w-5 h-5 mr-2 text-rose-500" />
                            Trending Now
                        </h3>
                        {/* Trending Now (Dynamic) */}
                       <div className="flex gap-2  sm:gap-4 flex-wrap justify-center">
                                {programTypes.slice(0, 3).map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelect("program", p.id)}
                                    className={`transition-all  flex items-center justify-center text-xs sm:text-sm font-medium 
                                        px-4 sm:px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors"
                                    ${
                                        filters.program === p.id
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white/80 text-gray-800 border-gray-300 hover:bg-gray-100"
                                    }`}
                                >
                                    {p.displayName}
                                </button>
                                ))}
                            </div>

                        {/* <div className="flex flex-wrap gap-2 sm:gap-4">
                            {['Yoga', 'CrossFit', 'Online'].map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelect('program', item.toLowerCase())}
                                    className="flex items-center justify-center text-xs sm:text-sm font-medium px-4 sm:px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    {item}
                                </button>
                            ))}
                        </div> */}
                    </div>
                </div>
            </motion.div>

            {/* Search Modal */}
            <AnimatePresence>
                {isSearchModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200/50 backdrop-blur-lg"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={overlayVariants}
                        onClick={() => setIsSearchModalOpen(false)}
                    >
                        <motion.div
                            className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 sm:p-10 m-4 relative border border-gray-200"
                            variants={modalVariants}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsSearchModalOpen(false)}
                                className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
                                aria-label="Close search"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    What are you looking for?
                                </h2>
                                <p className="text-gray-500">Filter by program type, location, and your personal goals.</p>
                                
                                {/* Tabbed Interface */}
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-6 border-b border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('programs')}
                                        className={`pb-3 border-b-2 font-semibold transition-colors duration-300 ${activeTab === 'programs' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Programs
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('locations')}
                                        className={`pb-3 border-b-2 font-semibold transition-colors duration-300 ${activeTab === 'locations' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Locations
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('goals')}
                                        className={`pb-3 border-b-2 font-semibold transition-colors duration-300 ${activeTab === 'goals' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Goals
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        variants={tabContentVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {activeTab === 'programs' && (
                                            <div className="flex flex-wrap items-center gap-3">
                                                {programTypes.map((type) => (
                                                    <motion.button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => handleSelect('program', type.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`
                                                            px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                                                            ${filters.program === type.id
                                                                ? "bg-teal-600 text-white shadow-lg border-teal-600"
                                                                : "bg-gray-100 text-gray-700 hover:bg-teal-100 hover:text-teal-800 border-gray-300"
                                                            }`}
                                                    >
                                                        {type.displayName}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                        {activeTab === 'locations' && (
                                            <div className="flex flex-wrap items-center gap-3">
                                                {locations.map((loc) => (
                                                    <motion.button
                                                        key={loc.id}
                                                        type="button"
                                                        onClick={() => handleSelect('location', loc.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`
                                                            px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                                                            ${filters.location === loc.id
                                                                ? "bg-indigo-600 text-white shadow-lg border-indigo-600"
                                                                : "bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-800 border-gray-300"
                                                            }`}
                                                    >
                                                        {loc.name}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                        {activeTab === 'goals' && (
                                            <div className="flex flex-wrap items-center gap-3">
                                                {goals.map((g) => (
                                                    <motion.button
                                                        key={g.id}
                                                        type="button"
                                                        onClick={() => handleSelect('goal', g.id)}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`
                                                            px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border
                                                            ${filters.goal === g.id
                                                                ? "bg-purple-600 text-white shadow-lg border-purple-600"
                                                                : "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-800 border-gray-300"
                                                            }`}
                                                    >
                                                        {g.name}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                
                                {/* Search & Clear Buttons */}
                                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4">
                                    <button
                                        type="button"
                                        onClick={handleClearFilters}
                                        className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
                                    >
                                        Clear filters
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-gray-900 font-semibold shadow-lg transition-transform transform hover:scale-105"
                                    >
                                        <MagnifyingGlassIcon className="w-5 h-5 mr-2 inline-block" />
                                        Search Now
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
  );
}
