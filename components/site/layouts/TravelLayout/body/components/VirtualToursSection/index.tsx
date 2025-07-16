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

// VirtualTours.tsx
export default function VirtualTours() {
  const [openUrl, setOpenUrl] = useState<string | null>(null);

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 text-center">
        Virtual Tours & Videos
      </h2>

      <div className="flex space-x-6 overflow-x-auto pb-4 hide-scrollbar">
        {virtualTours.map((t) => (
          <VirtualTourCard key={t.id} tour={t} onOpen={setOpenUrl} />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {openUrl && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenUrl(null)}
          >
            <motion.div
              className="relative w-11/12 md:w-3/4 lg:w-1/2 h-[60vh]"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                className="w-full h-full rounded-2xl"
                src={openUrl}
                title="Virtual Tour"
                allow="autoplay; fullscreen"
              />
              <button
                onClick={() => setOpenUrl(null)}
                className="absolute top-2 right-2 text-white text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
