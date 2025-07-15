"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // Assuming you have Image component from Next.js
import Link from "next/link";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Dummy Data for Trending Locations (Replace with your actual data) ---
const dummyLocations = [
  {
    id: "ny",
    name: "New York City",
    img: "https://images.unsplash.com/photo-1546452296-6e4d5e8f4c0c?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 1200,
    avgPrice: 750000,
  },
  {
    id: "la",
    name: "Los Angeles",
    img: "https://images.unsplash.com/photo-1534430480872-32fdc966bb6b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 950,
    avgPrice: 920000,
  },
  {
    id: "chi",
    name: "Chicago",
    img: "https://images.unsplash.com/photo-1596768340103-685d038237b6?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 800,
    avgPrice: 480000,
  },
  {
    id: "mia",
    name: "Miami",
    img: "https://images.unsplash.com/photo-1558961363-db2be0bc4403?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 600,
    avgPrice: 650000,
  },
  {
    id: "sf",
    name: "San Francisco",
    img: "https://images.unsplash.com/photo-1507114170131-bb61a2080351?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 700,
    avgPrice: 1100000,
  },
  {
    id: "den",
    name: "Denver",
    img: "https://images.unsplash.com/photo-1610915998182-36c138e68224?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    listings: 450,
    avgPrice: 580000,
  },
];

// Animation variants for staggered reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger effect for children
      delayChildren: 0.2, // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100, // Slightly less stiff for a smoother bounce
      damping: 10, // More damping for less oscillation
    },
  },
};

export default function TrendingLocations() {
  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-3">
            Discover What's Trending 🔥
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore the most sought-after locations for properties and vehicles. Find your next great opportunity in these vibrant markets.
          </p>
        </motion.div>

        {/* Locations Grid/Carousel */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {dummyLocations.map((loc) => (
            <motion.div
              key={loc.id}
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="relative aspect-video rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer group"
            >
              <Link href={`/search?location=${loc.id}`} passHref>
                <div className="block w-full h-full"> {/* Using a div to make the whole card clickable via Link */}
                  <Image
                    src={loc.img}
                    alt={loc.name}
                    layout="fill"
                    objectFit="cover"
                    loader={customLoader}
                    className="group-hover:scale-105 transition-transform duration-500 ease-in-out brightness-90 group-hover:brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />
                  <div className="absolute bottom-5 left-5 text-white z-10">
                    <h3 className="text-xl font-bold mb-1 text-shadow-lg">{loc.name}</h3>
                    <p className="text-sm opacity-90">
                      <span className="font-semibold">{loc.listings.toLocaleString()}</span> listings • Avg{" "}
                      <span className="font-semibold">${loc.avgPrice.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-16"
        >
          <Link href="/locations" passHref>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(37,99,235,0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform flex items-center justify-center mx-auto"
            >
              View All Locations
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                ></path>
              </svg>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}