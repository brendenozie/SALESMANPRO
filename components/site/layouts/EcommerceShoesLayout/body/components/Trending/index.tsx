import React from 'react';
import { motion } from 'framer-motion';

interface TrendingProps {
  promotions?: any;
  themeSettings?: any;
}

// Main App component containing the "Best Selling" section
export default function Trending({ promotions, themeSettings }: TrendingProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 font-sans flex items-center justify-center p-8">
      <section className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-16 px-4 md:px-8 relative overflow-hidden">
        {/* Absolute positioned "Summer Collection" text on the left */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 -rotate-90 origin-bottom-left whitespace-nowrap text-xl font-semibold text-zinc-400 opacity-20 hidden md:block">
          {promotions?.[0]?.title || `Summer Collection`}
        </div>

        {/* Left side with the image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="w-full md:w-1/2 flex justify-center items-center mb-8 md:mb-0 relative z-10"
        >
          <img
            src={promotions?.[0]?.imageUrl || "http://googleusercontent.com/file_content/0"}
            alt="Best Selling Sneakers"
            className="transform transition-transform duration-300 w-full max-w-lg -rotate-[15deg] scale-125"
          />
        </motion.div>

        {/* Right side with text and CTA */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left p-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h1 className="text-4xl md:text-7xl font-extrabold text-black dark:text-white mb-4 leading-tight tracking-tighter">
              {promotions?.[0]?.title || 'Trending Shoes'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-sm">
              {promotions?.[0]?.description || 'Discover the latest trends in footwear with our curated collection of trending shoes. Step up your style game today!'}
            </p>
          </motion.div>
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="group flex items-center text-black dark:text-white font-medium text-lg md:text-xl mt-4 hover:text-gray-800 transition-colors duration-200"
          >
            {promotions?.[0]?.title || 'Discovery Collection'}
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