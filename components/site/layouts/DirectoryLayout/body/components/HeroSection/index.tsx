'use client';

import React from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Floating category icons
const floatingIcons = [
  { name: 'Restaurants', icon: '🍽️', top: '10%', left: '15%' },
  { name: 'Healthcare', icon: '🩺', top: '20%', right: '10%' },
  { name: 'Shopping', icon: '🛍️', bottom: '15%', left: '12%' },
  { name: 'Services', icon: '🧰', bottom: '10%', right: '14%' },
  { name: 'Education', icon: '📚', top: '30%', left: '45%' },
];

interface HeroSectionProps {
  title: string;
  description?: string;
  bannerUrl?: string;
  onSearch: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  description,
  bannerUrl,
  onSearch,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <section className="relative h-[85vh] bg-gradient-to-br from-green-600 to-teal-500 text-white flex items-center justify-center overflow-hidden">
      {/* Background image */}
      {bannerUrl && (
        <Image
          src={bannerUrl}
          alt="Directory Banner"
          fill
          className="object-cover opacity-40"
          priority
          loader={loader}
        />
      )}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Floating icons */}
      {floatingIcons.map((cat, idx) => (
        <motion.div
          key={idx}
          className="absolute text-2xl md:text-3xl drop-shadow-md"
          style={{ ...cat }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3 + idx, repeat: Infinity }}
        >
          <span role="img" aria-label={cat.name}>{cat.icon}</span>
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-md"
        >
          Find & Explore <span className="text-orange-400">{title}</span>
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-lg md:text-xl text-white/90"
          >
            {description}
          </motion.p>
        )}

        {/* Search Input */}
        <motion.form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            onSearch();
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          role="search"
          aria-label="Business or Category Search"
          className="mt-8 flex w-full max-w-xl mx-auto rounded-full overflow-hidden bg-white/90 backdrop-blur-sm shadow-lg"
        >
          <div className="flex items-center px-4 text-gray-500">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </div>
          <input
            type="search"
            placeholder="Search businesses or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-3 text-sm text-gray-800 focus:outline-none bg-transparent"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 transition-colors text-white px-6 py-3 text-sm font-semibold"
          >
            Search
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default HeroSection;
