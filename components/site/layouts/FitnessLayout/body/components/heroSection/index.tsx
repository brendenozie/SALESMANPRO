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
  QueueListIcon,
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
    id: "1", companyId: "", type: null, price: null, order: 0, ctaText: null, ctaLink: null, videoLink: null, badgeText: null, endsAt: null, iconKey: null, backgroundColor: null, textColor: null, productImageUrl: null
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1518611012118-2969c636020d?q=80&w=2670&auto=format&fit=crop",
    headline: "MINDFULNESS &\nTOTAL RECOVERY",
    subline: "Restore your balance with expert-led meditation and wellness sessions.",
    id: "2", companyId: "", type: null, price: null, order: 0, ctaText: null, ctaLink: null, videoLink: null, badgeText: null, endsAt: null, iconKey: null, backgroundColor: null, textColor: null, productImageUrl: null
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
  
  const allSubcategories = categories.flatMap(cat => cat.subcategories || []);

  // --- Search States ---
  const [current, setCurrent] = useState(0);
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
  const nextSlide = useCallback(() => setCurrent((prev) => (prev + 1) % heroSlides.length), [heroSlides.length]);
  const prevSlide = useCallback(() => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length), [heroSlides.length]);

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
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative min-h-screen w-full flex justify-center items-center overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-300">
      {/* 1. ANIMATED BACKGROUND */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={heroSlides[current].imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop"}
            alt="Hero Background"
            fill
            className="object-cover brightness-[0.9] dark:brightness-[0.45] saturate-[1.1] transition-all duration-300"
            priority
            loader={({ src }) => src}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 dark:from-black/60 via-transparent to-white dark:to-black transition-all duration-300" />
        </motion.div>
      </AnimatePresence>

      {/* 2. CORE CONTENT */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 my-auto py-16 lg:py-32 w-full">
        <div className="max-w-6xl w-full text-center space-y-10">
          
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest transition-all duration-300"
            >
              <FireIcon className="w-4 h-4" />
              <span>Transform Your Routine</span>
            </motion.div>

            <motion.h1
              key={`h1-${current}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter italic uppercase transition-colors duration-300"
            >
              {heroSlides[current].headline?.split("\n").map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </motion.h1>
          </div>

          {/* 3. THE GLASS SEARCH INTERFACE */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-6xl mx-auto"
          >
            <form onSubmit={handleSearchSubmit} className="bg-white/90 dark:bg-white/5 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-neutral-200/50 dark:border-white/10 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-3 transition-all duration-300">
              
              {/* LOCATION PICKER */}
              <div className="md:col-span-3 relative" ref={locRef}>
                <div 
                  className="group flex items-center bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-transparent focus-within:border-orange-500/50 rounded-[1.8rem] transition-all px-5 py-4 cursor-text duration-300"
                  onClick={() => setIsLocationOpen(true)}
                >
                  <MapPinIcon className="w-5 h-5 text-orange-500 mr-3" />
                  <div className="text-left flex-1">
                    <p className="text-[10px] font-black text-neutral-500 dark:text-gray-500 uppercase tracking-tighter transition-colors duration-300">Location</p>
                    <input
                      type="text"
                      placeholder="Find a studio..."
                      className="w-full bg-transparent text-neutral-900 dark:text-white outline-none font-bold placeholder:text-neutral-400 dark:placeholder:text-gray-600 text-sm transition-colors duration-300"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <AnimatePresence>
                  {isLocationOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-full left-0 w-full mt-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl transition-all duration-300">
                      {trendingLocations.map((loc, i) => (
                        <button key={i} type="button" onClick={() => { setLocation(loc.name); setIsLocationOpen(false); }} className="w-full text-left px-5 py-4 text-sm font-bold text-neutral-700 dark:text-gray-300 hover:bg-orange-500 hover:text-white transition-colors duration-150">{loc.name}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CATEGORY PICKER */}
              <div className="md:col-span-2 relative" ref={catRef}>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full h-full bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-transparent rounded-[1.8rem] px-6 py-4 text-left transition-all duration-300"
                >
                  <p className="text-[10px] font-black text-neutral-500 dark:text-gray-500 uppercase tracking-tighter transition-colors duration-300">Discipline</p>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-900 dark:text-white font-bold text-sm truncate transition-colors duration-300">{selectedCategory?.displayName || "Select"}</span>
                    <ChevronDownIcon className={`w-4 h-4 text-orange-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div className="absolute top-full left-0 w-full mt-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto transition-all duration-300">
                      {categories.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); setIsCategoryOpen(false); }} className="w-full text-left px-5 py-4 text-sm font-bold text-neutral-700 dark:text-gray-300 hover:bg-orange-500 hover:text-white transition-colors duration-150">{cat.displayName}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SUBCATEGORY PICKER */}
              <div className="md:col-span-2 relative" ref={subRef}>
                <button
                  type="button"
                  disabled={!selectedCategory}
                  onClick={() => setIsSubcategoryOpen(!isSubcategoryOpen)}
                  className={`w-full h-full bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:hover:bg-white/10 border border-transparent rounded-[1.8rem] px-6 py-4 text-left transition-all duration-300 ${!selectedCategory ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <p className="text-[10px] font-black text-neutral-500 dark:text-gray-500 uppercase tracking-tighter transition-colors duration-300">Session Focus</p>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-900 dark:text-white font-bold text-sm truncate transition-colors duration-300">{selectedSubcategory?.name || "Type"}</span>
                    <ChevronDownIcon className="w-4 h-4 text-orange-500" />
                  </div>
                </button>
                <AnimatePresence>
                  {isSubcategoryOpen && (
                    <motion.div className="absolute top-full left-0 w-full mt-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl transition-all duration-300">
                      {(selectedCategory?.subcategories || []).map((sub) => (
                        <button key={sub.id} type="button" onClick={() => { setSelectedSubcategory(sub); setIsSubcategoryOpen(false); }} className="w-full text-left px-5 py-4 text-sm font-bold text-neutral-700 dark:text-gray-300 hover:bg-orange-500 hover:text-white transition-colors duration-150">{sub.name}</button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* BUDGET PICKER */}
              <div className="md:col-span-3 flex bg-neutral-100 dark:bg-white/5 rounded-[1.8rem] border border-transparent focus-within:border-orange-500/50 transition-all items-center px-4 py-4 duration-300">
                <TicketIcon className="w-5 h-5 text-orange-500 mr-3" />
                <div className="text-left flex-1">
                  <p className="text-[10px] font-black text-neutral-500 dark:text-gray-500 uppercase tracking-tighter transition-colors duration-300">Price Range</p>
                  <div className="flex items-center">
                    <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-transparent text-neutral-900 dark:text-white outline-none text-sm font-bold placeholder:text-neutral-400 dark:placeholder:text-gray-700 transition-colors duration-300" />
                    <span className="mx-2 text-neutral-400 dark:text-gray-600 transition-colors duration-300">—</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-transparent text-neutral-900 dark:text-white outline-none text-sm font-bold placeholder:text-neutral-400 dark:placeholder:text-gray-700 transition-colors duration-300" />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="md:col-span-2">
                <button type="submit" className="w-full h-full bg-orange-500 hover:bg-orange-600 text-black font-black rounded-[1.8rem] flex items-center justify-center space-x-2 transition-all shadow-[0_10px_30px_rgba(249,115,22,0.3)] active:scale-95 py-5 duration-300">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span className="uppercase tracking-tighter text-sm">Explore</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* 4. FOOTER CONTROLS */}
      <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 z-30 flex items-center space-x-4 md:space-x-8">
        <div className="flex space-x-2">
          {heroSlides.map((_, i) => (
            <motion.div 
              key={i} 
              animate={{ width: i === current ? 40 : 8, backgroundColor: i === current ? "#f97316" : "rgba(128,128,128,0.3)" }}
              className="h-1 rounded-full cursor-pointer transition-all duration-300"
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
        <div className="flex space-x-2 md:space-x-3 bg-neutral-100/50 dark:bg-black/20 backdrop-blur-md p-1.5 rounded-full border border-neutral-200/50 dark:border-white/5 transition-all duration-300">
          <button onClick={prevSlide} className="p-2 md:p-3 rounded-full hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-black text-neutral-800 dark:text-white transition-all duration-150">
            <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button onClick={nextSlide} className="p-2 md:p-3 rounded-full hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-black text-neutral-800 dark:text-white transition-all duration-150">
            <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}