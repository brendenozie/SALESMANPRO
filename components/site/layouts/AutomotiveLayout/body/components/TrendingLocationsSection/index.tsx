"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ILocation } from "@/types/typings"; // Assuming your types are in this path or similar

const dummyLocations = [
  {
    id: "ny",
    name: "New York City",
    img: "https://images.unsplash.com/photo-1546452296-6e4d5e8f4c0c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 1200,
    avgPrice: 750000,
  },
  {
    id: "la",
    name: "Los Angeles",
    img: "https://images.unsplash.com/photo-1534430480872-32fdc966bb6b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 950,
    avgPrice: 920000,
  },
  {
    id: "chi",
    name: "Chicago",
    img: "https://images.unsplash.com/photo-1596768340103-685d038237b6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 800,
    avgPrice: 480000,
  },
  {
    id: "mia",
    name: "Miami",
    img: "https://images.unsplash.com/photo-1558961363-db2be0bc4403?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 600,
    avgPrice: 650000,
  },
  {
    id: "sf",
    name: "San Francisco",
    img: "https://images.unsplash.com/photo-1507114170131-bb61a2080351?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 700,
    avgPrice: 1100000,
  },
  {
    id: "den",
    name: "Denver",
    img: "https://images.unsplash.com/photo-1610915998182-36c138e68224?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 450,
    avgPrice: 580000,
  },
];

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal
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

// Define the props interface for clarity
interface TrendingLocationsProps {
  locations: ILocation[];
  slug: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// TrendingLocations (for Automotive Site)
// ──────────────────────────────────────────────────────────────────────────────
export default function TrendingLocations({ locations, slug }: TrendingLocationsProps) {
  // if (!locations || locations.length === 0) {
  //     return (
  //       <section className="bg-white dark:bg-gray-950 py-16 text-center text-gray-700 dark:text-gray-300">
  //         <p className="text-xl">No trending locations available at the moment. Stay tuned!</p>
  //       </section>
  //     );
  // }

  const filteredLocations = locations.length > 0 ? locations : dummyLocations;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-black py-20 sm:py-28">
      {/* Background elements for visual interest */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-sky-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
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
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 drop-shadow-lg"
            variants={itemVariants}
          >
            Explore <span className="text-blue-600 dark:text-sky-400">Popular</span> Locations
          </motion.h2>
          <motion.p
            className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Find your dream car in the most sought-after cities for vehicles.
          </motion.p>
          <motion.span
            className="block w-40 h-1.5 bg-gradient-to-r from-orange-500 to-red-600 mx-auto mt-6 rounded-full shadow-md"
            variants={itemVariants}
          />
        </motion.div>

        {/* Locations Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-6 -mb-6 auto-rows-fr"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {filteredLocations.map((loc: any) => (
            <motion.div
              key={loc.id}
              className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-4xl transition-all duration-500 group cursor-pointer
                         bg-white dark:bg-gray-800 border border-transparent hover:border-blue-500 dark:hover:border-sky-400 transform-gpu
                         focus-within:ring-4 focus-within:ring-orange-500 focus-within:ring-offset-4 focus-within:ring-offset-white dark:focus-within:ring-offset-gray-900"
              variants={itemVariants}
              whileHover={{ y: -12, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link href={`/site/${slug}/location/${loc.slug}`} passHref className="block w-full h-full">
                {/* Image Area */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={(loc as any).image || `https://source.unsplash.com/random/800x600/?${loc.name},city,cars`}
                    alt={`Scenic view of ${loc.name}`}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-700 group-hover:scale-120 group-hover:brightness-90 saturate-150"
                    loader={customLoader}
                  />
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-colors duration-500" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />

                  {/* Listings Count Badge */}
                  <span className="absolute top-4 left-4 bg-blue-600/95 text-white text-sm font-semibold uppercase px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                    <i className="fas fa-car mr-2" /> {/* Car icon */}
                    {(loc as any).vehicles || Math.floor(Math.random() * 200) + 50} Cars
                  </span>
                  {/* Trending Icon (Optional) */}
                  <span className="absolute top-4 right-4 text-orange-400 text-3xl drop-shadow-md">
                    <i className="fas fa-fire animate-pulse" />
                  </span>
                </div>

                {/* Location Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 text-white">
                  <h3 className="text-4xl font-extrabold mb-1 leading-tight drop-shadow-xl text-balance">
                    {loc.name}
                  </h3>
                  {loc.country && (
                    <p className="text-lg font-medium text-gray-200 mb-2 drop-shadow-lg">
                      <i className="fas fa-map-marker-alt mr-2" />
                      {loc.city && `${loc.city}, `}{loc.state && `${loc.state}, `}{loc.country}
                    </p>
                  )}

                  {loc.description && (
                    <p className="text-md text-gray-300 mb-3 line-clamp-2">
                      {loc.description}
                    </p>
                  )}
                  <p className="text-xl font-bold text-sky-300 drop-shadow-lg">
                    Avg. KES {(loc as any).avgPrice?.toLocaleString() || (Math.floor(Math.random() * 5000000) + 500000).toLocaleString()}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional: View All Locations Button */}
        {locations.length > 0 && (
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Link href={`/site/${slug}/locations`} passHref>
              <motion.a
                className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-xl font-semibold rounded-full shadow-xl
                               text-white bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800
                               dark:from-purple-500 dark:to-indigo-600 dark:hover:from-purple-600 dark:hover:to-indigo-700
                               focus:outline-none focus:ring-5 focus:ring-sky-400/80 transition duration-400 ease-in-out transform hover:scale-[1.05] active:scale-[0.98]"
                whileHover={{ scale: 1.06, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
                whileTap={{ scale: 0.96 }}
                aria-label="View all trending locations"
              >
                View All Destinations
                <svg className="ml-3 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}