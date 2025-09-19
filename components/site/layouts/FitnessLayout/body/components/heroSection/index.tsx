"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import { HeroSlide } from "@/types/typings";

// Assuming these types are already defined elsewhere
// interface HeroSlide {
//   imageUrl: string;
//   headline?: string;
//   subline?: string;
// }

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

interface FitnessFilters {
  searchTerm?: string;
  program?: string;
  location?: string;
  goal?: string;
}

interface Props {
  storeFormData?: {
    heroSlides?: HeroSlide[];
    programTypes?: IStoreCategory[];
    locations?: ILocation[];
    goals?: IGoal[];
  };
  onSearch: (filters: FitnessFilters) => void;
}

// Default fallback data with new light-themed images
const defaultStoreFormData = {
  heroSlides: [
    {
      imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300d3a48?q=80&w=2940&auto=format&fit=crop",
      headline: "Forge Your Strength",
      subline: "Discover personalized training and nutrition programs.",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1502213753554-4f25b29b9f91?q=80&w=2940&auto=format&fit=crop",
      headline: "Move with Purpose",
      subline: "Find the perfect class to challenge your body and uplift your spirit.",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1599908610738-9562657e4e13?q=80&w=2940&auto=format&fit=crop",
      headline: "Find Your Flow",
      subline: "Connect with expert yoga instructors and studios near you.",
    },
  ],
  programTypes: [
    { id: "yoga", displayName: "Yoga" },
    { id: "crossfit", displayName: "CrossFit" },
    { id: "online", displayName: "Online" },
  ],
};

const slideVariants = {
  initial: { opacity: 0, scale: 1.05 },
  animate: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: "easeInOut" } },
  exit: { opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } },
};

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.5 } },
};

export default function RedesignedHeroSection({ storeFormData, onSearch }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Fallback data logic
  const heroSlides = storeFormData?.heroSlides?.length ? storeFormData.heroSlides : defaultStoreFormData.heroSlides;
  const programTypes = storeFormData?.programTypes?.length ? storeFormData.programTypes : defaultStoreFormData.programTypes;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ searchTerm, program: activeFilter || undefined });
  };

  const handleFilterClick = (filterId: string) => {
    const newFilter = activeFilter === filterId ? null : filterId;
    setActiveFilter(newFilter);
    if (newFilter) {
      onSearch({ program: newFilter });
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-white font-sans">
      {/* Background Slideshow */}
      <AnimatePresence>
        <motion.img
          key={heroSlides[currentSlide].imageUrl}
          src={heroSlides[currentSlide].imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300d3a48?q=80&w=2940&auto=format&fit=crop"}
          alt={heroSlides[currentSlide].headline ?? "hero background"}
          className="absolute inset-0 z-0 object-cover w-full h-full"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        />
      </AnimatePresence>

      {/* Lightened Overlay */}
      <div className="absolute inset-0 z-10 bg-white/50" />

      {/* Main Content */}
      <div className="relative z-30 flex flex-col items-center justify-center h-full px-6 text-center text-gray-900 max-w-5xl mx-auto">
        <motion.h1
          className="mb-4 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          {heroSlides[currentSlide]?.headline ?? "Your Fitness Journey Starts Here"}
        </motion.h1>
        <motion.p
          className="mb-8 text-lg md:text-2xl max-w-3xl leading-relaxed font-light text-gray-700"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          {heroSlides[currentSlide]?.subline ?? "Find programs, trainers, and gyms to reach your health goals."}
        </motion.p>
        
        {/* Integrated Search & Trending Section */}
        <motion.div
          className="w-full max-w-2xl bg-gray-100 rounded-xl p-4 sm:p-6 border border-gray-200 shadow-xl space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 1 } }}
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a program, gym, or trainer..."
                className="w-full py-4 pl-12 pr-4 rounded-full bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold shadow-lg transition-transform transform hover:scale-105"
            >
              Search
            </button>
          </form>

          {/* Trending Categories */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <FireIcon className="w-5 h-5 text-red-500" />
            {programTypes.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => handleFilterClick(p.id)}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 border ${
                  activeFilter === p.id
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300"
                }`}
              >
                {p.displayName}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
