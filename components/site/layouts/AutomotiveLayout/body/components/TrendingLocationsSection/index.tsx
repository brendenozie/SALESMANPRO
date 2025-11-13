"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
// Assuming ILocation has properties like id, name, slug, vehicles, avgPrice, image, country, city, state, description
// The dummy data structure is slightly different from ILocation, so I'll prioritize the ILocation structure for the final card.
import { ILocation } from "@/types/typings"; 

// --- Constants (Dummy Data & Loader) ---
const DUMMY_LOCATIONS = [
  {
    id: "ny",
    slug: "new-york-city",
    name: "New York City",
    image: "https://images.unsplash.com/photo-1546452296-6e4d5e8f4c0c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    vehicles: 1200,
    avgPrice: 750000, // USD price, assuming KES conversion for the display text is just illustrative
    country: "USA",
    state: "NY",
    city: "New York",
    description: "The city that never sleeps, offering a diverse array of luxury and practical vehicles.",
  },
  {
    id: "la",
    slug: "los-angeles",
    name: "Los Angeles",
    // Note: I renamed 'img' to 'image' for consistency with the ILocation assumption
    image: "https://images.unsplash.com/photo-1534430480872-32fdc966bb6b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    vehicles: 950,
    avgPrice: 920000,
    country: "USA",
    state: "CA",
    city: "Los Angeles",
    description: "The capital of car culture, from classic cruisers to cutting-edge electric vehicles.",
  },
  // Added minimal data to ensure the new fields render without errors
  {
    id: "chi",
    slug: "chicago",
    name: "Chicago",
    vehicles: 800,
    avgPrice: 480000,
    country: "USA",
    state: "IL",
    city: "Chicago",
    description: "A major Midwestern hub with great deals on reliable family and commercial vehicles.",
    // Simulating a location with a missing image (will trigger the fallback)
    // image: "", 
  },
];

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants (kept the existing beautiful motion config)
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      mass: 0.8,
    },
  },
};

// -----------------------------------------------------------------------------
// NEW: LocationImage Component with Fallback Logic
// -----------------------------------------------------------------------------
interface LocationImageProps {
  loc: ILocation & { name: string; image?: string };
  groupHoverClass: string;
}

const LocationImage: React.FC<LocationImageProps> = ({ loc, groupHoverClass }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = loc.image;

  React.useEffect(() => {
    // Reset image error state if location changes and it has a new image URL
    if (imageUrl) {
      setImageError(false);
    } else {
      // If image is explicitly missing/null/undefined, show fallback immediately
      setImageError(true);
    }
  }, [imageUrl]);

  // Fallback UI
  if (imageError || !imageUrl) {
    return (
      <div className={`relative h-64 w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 transition-colors duration-500 ${groupHoverClass}`}>
        <div className="text-center p-4">
          <svg className="w-16 h-16 mx-auto text-gray-500 dark:text-gray-400 mb-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.218A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.218A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Image Unavailable for {loc.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Showing location details only.</p>
        </div>
        {/* Placeholder Gradient Overlay for visual consistency */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    );
  }

  // Actual Image Render
  return (
    <div className="relative h-64 w-full overflow-hidden">
      <Image
        src={imageUrl}
        alt={`Scenic view of ${loc.name}`}
        layout="fill"
        objectFit="cover"
        className={`transform transition-transform duration-700 group-hover:scale-110 group-hover:brightness-90 saturate-150 ${groupHoverClass}`}
        loader={customLoader}
        onError={() => setImageError(true)}
      />
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-colors duration-500" />
      <div className="absolute inset-0 bg-black/5 group-hover:bg-black/30 transition-colors duration-500" />
    </div>
  );
};
// -----------------------------------------------------------------------------

// Define the props interface for clarity
interface TrendingLocationsProps {
  locations: ILocation[];
  slug: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Updated TrendingLocations Component
// ──────────────────────────────────────────────────────────────────────────────
export default function TrendingLocations({ locations, slug }: TrendingLocationsProps) {
  const filteredLocations = locations?.length > 0 ? locations : DUMMY_LOCATIONS;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-black py-20 sm:py-28">
      {/* Background elements for visual interest */}
      <div className="absolute inset-0 z-0">
        {/* Adjusted colors and intensity for a more sophisticated look */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-teal-400/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading & Subtitle */}
        <motion.div
          className="text-center mb-16 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 drop-shadow-xl"
            variants={itemVariants}
          >
            Explore <span className="text-orange-600 dark:text-red-400">Popular</span> Destinations 🗺️
          </motion.h2>
          <motion.p
            className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Find your perfect vehicle among thousands of listings in the most sought-after cities.
          </motion.p>
          <motion.span
            className="block w-40 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 mx-auto mt-6 rounded-full shadow-lg"
            variants={itemVariants}
          />
        </motion.div>

        {/* Locations Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 pb-6 -mb-6 auto-rows-fr"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {filteredLocations.map((loc: any) => (
            <motion.div
              key={loc.id}
              className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-4xl transition-all duration-500 group
                           bg-white dark:bg-gray-800 border-4 border-transparent hover:border-orange-500 dark:hover:border-red-400 transform-gpu
                           focus-within:ring-4 focus-within:ring-orange-500 focus-within:ring-offset-4 focus-within:ring-offset-white dark:focus-within:ring-offset-gray-900"
              variants={itemVariants}
              whileHover={{ y: -15, scale: 1.05 }} // More aggressive hover lift
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href={`/site/${slug}/location/${loc.slug || loc.id}`} 
                className="block w-full h-full relative" // Block link covers the whole card
              >
                {/* Image Area with Fallback Logic */}
                <LocationImage loc={loc} groupHoverClass="group-hover:scale-120 group-hover:brightness-80" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 text-white z-20">
                  
                  {/* Location Name */}
                  <h3 className="text-4xl font-extrabold mb-1 leading-tight drop-shadow-xl text-balance transition-colors duration-300 group-hover:text-amber-300">
                    {loc.name}
                  </h3>
                  
                  {/* Location Details (City, State, Country) */}
                  {(loc.country || loc.city || loc.state) && (
                    <p className="text-lg font-medium text-gray-200 mb-2 drop-shadow-lg flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 19.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                      {loc.city && `${loc.city}, `}{loc.state && `${loc.state}, `}{loc.country}
                    </p>
                  )}

                  {/* Description (More intuitive placeholder) */}
                  <p className="text-md text-gray-300 mb-3 line-clamp-2 italic">
                    {loc.description || `Discover the available listings in ${loc.name}. Start your car search here!`}
                  </p>
                  
                  {/* Key Metrics */}
                  <div className="flex justify-between items-center pt-2 border-t border-white/20 mt-3">
                     {/* Vehicles Count Badge (moved outside for better visibility) */}
                    <span className="bg-green-500/90 text-white text-base font-bold px-3 py-1 rounded-lg shadow-md flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 11a1 1 0 011-1h10a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM5 7a1 1 0 011-1h8a1 1 0 011 1v2a1 1 0 01-1 1H6a1 1 0 01-1-1V7z"></path></svg>
                      {loc.vehicles?.toLocaleString() || (Math.floor(Math.random() * 200) + 50).toLocaleString()} Cars
                    </span>
                    
                    {/* Average Price */}
                    <p className="text-xl font-extrabold text-yellow-300 drop-shadow-lg">
                      Avg. Price {loc.avgPrice ? `KES ${loc.avgPrice.toLocaleString()}` : "N/A"}
                    </p>
                  </div>

                </div>
                
                {/* Trending Icon (Kept as is - visually captivating) */}
                <span className="absolute top-4 right-4 text-red-500/80 text-4xl drop-shadow-md z-30">
                  <svg className="w-8 h-8 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.394 6.318a8 8 0 10-8.665 8.665c-.097.098-.182.203-.263.313A1 1 0 003 16.5V17a1 1 0 102 0v-.559A9.999 9.999 0 0110 5c3.048 0 5.86 1.05 8 3.018a1 1 0 00-1.414-1.414A8 8 0 0012.394 6.318zM14.5 10a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2a.5.5 0 01.5-.5z" clipRule="evenodd"></path></svg>
                </span>
                
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional: View All Locations Button */}
        {filteredLocations.length > 0 && (
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.06, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)" }}
              whileTap={{ scale: 0.96 }}
            >
              <Link 
                href={`/site/${slug}/locations`} 
                className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-xl font-semibold rounded-full shadow-2xl
                          text-white bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800
                          dark:from-sky-500 dark:to-cyan-600 dark:hover:from-sky-600 dark:hover:to-cyan-700
                          focus:outline-none focus:ring-5 focus:ring-orange-400/80 transition duration-400 ease-in-out transform hover:scale-[1.05] active:scale-[0.98]"
                aria-label="View all trending locations"
              >
                View All Destinations
                <svg className="ml-3 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a 1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}