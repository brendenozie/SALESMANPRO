'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, BoltIcon, TrophyIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Award, Testimonial } from '@/types/typings';


// Assuming useStoreContext, StoreForm, Testimonial, Award types are correctly defined
// import { useStoreContext } from '@/contexts/StoreContext'; 
// import { StoreForm, Testimonial, Award } from '@/types/typings'; 

// --- Setup unchanged utility functions and types ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Faster stagger for better impact
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 }, // Animate from the left for content
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'tween', // Simpler tween for a faster feel
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.9, rotate: 2 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 20,
      delay: 0.4, // Delay image to follow text
    },
  },
};

function renderHeadline(headline: string, primaryColor: string) {
  const words = headline.split(' ');
  if (words.length <= 1) {
    return <span className="text-gray-900 dark:text-white">{headline}</span>;
  }
  const lastWord = words.pop();
  return (
    <>
      <span className="text-gray-900 dark:text-white">{words.join(' ')}</span>{' '}
      <span style={{ color: primaryColor }} className="drop-shadow-lg">
        {lastWord}
      </span>
    </>
  );
}

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

interface HeroSectionProps {
    name: string | undefined | null;
    themeSettings: {
      primaryColor?: string;
      secondaryColor?: string;
    } | undefined | null;
    tagline?: string | undefined | null;
    heroSlides: {
      headline?: string | undefined | null;
      imageUrl?: string | undefined | null;
      productImageUrl?: string | undefined | null;
    }[];
    testimonials: Testimonial[] | undefined | null;
    awards: Award[] | undefined | null;
  }

// --- Component Start ---

export default function HeroSection( { name, themeSettings, tagline, heroSlides, testimonials, awards }: HeroSectionProps) {
  
  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#10B981';
  const headline = heroSlides[0]?.headline || 'Building Digital Experiences';
  
  // Prioritize productImageUrl for the new split design
  const productImageUrl = heroSlides[0]?.imageUrl || heroSlides[0]?.productImageUrl  || 'https://images.unsplash.com/photo-1517404215200-1c3970b889b7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

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
        className="relative flex items-center min-h-screen py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-950 overflow-hidden"
      >
        {/* Dynamic Background Element - Subtle and Modern */}
        <div 
          className="absolute top-0 right-0 w-3/5 h-full opacity-5 dark:opacity-10 pointer-events-none"
          style={{ 
            background: `linear-gradient(to top left, ${primaryColor} 0%, transparent 70%)` 
          }}
        />

        {/* --- Hero Content Grid (Split) --- */}
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Text Content & CTAs (60% width on large screens) */}
          <motion.div
            className="lg:col-span-7 text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* Tagline - High Contrast and Uppercase for Impact */}
            <motion.p
              className="text-lg font-bold uppercase tracking-widest mb-4"
              style={{ color: primaryColor }}
              variants={itemVariants}
            >
              {tagline || 'Crafting Exceptional Digital Experiences'}
            </motion.p>

            {/* Main Title - Large and Dynamic Coloring */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8"
              variants={itemVariants}
            >
              {renderHeadline(headline, primaryColor)}
            </motion.h1>

            {/* Trust Signals (Embedded for Credibility) */}
            <motion.div
              className="mb-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-gray-700 dark:text-gray-300"
              variants={itemVariants}
            >
              {reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {/* Star Rating Render */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 transition-colors duration-300 ${i < Math.floor(roundedRating) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
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
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold">
                    Awarded: {awardsData[0]?.name}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Call-to-Action Buttons - Prominent and Clear */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              variants={itemVariants}
            >
              {/* Primary CTA */}
              <Link
                href="#contact"
                className="inline-flex items-center gap-3 text-base font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-primary/50"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                <BoltIcon className="w-5 h-5" />
                Start a Project
              </Link>
              
              {/* Secondary CTA */}
              <Link
                href="#portfolio"
                className="inline-flex items-center gap-3 text-base font-semibold px-8 py-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105"
                style={{
                  backgroundColor: 'transparent',
                  color: primaryColor,
                  border: `2px solid ${primaryColor}`,
                }}
              >
                <ArrowRightIcon className="w-5 h-5" />
                View Portfolio
              </Link>
            </motion.div>

          </motion.div>

          {/* RIGHT: Visual Element (40% width on large screens) */}
          <motion.div
            className="lg:col-span-5 hidden lg:flex justify-center relative mt-12 lg:mt-0"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative w-full max-w-lg aspect-square">
              {/* This container gives the image a subtle, engaging 3D card effect */}
              <div 
                className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-in-out"
                style={{
                    boxShadow: `0 25px 50px -12px ${primaryColor}50, 0 8px 15px -3px ${primaryColor}50`,
                }}
              >
                <Image
                  src={productImageUrl}
                  loader={imageLoader}
                  alt="Featured Product or Service Visual"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </motion.div>

        </div>
        {/* Scroll Indicator */}
        <motion.div 
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
        >
            <ArrowDownIcon className="w-6 h-6 text-gray-400 animate-bounce" />
        </motion.div>

      </section>
    </AnimatePresence>
  );
}