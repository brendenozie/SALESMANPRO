// HeroSection.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { IDestination, IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";

/**
 * Reimagined HeroSection with a single, visually appealing search bar.
 * - Progressive disclosure for a clean initial view.
 * - Smart search input for location and destination.
 * - Interactive, pill-shaped filters for a better UX.
 */

/* ----------------------------- Types ----------------------------------- */
interface HeroSlide {
  type?: "image" | "video";
  url: string;
  headline?: string;
  subline?: string;
  id?: string | number;
}

interface SearchFilters {
  location?: string;
  destination?: string;
  category?: string;
  subcategory?: string;
  date?: string;
  guests?: number;
}

interface Props {
  storeFormData?: StoreForm | null;
  onSearch: (filters: SearchFilters) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  trendingLocations: TrendingLocation[];
}

/* ------------------------- curated fallback ---------------------------- */
const curatedCategoriesFallback: Partial<IStoreCategory>[] = [
  {
    id: "adventure",
    displayName: "Adventure",
    visible: true,
    subcategories: [
      { id: "hiking", displayName: "Hiking & Trekking" },
      { id: "rafting", displayName: "River Rafting" },
    ],
  },
  {
    id: "family",
    displayName: "Family",
    visible: true,
    subcategories: [{ id: "parks", displayName: "Theme Parks" }],
  },
  {
    id: "luxury",
    displayName: "Luxury",
    visible: true,
    subcategories: [{ id: "resorts", displayName: "Luxury Resorts" }],
  },
  {
    id: "romantic",
    displayName: "Romantic",
    visible: true,
    subcategories: [{ id: "honeymoon", displayName: "Honeymoon Packages" }],
  },
];

/* --------------------------- defaults ---------------------------------- */
const defaultHeroSlides: HeroSlide[] = [
  {
    id: "1",
    type: "image",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2940&auto=format&fit=crop",
    headline: "Uncover Unforgettable Journeys",
    subline: "Explore breathtaking destinations and curated adventures.",
  },
  {
    id: "2",
    type: "image",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2940&auto=format&fit=crop",
    headline: "Your Next Adventure Awaits",
    subline: "Find the perfect escape, from serene landscapes to vibrant cities.",
  },
];

const autoAdvanceDelay = 6000;
const transitionDuration = 0.9;

/* --------------------------- framer variants --------------------------- */
const bgVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 1000 : -1000,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: transitionDuration },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 1000 : -1000,
    transition: { duration: transitionDuration },
  }),
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } },
};

interface TrendingLocation {
  name: string;
}


/* ------------------------------ loader -------------------------------- */
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

/* ---------------------------- Component ------------------------------- */
export default function HeroSection({
  storeFormData,
  onSearch,
  filters,
  setFilters,
  trendingLocations
}: Props) {
  const heroSlides =
    storeFormData?.heroSlides && storeFormData.heroSlides.length > 0
      ? storeFormData.heroSlides.map((h, idx) => ({ ...h, id: h.id ?? idx }))
      : defaultHeroSlides;

  const { destinations = [] } = storeFormData || {};
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const slideTimerRef = useRef<number | null>(null);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchFormRef = useRef<HTMLFormElement>(null);

  const rawCategories = useMemo(() => {
    const storeCats = (storeFormData as any)?.StoreCategory;
    if (Array.isArray(storeCats) && storeCats.length > 0) {
      return storeCats.map((c: any) => ({
        ...c,
        subcategories: c.subcategories ?? c.Subcategory ?? [],
      })) as IStoreCategory[];
    }
    return curatedCategoriesFallback as IStoreCategory[];
  }, [storeFormData]);

  const selectedCategory = useMemo(() => {
    return rawCategories.find((c) => c.id === filters.category);
  }, [filters.category, rawCategories]);

  const filteredLocations = useMemo(() => {
    if (!searchTerm) return trendingLocations;
    return trendingLocations.filter((loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [trendingLocations, searchTerm]);

  const filteredDestinations = useMemo(() => {
    if (!searchTerm) return destinations;
    return destinations.filter((dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [destinations, searchTerm]);

  const handleSearchClick = () => {
    setIsSearchActive(true);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(filters);
    setIsSearchActive(false);
  };

  const resetSlideTimer = useCallback(() => {
    if (slideTimerRef.current) {
      window.clearTimeout(slideTimerRef.current);
    }
    if (heroSlides.length > 0) {
      slideTimerRef.current = window.setTimeout(() => {
        setDirection(1);
        setCurrentSlide((s) => (s + 1) % heroSlides.length);
      }, autoAdvanceDelay);
    }
  }, [heroSlides.length]);

  useEffect(() => {
    resetSlideTimer();
    return () => {
      if (slideTimerRef.current) {
        window.clearTimeout(slideTimerRef.current);
      }
    };
  }, [currentSlide, resetSlideTimer]);

  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (searchFormRef.current && !searchFormRef.current.contains(target)) {
        setIsSearchActive(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((s) => (s - 1 + heroSlides.length) % heroSlides.length);
    resetSlideTimer();
  }, [heroSlides.length, resetSlideTimer]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((s) => (s + 1) % heroSlides.length);
    resetSlideTimer();
  }, [heroSlides.length, resetSlideTimer]);

  const handleSelectCategory = (cat: IStoreCategory) => {
    setFilters({ ...filters, category: cat.id, subcategory: undefined });
  };

  const handleSelectSubcategory = (sub: ISubcategory) => {
    setFilters({ ...filters, subcategory: sub.id ?? sub.slug });
  };
  
  const handleSelectLocation = (location: any) => {
    setFilters({ ...filters, location: location.slug });
    setSearchTerm(location.name);
    // Optional: Close the dropdown or submit the search
  };

  const handleSelectDestination = (destination: any) => {
    setFilters({ ...filters, destination: destination.slug });
    setSearchTerm(destination.name);
    // Optional: Close the dropdown or submit the search
  };

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background slideshow */}
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
              {slide.type === "video" ? (
                <video
                  src={slide.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={
                    slide.url ||
                    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2940&auto=format&fit=crop"
                  }
                  alt={slide.headline ?? "hero background"}
                  fill
                  priority
                  className="object-cover"
                  loader={loader}
                />
              )}
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/20 to-black/5 mix-blend-multiply" />

      {/* Content Container */}
      <div className="relative z-20 max-w-[1280px] mx-auto h-full px-6 md:px-10 lg:px-16 flex items-center justify-center">
        <div className="w-full text-center text-white">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {heroSlides[currentSlide]?.headline ?? "Find Your Next Adventure"}
          </motion.h1>

          <motion.p
            className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-100/90 drop-shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.8 }}
          >
            {heroSlides[currentSlide]?.subline ??
              "Discover curated trips, packages and destinations crafted for unforgettable experiences."}
          </motion.p>

          {/* New Centralized Search Bar */}
          <motion.form
            onSubmit={submitSearch}
            ref={searchFormRef}
            className="mt-10 mx-auto w-full max-w-2xl bg-white dark:bg-gray-800 rounded-full shadow-2xl transition-all duration-300"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
            onClick={handleSearchClick}
          >
            <div className="relative flex items-center">
              {/* Primary Search Input */}
              <div className="relative flex-grow">
                <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  aria-label="Search for locations, destinations, or trips"
                  placeholder="Where do you want to go?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-4 py-5 rounded-full bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 text-lg focus:outline-none transition"
                />
              </div>

              {/* Dynamic Search Fields & Button */}
              <AnimatePresence>
                {isSearchActive && (
                  <motion.div
                    className="absolute top-full mt-4 left-0 right-0 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 space-y-4"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                     {/* Locations & Destinations */}
                     <div className="flex flex-wrap items-center gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-default">
                          <MapPinIcon className="h-4 w-4" /> Locations:
                        </div>
                        {filteredLocations.map((loc, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectLocation(loc)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                              filters.location === loc.slug
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                            }`}
                          >
                            {loc.name}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-default">
                          <BuildingOfficeIcon className="h-4 w-4" /> Destinations:
                        </div>
                        {filteredDestinations.map((dest, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectDestination(dest)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                              filters.destination === dest.slug
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                            }`}
                          >
                            {dest.name}
                          </button>
                        ))}
                      </div>

                    {/* Other Filter fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Dates */}
                      <div className="relative">
                        <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="date"
                          aria-label="Date"
                          value={filters.date || ""}
                          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                          className="w-full pl-11 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300/80 transition"
                        />
                      </div>
                      {/* Guests */}
                      <div className="relative">
                        <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="number"
                          aria-label="Guests"
                          placeholder="Guests"
                          min={1}
                          value={filters.guests || ""}
                          onChange={(e) => setFilters({ ...filters, guests: Math.max(1, Number(e.target.value)) })}
                          className="w-full pl-11 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/90 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/80 transition"
                        />
                      </div>
                    </div>

                    {/* Category & Subcategory Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-default">
                        <TagIcon className="h-4 w-4" /> Categories:
                      </div>
                      {rawCategories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleSelectCategory(cat as IStoreCategory)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                            filters.category === cat.id
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                          }`}
                        >
                          {cat.displayName}
                        </button>
                      ))}
                    </div>
                    {selectedCategory && (selectedCategory.subcategories ?? []).length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-default">
                          <TagIcon className="h-4 w-4" /> Subcategories:
                        </div>
                        {(selectedCategory.subcategories ?? []).map((sub: any) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleSelectSubcategory(sub)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                              filters.subcategory === sub.id
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-indigo-100 dark:hover:bg-indigo-800"
                            }`}
                          >
                            {sub.displayName ?? sub.name ?? sub.slug}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Search button for expanded form */}
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

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search button for default state */}
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg transition-transform transform hover:scale-110"
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Slide pagination */}
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

    </section>
  );
}