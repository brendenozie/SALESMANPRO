"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  ChevronDownIcon,
  BanknotesIcon,
  CpuChipIcon,
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
  const heroSlides = store?.heroSlides?.length ? store.heroSlides : defaultSlides;
  const categories = (store?.StoreCategory ?? []).filter((c) => c.visible ?? true);
  
  const [current, setCurrent] = useState(0);
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IStoreCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubcategory | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 30);
    mouseY.set((clientY / innerHeight - 0.5) * 30);
  };

  const nextSlide = useCallback(() => setCurrent((prev) => (prev + 1) % heroSlides.length), [heroSlides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 10000);
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => { 
      clearInterval(timer); 
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [nextSlide]);

  return (
    <section 
      onMouseMove={handleMouseMove}
      // CRITICAL FIX: Changed h-screen to min-h-[100dvh] and removed forced overflow hidden
      className="relative min-h-[100dvh] w-full bg-white dark:bg-[#050505] selection:bg-blue-500/30 overflow-visible"
    >
      {/* 1. KINETIC BACKGROUND - Fixed position ensures it stays behind even when scrolling */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            style={{ x: springX, y: springY, scale: 1.1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image
              src={heroSlides[current].imageUrl || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560"}
              alt="Hero Background"
              fill
              className="object-cover brightness-[0.6] dark:brightness-[0.4] saturate-[1.2]"
              priority
              loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`} // Optimize image loading
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/10 dark:from-[#050505] dark:via-transparent dark:to-black/30" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. CONTENT LAYER */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 md:px-6 py-12 md:py-20">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8 flex items-center gap-3 rounded-full border border-black/10 dark:border-white/10 bg-white/20 dark:bg-white/5 px-4 py-1.5 backdrop-blur-2xl"
        >
          <SparklesIcon className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-black/80 dark:text-white/80">
            Exclusive Inventory Access
          </span>
        </motion.div>

        <div className="mb-10 md:mb-16 text-center select-none w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.h1
                key={current}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                className="text-4xl sm:text-6xl md:text-9xl font-[1000] leading-[0.9] md:leading-[0.85] tracking-tighter text-white italic uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] whitespace-pre-line"
              >
                {heroSlides[current].headline}
              </motion.h1>
          </AnimatePresence>
        </div>

        {/* 3. THE COMMAND CONSOLE */}
         {/* 3. THE COMMAND CONSOLE */}
        <motion.div 
          ref={containerRef}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-7xl"
        >
          <div className="flex flex-col md:grid md:grid-cols-5 gap-1 md:gap-2 bg-white/80 dark:bg-black/60 backdrop-blur-3xl p-2 md:p-3 rounded-[2rem] md:rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-2xl">
            
            <CommandInput 
              label="Coordinates" 
              value={location || "Worldwide"} 
              icon={<MapPinIcon className="h-4 w-4" />}
              active={activeDropdown === 'loc'}
              onClick={() => setActiveDropdown(activeDropdown === 'loc' ? null : 'loc')}
              isFirst
            >
              <Dropdown isOpen={activeDropdown === 'loc'}>
                <div className="p-2 border-b border-black/5 dark:border-white/5 mb-1">
                  <span className="text-[10px] font-bold opacity-50 uppercase ml-3">Trending</span>
                </div>
                {trendingLocations.map((loc, i) => (
                  <button key={i} onClick={() => { setLocation(loc.name); setActiveDropdown(null); }} className="dropdown-item">
                    {loc.name}
                  </button>
                ))}
              </Dropdown>
            </CommandInput>

            <CommandInput 
              label="Collection" 
              value={selectedCategory?.displayName || "Select Group"} 
              icon={<CpuChipIcon className="h-4 w-4" />}
              active={activeDropdown === 'cat'}
              onClick={() => setActiveDropdown(activeDropdown === 'cat' ? null : 'cat')}
            >
              <Dropdown isOpen={activeDropdown === 'cat'}>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => { setSelectedCategory(cat); setSelectedSubcategory(null); setActiveDropdown(null); }} className="dropdown-item">
                    {cat.displayName}
                  </button>
                ))}
              </Dropdown>
            </CommandInput>

            <CommandInput 
              label="Model Variant" 
              value={selectedSubcategory?.name || "All Types"} 
              icon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
              active={activeDropdown === 'sub'}
              disabled={!selectedCategory}
              onClick={() => setActiveDropdown(activeDropdown === 'sub' ? null : 'sub')}
            >
              <Dropdown isOpen={activeDropdown === 'sub'}>
                {(selectedCategory?.subcategories || []).map((sub) => (
                  <button key={sub.id} onClick={() => { setSelectedSubcategory(sub); setActiveDropdown(null); }} className="dropdown-item">
                    {sub.name}
                  </button>
                ))}
              </Dropdown>
            </CommandInput>

            <div className="flex flex-col justify-center px-6 md:px-8 py-4 md:py-5 rounded-2xl md:border-l border-black/5 dark:border-white/5 bg-black/5 md:bg-transparent mb-1 md:mb-0">
              <span className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-1">Budget</span>
              <div className="flex items-center gap-2">
                <BanknotesIcon className="h-4 w-4 text-black/40 dark:text-white/40" />
                <input 
                  type="text" 
                  placeholder="Max USD"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-transparent text-sm font-bold text-black dark:text-white outline-none placeholder:text-black/20 dark:placeholder:text-white/10 w-full"
                />
              </div>
            </div>

            <button 
              onClick={() => onSearch({
                location, minPrice: "", maxPrice, 
                category: selectedCategory?.id, subcategory: selectedSubcategory?.id,
                vehicleType: "", make: "", model: "", isBuy: false
              })}
              className="group/btn relative overflow-hidden rounded-2xl md:rounded-3xl bg-blue-600 dark:bg-white text-white dark:text-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl min-h-[60px] md:min-h-0"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 py-4 md:py-5 px-4">
                <MagnifyingGlassIcon className="h-5 w-5 transition-transform group-hover/btn:rotate-12" />
                <span className="text-xs font-[1000] uppercase tracking-widest">Execute</span>
              </div>
              <div className="absolute inset-0 bg-black/20 dark:bg-blue-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </button>

          </div>
        </motion.div>
      </div>

      <style jsx global>{`
          .dropdown-item {
            @apply block w-full text-left px-5 py-4 text-[11px] font-black 
            text-neutral-700 dark:text-white/70 
            hover:text-blue-600 dark:hover:text-white 
            hover:bg-blue-50 dark:hover:bg-white/5 
            transition-all uppercase tracking-[0.2em] rounded-xl;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-blue-500/20 rounded-full; }
        `}
      </style>
    </section>
  );
}

// --- SUB-COMPONENTS REMAIN THE SAME ---
function CommandInput({ label, value, icon, active, disabled, onClick, children, isFirst }: any) {
  return (
    <div className={`relative w-full ${!isFirst && 'md:border-l border-black/5 dark:border-white/5'} mb-1 md:mb-0`}>
      <button 
        disabled={disabled}
        onClick={onClick}
        className={`w-full h-full flex flex-col justify-center px-6 md:px-8 py-4 md:py-5 rounded-2xl transition-all text-left group
          ${disabled ? 'opacity-20 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/5'}
          ${active ? 'bg-black/5 dark:bg-white/5 ring-1 ring-blue-500/20' : ''}`}
      >
        <span className="text-[9px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-1">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`transition-colors ${active ? 'text-blue-500' : 'text-black/40 dark:text-white/40'}`}>{icon}</span>
          <span className="text-sm font-bold text-black dark:text-white truncate">{value}</span>
          <ChevronDownIcon className={`h-3 w-3 ml-auto transition-transform duration-300 ${active ? 'rotate-180 text-blue-500' : 'text-black/20 dark:text-white/20'}`} />
        </div>
      </button>
      {children}
    </div>
  );
}

function Dropdown({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-[calc(100%+8px)] md:top-[calc(100%+16px)] left-0 right-0 md:right-auto md:w-72 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-2xl md:rounded-3xl overflow-hidden z-[100] p-2 shadow-2xl"
        >
          <div className="flex flex-col gap-1 max-h-[40vh] md:max-h-[300px] overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}