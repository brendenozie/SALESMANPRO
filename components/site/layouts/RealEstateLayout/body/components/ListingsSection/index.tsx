"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Placeholder Icons (Using the provided imports/definitions)
import { MapPinIcon } from '@heroicons/react/24/solid';
// Assuming the user maps the placeholder icons:
// BeakerIcon -> BedIcon
// BoltSlashIcon -> BathIcon

// Custom Icons (Re-defined for completeness/clarity)
const BedIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.154.218-2.266.608-3.302A8.96 8.96 0 0 1 12 3.75c3.046 0 5.892 1.144 8.042 3.098A9 9 0 0 1 21.75 12h-2.25a6.75 6.75 0 0 0-13.5 0H2.25ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM21 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>);
const BathIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75h1.838zM17.864 12.35L14.004 15.2h6.299c.552 0 1.082-.149 1.55-.432a3.75 3.75 0 0 0-1.077-4.702M1.082 14.542A3.75 3.75 0 0 1 3.51 12.02l4.851-3.784a2.25 2.25 0 0 1 2.924-.764 2.25 2.25 0 0 1 .764 2.924l-3.784 4.851H1.082z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 12h.008v.008h-.008V12z" /></svg>);
const SquareFootIcon = (props: any) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-3.75h.008v.008H7.5v-.008Zm0 2.25h.008v.008H7.5V16.5Zm0 2.25h.008v.008H7.5V18.75Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25a.75.75 0 0 0-1.5 0v.562a49.168 49.168 0 0 1-3.478 1.197 50.554 50.554 0 0 0-1.5.124.75.75 0 0 0-.75.75v3.626a.75.75 0 0 0 .61.745c.386.065.779.117 1.17.155L12 12l2.695-1.84c.39-.038.783-.09 1.17-.155a.75.75 0 0 0 .61-.745V4.877a.75.75 0 0 0-.75-.75 2.25 2.25 0 0 0-.124-1.5 50.554 50.554 0 0 0-1.197-3.478V2.25Zm-4.25 10.25a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Zm8.5 0a.75.75 0 0 0-1.5 0v3.89a.75.75 0 0 0 .75.75h.75a.75.75 0 0 0 .75-.75v-3.89Z" /></svg>);


// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants (Adjusted for slightly faster response)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07, // Faster stagger
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 12,
    },
  },
};

//──────────────────────────────────────────────────────────────────────────────
// ListingsSection (Redesigned)
//──────────────────────────────────────────────────────────────────────────────
export default function ListingsSection({ products, slug }: any) {
  const router = useRouter();

  if (!products || products.length === 0) {
    return (
      <section className="bg-gray-50 dark:bg-gray-950 py-16 text-center text-gray-700 dark:text-gray-300">
        <p className="text-xl font-medium">No property listings found at the moment. Try adjusting your filters!</p>
      </section>
    );
  }

  return (
    <section id='listings' className="bg-gray-50 dark:bg-gray-950 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading: Cleaner, focuses on filtering/browsing */}
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-50 text-center mb-4 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Browse All <span className="text-emerald-600 dark:text-emerald-400">Listings</span>
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 dark:text-gray-400 text-center mb-16 max-w-xl mx-auto"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          A comprehensive view of every property currently available on the market.
        </motion.p>
        

        {/* Listings Grid: Increased columns for density and slightly reduced vertical gap */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {products.map((prop: any) => (
            <Link key={prop.id} href={`/realestate/listings/${prop.id}`} passHref legacyBehavior>
              <motion.a
                className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700
                           hover:shadow-2xl hover:border-emerald-400 transition-all duration-300 ease-in-out cursor-pointer
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                variants={itemVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                aria-label={`View details for ${prop.name}`}
              >
                {/* Image Area */}
                <div className="relative h-56 w-full"> {/* Slightly reduced height for more compact feel */}
                  <Image
                    src={prop.images?.[0] || prop.imageUrl || `https://placehold.co/600x350/059669/D1FAE5?text=Property`}
                    alt={`Image of ${prop.name}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-t-xl transform transition-transform duration-500 group-hover:scale-105"
                    loader={customLoader}
                  />
                  
                  {/* Price Tag: Moved inside content for better hierarchy */}
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    {prop.type || "SALE"} {/* Placeholder for property type */}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col justify-between flex-grow">
                  {/* Price at the top for immediate visibility */}
                  <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mb-2">
                    KES {prop.finalPrice?.toLocaleString()}
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-50 truncate mb-1">
                    {prop.name}
                  </h3>
                  
                  {/* Location/Address */}
                  {prop.location && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-3">
                      <MapPinIcon className="w-4 h-4 mr-1 text-emerald-500" />
                      {prop.location}
                    </p>
                  )}

                  {/* Key Features (Structured as a grid for alignment) */}
                  <div className="grid grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300 border-t border-b border-gray-100 dark:border-gray-700 py-3">
                    <span className="flex items-center justify-center border-r dark:border-gray-700">
                      <BedIcon className="w-4 h-4 mr-1 text-teal-500" /> <span className="font-semibold">{prop.beds || '-'}</span> Beds
                    </span>
                    <span className="flex items-center justify-center border-r dark:border-gray-700">
                      <BathIcon className="w-4 h-4 mr-1 text-teal-500" /> <span className="font-semibold">{prop.baths || '-'}</span> Baths
                    </span>
                    <span className="flex items-center justify-center">
                      <SquareFootIcon className="w-4 h-4 mr-1 text-teal-500" /> <span className="font-semibold">{prop.sqft?.toLocaleString() || '-'}</span> sqft
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 line-clamp-2 min-h-[40px]">
                    {prop.description || "A beautiful property offering comfort and convenience."}
                  </p>

                  {/* Call to Action: Subtler text link */}
                  <div className="mt-4 text-center">
                    <span className="font-medium text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-300 transition-colors">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </motion.a>
            </Link>
          ))}
        </motion.div>

        {/* Optional: Pagination or Load More button */}
        {/* Placeholder for future expansion */}
        <motion.div
          onClick={() => router.push(`/realestate/listings`)}
          className="mt-12 text-center text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer hover:underline transition duration-150 ease-in-out"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {/* Implement Pagination or Load More button here */}
            View More Listings
        </motion.div>

      </div>
    </section>
  );
}