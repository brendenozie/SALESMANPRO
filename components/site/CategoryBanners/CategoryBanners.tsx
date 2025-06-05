// File: components/site/CategoryBanners/CategoryBanners.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function CategoryBanners() {
  const { storeFormData } = useStoreContext();
  const { storeCategories = [], slug = '', themeSettings = {} } = storeFormData || {};

  // Brand colors (with fallbacks)
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  // Framer Motion variants for staggered children
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
    <section className="py-16 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Explore Categories</h2>

        {/* Grid Container */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {storeCategories.map((cat: any, idx: number) => {
            // Fallback image if icon/image is missing
            const imgSrc = cat.icon ?? cat.imageUrl ?? '/images/category-placeholder.jpg';
            return (
              <motion.div
                key={cat.id}
                variants={cardVariants}
                className="group relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-md hover:shadow-xl focus-within:shadow-xl transition-shadow"
              >
                <Link
                  href={`/${slug}/products?category=${cat.id}`}
                  className="absolute inset-0 z-20 focus:outline-none focus:ring-4 rounded-2xl"
                  style={{ outlineColor: secondary }}
                >
                  {/* Invisible anchor to make the whole card clickable */}
                  <span className="sr-only">View {cat.name} products</span>
                </Link>

                {/* Background Image + Overlay */}
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="relative w-full h-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 4, ease: 'linear' }}
                  >
                    <Image
                      src={imgSrc}
                      alt={cat.name}
                      fill
                      className="object-cover w-full h-full"
                      loader={loader}
                      priority={idx < 4} // priority load first 4
                    />
                  </motion.div>

                  {/* Gradient overlay: changes opacity on hover */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 group-hover:opacity-80"
                  />
                </div>

                {/* Centered Text + Arrow */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4">
                  <motion.h3
                    className="text-xl sm:text-2xl font-semibold text-white text-center leading-tight"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {cat.name}
                  </motion.h3>
                  <motion.div
                    className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ opacity: 0, y: 4 }}
                    whileHover={{ y: -2, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRightIcon className="h-6 w-6 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
