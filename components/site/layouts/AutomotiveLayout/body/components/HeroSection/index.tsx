"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import FloatingLabelDropdown from "../FloatingLabelDropdown";
import { IStoreCategory, StoreForm } from "@/types/typings"; // Assuming ISubcategory was only for unused state

// --- TYPESCRIPT IMPROVEMENT: Define types for slides and filters ---
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
  vehicleType: string | null; // Assuming vehicleType is a string ID or name
  minPrice: number | string;
  maxPrice: number | string;
}


// ---

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- DATA IMPROVEMENT: Standardized keys (imageUrl, videoUrl) ---
const heroSlidesData: ISlide[] = [
  {
    id: "slide1",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2670&auto=format&fit=crop",
    productImageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2670&auto=format&fit=crop",
    headline: "Your Dream Ride Awaits",
    subline:
      "Explore the largest curated collection of new and pre-owned vehicles.",
  },
  {
    id: "slide2",
    videoUrl:
      "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4",

    headline: "Luxury Meets Performance",
    subline: "Discover premium vehicles that redefine the art of driving.",
  },
  {
    id: "slide3",
    imageUrl:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2670&auto=format&fit=crop",
    productImageUrl:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2670&auto=format&fit=crop",
    headline: "Drive Into the Future",
    subline: "Choose from cutting-edge electric and hybrid cars.",
  },
];

const autoAdvanceDelay = 8000; // 8 seconds

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
  id: string; // Assuming options have an ID for keys
  name: string;
}

interface HeroSectionProps {
  store?: StoreForm | null | undefined;
  trendingLocations?: TrendingLocation[];
  filters: IFilters | undefined; // Use defined interface
  setFilters: (filters: IFilters) => void; // Use defined interface
  onSearch: (e: React.FormEvent) => void;
}

type PartialFilters = Partial<IFilters>;


export default function HeroSection({
  store,
  trendingLocations = [], // Default to empty array
  filters,
  setFilters,
  onSearch,
}: HeroSectionProps) {
  // Use store slides if available, otherwise default
  const heroSlides = store && store?.heroSlides?.length > 0 ? store.heroSlides : heroSlidesData;
  const categories = store?.StoreCategory ?? [];

  const [current, setCurrent] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isBuy, setIsBuy] = useState(true);

  // --- Ensure filters always has defaults ---
  const safeFilters: IFilters = {
    location: filters?.location ?? null,
    vehicleType: filters?.vehicleType ?? null,
    minPrice: filters?.minPrice ?? "",
    maxPrice: filters?.maxPrice ?? "",
  };

  const updateFilters = (updates: PartialFilters) => {
    setFilters({ ...safeFilters, ...updates });
  };

  // --- REACT PRACTICE: Updated dependency to be more robust ---
  const advanceSlide = useCallback(
    (direction: "next" | "prev") => {
      if (direction === "next") {
        setCurrent((prev) => (prev + 1) % heroSlides.length);
      } else {
        setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
      }
    },
    [heroSlides] // Depend on the slides array itself
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, advanceSlide]);

  const handleIndicatorClick = (index: number) => {
    setCurrent(index);
  };

  const currentSlide = heroSlides[current];

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white">
      <AnimatePresence initial={false}>
        <motion.div
          key={current} // Use slide ID or index
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* --- DATA FIX: Render based on available URL keys --- */}
          {currentSlide.imageUrl || currentSlide.productImageUrl ? (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { duration: 1.5, ease: "easeOut" },
              }}
            >
              <Image
                src={currentSlide.imageUrl || currentSlide.productImageUrl || ""}
                alt={currentSlide.headline || "Hero Slide"}
                fill
                priority={current === 0} // Only prioritize the first slide
                className="object-cover"
                loader={customLoader}
              />
            </motion.div>
          ) : store?.videoUrl ? (
            <video
              key={store.videoUrl} // Add key for video source change
              src={store.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            // Fallback for missing media
            <div className="absolute inset-0 bg-gray-200" />
          )}
          {/* Inverted gradient overlay for light mode */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-white/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-center">
        <motion.div
          key={current} // Re-animate text on slide change
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          <motion.h1
            variants={itemVariants}
            className="text-5xl font-extrabold tracking-tight text-gray-900 drop-shadow-xl sm:text-6xl md:text-7xl"
          >
            {isBuy ? currentSlide.headline : "Effortless Car Rentals"}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-4 max-w-2xl text-lg text-gray-700 drop-shadow-lg sm:text-xl"
          >
            {currentSlide.subline}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="relative mt-8 flex w-full max-w-xs justify-center overflow-hidden rounded-full bg-gray-200/50 p-1"
            role="tablist" // --- ACCESSIBILITY: Add role ---
            aria-label="Action Type"
          >
            <motion.div
              layout
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-blue-600 shadow-md"
              initial={false}
              animate={{ x: isBuy ? "-50%" : "50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setIsBuy(true)}
              className="relative z-10 w-1/2 py-2.5 text-sm font-semibold text-gray-900 transition-colors duration-300"
              role="tab" // --- ACCESSIBILITY: Add role ---
              aria-selected={isBuy} // --- ACCESSIBILITY: Add selected state ---
            >
              Buy a Car
            </button>
            <button
              onClick={() => setIsBuy(false)}
              className="relative z-10 w-1/2 py-2.5 text-sm font-semibold text-gray-900 transition-colors duration-300"
              role="tab" // --- ACCESSIBILITY: Add role ---
              aria-selected={!isBuy} // --- ACCESSIBILITY: Add selected state ---
            >
              Rent a Car
            </button>
          </motion.div>

          {/* --- BUG FIX: Added onSubmit handler --- */}
          <motion.form
            variants={itemVariants}
            className="mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white/50 p-6 shadow-2xl backdrop-blur-md md:grid-cols-4"
            onSubmit={onSearch} // This will now trigger the search
          >
            <FloatingLabelDropdown
              id="location"
              label="Location"
              icon={<MapPinIcon className="h-5 w-5" />}
              options={trendingLocations}
              selectedValue={safeFilters.location}
              onSelect={(value) => updateFilters({ location: value })}
            />
            <FloatingLabelDropdown
              id="vehicleType"
              label="Vehicle Type"
              icon={<TruckIcon className="h-5 w-5" />}
              options={categories}
              selectedValue={safeFilters.vehicleType}
              onSelect={(value) => updateFilters({ vehicleType: value })}
            />
            <div className="relative grid grid-cols-2 gap-4 md:col-span-2">
              
              <input
                type="number"
                placeholder="Min Price"
                value={safeFilters.minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
              />

              <input
                type="number"
                placeholder="Max Price"
                value={safeFilters.maxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
              />
            </div>

            <motion.button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg transition-all md:col-span-4"
              whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <MagnifyingGlassIcon className="h-5 w-5" /> Find Your Car
            </motion.button>
          </motion.form>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <button
            onClick={() => advanceSlide("prev")}
            className="rounded-full bg-white/50 p-2 text-gray-800 backdrop-blur-sm transition hover:bg-white/70"
            aria-label="Previous slide" // --- ACCESSIBILITY: Add label ---
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          {/* --- ACCESSIBILITY: Converted to button tablist --- */}
          <div className="flex flex-1 gap-2" role="tablist" aria-label="Slides">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                className="h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-gray-300"
                onClick={() => handleIndicatorClick(idx)}
                role="tab"
                aria-selected={idx === current}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {idx === current ? (
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: autoAdvanceDelay / 1000,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: idx < current ? "100%" : "0" }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => advanceSlide("next")}
            className="rounded-full bg-white/50 p-2 text-gray-800 backdrop-blur-sm transition hover:bg-white/70"
            aria-label="Next slide" // --- ACCESSIBILITY: Add label ---
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}