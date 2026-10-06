"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ILocation } from "@/types/typings";
import { 
  MapPinIcon, 
  ArrowRightIcon, 
  BuildingLibraryIcon,
  GlobeAmericasIcon
} from "@heroicons/react/24/solid";

// --- Constants & Mock Data ---
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop";

const DUMMY_LOCATIONS = [
  {
    id: "ny",
    slug: "new-york-city",
    name: "New York City",
    image: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=2070&auto=format&fit=crop",
    vehicles: 1240,
    avgPrice: 4500000, 
    country: "USA",
    city: "New York",
  },
  {
    id: "la",
    slug: "los-angeles",
    name: "Los Angeles",
    image: "https://images.unsplash.com/photo-1540155945626-66eacf57fcb9?q=80&w=2664&auto=format&fit=crop",
    vehicles: 950,
    avgPrice: 5200000,
    country: "USA",
    city: "Los Angeles",
  },
  {
    id: "chi",
    slug: "chicago",
    name: "Chicago",
    vehicles: 800,
    avgPrice: 3800000,
    country: "USA",
    city: "Chicago",
    // No image to test fallback
  },
];

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  },
};

// --- Components ---

/**
 * Background Dot Pattern for texture
 */
const DotPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dot-grid-loc" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid-loc)" />
    </svg>
  </div>
);

/**
 * Location Card Component
 * Handles Image State, Hover Effects, and Data Display
 */
const LocationCard = ({ loc, slug }: { loc: any; slug: string }) => {
  const [imgError, setImgError] = useState(false);
  const imageUrl = !imgError && loc.image ? loc.image : FALLBACK_IMAGE;

  return (
    <motion.div 
      variants={cardVariants}
      className="group relative h-[420px] w-full rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      <Link href={`/automotive/listings?location=${loc.id || loc.name }`} className="block h-full w-full">
        
        {/* 1. Background Image Layer */}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800">
          <Image decoding="async"
            src={imageUrl}
            alt={loc.name}
            fill
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
            onError={() => setImgError(true)}
          />
          {/* Gradient Overlay: Darker at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/40 to-transparent opacity-90 transition-opacity duration-500" />
        </div>

        {/* 2. Top Badge (Listings Count) */}
        <div className="absolute top-5 right-5 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
            <BuildingLibraryIcon className="w-3.5 h-3.5" />
            {loc.vehicles?.toLocaleString() || "N/A"} listings
          </div>
        </div>

        {/* 3. Content Layer (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-20 flex flex-col justify-end h-full">
          
          <div className="transform transition-transform duration-500 translate-y-8 group-hover:translate-y-0">
            {/* Location Name */}
            <h3 className="text-3xl font-extrabold text-white mb-1 leading-tight tracking-tight">
              {loc.name}
            </h3>

            {/* Sub Location */}
            <div className="flex items-center text-gray-300 text-sm font-medium mb-6">
              <MapPinIcon className="w-4 h-4 text-emerald-400 mr-1" />
              {loc.city ? `${loc.city}, ` : ''}{loc.country || "Location"}
            </div>

            {/* Hidden Info (Revealed on Hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75 space-y-4">
              <div className="h-px w-full bg-white/20" /> {/* Divider */}
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Avg. Price</p>
                  <p className="text-xl font-bold text-white">
                    KES {loc.avgPrice ? (loc.avgPrice / 1000).toFixed(0) + 'k' : 'N/A'}
                  </p>
                </div>

                <div className="h-10 w-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:bg-emerald-500 hover:text-white transition-colors duration-300">
                  <ArrowRightIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </Link>
    </motion.div>
  );
};


// --- Main Component ---

interface TrendingLocationsProps {
  locations: ILocation[];
  slug: string;
}

export default function TrendingLocations({ locations, slug }: TrendingLocationsProps) {
  const displayLocations = locations?.length > 0 ? locations : DUMMY_LOCATIONS;

  return (
    <section className="relative py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <DotPattern />
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16 max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div 
            variants={cardVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <GlobeAmericasIcon className="w-4 h-4" />
            Top Destinations
          </motion.div>

          <motion.h2 
            variants={cardVariants}
            className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6"
          >
            Explore by <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Region</span>
          </motion.h2>

          <motion.p 
            variants={cardVariants}
            className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Find the perfect vehicle in your preferred area. We have verified listings in major cities across the country.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {displayLocations.map((loc: any) => (
            <LocationCard key={loc.id} loc={loc} slug={slug} />
          ))}
        </motion.div>

        {/* Footer Action */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link href={`/automotive/listings`} passHref legacyBehavior>
            <a className="group inline-flex items-center gap-3 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              View All Locations
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}