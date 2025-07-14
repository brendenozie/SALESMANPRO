"use client";

import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react'; // Ensure useEffect is imported
import Image from 'next/image'; // Make sure Image component is imported
import {
  SparklesIcon,
  ShieldCheckIcon,
  HandThumbUpIcon,
  BuildingOfficeIcon, // Example icon for properties
  UsersIcon,           // Example icon for clients
  TrophyIcon,          // Example icon for awards
  GlobeAltIcon         // Example icon for global reach
} from '@heroicons/react/24/solid';

// Mocking the image loader since Next.js Image is not available
const customLoader = ({ src, width, quality }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal of items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each item animates with a slight delay
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
      type: "spring", // More natural bounce
      stiffness: 100, // Less stiff
      damping: 10,    // More damping
    },
  },
};

// Function to get Heroicon based on a string (you'll need to map these)
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'SparklesIcon': return SparklesIcon;
    case 'ShieldCheckIcon': return ShieldCheckIcon;
    case 'HandThumbUpIcon': return HandThumbUpIcon;
    case 'BuildingOfficeIcon': return BuildingOfficeIcon;
    case 'UsersIcon': return UsersIcon;
    case 'TrophyIcon': return TrophyIcon;
    case 'GlobeAltIcon': return GlobeAltIcon;
    default: return null; // Or a default generic icon
  }
};

//──────────────────────────────────────────────────────────────────────────────
// WhyChooseUs
//──────────────────────────────────────────────────────────────────────────────
export default function WhyChooseUs({ metrics, awards }: any) {
  // `useAnimation` is typically used for more complex, imperative animations.
  // For `whileInView`, `initial`, and `animate` on simple elements, it's often not strictly needed,
  // but we'll keep it here as per your original structure.
  const controls = useAnimation();

  useEffect(() => {
    // This useEffect will trigger the initial animation for metrics when component mounts
    // or when `controls` dependency changes (though it's stable here).
    // For `whileInView` on individual items, you might not need this explicitly.
    // The `viewport` prop on `motion.div` is often sufficient.
    // However, if you want a specific staggered entry *before* all are in view, this works.
    controls.start((i: number) => ({
      y: 0,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }));
  }, [controls]);

  return (
    <section className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 py-20 sm:py-28 relative overflow-hidden">
      {/* Subtle Background pattern/shapes for visual depth */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-5">
        <svg className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1" fill="#a1a1aa" /> {/* Gray-300 / Zinc-700 */}
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Section Heading */}
        <motion.h2
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-50 mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          Why Our Clients <span className="text-emerald-600 dark:text-teal-400">Choose Us</span>
          <span className="block w-40 h-1 bg-amber-500 mx-auto mt-4 rounded-full" /> {/* Accent line */}
        </motion.h2>

        {/* Core Value Proposition Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Example Value Card 1 */}
          <motion.div
            className="bg-white dark:bg-gray-850 rounded-3xl p-8 shadow-xl flex flex-col items-center
                       border-t-4 border-amber-500 dark:border-amber-400 transform transition-all duration-300
                       hover:scale-[1.01] hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            variants={itemVariants}
          >
            <div className="p-4 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-800/30 dark:text-amber-400 mb-6">
              <ShieldCheckIcon className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3">
              Unmatched Trust
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              We build lasting relationships on transparency, integrity, and unparalleled client satisfaction. Your trust is our greatest asset.
            </p>
          </motion.div>

          {/* Example Value Card 2 */}
          <motion.div
            className="bg-white dark:bg-gray-850 rounded-3xl p-8 shadow-xl flex flex-col items-center
                       border-t-4 border-emerald-500 dark:border-emerald-400 transform transition-all duration-300
                       hover:scale-[1.01] hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            variants={itemVariants}
          >
            <div className="p-4 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-800/30 dark:text-emerald-400 mb-6">
              <SparklesIcon className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3">
              Tailored Solutions
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              Your property journey is unique. We offer personalized strategies and expert guidance every step of the way.
            </p>
          </motion.div>

          {/* Example Value Card 3 */}
          <motion.div
            className="bg-white dark:bg-gray-850 rounded-3xl p-8 shadow-xl flex flex-col items-center
                       border-t-4 border-teal-500 dark:border-teal-400 transform transition-all duration-300
                       hover:scale-[1.01] hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
            variants={itemVariants}
          >
            <div className="p-4 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-800/30 dark:text-teal-400 mb-6">
              <HandThumbUpIcon className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3">
              Proven Results
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              With a track record of successful transactions, we consistently deliver exceptional outcomes for our clients.
            </p>
          </motion.div>
        </motion.div>

        {/* Metrics Section */}
        <div className="mb-20">
          <motion.h3
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-10"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Our Achievements at a Glance
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            role="group"
            aria-label="Company metrics"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {metrics && metrics.map((m, idx) => {
              const Icon = getIconComponent(m.iconName); // Get the component based on iconName
              return (
                <motion.div
                  key={m.id || idx} // Use idx as fallback key
                  custom={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.08)" }}
                  className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg transform transition-all duration-300
                             flex flex-col items-center justify-center min-h-[180px]
                             focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-4 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
                  tabIndex={0} // Make metrics accessible via keyboard
                  aria-label={`${m.value.toLocaleString()} ${m.label}`}
                >
                  {Icon && (
                    <div className="mx-auto mb-4 w-14 h-14 text-emerald-500 dark:text-emerald-400">
                      <Icon className="w-full h-full" />
                    </div>
                  )}
                  <motion.p
                    className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.6 }}
                  >
                    {m.value.toLocaleString()}+
                  </motion.p>
                  <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-300">
                    {m.label}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Awards Section */}
        {awards && awards.length > 0 && (
          <div className="mt-16">
            <motion.h3
              className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-50 mb-10"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Recognized for Excellence
            </motion.h3>
            <motion.div
              className="flex flex-wrap justify-center items-center gap-10"
              role="group"
              aria-label="Awards and recognitions"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {awards.map((a, idx) => (
                <motion.div
                  key={a.id || idx} // Use idx as fallback key
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.05 }}
                  className="flex flex-col items-center w-36 sm:w-40 cursor-default" // Increased width slightly
                  tabIndex={0} // Make awards accessible via keyboard
                  aria-label={`${a.name} award`}
                >
                  <div className="relative w-20 h-20 filter grayscale hover:grayscale-0 transition-all duration-500 ease-in-out"> {/* Larger icon, smoother transition */}
                    <Image
                      src={a.iconUrl}
                      alt={`${a.name} award logo`}
                      layout="fill"
                      objectFit="contain"
                      loader={customLoader}
                    />
                  </div>
                  <p className="mt-4 text-base font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                    {a.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}