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


 // ListingCard.tsx
function ListingCard({ listing }: any) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0px 15px 25px rgba(0,0,0,0.15)" }}
      transition={{ type: "spring", stiffness: 300 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="relative h-48 w-full">
        <Image
          src={listing.thumbnail}
          alt={listing.title}
          layout="fill"
          objectFit="cover"
          className="transform hover:scale-105 transition duration-300"
          placeholder="blur"
          blurDataURL="/assets/blur-placeholder.png"
          loader={loader}
        />
        {listing.badge && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-sm font-semibold rounded-full ${
              listing.badge === "New"
                ? "bg-green-500 text-white"
                : listing.badge === "Hot"
                ? "bg-red-500 text-white"
                : "bg-yellow-400 text-gray-900"
            }`}
          >
            {listing.badge}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{listing.title}</h3>
        <p className="text-indigo-600 font-semibold mb-4">
          ${listing.price.toLocaleString()}
        </p>
        <div className="flex text-gray-600 text-sm space-x-4 mb-4">
          <span>{listing.beds} beds</span>
          <span>{listing.baths} baths</span>
          <span>{listing.area} sq ft</span>
        </div>
        <button className="w-full bg-indigo-600 text-white py-2 rounded-xl font-medium hover:bg-indigo-700 transition">
          View Details
        </button>
      </div>
    </motion.div>
  );
}

// Listings.tsx
export default function Listings() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800 text-center">
        Featured Trips & Tours
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}