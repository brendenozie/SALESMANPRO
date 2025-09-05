'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownIcon, BoltIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { StoreForm, Testimonial, Award } from '@/types/typings';

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

// Helper function to render the headline with dynamic coloring
function renderHeadline(headline: string, primaryColor: string) {
  const words = headline.split(' ');
  if (words.length <= 1) {
    return headline;
  }
  const lastWord = words.pop();
  return (
    <>
      {words.join(' ')}{' '}
      <span style={{ color: primaryColor }}>
        {lastWord}
      </span>
    </>
  );
  
}

// Loader for next/image
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function HeroSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreForm };
  const {
    name,
    themeSettings = {},
    heroSlides = [],
    testimonials = [],
    awards = [],
  } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#10B981';
  const tagline = storeFormData.tagline || 'Crafting exceptional digital experiences.';
  const headline = heroSlides[0]?.headline || 'Building Digital Experiences';
  const imageUrl = heroSlides[0]?.productImageUrl || 'https://images.unsplash.com/photo-1517404215200-1c3970b889b7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

  const validTestimonials: Testimonial[] = Array.isArray(testimonials) ? testimonials.filter(t => typeof t.rating === 'number') : [];
  const reviewCount = validTestimonials.length;
  const averageRating =
    reviewCount > 0
      ? validTestimonials.reduce((sum, t) => sum + (typeof t.rating === 'number' ? t.rating : 0), 0) / reviewCount
      : 0;
  const roundedRating = Math.round(averageRating * 2) / 2;
  const awardsData: Award[] = Array.isArray(awards) && awards.length > 0 ? awards : [];

  return (
    <AnimatePresence>
      <section
        id="hero"
        className="relative flex items-center justify-center min-h-screen py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-950 overflow-hidden"
      >
        {/* Dynamic Background Gradients */}
        <div
          className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 10% 20%, ${primaryColor}20, transparent 40%), radial-gradient(circle at 90% 80%, ${secondaryColor}20, transparent 40%)`,
          }}
        />

        {/* Hero Image - Soft-focus and blurred */}
        <motion.div
          className="absolute inset-0 z-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <Image
            src={imageUrl || 'https://images.unsplash.com/photo-1517404215200-1c3970b889b7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
            loader={imageLoader}
            alt="Hero Background"
            fill
            priority
            className="object-cover object-center filter blur-xl scale-110"
          />
          <div className="absolute inset-0 bg-white dark:bg-gray-950 opacity-50" />
        </motion.div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Title */}
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 drop-shadow-md"
              variants={itemVariants}
            >
              {renderHeadline(headline, primaryColor)}
            </motion.h1>

            {/* Subtitle/Description */}
            <motion.p
              className="mt-4 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed"
              variants={itemVariants}
            >
              {tagline}
            </motion.p>

            {/* Call-to-Action Buttons */}
            <motion.div
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
              variants={itemVariants}
            >
              <Link
                href="#portfolio"
                className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                <ArrowDownIcon className="w-5 h-5" />
                Explore My Work
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: primaryColor,
                  border: `2px solid ${primaryColor}`,
                  boxShadow: `0 4px 6px -1px ${primaryColor}50, 0 2px 4px -2px ${primaryColor}50`,
                }}
              >
                <BoltIcon className="w-5 h-5" />
                Let's Talk
              </Link>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-700 dark:text-gray-300"
              variants={itemVariants}
            >
              {reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(roundedRating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">
                    {averageRating.toFixed(1)}/5
                  </span>
                  <span className="text-sm">
                    ({reviewCount} reviews)
                  </span>
                </div>
              )}
              {awardsData.length > 0 && (
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-semibold">
                    {awardsData[0]?.name}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}
