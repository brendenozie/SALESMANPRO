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
    textColor: null,
    stats: null
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
  const springX = useSpring(mouseX, { stiffness: 50, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 40);
    mouseY.set((clientY / innerHeight - 0.5) * 40);
  };

  const nextSlide = useCallback(() => setCurrent((prev) => (prev + 1) % heroSlides.length), [heroSlides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
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
      className="relative min-h-[100dvh] w-full bg-white dark:bg-[#050505] selection:bg-blue-500/30 overflow-visible flex flex-col justify-center"
    >
      {/* 1. KINETIC BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            style={{ x: springX, y: springY, scale: 1.05 }}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={heroSlides[current].imageUrl || defaultSlides[0].imageUrl || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2560"}
              alt="Hero Background"
              fill
              className="object-cover brightness-[0.5] dark:brightness-[0.35] saturate-[1.1]"
              priority
              loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
            />
            {/* Elegant vignette overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-black/20 dark:from-[#050505] dark:via-transparent dark:to-black/50" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. CONTENT LAYER */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 md:px-8 py-24 w-full h-full mt-auto">
        
        {/* Luxury Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8 flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 dark:bg-black/20 px-5 py-2 backdrop-blur-xl shadow-lg"
        >
          <SparklesIcon className="h-4 w-4 text-blue-400" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white">
            Exclusive Inventory Access
          </span>
        </motion.div>

        {/* Headline & Subline Container */}
        <div className="mb-12 md:mb-16 text-center select-none w-full max-w-5xl mx-auto flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              {/* Scaled Responsive Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-[900] leading-[0.95] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 uppercase drop-shadow-2xl whitespace-pre-line">
                {heroSlides[current].headline}
              </h1>

              {/* Added Subline for Better Engagement */}
              {heroSlides[current].subline && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-base sm:text-lg md:text-xl font-medium text-white/80 max-w-2xl leading-relaxed tracking-wide drop-shadow-md"
                >
                  {heroSlides[current].subline}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. THE COMMAND CONSOLE */}
        <motion.div
            ref={containerRef}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-[9999] w-full max-w-6xl overflow-visible"
          >
          <div className="flex flex-col md:flex-row gap-2 md:gap-0 bg-white/70 dark:bg-[#111]/70 backdrop-blur-2xl p-2 md:p-2 rounded-[2rem] md:rounded-full border border-white/40 dark:border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 dark:ring-white/5">
            
            <CommandInput
              label="Coordinates"
              value={location || "Worldwide"}
              icon={<MapPinIcon className="h-5 w-5" />}
              active={activeDropdown === 'loc'}
              onClick={() => setActiveDropdown(activeDropdown === 'loc' ? null : 'loc')}
              isFirst
            >
              <Dropdown isOpen={activeDropdown === 'loc'}>
                <div className="p-3 border-b border-black/5 dark:border-white/10 mb-1">
                  <span className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-wider ml-2">Trending</span>
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
              icon={<CpuChipIcon className="h-5 w-5" />}
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
              icon={<AdjustmentsHorizontalIcon className="h-5 w-5" />}
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

            {/* Budget Input */}
            <div className="relative flex-1 flex flex-col justify-center px-6 py-4 md:py-0 md:border-l border-black/10 dark:border-white/10 bg-black/5 md:bg-transparent rounded-2xl md:rounded-none group focus-within:bg-blue-50/50 dark:focus-within:bg-white/5 transition-colors">
              <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5">Budget</span>
              <div className="flex items-center gap-2.5">
                <BanknotesIcon className="h-5 w-5 text-black/40 dark:text-white/40 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="number"
                  placeholder="Max USD"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-transparent text-sm md:text-base font-bold text-black dark:text-white outline-none placeholder:text-black/30 dark:placeholder:text-white/30 w-full"
                />
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={() => onSearch({
                location, minPrice: "", maxPrice,
                category: selectedCategory?.id, subcategory: selectedSubcategory?.id,
                vehicleType: "", make: "", model: "", isBuy: false
              })}
              className="group/btn relative overflow-hidden rounded-[1.5rem] md:rounded-full bg-blue-600 dark:bg-white text-white dark:text-black transition-all hover:scale-[1.02] active:scale-95 shadow-xl mt-2 md:mt-0 ml-0 md:ml-2 w-full md:w-auto flex-shrink-0"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 py-5 px-8 h-full">
                <MagnifyingGlassIcon className="h-5 w-5 transition-transform duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
                <span className="text-sm font-[900] uppercase tracking-widest">Execute</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            </button>

          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .dropdown-item {
          @apply block w-full text-left px-5 py-3.5 text-xs font-bold 
          text-neutral-700 dark:text-white/80 
          hover:text-blue-600 dark:hover:text-white 
          hover:bg-blue-50 dark:hover:bg-white/10 
          transition-colors uppercase tracking-[0.15em] rounded-xl;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        /* Elegant scrollbar for dropdowns */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          @apply bg-black/10 dark:bg-white/20 rounded-full; 
          border: 2px solid transparent; 
          background-clip: padding-box; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { @apply bg-black/20 dark:bg-white/30; }
        
        /* Remove arrows from number input */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </section>
  );
}

// --- STRICTLY TYPED SUB-COMPONENTS ---

interface CommandInputProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isFirst?: boolean;
}

function CommandInput({ label, value, icon, active, disabled, onClick, children, isFirst }: CommandInputProps) {
  return (
    <div  className={`relative flex-1 w-full overflow-visible ${ !isFirst ? "md:border-l border-black/10 dark:border-white/10" : "" }`}>
      <button
        disabled={disabled}
        onClick={onClick}
        className={`w-full h-full flex flex-col justify-center px-6 py-4 md:py-5 rounded-2xl md:rounded-none transition-all text-left group
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/5'}
          ${active ? 'bg-black/5 dark:bg-white/5' : ''}
          ${isFirst ? 'md:rounded-l-full' : ''}`}
      >
        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5 transition-colors">{label}</span>
        <div className="flex items-center gap-2.5">
          <span className={`transition-colors duration-300 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-black/40 dark:text-white/40'}`}>
            {icon}
          </span>
          <span className="text-sm md:text-base font-bold text-black dark:text-white truncate max-w-[120px] md:max-w-full">
            {value}
          </span>
          <ChevronDownIcon 
            className={`h-4 w-4 ml-auto transition-transform duration-300 ease-out 
            ${active ? 'rotate-180 text-blue-600 dark:text-blue-400' : 'text-black/30 dark:text-white/30 group-hover:translate-y-0.5'}`} 
          />
        </div>
      </button>
      {children}
    </div>
  );
}

function Dropdown({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="
            absolute
            left-0
            right-0
            top-[calc(100%+8px)]
            md:right-auto
            md:w-[320px]
            md:top-[calc(100%+16px)]

            z-[99999]

            overflow-hidden
            rounded-2xl
            md:rounded-3xl

            bg-white/95
            dark:bg-[#151515]/95
            backdrop-blur-3xl

            border
            border-black/10
            dark:border-white/10

            shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]
            ring-1
            ring-black/5
            dark:ring-white/5

            p-2.5
          "
        >
          <div className="custom-scrollbar flex max-h-[45vh] flex-col gap-1 overflow-y-auto pr-1 md:max-h-[350px]">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}