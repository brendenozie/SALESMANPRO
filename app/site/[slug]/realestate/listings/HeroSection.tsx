"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ChevronDownIcon,
  BanknotesIcon,
  HomeIcon
} from "@heroicons/react/24/outline";

const loader = ({ src }: { src: string }) => src;

interface HeroSlide {
  imageUrl: string;
  headline?: string;
  subline?: string;
}

interface HeroSectionProps {
  store: { heroSlides: HeroSlide[] };
  categories: any[]; 
  slug: string;
  initialLocations?: any[]; 
}

const defaultSlides = [
  {
    imageUrl: "https://images.unsplash.com/photo-1600596542815-2a4d9f0152ba?auto=format&fit=crop&w=2000&q=80",
    headline: "Find Your Dream Home",
    subline: "Explore the best properties in prime locations."
  }
];

export default function HeroSection({ store, categories, slug, initialLocations }: HeroSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const slides = store?.heroSlides?.length ? store.heroSlides : defaultSlides;
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- Search Form State ---
  const [location, setLocation] = useState(searchParams?.get("location") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams?.get("subcategory") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams?.get("maxPrice") || "");

  // Derived: Find subcategories for the currently selected category
  const activeSubcategories = useMemo(() => {
    // We check both ID and slug to be safe with different DB structures
    const category = categories.find(c => String(c.id) === String(selectedCategory));
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  // Slideshow Logic
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (location) params.set("location", location);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedSubcategory) params.set("subcategory", selectedSubcategory);
    if (maxPrice) params.set("maxPrice", maxPrice);

    params.set("page", "1"); 
    // Navigate and ensure we hit the listings-section anchor
    router.push(`/realestate/listings?${params.toString()}#listings-section`);
  };

  return (
    // REMOVED: overflow-hidden from the main container so dropdowns can "breathe"
    <div className="relative min-h-[85vh] w-full flex items-center justify-center bg-gray-900 py-20">
      
      {/* 1. Background Layer (z-0) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 1 }} 
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            <Image 
              src={slides[currentSlide].imageUrl} 
              loader={loader} 
              alt="Background" 
              fill 
              className="object-cover" 
              priority 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. Content Layer (z-20) */}
      <div className="relative z-20 w-full max-w-6xl px-6">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {slides[currentSlide].headline}
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {slides[currentSlide].subline}
          </motion.p>
        </div>
        
        {/* 3. Search Bar (The critical fix area) */}
        <motion.form 
          onSubmit={handleSearch}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full bg-white rounded-2xl md:rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-center gap-2"
        >
          {/* Location */}
          {/* 1. Location Selection */}
          <div className="flex-[1.5] w-full px-6 py-3 flex items-center gap-3">
            <MapPinIcon className="w-5 h-5 text-indigo-500 shrink-0" />
            <div className="flex flex-col w-full relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Location</label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 text-sm font-semibold cursor-pointer appearance-none pr-6"
              >
                <option value="">All Locations</option>
                {initialLocations?.map((loc: any, index: number) => (
                  <option key={`${loc.id || loc.slug}-${index}`} value={loc.slug || loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-3 h-3 absolute right-0 bottom-1.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Category */}
          <div className="flex-1 w-full flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-gray-100">
            <HomeIcon className="w-5 h-5 text-indigo-500 shrink-0" />
            <div className="flex flex-col items-start w-full relative">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory(""); // Reset sub when category changes
                }}
                className="w-full bg-transparent outline-none text-gray-900 text-sm font-semibold appearance-none cursor-pointer pr-4"
              >
                <option value="">All Categories</option>
                {categories.map((cat: any, index: number) => (
                  <option key={`${cat.id}-${index}`} value={cat.id}>{cat.displayName}</option>
                ))}
              </select>
              <ChevronDownIcon className="w-3 h-3 absolute right-0 bottom-1.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Sub-type (Only appears if it has data) */}
          {activeSubcategories.length > 0 && (
            <div className="flex-1 w-full flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex flex-col items-start w-full relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Type</label>
                <select 
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-900 text-sm font-semibold appearance-none cursor-pointer pr-4"
                >
                  <option value="">All Types</option>
                  {activeSubcategories.map((sub: any, index: number) => (
                    <option key={`${sub.id}-${index}`} value={sub.id}>{sub.displayName || sub.name}</option>
                  ))}
                </select>
                <ChevronDownIcon className="w-3 h-3 absolute right-0 bottom-1.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Budget */}
          <div className="flex-1 w-full flex items-center gap-3 px-6 py-3">
            <BanknotesIcon className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="flex flex-col items-start w-full">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Max Budget</label>
              <input 
                type="number" 
                placeholder="Any" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Search Button */}
          <button 
            type="submit"
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl md:rounded-full font-bold flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span>Search</span>
          </button>
        </motion.form>
      </div>
    </div>
  );
}