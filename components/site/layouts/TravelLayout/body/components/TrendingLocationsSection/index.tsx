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


// TrendingCard.tsx
function TrendingCard({ loc }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
    >
      <Image
        src={loc.image}
        alt={loc.name}
        layout="fill"
        objectFit="cover"
        className="transform transition-transform duration-300"
        placeholder="blur"
        blurDataURL="/assets/blur-placeholder.png"
        loader={loader}
      />
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg font-semibold">{loc.name}</h3>
        <p className="text-sm">{loc.listingsCount}+ listings</p>
        <p className="text-sm">Avg. ${loc.avgPrice.toLocaleString()}</p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-medium"
      >
        View All
      </motion.div>
    </motion.div>
  );
}

// TrendingLocations.tsx
export default function TrendingLocations() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
        Trending Destinations
      </h2>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: { opacity: 1, x: 0 },
          hidden: { opacity: 0, x: -50 },
        }}
        transition={{ duration: 0.8 }}
        className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar"
      >
        {trendingLocations.map((loc) => (
          <TrendingCard key={loc.id} loc={loc} />
        ))}
      </motion.div>
    </section>
  );
}
