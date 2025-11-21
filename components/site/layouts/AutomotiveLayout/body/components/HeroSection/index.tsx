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
import { TrendingLocation } from "@/components/site/layouts/TravelLayout/body/TravelSite";

// --- TYPES ---
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

// Custom loader
const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Default slides
const heroSlidesData: ISlide[] = [
  {
    id: "slide1",
    imageUrl:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2670&auto=format&fit=crop",
    headline: "Your Dream Ride Awaits",
    subline: "Explore the largest curated collection of new and pre-owned vehicles.",
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

const autoAdvanceDelay = 8000;

// Motion variants
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

// MAIN COMPONENT
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
  const heroSlides =
    store?.heroSlides?.length ? store.heroSlides : heroSlidesData;

  const categories: any[] = store?.StoreCategory ?? [];

  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Safe fallback filters
  const safeFilters: IFilters = {
    location: filters?.location ?? null,
    vehicleType: filters?.vehicleType ?? null,
    minPrice: filters?.minPrice ?? "",
    maxPrice: filters?.maxPrice ?? "",
    isBuy: filters?.isBuy ?? true,
    year: filters?.year ?? null,
  };

  const updateFilters = (updates: PartialFilters) =>
    setFilters({ ...safeFilters, ...updates });

  const advanceSlide = useCallback(
    (dir: "next" | "prev") => {
      setCurrent((prev) =>
        dir === "next"
          ? (prev + 1) % heroSlides.length
          : (prev - 1 + heroSlides.length) % heroSlides.length
      );
    },
    [heroSlides.length]
  );

  // Auto-advance slides
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {``
      advanceSlide("next");
    }, autoAdvanceDelay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, advanceSlide]);

  const currentSlide = heroSlides[current];
  const { isBuy } = safeFilters;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          {/* Background image or video */}
          {currentSlide.imageUrl || currentSlide.productImageUrl ? (
            <Image
              src={currentSlide.imageUrl || currentSlide.productImageUrl || ""}
              alt={currentSlide.headline || "Hero Slide"}
              fill
              priority={current === 0}
              loader={customLoader}
              className="object-cover"
            />
          ) : (
            <video
              src={store?.videoUrl || "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4"}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* CONTENT */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-center"
        >
          {/* SLIDE TEXT */}
          <motion.h1
            key={current}
            variants={textItemVariants}
            className="text-4xl sm:text-6xl md:text-7xl text-white font-extrabold drop-shadow"
          >
            {isBuy ? currentSlide.headline : "Effortless Car Rentals"}
          </motion.h1>

          <motion.p
            variants={textItemVariants}
            className="mt-3 text-gray-200 max-w-2xl sm:text-xl drop-shadow"
          >
            {currentSlide.subline}
          </motion.p>

          {/* BUY / RENT TOGGLE */}
          <motion.div
            variants={textItemVariants}
            className="relative mt-8 flex w-full max-w-xs bg-white/20 backdrop-blur-md p-1 rounded-full"
          >
            <motion.div
              layout
              className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-blue-500 rounded-full"
              animate={{ x: isBuy ? 0 : "100%" }}
              transition={{ type: "spring", stiffness: 250, damping: 30 }}
            />

            <button
              onClick={() => updateFilters({ isBuy: true })}
              className={`relative z-10 w-1/2 py-2 font-bold ${
                isBuy ? "text-white" : "text-gray-800"
              }`}
            >
              Buy a Car
            </button>

            <button
              onClick={() => updateFilters({ isBuy: false })}
              className={`relative z-10 w-1/2 py-2 font-bold ${
                !isBuy ? "text-white" : "text-gray-800"
              }`}
            >
              Rent a Car
            </button>
          </motion.div>

          {/* SEARCH BAR */}
          <motion.form
            variants={textItemVariants}
            onSubmit={onSearch}
            className="
              mt-10 w-full max-w-6xl p-2
              flex flex-col md:flex-row
              gap-2 md:gap-0
              bg-white/95 shadow-xl backdrop-blur-md
              rounded-xl md:rounded-full
            "
          >
            {/* LOCATION */}
            <div className="flex-1 md:border-r md:border-gray-300 md:pr-2">
              <FloatingLabelDropdown
                id="location"
                label="Location"
                icon={<MapPinIcon className="h-5 w-5" />}
                options={trendingLocations}
                selectedValue={safeFilters.location}
                onSelect={(v) => updateFilters({ location: v })}
              />
            </div>

            {/* VEHICLE TYPE */}
            <div className="hidden md:flex flex-1 md:px-3 md:border-r md:border-gray-300">
              <FloatingLabelDropdown
                id="vehicleType"
                label="Vehicle Type"
                icon={<TruckIcon className="h-5 w-5" />}
                options={categories}
                selectedValue={safeFilters.vehicleType}
                onSelect={(v) => updateFilters({ vehicleType: v })}
              />
            </div>

            {/* PRICE */}
            <div className="hidden md:flex flex-1 items-center md:px-3 divide-x divide-gray-300">
              <input
                type="number"
                placeholder="Min Price"
                className="w-1/2 p-3 text-sm bg-transparent border-none focus:ring-0"
                value={safeFilters.minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
              />
              <input
                type="number"
                placeholder="Max Price"
                className="w-1/2 p-3 text-sm bg-transparent border-none focus:ring-0"
                value={safeFilters.maxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
              />
            </div>

            {/* SEARCH BUTTON */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="h-12 w-full md:w-48 bg-blue-600 text-white font-bold rounded-lg md:rounded-full flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" /> Find Car
            </motion.button>
          </motion.form>

          {/* MOBILE NOTE */}
          <p className="mt-4 md:hidden text-gray-300 text-sm">
            Need more options? Use the filters on search results.
          </p>
        </motion.div>
      </div>

      {/* CAROUSEL CONTROLS */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <button
            onClick={() => advanceSlide("prev")}
            className="p-2 bg-white/30 rounded-full text-white backdrop-blur hover:bg-white/50"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>

          {/* Progress Indicators */}
          <div className="flex flex-1 gap-2">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrent(idx)}
                className="flex-1 h-2 bg-white/40 rounded-full overflow-hidden"
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
            className="p-2 bg-white/30 rounded-full text-white backdrop-blur hover:bg-white/50"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
