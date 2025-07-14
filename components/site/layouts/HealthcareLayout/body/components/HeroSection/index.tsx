"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircleIcon, ArrowRightIcon, AcademicCapIcon, BanknotesIcon, HeartIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/solid'; // Changed from outline to solid for more prominence
import { useRouter } from 'next/navigation'; // Correct import for useRouter in Next.js 13+
import Image from 'next/image'; // Import Next.js Image component

// Mocking the image loader - good for non-Next.js environments, but for Next.js, Image handles this
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface HealthcareHeroProps {
  name: string;
  slug: string;
  description?: string;
  bannerUrl?: string;
}

export default function HealthcareHero({ name, slug, description, bannerUrl }: HealthcareHeroProps) {
  const router = useRouter();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Dynamic Gradient Overlay with Subtle Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-teal-700 via-blue-600 to-indigo-600"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0.95 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      />

      {/* Backdrop Image with Enhanced Overlay */}
      {bannerUrl && (
        <Image
          src={bannerUrl}
          alt="Healthcare background"
          fill
          className="object-cover opacity-25 mix-blend-overlay" // Increased opacity, added mix-blend-overlay for richer blend
          loader={customLoader} // Keep customLoader if you're not fully in Next.js Image optimization
          priority
        />
      )}
      {/* Darker, more prominent overlay for content contrast */}
      <div className="absolute inset-0 bg-black opacity-40" aria-hidden="true" />

      {/* Content */}
      <motion.div
        className="relative z-10 px-6 py-20 mt-28 text-center max-w-4xl mx-auto" // Added max-width and vertical padding
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          className="inline-block bg-white/25 text-white uppercase text-sm tracking-widest rounded-full px-4 py-2 mb-4 shadow-md" // Enhanced styling
          variants={itemVariants}
        >
          Your Journey to Wellness
        </motion.span>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 drop-shadow-2xl" // Added drop-shadow
          variants={itemVariants}
        >
          {name}
        </motion.h1>

        {description && (
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-100/95 max-w-3xl mx-auto mb-10 leading-relaxed" // Adjusted text color and line height
            variants={itemVariants}
          >
            {description}
          </motion.p>
        )}

        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-6" // Increased gap for better spacing
          variants={itemVariants}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.3)" }} // Added shadow on hover
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/services`)}
            className="flex items-center justify-center bg-white text-teal-700 font-bold px-8 py-4 rounded-full shadow-xl hover:bg-gray-100 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-teal-600" // Enhanced button styles
            aria-label="Explore Our Services"
          >
            <ClipboardDocumentListIcon className="w-6 h-6 mr-3" /> {/* Larger icon */}
            Explore Services
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)", boxShadow: "0px 8px 20px rgba(0,0,0,0.3)" }} // Added background change and shadow on hover
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/${slug}/book`)}
            className="flex items-center justify-center border-2 border-white text-white font-bold px-8 py-4 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-teal-600" // Enhanced button styles
            aria-label="Schedule an Appointment"
          >
            <HeartIcon className="w-6 h-6 mr-3" /> {/* Larger icon */}
            Schedule Appointment
          </motion.button>
        </motion.div>

        {/* Optional: Add a subtle scroll indicator or value proposition icons */}
        <div className="mt-20 flex justify-center gap-10 opacity-80">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center"
          >
            <AcademicCapIcon className="w-10 h-10 text-white mb-2" />
            <span className="text-sm font-medium">Expert Doctors</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center"
          >
            <BanknotesIcon className="w-10 h-10 text-white mb-2" />
            <span className="text-sm font-medium">Affordable Care</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex flex-col items-center"
          >
            <PlayCircleIcon className="w-10 h-10 text-white mb-2" />
            <span className="text-sm font-medium">Patient-Centered</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}