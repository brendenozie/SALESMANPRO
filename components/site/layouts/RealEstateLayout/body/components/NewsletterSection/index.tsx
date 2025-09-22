"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Mocking the image loader since Next.js Image is not available
// This loader is not directly used in this section but kept for consistency if needed elsewhere.
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for text elements
const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

// Animation variants for form elements
const formVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3, // Delay after text animates in
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

//──────────────────────────────────────────────────────────────────────────────
// NewsletterSection
//──────────────────────────────────────────────────────────────────────────────
export default function NewsletterSection({ handleNewsletter }: any) {
  return (
    <motion.section
      className="contact relative py-20 sm:py-28 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-900 dark:to-black overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      {/* Background Shapes/Graphics for visual interest */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob animation-delay-4000" />
      <div className="absolute top-1/4 left-[30%] w-48 h-48 bg-white/5 dark:bg-white/[0.02] rounded-full mix-blend-overlay animate-blob" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Title */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-lg"
          variants={textVariants}
        >
          Never Miss an <span className="text-amber-300 dark:text-amber-400">Opportunity!</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-lg sm:text-xl text-indigo-100 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
          variants={textVariants}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          Subscribe to our exclusive newsletter and get the latest prime listings, market insights, and real estate news directly to your inbox.
        </motion.p>

        {/* Newsletter Form */}
        <motion.form
          onSubmit={handleNewsletter}
          className="flex flex-col md:flex-row items-center gap-4 max-w-xl mx-auto"
          variants={formVariants}
        >
          <input
            type="email"
            placeholder="Your email address"
            required
            aria-label="Enter your email address to subscribe"
            className="flex-1 w-full p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-gray-800/90 border-2 border-transparent
                       text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                       focus:outline-none focus:ring-4 focus:ring-amber-400 focus:border-transparent
                       transition duration-300 ease-in-out shadow-lg backdrop-blur-sm"
          />
          <motion.button
            type="submit"
            aria-label="Subscribe to our newsletter"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="w-full md:w-auto bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold uppercase py-4 px-10 rounded-2xl
                       shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/70
                       transition duration-300 ease-in-out transform"
          >
            Subscribe Now
          </motion.button>
        </motion.form>

        {/* Small disclaimer or trust signal (optional) */}
        <motion.p
          className="mt-8 text-sm text-indigo-200 dark:text-gray-400"
          variants={formVariants}
          transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
        >
          We respect your privacy. No spam, ever.
        </motion.p>
      </div>
    </motion.section>
  );
}