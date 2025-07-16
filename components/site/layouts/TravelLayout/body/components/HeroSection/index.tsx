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
// Hero.tsx
export default function Hero({ storeFormData }: { storeFormData : StoreForm}) {
  const [destination, setDestination] = useState("");
  const [travelType, setTravelType] = useState(travelTypes[0]);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Full-screen video / fallback image */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/hero-travel.mp4"
        autoPlay
        muted
        loop
      />
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold max-w-3xl"
        >
          {storeFormData.name || "Explore the World, One Journey at a Time"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-xl w-full max-w-4xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Destination */}
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Where to?"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Travel Type */}
            <select
              value={travelType}
              onChange={(e) => setTravelType(e.target.value)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {travelTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {/* Date Picker */}
            <div className="relative flex-1">
              <CalendarDaysIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-10 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Guests */}
            <div className="relative flex-1">
              <UserGroupIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="number"
                min={1}
                max={10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Guests"
              />
            </div>

            {/* Search Button */}
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 py-3 font-semibold transition">
              Search Trips
            </button>
          </div>

          {/* Secondary CTAs */}
          <div className="mt-4 flex justify-center space-x-8 text-indigo-600">
            <button className="hover:underline">Become a Host</button>
            <button className="hover:underline">Contact Travel Expert</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}