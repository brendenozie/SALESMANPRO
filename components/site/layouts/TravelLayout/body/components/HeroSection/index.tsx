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
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { IDestination, IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";

/**
 * Banner-focused HeroSection
 * - immersive rotating background
 * - left: headline + search
 * - right: category cards (curated fallback)
 * - supports nested subcategories if store provides them
 */

/* ----------------------------- Types ----------------------------------- */
interface HeroSlide {
  type?: "image" | "video";
  url: string;
  headline?: string;
  subline?: string;
  // optional id for keying
  id?: string | number;
}

interface TrendingLocation {
  name: string;
}

interface SearchFilters {
  destination: string;
  category?: string;
  subcategory?: string;
  date?: string;
  guests?: number;
  minPrice?: string;
  maxPrice?: string;
}

interface Props {
  storeFormData?: StoreForm | null;
  onSearch: (filters: SearchFilters) => void;  
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  trendingLocations?: TrendingLocation[];
}

/* ------------------------- curated fallback ---------------------------- */
/*  shaped to be compatible with IStoreCategory-ish shape */
const curatedCategoriesFallback: Partial<IStoreCategory>[] = [
  { id: "adventure", displayName: "Adventure", visible: true },
  { id: "family", displayName: "Family", visible: true },
  { id: "luxury", displayName: "Luxury",  visible: true },
  { id: "romantic", displayName: "Romantic",visible: true },
  { id: "cultural", displayName: "Cultural",  visible: true },
  { id: "beach", displayName: "Beach",  visible: true },
  { id: "wildlife", displayName: "Wildlife", visible: true },
];

/* --------------------------- defaults ---------------------------------- */
const defaultHeroSlides: HeroSlide[] = [
  {
    id: "1",
    type: "image",
    url:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2940&auto=format&fit=crop",
    headline: "Explore the World",
    subline: "Curated experiences & packages tailored for you.",
  },
  {
    id: "2",
    type: "image",
    url:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2940&auto=format&fit=crop",
    headline: "Adventure Awaits",
    subline: "From mountains to coasts — find your perfect escape.",
  },
];

const autoAdvanceDelay = 6000;
const transitionDuration = 0.9;

/* --------------------------- framer variants --------------------------- */
const bgVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: transitionDuration } },
  exit: { opacity: 0, transition: { duration: transitionDuration } },
};

const categoryCardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.12 * i, duration: 0.36, ease: "easeOut" },
  }),
};

/* ------------------------------ loader -------------------------------- */
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


/* ---------------------------- Component ------------------------------- */
export default function HeroSection({ storeFormData, onSearch, trendingLocations = [] ,
  filters,
  setFilters,}: Props) {
  // slides (store provides heroSlides in many of your models)
  const heroSlides = storeFormData?.heroSlides && storeFormData.heroSlides.length > 0
    ? storeFormData.heroSlides.map((h, idx) => ({ ...h, id: h.id ?? idx }))
    : defaultHeroSlides;

  const { destinations = [], tourPackages = [] } = storeFormData;

  // Filtered destinations
  const filteredDestinations = destinations.filter((d) =>
    d.name.toLowerCase().includes(filters.destination.toLowerCase())
  );

  // categories: prefer store.StoreCategory if available, otherwise curated fallback
  const rawCategories = useMemo(() => {
    const storeCats = (storeFormData as any)?.StoreCategory;
    if (Array.isArray(storeCats) && storeCats.length > 0) {
      // normalize: ensure each cat has subcategories array in consistent key
      return storeCats.map((c: any) => ({
        ...c,
        // support both `subcategories` and `Subcategory` shapes
        subcategories: c.subcategories ?? c.Subcategory ?? [],
      })) as IStoreCategory[];
    }
    // fallback: cast curated to IStoreCategory-ish (minimal fields)
    return curatedCategoriesFallback as IStoreCategory[];
  }, [storeFormData]);

  
  const handleDestinationSelect = useCallback(
    (d: IDestination) => {
      setFilters({ ...filters, destination: d.name });
      setIsDestinationDropdownOpen(false);
      setIsDestinationInputFocused(false);
    },
    [filters, setFilters]
  );
  
  // slideshow state
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const slideTimerRef = useRef<number | null>(null);

  // search states
  const [destination, setDestination] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<IStoreCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubcategory | null>(null);
  const [date, setDate] = useState<string>("");
  const [guests, setGuests] = useState<number>(2);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [isDestinationDropdownOpen, setIsDestinationDropdownOpen] = useState(false);
  const [isDestinationInputFocused, setIsDestinationInputFocused] = useState(false);
  const destinationDropdownRef = useRef<HTMLDivElement | null>(null);

  // dropdown refs & open states
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const subcatRef = useRef<HTMLDivElement | null>(null);
  const destRef = useRef<HTMLDivElement | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcatOpen, setIsSubcatOpen] = useState(false);
  const [isDestOpen, setIsDestOpen] = useState(false);

  // filtered trending locations for suggestions
  const filteredTrendingLocations = useMemo(
    () =>
      (trendingLocations || []).filter((t) =>
        t.name.toLowerCase().includes(destination.toLowerCase())
      ),
    [trendingLocations, destination]
  );

  /* ---------------------- slideshow (auto advance) --------------------- */
  const resetSlideTimer = useCallback(() => {
    if (typeof window === "undefined") return;
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

  /* ----------------- outside click -> close dropdowns ------------------ */
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (destRef.current && !destRef.current.contains(target)) {
        setIsDestOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(target)) {
        setIsCategoryOpen(false);
        setIsSubcatOpen(false);
      }
      if (subcatRef.current && !subcatRef.current.contains(target)) {
        setIsSubcatOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* -------------------------- handlers ------------------------------- */
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
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    setIsCategoryOpen(false);
    // open subcategory panel if there are subcategories (desktop)
    if ((cat.subcategories ?? []).length > 0) {
      setIsSubcatOpen(true);
    }
  };

  const handleSelectSubcategory = (sub: ISubcategory) => {
    setSelectedSubcategory(sub);
    setIsSubcatOpen(false);
  };

  const handleDestinationPick = (name: string) => {
    setDestination(name);
    setIsDestOpen(false);
  };

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch({
      destination,
      category: selectedCategory?.id ?? selectedCategory?.id,
      subcategory: selectedSubcategory?.id ?? selectedSubcategory?.slug,
      date,
      guests,
      minPrice,
      maxPrice,
    });
  };

  /* -------------------------- responsive --------------------------------
     We'll render categories as cards on the right on desktop, horizontal
     swipeable pills on mobile (CSS scroll snap).
  ----------------------------------------------------------------------- */

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
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
                // next/image requires layout props in older next versions; using fill
                <Image
                  src={slide.url || 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2940&auto=format&fit=crop'}
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

      {/* dark gradient overlay for contrast */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-black/10 to-white/60 mix-blend-normal" />

      {/* Content container */}
      <div className="relative z-20 max-w-[1280px] mx-auto h-full px-6 md:px-10 lg:px-16 flex items-center">
        {/* Left column: content & search */}
        <div className="w-full lg:w-2/3 pr-0 lg:pr-12 text-white">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {heroSlides[currentSlide]?.headline ?? "Find Your Next Adventure"}
          </motion.h1>

          <motion.p
            className="mt-4 max-w-2xl text-lg sm:text-xl text-gray-100/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.8 }}
          >
            {heroSlides[currentSlide]?.subline ??
              "Discover curated trips, packages and destinations crafted for unforgettable experiences."}
          </motion.p>

          {/* Search + CTA */}
          <motion.form
            onSubmit={(e) => {
              submitSearch(e);
            }}
            className="mt-8 bg-white/95 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            initial={{ opacity: 0, y: 16, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.18 }}
            aria-label="Find trips"
          >
            {/* Destination (col-span 5) */}
            <div
              className="relative col-span-5 md:col-span-5"
              ref={destRef}
            >
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <input
                type="text"
                aria-label="Destination"
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setIsDestOpen(e.target.value.length > 0);
                }}
                onFocus={() => setIsDestOpen(destination.length > 0)}
                className="w-full pl-11 pr-3 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
              />
              {/* suggestions */}
              <AnimatePresence>
                {isDestOpen && filteredTrendingLocations.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.14 }}
                    className="absolute mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border overflow-hidden max-h-44 z-40"
                  >
                    {filteredTrendingLocations.map((t, idx) => (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => handleDestinationPick(t.name)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t.name}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

          {/* Destination input */}
          <div className="relative col-span-2" ref={destinationDropdownRef}>
            <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600" />
            <input
              type="text"
              placeholder="Where to?"
              value={filters.destination}
              onChange={(e) => {
                setFilters({ ...filters, destination: e.target.value });
                setIsDestinationDropdownOpen(e.target.value.length > 0);
                setIsDestinationInputFocused(true);
              }}
              onFocus={() => setIsDestinationInputFocused(true)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100 text-gray-900 border border-gray-200 focus:ring-4 focus:ring-amber-400/50"
            />
            <AnimatePresence>
              {isDestinationInputFocused && filteredDestinations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border overflow-hidden z-50"
                >
                  <ul className="py-2 max-h-48 overflow-y-auto">
                    {filteredDestinations.map((d) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          onClick={() => handleDestinationSelect(d)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          {d.name} {d.country && `(${d.country})`}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

            {/* Category (col-span 3) */}
            <div className="relative col-span-3 md:col-span-3" ref={categoriesRef}>
              <div className="relative">
                <select
                  aria-label="Trip category"
                  className="w-full pl-3 pr-3 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white text-gray-800 focus:outline-none"
                  value={selectedCategory?.id ?? ""}
                  onChange={(e) => {
                    const cat = rawCategories.find((c) => c.id === e.target.value);
                    if (cat) handleSelectCategory(cat as IStoreCategory);
                  }}
                >
                  <option value="">All categories</option>
                  {rawCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory popover (desktop) */}
              <AnimatePresence>
                {selectedCategory && (selectedCategory.subcategories ?? []).length > 0 && isSubcatOpen && (
                  <motion.div
                    ref={subcatRef}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full mt-2 right-0 w-full md:w-[320px] bg-white dark:bg-gray-800 rounded-xl shadow-lg border z-40 overflow-hidden"
                  >
                    <ul className="py-2 max-h-48 overflow-y-auto">
                      {(selectedCategory.subcategories ?? []).map((s: any) => (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectSubcategory(s)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {s.displayName ?? s.name ?? s.slug}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date (col-span 2) */}
            <div className="relative col-span-2 md:col-span-2">
              <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <input
                type="date"
                aria-label="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-3 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white text-gray-800 focus:outline-none"
              />
            </div>

            {/* Guests (col-span 1) */}
            <div className="relative col-span-1 md:col-span-1">
              <UserGroupIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
              <input
                type="number"
                aria-label="Guests"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Math.max(1, Number(e.target.value || 1)))}
                className="w-full pl-11 pr-3 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white text-gray-800 focus:outline-none"
              />
            </div>

            {/* CTA column (full width on small, small on large) */}
            <div className="col-span-1 md:col-span-12 lg:col-span-12 flex items-center justify-between md:justify-end gap-3 mt-2 md:mt-0">
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Min</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-20 pl-2 pr-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white text-gray-800 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Max</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-20 pl-2 pr-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white text-gray-800 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                    setDestination("");
                    setDate("");
                    setGuests(2);
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="hidden md:inline-flex items-center px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Explore Trips
                </button>
              </div>
            </div>
          </motion.form>

          {/* small helpful CTA or badges */}
          <motion.div
            className="mt-6 flex items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
          >
            <div className="text-sm text-white/90">
              <strong>Featured:</strong> Luxury Safaris · Beach Escapes · City Breaks
            </div>
          </motion.div>
        </div>

        {/* Right column: category cards (desktop) */}
        <aside className="hidden lg:flex lg:w-1/3 items-start justify-end">
          <div className="w-[360px]">
            <motion.div
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4"
            >
              {rawCategories.slice(0, 6).map((cat: any, i: number) => (
                <motion.button
                  key={cat.id}
                  custom={i + 1}
                  variants={categoryCardVariants}
                  onClick={() => handleSelectCategory(cat as IStoreCategory)}
                  whileHover={{ scale: 1.02 }}
                  className="w-full flex items-center gap-4 bg-white/95 dark:bg-gray-900/80 rounded-2xl p-3 shadow-md border hover:shadow-xl transition"
                >
                  {/* placeholder icon */}
                  <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center font-semibold">
                    {String(cat.displayName ?? cat.name ?? "").slice(0, 1).toUpperCase()}
                  </div>

                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {cat.displayName ?? cat.name ?? cat.slug}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
                      {(cat.subcategories ?? []).length > 0
                        ? `${(cat.subcategories ?? []).slice(0, 3).map((s:any)=> s.displayName ?? s.name).join(" · ")}`
                        : "Popular experiences"}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* small pagination arrows for slides */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={prevSlide}
                className="bg-white/90 p-2 rounded-full shadow hover:shadow-md"
                aria-label="Previous slide"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="text-sm text-white/90">
                {currentSlide + 1} / {heroSlides.length}
              </div>
              <button
                onClick={nextSlide}
                className="bg-white/90 p-2 rounded-full shadow hover:shadow-md"
                aria-label="Next slide"
              >
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile category row (swipeable) */}
      <div className="absolute left-0 right-0 bottom-6 z-30 lg:hidden px-4">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-3">
            {rawCategories.map((c:any) => (
              <button
                key={c.id}
                onClick={() => handleSelectCategory(c as IStoreCategory)}
                className="flex-shrink-0 bg-white/95 dark:bg-gray-900/80 px-4 py-2 rounded-full shadow text-sm font-medium"
              >
                {c.displayName ?? c.name ?? c.slug}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
