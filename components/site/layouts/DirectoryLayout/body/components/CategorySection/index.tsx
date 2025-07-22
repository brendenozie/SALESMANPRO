'use client';

import React from 'react';
import Link from 'next/link'; // Import Link for navigation
import { motion } from 'framer-motion'; // Import motion for animations
import {
  PencilIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon, // Added a more generic "Business" icon
  HeartIcon, // Can represent "Health & Wellness"
} from '@heroicons/react/24/outline';

// Extended categories with dummy job counts (changed to listings count for directory)
// Added a slug for better routing and a more diverse set of categories for a directory
const categories = [
  { name: 'Design & Creative', Icon: PencilIcon, count: '1,200+ listings', slug: 'design-creative' },
  { name: 'Analytics & Data', Icon: ChartBarIcon, count: '850+ listings', slug: 'analytics-data' },
  { name: 'Trades & Services', Icon: BoltIcon, count: '1,500+ listings', slug: 'trades-services' },
  { name: 'Finance & Consulting', Icon: CurrencyDollarIcon, count: '980+ listings', slug: 'finance-consulting' },
  { name: 'Software & IT', Icon: CodeBracketIcon, count: '2,100+ listings', slug: 'software-it' },
  { name: 'Engineering & Tech', Icon: Cog6ToothIcon, count: '1,300+ listings', slug: 'engineering-tech' },
  { name: 'Marketing & Sales', Icon: MegaphoneIcon, count: '1,100+ listings', slug: 'marketing-sales' },
  { name: 'Education & Training', Icon: ComputerDesktopIcon, count: '750+ listings', slug: 'education-training' },
  { name: 'Real Estate', Icon: BuildingOffice2Icon, count: '600+ listings', slug: 'real-estate' }, // New category
  { name: 'Health & Wellness', Icon: HeartIcon, count: '900+ listings', slug: 'health-wellness' }, // New category
];

export default function CategoryGridSection() { // Renamed for clarity
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.section
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-900"
      initial="hidden"
      whileInView="visible" // Animate when section comes into view
      viewport={{ once: true, amount: 0.3 }} // Only animate once, when 30% of section is visible
      variants={sectionVariants}
    >
      {/* Section Header */}
      <div className="text-center mb-14"> {/* Increased bottom margin for more breathing room */}
        <motion.h2
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight"
          variants={itemVariants}
        >
          Explore by <span className="text-blue-600 dark:text-blue-400">Top Categories</span> 🚀
        </motion.h2>
        <motion.p
          className="mt-4 text-gray-600 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Dive into our diverse range of listings. Find exactly what you're looking for by industry or service type.
        </motion.p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"> {/* Adjusted grid for more flexibility */}
        {categories.map(({ name, Icon, count, slug }) => (
          <motion.div
            key={name}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden" // Enhanced card styling
            variants={itemVariants}
            whileHover={{ scale: 1.03 }} // Subtle scale up on hover
            whileTap={{ scale: 0.98 }} // Slight squash on tap
          >
            {/* Background Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

            <Link href={`/site/your-slug/category/${slug}`} className="relative z-10 block"> {/* Link wrapper */}
              <div className="flex items-center space-x-5"> {/* Increased space-x */}
                <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/40 p-4 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-all duration-300 shadow-inner"> {/* Larger padding, subtle shadow, dynamic background */}
                  <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" /> {/* Larger icon, dynamic color */}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{name}</h3> {/* Bolder, larger title, dynamic color */}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">{count}</p> {/* Clearer count */}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Optional: Call to Action for more categories */}
      <div className="mt-16 text-center">
        <motion.button
          className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-full shadow-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          whileHover={{ scale: 1.05, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.2)" }}
          whileTap={{ scale: 0.95 }}
        >
          View All Categories
          <svg className="ml-2 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </motion.button>
      </div>
    </motion.section>
  );
}