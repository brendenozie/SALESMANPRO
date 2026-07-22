// components/HowItWorks.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  KeyIcon,
  TagIcon, // For sell car
  WalletIcon,
  ArrowRightIcon, // For sell car
} from "@heroicons/react/24/outline";
import Link from "next/link";

const stepVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-blue-600 text-white overflow-hidden relative">
      {/* Background patterns/shapes for visual interest */}
      <div className="absolute top-0 left-0 w-full h-full">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-10"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            fillOpacity="0.1"
            d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,144C672,128,768,128,864,138.7C960,149,1056,171,1152,165.3C1248,160,1344,128,1392,112L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
          <path
            fill="#ffffff"
            fillOpacity="0.05"
            d="M0,96L48,106.7C96,117,192,139,288,133.3C384,128,480,96,576,85.3C672,75,768,85,864,101.3C960,117,1056,139,1152,149.3C1248,160,1344,160,1392,160L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold mb-6 drop-shadow-sm"
        >
          Simple Steps to Your Next Car
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-blue-100 mb-16 max-w-3xl mx-auto"
        >
          Whether you're buying, selling, or renting, our platform makes it easy and transparent.
        </motion.p>

        {/* Steps for Buying/Renting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <motion.div
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center p-6 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm shadow-xl"
          >
            <div className="bg-white text-blue-600 p-5 rounded-full mb-6 shadow-lg">
              <MagnifyingGlassIcon className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">1. Find Your Perfect Match</h3>
            <p className="text-blue-100 text-center">
              Use our advanced search filters to explore thousands of verified listings for sale or rent.
            </p>
          </motion.div>

          <motion.div
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center p-6 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm shadow-xl"
          >
            <div className="bg-white text-blue-600 p-5 rounded-full mb-6 shadow-lg">
              <ChatBubbleBottomCenterTextIcon className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">2. Connect & Secure</h3>
            <p className="text-blue-100 text-center">
              Chat with sellers/renters, arrange viewings, and finalize details securely through our platform.
            </p>
          </motion.div>

          <motion.div
            variants={stepVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col items-center p-6 bg-white bg-opacity-10 rounded-2xl backdrop-blur-sm shadow-xl"
          >
            <div className="bg-white text-blue-600 p-5 rounded-full mb-6 shadow-lg">
              <KeyIcon className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold mb-3">3. Drive Away Happy</h3>
            <p className="text-blue-100 text-center">
              Complete your purchase or pick up your rental with confidence and enjoy the open road.
            </p>
          </motion.div>
        </div>

        {/* Call to action for selling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-20 p-8 bg-white bg-opacity-15 rounded-3xl backdrop-blur-lg shadow-2xl max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold mb-3">Ready to Sell Your Car?</h3>
            <p className="text-blue-100 text-lg max-w-md">
              List your vehicle in minutes and reach thousands of potential buyers across the country.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex items-center px-8 py-4 border border-transparent text-xl font-bold rounded-full shadow-lg text-blue-600 bg-white hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            List Your Car Now
            <ArrowRightIcon className="ml-3 h-6 w-6" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}