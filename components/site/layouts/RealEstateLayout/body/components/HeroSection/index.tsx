"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { HeroSlide, IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";

interface SearchFilters {
  location: string;
  minPrice: string;
  maxPrice: string;
  category?: string;
  subcategory?: string;
  categoryId?: string;
  subcategoryId?: string;
}

interface HeroSectionProps {
  store?: StoreForm | null;
  onSearch: (filters: SearchFilters) => void;
  trendingLocations?: { name: string }[];
}

const defaultHeroSlides: HeroSlide[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070",
    headline: "Find Your Perfect\nUrban Oasis",
    subline: "Explore modern apartments and stylish lofts in the city's heart.",
    id: "1", companyId: "", type: null, price: null, order: 0, ctaText: null, ctaLink: null, videoLink: null, badgeText: null, endsAt: null, iconKey: null, backgroundColor: null, textColor: null,
    productImageUrl: null,
    stats: null
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070",
    headline: "Escape to Serene\nCountry Living",
    subline: "Discover spacious homes with sprawling gardens and tranquil views.",
    id: "2", companyId: "", type: null, price: null, order: 0, ctaText: null, ctaLink: null, videoLink: null, badgeText: null, endsAt: null, iconKey: null, backgroundColor: null, textColor: null,
    productImageUrl: null,
    stats: null
  },
];

const defaultTrendingLocations = [
  { name: "New York City" }, { name: "Los Angeles" }, { name: "Miami" },
  { name: "Chicago" }, { name: "San Francisco" }, { name: "Seattle" }
];

export default function HeroSection({
  store,
  onSearch,
  trendingLocations = defaultTrendingLocations,
}: HeroSectionProps) {
  // --- Data Initialization ---
  const heroSlides = store?.heroSlides?.length ? store.heroSlides : defaultHeroSlides;
  const categories = (store?.StoreCategory ?? [])
    .filter((c) => c.visible ?? true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  
  const allSubcategories = categories.flatMap(cat => cat.subcategories || []);

  // --- States ---
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IStoreCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubcategory | null>(null);

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false);

  // --- Refs ---
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const subcategoryRef = useRef<HTMLDivElement>(null);

  // --- Search Logic ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSearch({
      location: location.trim(),
      minPrice: minPrice ? String(minPrice) : "",
      maxPrice: maxPrice ? String(maxPrice) : "",
      categoryId: selectedCategory?.categoryId ?? "",
      category: selectedCategory?.displayName ?? undefined,
      subcategory: selectedSubcategory?.name ?? undefined,
    });
  };

  const filteredTrendingLocations = trendingLocations.filter((loc) =>
    loc.name.toLowerCase().includes(location.toLowerCase())
  );

  const filteredSubcategories = selectedCategory
    ? (selectedCategory.subcategories || []).filter((sub) => sub.visible ?? true)
    : allSubcategories.filter((sub) => sub.visible ?? true);

  // --- Handlers ---
  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) setIsLocationDropdownOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setIsCategoryDropdownOpen(false);
      if (subcategoryRef.current && !subcategoryRef.current.contains(event.target as Node)) setIsSubcategoryDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto Advance
  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, 8000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, nextSlide]);

  return (
    <section className="relative h-[100dvh] md:h-[95vh] w-full overflow-visible bg-gray-950">
      {/* Background Layer */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={heroSlides[current].productImageUrl || heroSlides[current].imageUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"}
            alt="Property background"
            fill
            className="object-cover brightness-[0.55] saturate-[1.1]"
            priority
            loader={({ src }) => src}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30 z-10" />

      {/* Content Layer */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl w-full text-center space-y-10 md:space-y-16">
          
          {/* Headline Section */}
          <div className="space-y-4 md:space-y-6 mt-16 md:mt-0 px-2">
            <motion.h1
              key={`h1-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg"
            >
              {heroSlides[current].headline?.split("\n").map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </motion.h1>
            <motion.p
              key={`p-${current}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base sm:text-lg md:text-2xl text-gray-200 max-w-3xl mx-auto font-light drop-shadow-md"
            >
              {heroSlides[current].subline}
            </motion.p>
          </div>

          {/* Functional Glass Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="w-full max-w-6xl mx-auto relative z-30"
          >
            <form onSubmit={handleSearchSubmit} className="bg-white/10 backdrop-blur-2xl p-3 md:p-2 rounded-[2rem] border border-white/20 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-2">
              
              {/* Location (Dynamic z-index prevents dropdown clipping) */}
              <div className={`md:col-span-3 relative ${isLocationDropdownOpen ? 'z-50' : 'z-20'}`} ref={locationRef}>
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full h-14 md:h-full bg-white/5 text-white pl-11 pr-4 py-3 md:py-4 rounded-2xl outline-none border border-transparent focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-gray-400"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setIsLocationDropdownOpen(true); }}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                />
                <AnimatePresence>
                  {isLocationDropdownOpen && filteredTrendingLocations.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-y-auto max-h-60 shadow-2xl py-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {filteredTrendingLocations.map((loc, i) => (
                        <button key={i} type="button" onClick={() => { setLocation(loc.name); setIsLocationDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-emerald-500 hover:text-gray-900 transition-colors">
                          {loc.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category Dropdown */}
              <div className={`md:col-span-2 relative ${isCategoryDropdownOpen ? 'z-50' : 'z-10'}`} ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full h-14 md:h-full bg-white/5 hover:bg-white/10 text-white px-4 py-3 md:py-4 rounded-2xl border border-transparent focus:border-emerald-500/50 text-left flex justify-between items-center transition-all"
                >
                  <span className="truncate text-gray-200">{selectedCategory?.displayName || "Category"}</span>
                  <ChevronDownIcon className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-y-auto max-h-60 shadow-2xl py-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {categories.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); setIsCategoryDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-emerald-500 hover:text-gray-900 transition-colors">
                          {cat.displayName}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subcategory Dropdown */}
              <div className={`md:col-span-2 relative ${isSubcategoryDropdownOpen ? 'z-50' : 'z-10'}`} ref={subcategoryRef}>
                <button
                  type="button"
                  disabled={!selectedCategory}
                  onClick={() => setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen)}
                  className={`w-full h-14 md:h-full bg-white/5 text-white px-4 py-3 md:py-4 rounded-2xl border border-transparent text-left flex justify-between items-center transition-all ${!selectedCategory ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 focus:border-emerald-500/50'}`}
                >
                  <span className="truncate text-gray-200">{selectedSubcategory?.name || "Type"}</span>
                  <ChevronDownIcon className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${isSubcategoryDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isSubcategoryDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                      className="absolute top-[calc(100%+8px)] left-0 w-full bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-y-auto max-h-60 shadow-2xl py-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                      {filteredSubcategories.map((sub) => (
                        <button key={sub.id} type="button" onClick={() => { setSelectedSubcategory(sub); setIsSubcategoryDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-emerald-500 hover:text-gray-900 transition-colors">
                          {sub.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price Range */}
              <div className="md:col-span-3 flex h-14 md:h-full bg-white/5 rounded-2xl border border-transparent focus-within:border-emerald-500/50 focus-within:bg-white/10 transition-all overflow-hidden">
                <div className="flex items-center pl-4 shrink-0"><CurrencyDollarIcon className="w-5 h-5 text-emerald-400" /></div>
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 min-w-0 bg-transparent text-white px-3 py-3 md:py-4 outline-none text-sm placeholder:text-gray-400 appearance-none" />
                <div className="flex items-center text-gray-500 shrink-0">|</div>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 min-w-0 bg-transparent text-white px-3 py-3 md:py-4 outline-none text-sm placeholder:text-gray-400 appearance-none" />
              </div>

              {/* Search Submit */}
              <div className="md:col-span-2 mt-2 md:mt-0">
                <button type="submit" className="w-full h-14 md:h-full bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold py-3 md:py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span className="tracking-wide">Search</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 z-30 flex space-x-3">
        <button onClick={prevSlide} aria-label="Previous slide" className="p-3 md:p-4 rounded-full border border-white/20 bg-black/20 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95">
          <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button onClick={nextSlide} aria-label="Next slide" className="p-3 md:p-4 rounded-full border border-white/20 bg-black/20 hover:bg-white/20 text-white backdrop-blur-md transition-all active:scale-95">
          <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-10 left-6 md:bottom-14 md:left-10 z-30 flex space-x-3 items-center">
        {heroSlides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'w-2 bg-white/40 hover:bg-white/70'}`} 
          />
        ))}
      </div>
    </section>
  );
}