"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
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

// Default data for demonstration if no props are provided
const defaultStoreFormData: StoreForm = {
  heroSlides: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b231b?q=80&w=2940&auto=format&fit=crop",
      headline: "Unlock Your Potential",
      subline: "Discover personalized fitness and wellness programs designed for you.",
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1549060156-f033066a3d90?q=80&w=2940&auto=format&fit=crop",
      headline: "Sweat, Smile, Repeat",
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

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
};

const bgVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 1000 : -1000,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9 },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 1000 : -1000,
    transition: { duration: 0.9 },
  }),
};

export default function HeroSection({ storeFormData = defaultStoreFormData, onSearch }: Props) {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [filters, setFilters] = useState<FitnessFilters>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const heroSlides = storeFormData.heroSlides || defaultStoreFormData.heroSlides;
  const programTypes = storeFormData.programTypes || defaultStoreFormData.programTypes;
  const locations = storeFormData.locations || defaultStoreFormData.locations;
  const goals = storeFormData.goals || defaultStoreFormData.goals;

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    setIsSearchModalOpen(false);
  };

  const handleSelect = (key: keyof FitnessFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? undefined : value }));
  };
  
  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background Slideshow */}
      <AnimatePresence initial={false} custom={direction}>
        {heroSlides.map((slide, i) =>
          i === currentSlide ? (
            <motion.div
              key={slide.id ?? i}
              className="absolute inset-0 z-0"
              custom={direction}
              variants={bgVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Image
                src={slide.url || "https://images.unsplash.com/photo-1549060156-f033066a3d90?q=80&w=2940&auto=format&fit=crop"}
                alt={slide.headline ?? "hero background"}
                fill
                priority
                className="object-cover"
                loader={loader}
              />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Main Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center text-white max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h1
          className="mb-6 text-4xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg"
        >
          {heroSlides[currentSlide]?.headline ?? "Your Fitness Journey Starts Here"}
        </motion.h1>
        <motion.p
          className="mb-10 text-lg md:text-2xl max-w-2xl leading-relaxed drop-shadow-md"
        >
          {heroSlides[currentSlide]?.subline ?? "Find programs, trainers, and gyms to reach your health goals."}
        </motion.p>
        
        <motion.button
          onClick={() => setIsSearchModalOpen(true)}
          className="px-8 py-4 text-lg font-semibold rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-2xl transition-transform transform hover:scale-105"
        >
          <MagnifyingGlassIcon className="w-6 h-6 mr-2 inline-block" />
          Find My Program
        </motion.button>
      </motion.div>
      
      {/* Slide Navigation */}
      <div className="absolute bottom-10 right-10 flex items-center gap-4 z-30">
        <button
          onClick={prevSlide}
          className="bg-white/90 p-2 rounded-full shadow hover:shadow-md transition-transform transform hover:-translate-x-1"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-white/90 p-2 rounded-full shadow hover:shadow-md transition-transform transform hover:translate-x-1"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={() => setIsSearchModalOpen(false)}
          >
            <motion.div
              className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 m-4 relative"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsSearchModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Close search"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  What are you looking for?
                </h2>
                
                {/* General Search Input */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    aria-label="Search for programs, locations, or goals"
                    placeholder="Search for a program, location, or goal..."
                    value={filters.searchTerm || ""}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-300/80 transition"
                  />
                </div>
                
                {/* Program Pills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Program Type
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {programTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleSelect('program', type.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          filters.program === type.id
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                        }`}
                      >
                        {type.displayName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Pills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    Location
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {locations.map((loc) => (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => handleSelect('location', loc.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          filters.location === loc.id
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                        }`}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal Pills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <TrophyIcon className="w-5 h-5 mr-2" />
                    Your Goal
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {goals.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelect('goal', g.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          filters.goal === g.id
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                        }`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Search & Clear Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium text-sm transition"
                  >
                    Clear filters
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2 inline-block" />
                    Search
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
