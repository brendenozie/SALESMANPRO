"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each item animates with a slight delay
      delayChildren: 0.2,   // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring", // More natural bounce
      stiffness: 100, // Less stiff
      damping: 10,    // More damping
    },
  },
};

//──────────────────────────────────────────────────────────────────────────────
// TrendingLocations
//──────────────────────────────────────────────────────────────────────────────
export default function TrendingLocations({ locations, slug }: any) {
  // Handle empty locations array gracefully
  if (!locations || locations.length === 0) {
    return (
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl">No trending locations available at the moment. Stay tuned!</p>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Explore <span className="text-emerald-600 dark:text-teal-400">Trending</span> Locations
          <span className="block w-32 h-1 bg-amber-500 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        {/* Locations Carousel/Grid */}
        <motion.div
          className="flex space-x-6 overflow-x-auto pb-6 -mb-6 snap-x snap-mandatory scroll-smooth
                     scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-emerald-100
                     dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-900"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {locations.map((loc:any) => (
            <Link key={loc.id} href={`/site/${slug}/location/${loc.id}`} passHref>
              <motion.a
                className="snap-start min-w-[280px] sm:min-w-[320px] lg:min-w-[350px] relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }} // Lift and slightly scale on hover
                whileTap={{ scale: 0.98 }} // Satisfying tap effect
                aria-label={`View properties in ${loc.name}`}
              >
                {/* Image Area */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <Image
                    src={loc.image}
                    alt={`Scenic view of ${loc.name}`}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-500 group-hover:scale-115 group-hover:brightness-90"
                    loader={customLoader}
                  />
                  {/* Image Overlays */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                  {/* Listings Count Badge */}
                  <span className="absolute top-4 left-4 bg-emerald-600/90 text-white text-sm font-bold uppercase px-4 py-2 rounded-full shadow-md">
                    {loc.listings} Listings
                  </span>
                </div>

                {/* Location Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 pt-10 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                    {loc.name}
                  </h3>
                  <p className="text-lg text-gray-200 font-medium drop-shadow-sm">
                    Avg. KES {loc.avgPrice.toLocaleString()}
                  </p>
                </div>
              </motion.a>
            </Link>
          ))}
        </motion.div>

        {/* Optional: View All Locations Button */}
        {locations.length > 0 && (
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <Link href={`/site/${slug}/locations`} passHref>
              <motion.a
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg
                           text-white bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700
                           dark:from-orange-600 dark:to-amber-700 dark:hover:from-orange-700 dark:hover:to-amber-800
                           focus:outline-none focus:ring-4 focus:ring-emerald-400/70 transition duration-300 ease-in-out transform hover:scale-[1.03]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="View all trending locations"
              >
                View All Locations
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}