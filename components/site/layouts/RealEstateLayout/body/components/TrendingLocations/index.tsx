"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ILocation } from "@/types/typings";
import {
  MapPinIcon,
  FireIcon,
  ArrowRightIcon,
  HomeModernIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

/* -------------------------------------------------------------------------- */
/* Constants & Helpers */
/* -------------------------------------------------------------------------- */
const FALLBACK_IMAGE_URL =
  "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1000&auto=format&fit=crop";

const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const getLocationImage = (loc: ILocation) => {
  // Handle dynamic casting safely
  const l: any = loc;
  if (l.image) return l.image;
  if (l.imageUrl) return l.imageUrl;
  return FALLBACK_IMAGE_URL;
};

/* -------------------------------------------------------------------------- */
/* Animations */
/* -------------------------------------------------------------------------- */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 20 },
  },
};

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

/**
 * Decorative Background Pattern
 */
const DotPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern
          id="dot-grid-loc"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid-loc)" />
    </svg>
  </div>
);

/**
 * Location Card Component
 * Features: Portrait aspect ratio, zoom hover, glass data capsules
 */
const LocationCard = ({ loc, slug }: { loc: ILocation; slug: string }) => {
  // Mock data handling for display purposes
  const anyLoc = loc as any;
  const listingsCount = anyLoc.listings || Math.floor(Math.random() * 150) + 10;
  const avgPrice =
    anyLoc.avgPrice || Math.floor(Math.random() * 5000000) + 1000000;

  return (
    <motion.div variants={cardVariants} className="group relative h-full">
      <Link
        href={`/site/${slug}/location/${loc.slug}`}
        className="block relative h-[450px] w-full overflow-hidden rounded-[2rem] shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
      >
        {/* 1. Image Layer */}
        <div className="absolute inset-0 h-full w-full">
          <Image
            src={getLocationImage(loc)}
            alt={loc.name}
            loader={customLoader}
            fill
            className="object-cover transition-transform duration-1000 will-change-transform group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {/* Gradient Overlay: Darker at bottom for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
        </div>

        {/* 2. Floating Top Badges */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
            <HomeModernIcon className="w-3.5 h-3.5 text-emerald-400" />
            {listingsCount} Listings
          </span>
          
          {/* "Trending" Badge - Only show for some logic (mocked here) */}
          {listingsCount > 50 && (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/90 text-white shadow-lg animate-pulse">
              <FireIcon className="w-4 h-4" />
            </span>
          )}
        </div>

        {/* 3. Content Layer (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col justify-end z-10">
          
          {/* Location Name & Pin */}
          <div className="transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
            <h3 className="text-3xl font-extrabold text-white leading-tight drop-shadow-lg mb-1">
              {loc.name}
            </h3>
            
            {(loc.city || loc.country) && (
              <div className="flex items-center text-gray-300 text-sm font-medium mb-4">
                <MapPinIcon className="w-4 h-4 text-emerald-400 mr-1" />
                {loc.city ? `${loc.city}, ` : ""}
                {loc.country}
              </div>
            )}

            {/* Price & CTA Row */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Avg. Price</p>
                <p className="text-lg font-bold text-white">
                  KES {avgPrice.toLocaleString()}
                </p>
              </div>

              <div className="h-10 w-10 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow-lg transform scale-0 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                <ArrowRightIcon className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Export */
/* -------------------------------------------------------------------------- */

interface TrendingLocationsProps {
  locations: ILocation[];
  slug: string;
}

export default function TrendingLocations({
  locations,
  slug,
}: TrendingLocationsProps) {
  
  // Handle empty state
  if (!locations || locations.length === 0) {
    return (
      <section className="py-24 bg-gray-50 dark:bg-gray-950 text-center">
         <div className="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <MapPinIcon className="w-8 h-8 text-gray-400" />
         </div>
        <p className="text-gray-500 font-medium">Trending locations coming soon.</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gray-50 dark:bg-gray-950 py-24 sm:py-32 text-gray-900 dark:text-gray-100">
      <DotPattern />

      <div className="container relative z-10 mx-auto px-6 max-w-7xl">
        
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wide mb-4"
          >
            <SparklesIcon className="w-4 h-4" />
            Hotspots
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Destinations</span>
          </motion.h2>

          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Discover the most sought-after neighborhoods and cities. 
            High demand, excellent amenities, and prime investment opportunities.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {locations.map((loc) => (
            <LocationCard key={loc.id} loc={loc} slug={slug} />
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Link href={`/site/${slug}/locations`} passHref legacyBehavior>
            <a className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 transition-all duration-300 hover:ring-emerald-500 hover:text-emerald-600 dark:hover:ring-emerald-400 dark:hover:text-emerald-400 hover:scale-105">
              Explore All Locations
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}