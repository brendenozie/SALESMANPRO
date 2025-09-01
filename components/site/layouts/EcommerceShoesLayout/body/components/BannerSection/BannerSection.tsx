'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Main App component containing the visually appealing hero section
export default function BannerSection() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-sans p-8 flex items-center justify-center">
      <section className="w-full max-w-7xl mx-auto py-16 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="relative w-full min-h-[500px] bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-start p-8 md:p-12"
        >
          {/* Background image container */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1595950653106-6a56e30b6e9c?fit=crop&w=1500&q=80"
              alt="Person wearing stylish sneakers"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
          </div>

          {/* Text content overlay */}
          <div className="relative text-left z-10 p-4 md:p-8 rounded-lg bg-black bg-opacity-30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="font-bold text-white text-3xl md:text-4xl leading-tight"
            >
              <p>For you</p>
              <p>For them</p>
              <p>For everyone</p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
