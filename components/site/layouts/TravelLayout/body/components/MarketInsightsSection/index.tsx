"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircleIcon, // For virtual tour play button
  GlobeAmericasIcon, // For region cost icon
  NewspaperIcon, // For blog post icon
  XMarkIcon,
  ArrowRightIcon, // For modal close button
} from "@heroicons/react/24/solid"; // Using solid icons for consistency and visual weight

// --- Shared Utilities (from previous sections for consistency) ---

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }) => {
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
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
      stiffness: 100,
      damping: 15,
    },
  },
};

// --- Dummy Data for Market Insights & Virtual Tours ---
const virtualTours = [
  {
    id: "vt1",
    title: "Explore the Amazon Rainforest",
    thumbnail: "https://images.unsplash.com/photo-1546522301-447544d673f4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Placeholder, replace with actual tour video
    duration: "5 min",
    location: "Amazon, Brazil",
  },
  {
    id: "vt2",
    title: "A Walk Through Ancient Rome",
    thumbnail: "https://images.unsplash.com/photo-1552832230-c0197cefa08d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Placeholder
    duration: "7 min",
    location: "Rome, Italy",
  },
  {
    id: "vt3",
    title: "Safari in Serengeti National Park",
    thumbnail: "https://images.unsplash.com/photo-1534515510-410a0e980362?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Placeholder
    duration: "6 min",
    location: "Serengeti, Tanzania",
  },
  {
    id: "vt4",
    title: "Underwater Wonders of Maldives",
    thumbnail: "https://images.unsplash.com/photo-1579684385127-c1341c22956c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB5MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Placeholder
    duration: "4 min",
    location: "Maldives",
  },
];

const regionCosts = [
  { id: "rc1", region: "Europe", avgCost: 1800, icon: "🌍" },
  { id: "rc2", region: "Asia", avgCost: 1500, icon: "🌏" },
  { id: "rc3", region: "North America", avgCost: 2200, icon: "🌎" },
  { id: "rc4", region: "South America", avgCost: 1300, icon: "🌎" },
];

const blogPosts = [
  { id: "bp1", title: "10 Essential Tips for Solo Travelers", date: "2024-07-10", url: "/blog/solo-travel-tips" },
  { id: "bp2", title: "Budgeting Your Dream European Vacation", date: "2024-07-05", url: "/blog/europe-budget" },
  { id: "bp3", title: "Hidden Gems: Uncovering Asia's Best-Kept Secrets", date: "2024-06-28", url: "/blog/asia-hidden-gems" },
  { id: "bp4", title: "Sustainable Travel: How to Explore Responsibly", date: "2024-06-20", url: "/blog/sustainable-travel" },
];


// VirtualTourModal.jsx
function VirtualTourModal({ videoUrl, onClose }) {
  useEffect(() => {
    // Disable scrolling on the body when the modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
      onClick={onClose} // Close modal when clicking outside video
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking video
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition"
          aria-label="Close video"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>
        <iframe
          src={videoUrl}
          title="Virtual Tour"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </motion.div>
    </motion.div>
  );
}

// VirtualTourCard.jsx
function VirtualTourCard({ tour, onOpen }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0px 15px 30px rgba(0,0,0,0.2)" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative flex-shrink-0 w-80 h-56 rounded-2xl overflow-hidden shadow-lg cursor-pointer group border border-gray-100" // Larger size
      onClick={() => onOpen(tour.videoUrl)}
    >
      <Image
        src={tour.thumbnail}
        alt={tour.title}
        layout="fill"
        objectFit="cover"
        className="transform transition-transform duration-500 group-hover:scale-110" // Smooth zoom on hover
        loader={customLoader}
        placeholder="blur"
        blurDataURL={blurSvg}
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.span
          initial={{ opacity: 0.8, scale: 0.9 }}
          whileHover={{ opacity: 1, scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className="text-white text-6xl drop-shadow-lg"
          aria-label={`Play ${tour.title}`}
        >
          <PlayCircleIcon className="h-20 w-20 text-white/90 group-hover:text-white transition-colors duration-200" />
        </motion.span>
      </div>

      {/* Tour Info */}
      <div className="absolute bottom-4 left-4 right-4 text-white z-20">
        <h3 className="text-xl font-bold mb-1 drop-shadow-lg">{tour.title}</h3>
        <p className="text-sm text-gray-200 flex items-center">
          <GlobeAmericasIcon className="h-4 w-4 mr-1" /> {tour.location}
          <span className="mx-2">•</span>
          {tour.duration}
        </p>
      </div>
    </motion.div>
  );
}

// MarketInsights.jsx
export default function MarketInsights() {
  const [modalVideoUrl, setModalVideoUrl] = useState(null);

  const openModal = (url) => {
    setModalVideoUrl(url);
  };

  const closeModal = () => {
    setModalVideoUrl(null);
  };

  return (
    <section className="py-16 px-4 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center leading-tight"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          Explore & Plan Your Journey
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Dive into immersive virtual tours, get insights on travel costs, and discover expert tips for your next adventure.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          {/* Virtual Tours Section (Left Column - Larger) */}
          <motion.div
            className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Virtual Tours</h3>
            <div className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar">
              {virtualTours.map((tour) => (
                <motion.div key={tour.id} variants={itemVariants}>
                  <VirtualTourCard tour={tour} onOpen={openModal} />
                </motion.div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/virtual-tours" passHref>
                <motion.button
                  className="bg-indigo-50 text-indigo-700 rounded-full px-6 py-3 font-semibold hover:bg-indigo-100 transition flex items-center justify-center mx-auto gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Virtual Tours <ArrowRightIcon className="h-4 w-4 ml-1" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Market Insights & Travel Tips */}
          <div className="lg:col-span-1 flex flex-col gap-8 md:gap-10">
            {/* Average Cost Cards */}
            <motion.div
              className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Average Travel Costs</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {regionCosts.map((rc) => (
                  <motion.div
                    key={rc.id}
                    className="flex items-center bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-100"
                    whileHover={{ scale: 1.03, boxShadow: "0px 8px 15px rgba(0,0,0,0.1)" }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="text-4xl mr-4">{rc.icon}</span> {/* Emoji as icon */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{rc.region}</h4>
                      <p className="text-indigo-600 font-bold text-xl">
                        ${rc.avgCost.toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Latest Travel Tips (Blog Posts) */}
            <motion.div
              className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 flex flex-col"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Latest Travel Tips</h3>
              <ul className="space-y-4">
                {blogPosts.map((bp) => (
                  <motion.li
                    key={bp.id}
                    className="flex items-start"
                    whileHover={{ x: 5 }} // Slight slide on hover
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <NewspaperIcon className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <Link href={bp.url} passHref>
                        <motion.a className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition leading-tight">
                          {bp.title}
                        </motion.a>
                      </Link>
                      <p className="text-gray-500 text-sm">
                        {new Date(bp.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 text-center lg:text-left">
                <Link href="/blog" passHref>
                  <motion.button
                    className="bg-indigo-50 text-indigo-700 rounded-full px-6 py-3 font-semibold hover:bg-indigo-100 transition flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View All Posts <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Virtual Tour Modal */}
      <AnimatePresence>
        {modalVideoUrl && (
          <VirtualTourModal videoUrl={modalVideoUrl} onClose={closeModal} />
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styling (if needed, otherwise hide-scrollbar works) */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </section>
  );
}