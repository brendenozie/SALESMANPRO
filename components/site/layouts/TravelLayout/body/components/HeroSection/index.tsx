"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// --- Types (as defined before) ---
interface HeroSlide {
  type: "image" | "video";
  url: string;
  headline: string;
  subline: string;
}
interface Destination { name: string; }
interface TripType { name: string; }

interface StoreForm {
  name?: string;
  heroSlides?: HeroSlide[];
  popularDestinations?: Destination[];
  tripTypes?: TripType[];
}

interface SearchFilters {
  destination: string;
  tripType: string;
  date: string;
  guests: number;
}

interface HeroProps {
  storeFormData: StoreForm;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  onSearch: (e: React.FormEvent) => void;
}


// --- Dummy Data (can be passed via props) ---
const defaultHeroSlides: HeroSlide[] = [
    { type: "video", url: "/assets/hero-travel.mp4", headline: "Explore the World, Create Unforgettable Memories", subline: "Your next adventure awaits. Discover breathtaking destinations and plan your perfect journey with ease." },
    { type: "image", url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2940&auto=format=fit=crop", headline: "Serene Lakeside Escapes", subline: "Find tranquility and beauty in the world's most stunning lakeside locations." },
    { type: "image", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2940&auto=format=fit=crop", headline: "Adventure is Calling", subline: "From majestic mountains to rushing rivers, your greatest adventure is just a click away." },
];
const defaultPopularDestinations: Destination[] = [ { name: "Paris, France" }, { name: "Kyoto, Japan" }, { name: "Rome, Italy" }, { name: "Bali, Indonesia" } ];
const defaultTripTypes: TripType[] = [ { name: "Adventure Travel" }, { name: "Relaxation Getaway" }, { name: "Cultural Exploration" } ];
const autoAdvanceDelay = 8000;

// Animation variants from your original component
const containerVariants = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15, delayChildren: 0.3 } } };
const itemVariants = { hidden: { opacity: 0, y: 50, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 120, damping: 18 } } };


export default function Hero({ storeFormData, filters, setFilters, onSearch }: HeroProps) {
  const heroSlides = storeFormData?.heroSlides?.length ? storeFormData.heroSlides : defaultHeroSlides;
  const popularDestinations = storeFormData?.popularDestinations?.length ? storeFormData.popularDestinations : defaultPopularDestinations;
  const tripTypes = storeFormData?.tripTypes?.length ? storeFormData.tripTypes : defaultTripTypes;

  const [current, setCurrent] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const advanceSlide = useCallback(() => setCurrent((prev) => (prev + 1) % heroSlides.length), [heroSlides.length]);
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(advanceSlide, autoAdvanceDelay);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, advanceSlide]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Dynamic Backgrounds (Logic unchanged) */}
      <AnimatePresence initial={false}>
        <motion.div key={current} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}>
          {heroSlides[current].type === "image" ? ( <Image src={heroSlides[current].url} alt={heroSlides[current].headline} fill priority className="object-cover" /> ) : ( <video src={heroSlides[current].url} autoPlay muted loop playsInline className="h-full w-full object-cover" /> )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30" />

      {/* Dynamic Content (Logic unchanged) */}
      <motion.div key={current} className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white max-w-5xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        <motion.h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-lg" variants={itemVariants}>
          {heroSlides[current].headline}
        </motion.h1>
        <motion.p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl drop-shadow" variants={itemVariants}>
          {heroSlides[current].subline}
        </motion.p>

        {/* --- FORM WITH ORIGINAL DESIGN AND NEW DATA BINDINGS --- */}
        <motion.form
          className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-4xl"
          variants={itemVariants}
          onSubmit={onSearch}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Destination Input (Original styles, new value/onChange) */}
            <div className="relative">
              <MapPinIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="text"
                list="destinations" // Added for suggestions
                value={filters.destination}
                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                placeholder="Where do you want to go?"
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-200"
              />
              <datalist id="destinations">
                {popularDestinations.map((dest) => <option key={dest.name} value={dest.name} />)}
              </datalist>
            </div>

            {/* Travel Type Select (Original styles, new value/onChange, dynamic options) */}
            <div className="relative">
              <span className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6">✈️</span>
              <select
                value={filters.tripType}
                onChange={(e) => setFilters({ ...filters, tripType: e.target.value })}
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer transition duration-200"
              >
                {tripTypes.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
              </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>

            {/* Date Picker (Original styles, new value/onChange) */}
            <div className="relative">
              <CalendarDaysIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-200"
              />
            </div>

            {/* Guests Input (Original styles, new value/onChange) */}
            <div className="relative">
              <UserGroupIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="number"
                min={1}
                max={10}
                value={filters.guests}
                onChange={(e) => setFilters({ ...filters, guests: Number(e.target.value) })}
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-200"
                placeholder="Guests"
              />
            </div>
          </div>

          {/* Button and Links (Original styles, new onSubmit on form) */}
          <button type="submit" className="mt-6 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-4 font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center gap-2">
            <MagnifyingGlassIcon className="h-6 w-6" /> Search Your Journey
          </button>
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-indigo-700 font-medium">
            <Link href="/host" passHref>
              <motion.a className="hover:underline hover:text-indigo-900 transition" variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                🌍 Become a Host
              </motion.a>
            </Link>
            <Link href="/contact" passHref>
              <motion.a className="hover:underline hover:text-indigo-900 transition" variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                📞 Contact Travel Expert
              </motion.a>
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </section>
  );
}