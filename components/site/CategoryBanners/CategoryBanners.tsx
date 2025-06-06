'use client';

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '../../../contexts/StoreContext';
import Section from '../Section/Section';

interface Category {
  id: string;
  name: string;
  icon?: string; // emoji or simple icon
}

export default function CategoryBanners() {
  const { storeFormData } = useStoreContext();
  const { storeCategories = [], slug = '', themeSettings = {} } = storeFormData || {};

  const primary = themeSettings.primaryColor || '#10B981';
  const secondary = themeSettings.secondaryColor || '#3B82F6';

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <Section title="Explore Categories">
      <div className="py-12 bg-gray-50">
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
                className="
                  relative
                  bg-white/70 backdrop-blur-sm ring-1 ring-gray-200
                  rounded-3xl shadow-md
                  hover:shadow-xl hover:scale-105
                  transition-all duration-300
                  flex flex-col items-center text-center
                  py-10 px-6
                "
              >
                {/* Clickable overlay */}
                <Link
                  href={`/${slug}/products?category=${cat.id}`}
                  className="absolute inset-0 rounded-3xl focus:outline-none focus:ring-4 z-10"
                  style={{ outlineColor: secondary }}
                >
                  <span className="sr-only">Browse {cat.name}</span>
                </Link>

                {/* Icon in gradient circle */}
                <div
                  className="
                    w-20 h-20
                    rounded-full
                    flex items-center justify-center
                    mb-4
                  "
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  <span className="text-3xl text-white">{cat.icon || '❓'}</span>
                </div>

                {/* Category Name */}
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{cat.name}</h3>

                {/* Hover CTA Button */}
                <motion.div
                  className="mt-auto"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/${slug}/products?category=${cat.id}`} 
                      className="
                        inline-flex items-center space-x-2
                        px-4 py-2
                        bg-gradient-to-br from-[rgba(16,185,129,0.2)] to-[rgba(59,130,246,0.2)]
                        hover:from-[rgba(16,185,129,0.4)] hover:to-[rgba(59,130,246,0.4)]
                        text-gray-800 font-medium
                        rounded-full
                        transition-colors duration-300
                      "
                    >
                      <span>Browse</span>
                      <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

import { ArrowRightIcon } from '@heroicons/react/24/outline';
