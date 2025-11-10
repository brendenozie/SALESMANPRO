'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, ArrowRightIcon, ArrowDownIcon } from '@heroicons/react/24/solid'; // Using solid icons for punch
import { ClockIcon } from '@heroicons/react/24/outline'; // New icon for response time
import { StarIcon, TrophyIcon } from '@heroicons/react/24/solid'; 
import { Award, Testimonial } from '@/types/typings'; 

// --- ANIMATION VARIANTS (Optimized for Light Mode reveal) ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, 
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 }, 
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring', 
      stiffness: 80, // Softer spring for subtle feel
      damping: 15,
      duration: 0.5,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: 50 }, // Animate from right for the visual element
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      delay: 0.5, 
    },
  },
};

// --- UTILITY FUNCTIONS ---

// Updated renderHeadline to use dark base text color for Light Mode
function renderHeadline(headline: string, primaryColor: string) {
  const words = headline.split(' ');
  if (words.length <= 1) {
    return <span className="text-gray-900">{headline}</span>;
  }
  const lastWord = words.pop();
  return (
    <>
      <span className="text-gray-900">{words.join(' ')}</span>{' '}
      <span style={{ color: primaryColor }} className="drop-shadow-sm">
        {lastWord}
      </span>
    </>
  );
}

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Component Start ---

interface HeroSectionProps {
  name: string | undefined | null;
  themeSettings: {
    primaryColor?: string;
    secondaryColor?: string;
  } | undefined | null;
  tagline?: string | undefined | null;
  heroSlides: {
    headline?: string | undefined | null;
    imageUrl?: string | undefined | null; // Used for generic background/visual
    productImageUrl?: string | undefined | null; // Renamed to visualImageUrl for context
  }[];
  testimonials: Testimonial[] | undefined | null;
  awards: Award[] | undefined | null;
}

export default function SecurityHeroSectionLight({ name, themeSettings, tagline, heroSlides, testimonials, awards }: HeroSectionProps) {
  
  // Security firm color defaults (Teal primary, Blue secondary)
  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6';
  
  // Security Focused Default Messaging
  const defaultHeadline = 'Proactive Cyber Defense in a {accent}Complex World{/accent}';
  const defaultTagline = 'Global Intelligence. Local Action. Absolute Protection.';
  
  const headline = heroSlides[0]?.headline || defaultHeadline;
  
  // Abstract background for light mode
  const visualImageUrl = heroSlides[0]?.imageUrl || 'https://images.unsplash.com/photo-1541701490263-8822ab1a09d3?q=80&w=1400&h=700&fit=crop'; 
  
  // Use a different placeholder for the distinct visual element
  const distinctVisualUrl = heroSlides[0]?.productImageUrl || '/placeholder-security-shield.png'; 

  const validTestimonials: Testimonial[] = Array.isArray(testimonials) ? testimonials.filter(t => typeof t.rating === 'number') : [];
  const reviewCount = validTestimonials.length;
  const averageRating =
    reviewCount > 0
      ? validTestimonials.reduce((sum, t) => sum + (typeof t.rating === 'number' ? t.rating : 0), 0) / reviewCount
      : 0;
  const roundedRating = Math.round(averageRating * 2) / 2;
  const awardsData: Award[] = Array.isArray(awards) && awards.length > 0 ? awards : [];
  
  // Helper to correctly handle {accent} text replacement
  const renderHeadlineWithAccent = (text: string, accentColor: string) => {
    const parts = text.split(/\{accent\}(.*?)\{\/accent\}/g);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        // Accent part
        return (
          <span key={idx} style={{ color: accentColor }}>
            {part}
          </span>
        );
      } else {
        // Standard part
        return <span key={idx} className="text-gray-900">{part}</span>;
      }
    });
  };

  return (
    <AnimatePresence>
      <section
        id="hero"
        className="relative flex items-center min-h-screen py-24 md:py-32 px-6 lg:px-12 bg-gray-50 overflow-hidden" // Light Mode BG
      >
        
        {/* --- Background Pattern/Abstract Shape (Light/Subtle) --- */}
        <div 
          className="absolute inset-0 opacity-30 " // Very subtle opacity
          aria-hidden="true"
          style={{
            backgroundImage: `url(${visualImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: ' blur(5px) brightness(1.5)', // Lighten and desaturate
            // clipPath: 'polygon(0 0, 100% 0, 100% 80%, 0 100%)', // Subtle diagonal pattern
          }}
        />

        {/* Dynamic Accent Element (Subtle, professional line/shape) */}
        <div 
          className="absolute bottom-0 left-0 w-full h-1/2 opacity-5 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at 10% 90%, ${secondaryColor}, transparent 70%)`,
          }}
        />

        {/* --- Hero Content Grid --- */}
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-20 md:pt-0">
          
          {/* LEFT: Text Content & CTAs (60% width on large screens) */}
          <motion.div
            className="lg:col-span-7 text-center lg:text-left" 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* Tagline - High Contrast and Uppercase for Impact */}
            <motion.p
              className="text-lg font-bold uppercase tracking-widest mb-4 text-gray-600"
              style={{ color: primaryColor }} // Primary accent color
              variants={itemVariants}
            >
              {tagline || defaultTagline}
            </motion.p>

            {/* Main Title - Large and Dynamic Coloring */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8"
              variants={itemVariants}
            >
              {renderHeadlineWithAccent(headline, secondaryColor)}
            </motion.h1>
            
            {/* Subtitle/Description (Default text for flow) */}
            <motion.p
                className="text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 mb-8"
                variants={itemVariants}
            >
                We deliver continuous, intelligent cybersecurity solutions to protect your most valuable assets from the evolving threat landscape.
            </motion.p>

            {/* Trust Signals (Embedded for Credibility) */}
            <motion.div
              className="mb-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-gray-700"
              variants={itemVariants}
            >
              {reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {/* Star Rating Render - Darker for Light BG */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 transition-colors duration-300 ${i < Math.floor(roundedRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {averageRating.toFixed(1)}/5
                  </span>
                  <span className="text-sm">
                    ({reviewCount} verified reviews)
                  </span>
                </div>
              )}
              {awardsData.length > 0 && (
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">
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
              {/* Primary CTA (Assessment/Contact) */}
              <Link
                href="#contact"
                className="inline-flex items-center gap-3 text-base font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:opacity-90 text-white"
                style={{ 
                    backgroundColor: primaryColor, 
                    boxShadow: `0 4px 15px -3px ${primaryColor}60`,
                }} 
              >
                <ShieldCheckIcon className="w-5 h-5" />
                Start Your Free Assessment
              </Link>
              
              {/* Secondary CTA (Services/Explore) */}
              {/* <Link
                href="#services"
                className="inline-flex items-center gap-3 text-base font-semibold px-8 py-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100"
                style={{
                  backgroundColor: 'transparent',
                  color: secondaryColor, // Use secondary color for text
                  border: `2px solid ${secondaryColor}`,
                }}
              >
                <ClockIcon className="w-5 h-5" />
                Check Our Response Time
              </Link> */}
            </motion.div>

          </motion.div>

          {/* RIGHT: Visual Element (40% width on large screens) */}
          <motion.div
            className="lg:col-span-5 hidden lg:flex justify-end relative mt-12 lg:mt-0"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative w-full max-w-xl aspect-square">
              {/* Security Shield / Network Illustration */}
              <div 
                className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out"
                style={{
                    backgroundColor: 'white',
                    border: `5px solid ${secondaryColor}`,
                    // Subtle 3D effect suitable for light mode
                    boxShadow: `0 20px 40px -10px rgba(0,0,0,0.15), 0 10px 20px -5px rgba(0,0,0,0.05)`,
                }}
              >
                <Image
                  src={distinctVisualUrl}
                  loader={imageLoader}
                  alt="Abstract Digital Shield or Network Visual"
                  fill
                  priority
                  className="object-cover object-center p-8 opacity-90" // Padding for the border/background
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
            <ArrowDownIcon className="w-6 h-6 text-gray-500 animate-bounce" />
        </motion.div>

      </section>
    </AnimatePresence>
  );
}