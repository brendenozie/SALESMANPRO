"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  PlayCircleIcon,
  MapPinIcon,        // Placeholder for MapPinIcon
  CurrencyDollarIcon, // Placeholder for CurrencyDollarIcon
  MagnifyingGlassIcon // Placeholder for MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import Image from "next/image";
import Link from "next/link";
// Assuming useStoreContext is correctly implemented and provides necessary state/dispatch

// Mocking the image loader since Next.js Image is not available for direct execution here
const loader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

//──────────────────────────────────────────────────────────────────────────────
// HeroSection
//──────────────────────────────────────────────────────────────────────────────
const variants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1, ease: "easeOut" } }
  },
  scaleUp: {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.7, ease: "easeOut" } }
  }
};

export default function HeroSection({
  name,
  bannerUrl,
  location,
  minPrice,
  maxPrice,
  setLocation,
  setMinPrice,
  setMaxPrice,
  handleSearch,
}) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-950">
      {/* Background Image with Enhanced Overlay */}
      <div className="absolute inset-0">
        <Image
          src={bannerUrl || "/images/realestate-hero.jpg"}
          alt="Modern house with a view, representing ideal living spaces"
          layout="fill"
          objectFit="cover"
          priority // Prioritize loading for LCP
          className="opacity-70 dark:opacity-40 filter brightness-90 saturate-120"
          aria-hidden="true"
          loader={loader}
        />
        {/* Gradients for Depth and Mood */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-emerald-800/80 dark:to-teal-950/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/20" /> {/* Subtle top dark fade */}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-5xl text-center px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight text-white drop-shadow-2xl tracking-tight"
          variants={variants.fadeInUp}
          initial="hidden"
          animate="visible"
        >
          Discover Your <span className="text-amber-300">Dream</span> Home.
        </motion.h1>

        {/* Subtitle/Description */}
        <motion.p
          className="mt-4 text-lg md:text-xl font-light text-gray-200 max-w-3xl mx-auto drop-shadow-md"
          variants={variants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Seamlessly search for properties by location and price range. Your ideal living space awaits.
        </motion.p>

        {/* Search Form */}
        <motion.form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-5 p-8 rounded-3xl shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl border border-white/20 dark:border-gray-700/50"
          variants={variants.scaleUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4, duration: 0.8 }}
          aria-label="Search properties form"
        >
          {/* Location Input */}
          <div className="relative col-span-full md:col-span-1">
            <MapPinIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Location (e.g., New York, London)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Location for property search"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-amber-400/50 focus:border-transparent transition duration-300 ease-in-out transform hover:scale-[1.01]"
            />
          </div>

          {/* Min Price Input */}
          <div className="relative col-span-full md:col-span-1">
            <CurrencyDollarIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <input
              type="number"
              placeholder="Min Price ($)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              aria-label="Minimum price for property search"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-amber-400/50 focus:border-transparent transition duration-300 ease-in-out transform hover:scale-[1.01]"
            />
          </div>

          {/* Max Price Input */}
          <div className="relative col-span-full md:col-span-1">
            <CurrencyDollarIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <input
              type="number"
              placeholder="Max Price ($)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              aria-label="Maximum price for property search"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-amber-400/50 focus:border-transparent transition duration-300 ease-in-out transform hover:scale-[1.01]"
            />
          </div>

          {/* Search Button */}
          <motion.button
            type="submit"
            className="col-span-full md:col-span-1 flex items-center justify-center space-x-3 px-6 py-3 rounded-xl font-semibold text-white
                       bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                       dark:from-teal-600 dark:to-emerald-700 dark:hover:from-teal-700 dark:hover:to-emerald-800
                       shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-400/70
                       transition duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Search property listings"
          >
            <MagnifyingGlassIcon className="w-6 h-6" aria-hidden="true" />
            <span>Search Now</span>
          </motion.button>
        </motion.form>

        {/* Optional: Explore Video/Guide Button */}
        <motion.div
          className="mt-8"
          variants={variants.fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link href="/how-it-works" passHref>
            <motion.a
              className="inline-flex items-center space-x-3 text-lg font-medium text-white hover:text-amber-300 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Watch a video guide on how to use our platform"
            >
              <PlayCircleIcon className="w-8 h-8 text-amber-400 hover:text-amber-300" aria-hidden="true" />
              <span>Watch Video Guide</span>
            </motion.a>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}