'use client';

import React from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Example heroSlides data structure
const heroSlides = {
  main: {
    label: 'FEATURED',
    title: 'Discover Amazing Local Experiences Near You',
    img: 'https://placehold.co/1200x800/3B82F6/FFFFFF?text=Featured+Banner',
  },
  side: [
    {
      label: 'TRENDING',
      title: 'Top-Rated Restaurants & Cafes to Try Today',
      img: 'https://placehold.co/600x400/F97316/FFFFFF?text=Trending',
    },
    {
      label: 'NEW',
      title: 'Explore Recently Opened Stores & Boutiques',
      img: 'https://placehold.co/600x400/10B981/FFFFFF?text=New+Stores',
    },
  ],
};

interface HeroSectionProps {
  onSearch: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  searchTerm,
  setSearchTerm,
}) => {
  const { storeFormData } = useStoreContext() || {};
  const {
    name,
    tagline,
    bannerUrl: dynamicBannerUrl,
  } = storeFormData || {};

  const finalTitle = name || 'Find & Explore Local Businesses';
  const finalDescription =
    tagline ||
    'Discover the best services, shops, and experiences right in your neighborhood.';
  const finalBannerUrl =
    dynamicBannerUrl || heroSlides.main.img;

  return (
    <section className="relative w-full bg-gradient-to-br from-green-700 to-teal-600 text-white overflow-hidden">
      {/* === Grid Layout === */}
      <div className="container mx-auto px-6 py-12 grid gap-6 md:grid-cols-3 md:grid-rows-2 items-stretch">
        {/* Main Feature Card */}
        <motion.div
          className="relative md:col-span-2 md:row-span-2 rounded-3xl overflow-hidden shadow-2xl h-[60vh] md:h-[70vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Image decoding="async"
            src={finalBannerUrl}
            alt={finalTitle}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-10 left-10 right-10 text-white space-y-4">
            <span className="bg-orange-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
              {heroSlides.main.label}
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
              {finalTitle} <span className="text-orange-300">Local Businesses</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl">
              {finalDescription}
            </p>

            {/* Search Form */}
            <motion.form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                onSearch();
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex w-full max-w-xl rounded-full overflow-hidden bg-white/95 backdrop-blur-md shadow-2xl border border-white/30"
            >
              <div className="flex items-center px-5 text-gray-500">
                <MagnifyingGlassIcon className="w-6 h-6" />
              </div>
              <input
                type="search"
                placeholder="Search businesses, services, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-4 text-base text-gray-800 focus:outline-none bg-transparent placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors duration-200 text-white px-8 py-4 text-base font-bold uppercase tracking-wider"
              >
                Search
              </button>
            </motion.form>
          </div>
        </motion.div>

        {/* Side Cards */}
        {heroSlides.side.map((item, idx) => (
          <motion.div
            key={idx}
            className="relative rounded-3xl overflow-hidden shadow-xl h-60 md:h-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.2 }}
          >
            <Image decoding="async"
              src={item.img}
              alt={item.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                {item.label}
              </span>
              <h3 className="text-lg font-medium leading-snug drop-shadow">
                {item.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
