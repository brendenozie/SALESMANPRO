'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../../../contexts/StoreContext';
import { IStoreCategory, StoreForm } from '@/types/typings';
import Image from 'next/image';
import Link from 'next/link';

export interface HeroSliderProps {
  storeFormData: StoreForm | null;
}

// Dummy data for a richer, more complete visual display when no data is available
const dummyData = {
  mainCard: {
    imageUrl: '/images/yellow-shoe.png', // Placeholder image for the large card
    headline: 'Summer Collection',
    description: 'We have a lot of trendy shoes with a wholesale price in the summer collection.',
    ctaLink: '/shop/summer',
    tags: [
      { id: 't1', name: 'COMFORT' },
      { id: 't2', name: 'STYLISH AND MODERN' },
      { id: 't3', name: 'ORIGINAL' },
    ],
  },
  secondaryImage: '/images/black-white-shoe.png', // Placeholder for the smaller image
};

export default function CategorySection({ storeFormData }: HeroSliderProps) {
  const { StoreCategory = [], themeSettings = {} } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#A855F7';
  const secondary = themeSettings?.secondaryColor || '#EC4899';

  const categoryData =
    StoreCategory.length > 0
      ? {
          mainCard: {
            imageUrl: StoreCategory[0].imageUrl || '/images/yellow-shoe.png',
            headline: StoreCategory[0].displayName || 'Featured Collection',
            description: StoreCategory[0].description || 'Discover our latest and most popular collection.',
            ctaLink: StoreCategory[0].slug || '/shop',
            tags: [
              { id: 't1', name: 'TRENDY' },
              { id: 't2', name: 'POPULAR' },
              { id: 't3', name: 'LATEST' },
            ],
          },
          secondaryImage: StoreCategory[1]?.imageUrl || '/images/black-white-shoe.png',
        }
      : dummyData;

  // Custom loader for Next.js Image component
  const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

  return (
    <section className="py-20 bg-gray-50/50 relative overflow-hidden">
      {/* Background Gradient Circle */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl z-0"
        style={{
          background: `radial-gradient(circle, ${primary} 0%, ${secondary} 100%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left Panel: Large Image & Tags */}
          <div className="w-full lg:w-3/5 relative flex flex-col items-center">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              className="relative w-full h-[450px] md:h-[600px] flex items-center justify-center -rotate-6"
            >
              <Image
                src={categoryData.mainCard.imageUrl}
                alt={categoryData.mainCard.headline}
                fill
                className="object-contain drop-shadow-2xl"
                loader={loader}
              />
            </motion.div>

            {/* Tag Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8">
              {categoryData.mainCard.tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="px-6 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700
                             bg-white/50 backdrop-blur-sm cursor-pointer hover:border-gray-400 shadow-md"
                >
                  {tag.name}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Panel: Content & Secondary Image */}
          <div className="w-full lg:w-2/5 flex flex-col md:flex-row lg:flex-col gap-8">
            {/* Top Card: Headline & Description */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden"
            >
              <span
                className="absolute top-6 right-6 text-sm font-semibold px-3 py-1.5 rounded-full text-white"
                style={{ backgroundColor: primary }}
              >
                Trendy Styles
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-8 leading-tight">
                {categoryData.mainCard.headline}
              </h2>
              <p className="mt-4 text-gray-600 max-w-sm">
                {categoryData.mainCard.description}
              </p>
            </motion.div>

            {/* Bottom Section: Secondary Image & Explore Button */}
            <div className="flex-1 flex items-end relative min-h-[250px] md:min-h-0 lg:min-h-[250px]">
              {/* Secondary Image */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute left-0 bottom-0 w-[80%] h-full flex items-end justify-start pointer-events-none z-10"
              >
                <Image
                  src={categoryData.secondaryImage}
                  alt="Secondary featured shoe"
                  width={300}
                  height={300}
                  className="object-contain drop-shadow-2xl -rotate-12"
                  loader={loader}
                />
              </motion.div>

              {/* Explore Button */}
              <Link href={categoryData.mainCard.ctaLink}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-full md:w-auto h-auto md:h-full lg:w-auto lg:h-auto rounded-xl p-6 text-center shadow-lg
                             text-white cursor-pointer transition-transform relative z-20 overflow-hidden group"
                  style={{ backgroundColor: secondary }}
                >
                  <motion.span
                    initial={{ x: 0 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-row md:flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 font-bold text-sm md:text-base lg:text-lg"
                  >
                    Explore
                    <ArrowRightCircleIcon className="h-6 w-6 transform rotate-0 transition-transform duration-300 group-hover:rotate-45" />
                  </motion.span>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}