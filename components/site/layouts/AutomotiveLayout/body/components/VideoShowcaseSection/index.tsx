"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayCircleIcon, XMarkIcon } from "@heroicons/react/24/solid"; // More prominent play icon, and X for close
import Image from "next/image"; // Assuming you have Image component from Next.js

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Dummy Data for Virtual Tours & Videos (Replace with your actual data) ---
const dummyTours = [
  {
    id: "tour-1",
    title: "Luxury Penthouse in Downtown",
    thumbnail: "https://images.unsplash.com/photo-1570129476815-ba6054817a3f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoId: "dQw4w9WgXcQ", // Replace with actual YouTube video IDs
    description: "Experience unparalleled elegance with a virtual tour of this stunning penthouse.",
  },
  {
    id: "tour-2",
    title: "Eco-Friendly Family Home",
    thumbnail: "https://images.unsplash.com/photo-1510627498911-c9a9d701b97b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoId: "dQw4w9WgXcQ",
    description: "A comprehensive video walkthrough of a modern, energy-efficient family house.",
  },
  {
    id: "tour-3",
    title: "Sports Car Driving Experience",
    thumbnail: "https://images.unsplash.com/photo-1542362543-b939f503c7a0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoId: "dQw4w9WgXcQ",
    description: "Feel the thrill with an immersive video showcasing this high-performance vehicle.",
  },
  {
    id: "tour-4",
    title: "Cozy Lakeside Cabin",
    thumbnail: "https://images.unsplash.com/photo-1533769152331-f5945143a571?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoId: "dQw4w9WgXcQ",
    description: "A tranquil video tour of a charming cabin by the lake, perfect for getaways.",
  },
  {
    id: "tour-5",
    title: "Urban Loft with City Views",
    thumbnail: "https://images.unsplash.com/photo-1522703889020-e2b26002bbdc?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoId: "dQw4w9WgXcQ",
    description: "Discover modern urban living in this stylish loft with breathtaking city views.",
  },
  {
    id: "tour-6",
    title: "Classic Vintage Convertible",
    thumbnail: "https://images.unsplash.com/photo-1582236528704-2035b3ee5c59?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    videoId: "dQw4w9WgXcQ",
    description: "A detailed video presentation of a beautifully restored vintage convertible.",
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
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

// --- Lightbox Component (for video playback) ---
interface LightboxProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ videoId, isOpen, onClose }) => {
  if (!isOpen) return null;

  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={onClose} // Close on backdrop click
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full aspect-video flex items-center justify-center"
        onClick={(e : any) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 p-2 bg-white text-gray-800 rounded-full shadow-lg z-10 hover:bg-gray-200 transition"
          aria-label="Close video"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        <iframe
          src={youtubeEmbedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
          title="YouTube video player"
        ></iframe>
      </motion.div>
    </motion.div>
  );
};


// --- VideoShowcase Component ---
export default function VideoShowcase() {
  const [isOpen, setIsOpen] = useState<string | null>(null);

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
            Immersive Virtual Experiences 🎬
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Step inside our properties and vehicles from anywhere in the world with high-quality video tours.
          </p>
        </motion.div>

        {/* Video Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {dummyTours.map((tour) => (
            <motion.div
              key={tour.id}
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative cursor-pointer rounded-xl overflow-hidden shadow-xl group"
              onClick={() => setIsOpen(tour.id)}
            >
              <div className="relative w-full aspect-video overflow-hidden">
                <Image
                  src={tour.thumbnail}
                  alt={tour.title}
                  layout="fill"
                  objectFit="cover"
                  loader={customLoader}
                  className="group-hover:scale-110 transition-transform duration-500 ease-in-out brightness-90 group-hover:brightness-70"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircleIcon className="w-16 h-16 text-white transform group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
              <div className="p-5 bg-white dark:bg-gray-800 flex flex-col justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 leading-tight">
                  {tour.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tour.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Dynamic Lightbox Modals */}
        <AnimatePresence>
          {dummyTours.map((tour) => (
            <Lightbox
              key={tour.id}
              videoId={tour.videoId}
              isOpen={isOpen === tour.id}
              onClose={() => setIsOpen(null)}
            />
          ))}
        </AnimatePresence>

        {/* Optional: Call to action for more videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-16"
        >
          <button
            onClick={() => alert("Navigate to all videos page!")} // Replace with actual navigation
            className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Explore All Video Tours
          </button>
        </motion.div>
      </div>
    </section>
  );
}