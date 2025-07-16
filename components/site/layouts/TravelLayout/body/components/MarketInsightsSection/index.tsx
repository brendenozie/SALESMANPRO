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


// TrendingLocations.tsx
// VirtualTourCard.tsx
function VirtualTourCard({ tour, onOpen }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="relative flex-shrink-0 w-64 h-40 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
      onClick={() => onOpen(tour.videoUrl)}
    >
      <Image
        src={tour.thumbnail}
        alt={tour.title}
        layout="fill"
        objectFit="cover"
        className="transform hover:scale-105 transition duration-300"
        placeholder="blur"
        blurDataURL="/assets/blur-placeholder.png"
        loader={loader}
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <motion.span
          whileHover={{ scale: 1.2 }}
          className="text-white text-4xl"
          aria-label={`Play ${tour.title}`}
        >
          ▶
        </motion.span>
      </div>
      <div className="absolute bottom-3 left-3 text-white font-semibold text-sm">
        {tour.title}
      </div>
    </motion.div>
  );
}

// MarketInsights.tsx
export default function MarketInsights() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Market Insights & Travel Tips
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Average Cost Cards */}
        <motion.div
          className="grid grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.1 }}
        >
          {regionCosts.map((rc) => (
            <motion.div
              key={rc.id}
              className="flex items-center bg-white rounded-2xl p-4 shadow-sm"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="w-12 h-12 mr-4 relative">
                <Image
                  src={rc.icon}
                  alt={rc.region}
                  layout="fill"
                  loader={loader}
                  objectFit="contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{rc.region}</h3>
                <p className="text-indigo-600 font-medium">
                  Avg. ${rc.avgCost.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Blog Posts */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold mb-4">Latest Travel Tips</h3>
          <ul className="space-y-3">
            {blogPosts.map((bp) => (
              <li key={bp.id}>
                <Link href={bp.url} className="text-gray-700 hover:text-indigo-600 transition">{bp.title}
                </Link>
                <p className="text-gray-500 text-sm">
                  {new Date(bp.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Link href="/blog" className="inline-block text-indigo-600 hover:underline font-medium">
                View All Posts →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}