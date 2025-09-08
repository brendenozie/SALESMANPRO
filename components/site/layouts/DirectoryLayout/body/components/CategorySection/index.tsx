'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  HeartIcon,
  QuestionMarkCircleIcon, // Generic fallback icon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { IStoreCategory } from '@/types/typings';

// Map string names to Heroicon components
const heroIconMap: Record<string, React.ElementType> = {
  PencilIcon,
  ChartBarIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  MegaphoneIcon,
  ComputerDesktopIcon,
  BuildingOffice2Icon,
  HeartIcon,
  // Add more mappings as needed
};

// Define types based on your transformCompanyToStoreForm
// export type StoreCategory = {
//   id: string; // Corresponds to categoryId
//   name: string; // Corresponds to displayName or category.name
//   icon?: string; // Can be an emoji or a Heroicon name string
//   items: any[]; // Array of items, used to derive count
//   sortOrder: number;
//   visible: boolean;
// };

export type StoreForm = {
  storeCategories?: IStoreCategory[];
  // Add other relevant StoreForm fields if needed
};

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     storeCategories: [
//       { id: 'cat1', name: 'Design & Creative', icon: 'PencilIcon', items: Array(1200).fill(null), sortOrder: 1, visible: true },
//       { id: 'cat2', name: 'Analytics & Data', icon: 'ChartBarIcon', items: Array(850).fill(null), sortOrder: 2, visible: true },
//       { id: 'cat3', name: 'Trades & Services', icon: 'BoltIcon', items: Array(1500).fill(null), sortOrder: 3, visible: true },
//       { id: 'cat4', name: 'Finance & Consulting', icon: 'CurrencyDollarIcon', items: Array(980).fill(null), sortOrder: 4, visible: true },
//       { id: 'cat5', name: 'Software & IT', icon: 'CodeBracketIcon', items: Array(2100).fill(null), sortOrder: 5, visible: true },
//       { id: 'cat6', name: 'Engineering & Tech', icon: 'Cog6ToothIcon', items: Array(1300).fill(null), sortOrder: 6, visible: true },
//       { id: 'cat7', name: 'Marketing & Sales', icon: 'MegaphoneIcon', items: Array(1100).fill(null), sortOrder: 7, visible: true },
//       { id: 'cat8', name: 'Education & Training', icon: 'ComputerDesktopIcon', items: Array(750).fill(null), sortOrder: 8, visible: true },
//       { id: 'cat9', name: 'Real Estate', icon: 'BuildingOffice2Icon', items: Array(600).fill(null), sortOrder: 9, visible: true },
//       { id: 'cat10', name: 'Health & Wellness', icon: 'HeartIcon', items: Array(900).fill(null), sortOrder: 10, visible: true },
//       { id: 'cat11', name: 'Food & Beverage', icon: '🍽️', items: Array(1800).fill(null), sortOrder: 11, visible: true }, // Example with emoji icon
//     ] as StoreCategory[],
//   } as StoreForm,
// });

// Static fallback data for categories (matches the structure we'll use for rendering)
const fallbackCategories = [
  { name: 'Design & Creative', Icon: PencilIcon, count: '1,200+ listings', slug: 'design-creative' },
  { name: 'Analytics & Data', Icon: ChartBarIcon, count: '850+ listings', slug: 'analytics-data' },
  { name: 'Trades & Services', Icon: BoltIcon, count: '1,500+ listings', slug: 'trades-services' },
  { name: 'Finance & Consulting', Icon: CurrencyDollarIcon, count: '980+ listings', slug: 'finance-consulting' },
  { name: 'Software & IT', Icon: CodeBracketIcon, count: '2,100+ listings', slug: 'software-it' },
  { name: 'Engineering & Tech', Icon: Cog6ToothIcon, count: '1,300+ listings', slug: 'engineering-tech' },
  { name: 'Marketing & Sales', Icon: MegaphoneIcon, count: '1,100+ listings', slug: 'marketing-sales' },
  { name: 'Education & Training', Icon: ComputerDesktopIcon, count: '750+ listings', slug: 'education-training' },
  { name: 'Real Estate', Icon: BuildingOffice2Icon, count: '600+ listings', slug: 'real-estate' },
  { name: 'Health & Wellness', Icon: HeartIcon, count: '900+ listings', slug: 'health-wellness' },
];

export default function CategoryGridSection() {
  // Destructure storeFormData from context
  const { storeFormData } = useStoreContext() || {};
  const { StoreCategory: dynamicCategories } = storeFormData || {};

  // Determine which categories to render: dynamic or fallback
  const categoriesToRender = Array.isArray(dynamicCategories) && dynamicCategories.length > 0
    ? dynamicCategories
        .filter(cat => cat.visible) // Only show visible categories
        .sort((a, b) => a.sortOrder - b.sortOrder) // Sort by sortOrder
        .map(cat => {
          const IconComponent = cat.icon && heroIconMap[cat.icon] ? heroIconMap[cat.icon] : QuestionMarkCircleIcon; // Resolve icon or use fallback
          const isEmoji = cat.icon && !heroIconMap[cat.icon]; // Check if it's an emoji (string but not in map)

          return {
            name: cat.displayName,
            Icon: IconComponent,
            emoji: isEmoji ? cat.icon : undefined, // Store emoji separately if it's an emoji
            count: `${(cat.subcategories?.length || 0).toLocaleString()}+ listings`, // Use items length for count
            slug: cat.displayName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, ''), // Generate slug from name
          };
        })
    : fallbackCategories; // Use static fallback categories

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
      <div className="text-center mb-14">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {categoriesToRender.map(({ name, Icon, emoji, count, slug }:any) => (
          <motion.div
            key={name}
            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

            <Link href={`/categories/${slug}`} className="relative z-10 block"> {/* Corrected link path */}
              <div className="flex items-center space-x-5">
                <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-900/40 p-4 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-all duration-300 shadow-inner">
                  {emoji ? (
                    <span className="text-3xl">{emoji}</span> // Render emoji directly
                  ) : (
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">{count}</p>
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
