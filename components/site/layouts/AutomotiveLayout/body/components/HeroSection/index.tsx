"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  TruckIcon,
  TagIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- Types ---
interface IStoreCategory {
  id: string;
  displayName: string;
  slug: string;
  visible?: boolean;
  sortOrder?: number;
  subcategories?: ISubcategory[];
}

interface ISubcategory {
  id: string;
  name: string;
  slug: string;
  visible?: boolean;
}

interface HeroSlide {
  imageUrl: string;
  headline: string;
  subline: string;
}

interface TrendingLocation {
  name: string;
}

interface StoreForm {
  heroSlides?: HeroSlide[];
  StoreCategory?: IStoreCategory[];
}

interface SearchFilters {
  isBuy: boolean;
  location: string;
  minPrice: string;
  maxPrice: string;
  category: string;
  subcategory: string;
}

interface HeroSectionProps {
  store?: StoreForm | null;
  trendingLocations?: TrendingLocation[];
  onSearch: (filters: SearchFilters) => void;
}

// --- Defaults & Constants ---
const defaultHeroSlides: HeroSlide[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2670&auto=format&fit=crop",
    headline: "Your Dream Ride Awaits",
    subline: "Explore thousands of new and used cars from trusted dealers.",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1517524206127-48bbd363f357?q=80&w=2670&auto=format&fit=crop",
    headline: "Power and Performance Unleashed",
    subline: "Find the perfect sports car that matches your passion for speed.",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1617531653520-4893f7bbf0b3?q=80&w=2670&auto=format&fit=crop",
    headline: "Adventure-Ready SUVs",
    subline: "Discover rugged and reliable vehicles built for any terrain.",
  },
];

const defaultTrendingLocations: TrendingLocation[] = [
  { name: "New York, NY" }, { name: "Los Angeles, CA" }, { name: "Chicago, IL" },
  { name: "Houston, TX" }, { name: "Phoenix, AZ" }, { name: "Miami, FL" },
  { name: "Atlanta, GA" }, { name: "Dallas, TX" }, { name: "Denver, CO" }
];

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const autoAdvanceDelay = 7000;
const swipeConfidenceThreshold = 10000;

// --- Animation Variants ---
const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: "0%", opacity: 1, transition: { duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] } },
  exit: (direction: number) => ({ x: direction < 0 ? "100%" : "-100%", opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }),
};

const dropdownVariants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } },
};

// --- Component ---
export default function HeroSection({ store, trendingLocations = defaultTrendingLocations, onSearch }: HeroSectionProps) {
  const heroSlides = store?.heroSlides?.length ? store.heroSlides : defaultHeroSlides;
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
  const filteredTrendingLocations = trendingLocations.filter((loc) =>
    loc.name.toLowerCase().includes(location.toLowerCase())
  );

  // Carousel Logic
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (heroSlides.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % heroSlides.length);
      }, autoAdvanceDelay);
    }
  }, [heroSlides.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, resetTimer]);

  const goTo = useCallback((idx: number) => {
    if (idx === current) return;
    const dir = idx > current ? 1 : -1;
    setDirection(dir);
    setCurrent(idx);
    resetTimer();
  }, [current, resetTimer]);

  const swipeTo = (swipeDirection: number) => {
    const newDirection = swipeDirection > 0 ? 1 : -1;
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + heroSlides.length) % heroSlides.length);
  };

  const handlePanEnd = (_: any, info: PanInfo) => {
    const swipe = info.velocity.x;
    if (Math.abs(swipe) > swipeConfidenceThreshold) {
      swipeTo(-swipe);
    }
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % heroSlides.length);
    resetTimer();
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    resetTimer();
  };

  // Click-outside handler for ALL dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownRefs.current).forEach((key) => {
        const ref = dropdownRefs.current[key];
        const setter = key === 'location' ? setIsLocationDropdownOpen : key === 'category' ? setIsCategoryDropdownOpen : setIsSubcategoryDropdownOpen;
        if (ref && !ref.contains(event.target as Node)) {
          setter(false);
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch({ isBuy, location, minPrice, maxPrice, category: selectedCategory?.slug || "", subcategory: selectedSubcategory?.slug || "" });
  }, [isBuy, location, minPrice, maxPrice, selectedCategory, selectedSubcategory, onSearch]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-950">
      {/* Background Slideshow */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          className="absolute inset-0 z-0"
          variants={slideVariants}
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <Image
            src={heroSlides[current].imageUrl}
            alt={heroSlides[current].headline}
            loader={customLoader}
            fill
            priority
            className="object-cover object-center brightness-[.65] saturate-[1.2] transition-all duration-1000 ease-in-out"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-20 max-w-6xl w-full text-center px-4 sm:px-6 lg:px-8">
        <motion.h1
          key={isBuy ? 'buy' : 'rent'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-xl"
        >
          {isBuy ? heroSlides[current].headline : "Effortless Car Rentals"}
        </motion.h1>
        <motion.p
          className="mt-4 text-base md:text-lg text-gray-300 max-w-3xl mx-auto drop-shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          {isBuy ? heroSlides[current].subline : "Find the right vehicle for your next trip, available by the day or week."}
        </motion.p>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearchSubmit}
          className="mt-10 p-6 rounded-3xl shadow-2xl bg-white/10 backdrop-blur-3xl border border-white/20 transform-gpu"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
        >
          {/* Buy/Rent Toggle */}
          <div className="flex justify-center bg-white/20 p-1 rounded-full mb-6 max-w-sm mx-auto shadow-inner">
            <motion.button
              type="button"
              onClick={() => setIsBuy(true)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${isBuy ? 'bg-blue-600 text-white shadow-md' : 'text-gray-200'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Buy a Car
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsBuy(false)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${!isBuy ? 'bg-blue-600 text-white shadow-md' : 'text-gray-200'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Rent a Car
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Location Input with Dropdown */}
            <div className="relative md:col-span-3" ref={el => dropdownRefs.current.location = el}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City or ZIP"
                  value={location}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                  onChange={(e) => { setLocation(e.target.value); setIsLocationDropdownOpen(true); }}
                  className="w-full pl-11 pr-4 py-3.5 rounded-lg bg-white/5 dark:bg-gray-800/20 text-gray-100 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-400"
                />
              </motion.div>
              <AnimatePresence>
                {isLocationDropdownOpen && filteredTrendingLocations.length > 0 && (
                  <motion.ul
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute top-full mt-2 w-full bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-xl border border-white/20 backdrop-blur-lg overflow-y-auto max-h-48 z-50"
                  >
                    {filteredTrendingLocations.map((loc) => (
                      <li
                        key={loc.name}
                        onClick={() => { setLocation(loc.name); setIsLocationDropdownOpen(false); }}
                        className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                      >
                        {loc.name}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Vehicle Type (Category) */}
            <div className="relative md:col-span-2" ref={el => dropdownRefs.current.category = el}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full text-left pl-11 pr-10 py-3.5 rounded-lg bg-white/5 dark:bg-gray-800/20 text-gray-100 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none flex items-center justify-between transition-all"
                >
                  <TruckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <span className={selectedCategory ? '' : 'text-gray-400'}>{selectedCategory?.displayName || 'Vehicle Type'}</span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </motion.div>
              <AnimatePresence>
                {isCategoryDropdownOpen && (
                  <motion.ul
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute top-full mt-2 w-full bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-xl border border-white/20 backdrop-blur-lg overflow-hidden z-50"
                  >
                    {categories.map((cat) => (
                      <motion.li
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); setIsCategoryDropdownOpen(false); }}
                        className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                        variants={{ initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } }}
                      >
                        {cat.displayName}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Model (Subcategory) */}
            <div className="relative md:col-span-2" ref={el => dropdownRefs.current.subcategory = el}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <button
                  type="button"
                  onClick={() => setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen)}
                  disabled={!selectedCategory}
                  className="w-full text-left pl-11 pr-10 py-3.5 rounded-lg bg-white/5 dark:bg-gray-800/20 text-gray-100 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <span className={selectedSubcategory ? '' : 'text-gray-400'}>{selectedSubcategory?.name || 'Model'}</span>
                  <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isSubcategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </motion.div>
              <AnimatePresence>
                {isSubcategoryDropdownOpen && filteredSubcategories.length > 0 && (
                  <motion.ul
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute top-full mt-2 w-full bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-xl border border-white/20 backdrop-blur-lg overflow-y-auto max-h-48 z-50"
                  >
                    {filteredSubcategories.map((sub) => (
                      <motion.li
                        key={sub.id}
                        onClick={() => { setSelectedSubcategory(sub); setIsSubcategoryDropdownOpen(false); }}
                        className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50/50 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                        variants={{ initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } }}
                      >
                        {sub.name}
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Price Inputs */}
            <div className="relative md:col-span-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Min Price"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-lg bg-white/5 dark:bg-gray-800/20 text-gray-100 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-400"
                />
              </motion.div>
            </div>
            <div className="relative md:col-span-2">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
                <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-lg bg-white/5 dark:bg-gray-800/20 text-gray-100 border border-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder-gray-400"
                />
              </motion.div>
            </div>
            
            {/* Search Button */}
            <motion.button
              type="submit"
              className="md:col-span-1 w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg hover:shadow-xl active:shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              <span className="hidden md:inline">Search</span>
            </motion.button>
          </div>
        </motion.form>
      </div>

      {/* Navigation & Pan Gesture Area */}
      {heroSlides.length > 1 && (
        <motion.div
          className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
          onPanEnd={handlePanEnd}
        >
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white backdrop-blur-sm transition-all"
            aria-label="Previous slide"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 p-3 rounded-full text-white backdrop-blur-sm transition-all"
            aria-label="Next slide"
          >
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </motion.div>
      )}

      {/* Slide Indicators */}
      {heroSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
          {heroSlides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => goTo(idx)}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                backgroundColor: current === idx ? 'white' : 'rgba(255, 255, 255, 0.5)',
                scale: current === idx ? 1.2 : 1
              }}
              aria-label={`Go to slide ${idx + 1}`}
              initial={{ scale: 1 }}
              animate={{ scale: current === idx ? 1.2 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            />
          ))}
        </div>
      )}
    </section>
  );
}