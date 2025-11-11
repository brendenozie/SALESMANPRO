'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, ArrowDownIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Keeping only used icons for cleanliness
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
  hidden: { opacity: 0, scale: 0.9, x: 0 }, // Subtle scale and no x-offset for mobile
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      delay: 0.3, // Reduced delay for faster initial load
    },
  },
};

// --- UTILITY FUNCTIONS ---

// Helper to correctly handle {accent} text replacement (Kept this, it's good)
const renderHeadlineWithAccent = (text: string, accentColor: string) => {
  const parts = text.split(/\{accent\}(.*?)\{\/accent\}/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      // Accent part
      return (
        <span key={idx} style={{ color: accentColor }} className="drop-shadow-sm">
          {part}
        </span>
      );
    } else {
      // Standard part - ensure strong contrast with white/light background
      return <span key={idx} className="text-gray-900">{part}</span>;
    }
  });
};

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
    imageUrl?: string | undefined | null; 
    productImageUrl?: string | undefined | null; 
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
  
  return (
    <AnimatePresence>
      <section
        id="hero"
        className="relative flex items-center min-h-screen py-24 md:py-32 px-6 lg:px-12 bg-gray-50 overflow-hidden" // Light Mode BG
      >
        
        {/* --- Background Pattern/Abstract Shape (Light/Subtle) --- */}
        <div 
          className="absolute inset-0 opacity-20" // Reduced opacity slightly for better contrast with text
          aria-hidden="true"
          style={{
            backgroundImage: `url(${visualImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: ' blur(5px) brightness(1.6)', // Increased brightness for lighter, softer feel
          }}
        />

        {/* Dynamic Accent Element (Subtle, professional line/shape) */}
        <div 
          className="absolute bottom-0 left-0 w-full h-1/2 opacity-5 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at 10% 90%, ${secondaryColor}, transparent 70%)`,
          }}
        />

        {/* --- Hero Content Grid (Mobile Reordered) --- */}
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-20 md:pt-0">
          
          {/* RIGHT: Visual Element (Now ORDER-1 on mobile) */}
          <motion.div
            // **CHANGE 1: Make visible on mobile (remove hidden/flex) and use order utilities**
            className="lg:col-span-5 flex justify-center lg:justify-end relative mt-12 lg:mt-0 order-1 lg:order-2" 
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative w-full max-w-sm aspect-square"> 
              {/* **CHANGE 2: Mobile visual appeal adjustments** */}
              <div 
                className="absolute inset-0 rounded-3xl overflow-hidden transition-all duration-500 ease-in-out hover:scale-105" // Added hover scale
                style={{
                    backgroundColor: 'white',
                    border: `5px solid ${secondaryColor}`,
                    // Enhanced Shadow for more depth on mobile/light mode
                    boxShadow: `0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 5px ${primaryColor}10`,
                }}
              >
                <Image
                  src={distinctVisualUrl}
                  loader={imageLoader}
                  alt="Abstract Digital Shield or Network Visual"
                  fill
                  priority
                  className="object-contain object-center p-8 opacity-95" // Use object-contain to ensure placeholder image isn't cropped weirdly
                  sizes="(max-width: 1024px) 80vw, 50vw" // Better size definition for mobile
                /> 
              </div>
            </div>
          </motion.div>

          {/* LEFT: Text Content & CTAs (Now ORDER-2 on mobile) */}
          <motion.div
            // **CHANGE 3: Use order-2 on mobile**
            className="lg:col-span-7 text-center lg:text-left order-2 lg:order-1 pt-12 lg:pt-0" 
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
              // **CHANGE 4: Reduced font size slightly on mobile for better fit**
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8"
              variants={itemVariants}
            >
              {renderHeadlineWithAccent(headline, secondaryColor)}
            </motion.h1>
            
            {/* Subtitle/Description (Default text for flow) */}
            <motion.p
                // **CHANGE 5: Stronger contrast for description text**
                className="text-xl text-gray-700 max-w-xl mx-auto lg:mx-0 mb-8"
                variants={itemVariants}
            >
                We deliver continuous, intelligent cybersecurity solutions to protect your most valuable assets from the evolving threat landscape.
            </motion.p>

            {/* Trust Signals (Embedded for Credibility) */}
            <motion.div
              // **CHANGE 6: Added padding/background to trust signals for mobile clarity**
              className="mb-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-gray-700 bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md mx-auto lg:mx-0 max-w-fit"
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
                  <span className="text-sm hidden sm:inline"> {/* Hidden on tiny mobile screens */}
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
                // **CHANGE 7: Made mobile button full width for better tapping area**
                className="inline-flex items-center gap-3 text-base font-bold px-8 py-4 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:opacity-90 text-white w-full sm:w-auto justify-center" 
                style={{ 
                    backgroundColor: primaryColor, 
                    boxShadow: `0 4px 15px -3px ${primaryColor}60`,
                }} 
              >
                <ShieldCheckIcon className="w-5 h-5" />
                Start Your Free Assessment
              </Link>
              
              {/* Secondary CTA (Services/Explore) - Re-enabled for completeness */}
              <Link
                href="#services"
                // **CHANGE 8: Made mobile button full width for better tapping area**
                className="inline-flex items-center gap-3 text-base font-semibold px-8 py-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 w-full sm:w-auto justify-center"
                style={{
                  backgroundColor: 'transparent',
                  color: secondaryColor, // Use secondary color for text
                  border: `2px solid ${secondaryColor}`,
                }}
              >
                {/* Changed ClockIcon to ArrowRightIcon for more action, kept original but commented out */}
                <ArrowRightIcon className="w-5 h-5" />
                Explore Services
              </Link>
            </motion.div>

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