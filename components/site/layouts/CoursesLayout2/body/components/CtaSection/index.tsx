"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import clsx from 'clsx'; // Utility for conditional class names

// --- Type definitions (kept for context) ---
// ... (omitted for brevity)

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function CtaSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  // Dynamic content from storeFormData with fallbacks
  const ctaTitle = storeFormData?.name || "Ignite Your Learning Journey Today";
  const ctaSubtitle = storeFormData?.description || "Unlock endless possibilities for growth and discovery with our cutting-edge courses and expert instructors.";
  const ctaButtonLabel = "Explore Courses";
  const ctaButtonHref = "/courses";
  const ctaImageUrl = storeFormData?.bannerUrl || "https://images.unsplash.com/photo-1546410531-bb45ce9b6867?q=80&w=2670&auto=format&fit=crop"; 
  const subscribeText =  "Stay informed with our newest courses, events, and exclusive offers.";
  const subscribePlaceholder = storeFormData?.contactEmail || "your.email@example.com";
  const subscribeButtonLabel =  "Subscribe Now";

  // Mock navigation for demonstration
  const mockNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for individual elements
  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/1200x800/CCCCCC/333333?text=Image+Not+Found";
  };

  return (
    <motion.section
      className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        
        {/* --- Background: Diagonal Split --- */}
        <div 
            className="absolute inset-0 z-0 hidden lg:block"
            style={{ 
                // Uses a diagonal clip-path to split the container visually
                clipPath: 'polygon(0 0, 60% 0, 40% 100%, 0% 100%)',
                backgroundColor: primaryColor,
            }}
        />

        {/* Fallback color for the right side / mobile */}
        <div className="absolute inset-0 z-0 bg-white dark:bg-gray-800 lg:hidden" />
        <div 
            className="absolute inset-0 z-0 hidden lg:block"
            style={{ 
                clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)',
                backgroundColor: 'white', // Right side base color
            }}
        />

        {/* --- Content Grid: 2/3rds Image/Color, 1/3rd Content --- */}
        <div className="relative z-10 grid lg:grid-cols-12">

          {/* 1. Left Section - Image & Branding (Col Span 7) */}
          <motion.div
            className="relative col-span-12 lg:col-span-7 h-96 lg:min-h-[550px] flex items-center justify-center p-10"
            variants={itemVariants}
          >
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
              <Image
                src={ctaImageUrl}
                alt="Learning engagement"
                fill
                className="object-cover object-center"
                loader={loader}
                sizes="(max-width: 1024px) 100vw, 60vw"
                onError={handleImageError}
              />
              {/* Strong Gradient Overlay */}
              <div className="absolute inset-0 bg-gray-900/80 group-hover:bg-gray-900/70 transition-colors duration-500"></div>
            </div>

            {/* Centerpiece Text/Logo */}
            <motion.div 
                className="relative text-center p-6 border-4 border-white/50 rounded-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate="visible"
                variants={{ visible: { opacity: 1, scale: 1, transition: { delay: 0.4, type: 'spring', stiffness: 100 }}}}
            >
              <h3 className="text-4xl font-extrabold text-white">{storeFormData?.name || "EduLearn Academy"}</h3>
              <p className="text-xl text-gray-300 mt-2 font-medium">{storeFormData?.tagline || "Your Future, Our Expertise"}</p>
            </motion.div>
          </motion.div>

          {/* 2. Right Section - Content (CTA & Subscribe) (Col Span 5) */}
          <div className="col-span-12 lg:col-span-5 p-8 sm:p-12 flex flex-col justify-center text-center lg:text-left bg-white dark:bg-gray-800">
            <motion.h2
              className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight text-gray-900 dark:text-white"
              variants={itemVariants}
            >
              Ready to <span style={{ color: primaryColor }}>{' Join'}</span>
            </motion.h2>

            <motion.p
              className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed h-20 overflow-hidden"
              variants={itemVariants}
            >
              {ctaSubtitle}
            </motion.p>

            {/* Main CTA Button (Highly Emphasized) */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: `0 15px 30px ${primaryColor}60` }}
              whileTap={{ scale: 0.95 }}
              className={clsx(`inline-flex items-center justify-center text-white w-full sm:w-auto
                            px-12 py-2 rounded-full text-xl font-extrabold shadow-2xl transition-all duration-300 mb-12
                            focus:outline-none focus:ring-4 focus:ring-opacity-75`)}
              style={{
                background: primaryColor,
              }}
              variants={itemVariants}
              onClick={() => mockNavigation(ctaButtonHref)}
            >
              {ctaButtonLabel}
              <ArrowRightIcon className="ml-3 w-6 h-6" />
            </motion.button>


            {/* Subscribe Section (Secondary CTA) */}
            <motion.div
              className="w-full flex flex-col items-center lg:items-start pt-8 border-t border-gray-200 dark:border-gray-700"
              variants={itemVariants}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                <SparklesIcon className={`w-6 h-6`} style={{ color: accentColor }} /> Get Our Exclusive Updates
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-base max-w-md mx-auto lg:mx-0">
                {subscribeText}
              </p>
              <div className="flex w-full max-w-md gap-0 shadow-lg rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
                <input
                  type="email"
                  placeholder={subscribePlaceholder}
                  className={`w-full p-4 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-opacity-75`}
                  style={{ ['--tw-ring-color' as any]: accentColor } as React.CSSProperties}
                />
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: primaryColor }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 px-6 py-4 text-white font-bold text-sm sm:text-base
                            transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-75`}
                  style={{ backgroundColor: accentColor, // Use accent color for secondary button
                           color: '#333', // Dark text on accent color
                           ['--tw-ring-color' as any]: accentColor } as React.CSSProperties}
                  onClick={() => console.log('Subscribe Now clicked!')}
                >
                  <EnvelopeIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}