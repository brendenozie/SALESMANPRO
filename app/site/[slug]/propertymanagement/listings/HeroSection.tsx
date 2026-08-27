"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ChevronDownIcon 
} from "@heroicons/react/24/solid";

const loader = ({ src }: { src: string }) => {
  return src;
};

// Types
interface HeroSlide {
  imageUrl: string;
  headline?: string;
  subline?: string;
}

interface HeroSectionProps {
  store: { heroSlides: HeroSlide[] };
  categories: any[];
}

const defaultSlides = [
  {
    imageUrl: "https://images.unsplash.com/photo-1600596542815-2a4d9f0152ba?auto=format&fit=crop&w=2000&q=80",
    headline: "Find Your Dream Home",
    subline: "Explore the best properties in prime locations."
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80",
    headline: "Luxury Living Defined",
    subline: "Experience comfort and elegance like never before."
  }
];

export default function HeroSection({ store, categories }: HeroSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Slideshow State
  const slides = store?.heroSlides?.length ? store.heroSlides : defaultSlides;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Search Form State
  const [location, setLocation] = useState(searchParams?.get("location") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "");
  
  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString());
    
    if (location) params.set("location", location);
    else params.delete("location");
    
    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");

    params.set("page", "1"); // Reset to page 1
    
    // Push new URL - this triggers the Server Component to re-render!
    router.push(`?${params.toString()}#listings-section`, { scroll: false });
  };

  return (
    <div className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
      
      {/* 1. Background Slideshow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/40 z-10" /> {/* Overlay */}
          <Image
            src={slides[currentSlide].imageUrl}
            loader={loader}
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* 2. Content */}
      <div className="relative z-20 w-full max-w-5xl px-6 flex flex-col items-center text-center">
        <motion.h1 
          key={`text-${currentSlide}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg"
        >
          {slides[currentSlide].headline}
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl drop-shadow-md"
        >
          {slides[currentSlide].subline}
        </motion.p>

        {/* 3. Search Bar */}
        <motion.form 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="w-full bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full p-2 shadow-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200"
        >
          {/* Location Input */}
          <div className="flex-1 px-6 py-3 flex items-center gap-3">
            <MapPinIcon className="w-6 h-6 text-indigo-500" />
            <div className="flex flex-col items-start w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Location</label>
              <input 
                type="text" 
                placeholder="Where to?" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="flex-1 px-6 py-3 flex items-center gap-3 relative group">
            <div className="p-2 bg-indigo-50 rounded-full text-indigo-600">
               <ChevronDownIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col items-start w-full">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Property Type</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 font-medium appearance-none cursor-pointer"
              >
                <option value="">All Types</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.displayName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-2">
            <button 
              type="submit"
              className="w-full md:w-auto h-14 md:aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl md:rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-indigo-500/30"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}