'use client';

import React from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';


// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Floating category icons with adjusted styles for more visual appeal
const floatingIcons = [
  { name: 'Restaurants', icon: '🍽️', top: '15%', left: '10%', size: 'text-3xl' },
  { name: 'Healthcare', icon: '🩺', top: '25%', right: '8%', size: 'text-4xl' },
  { name: 'Shopping', icon: '🛍️', bottom: '20%', left: '15%', size: 'text-3xl' },
  { name: 'Services', icon: '🧰', bottom: '12%', right: '10%', size: 'text-4xl' },
  { name: 'Education', icon: '📚', top: '35%', left: '40%', size: 'text-3xl' },
  { name: 'Automotive', icon: '🚗', top: '55%', right: '15%', size: 'text-3xl' }, // Added one more for variety
];

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
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const {
    name, // This will be the main title
    tagline, // This will be the description
    bannerUrl: dynamicBannerUrl, // Renamed to avoid conflict with old prop name
  } = storeFormData || {};

  // Use dynamic data with fallbacks
  const finalTitle = name || 'Find & Explore Local Businesses';
  const finalDescription = tagline || 'Discover the best services, shops, and experiences right in your neighborhood.';
  const finalBannerUrl = dynamicBannerUrl || 'https://placehold.co/1920x1080/3498DB/FFFFFF?text=Directory+Hero+Fallback'; // A different placeholder for default

  return (
    <section className="relative h-[85vh] sm:h-[90vh] lg:h-screen bg-gradient-to-br from-green-700 to-teal-600 text-white flex items-center justify-center overflow-hidden">
      {/* Background Image with a subtle parallax effect */}
      {finalBannerUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={finalBannerUrl}
            alt="Directory Banner"
            fill
            className="object-cover object-center opacity-30 md:opacity-40" // Slightly more opaque
            priority
            loader={loader}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
            style={{ transform: 'translateZ(0)' }} // Helps with certain browser rendering
          />
          <div className="absolute inset-0 bg-black/40" /> {/* Darker overlay for better text contrast */}
        </div>
      )}
      {!finalBannerUrl && (
        <div className="absolute inset-0 bg-black/40 z-0" /> // Ensure overlay even without banner
      )}

      {/* Floating icons - adjusted for better visual flow and size variety */}
      {floatingIcons.map((cat, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${cat.size} drop-shadow-lg text-white/70`} // Softer shadow, slightly transparent icons
          style={{ ...cat }}
          animate={{
            y: [0, -15, 0], // More pronounced float
            rotate: [0, (idx % 2 === 0 ? 3 : -3), 0], // Subtle rotation
          }}
          transition={{
            duration: 4 + idx * 0.5, // Varied durations for natural look
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'reverse',
          }}
        >
          <span role="img" aria-label={cat.name}>{cat.icon}</span>
        </motion.div>
      ))}

      {/* Main Content - centered and prominent */}
      <div className="relative z-20 text-center px-6 md:px-10 max-w-4xl">
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-xl" // Larger, tighter tracking, stronger shadow
        >
          {finalTitle} <span className="text-orange-300">Local Businesses</span>
        </motion.h1>

        {finalDescription && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
            className="mt-5 text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto" // Larger, slightly softer text
          >
            {finalDescription}
          </motion.p>
        )}

        {/* Search Input - more prominent and user-friendly */}
        <motion.form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            onSearch();
          }}
          initial={{ scale: 0.9, opacity: 0 }} // Slightly smaller initial scale
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
          role="search"
          aria-label="Search local businesses or categories"
          className="mt-10 flex w-full max-w-xl lg:max-w-2xl mx-auto rounded-full overflow-hidden bg-white/95 backdrop-blur-md shadow-2xl border border-white/30" // Stronger shadow, subtle border
        >
          <div className="flex items-center px-5 text-gray-500">
            <MagnifyingGlassIcon className="w-6 h-6" /> {/* Larger icon */}
          </div>
          <input
            type="search"
            placeholder="Search businesses, services, or categories..." // More specific placeholder
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-4 text-base text-gray-800 focus:outline-none bg-transparent placeholder-gray-400" // Larger input, better placeholder color
            aria-label="Search term input"
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition-colors duration-200 text-white px-8 py-4 text-base font-bold uppercase tracking-wider" // Larger, bolder button with active state
            aria-label="Initiate search"
          >
            Search
          </button>
        </motion.form>
      </div>
    </section>
  );
};

export default HeroSection;
