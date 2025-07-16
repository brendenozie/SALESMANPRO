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



 // MobileAppPromo.tsx
export default function MobileAppPromo() {
  return (
    <section className="py-16 px-4 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12"
      >
        {/* Text & Buttons */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Take Your Adventures On the Go
          </h2>
          <p className="text-gray-600 mb-6">
            Download our app to book trips, explore virtual tours, and chat with experts wherever you are.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            <a href="#" aria-label="Download on the App Store">
              <Image
                src="/assets/app-store-badge.png"
                alt="Download on the App Store"
                width={150}
                height={50}
                loader={loader}
              />
            </a>
            <a href="#" aria-label="Get it on Google Play">
              <Image
                src="/assets/google-play-badge.png"
                alt="Get it on Google Play"
                width={150}
                height={50}
                loader={loader}
              />
            </a>
          </div>
        </div>

        {/* Device Mockups */}
        <div className="flex-1 flex justify-center lg:justify-end relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative w-48 h-96 sm:w-56 sm:h-[36rem] lg:w-64 lg:h-[40rem]"
          >
            <Image
              src="/assets/device-mockup.png"
              alt="App on device"
              layout="fill"
              loader={loader}
              objectFit="contain"
              placeholder="blur"
              blurDataURL="/assets/blur-placeholder.png"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}