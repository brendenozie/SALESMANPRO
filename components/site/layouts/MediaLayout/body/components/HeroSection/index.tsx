"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, InformationCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid'; // Changed icons for media focus
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MediaHeroProps {
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

/**
 * Hero Section for Media and Entertainment Website
 * Displays featured content with a captivating visual and clear calls to action.
 */
export default function MediaHeroSection({ store, onPlay }: any) { // Removed 'loader' as Next.js Image handles it
  const router = useRouter();
  const slide = (store.heroSlides && store.heroSlides[0]) || {};

  const handlePlayClick = () => {
    if (slide.videoSlug) {
      onPlay(slide); // Assuming onPlay handles playing the video/trailer
    } else {
      // Fallback or navigate to a details page if no video slug
      router.push(`/media/${slide.slug}`);
    }
  };

  const handleMoreInfoClick = () => {
    router.push(`/media/${slide.slug}`); // Navigate to the details page for more info
  };

  return (
    <section
      className="relative h-screen w-full bg-black text-white flex items-center justify-center overflow-hidden"
      role="region"
      aria-label="Featured Media Content"
    >
      {/* Background Image/Video Placeholder */}
      {slide.imageUrl && (
        <Image
          src={slide.imageUrl}
          alt={slide.headline || "Featured Media"}
          loader={loader}
          fill
          className="absolute inset-0 object-cover object-center w-full h-full brightness-[.4] transition-transform duration-500 ease-in-out hover:scale-105" // Added hover effect
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
      )}

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>

      {/* Content Overlay */}
      <motion.div
        className="relative z-10 text-center px-6 md:px-12 max-w-5xl space-y-6 flex flex-col items-center" // Centered items
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {slide.genre && ( // Added genre tag
          <motion.span
            className="text-sm md:text-base font-medium bg-red-700 text-white px-3 py-1 rounded-full mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {slide.genre}
          </motion.span>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-lg leading-tight"> {/* Enhanced drop-shadow */}
          {slide.headline || "Discover Your Next Favorite"}
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-white/90 leading-relaxed max-w-2xl">
          {slide.subline || "Immerse yourself in a world of captivating stories, breathtaking visuals, and unforgettable experiences."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {slide.videoSlug && ( // Only show Play button if video exists
            <motion.button
              onClick={handlePlayClick}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(239, 68, 68, 0.6)" }} // More prominent hover effect
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 text-lg"
              aria-label="Play Trailer"
            >
              <PlayCircleIcon className="h-7 w-7" />
              Play Trailer
            </motion.button>
          )}

          <motion.button
            onClick={handleMoreInfoClick}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(255, 255, 255, 0.2)" }} // Subtle hover for secondary button
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-8 rounded-full border border-white/30 shadow-md transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/50 text-lg"
            aria-label="More Information"
          >
            <InformationCircleIcon className="h-7 w-7" />
            More Info
          </motion.button>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 flex flex-col items-center space-y-2 cursor-pointer group" // Added group for hover effects
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })} // Smooth scroll on click
      >
        <ChevronDownIcon className="h-8 w-8 text-white/80 animate-bounce group-hover:text-white group-hover:scale-110 transition-transform" />
        <span className="text-sm text-white/70 group-hover:text-white transition-colors">Scroll to Explore</span>
      </motion.div>
    </section>
  );
}