"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { MarketListingForm, HeroSlide } from "@/types/typings";

// --- Loader helper ---
const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Default fallback hero content ---
const defaultHeroData = {
  name: "Find Your Service",
  description: "Book trusted professionals in seconds.",
  bannerUrl: "https://images.unsplash.com/photo-1517436336340-27a3c3c78897?q=80&w=2940&auto=format&fit=crop",
  marketplaceListings: [],
};

export interface HeroProps {
  name?: string | null;
  description?: string | null;
  bannerUrl?: string | null;
  heroSlides?: HeroSlide[] | null;
  marketplaceListings?: MarketListingForm[] | null;
}

export default function Hero({
  name,
  description,
  bannerUrl,
  heroSlides,
  marketplaceListings,
}: HeroProps) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#00A880';

  // Helper for dynamic RGB shadows
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 168, 128';
  };
  const primaryRgb = hexToRgb(primaryColor);

  // 🧠 Data Logic
  const heroData = useMemo(() => {
    let firstSlide: Partial<HeroSlide> = heroSlides?.[0] ?? {};
    return {
      name: firstSlide.headline || name || defaultHeroData.name,
      description: firstSlide.subline || description || defaultHeroData.description,
      bannerUrl: firstSlide.imageUrl || bannerUrl || defaultHeroData.bannerUrl,
      marketplaceListings: marketplaceListings?.length ? marketplaceListings : defaultHeroData.marketplaceListings,
    };
  }, [name, description, bannerUrl, heroSlides, marketplaceListings]);

  // --- Booking bar local state ---
  const [searchTerm, setSearchTerm] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);

  // --- Filter listings ---
  const filteredListings = useMemo(() => {
    if (!searchTerm) return [];
    return heroData.marketplaceListings
      ?.filter((item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      ?.slice(0, 5)
      ?.map((item) => ({
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0] ?? null,
        category: item.category || "Service"
      }));
  }, [heroData.marketplaceListings, searchTerm]);

  // --- Close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setActiveIndex(-1);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(() => {
    // In a real app, you'd likely route to a search page here
    alert(`Searching for "${searchTerm || "all"}" on ${date.toDateString()} @ ${time.toLocaleTimeString()}`);
  }, [searchTerm, date, time]);

  return (
    <section className="relative h-[85vh] min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      
      {/* 1. BACKGROUND VISUALS */}
      <div className="absolute inset-0 z-0">
        {heroData.bannerUrl && (
          <Image
            src={heroData.bannerUrl}
            loader={loader}
            alt="Hero background"
            fill
            priority
            className="object-cover object-center"
          />
        )}
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gray-900/40" /> 
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-gray-900/30" />
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-10 space-y-4"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-xl">
            {heroData.name}
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
            {heroData.description}
          </p>
        </motion.div>

        {/* 3. THE "COMMAND BAR" (Booking Interface) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative w-full max-w-4xl"
        >
          {/* Glow Effect behind bar */}
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-30 transition-opacity duration-500"
            style={{ backgroundColor: isFocused ? primaryColor : 'transparent' }}
          />

          {/* The Bar Container */}
          <div className={`
            relative bg-white/95 backdrop-blur-xl rounded-[2rem] md:rounded-full shadow-2xl 
            flex flex-col md:flex-row items-stretch p-2 transition-all duration-300
            ${isFocused ? 'ring-4 ring-opacity-30' : ''}
          `}
          style={{ borderColor: isFocused ? primaryColor : 'transparent' }}
          >
            
            {/* SEARCH INPUT */}
            <div className="relative flex-grow flex items-center px-6 py-4 md:py-2 border-b md:border-b-0 md:border-r border-gray-200 group">
              <div className="p-2 bg-gray-100 rounded-full mr-3 text-gray-500 group-focus-within:text-gray-900 group-focus-within:bg-white transition-colors">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col w-full">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-0.5">Service</label>
                <input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder="What do you need?"
                  className="w-full bg-transparent border-none p-0 text-gray-900 placeholder-gray-400 focus:ring-0 font-semibold text-lg truncate"
                />
              </div>

              {/* Dropdown Results */}
              <AnimatePresence>
                {searchTerm && filteredListings?.length > 0 && isFocused && (
                  <motion.ul
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[110%] left-0 w-full md:w-[120%] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-2"
                  >
                    {filteredListings.map((item, i) => (
                      <li
                        key={item.id}
                        onClick={() => {
                          setSearchTerm(item.name);
                          setActiveIndex(-1);
                          setIsFocused(false);
                        }}
                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors group/item"
                      >
                        <div className="relative w-10 h-10 flex-shrink-0">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              loader={loader}
                              alt={item.name}
                              fill
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                              <MapPinIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow text-left">
                          <p className="text-gray-900 font-bold text-sm group-hover/item:text-[var(--primary)]" style={{ '--primary': primaryColor } as React.CSSProperties}>
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-gray-300" />
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* DATE PICKER */}
            <div className="relative md:w-[28%] flex items-center px-6 py-4 md:py-2 border-b md:border-b-0 md:border-r border-gray-200 group cursor-pointer">
              <div className="p-2 bg-gray-100 rounded-full mr-3 text-gray-500 group-hover:bg-white transition-colors">
                <CalendarDaysIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col w-full">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-0.5">Date</label>
                <div className="w-full">
                  <DatePicker
                    selected={date}
                    onChange={(d) => d && setDate(d)}
                    dateFormat="EEE, MMM d"
                    className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-semibold text-lg cursor-pointer caret-transparent"
                    onFocus={() => setIsFocused(true)}
                  />
                </div>
              </div>
            </div>

            {/* TIME PICKER */}
            <div className="relative md:w-[22%] flex items-center px-6 py-4 md:py-2 group cursor-pointer">
              <div className="p-2 bg-gray-100 rounded-full mr-3 text-gray-500 group-hover:bg-white transition-colors">
                <ClockIcon className="h-5 w-5" />
              </div>
              <div className="flex flex-col w-full">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-0.5">Time</label>
                <div className="w-full">
                  <DatePicker
                    selected={time}
                    onChange={(t) => t && setTime(t)}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={30}
                    dateFormat="h:mm aa"
                    className="w-full bg-transparent border-none p-0 text-gray-900 focus:ring-0 font-semibold text-lg cursor-pointer caret-transparent"
                    onFocus={() => setIsFocused(true)}
                  />
                </div>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="p-2 md:pl-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSearch}
                className="w-full md:w-auto h-full min-h-[60px] md:min-h-0 px-8 rounded-[1.5rem] md:rounded-full text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                style={{ 
                  background: `linear-gradient(135deg, ${primaryColor}, #10B981)`,
                  boxShadow: `0 8px 20px -4px rgba(${primaryRgb}, 0.5)`
                }}
              >
                <MagnifyingGlassIcon className="h-6 w-6 md:h-5 md:w-5" />
                <span className="md:hidden">Search Now</span>
              </motion.button>
            </div>

          </div>
        </motion.div>

        {/* 4. Quick Tags / Footer of Hero */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-white/80"
        >
          <span className="font-medium">Popular:</span>
          {['House Cleaning', 'Plumbing', 'Massage', 'Tutors'].map((tag) => (
            <button 
              key={tag} 
              onClick={() => setSearchTerm(tag)}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </motion.div>

      </div>
    </section>
  );
}