"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TruckIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { StoreForm } from "@/types/typings";

// --- TYPES ---
// Defining types locally to ensure self-containment
export interface TrendingLocation {
  id: string;
  name: string;
}

interface ISlide {
  id: string;
  imageUrl?: string;
  productImageUrl?: string;
  videoUrl?: string;
  headline: string;
  subline: string;
}

export interface IFilters {
  location: string | null;
  vehicleType: string | null;
  minPrice: number | string;
  maxPrice: number | string;
  isBuy: boolean;
  year: number | string | null;
}

type PartialFilters = Partial<IFilters>;

// --- CONSTANTS & MOCK DATA ---
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

const heroSlidesData: ISlide[] = [
  {
    id: "slide1",
    imageUrl:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560&auto=format&fit=crop",
    headline: "Command the Road",
    subline: "Experience the thrill of precision engineering and luxury.",
  },
  {
    id: "slide2",
    videoUrl:
      "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4", // Fallback or dynamic
    headline: "Future in Motion",
    subline: "Discover our fleet of next-generation electric vehicles.",
  },
  {
    id: "slide3",
    imageUrl:
      "https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2560&auto=format&fit=crop",
    headline: "Adventure Ready",
    subline: "Rugged capability meets refined comfort for every journey.",
  },
];

const AUTO_ADVANCE_DELAY = 8000;

// --- ANIMATION VARIANTS ---
const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5 } }
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// --- SUB-COMPONENT: Custom Select ---
// Replacing external FloatingLabelDropdown for portability and style matching
const CustomSelect = ({ 
  icon, 
  label, 
  value, 
  onChange, 
  options 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | null; 
  onChange: (val: string) => void; 
  options: { id?: string; name?: string; displayName?: string | null; categoryId?: string | null }[] 
}) => (
  <div className="relative group w-full">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
      {icon}
    </div>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-14 pl-10 pr-4 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl 
                 text-gray-900 dark:text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 appearance-none cursor-pointer transition-all hover:bg-white dark:hover:bg-gray-900"
    >
      <option value="" disabled>{label}</option>
      {options.map((opt, idx) => {
        // Handle various data shapes (StoreCategory vs TrendingLocation)
        const val = opt.categoryId || opt.id || opt.name || idx.toString();
        // displayName might be null coming from backend types; prefer non-null displayName, then name, then fallback value
        const display = (opt.displayName ?? opt.name) || val;
        return <option key={val} value={val}>{display}</option>;
      })}
    </select>
    {/* Custom Arrow */}
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function HeroSection({
  store,
  trendingLocations = [],
  filters,
  setFilters,
  onSearch,
}: {
  store?: StoreForm | null | undefined;
  trendingLocations?: TrendingLocation[];
  filters: IFilters | undefined;
  setFilters: (filters: IFilters) => void;
  onSearch: (e: React.FormEvent) => void;
}) {
  const heroSlides = store?.heroSlides?.length ? store.heroSlides : heroSlidesData;
  const categories = store?.StoreCategory ?? [];
  
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filters State Logic
  const safeFilters: IFilters = {
    location: filters?.location ?? null,
    vehicleType: filters?.vehicleType ?? null,
    minPrice: filters?.minPrice ?? "",
    maxPrice: filters?.maxPrice ?? "",
    isBuy: filters?.isBuy ?? true,
    year: filters?.year ?? null,
  };

  const updateFilters = (updates: PartialFilters) => setFilters({ ...safeFilters, ...updates });

  // Carousel Logic
  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => paginate(1), AUTO_ADVANCE_DELAY);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, paginate]);

  const currentSlide = heroSlides[current];
  const { isBuy } = safeFilters;

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-gray-950">
      
      {/* 1. IMMERSIVE BACKGROUND LAYER */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }} // Ken Burns Effect (Zoom Out)
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          {currentSlide.imageUrl || currentSlide.productImageUrl ? (
            <Image
              src={currentSlide.imageUrl || currentSlide.productImageUrl || ""}
              alt={currentSlide.headline || "Hero Image"}
              fill
              priority
              loader={customLoader}
              className="object-cover"
            />
          ) : (
            <video
              src={store?.videoUrl || "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4"}
              autoPlay muted loop playsInline
              className="h-full w-full object-cover"
            />
          )}
          {/* Cinematic Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" /> 
        </motion.div>
      </AnimatePresence>

      {/* 2. CONTENT LAYER */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        
        {/* Hero Text */}
        <div className="w-full max-w-5xl text-center mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                 {isBuy ? "Premium Dealership" : "Flexible Rentals"}
              </motion.span>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight drop-shadow-2xl mb-6">
                {currentSlide.headline}
              </h1>
              <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg">
                {currentSlide.subline}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. UNIFIED CONTROL DECK (Tabs + Search) */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-5xl"
        >
          {/* Mode Switcher (Tabs) */}
          <div className="flex justify-center mb-4">
            <div className="flex p-1.5 bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
              <button
                onClick={() => updateFilters({ isBuy: true })}
                className={`relative px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${isBuy ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {isBuy && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-blue-600 rounded-full shadow-lg shadow-blue-600/40" />
                )}
                <span className="relative z-10">Buy Car</span>
              </button>
              <button
                onClick={() => updateFilters({ isBuy: false })}
                className={`relative px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${!isBuy ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {!isBuy && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-emerald-600 rounded-full shadow-lg shadow-emerald-600/40" />
                )}
                <span className="relative z-10">Rent Car</span>
              </button>
            </div>
          </div>

          {/* Search Panel */}
          <form 
            onSubmit={onSearch}
            className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl p-3 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* Location */}
              <div className="md:col-span-3">
                 <CustomSelect 
                    icon={<MapPinIcon className="w-5 h-5" />}
                    label="All Locations"
                    value={safeFilters.location}
                    onChange={(v) => updateFilters({ location: v })}
                    options={trendingLocations}
                 />
              </div>

              {/* Type */}
              <div className="md:col-span-3">
                <CustomSelect 
                    icon={<TruckIcon className="w-5 h-5" />}
                    label="Any Type"
                    value={safeFilters.vehicleType}
                    onChange={(v) => updateFilters({ vehicleType: v })}
                    options={categories}
                 />
              </div>

              {/* Price Range (Double Inputs) */}
              <div className="md:col-span-4 flex gap-2">
                 <div className="relative w-1/2 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500">
                        <CurrencyDollarIcon className="w-5 h-5" />
                    </div>
                    <input 
                      type="number" 
                      placeholder="Min"
                      value={safeFilters.minPrice}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      className="w-full h-14 pl-10 pr-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white dark:hover:bg-gray-900 dark:text-white"
                    />
                 </div>
                 <div className="relative w-1/2 group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500">
                        <CurrencyDollarIcon className="w-5 h-5" />
                    </div>
                    <input 
                      type="number" 
                      placeholder="Max"
                      value={safeFilters.maxPrice}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      className="w-full h-14 pl-10 pr-3 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:bg-white dark:hover:bg-gray-900 dark:text-white"
                    />
                 </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full h-14 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                    ${isBuy 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 hover:shadow-blue-600/40' 
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:shadow-emerald-500/40'
                    }`}
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Search</span>
                </motion.button>
              </div>

            </div>
          </form>
        </motion.div>
      </div>

      {/* 4. PROGRESS & NAVIGATION CONTROLS */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 to-transparent pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Progress Bars */}
          <div className="flex gap-3 w-full max-w-md">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > current ? 1 : -1);
                  setCurrent(idx);
                }}
                className="group relative h-1.5 flex-1 bg-white/20 rounded-full overflow-hidden transition-all hover:h-2"
              >
                {/* Background track */}
                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors" />
                
                {/* Active Fill */}
                {idx === current && (
                  <motion.div
                    layoutId="progressFill"
                    className={`absolute inset-y-0 left-0 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.7)]`}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTO_ADVANCE_DELAY / 1000, ease: "linear" }}
                  />
                )}
                {/* Completed Fill */}
                {idx < current && <div className="absolute inset-0 bg-white/60" />}
              </button>
            ))}
          </div>

          {/* Arrow Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => paginate(-1)}
              className="p-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="p-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}