"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EnvelopeIcon, ArrowRightIcon } from "@heroicons/react/24/solid"; // Importing icons
// Assuming useStoreContext is available and provides storeFormData
// import { useStoreContext } from '@/contexts/StoreContext';

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
const useStoreContext = () => ({
  storeFormData: {
    name: "Our Blog",
    domain: "https://yourblog.com", // Example domain
    themeSettings: { primaryColor: "#EF4444" }, // Tailwind 'red-500'
  },
});

export default function CtaSection() {
  // Destructure storeFormData from context, providing a fallback for when context is not available
  const { storeFormData } = useStoreContext() || {};
  const {
    name = "News Updates", // Default blog name
    domain = "#", // Default domain for subscribe link
    themeSettings: { primaryColor = "#EF4444" } = {}, // Default primary color (Tailwind red-500)
  } = storeFormData || {};

  const title = `Stay Updated with ${name}`;
  const subtitle = `Subscribe to our newsletter and get the latest posts, exclusive content, and insights directly to your inbox.`;
  const buttonLabel = "Subscribe Now";
  // Construct actionHref ensuring it's a valid URL, appending /subscribe
  const actionHref = domain.endsWith('/') ? `${domain}subscribe` : `${domain}/subscribe`;

  // Define animation variants for staggered appearance
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Function to calculate a lighter shade of the primary color for the gradient
  const getLighterColor = (hex, percent) => {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    r = Math.min(255, r + (255 - r) * percent / 100);
    g = Math.min(255, g + (255 - g) * percent / 100);
    b = Math.min(255, b + (255 - b) * percent / 100);

    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  const primaryColorLight = getLighterColor(primaryColor, 30); // 30% lighter

  return (
    <section className="container mx-auto px-4 sm:px-6 py-12 md:py-20 font-inter">
      <motion.div
        className="relative p-8 md:p-12 rounded-3xl shadow-2xl overflow-hidden text-center flex flex-col items-center justify-center min-h-[300px]"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${primaryColorLight})`, // Dynamic gradient
        }}
      >
        {/* Optional: Add a subtle background pattern or illustration */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 34v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zM36 10v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM12 10v-4h-2v4H6v2h4v4h2v-4h4v-2h-4zm0 0v-4h-2v4H6v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")', backgroundSize: '60px 60px' }}></div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-white">
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-shadow-lg"
            variants={itemVariants}
          >
            {title}
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg mb-8 opacity-90"
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>
          
          {/* Email Input and Subscribe Button Group */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-0 w-full max-w-xl mx-auto"
            variants={itemVariants}
          >
            <div className="relative w-full sm:flex-1">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full p-3 pl-12 rounded-full sm:rounded-l-full sm:rounded-r-none text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 shadow-md"
                aria-label="Enter your email address for newsletter subscription"
              />
            </div>
            <Link href={actionHref} passHref>
              <motion.a
                className="inline-flex items-center justify-center px-8 py-3 rounded-full sm:rounded-r-full sm:rounded-l-none font-bold text-lg text-white shadow-lg transition-all duration-300
                           hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent w-full sm:w-auto"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {buttonLabel}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </motion.a>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
