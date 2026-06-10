"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  SparklesIcon,
  TicketIcon,
  FireIcon,
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
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop",
    headline: "REFINE YOUR\nLIMITLESS POTENTIAL",
    subline: "Elite performance coaching tailored for the modern athlete.",
    id: "1", companyId: "", type: null, price: null, order: 0, ctaText: null, ctaLink: null, videoLink: null, badgeText: null, endsAt: null, iconKey: null, backgroundColor: null, textColor: null, productImageUrl: null,
    stats: null
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1518611012118-2969c636020d?q=80&w=2670&auto=format&fit=crop",
    headline: "MINDFULNESS &\nTOTAL RECOVERY",
    subline: "Restore your balance with expert-led meditation and wellness sessions.",
    id: "2", companyId: "", type: null, price: null, order: 0, ctaText: null, ctaLink: null, videoLink: null, badgeText: null, endsAt: null, iconKey: null, backgroundColor: null, textColor: null, productImageUrl: null,
    stats: null
  },
];

export default function HeroSection({
  store,
  onSearch,
  trendingLocations = [{ name: "Downtown Elite" }, { name: "Soho Yoga" }, { name: "Brooklyn Iron" }],
}: HeroSectionProps) {
  // --- Data Logic ---
  const heroSlides = store?.heroSlides?.length ? store.heroSlides : defaultHeroSlides;
  const categories = (store?.StoreCategory ?? [])
    .filter((c) => c.visible ?? true)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  // --- Search States ---
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IStoreCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubcategory | null>(null);

  // --- Dropdown States ---
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);

  const locRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  // --- Handlers ---
  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locRef.current && !locRef.current.contains(event.target as Node)) setIsLocationOpen(false);
      if (catRef.current && !catRef.current.contains(event.target as Node)) setIsCategoryOpen(false);
      if (subRef.current && !subRef.current.contains(event.target as Node)) setIsSubcategoryOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 9000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  // Variant setups for slider text transitions
  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 100 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -100 })
  };

  return (
    <section className="relative min-h-screen w-full flex justify-center items-center overflow-hidden bg-neutral-900 selection:bg-orange-500 selection:text-white">
      
      {/* 1. CINEMATIC BACKGROUND SLIDER */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={heroSlides[current].imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop"}
            alt="Premium Ambient Background"
            fill
            className="object-cover brightness-[0.7] dark:brightness-[0.4] saturate-[1.15] scale-105 select-none pointer-events-none"
            priority
            loader={({ src }) => src}
          />
          {/* Multi-layered radial and linear scrims for robust text contrast masking */}
          <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950/90 via-neutral-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/20 to-neutral-950" />
        </motion.div>
      </AnimatePresence>

      {/* Subtle background floating glow ambient element */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/10 blur-[140px] rounded-full pointer-events-none z-10" />

      {/* 2. CORE INTERFACE CONTAINER */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 flex flex-col justify-between items-center min-h-screen">
        
        {/* Spacer to push content gracefully down */}
        <div className="flex-grow" />

        {/* TYPOGRAPHY AND HEADER BLOCK */}
        <div className="w-full text-center space-y-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-orange-500/10 backdrop-blur-md border border-white/20 dark:border-orange-500/20 shadow-inner"
          >
            <SparklesIcon className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-white text-xs font-semibold tracking-wider uppercase">
              {heroSlides[current].badgeText || "Elevate Your Lifestyle"}
            </span>
          </motion.div>

          <div className="space-y-4 max-w-5xl mx-auto overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.h1
                key={`h1-${current}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-6xl md:text-8xl font-black text-white leading-[0.95] tracking-tight uppercase italic drop-shadow-2xl font-sans"
              >
                {heroSlides[current].headline?.split("\n").map((line, i) => (
                  <span key={i} className="block bg-gradient-to-b from-white via-white to-neutral-300 bg-clip-text text-transparent">
                    {line}
                  </span>
                ))}
              </motion.h1>
            </AnimatePresence>

            {/* Subline Animation */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.p
                key={`sub-${current}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-neutral-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium drop-shadow"
              >
                {heroSlides[current].subline}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* 3. HIGH-END GLASSMORPHIC SEARCH BAR */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-6xl mx-auto"
        >
          <form 
            onSubmit={handleSearchSubmit} 
            className="bg-neutral-900/60 dark:bg-neutral-950/40 backdrop-blur-2xl p-3 rounded-3xl lg:rounded-[2.5rem] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 group/form"
          >
            
            {/* LOCATION PICKER */}
            <div className="lg:col-span-3 relative" ref={locRef}>
              <div 
                className="flex items-center bg-white/5 hover:bg-white/10 focus-within:bg-white/10 border border-white/5 focus-within:border-orange-500/50 rounded-2xl lg:rounded-[1.8rem] transition-all duration-300 px-5 py-3.5 cursor-text"
                onClick={() => setIsLocationOpen(true)}
              >
                <MapPinIcon className="w-5 h-5 text-orange-400 shrink-0 mr-3 transition-transform group-focus-within/form:scale-110" />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Location</p>
                  <input
                    type="text"
                    placeholder="Find a studio..."
                    className="w-full bg-transparent text-white outline-none font-semibold placeholder:text-neutral-500 text-sm mt-0.5"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <AnimatePresence>
                {isLocationOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full left-0 w-full mt-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 px-5 pt-3 pb-1 font-bold">Trending Locations</p>
                    {trendingLocations.map((loc, i) => (
                      <button 
                        key={i} 
                        type="button" 
                        onClick={() => { setLocation(loc.name); setIsLocationOpen(false); }} 
                        className="w-full text-left px-5 py-3 text-sm font-medium text-neutral-300 hover:bg-orange-500 hover:text-white transition-colors duration-150 block truncate"
                      >
                        {loc.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CATEGORY PICKER */}
            <div className="lg:col-span-2 relative" ref={catRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full h-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl lg:rounded-[1.8rem] px-5 py-3.5 text-left transition-all duration-300 focus:outline-none focus:border-orange-500/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Discipline</p>
                  <span className="text-white font-semibold text-sm block truncate mt-0.5">
                    {selectedCategory?.displayName || "Select Group"}
                  </span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-neutral-400 ml-2 shrink-0 transition-transform duration-300 ${isCategoryOpen ? 'rotate-180 text-orange-400' : ''}`} />
              </button>
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full left-0 w-full mt-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {categories.map((cat) => (
                      <button 
                        key={cat.id} 
                        type="button" 
                        onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); setIsCategoryOpen(false); }} 
                        className="w-full text-left px-5 py-3 text-sm font-medium text-neutral-300 hover:bg-orange-500 hover:text-white transition-colors duration-150 block truncate"
                      >
                        {cat.displayName}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SUBCATEGORY PICKER */}
            <div className="lg:col-span-2 relative" ref={subRef}>
              <button
                type="button"
                disabled={!selectedCategory}
                onClick={() => setIsSubcategoryOpen(!isSubcategoryOpen)}
                className={`w-full h-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl lg:rounded-[1.8rem] px-5 py-3.5 text-left transition-all duration-300 focus:outline-none focus:border-orange-500/50 ${!selectedCategory ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Session Focus</p>
                  <span className="text-white font-semibold text-sm block truncate mt-0.5">
                    {selectedSubcategory?.name || "All Formats"}
                  </span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-neutral-400 ml-2 shrink-0 transition-transform duration-300 ${isSubcategoryOpen ? 'rotate-180 text-orange-400' : ''}`} />
              </button>
              <AnimatePresence>
                {isSubcategoryOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute top-full left-0 w-full mt-2 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto"
                  >
                    {(selectedCategory?.subcategories || []).map((sub) => (
                      <button 
                        key={sub.id} 
                        type="button" 
                        onClick={() => { setSelectedSubcategory(sub); setIsSubcategoryOpen(false); }} 
                        className="w-full text-left px-5 py-3 text-sm font-medium text-neutral-300 hover:bg-orange-500 hover:text-white transition-colors duration-150 block truncate"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BUDGET PICKER */}
            <div className="lg:col-span-3 flex bg-white/5 border border-white/5 focus-within:border-orange-500/50 rounded-2xl lg:rounded-[1.8rem] transition-all duration-300 items-center px-5 py-3.5">
              <TicketIcon className="w-5 h-5 text-orange-400 shrink-0 mr-3" />
              <div className="text-left flex-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Price Range</p>
                <div className="flex items-center mt-0.5">
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(e.target.value)} 
                    className="w-full bg-transparent text-white outline-none text-sm font-semibold placeholder:text-neutral-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <span className="mx-2 text-neutral-600 font-bold">—</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(e.target.value)} 
                    className="w-full bg-transparent text-white outline-none text-sm font-semibold placeholder:text-neutral-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
              </div>
            </div>

            {/* CORE ACTION SUBMIT BUTTON */}
            <div className="md:col-span-2 lg:col-span-2">
              <button 
                type="submit" 
                className="w-full h-full min-h-[54px] bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold rounded-2xl lg:rounded-[1.8rem] flex items-center justify-center space-x-2 transition-all shadow-[0_12px_24px_rgba(249,115,22,0.25)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.4)] active:scale-[0.98]"
              >
                <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" />
                <span className="uppercase tracking-wider text-sm font-extrabold">Explore</span>
              </button>
            </div>
          </form>
        </motion.div>

        <div className="flex-grow" />

        {/* 4. REFINED UTILITY FOOTER CONTROLS */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          
          {/* Progress Indicators */}
          <div className="flex items-center space-x-2.5 ordered-dots">
            {heroSlides.map((_, i) => (
              <button
                key={i} 
                type="button"
                className="relative h-1.5 focus:outline-none group"
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
              >
                <motion.div 
                  animate={{ 
                    width: i === current ? 48 : 12, 
                    backgroundColor: i === current ? "#f97316" : "rgba(255,255,255,0.2)" 
                  }}
                  className="h-full rounded-full transition-all duration-500 group-hover:bg-white/40"
                />
              </button>
            ))}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center space-x-3 bg-neutral-900/40 backdrop-blur-md p-1.5 rounded-full border border-white/5">
            <button 
              type="button"
              onClick={prevSlide} 
              className="p-3 rounded-full hover:bg-white/10 text-white transition-all active:scale-90"
              aria-label="Previous Slide"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button 
              type="button"
              onClick={nextSlide} 
              className="p-3 rounded-full hover:bg-white/10 text-white transition-all active:scale-90"
              aria-label="Next Slide"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}