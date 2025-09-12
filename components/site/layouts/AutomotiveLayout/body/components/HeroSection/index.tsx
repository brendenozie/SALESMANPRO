"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  TruckIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FloatingLabelDropdown from "../FloatingLabelDropdown";
import { HeroSlide, IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";

// --- Types (Can be moved to a separate types file) ---
// interface HeroSlide {
//   type: "image" | "video";
//   url: string;
//   headline: string;
//   subline: string;
// }
// Add other types like IStoreCategory, ISubcategory etc. here if needed

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};


// --- Dummy Data (Passed as props in a real app) ---
const heroSlidesData: any[] = [
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2670&auto=format&fit=crop",
    headline: "Your Dream Ride Awaits",
    subline: "Explore the largest curated collection of new and pre-owned vehicles.",
  },
  {
    type: "video",
    url: "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4",
    headline: "Luxury Meets Performance",
    subline: "Discover premium vehicles that redefine the art of driving.",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2670&auto=format&fit=crop",
    headline: "Drive Into the Future",
    subline: "Choose from cutting-edge electric and hybrid cars.",
  },
];

const autoAdvanceDelay = 8000; // 8 seconds

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

interface TrendingLocation {
  name: string;
}

interface HeroSectionProps {
  store?: StoreForm | null | undefined;
  trendingLocations?: TrendingLocation[];

  filters: any;
  setFilters: (filters: any) => void;
  onSearch: (e: React.FormEvent) => void;
}


// --- Final Component ---
export default function HeroSection({ store, trendingLocations, filters, setFilters, onSearch }: HeroSectionProps) {


  const heroSlides = store?.heroSlides?.length ? store.heroSlides : heroSlidesData;
  const categories = store?.StoreCategory ?? [];

  const [current, setCurrent] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search state
  const [isBuy, setIsBuy] = useState(true);
  const [location, setLocation] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<IStoreCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubcategory | null>(null);

  // Dropdown open/closed state
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false);

  // Refs for click-outside logic
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredSubcategories = selectedCategory?.subcategories ?? [];
  const filteredTrendingLocations = trendingLocations?.filter((loc) =>
    loc.name.toLowerCase().includes(location.toLowerCase())
  );

  // newnewnewnewnewnew

  const advanceSlide = useCallback((direction: "next" | "prev") => {
    if (direction === "next") {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    } else {
      setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    }
  }, [heroSlides.length]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current!);
  }, [current, advanceSlide]);

  const handleIndicatorClick = (index: number) => {
    setCurrent(index);
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Media */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {heroSlides[current].type === "image" ? (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 1.5, ease: "easeOut" } }}
            >
              <Image
                src={heroSlides[current].imageUrl || "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2670&auto=format&fit=crop"}
                alt={heroSlides[current].headline}
                fill
                priority
                className="object-cover"
                loader={customLoader}
              />
            </motion.div>
          ) : (
            <video
              src={heroSlides[current].url}
              autoPlay muted loop playsInline
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center p-4">
        <motion.div
          key={current}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-xl"
          >
            {isBuy ? heroSlides[current].headline : "Effortless Car Rentals"}
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-4 max-w-2xl text-lg sm:text-xl text-gray-200 drop-shadow-lg">
            {heroSlides[current].subline}
          </motion.p>

          {/* Animated Buy/Rent Toggle */}
          <motion.div variants={itemVariants} className="relative flex w-full max-w-xs justify-center bg-black/20 p-1 rounded-full mt-8 overflow-hidden">
            <motion.div
              layout
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-full shadow-md"
              initial={false}
              animate={{ x: isBuy ? "-50%" : "50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button onClick={() => setIsBuy(true)} className="relative w-1/2 py-2.5 text-sm font-semibold z-10 text-white transition-colors duration-300">
              Buy a Car
            </button>
            <button onClick={() => setIsBuy(false)} className="relative w-1/2 py-2.5 text-sm font-semibold z-10 text-white transition-colors duration-300">
              Rent a Car
            </button>
          </motion.div>

          {/* Search Form */}
          <motion.form
            variants={itemVariants}
            className="mt-8 grid w-full max-w-4xl grid-cols-1 md:grid-cols-4 gap-4 bg-black/20 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/10"
          >
            {/* These would be custom components in a real app */}
            <FloatingLabelDropdown
              id="location"
              label="Location"
              icon={<MapPinIcon className="h-5 w-5" />}
              options={filteredTrendingLocations}
              selectedValue={null}//"filters.location"}
              onSelect={(value) => setFilters({ ...filters, location: value })}
            />
            <FloatingLabelDropdown
              id="vehicleType"
              label="Vehicle Type"
              icon={<TruckIcon className="h-5 w-5" />}
              options={categories}
              selectedValue={null}//filters.vehicleType}
              onSelect={(value) => setFilters({ ...filters, vehicleType: value })}
            />

            {/* A simple text input for price can be its own component too */}
            <div className="relative md:col-span-2 grid grid-cols-2 gap-4">
              {/* Simple inputs for price range */}
              <input type="number" placeholder="Min Price" 
              value={0}//filters.minPrice} 
              onChange={e => setFilters({ ...filters, minPrice: e.target.value })} className="w-full rounded-lg bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300" />
              <input type="number" placeholder="Max Price" 
              value={0}//filters.maxPrice} 
              onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} className="w-full rounded-lg bg-white/10 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300" />
            </div>

            <motion.button
              type="submit"
              className="md:col-span-4 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg transition-all"
              whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              <MagnifyingGlassIcon className="h-5 w-5" /> Find Your Car
            </motion.button>

            {/* <FloatingLabelInput id="location" label="Location" icon={<MapPinIcon className="h-5 w-5" />} />
            <FloatingLabelInput id="type" label="Vehicle Type" icon={<TruckIcon className="h-5 w-5" />} />
            <FloatingLabelInput id="price" label="Price Range" icon={<CurrencyDollarIcon className="h-5 w-5" />} />
            
            <motion.button 
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg transition-all"
              whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
              whileTap={{ scale: 0.95 }}
            >
              <MagnifyingGlassIcon className="h-5 w-5" /> Search
            </motion.button> */}
          </motion.form>
        </motion.div>
      </div>

      {/* Controls and Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          {/* Prev/Next Arrows */}
          <button onClick={() => advanceSlide("prev")} className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition backdrop-blur-sm">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          {/* Progress Bars */}
          <div className="flex-1 flex gap-2">
            {heroSlides.map((_, idx) => (
              <div key={idx} className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden cursor-pointer" onClick={() => handleIndicatorClick(idx)}>
                {idx === current ? (
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: autoAdvanceDelay / 1000, ease: "linear" }}
                  />
                ) : (
                  <div className="h-full bg-transparent" style={{ width: idx < current ? '100%' : '0' }} />
                )}
              </div>
            ))}
          </div>

          <button onClick={() => advanceSlide("next")} className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition backdrop-blur-sm">
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

// --- Helper Component for the "Smart" Input ---
// In a real app, this would be in its own file and handle dropdown logic.
// For now, it's a styled placeholder demonstrating the UI.
function FloatingLabelInput({ id, label, icon }: { id: string, label: string, icon: React.ReactNode }) {
  const [hasValue, setHasValue] = useState(false); // This would be controlled by parent state (e.g., selectedCategory !== null)

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        // In a real implementation, onClick would open a dropdown.
        // For demonstration, it just toggles the value state.
        onClick={() => setHasValue(!hasValue)}
        className="peer w-full text-left rounded-lg bg-white/10 px-4 pt-6 pb-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none
          ${hasValue
            ? 'top-2 text-xs text-blue-300'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-300'
          }`
        }
      >
        <div className="flex items-center gap-2">
          {icon}
          {label}
        </div>
      </label>
    </div>
  );
}