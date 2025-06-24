"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Added SparklesIcon, ArrowRightIcon

// Mocking the image loader for standard <img> tags
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function CtaSection({
  title = "Ignite Your Learning Journey Today",
  subtitle = "Join our vibrant community and unlock endless possibilities for growth and discovery. Your future starts here!",
  buttonLabel = "Explore Courses",
  buttonHref = "#courses",
  imageUrl = "https://placehold.co/1200x800/1E293B/FFFFFF?text=Engage+Your+Mind", // More abstract/modern image placeholder
}) {
  // Mock navigation for demonstration
  const mockNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // In a real Next.js app, this would be router.push(path);
    // window.location.href = path; // Uncomment if you want actual page redirection in browser
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 8,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  // Animation variants for individual elements
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
  };

  return (
    <motion.section
      className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-br from-purple-800 to-indigo-900 text-white
                      rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row items-stretch">

        {/* Left Section - Image */}
        <motion.div
          className="relative w-full lg:w-1/2 h-80 lg:h-auto flex-shrink-0"
          variants={itemVariants}
        >
          <img
            src={customLoader({ src: imageUrl, width: 1200 })}
            alt="Learning engagement"
            className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/1200x800/4B0082/FFFFFF?text=Image+Not+Found"; // Darker placeholder on error
            }}
          />
          {/* Subtle gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent"></div>
        </motion.div>

        {/* Right Section - Content (CTA & Subscribe) */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center text-center lg:text-left">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-yellow-400 drop-shadow-md"
            variants={itemVariants}
          >
            {title}
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl text-indigo-100 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>

          {/* Main CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(249, 115, 22, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-500 to-yellow-500 text-white
                       px-10 py-4 rounded-full text-lg font-bold shadow-xl transition-all duration-300 mb-10
                       focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-75 self-center lg:self-start"
            variants={itemVariants}
            onClick={() => mockNavigation(buttonHref)}
          >
            {buttonLabel}
            <ArrowRightIcon className="ml-3 w-5 h-5" />
          </motion.button>

          {/* Separator */}
          <motion.div
            className="relative w-full h-px bg-indigo-700 my-8"
            variants={itemVariants}
          >
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-800 px-3 text-sm text-indigo-300 uppercase tracking-wider font-semibold">
              or
            </span>
          </motion.div>

          {/* Subscribe Section */}
          <motion.div
            className="w-full flex flex-col items-center lg:items-start"
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-yellow-400"/> Get Our Latest Updates
            </h3>
            <p className="text-indigo-200 mb-6 text-base max-w-md mx-auto lg:mx-0">
              Stay informed with our newest courses, events, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row w-full max-w-md gap-3 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email..."
                className="w-full p-4 rounded-full sm:rounded-r-none sm:rounded-l-full
                           text-gray-900 bg-white bg-opacity-90 focus:outline-none focus:ring-2
                           focus:ring-yellow-400 transition-all shadow-md placeholder-gray-500"
              />
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(239, 68, 68, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 px-8 py-4 bg-red-600 text-white font-bold rounded-full sm:rounded-l-none sm:rounded-r-full
                           hover:bg-red-700 transition-all duration-300 shadow-md
                           focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75"
                onClick={() => console.log('Subscribe Now clicked!')}
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" /> Subscribe Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
