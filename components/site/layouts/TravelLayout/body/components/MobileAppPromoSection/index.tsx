"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  DevicePhoneMobileIcon, // Main icon for the section
  ArrowRightIcon, // For call to action button
  CheckCircleIcon, // For feature list
} from "@heroicons/react/24/solid"; // Using solid icons for consistency and visual weight

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

// --- Dummy Data for App Features ---
const appFeatures = [
  "Seamless Trip Booking",
  "Immersive Virtual Tours",
  "24/7 Expert Chat Support",
  "Personalized Itineraries",
  "Offline Access to Documents",
  "Exclusive Mobile-Only Deals",
];


// MobileAppPromo.jsx
export default function MobileAppPromo() {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-indigo-700 to-purple-900 text-white relative overflow-hidden">
      {/* Background Shapes (Subtle, Animated) */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full mix-blend-overlay -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full mix-blend-overlay translate-x-1/2 translate-y-1/2"
        animate={{ scale: [1, 0.9, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10" // Increased gap
      >
        {/* Device Mockups (Left Column on Desktop) */}
        <div className="flex-1 flex justify-center lg:justify-start relative">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-64 h-[32rem] sm:w-72 sm:h-[36rem] lg:w-80 lg:h-[40rem] shadow-2xl rounded-3xl overflow-hidden" // Larger, more prominent mockup
          >
            <Image
              src="[https://placehold.co/300x600/5C6BC0/FFFFFF?text=App+Screenshot+1](https://placehold.co/300x600/5C6BC0/FFFFFF?text=App+Screenshot+1)" // Placeholder for app screenshot
              alt="App on device"
              layout="fill"
              objectFit="cover" // Use cover to fill the mockup area
              className="rounded-3xl"
              loader={customLoader}
              placeholder="blur"
              blurDataURL={blurSvg}
            />
            {/* Optional: Add a second phone mockup slightly behind */}
            <motion.div
              initial={{ x: 50, y: 50, opacity: 0 }}
              whileInView={{ x: 20, y: 20, opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="absolute top-0 left-0 w-64 h-[32rem] sm:w-72 sm:h-[36rem] lg:w-80 lg:h-[40rem] shadow-xl rounded-3xl overflow-hidden -z-10"
              style={{ transform: 'translate(20px, 20px) rotate(-5deg)' }} // Slight offset and rotation
            >
              <Image
                src="[https://placehold.co/300x600/7986CB/FFFFFF?text=App+Screenshot+2](https://placehold.co/300x600/7986CB/FFFFFF?text=App+Screenshot+2)" // Placeholder for second app screenshot
                alt="App on device secondary"
                layout="fill"
                objectFit="cover"
                className="rounded-3xl"
                loader={customLoader}
                placeholder="blur"
                blurDataURL={blurSvg}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Text & Buttons (Right Column on Desktop) */}
        <div className="flex-1 text-center lg:text-left">
          <DevicePhoneMobileIcon className="h-16 w-16 text-indigo-300 mx-auto lg:mx-0 mb-4 drop-shadow-lg" />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-lg">
            Your World, In Your Pocket.
          </h2>
          <p className="text-indigo-200 text-lg md:text-xl mb-8 max-w-2xl lg:max-w-none leading-relaxed drop-shadow">
            Download our award-winning mobile app and unlock a universe of travel possibilities. Plan, book, and explore with unparalleled ease.
          </p>

          {/* Feature List */}
          <ul className="space-y-3 mb-10 text-lg text-indigo-100 lg:text-left text-center">
            {appFeatures.map((feature, index) => (
              <motion.li
                key={index}
                className="flex items-center justify-center lg:justify-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <CheckCircleIcon className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <motion.a
              href="#"
              aria-label="Download on the App Store"
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="[https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg](https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg)"
                alt="Download on the App Store"
                width={160}
                height={50}
                loader={customLoader}
              />
            </motion.a>
            <motion.a
              href="#"
              aria-label="Get it on Google Play"
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="[https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg](https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg)"
                alt="Get it on Google Play"
                width={160}
                height={50}
                loader={customLoader}
              />
            </motion.a>
          </div>

          {/* Learn More Button */}
          <div className="mt-8 text-center lg:text-left">
            <Link href="/mobile-app" passHref>
              <motion.button
                className="bg-white text-indigo-700 rounded-full px-8 py-4 font-bold text-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center mx-auto lg:mx-0 gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More About the App <ArrowRightIcon className="h-5 w-5 ml-2" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}