"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import {
  MapPinIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlayIcon,
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
}

interface HeroSectionProps {
  store?: StoreForm | null;
  onSearch: (filters: SearchFilters) => void;
  trendingLocations?: { name: string }[];
}

const defaultHeroSlides: HeroSlide[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1560518883-ffc4573f0053?q=80&w=2670&auto=format&fit=crop",
    headline: "Find Your Perfect\nUrban Oasis",
    subline: "Explore modern apartments and stylish lofts in the city's heart.",
    id: "1", companyId: "", type: null, price: null, order: 0, ctaText: null, ctaLink: null, videoLink: null, badgeText: null, endsAt: null, iconKey: null, backgroundColor: null, textColor: null,
    productImageUrl: null
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1594950939511-b76964a35043?q=80&w=2670&auto=format&fit=crop",
    headline: "Escape to Serene\nCountry Living",
    subline: "Discover spacious homes with sprawling gardens and tranquil views.",
    id: "2", companyId: "", type: null, price: null, order: 0, ctaText: null, ctaLink: null, videoLink: null, badgeText: null, endsAt: null, iconKey: null, backgroundColor: null, textColor: null,
    productImageUrl: null
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
      location,
      minPrice,
      maxPrice,
      category: selectedCategory?.categoryId || selectedCategory?.id,
      subcategory: selectedSubcategory?.slug || selectedSubcategory?.id,
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
    timeoutRef.current = setTimeout(nextSlide, 6000);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, nextSlide]);

  return (
    <section className="relative h-[95vh] w-full overflow-hidden bg-gray-950">
      {/* Background Layer */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <Image decoding="async"
            src={heroSlides[current].productImageUrl || heroSlides[current].imageUrl ||  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"}
            alt="Property"
            fill
            className="object-cover brightness-[0.6] saturate-[1.1]"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />

      {/* Content Layer */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6">
        <div className="max-w-6xl w-full text-center space-y-12">
          
          {/* Headline Section */}
          <div className="space-y-6">
            <motion.h1
              key={`h1-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter"
            >
              {heroSlides[current].headline?.split("\n").map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light"
            >
              {heroSlides[current].subline}
            </motion.p>
          </div>

          {/* Functional Glass Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-6xl mx-auto"
          >
            <form onSubmit={handleSearchSubmit} className="bg-white/10 backdrop-blur-2xl p-2 rounded-3xl border border-white/20 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-2">
              
              {/* Location */}
              <div className="md:col-span-3 relative" ref={locationRef}>
                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full bg-white/5 text-white pl-12 pr-4 py-4 rounded-2xl outline-none border border-transparent focus:border-emerald-500/50 transition-all"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setIsLocationDropdownOpen(true); }}
                  onFocus={() => setIsLocationDropdownOpen(true)}
                />
                <AnimatePresence>
                  {isLocationDropdownOpen && filteredTrendingLocations.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                      {filteredTrendingLocations.map((loc, i) => (
                        <button key={i} type="button" onClick={() => { setLocation(loc.name); setIsLocationDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-emerald-500 hover:text-white transition-colors">
                          {loc.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category Dropdown */}
              <div className="md:col-span-2 relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full bg-white/5 text-white px-4 py-4 rounded-2xl border border-transparent text-left flex justify-between items-center"
                >
                  <span className="truncate">{selectedCategory?.displayName || "Category"}</span>
                  <ChevronDownIcon className="w-4 h-4 text-emerald-400" />
                </button>
                <AnimatePresence>
                  {isCategoryDropdownOpen && (
                    <motion.div className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden z-50">
                      {categories.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); setIsCategoryDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-emerald-500 hover:text-white">
                          {cat.displayName}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subcategory Dropdown */}
              <div className="md:col-span-2 relative" ref={subcategoryRef}>
                <button
                  type="button"
                  disabled={!selectedCategory}
                  onClick={() => setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen)}
                  className={`w-full bg-white/5 text-white px-4 py-4 rounded-2xl border border-transparent text-left flex justify-between items-center ${!selectedCategory && 'opacity-50'}`}
                >
                  <span className="truncate">{selectedSubcategory?.name || "Type"}</span>
                  <ChevronDownIcon className="w-4 h-4 text-emerald-400" />
                </button>
                <AnimatePresence>
                  {isSubcategoryDropdownOpen && (
                    <motion.div className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl overflow-hidden z-50">
                      {filteredSubcategories.map((sub) => (
                        <button key={sub.id} type="button" onClick={() => { setSelectedSubcategory(sub); setIsSubcategoryDropdownOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-emerald-500 hover:text-white">
                          {sub.name}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price Range */}
              <div className="md:col-span-3 flex bg-white/5 rounded-2xl border border-transparent focus-within:border-emerald-500/50 transition-all">
                <div className="flex items-center pl-4"><CurrencyDollarIcon className="w-5 h-5 text-emerald-400" /></div>
                <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-transparent text-white p-4 outline-none text-sm placeholder:text-gray-500" />
                <div className="flex items-center text-gray-600">|</div>
                <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-transparent text-white p-4 outline-none text-sm placeholder:text-gray-500" />
              </div>

              {/* Search Submit */}
              <div className="md:col-span-2">
                <button type="submit" className="w-full h-full bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold py-4 rounded-2xl flex items-center justify-center space-x-2 transition-all">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Search</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-10 right-10 z-30 flex space-x-3">
        <button onClick={prevSlide} className="p-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white backdrop-blur-md transition-all">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="p-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/20 text-white backdrop-blur-md transition-all">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-12 left-10 z-30 flex space-x-2">
        {heroSlides.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-emerald-500' : 'w-2 bg-white/30'}`} />
        ))}
      </div>
    </section>
  );
}