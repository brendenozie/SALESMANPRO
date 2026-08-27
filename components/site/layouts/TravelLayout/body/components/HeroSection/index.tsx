"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  GlobeAmericasIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {  HeroSlide, IStoreCategory, ISubcategory, StoreForm } from "@/types/typings";

/* ----------------------------- Types ----------------------------------- */
// interface HeroSlide {
//   type?: "image" | "video";
//   url: string;
//   headline?: string;
//   subline?: string;
//   id?: string | number;
// }

interface SearchFilters {
  location?: string;
  destination?: string;
  category?: string;
  subcategory?: string;
  date?: string;
  guests?: number;
}

interface TrendingLocation {
  name: string;
  slug: string;
  image?: string; 
}

interface Props {
  storeFormData?: StoreForm | null;
  onSearch: (filters: SearchFilters) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  trendingLocations: TrendingLocation[];
}

/* ----------------------------- Constants ----------------------------------- */
const curatedCategoriesFallback: Partial<IStoreCategory>[] = [
  {
    id: "adventure",
    displayName: "Adventure",
    subcategories: [
      { id: "hiking", name: "Hiking", slug: "hiking" },
      { id: "safari", name: "Safari", slug: "safari" },
    ],
  },
  {
    id: "relax",
    displayName: "Relaxation",
    subcategories: [
      { id: "beach", name: "Beach", slug: "beach" },
      { id: "spa", name: "Spa", slug: "spa" },
    ],
  },
];

const defaultHeroSlides: HeroSlide[] = [
  {
    id: "1",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop",
    productImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop",
    headline: "Wanderlust Awaits",
    subline: "Discover the world's most breathtaking hidden gems.",
    companyId: "",
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
  },
  {
    id: "2",
    type: "image",
    imageUrl: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2670&auto=format&fit=crop",
    productImageUrl: "https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=2670&auto=format&fit=crop",
    headline: "Escape the Ordinary",
    subline: "Curated experiences for the modern explorer.",
    companyId: "",
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
  },
];

const AUTO_ADVANCE_DELAY = 8000;

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

/* ---------------------------- Component ------------------------------- */
export default function HeroSection({
  storeFormData,
  onSearch,
  filters,
  setFilters,
  trendingLocations
}: Props) {
  // Data Setup
  const heroSlides = storeFormData?.heroSlides && storeFormData.heroSlides.length > 0
      ? storeFormData.heroSlides.map((h, idx) => ({ ...h, id: h.id ?? idx }))
      : defaultHeroSlides;

  const { destinations = [] } = storeFormData || {};
  
  // State
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.location || "");
  const slideTimerRef = useRef<number | null>(null);

  // Logic: Categories
  const rawCategories = useMemo(() => {
    const storeCats = (storeFormData as any)?.StoreCategory;
    if (Array.isArray(storeCats) && storeCats.length > 0) {
      return storeCats.map((c: any) => ({
        ...c,
        subcategories: c.subcategories ?? c.Subcategory ?? [],
      })) as IStoreCategory[];
    }
    return curatedCategoriesFallback as IStoreCategory[];
  }, [storeFormData]);

  const selectedCategory = useMemo(() => {
    return rawCategories.find((c) => c.id === filters.category);
  }, [filters.category, rawCategories]);

  // Logic: Filter Suggestions
  const filteredSuggestions = useMemo(() => {
    if (!searchInput) return trendingLocations.slice(0, 5);
    
    const locs = trendingLocations.filter((loc) =>
      loc.name.toLowerCase().includes(searchInput.toLowerCase())
    ).map(l => ({ ...l, type: 'location' }));

    const dests = destinations.filter((dest) =>
      dest.name.toLowerCase().includes(searchInput.toLowerCase())
    ).map(d => ({ ...d, type: 'destination' }));

    return [...locs, ...dests].slice(0, 6);
  }, [trendingLocations, destinations, searchInput]);


  // Logic: Slider
  const resetSlideTimer = useCallback(() => {
    if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current);
    slideTimerRef.current = window.setTimeout(() => {
      setCurrentSlide((s) => (s + 1) % heroSlides.length);
    }, AUTO_ADVANCE_DELAY);
  }, [heroSlides.length]);

  useEffect(() => {
    resetSlideTimer();
    return () => { if (slideTimerRef.current) window.clearTimeout(slideTimerRef.current); };
  }, [currentSlide, resetSlideTimer]);

  const changeSlide = (direction: number) => {
    setCurrentSlide((s) => (s + direction + heroSlides.length) % heroSlides.length);
    resetSlideTimer();
  };

  // Handlers
  const handleSearchTrigger = () => {
    setIsSearchModalOpen(true);
    setSearchInput(filters.location || filters.destination || "");
  };

  const handleSelectSuggestion = (item: any) => {
    if(item.type === 'location') {
       setFilters({ ...filters, location: item.slug, destination: undefined });
    } else {
       setFilters({ ...filters, destination: item.slug, location: undefined });
    }
    setSearchInput(item.name);
  };

  const handleCategorySelect = (catId: string) => {
    setFilters({ ...filters, category: catId === filters.category ? undefined : catId, subcategory: undefined });
  };

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-gray-900">
      
      {/* 1. IMMERSIVE BACKGROUND SLIDER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          className="absolute inset-0 z-0"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {heroSlides[currentSlide]?.type === "video" ? (
             <video
               src={storeFormData?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
               autoPlay muted loop playsInline
               className="h-full w-full object-cover"
             />
          ) : (
            <Image
              src={heroSlides[currentSlide].imageUrl || heroSlides[currentSlide].productImageUrl || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2621&auto=format&fit=crop"}
              alt="Travel Hero"
              fill
              priority
              loader={loader}
              className="object-cover brightness-[0.65]"
            />
          )}
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* 2. HERO CONTENT */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
        
        <motion.div
          key={`text-${currentSlide}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="h-px w-10 bg-white/60" />
            <span className="text-white/80 uppercase tracking-[0.2em] text-xs font-bold">
               Explore The World
            </span>
            <span className="h-px w-10 bg-white/60" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 drop-shadow-2xl leading-[1.1]">
            {heroSlides[currentSlide]?.headline}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            {heroSlides[currentSlide]?.subline}
          </p>
        </motion.div>

        {/* 3. THE SEARCH "TRIGGER" BAR (Simulated Input) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          onClick={handleSearchTrigger}
          className="w-full max-w-3xl bg-white/10 backdrop-blur-xl border border-white/30 rounded-full p-2 flex items-center shadow-2xl cursor-pointer hover:bg-white/20 transition-all group"
        >
            <div className="flex-1 flex items-center pl-6 h-14">
               <MagnifyingGlassIcon className="w-6 h-6 text-white/80 mr-3 group-hover:text-white transition-colors" />
               <div className="text-left">
                  <p className="text-white font-medium text-lg">
                    {filters.location || filters.destination || "Where to?"}
                  </p>
                  <p className="text-white/60 text-xs">
                    {(filters.date || filters.guests) ? `${filters.date || ''} • ${filters.guests || 0} Guests` : "Search destinations, hotels, adventures..."}
                  </p>
               </div>
            </div>
            <div className="bg-white text-indigo-900 h-12 w-12 rounded-full flex items-center justify-center font-bold shadow-lg">
                <ArrowRightIcon className="w-5 h-5" />
            </div>
        </motion.div>

      </div>

      {/* 4. SLIDER CONTROLS (Bottom) */}
      <div className="absolute bottom-8 left-0 right-0 z-20 px-8 flex items-center justify-between max-w-[1400px] mx-auto text-white">
         {/* Progress Dots */}
         <div className="flex gap-3">
            {heroSlides.map((_, idx) => (
               <button 
                 key={idx} 
                 onClick={() => setCurrentSlide(idx)}
                 className="relative h-1 rounded-full bg-white/30 overflow-hidden transition-all duration-300"
                 style={{ width: currentSlide === idx ? '3rem' : '1rem' }}
               >
                  {currentSlide === idx && (
                     <motion.div 
                       layoutId="slideProgress"
                       className="absolute inset-0 bg-white"
                       initial={{ width: '0%' }}
                       animate={{ width: '100%' }}
                       transition={{ duration: AUTO_ADVANCE_DELAY / 1000, ease: "linear" }}
                     />
                  )}
               </button>
            ))}
         </div>
         
         {/* Arrows */}
         <div className="flex gap-4">
            <button onClick={() => changeSlide(-1)} className="p-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all">
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <button onClick={() => changeSlide(1)} className="p-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all">
                <ArrowRightIcon className="w-5 h-5" />
            </button>
         </div>
      </div>


      {/* 5. IMMERSIVE SEARCH MODAL */}
      <AnimatePresence>
        {isSearchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:items-center sm:pt-0 bg-black/60 backdrop-blur-md p-4"
            onClick={() => setIsSearchModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[600px]"
            >
              
              {/* LEFT: VISUALS & SUGGESTIONS */}
              <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800 p-6 border-r border-gray-100 dark:border-gray-700 overflow-y-auto custom-scrollbar">
                 <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Popular Destinations</h3>
                 <div className="space-y-3">
                    {filteredSuggestions.map((item: any, idx) => (
                       <button
                         key={idx}
                         onClick={() => handleSelectSuggestion(item)}
                         className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all group text-left"
                       >
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                             {item.type === 'location' ? <MapPinIcon className="w-5 h-5"/> : <GlobeAmericasIcon className="w-5 h-5"/>}
                          </div>
                          <div>
                             <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</p>
                             <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                          </div>
                       </button>
                    ))}
                 </div>

                 <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-8 mb-4">Travel Style</h3>
                 <div className="flex flex-wrap gap-2">
                    {rawCategories.map((cat) => (
                       <button
                         key={cat.id}
                         onClick={() => handleCategorySelect(cat.id)}
                         className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            filters.category === cat.id 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                         }`}
                       >
                          {cat.displayName}
                       </button>
                    ))}
                 </div>
              </div>

              {/* RIGHT: FORM */}
              <div className="w-full md:w-2/3 p-8 flex flex-col">
                 <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plan your trip</h2>
                    <button 
                      onClick={() => setIsSearchModalOpen(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                    >
                       <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                 </div>

                 <form 
                    onSubmit={(e) => { e.preventDefault(); onSearch(filters); setIsSearchModalOpen(false); }}
                    className="space-y-6 flex-1 overflow-y-auto"
                 >
                    {/* Input Group */}
                    <div className="space-y-4">
                       <div className="relative">
                          <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Where</label>
                          <div className="relative">
                             <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                             <input 
                               type="text"
                               value={searchInput}
                               onChange={(e) => setSearchInput(e.target.value)}
                               placeholder="Search destinations..."
                               className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs font-bold uppercase text-gray-500 mb-1">When</label>
                             <div className="relative">
                                <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                  type="date"
                                  value={filters.date || ''}
                                  onChange={(e) => setFilters({...filters, date: e.target.value})}
                                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                />
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Who</label>
                             <div className="relative">
                                <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                  type="number"
                                  min={1}
                                  placeholder="Guests"
                                  value={filters.guests || ''}
                                  onChange={(e) => setFilters({...filters, guests: Number(e.target.value)})}
                                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                                />
                             </div>
                          </div>
                       </div>
                       
                       {/* Selected Filters Display */}
                       {(filters.category || filters.subcategory) && (
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center gap-3">
                             <SparklesIcon className="w-5 h-5 text-indigo-600" />
                             <div className="text-sm">
                                <span className="text-gray-500">Looking for: </span>
                                <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                   {filters.subcategory || filters.category}
                                </span>
                             </div>
                             <button 
                               type="button"
                               onClick={() => setFilters({...filters, category: undefined, subcategory: undefined})}
                               className="ml-auto text-xs text-indigo-600 hover:underline"
                             >
                               Clear
                             </button>
                          </div>
                       )}
                    </div>

                    <div className="pt-4 mt-auto border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <button
                           type="button"
                           onClick={() => { setFilters({}); setSearchInput(""); }}
                           className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                           Clear all
                        </button>
                        <button
                           type="submit"
                           className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                           <MagnifyingGlassIcon className="w-5 h-5" />
                           Search Trips
                        </button>
                    </div>
                 </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}