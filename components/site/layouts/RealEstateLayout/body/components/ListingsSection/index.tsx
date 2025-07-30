"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Correct import for useRouter from next/navigation

// Placeholder Icons (ensure you have these from @heroicons/react/24/solid or similar)
import { MapPinIcon, } from '@heroicons/react/24/solid'; // Example imports
import { BeakerIcon, BoltSlashIcon } from '@heroicons/react/24/outline';

// For SquareFootIcon, you might need to create a custom one or find a suitable alternative
const SquareFootIcon = (props:any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-3.75h.008v.008H7.5v-.008Zm0 2.25h.008v.008H7.5V16.5Zm0 2.25h.008v.008H7.5V18.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a.75.75 0 0 0-1.5 0v.562a49.168 49.168 0 0 1-3.478 1.197 50.554 50.554 0 0 0-1.5.124.75.75 0 0 0-.75.75v3.626a.75.75 0 0 0 .61.745c.386.065.779.117 1.17.155L12 12l2.695-1.84c.39-.038.783-.09 1.17-.155a.75.75 0 0 0 .61-.745V4.877a.75.75 0 0 0-.75-.75 2.25 2.25 0 0 0-.124-1.5 50.554 50.554 0 0 0-1.197-3.478V2.25Zm-4.25 10.25a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Zm8.5 0a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Z" />
  </svg>
);


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
// ListingsSection
//──────────────────────────────────────────────────────────────────────────────
export default function ListingsSection({ products, slug }: any) {
  const router = useRouter();

  // Handle empty products array gracefully
  if (!products || products.length === 0) {
    return (
      <section className="bg-gradient-to-t from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl">No listings found at the moment. Please check back later!</p>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-t from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          All Available <span className="text-amber-500 dark:text-amber-400">Listings</span>
          <span className="block w-24 h-1 bg-emerald-600 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        {/* Listings Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {products.map((prop:any) => (
            <Link key={prop.id} href={`/site/${slug}/property/${prop.id}`} passHref>
              <motion.a
                className="block bg-white dark:bg-gray-850 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }} // Lift and slightly scale on hover
                whileTap={{ scale: 0.98 }} // Satisfying tap effect
                aria-label={`View details for ${prop.name}`}
              >
                {/* Image Area */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={prop.imageUrl || `https://placehold.co/100x100/E0F2F7/0288D1?text=CH}`}
                    alt={`Image of ${prop.name}`}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-500 group-hover:scale-115 group-hover:brightness-90"
                    loader={customLoader}
                  />
                  {/* Image Overlays */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Price Tag on Image */}
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-50 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg font-bold text-lg">
                    KES {prop.finalPrice.toLocaleString()}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 truncate">
                    {prop.name}
                  </h3>
                  {prop.location && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-1 text-emerald-500" /> {prop.location}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center space-x-4">
                    {prop.beds && <span className="flex items-center"><BeakerIcon className="w-4 h-4 mr-1 text-emerald-500" /> {prop.beds} Beds</span>}
                    {prop.baths && <span className="flex items-center"><BoltSlashIcon className="w-4 h-4 mr-1 text-emerald-500" /> {prop.baths} Baths</span>}
                    {prop.sqft && <span className="flex items-center"><SquareFootIcon className="w-4 h-4 mr-1 text-emerald-500" /> {prop.sqft.toLocaleString()} sqft</span>}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                    {prop.description || "A beautiful property offering comfort and convenience."}
                  </p>

                  {/* Call to Action Button */}
                  <motion.button
                    type="button"
                    className="mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white
                               bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600
                               dark:from-teal-700 dark:to-emerald-800 dark:hover:from-teal-800 dark:hover:to-emerald-900
                               shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/70
                               transition duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99]"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={(e:any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/site/${slug}/property/${prop.id}`);
                    }}
                    aria-label={`Learn more about ${prop.name}`}
                  >
                    View Details
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                  </motion.button>
                </div>
              </motion.a>
            </Link>
          ))}
        </motion.div>

        {/* Optional: Pagination or Load More button can go here if needed */}
      </div>
    </section>
  );
}