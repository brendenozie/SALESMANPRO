"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import {
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Animation variants for staggered reveal
const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },
};

// Dummy Data for Travel Types (Expanded and more relevant)
const travelTypes = [
  "Adventure Travel",
  "Relaxation Getaway",
  "Cultural Exploration",
  "Business Trip",
  "Family Vacation",
  "Road Trip",
  "Cruise",
];



// Dummy data for banner images (example) - Not directly used in this video-focused version, but kept for reference
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

// Interface for form data (assuming it's passed from a parent component)
interface StoreForm {
  name: string;
  // Add other properties if your storeFormData has them
}

export default function Hero({ storeFormData }: { storeFormData: StoreForm }) {
  const [destination, setDestination] = useState("");
  const [travelType, setTravelType] = useState(travelTypes[0]);
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you'd handle form submission here
    console.log({ destination, travelType, date, guests });
    alert("Searching for trips! (Check console for data)");
  };

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Full-screen video background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/hero-travel.mp4"
        autoPlay
        muted
        loop
        playsInline // Important for mobile autoplay
        preload="auto"
      >
        Your browser does not support the video tag.
      </video>

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/30" />

      {/* Content Container */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Headline */}
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-lg"
          variants={itemVariants}
        >
          {storeFormData.name || "Explore the World, Create Unforgettable Memories"}
        </motion.h1>

        {/* Sub-headline/Tagline */}
        <motion.p
          className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl drop-shadow"
          variants={itemVariants}
        >
          Your next adventure awaits. Discover breathtaking destinations and plan your perfect journey with ease.
        </motion.p>

        {/* Search Form */}
        <motion.form
          className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-4xl"
          variants={itemVariants}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Destination Input */}
            <div className="relative">
              <MapPinIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-200"
              />
            </div>

            {/* Travel Type Select */}
            <div className="relative">
              <span className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6">
                ✈️
              </span>{" "}
              {/* Airplane emoji as icon alternative */}
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value)}
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer transition duration-200"
              >
                {travelTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            {/* Date Picker */}
            <div className="relative">
              <CalendarDaysIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-200"
              />
            </div>

            {/* Guests Input */}
            <div className="relative">
              <UserGroupIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <input
                type="number"
                min={1}
                max={10}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-200"
                placeholder="Guests"
              />
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="mt-6 w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-4 font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center justify-center gap-2"
          >
            <MagnifyingGlassIcon className="h-6 w-6" /> Search Your Journey
          </button>

          {/* Secondary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-indigo-700 font-medium">
            <Link href="/host" passHref>
              <motion.a
                className="hover:underline hover:text-indigo-900 transition"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🌍 Become a Host
              </motion.a>
            </Link>
            <Link href="/contact" passHref>
              <motion.a
                className="hover:underline hover:text-indigo-900 transition"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📞 Contact Travel Expert
              </motion.a>
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </section>
  );
}