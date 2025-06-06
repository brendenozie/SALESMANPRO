'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';

interface Category {
  id: string;
  name: string;
  icon?: string; // text‐based icon, e.g. an emoji or font character
}

export default function CategoryBanners() {
  const { storeFormData } = useStoreContext();
  const { storeCategories = [], slug = '', themeSettings = {} } = storeFormData || {};

  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <Section title="Explore Categories">
      <div className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            {storeCategories.map((cat: Category, idx: number) => (
              <motion.div
                key={cat.id}
                variants={cardVariants}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
              >
                <Link
                  href={`/${slug}/products?category=${cat.id}`}
                  className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-4"
                  style={{ outlineColor: secondary }}
                >
                  <span className="sr-only">View {cat.name} products</span>
                </Link>

                {/* Icon Circle */}
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                  }}
                >
                  <span className="text-2xl md:text-3xl text-white">{cat.icon || '❓'}</span>
                </div>

                {/* Category Name */}
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {cat.name}
                </h3>

                {/* Arrow on Hover */}
                <motion.div
                  className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1 text-primary"
                  initial={{ opacity: 0, y: 4 }}
                  whileHover={{ y: -2, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-200">
                    Browse
                  </span>
                  <ArrowRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
