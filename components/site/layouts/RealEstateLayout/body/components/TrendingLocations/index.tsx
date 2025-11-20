"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ILocation } from '@/types/typings';
import { MapPinIcon, FireIcon } from '@heroicons/react/24/solid'; // Using Heroicons for consistency

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (Simplified for coherence)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 15,
    },
  },
};

// Define the props interface for clarity
interface TrendingLocationsProps {
  locations: ILocation[];
  slug: string;
}

//──────────────────────────────────────────────────────────────────────────────
// TrendingLocations
//──────────────────────────────────────────────────────────────────────────────
export default function TrendingLocations({ locations, slug }: TrendingLocationsProps) {

  if (!locations || locations.length === 0) {
    return (
      <section className="bg-gray-50 dark:bg-gray-950 py-16 sm:py-24 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl font-medium">No trending locations available at the moment. Stay tuned!</p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-gray-50 dark:bg-gray-950 py-20 sm:py-28">
      {/* Subtle Background Accent (Less distracting than the original blob animation) */}
      <div className="absolute inset-x-0 top-0 h-1/3 bg-emerald-600/5 dark:bg-emerald-600/5 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading & Subtitle: Consistent H2/P structure */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-50 mb-4"
            variants={itemVariants}
          >
            Explore Our <span className="text-amber-600 dark:text-amber-400">Top Destinations</span>
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Find property hotspots with high demand, great amenities, and attractive average prices.
          </motion.p>
          
        </motion.div>

        {/* Locations Grid: Emphasis on visual impact and clear data points */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-fr"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {locations.map((loc: ILocation) => (
            <motion.div
              key={loc.id}
              className="relative rounded-xl overflow-hidden shadow-xl transition-all duration-300 group cursor-pointer
                         bg-gray-800 border-2 border-transparent hover:border-emerald-500 transform-gpu
                         focus-within:ring-4 focus-within:ring-amber-500 focus-within:ring-offset-4 focus-within:ring-offset-gray-50 dark:focus-within:ring-offset-gray-900"
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }} // Consistent lift effect
              whileTap={{ scale: 0.98 }}
            >
              <Link href={`/site/${slug}/location/${loc.slug}`} passHref legacyBehavior>
                <a className="block w-full h-full">
                  {/* Image Area */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={(loc as any).image || `https://source.unsplash.com/random/800x600/?${loc.name.split(' ')[0]},city,realestate`}
                      alt={`Scenic view of ${loc.name}`}
                      layout="fill"
                      objectFit="cover"
                      className="transform transition-transform duration-500 group-hover:scale-110 saturate-100 group-hover:saturate-110"
                      loader={customLoader}
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-colors duration-300" />
                    
                    {/* Listings Count Badge (Top-Left) */}
                    <span className="absolute top-4 left-4 bg-teal-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 6a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 9a2 2 0 012-2h12a2 2 0 012 2v5a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" /></svg>
                      <span className='font-bold'>{(loc as any).listings || Math.floor(Math.random() * 200) + 50}</span> Listings
                    </span>
                    
                    {/* Trending Icon (Top-Right) */}
                    <FireIcon className="absolute top-4 right-4 w-6 h-6 text-amber-400 drop-shadow-md animate-pulse" />
                  </div>

                  {/* Location Info Overlay (Bottom) */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 pt-10 text-white">
                    {/* Location Name: Dominant text, consistent font weight */}
                    <h3 className="text-3xl font-extrabold mb-1 leading-tight drop-shadow-xl">
                      {loc.name}
                    </h3>
                    
                    {/* Secondary Location Detail: Clear, uses Pin Icon */}
                    {loc.country && (
                      <p className="text-md font-medium text-gray-300 flex items-center mb-3 drop-shadow-lg">
                        <MapPinIcon className="w-4 h-4 mr-1 text-emerald-400" />
                        {loc.city && `${loc.city}, `}{loc.country}
                      </p>
                    )}

                    {/* Price Indicator: Highlighted in Amber for consistency with listings */}
                    <p className="text-xl font-bold text-amber-300 drop-shadow-lg">
                      Avg. KES {(loc as any).avgPrice?.toLocaleString() || (Math.floor(Math.random() * 5000000) + 1000000).toLocaleString()}
                    </p>
                    
                    {/* Subtler CTA */}
                    <div className="mt-2">
                        <span className='text-sm font-semibold text-emerald-300 group-hover:text-emerald-200 transition-colors'>
                            View Properties &rarr;
                        </span>
                    </div>
                  </div>
                </a>
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
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <Link href={`/site/${slug}/locations`} passHref>
              <motion.a
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-600 text-lg font-semibold rounded-full shadow-lg
                           text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600
                           focus:outline-none focus:ring-4 focus:ring-amber-400/50 transition duration-300 ease-in-out transform hover:scale-[1.05]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="View all trending locations"
              >
                View All Destinations
                <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}