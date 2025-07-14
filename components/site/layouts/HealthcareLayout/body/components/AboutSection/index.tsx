"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Assuming you are using Next.js Image component
import { HeartIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/solid'; // Importing new, more relevant icons

// Mocking the image loader - Keep if not fully in Next.js Image optimization
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface AboutSectionProps {
  aboutImageUrl?: string;
  aboutText?: string;
}

export default function AboutSection({ aboutImageUrl, aboutText }: AboutSectionProps) {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-950 py-20 lg:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Text Content - Order changed for visual flow on larger screens */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // Trigger earlier
          variants={staggerContainer}
        >
          <motion.span
            className="inline-block bg-teal-500/15 text-teal-700 dark:bg-teal-400/20 dark:text-teal-400 uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 font-semibold shadow-sm"
            variants={fadeIn}
          >
            Who We Are
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 drop-shadow-md"
            variants={fadeIn}
          >
            Dedicated to Your <span className="text-teal-600 dark:text-teal-400">Health</span> and <span className="text-indigo-600 dark:text-indigo-400">Well-being</span>
          </motion.h2>

          {aboutText && (
            <motion.p
              className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 max-w-lg"
              variants={fadeIn}
            >
              {aboutText}
            </motion.p>
          )}

          {/* Value Proposition Icons */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-8"
            variants={staggerContainer} // Stagger children for these icons
          >
            <motion.div variants={iconVariants} className="flex items-start">
              <ShieldCheckIcon className="w-8 h-8 text-teal-600 dark:text-teal-400 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Trusted Expertise</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Our highly qualified team delivers exceptional care.</p>
              </div>
            </motion.div>

            <motion.div variants={iconVariants} className="flex items-start">
              <HeartIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Patient-Centered</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Your comfort and needs are our top priority.</p>
              </div>
            </motion.div>

            <motion.div variants={iconVariants} className="flex items-start">
              <UsersIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Community Focused</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Committed to improving local health outcomes.</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Image - Placed second for visual hierarchy on desktop, first on mobile */}
        {aboutImageUrl && (
          <motion.div
            className="w-full relative overflow-hidden rounded-3xl shadow-2xl aspect-w-16 aspect-h-9 md:aspect-h-10 lg:aspect-h-12 border-4 border-white dark:border-gray-700 transform hover:scale-102 transition-transform duration-500 ease-in-out" // Added aspect ratio, border, and hover effect
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          >
            <Image
              src={aboutImageUrl}
              alt="Our dedicated healthcare team"
              loader={customLoader}
              fill
              className="object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-in-out" // Subtle zoom on image hover
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px" // Responsive image sizes
            />
            {/* Optional: Overlay text on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-center p-6 text-white text-xl font-semibold text-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <span className="text-shadow">Building Healthier Futures Together</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}