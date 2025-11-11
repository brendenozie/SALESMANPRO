'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { StarIcon, TrophyIcon, RocketLaunchIcon } from '@heroicons/react/24/solid'; // Added Rocket for more action
import { Award, Testimonial } from '@/types/typings'; 

// --- ANIMATION VARIANTS (Optimized for Punchy Reveal) ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Faster stagger for 'punch'
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 }, // Less movement for subtlety
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 120, // Tighter spring
      damping: 18,
    },
  },
};

const visualVariants = {
  hidden: { opacity: 0, scale: 0.8, rotate: -5 }, // Scale in with a slight rotation
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
      delay: 0.3, // Give text a head start
      duration: 0.8,
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
      // Standard part
      // Use a strong, dark color for maximum contrast in light mode
      return <span key={idx} className="text-gray-900">{part}</span>; 
    }
  });
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // Ensure this returns a valid URL string
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
    imageUrl?: string | undefined | null; // Generic background/visual
    productImageUrl?: string | undefined | null; // Distinct visual element (product image)
  }[];
  testimonials: Testimonial[] | undefined | null;
  awards: Award[] | undefined | null;
}

export default function SecurityHeroSectionLight({ name, themeSettings, tagline, heroSlides, testimonials, awards }: HeroSectionProps) {
  
  // Security firm color defaults (Teal primary, Blue secondary)
  const primaryColor = themeSettings?.primaryColor || '#00A880';
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6';
  
  // Security Focused Default Messaging
  const defaultHeadline = 'Future-Proof Your Business with {accent}Absolute Cyber Protection{/accent}';
  const defaultTagline = '24/7 Threat Intelligence & Rapid Response';
  
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
        
        {/* --- Background Pattern/Abstract Shape (Subtle and Dynamic) --- */}
        <div 
          className="absolute inset-0 opacity-20" // Even more subtle opacity
          aria-hidden="true"
          style={{
            backgroundImage: `url(${visualImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(3px) brightness(1.3) grayscale(0.2)', // Lighten, blur slightly, desaturate a bit
          }}
        />

        {/* Dynamic Accent Element (Cyber security lines) */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-1/2 opacity-10 pointer-events-none"
          style={{ 
            background: `linear-gradient(to bottom left, ${primaryColor}10, transparent)`,
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 0% 50%)', // Abstract shape
          }}
        />

        {/* --- Hero Content Grid (RESTRUCTURED FOR MOBILE: VISUAL FIRST) --- */}
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-16 md:pt-0">
          
          {/* 1. RIGHT: Visual Element (Product Image) - ORDER 1 ON MOBILE, 2 ON DESKTOP */}
          <motion.div
            className="lg:col-span-5 flex justify-center lg:justify-end relative order-1 lg:order-2"
            variants={visualVariants}
            initial="hidden"
            animate="visible"
          >
            {/* The Visual Container */}
            <div className="relative w-full max-w-sm aspect-square">
              {/* Image Styling: Focus on a clean, premium visual */}
              <div 
                className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 ease-in-out hover:shadow-primary/50"
                style={{
                  backgroundColor: 'white',
                  border: `8px solid ${secondaryColor}cc`, // Thicker, vibrant border
                  transform: 'rotate(-3deg) scale(1.05)', // Tilt for dynamism
                  // Subtle glow/depth for a captivating look
                  boxShadow: `0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 10px ${secondaryColor}10`,
                }}
              >
                <Image
                  src={distinctVisualUrl}
                  loader={imageLoader}
                  alt="Abstract Digital Shield or Network Visual"
                  fill
                  priority
                  className="object-cover object-center p-8 opacity-95 transition-all duration-500 hover:scale-105" // Hover for extra engagement
                  sizes="(max-width: 1024px) 80vw, 40vw"
                /> 
              </div>
            </div>
          </motion.div>

          {/* 2. LEFT: Text Content & CTAs - ORDER 2 ON MOBILE, 1 ON DESKTOP */}
          <motion.div
            className="lg:col-span-7 text-center lg:text-left order-2 lg:order-1 pt-12 lg:pt-0" 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* Tagline - High Contrast and Uppercase for Impact */}
            <motion.p
              className="text-lg font-bold uppercase tracking-widest mb-3 text-gray-600"
              style={{ color: primaryColor }} // Primary accent color
              variants={itemVariants}
            >
              {tagline || defaultTagline}
            </motion.p>

            {/* Main Title - Large and Dynamic Coloring */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
              variants={itemVariants}
            >
              {renderHeadlineWithAccent(headline, secondaryColor)}
            </motion.h1>
            
            {/* Subtitle/Description (Default text for flow) */}
            <motion.p
              className="text-xl text-gray-700 max-w-xl mx-auto lg:mx-0 mb-8"
              variants={itemVariants}
            >
              We deliver continuous, intelligent cybersecurity solutions to protect your most valuable assets from the evolving threat landscape. **Secure Your Future, Today.**
            </motion.p>

            {/* Trust Signals - Clear and Concise */}
            <motion.div
              className="mb-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-gray-700"
              variants={itemVariants}
            >
              {reviewCount > 0 && (
                <div className="flex items-center gap-2 bg-white/70 p-2 rounded-full shadow-md">
                  <div className="flex gap-0.5">
                    {/* Star Rating Render - Darker for Light BG */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 transition-colors duration-300 ${i < Math.floor(roundedRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {averageRating.toFixed(1)}/5
                  </span>
                  <span className="text-sm hidden sm:inline">
                    ({reviewCount} verified reviews)
                  </span>
                </div>
              )}
              {awardsData.length > 0 && (
                <div className="flex items-center gap-2 bg-white/70 p-2 rounded-full shadow-md">
                  <TrophyIcon className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Industry Award Winner
                  </span>
                </div>
              )}
            </motion.div>

            {/* Call-to-Action Buttons - Prominent and Clear */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              variants={itemVariants}
            >
              {/* Primary CTA (Assessment/Contact) - Highly Visibile */}
              <Link
                href="#contact"
                className="inline-flex items-center gap-3 text-lg font-extrabold px-8 py-4 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:opacity-95 text-white whitespace-nowrap"
                style={{ 
                    backgroundColor: primaryColor, 
                    boxShadow: `0 8px 25px -5px ${primaryColor}90`,
                }} 
              >
                <ShieldCheckIcon className="w-6 h-6" />
                Get a Free Security Audit
              </Link>
              
              {/* Secondary CTA (Explore/Services) - Clean Outline */}
              <Link
                href="#services"
                className="inline-flex items-center gap-3 text-lg font-bold px-8 py-4 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100 whitespace-nowrap"
                style={{
                  backgroundColor: 'transparent',
                  color: secondaryColor, 
                  border: `2px solid ${secondaryColor}`,
                }}
              >
                <RocketLaunchIcon className="w-6 h-6" />
                Explore Our Services
              </Link>
            </motion.div>

          </motion.div>

        </div>
        
        {/* Scroll Indicator - Kept, great for intuition */}
        <motion.div 
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
            <ArrowDownIcon className="w-6 h-6 text-gray-500" />
        </motion.div>

      </section>
    </AnimatePresence>
  );
}