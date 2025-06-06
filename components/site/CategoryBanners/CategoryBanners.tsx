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
  icon?: string; // e.g. an emoji or simple font‐based icon
}

export default function CategoryBanners() {
  const { storeFormData } = useStoreContext();
  const { storeCategories = [], slug = '', themeSettings = {} } = storeFormData || {};

  const primary = themeSettings.primaryColor || '#10B981';
  const secondary = themeSettings.secondaryColor || '#3B82F6';

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <Section title="Explore Categories">
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Responsive grid: 1 col mobile, 2 sm, 3 md, 4 lg */}
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
                className="
                  relative 
                  bg-white/70 backdrop-blur-sm ring-1 ring-gray-200 
                  rounded-3xl shadow-md 
                  hover:shadow-xl hover:scale-105 
                  transition-all duration-300
                  flex flex-col items-center text-center px-6 py-8
                "
              >
                <Link
                  href={`/${slug}/products?category=${cat.id}`}
                  className="absolute inset-0 rounded-3xl focus:outline-none focus:ring-4 z-10"
                  style={{ outlineColor: secondary }}
                >
                  <span className="sr-only">Browse {cat.name}</span>
                </Link>

                {/* Icon Circle */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="
                    mb-4
                    w-20 h-20 
                    rounded-full 
                    flex items-center justify-center 
                    bg-gradient-to-br 
                  "
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  <span className="text-3xl text-white">{cat.icon || '❓'}</span>
                </motion.div>

                {/* Category Name */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {cat.name}
                </h3>

                {/* Hover Arrow */}
                <motion.div
                  className="mt-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 text-gray-600"
                  initial={{ opacity: 0, y: 4 }}
                  whileHover={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-sm font-medium">Browse</span>
                  <ArrowRightIcon className="h-5 w-5 text-gray-600" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
