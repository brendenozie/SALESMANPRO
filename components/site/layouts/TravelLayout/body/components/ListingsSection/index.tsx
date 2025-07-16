"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  XMarkIcon,
  StarIcon, // Used for ratings
  ClockIcon, // Used for duration
  TagIcon, // Used for activities/features
} from "@heroicons/react/24/solid"; // Using solid icons for better visual impact

// --- Global/Shared Utilities ---

// Mocking the image loader for demonstration purposes
// In a real Next.js app, configure your `next.config.js` for image optimization
const customLoader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Base64 encoded SVG for a simple blur placeholder
// This avoids needing a separate image file for the placeholder
const blurSvg = `data:image/svg+xml;base64,${btoa(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#e0e0e0" />
    <circle cx="50" cy="50" r="20" fill="#bdbdbd" />
  </svg>
`)}`;

// Animation variants for consistent staggered reveals across sections
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1, // Delay between child animations
      delayChildren: 0.2,   // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, // Softer spring for a gentle bounce
      damping: 15,    // More damping for a smoother stop
    },
  },
};

// --- Dummy Data (Centralized for easy access) ---

const travelTypes = [
  "Adventure Travel",
  "Relaxation Getaway",
  "Cultural Exploration",
  "Business Trip",
  "Family Vacation",
  "Road Trip",
  "Cruise",
  "City Break",
  "Beach Holiday",
  "Ski Trip",
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

const listings = [
  {
    id: "1",
    title: "Enchanting Bali Retreat",
    description: "Discover serene temples, lush rice paddies, and vibrant culture.",
    thumbnail: "https://images.unsplash.com/photo-1536152470817-f90694154373?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1200,
    duration: "7 Days",
    rating: 4.8,
    activities: ["Culture", "Relaxation", "Nature"],
    badge: "Popular",
  },
  {
    id: "2",
    title: "Alaskan Wilderness Adventure",
    description: "Experience majestic glaciers, abundant wildlife, and breathtaking landscapes.",
    thumbnail: "https://images.unsplash.com/photo-1506953823976-5271ccbfb894?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2500,
    duration: "10 Days",
    rating: 4.9,
    activities: ["Wildlife", "Hiking", "Cruising"],
    badge: "New",
  },
  {
    id: "3",
    title: "Parisian Romantic Escape",
    description: "Indulge in art, cuisine, and the timeless charm of the City of Lights.",
    thumbnail: "https://images.unsplash.com/photo-1502602898662-a318aa667858?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 950,
    duration: "5 Days",
    rating: 4.7,
    activities: ["City Tour", "Food", "History"],
    badge: "Hot Deal",
  },
  {
    id: "4",
    title: "Safari in Serengeti",
    description: "Witness the Great Migration and Africa's iconic wildlife up close.",
    thumbnail: "https://images.unsplash.com/photo-1534515510-410a0e980362?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 3800,
    duration: "8 Days",
    rating: 4.9,
    activities: ["Wildlife", "Photography", "Adventure"],
    badge: "Luxury",
  },
  {
    id: "5",
    title: "Kyoto Cherry Blossom Tour",
    description: "Immerse yourself in Japan's ancient traditions and stunning spring beauty.",
    thumbnail: "https://images.unsplash.com/photo-1545562083-d73b08767ef2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1800,
    duration: "6 Days",
    rating: 4.8,
    activities: ["Culture", "Nature", "Sightseeing"],
    badge: "Popular",
  },
  {
    id: "6",
    title: "Patagonia Trekking Expedition",
    description: "Conquer breathtaking trails amidst towering peaks and pristine lakes.",
    thumbnail: "https://images.unsplash.com/photo-1526392060635-9d6019824982?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 2900,
    duration: "12 Days",
    rating: 4.9,
    activities: ["Hiking", "Adventure", "Nature"],
    badge: "Challenging",
  },
  {
    id: "7",
    title: "Rome Historical Journey",
    description: "Step back in time exploring ancient ruins and Renaissance masterpieces.",
    thumbnail: "https://images.unsplash.com/photo-1552832230-c0197cefa08d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 1100,
    duration: "6 Days",
    rating: 4.6,
    activities: ["History", "Culture", "Food"],
    badge: "Classic",
  },
  {
    id: "8",
    title: "Maldives Island Paradise",
    description: "Relax on pristine beaches and dive into crystal-clear turquoise waters.",
    thumbnail: "https://images.unsplash.com/photo-1579684385127-c1341c22956c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 4500,
    duration: "7 Days",
    rating: 5.0,
    activities: ["Relaxation", "Diving", "Luxury"],
    badge: "Top Rated",
  },
];

// --- StarRating Component ---
const StarRating = ({ rating }:any) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <StarIcon key={`full-${i}`} className="h-5 w-5 text-yellow-400" />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <StarIcon className="h-5 w-5 text-yellow-400" />
          <div className="absolute top-0 right-0 overflow-hidden" style={{ width: '50%' }}>
            <StarIcon className="h-5 w-5 text-gray-300" />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      ))}
      <span className="ml-2 text-gray-700 font-semibold text-sm">{rating.toFixed(1)}</span>
    </div>
  );
};

// ListingCard.jsx
function ListingCard({ listing }:any) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0px 18px 30px rgba(0,0,0,0.18)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 transform hover:scale-[1.01] transition-transform duration-300"
    >
      <div className="relative h-56 w-full">
        <Image
          src={listing.thumbnail}
          alt={listing.title}
          layout="fill"
          objectFit="cover"
          className="transform hover:scale-105 transition-transform duration-500 ease-in-out"
          loader={customLoader}
          placeholder="blur"
          blurDataURL={blurSvg}
        />
        {listing.badge && (
          <span
            className={`absolute top-4 left-4 px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide
              ${listing.badge === "New"
                ? "bg-green-500 text-white"
                : listing.badge === "Popular"
                ? "bg-blue-500 text-white"
                : listing.badge === "Hot Deal"
                ? "bg-red-500 text-white animate-pulse"
                : listing.badge === "Luxury"
                ? "bg-yellow-500 text-gray-900"
                : "bg-gray-700 text-white"
              }`}
          >
            {listing.badge}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col justify-between h-[calc(100%-14rem)]">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">
            {listing.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>
          <div className="flex items-center justify-between mb-3">
            <p className="text-indigo-600 font-bold text-2xl">
              ${listing.price.toLocaleString()}
            </p>
            <StarRating rating={listing.rating} />
          </div>
          <div className="flex flex-wrap text-gray-700 text-sm gap-x-4 gap-y-2 mb-4">
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4 text-indigo-500" />
              {listing.duration}
            </span>
            <span className="flex items-center gap-1">
              <TagIcon className="h-4 w-4 text-indigo-500" />
              {listing.activities.join(", ")}
            </span>
          </div>
        </div>
        <Link href={`/trips/${listing.id}`} passHref>
          <motion.button
            className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold hover:bg-indigo-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Details
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}


// Listings.tsx
export default function ListingsSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Our Top Travel Experiences
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover hand-picked journeys, from thrilling adventures to serene escapes, designed for every explorer.
        </motion.p>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {listings.map((listing) => (
            <motion.div key={listing.id} variants={itemVariants}>
              <ListingCard listing={listing} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}