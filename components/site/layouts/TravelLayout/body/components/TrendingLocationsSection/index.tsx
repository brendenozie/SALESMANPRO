"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  MapPinIcon, // For location
  HomeModernIcon, // For listings count (using solid for consistency with other sections)
  CurrencyDollarIcon, // For average price
  ArrowRightIcon, // For view details button
} from "@heroicons/react/24/solid"; // Import solid icons

// --- Shared Utilities (from previous sections for consistency) ---

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }:any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Base64 encoded SVG for a simple blur placeholder
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

// --- Dummy Data for Trending Locations ---
const trendingLocations = [
  {
    id: "loc1",
    name: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1545562083-d73b08767ef2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listingsCount: 150,
    avgPrice: 1800,
  },
  {
    id: "loc2",
    name: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1533105079780-fd80139b8700?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listingsCount: 90,
    avgPrice: 2200,
  },
  {
    id: "loc3",
    name: "Banff, Canada",
    image: "https://images.unsplash.com/photo-1506953823976-5271ccbfb894?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listingsCount: 120,
    avgPrice: 1500,
  },
  {
    id: "loc4",
    name: "Rio de Janeiro, Brazil",
    image: "https://images.unsplash.com/photo-1516246473484-fd3084351b68?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listingsCount: 200,
    avgPrice: 1000,
  },
  {
    id: "loc5",
    name: "Queenstown, New Zealand",
    image: "https://images.unsplash.com/photo-1509233725247-49e644766a50?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listingsCount: 80,
    avgPrice: 2000,
  },
  {
    id: "loc6",
    name: "Cape Town, South Africa",
    image: "https://images.unsplash.com/photo-1547989456-11f62024727d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listingsCount: 180,
    avgPrice: 1300,
  },
];


// TrendingCard.jsx
function TrendingCard({ loc }:any) {
  return (
    <Link href={`/destinations/${loc.id}`} passHref>
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: "0px 20px 40px rgba(0,0,0,0.25)" }} // More pronounced hover effect
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
        className="relative flex-shrink-0 w-72 h-96 rounded-3xl overflow-hidden shadow-xl cursor-pointer group border border-gray-100" // Larger card, more rounded, shadow, and border
      >
        {/* Background Image */}
        <Image
          src={loc.image}
          alt={loc.name}
          layout="fill"
          objectFit="cover"
          className="transform transition-transform duration-500 group-hover:scale-110" // Smooth zoom on hover
          loader={customLoader}
          placeholder="blur"
          blurDataURL={blurSvg}
        />

        {/* Initial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Content at the bottom */}
        <div className="absolute bottom-6 left-6 right-6 text-white z-10">
          <h3 className="text-3xl font-extrabold mb-1 drop-shadow-lg leading-tight">
            {loc.name}
          </h3>
          <div className="flex items-center text-sm text-gray-200 mb-1">
            <HomeModernIcon className="h-4 w-4 mr-1 text-indigo-300" />
            <span>{loc.listingsCount}+ amazing trips</span>
          </div>
          <div className="flex items-center text-sm text-gray-200">
            <CurrencyDollarIcon className="h-4 w-4 mr-1 text-indigo-300" />
            <span>Avg. ${loc.avgPrice.toLocaleString()} / trip</span>
          </div>
        </div>

        {/* Hover Overlay - "View Details" */}
        <motion.div
          initial={{ opacity: 0, y: "100%" }} // Starts from bottom
          whileHover={{ opacity: 1, y: "0%" }} // Slides up on hover
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 bg-indigo-600 bg-opacity-80 flex flex-col items-center justify-center text-white text-xl font-bold p-4 transform translate-y-full group-hover:translate-y-0" // Ensure full coverage and slide up
        >
          <MapPinIcon className="h-10 w-10 mb-2" />
          <span>Explore Destination</span>
          <ArrowRightIcon className="h-6 w-6 mt-2" />
        </motion.div>
      </motion.div>
    </Link>
  );
}

// TrendingLocations.jsx
export default function TrendingLocations() {
  // Ref for the scrollable container
  const scrollRef = React.useRef(null);

  // Function to scroll left/right
  const scroll = (direction:any) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Adjust scroll distance as needed
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-16 px-4 bg-white overflow-hidden"> {/* Added background color, increased padding, overflow-hidden */}
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Trending Destinations
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover where everyone's heading! Explore our most popular and sought-after travel spots.
        </motion.p>

        <div className="relative">
          {/* Scroll Buttons for Desktop */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-20 hidden md:block hover:bg-gray-100 transition"
            aria-label="Scroll left"
          >
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-3 shadow-lg z-20 hidden md:block hover:bg-gray-100 transition"
            aria-label="Scroll right"
          >
            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Scrollable Container */}
          <motion.div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-6 px-2 md:px-0 hide-scrollbar scroll-smooth" // Added px for mobile padding
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {trendingLocations.map((loc) => (
              <motion.div key={loc.id} variants={itemVariants}>
                <TrendingCard loc={loc} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Custom Scrollbar Styling (if needed, otherwise hide-scrollbar works) */}
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
      </div>
    </section>
  );
}