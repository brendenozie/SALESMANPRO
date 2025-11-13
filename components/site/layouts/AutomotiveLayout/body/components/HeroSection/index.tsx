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
import { IStoreCategory, StoreForm } from "@/types/typings";
import { TrendingLocation } from "@/components/site/layouts/TravelLayout/body/TravelSite"; // Assuming this is correct

// --- TYPESCRIPT INTERFACES ---
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

// --- CONSTANTS & VARIANTS ---
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const heroSlidesData: ISlide[] = [
  {
    id: "slide1",
    imageUrl:
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

const textItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

// --- COMPONENT PROPS & LOGIC ---

interface HeroSectionProps {
  store?: StoreForm | null | undefined;
  trendingLocations?: TrendingLocation[];
  filters: IFilters | undefined;
  setFilters: (filters: IFilters) => void;
  onSearch: (e: React.FormEvent) => void;
}

type PartialFilters = Partial<IFilters>;

export default function HeroSection({
  store,
  trendingLocations = [],
  filters,
  setFilters,
  onSearch,
}: HeroSectionProps) {
  const heroSlides =
    store && store?.heroSlides?.length > 0 ? store.heroSlides : heroSlidesData;
  const categories = store?.StoreCategory ?? [];

  const [current, setCurrent] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- FIX: Ensure filters always has defaults and use parent state for isBuy ---
  const safeFilters: IFilters = {
    location: filters?.location ?? null,
    vehicleType: filters?.vehicleType ?? null,
    minPrice: filters?.minPrice ?? "",
    maxPrice: filters?.maxPrice ?? "",
    isBuy: filters?.isBuy ?? true, // Default to true if not set
    year: filters?.year ?? null,
  };

  const updateFilters = (updates: PartialFilters) => {
    setFilters({ ...safeFilters, ...updates });
  };

  const advanceSlide = useCallback(
    (direction: "next" | "prev") => {
      if (direction === "next") {
        setCurrent((prev) => (prev + 1) % heroSlides.length);
      } else {
        setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
      }
    },
    [heroSlides]
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

  // Destructure the fixed state
  const { isBuy } = safeFilters;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-900">
      <AnimatePresence initial={false}>
        {/* Background Media */}
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        >
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
                priority={current === 0}
                className="object-cover"
                loader={customLoader}
              />
            </motion.div>
          ) : store?.videoUrl ? (
            <video
              key={store.videoUrl}
              src={store.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* --- Animated Text --- */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-center"
            >
              <motion.h1
                variants={textItemVariants}
                className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] sm:text-6xl md:text-7xl"
              >
                {isBuy ? currentSlide.headline : "Effortless Car Rentals"}
              </motion.h1>

              <motion.p
                variants={textItemVariants}
                className="mt-2 max-w-2xl text-base text-gray-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] sm:text-xl"
              >
                {currentSlide.subline}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* --- Buy/Rent Toggle (Now controls parent state) --- */}
          <motion.div
            variants={textItemVariants}
            className="relative mt-8 flex w-full max-w-xs justify-center overflow-hidden rounded-full bg-white/20 p-1"
            role="tablist"
            aria-label="Action Type"
          >
            <motion.div
              layout
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-blue-500 shadow-lg"
              initial={false}
              animate={{ x: isBuy ? "-50%" : "50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              // FIX: Update the parent filter state
              onClick={() => updateFilters({ isBuy: true })}
              className={`relative z-10 w-1/2 py-2.5 text-sm font-bold transition-colors duration-300 ${
                isBuy ? "text-white" : "text-gray-900"
              }`}
              role="tab"
              aria-selected={isBuy}
            >
              Buy a Car
            </button>
            <button
              // FIX: Update the parent filter state
              onClick={() => updateFilters({ isBuy: false })}
              className={`relative z-10 w-1/2 py-2.5 text-sm font-bold transition-colors duration-300 ${
                !isBuy ? "text-white" : "text-gray-900"
              }`}
              role="tab"
              aria-selected={!isBuy}
            >
              Rent a Car
            </button>
          </motion.div>

          {/* --- REDESIGNED INTEGRATED SEARCH PILL (Mobile-Friendly) --- */}
          <motion.form
            variants={textItemVariants}
            onSubmit={onSearch}
            className="mt-12 w-full max-w-6xl p-2 shadow-3xl backdrop-blur-sm transition-all duration-300
                        // Desktop/Tablet (Flex Row)
                        md:flex md:items-stretch md:rounded-full md:bg-white/95
                        // Mobile (Vertical Stack)
                        sm:rounded-xl sm:bg-white/95 sm:space-y-2
                        flex flex-col sm:flex-row md:flex-row"
          >
            {/* 1. Location Dropdown (Stays wide on mobile) */}
            <div className="flex-1 md:border-r md:border-gray-200 md:pr-2">
              <FloatingLabelDropdown
                id="location"
                label="Location"
                icon={<MapPinIcon className="h-5 w-5" />}
                options={trendingLocations}
                selectedValue={safeFilters.location}
                onSelect={(value) => updateFilters({ location: value })}
                className="w-full"
              />
            </div>

            {/* 2. Vehicle Type Dropdown (Hidden on mobile, only appears on MD+) */}
            <div className="hidden md:flex flex-1 md:border-r md:border-gray-200 md:px-3">
              <FloatingLabelDropdown
                id="vehicleType"
                label="Vehicle Type"
                icon={<TruckIcon className="h-5 w-5" />}
                options={categories}
                selectedValue={safeFilters.vehicleType}
                onSelect={(value) => updateFilters({ vehicleType: value })}
                className="w-full"
              />
            </div>

            {/* 3. Price Range (Hidden on mobile, only appears on MD+) */}
            <div className="hidden md:relative md:flex flex-1 items-center divide-x divide-gray-200 md:px-3">
              <input
                type="number"
                placeholder="Min Price (e.g., 5000)"
                className="h-full w-1/2 border-none bg-transparent p-3 text-sm text-gray-800 placeholder-gray-500 focus:ring-0"
                value={safeFilters.minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max Price (e.g., 80000)"
                className="h-full w-1/2 border-none bg-transparent p-3 text-sm text-gray-800 placeholder-gray-500 focus:ring-0"
                value={safeFilters.maxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
              />
            </div>
            
            {/* 4. Search Button (Full width on mobile, rounded end on desktop) */}
            <motion.button
              type="submit"
              className="mt-2 md:mt-0 flex h-12 w-full md:w-48 flex-shrink-0 items-center justify-center gap-2 rounded-lg md:rounded-full bg-blue-600 px-4 text-sm font-bold text-white shadow-xl transition-all"
              whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <MagnifyingGlassIcon className="h-5 w-5" /> Find Car
            </motion.button>
          </motion.form>
          
          {/* --- Mobile: Secondary Filter Button (Call to action for hidden filters) --- */}
          <p className="mt-4 md:hidden text-gray-200 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Need more options? Use the search results filter!
          </p>

        </motion.div>
      </div>

      {/* --- CAROUSEL CONTROLS --- */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <button
            onClick={() => advanceSlide("prev")}
            className="rounded-full bg-white/30 p-2 text-white shadow-md backdrop-blur-lg transition hover:bg-white/50"
            aria-label="Previous slide"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          <div className="flex flex-1 gap-2" role="tablist" aria-label="Slides">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                className="h-2 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/40 transition-colors hover:bg-white/70"
                onClick={() => handleIndicatorClick(idx)}
                role="tab"
                aria-selected={idx === current}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {idx === current && (
                  <motion.div
                    className="h-full bg-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: autoAdvanceDelay / 1000,
                      ease: "linear",
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={() => advanceSlide("next")}
            className="rounded-full bg-white/30 p-2 text-white shadow-md backdrop-blur-lg transition hover:bg-white/50"
            aria-label="Next slide"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}