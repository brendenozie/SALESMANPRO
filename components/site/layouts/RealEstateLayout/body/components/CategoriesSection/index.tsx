"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Ensure Image is imported if not already
import Link from 'next/link';   // Ensure Link is imported

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal
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
  hidden: { opacity: 0, y: 40, scale: 0.9 },
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
// CategoriesSection
//──────────────────────────────────────────────────────────────────────────────
export default function CategoriesSection({ categories, slug }: any) {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Explore Properties by <span className="text-emerald-600 dark:text-teal-400">Type</span>
          <span className="block w-24 h-1 bg-amber-400 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        {/* Categories Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {categories.map((cat) => (
            <Link key={cat.id} href={`/site/${slug}/category/${cat.slug}`} passHref>
              <motion.a
                className="block relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 group
                           focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                variants={itemVariants}
                whileHover={{ scale: 1.03, zIndex: 1 }} // Slight scale up on hover, bring to front
                whileTap={{ scale: 0.98 }} // Satisfying tap effect
                aria-label={`View properties in ${cat.name} category`}
              >
                <div className="relative h-48 sm:h-56 w-full">
                  <Image
                    src={cat.imageUrl}
                    alt={`Image of a ${cat.name} property`}
                    layout="fill"
                    objectFit="cover"
                    className="transform transition-transform duration-500 group-hover:scale-115 group-hover:brightness-90"
                    loader={customLoader}
                  />
                  {/* Enhanced Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
                </div>

                {/* Category Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <span
                    className="inline-block px-5 py-2 bg-emerald-600/90 dark:bg-emerald-700/90 text-white text-lg font-semibold uppercase tracking-wide rounded-full shadow-lg
                                group-hover:bg-amber-400 group-hover:text-gray-900 group-hover:scale-105 transition-all duration-300 transform"
                  >
                    {cat.name}
                  </span>
                </div>
              </motion.a>
            </Link>
          ))}
        </motion.div>

        {/* Call to Action or More Info (Optional) */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <Link href={`/site/${slug}/categories`} passHref>
            <motion.a
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg
                         text-white bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                         dark:from-teal-600 dark:to-emerald-700 dark:hover:from-teal-700 dark:hover:to-emerald-800
                         focus:outline-none focus:ring-4 focus:ring-amber-400/70 transition duration-300 ease-in-out transform hover:scale-[1.03]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="View all property categories"
            >
              View All Categories
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path><path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}