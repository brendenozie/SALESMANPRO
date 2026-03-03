"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  ChevronDownIcon,
  TicketIcon,
  CpuChipIcon, // Using for a technical/luxury feel
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { IStoreCategory, ISubcategory, StoreForm, HeroSlide } from "@/types/typings";

export interface SearchFilters {
  location: string;
  vehicleType: string;
  make: string;
  model: string;
  minPrice: string;
  maxPrice: string;
  isBuy: boolean;
  category?: string;
  subcategory?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560",
    headline: "VELOCITY\nWITHOUT BORDERS",
    subline: "The world's most exclusive automotive icons, delivered to your coordinates.",
    type: null,
    companyId: "",
    productImageUrl: null,
    ctaText: null,
    ctaLink: null,
    videoLink: null,
    badgeText: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null
  }
];

export default function LuxuryCommandHero({
  store,
  onSearch,
  trendingLocations = [{ name: "Monaco" }, { name: "Dubai Marina" }, { name: "Beverly Hills" }],
}: {
  store?: StoreForm | null;
  onSearch: (filters: SearchFilters) => void;
  trendingLocations?: { name: string }[];
}) {
  // --- Data & States ---
  const heroSlides = store?.heroSlides?.length ? store.heroSlides : defaultSlides;
  const categories = (store?.StoreCategory ?? []).filter((c) => c.visible ?? true);
  
  const [current, setCurrent] = useState(0);
  const [location, setLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IStoreCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubcategory | null>(null);

  // --- UI States ---
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 30);
    mouseY.set((clientY / innerHeight - 0.5) * 30);
  };

  const nextSlide = useCallback(() => setCurrent((prev) => (prev + 1) % heroSlides.length), [heroSlides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 10000);
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { clearInterval(timer); document.removeEventListener("mousedown", handleClickOutside); };
  }, [nextSlide]);

  return (
    <>
    <section 
      onMouseMove={handleMouseMove}
      className="relative h-screen w-full overflow-hidden bg-[#050505] selection:bg-blue-500/30"
    >
      {/* 1. KINETIC BACKGROUND */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          style={{ x: springX, y: springY, scale: 1.1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={heroSlides[current].imageUrl || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560"}
            loader={({ src }) => src}
            alt="Hero"
            fill
            className="object-cover brightness-[0.4] saturate-[1.2]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* 2. CONTENT LAYER */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-2xl"
        >
          <SparklesIcon className="h-4 w-4 text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
            Exclusive Inventory Access
          </span>
        </motion.div>

        {/* Massive Headline */}
        <div className="mb-16 text-center select-none">
          <AnimatePresence mode="wait">
            <motion.h1
              key={current}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              className="text-6xl md:text-9xl font-[1000] leading-[0.85] tracking-tighter text-white italic uppercase"
            >
              {heroSlides[current].headline}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* 3. THE COMMAND CONSOLE (Unified Search) */}
        <motion.div 
          ref={containerRef}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-7xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 bg-white/5 backdrop-blur-3xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl">
            
            {/* 1. LOCATION */}
            <div className="relative group">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'loc' ? null : 'loc')}
                className="w-full h-full flex flex-col justify-center px-8 py-5 rounded-2xl hover:bg-white/5 transition-all text-left"
              >
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Coordinates</span>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-white/40" />
                  <span className="text-sm font-bold text-white truncate">{location || "Worldwide"}</span>
                </div>
              </button>
              <Dropdown isOpen={activeDropdown === 'loc'}>
                {trendingLocations.map((loc, i) => (
                  <button key={i} onClick={() => { setLocation(loc.name); setActiveDropdown(null); }} className="dropdown-item">{loc.name}</button>
                ))}
              </Dropdown>
            </div>

            {/* 2. CATEGORY (DISCIPLINE) */}
            <div className="relative border-l border-white/5">
              <button 
                onClick={() => setActiveDropdown(activeDropdown === 'cat' ? null : 'cat')}
                className="w-full h-full flex flex-col justify-center px-8 py-5 rounded-2xl hover:bg-white/5 transition-all text-left"
              >
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Collection</span>
                <div className="flex items-center gap-2">
                  <CpuChipIcon className="h-4 w-4 text-white/40" />
                  <span className="text-sm font-bold text-white truncate">{selectedCategory?.displayName || "Select Group"}</span>
                </div>
              </button>
              <Dropdown isOpen={activeDropdown === 'cat'}>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); setActiveDropdown(null); }} className="dropdown-item">{cat.displayName}</button>
                ))}
              </Dropdown>
            </div>

            {/* 3. SUBCATEGORY (DYNAMIC FOCUS) */}
            <div className="relative border-l border-white/5">
              <button 
                disabled={!selectedCategory}
                onClick={() => setActiveDropdown(activeDropdown === 'sub' ? null : 'sub')}
                className={`w-full h-full flex flex-col justify-center px-8 py-5 rounded-2xl transition-all text-left ${!selectedCategory ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5'}`}
              >
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Model Variant</span>
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-white/40" />
                  <span className="text-sm font-bold text-white truncate">{selectedSubcategory?.name || "All Types"}</span>
                </div>
              </button>
              <Dropdown isOpen={activeDropdown === 'sub'}>
                {(selectedCategory?.subcategories || []).map((sub) => (
                  <button key={sub.id} onClick={() => { setSelectedSubcategory(sub); setActiveDropdown(null); }} className="dropdown-item">{sub.name}</button>
                ))}
              </Dropdown>
            </div>

            {/* 4. BUDGET */}
            <div className="flex flex-col justify-center px-8 py-5 rounded-2xl border-l border-white/5">
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Budget Range</span>
              <div className="flex items-center gap-2">
                <TicketIcon className="h-4 w-4 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Max USD"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/10 w-full"
                />
              </div>
            </div>

            {/* 5. SEARCH BUTTON */}
            <button 
              onClick={() => onSearch({
                location, 
                minPrice, 
                maxPrice, 
                category: selectedCategory?.id, 
                subcategory: selectedSubcategory?.id,
                vehicleType: "",
                make: "",
                model: "",
                isBuy: false
              })}
              className="group/btn relative overflow-hidden rounded-3xl bg-white text-black transition-all hover:bg-blue-600 hover:text-white"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 py-5 px-4">
                <MagnifyingGlassIcon className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                <span className="text-xs font-[1000] uppercase tracking-widest">Execute</span>
              </div>
              <motion.div 
                className="absolute inset-0 bg-blue-400/20"
                initial={false}
                whileHover={{ scale: 1.5, opacity: 1 }}
              />
            </button>

          </div>
        </motion.div>
      </div>
    </section>

      <style jsx global>{`
        .dropdown-item {
          @apply w-full text-left px-5 py-4 text-[11px] font-black text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest;
        }
      `}</style>
  </>
  );
}

// --- Helper Components ---

function Dropdown({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-[calc(100%+12px)] left-0 w-64 bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden z-[100] p-1 shadow-2xl"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Global CSS or Tailwind for the dropdown items
// .dropdown-item { @apply w-full text-left px-5 py-4 text-[11px] font-black text-white/60 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest; }