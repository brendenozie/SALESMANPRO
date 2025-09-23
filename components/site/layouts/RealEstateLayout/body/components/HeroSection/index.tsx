"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  // Import relevant icons for categories/types if available, e.g., HomeIcon
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { IStoreCategory, ISubcategory, StoreForm } from "@/types/typings"; // Assuming you have these types

// --- Types ---
interface HeroSlide {
  imageUrl: string;
  headline: string;
  subline: string;
}

interface TrendingLocation {
  name: string;
}

// Enhanced Store type to include categories
interface Store {
  heroSlides?: HeroSlide[];
  themeSettings?: {
    heroDefaultFilters?: {
      location?: string;
      minPrice?: string;
      maxPrice?: string;
    };
  };
  // Assume StoreCategory is available here or passed down
  StoreCategory?: IStoreCategory[];
}

// Updated SearchFilters to include category and subcategory
interface SearchFilters {
  location: string;
  minPrice: string;
  maxPrice: string;
  category?: string; // The ID or slug of the selected category
  subcategory?: string; // The ID or slug of the selected subcategory
}

interface HeroSectionProps {
  store?: StoreForm | null; // Allow null for initial render or when data isn't ready
  onSearch: (filters: SearchFilters) => void;
  trendingLocations?: TrendingLocation[];
}

// --- Defaults ---
const defaultHeroSlides: HeroSlide[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ffc4573f0053?q=80&w=2670&auto=format&fit=crop",
    headline: "Find Your Perfect\nUrban Oasis",
    subline: "Explore modern apartments and stylish lofts in the city's heart.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1594950939511-b76964a35043?q=80&w=2670&auto=format&fit=crop",
    headline: "Escape to Serene\nCountry Living",
    subline:
      "Discover spacious homes with sprawling gardens and tranquil views.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1579621970795-92683058860b?q=80&w=2670&auto=format&fit=crop",
    headline: "Luxury Awaits\nby the Coast",
    subline: "Browse stunning waterfront properties and exclusive seaside villas.",
  },
];

const defaultTrendingLocations: TrendingLocation[] = [
  { name: "New York City" },
  { name: "Los Angeles" },
  { name: "Miami" },
  { name: "Chicago" },
  { name: "San Francisco" },
  { name: "Seattle" },
  { name: "Austin" },
  { name: "Denver" },
  { name: "Boston" },
];

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

// --- Variants ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    x: "0%",
    opacity: 1,
    scale: 1,
    transition: {
      x: { duration: transitionDuration, ease: [0.6, 0.05, -0.01, 0.9] },
      opacity: { duration: transitionDuration * 0.7, ease: "easeOut" },
      scale: { duration: transitionDuration, ease: "easeInOut" },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.9,
    transition: {
      x: { duration: transitionDuration, ease: [0.6, 0.05, -0.01, 0.9] },
      opacity: { duration: transitionDuration * 0.7, ease: "easeOut" },
      scale: { duration: transitionDuration, ease: "easeInOut" },
    },
  }),
};

// --- Utilities ---
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

const Link: React.FC<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
> = ({ href, children, ...props }) => (
  <a href={href} {...props}>
    {children}
  </a>
);

// --- Component ---
export default function HeroSection({
  store,
  onSearch,
  trendingLocations = defaultTrendingLocations,
  // categories, // Expecting categories data
  // subcategories, // Expecting subcategories data
}: HeroSectionProps) {
  const heroSlides = store?.heroSlides?.length
    ? store.heroSlides
    : defaultHeroSlides;

  const [current, setCurrent] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const locationDropdownRef = useRef<HTMLDivElement | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const subcategoryDropdownRef = useRef<HTMLDivElement | null>(null);

  // Search states
  const [location, setLocation] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<IStoreCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubcategory | null>(null);

  // Dropdown states
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState<boolean>(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState<boolean>(false);
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState<boolean>(false);
  const [isLocationInputFocused, setIsLocationInputFocused] = useState<boolean>(false);

  const categories = (store?.storeFormData?.StoreCategory ?? [])
    .filter((c) => c.visible ?? true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const allSubcategories = categories.flatMap(cat => cat.subcategories || []);

  const displayedCategories = categories.length > 0 && categories.length <= 2 ? allSubcategories : categories;
  const isDisplayingSubcategories = categories.length > 0 && categories.length <= 2;
  

  // Filtered lists for dropdowns
  const filteredSubcategories = selectedCategory
    ? (selectedCategory.subcategories || []).filter((sub) => sub.visible ?? true)
    : allSubcategories.filter((sub) => sub.visible ?? true);

  const handleSearchSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({
      location,
      minPrice,
      maxPrice,
      category: selectedCategory?.categoryId || selectedCategory?.id,
      subcategory: selectedSubcategory?.slug || selectedSubcategory?.id,
    });
    // Optionally close dropdowns after search
    setIsLocationDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsSubcategoryDropdownOpen(false);
    setIsLocationInputFocused(false);
  }, [location, minPrice, maxPrice, selectedCategory, selectedSubcategory, onSearch]);

  const handleTrendingLocationClick = useCallback((loc: TrendingLocation) => {
    setLocation(loc.name);
    setIsLocationDropdownOpen(false);
    setIsLocationInputFocused(false); // Close focus state as well
  }, []);

  const handleCategorySelect = useCallback((cat: IStoreCategory) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(null); // Reset subcategory when category changes
    setIsCategoryDropdownOpen(false);
    setIsSubcategoryDropdownOpen(cat.subcategories && cat.subcategories.length > 0); // Open subcategory if available
  }, []);

  const handleSubcategorySelect = useCallback((subcat: ISubcategory) => {
    setSelectedSubcategory(subcat);
    setIsSubcategoryDropdownOpen(false);
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (heroSlides.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % heroSlides.length);
      }, autoAdvanceDelay);
    }
  }, [heroSlides.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, resetTimer]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
        setIsLocationInputFocused(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        subcategoryDropdownRef.current &&
        !subcategoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubcategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goTo = useCallback((idx: number, dir: number = 0) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  }, []);

  const prevSlide = useCallback(() => {
    if (heroSlides.length > 0) {
      goTo((current - 1 + heroSlides.length) % heroSlides.length, -1);
    }
  }, [current, heroSlides.length, goTo]);

  const nextSlide = useCallback(() => {
    if (heroSlides.length > 0) {
      goTo((current + 1) % heroSlides.length, 1);
    }
  }, [current, heroSlides.length, goTo]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset < -50) nextSlide();
    else if (offset > 50) prevSlide();
  }, [nextSlide, prevSlide]);

  // Filter trending locations based on input
  const filteredTrendingLocations = trendingLocations.filter((loc) =>
    loc.name.toLowerCase().includes(location.toLowerCase())
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Dynamic Background Slider */}
      <AnimatePresence initial={false} custom={direction}>
        {heroSlides.map((slide, idx) =>
          idx === current ? (
            <motion.div
              key={idx}
              className="absolute inset-0 z-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              <Image
                src={slide.imageUrl|| "https://images.unsplash.com/photo-1560518883-ffc4573f0053?q=80&w=2670&auto=format&fit=crop"}
                alt={slide.headline || "Real Estate Hero"}
                layout="fill"
                priority
                className="opacity-70 dark:opacity-40 filter brightness-90 saturate-120"
                loader={loader}
              />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Background Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-white/80 dark:to-teal-950/80" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-transparent to-white/20 dark:to-black/20" />

      {/* Main Content Overlay */}
      <div className="relative z-20 max-w-5xl text-center px-4 sm:px-6 lg:px-8 space-y-8">
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-gray-900 dark:text-white drop-shadow-lg tracking-tight text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {(() => {
            const headline = heroSlides[current]?.headline || "Discover Your Dream Home.";
            const words = headline.split(" ");
            if (words.length <= 3) {
              return headline;
            }
            const firstLine = words.slice(0, 3).join(" ");
            const secondLine = words.slice(3).join(" ");
            return (
              <>
                {firstLine}
                <br />
                {secondLine}
              </>
            );
          })()}
        </motion.h1>

        <motion.p
          className="mt-4 text-lg md:text-xl font-light text-gray-600 dark:text-gray-200 max-w-3xl mx-auto drop-shadow-sm"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {heroSlides[current]?.subline ||
            "Seamlessly search for properties by location, type, and price range. Your ideal living space awaits."}
        </motion.p>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearchSubmit}
          className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-4 p-6 sm:p-8 rounded-3xl shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl border border-gray-200/50 dark:border-gray-700/50"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          aria-label="Search properties form"
        >
          {/* Location Input with Integrated Dropdown */}
          <div className="relative col-span-full md:col-span-2" ref={locationDropdownRef}>
            <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setIsLocationDropdownOpen(e.target.value.length > 0);
                setIsLocationInputFocused(true); // Keep focus state when typing
              }}
              onFocus={() => setIsLocationInputFocused(true)}
              // onBlur removed to keep dropdown open while typing and clicking on it
              aria-label="Location"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-amber-400/50 transition hover:scale-[1.01]"
            />
            <AnimatePresence>
              {isLocationInputFocused && filteredTrendingLocations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  <ul className="py-2 max-h-48 overflow-y-auto">
                    {filteredTrendingLocations.map((loc, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => handleTrendingLocationClick(loc)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {loc.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Select */}
          <div className="relative col-span-full md:col-span-1" ref={categoryDropdownRef}>
            <input
              type="text"
              placeholder="Category"
              value={selectedCategory?.displayName || ""}
              readOnly
              onFocus={() => setIsCategoryDropdownOpen(true)}
              aria-label="Select category"
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-amber-400/50 transition hover:scale-[1.01]"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-emerald-600 dark:text-emerald-400">
              {/* Optional: Add an icon here */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <AnimatePresence>
              {isCategoryDropdownOpen && categories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  <ul className="py-2 max-h-48 overflow-y-auto">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <button
                          type="button"
                          onClick={() => handleCategorySelect(cat)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {cat.displayName}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subcategory Select */}
          <div className="relative col-span-full md:col-span-1" ref={subcategoryDropdownRef}>
            <input
              type="text"
              placeholder="Subcategory"
              value={selectedSubcategory?.name || ""}
              readOnly
              disabled={!selectedCategory || filteredSubcategories.length === 0}
              onFocus={() => {
                if (selectedCategory && filteredSubcategories.length > 0) {
                  setIsSubcategoryDropdownOpen(true);
                }
              }}
              aria-label="Select subcategory"
              className={`w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-amber-400/50 transition hover:scale-[1.01] ${
                (!selectedCategory || filteredSubcategories.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-emerald-600 dark:text-emerald-400">
              {/* Optional: Add an icon here */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <AnimatePresence>
              {isSubcategoryDropdownOpen && filteredSubcategories.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                >
                  <ul className="py-2 max-h-48 overflow-y-auto">
                    {filteredSubcategories.map((subcat) => (
                      <li key={subcat.id}>
                        <button
                          type="button"
                          onClick={() => handleSubcategorySelect(subcat)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {subcat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Min Price Input */}
          <div className="relative col-span-full md:col-span-1">
            <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="Minimum price"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-amber-400/50 transition hover:scale-[1.01]"
            />
          </div>
          {/* Max Price Input */}
          <div className="relative col-span-full md:col-span-1">
            <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Maximum price"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-amber-400/50 transition hover:scale-[1.01]"
            />
          </div>
          {/* Search Button */}
          <motion.button
            type="submit"
            className="col-span-full md:col-span-1 flex items-center justify-center space-x-3 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl focus:ring-4 focus:ring-amber-400/70 transition hover:scale-[1.02] active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Search listings"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
            <span>Search</span>
          </motion.button>
        </motion.form>

        {/* Video Guide (moved and simplified) */}
        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link
            href="/how-it-works"
            className="inline-flex items-center space-x-3 text-lg font-medium text-gray-800 dark:text-white hover:text-amber-600 dark:hover:text-amber-300 transition"
          >
            <PlayCircleIcon className="w-8 h-8 text-amber-400" />
            <span>Watch Video Guide</span>
          </Link>
        </motion.div>
      </div>

      {/* Navigation Buttons and Dots */}
      <div className="absolute top-1/2 left-6 transform -translate-y-1/2 z-30">
        <button
          onClick={prevSlide}
          className="bg-white/70 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-6 w-6 md:h-7 md:w-7" />
        </button>
      </div>
      <div className="absolute top-1/2 right-6 transform -translate-y-1/2 z-30">
        <button
          onClick={nextSlide}
          className="bg-white/70 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-6 w-6 md:h-7 md:w-7" />
        </button>
      </div>

      {/* Pagination Dots with Progress Bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx, idx > current ? 1 : -1)}
            className={`relative w-3.5 h-3.5 rounded-full overflow-hidden transition-all duration-300 ease-in-out border-2 ${
              idx === current ? "border-gray-800 scale-125 dark:border-white" : "border-gray-400 opacity-70 hover:scale-110"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          >
            {idx === current && (
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gray-800 dark:bg-white transition-[width]"
                style={{
                  width: "100%",
                  transitionDuration: `${autoAdvanceDelay}ms`,
                  transitionTimingFunction: "linear",
                }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}