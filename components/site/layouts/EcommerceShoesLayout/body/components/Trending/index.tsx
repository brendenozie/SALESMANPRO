import React from 'react';
import { motion } from 'framer-motion';

// Main App component containing the "Best Selling" section
export default function Trending() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 font-sans flex items-center justify-center p-8">
      <section className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-16 px-4 md:px-8">
        {/* Left side with the image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0"
        >
          <img
            src="https://placehold.co/600x400/FFF?text=Sneakers"
            alt="Best Selling Sneakers"
            className="rounded-3xl shadow-xl transform hover:scale-105 transition-transform duration-300 w-full max-w-lg"
          />
        </motion.div>

        {/* Right side with text and CTA */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              Best Selling
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-md">
              Find various styles of shoes that everyone is looking for.
            </p>
          </motion.div>
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="group flex items-center text-red-500 font-semibold text-lg md:text-xl mt-4 hover:text-red-600 transition-colors duration-200"
          >
            Discover Collection
            <svg
              className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </motion.a>
        </div>
      </section>
    </div>
  );
}
