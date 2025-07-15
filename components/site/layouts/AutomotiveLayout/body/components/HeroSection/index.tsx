"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image"; // Make sure Image component is imported
import {
  MapPinIcon, // For location input
  CurrencyDollarIcon, // For price range
   // For vehicle type (Assuming a similar icon exists or can be custom)
  MagnifyingGlassIcon, // For search button
} from "@heroicons/react/24/outline"; // Import relevant icons

import Link from "next/link";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0, y: 30 }, // Increased y for more noticeable entrance
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1, // Slightly slower stagger for more impact
      delayChildren: 0.2, // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 }, // Increased y and slightly smaller scale
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, // Softer spring
      damping: 15, // More damping for a smoother stop
    },
  },
};

// Dummy Data for Vehicle Types (Expanded)
const vehicleTypes = [
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
  "Hatchback",
  "Convertible",
  "Minivan",
  "Electric",
];

// Dummy data for banner images (example)
const heroBanners = [
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1542362543-b2611e9f16d7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Luxury sports car",
  },
  {
    type: "image",
    src: "https://images.unsplash.com/photo-1599388909403-9e9f902d28f8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Modern SUV in an urban setting",
  },
  {
    type: "video",
    src: "/assets/hero-video.mp4", // Ensure this path is correct and video exists
    alt: "Car driving through scenic route",
  },
];

// Enhanced HeroSection Component
interface HeroSectionProps {
  // You might not need bannerUrl if using an internal carousel
  // If still external, define it as string[]
}

export default function HeroSection({}: HeroSectionProps) {
  const [isBuy, setIsBuy] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Auto-advance banner
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex(
        (prevIndex) => (prevIndex + 1) % heroBanners.length
      );
    }, 8000); // Change banner every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const currentBanner = heroBanners[currentBannerIndex];

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Image/Video */}
      <AnimatePresence mode="wait">
        {currentBanner.type === "image" ? (
          <motion.div
            key={currentBanner.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 left-0 w-full h-full"
          >
            <Image
              src={currentBanner.src}
              alt={currentBanner.alt}
              fill
              className="object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-1000 ease-in-out" // Subtle zoom effect
              loader={customLoader}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw"
              priority // Prioritize loading for hero section
            />
          </motion.div>
        ) : (
          <motion.video
            key={currentBanner.src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 left-0 w-full h-full object-cover"
            src={currentBanner.src}
            autoPlay
            muted
            loop
            playsInline
          />
        )}
      </AnimatePresence>

      {/* Dark Overlay with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      {/* <div className="absolute inset-0 bg-black bg-opacity-60" /> */} {/* Simpler dark overlay */}

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 text-center px-4 max-w-7xl mx-auto"
      >
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg"
        >
          {isBuy ? "Your Dream Ride Awaits" : "Effortless Car Rentals"}
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md"
        >
          Explore a vast selection of vehicles for every journey and budget.
        </motion.p>

        {/* Search Bar - Re-imagined */}
        <motion.form
          variants={itemVariants}
          className="bg-white bg-opacity-95 rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-3xl transform hover:scale-[1.01] transition-transform duration-300 ease-in-out"
        >
          {/* Buy/Rent Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-full overflow-hidden mb-4 lg:mb-0">
            <button
              type="button"
              onClick={() => setIsBuy(true)}
              className={`px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 ${
                isBuy
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-white"
              }`}
              aria-pressed={isBuy}
            >
              Buy a Car
            </button>
            <button
              type="button"
              onClick={() => setIsBuy(false)}
              className={`px-6 py-3 rounded-full text-base font-semibold transition-all duration-300 ${
                !isBuy
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-white"
              }`}
              aria-pressed={!isBuy}
            >
              Rent a Car
            </button>
          </div>

          {/* Search Inputs Group */}
          <div className="flex flex-1 flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Location Input */}
            <div className="relative flex-1">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="City, ZIP, or Address"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                aria-label="Location search input"
              />
            </div>

            {/* Vehicle Type Dropdown */}
            <div className="relative flex-1">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none bg-white transition-colors"
                aria-label="Vehicle type selection"
              >
                <option value="">All Types</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {/* Custom arrow for select dropdown */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z" />
                </svg>
              </div>
            </div>

            {/* Price Range Placeholder (Consider a custom slider component for real implementation) */}
            <div className="relative flex-1">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Price Range (e.g., $10K - $50K)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                aria-label="Price range input"
                readOnly // Make it read-only if a custom range picker is used
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="w-full lg:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 transform active:scale-95 shadow-lg"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
            Search Cars
          </button>
        </motion.form>

        {/* Optional: Quick Links / Trending Searches */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-gray-300 text-sm flex flex-wrap justify-center gap-x-6 gap-y-2"
        >
          <span>Popular Searches:</span>
          <Link href="/search?type=suv" className="hover:text-white transition-colors">
            SUVs
          </Link>
          <Link href="/search?type=electric" className="hover:text-white transition-colors">
            Electric Cars
          </Link>
          <Link href="/search?price=luxury" className="hover:text-white transition-colors">
            Luxury Sedans
          </Link>
          <Link href="/sell-car" className="text-blue-300 hover:text-blue-100 transition-colors font-medium">
            Sell Your Car →
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}