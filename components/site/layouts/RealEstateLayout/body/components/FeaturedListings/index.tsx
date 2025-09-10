"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link'; // Import Link for proper navigation
import { MarketListingForm } from '@/types/typings';

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
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

//──────────────────────────────────────────────────────────────────────────────
// FeaturedListings
//──────────────────────────────────────────────────────────────────────────────
export default function FeaturedListings({ listings, slug }: any) {
  // Ensure listings is an array and not empty
  if (!listings || listings.length === 0) {
    return (
      <section className="bg-gray-50 dark:bg-gray-950 py-16 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl">No featured listings available at the moment. Please check back soon!</p>
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
          Exclusive <span className="text-amber-500 dark:text-amber-400">Featured</span> Listings
          <span className="block w-32 h-1 bg-emerald-600 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        {/* Listings Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {listings.map((item:MarketListingForm) => (
            <Link key={item.id} href={`/site/${slug}/property/${item.id}`} passHref>
              <motion.a
                className="block bg-white dark:bg-gray-850 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }} // Lift and slightly scale on hover
                whileTap={{ scale: 0.98 }} // Satisfying tap effect
                aria-label={`View details for property at ${"item.location.name"}`}
              >
                {/* Image Area */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={item.images?.[0] || `https://placehold.co/100x100/E0F2F7/0288D1?text=CH}`}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-500 group-hover:scale-115 group-hover:brightness-90"
                    loader={customLoader}
                  />
                  {/* Image Overlays */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* {item.badge && (
                    <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md">
                      {item.badge}
                    </span>
                  )} */}
                  {/* Price Tag on Image */}
                  <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-50 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg font-bold text-lg">
                    KES {item.finalPrice?.toLocaleString()}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 truncate">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center space-x-4">
                    <span className="flex items-center"><BedIcon className="w-4 h-4 mr-1 text-emerald-500" /> {item.bedrooms?.length} Beds</span>
                    <span className="flex items-center"><BathIcon className="w-4 h-4 mr-1 text-emerald-500" /> {item.bathrooms} Baths</span>
                    <span className="flex items-center"><SquareFootIcon className="w-4 h-4 mr-1 text-emerald-500" /> {"item.area.toLocaleString()"} sqft</span>
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                    {item.description || "A beautiful property offering comfort and convenience."}
                  </p>

                  {/* Call to Action Button */}
                  <motion.button
                    type="button" // Use type="button" for general buttons
                    className="mt-4 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white
                               bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600
                               dark:from-teal-700 dark:to-emerald-800 dark:hover:from-teal-800 dark:hover:to-emerald-900
                               shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/70
                               transition duration-300 ease-in-out transform hover:scale-[1.01] active:scale-[0.99]"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={(e:any) => {
                      e.preventDefault(); // Prevent default link behavior if inside a Link component
                      e.stopPropagation(); // Stop event propagation to parent link
                      window.location.href = `/site/${slug}/property/${item.id}`;
                    }}
                    aria-label={`Learn more about ${"item.address"}`}
                  >
                    View Details
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                  </motion.button>
                </div>
              </motion.a>
            </Link>
          ))}
        </motion.div>

        {/* Optional: View All Listings Button */}
        {listings.length > 0 && (
          <motion.div
            className="text-center mt-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <Link href={`/site/${slug}/listings`} passHref>
              <motion.a
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg
                           text-white bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700
                           dark:from-orange-600 dark:to-amber-700 dark:hover:from-orange-700 dark:hover:to-amber-800
                           focus:outline-none focus:ring-4 focus:ring-emerald-400/70 transition duration-300 ease-in-out transform hover:scale-[1.03]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="View all available property listings"
              >
                View All Listings
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
              </motion.a>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

// Placeholder Icons (replace with actual Heroicons imports if available)
const BedIcon = (props:any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.154.218-2.266.608-3.302A8.96 8.96 0 0 1 12 3.75c3.046 0 5.892 1.144 8.042 3.098A9 9 0 0 1 21.75 12h-2.25a6.75 6.75 0 0 0-13.5 0H2.25ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM21 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const BathIcon = (props:any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75h1.838zM17.864 12.35L14.004 15.2h6.299c.552 0 1.082-.149 1.55-.432a3.75 3.75 0 0 0-1.077-4.702M1.082 14.542A3.75 3.75 0 0 1 3.51 12.02l4.851-3.784a2.25 2.25 0 0 1 2.924-.764 2.25 2.25 0 0 1 .764 2.924l-3.784 4.851H1.082z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 12h.008v.008h-.008V12z" />
  </svg>
);

const SquareFootIcon = (props:any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-3.75h.008v.008H7.5v-.008Zm0 2.25h.008v.008H7.5V16.5Zm0 2.25h.008v.008H7.5V18.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a.75.75 0 0 0-1.5 0v.562a49.168 49.168 0 0 1-3.478 1.197 50.554 50.554 0 0 0-1.5.124.75.75 0 0 0-.75.75v3.626a.75.75 0 0 0 .61.745c.386.065.779.117 1.17.155L12 12l2.695-1.84c.39-.038.783-.09 1.17-.155a.75.75 0 0 0 .61-.745V4.877a.75.75 0 0 0-.75-.75 2.25 2.25 0 0 0-.124-1.5 50.554 50.554 0 0 0-1.197-3.478V2.25Zm-4.25 10.25a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Zm8.5 0a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Z" />
  </svg>
);