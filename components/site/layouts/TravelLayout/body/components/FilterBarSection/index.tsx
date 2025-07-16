"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image"; // Make sure Image component is imported
import {
  MapPinIcon, // For location input
  CurrencyDollarIcon, // For price range
   // For vehicle type (Assuming a similar icon exists or can be custom)
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  XMarkIcon, // For search button
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

const regions = [
  "North America",
  "Europe",
  "Asia",
  "Africa",
  "South America",
  "Oceania",
  "Middle East",
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

 // FilterBar.tsx


   
   // data/trendingLocations.ts
   export interface TrendingLocation {
     id: string
     name: string
     image: string
     listingsCount: number
     avgPrice: number
   }
   
   export const trendingLocations: TrendingLocation[] = [
     {
       id: 'tokyo',
       name: 'Tokyo, Japan',
       image: '/assets/trending/tokyo.jpg',
       listingsCount: 342,
       avgPrice: 2200,
     },
     {
       id: 'bali',
       name: 'Bali, Indonesia',
       image: '/assets/trending/bali.jpg',
       listingsCount: 289,
       avgPrice: 1250,
     },
     {
       id: 'paris',
       name: 'Paris, France',
       image: '/assets/trending/paris.jpg',
       listingsCount: 410,
       avgPrice: 3000,
     },
     {
       id: 'cape-town',
       name: 'Cape Town, South Africa',
       image: '/assets/trending/capetown.jpg',
       listingsCount: 157,
       avgPrice: 1400,
     },
     // …more locations
   ]
   
   const travelTypes = [
      "Adventure Travel",
      "Relaxation Getaway",
      "Cultural Exploration",
      "Business Trip",
      "Family Vacation",
      "Road Trip",
      "Cruise",
    ];


// FilterBar.jsx
export default function FilterBar() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [price, setPrice] = useState(2500);
  const [isClient, setIsClient] = useState(false); // State to check if component is mounted on client

  useEffect(() => {
    setIsClient(true); // Set to true once the component mounts on the client
  }, []);

  const handleApplyFilters = () => {
    console.log({ type, region, date, guests, price });
    alert("Applying filters! (Check console for data)");
  };

  const handleClearFilters = () => {
    setType("");
    setRegion("");
    setDate("");
    setGuests(2);
    setPrice(2500);
    alert("Filters cleared!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg shadow-lg px-4 py-4 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto">
        {/* Mobile Toggle Button */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Filter Your Trip</h2>
          <motion.button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 font-semibold shadow-sm hover:bg-indigo-100 transition duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {open ? "Hide Filters" : "Show Filters"}
            <ChevronDownIcon
              className={`w-5 h-5 transform transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </motion.button>
        </div>

        {/* Filter Controls - Conditionally rendered for mobile with client-side check */}
        <AnimatePresence>
          {isClient && (open || window.innerWidth >= 768) ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 items-end">
                {/* Travel Type */}
                <div className="relative">
                  <label htmlFor="travelType" className="sr-only">Travel Type</label>
                  <span className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6">
                    ✈️
                  </span>
                  <select
                    id="travelType"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer transition duration-200 shadow-sm"
                  >
                    <option value="">All Types</option>
                    {travelTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                {/* Region */}
                <div className="relative">
                  <label htmlFor="region" className="sr-only">Region</label>
                  <MapPinIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
                  <select
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none appearance-none cursor-pointer transition duration-200 shadow-sm"
                  >
                    <option value="">All Regions</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                {/* Date */}
                <div className="relative">
                  <label htmlFor="date" className="sr-only">Date</label>
                  <CalendarDaysIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-200 shadow-sm"
                  />
                </div>

                {/* Guests */}
                <div className="relative">
                  <label htmlFor="guests" className="sr-only">Number of Guests</label>
                  <UserGroupIcon className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
                  <input
                    id="guests"
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    placeholder="Guests"
                    className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-800 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition duration-200 shadow-sm"
                  />
                </div>

                {/* Price Range */}
                <div className="relative col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col justify-center">
                  <label htmlFor="priceRange" className="text-sm text-gray-700 font-medium mb-1">
                    Max Budget: <span className="font-bold">${price}</span>
                  </label>
                  <div className="relative flex items-center">
                    <CurrencyDollarIcon className="absolute left-3 text-gray-500 w-5 h-5" />
                    <input
                      id="priceRange"
                      type="range"
                      min={500}
                      max={5000}
                      step={100}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-3">
                  <motion.button
                    onClick={handleApplyFilters}
                    className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold shadow-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" /> Apply Filters
                  </motion.button>
                  <motion.button
                    onClick={handleClearFilters}
                    className="w-full bg-gray-200 text-gray-700 rounded-full px-6 py-3 font-semibold shadow-md hover:bg-gray-300 transition duration-200 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <XMarkIcon className="w-5 h-5" /> Clear Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function FilterBarV1() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [price, setPrice] = useState(1500);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm px-4 py-3 border-b border-gray-200"
    >
      <div className="max-w-6xl mx-auto">
        {/* Mobile Toggle */}
        <div className="md:hidden flex justify-between items-center">
          <p className="font-semibold text-gray-700">Filters</p>
          <button
            onClick={() => setOpen(!open)}
            className="text-indigo-600 font-medium flex items-center gap-1"
          >
            {open ? "Hide" : "Show"}{" "}
            <ChevronDownIcon
              className={`transform w-5 h-5 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        <div className={`mt-4 md:mt-0 ${open ? "block" : "hidden"} md:block`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            {/* Travel Type */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Type</option>
              {travelTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            {/* Region */}
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Region</option>
              {regions.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            {/* Date */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Guests */}
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              placeholder="Guests"
              className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Price */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-500">Max Budget: ${price}</label>
              <input
                type="range"
                min={500}
                max={5000}
                step={100}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Apply Button */}
            <button className="bg-indigo-600 text-white rounded-xl px-4 py-2 font-medium hover:bg-indigo-700 transition">
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}