'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { StarIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { Award, Testimonial } from '@/types/typings';

// --- ANIMATION VARIANTS (Optimized) ---

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
      stiffness: 80,
      damping: 15,
      duration: 0.5,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      delay: 0.4, // Slightly delayed reveal
    },
  },
};

// --- UTILITY FUNCTIONS ---

const renderHeadlineWithAccent = (text: string, accentColor: string) => {
  const parts = text.split(/\{accent\}(.*?)\{\/accent\}/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      return (
        <span key={idx} style={{ color: accentColor }} className="drop-shadow-sm font-extrabold">
          {part}
        </span>
      );
    } else {
      // Ensure excellent contrast on the light background
      return <span key={idx} className="text-gray-900">{part}</span>; 
    }
  });
};

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Component Start ---

// --- NEW UTILITY FUNCTION ---
const renderTaglineWithAccent = (text: string, accentColor: string) => {
  const parts = text.split(/\{accent\}(.*?)\{\/accent\}/g);
  return parts.map((part, idx) => {
    if (idx % 2 === 1) {
      // Accent part (Primary Color)
      return (
        <span key={idx} style={{ color: accentColor }} className="drop-shadow-sm">
          {part}
        </span>
      );
    } else {
      // Standard part (Inherits text-gray-600 from parent)
      // We don't need a specific color class here as the parent motion.p sets it
      return <span key={idx}>{part}</span>;
    }
  });
};

// --- NEW UTILITY FUNCTION ---

/**
 * Splits the text by '**' and applies the accentColor to the content inside the asterisks.
 * The standard parts inherit the parent's color (text-gray-600).
 */
const renderTaglineWithBold = (text: string, accentColor: string) => {
  // Regex to split by '**' while keeping the delimiter in the result array (though we discard it)
  // For simplicity, we just split and assume alternating parts are the bold content.
  const parts = text.split(/\*\*(.*?)\*\*/g); 
  
  return parts.map((part, idx) => {
    // If the index is odd (1, 3, 5...), it's the text that was inside the **...**
    if (idx % 2 !== 0) { 
      return (
        <span 
          key={idx} 
          style={{ color: accentColor }} 
          className="drop-shadow-sm font-extrabold" // Adding bold font weight for emphasis
        >
          {part}
        </span>
      );
    } else {
      // If the index is even (0, 2, 4...), it's the standard text.
      return <span key={idx}>{part}</span>;
    }
  });
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
    imageUrl?: string | undefined | null; // Placeholder for abstract visual background
    productImageUrl?: string | undefined | null; // Placeholder for main visual (e.g., security guard)
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

  // Visual Image for the background (now used for the code overlay texture)
  const visualImageUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse"><path fill="%23e5e7eb" d="M0 0h1v10h-1zM0 0h10v1h-10zM0 9h10v1h-10zM9 0h1v10h-1z"/></pattern></defs><rect width="100" height="100" fill="url(%23g)"/></svg>';

  // Distinct Visual Element (The Security Professional/Guard)
  const distinctVisualUrl = heroSlides[0]?.productImageUrl || 'https://images.unsplash.com/photo-1544455589-cf77d8538600?q=80&w=1200&h=1600&fit=crop';

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
        // Increased min-height for more commanding presence
        className="relative flex items-center min-h-[90vh] py-28 md:py-36 px-6 lg:px-12 bg-gray-50 overflow-hidden" 
      >
        
        {/* --- Dynamic Background: Subtle Code/Circuit Overlay --- */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${visualImageUrl})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '100px 100px', // Smaller pattern for density
          }}
        />

        {/* Dynamic Accent Element (Subtle shape) */}
        <div 
          className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at 80% 20%, ${secondaryColor}, transparent 70%)`,
          }}
        />

        {/* --- Hero Content Grid: Asymmetric 7/5 Split --- */}
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT: Text Content, CTAs, & Trust (order-2/order-1) */}
          <motion.div
            className="lg:col-span-7 text-center lg:text-left order-2 lg:order-1 pt-12 lg:pt-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            {/* Tagline - High Contrast and Uppercase for Impact */}
            <motion.p
              className="text-lg font-bold uppercase tracking-widest mb-4 text-gray-600"
              variants={itemVariants}
            >
              {renderTaglineWithBold(tagline || defaultTagline, primaryColor)}
            </motion.p>

            {/* Main Title - Large and Dynamic Coloring */}
            <motion.h1
              className="text-4xl md:text-6xl lg:text-[4.5rem] font-extrabold leading-tight mb-8"
              variants={itemVariants}
            >
              {renderTaglineWithBold(headline, secondaryColor)}
            </motion.h1>
            
            {/* Subtitle/Description */}
            <motion.p
              className="text-xl text-gray-700 max-w-xl mx-auto lg:mx-0 mb-10"
              variants={itemVariants}
            >
              We deliver continuous, intelligent cybersecurity solutions to protect your most valuable assets from the evolving threat landscape.
            </motion.p>
            
            {/* Call-to-Action Buttons - Prominent and Clear */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10"
              variants={itemVariants}
            >
              {/* Primary CTA (Assessment/Contact) - Max Authority */}
              <Link
                href="#contact"
                className="inline-flex items-center gap-3 text-lg font-extrabold px-10 py-5 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl text-white w-full sm:w-auto justify-center" 
                style={{ 
                  backgroundColor: primaryColor, 
                  boxShadow: `0 8px 30px -5px ${primaryColor}80`, // Deeper shadow
                }} 
              >
                <ShieldCheckIcon className="w-6 h-6" />
                Start Your Free Assessment
              </Link>
              
              {/* Secondary CTA (Services/Explore) - Outline Style */}
              <Link
                href="#services"
                className="inline-flex items-center gap-3 text-lg font-semibold px-10 py-5 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:bg-gray-100 w-full sm:w-auto justify-center"
                style={{
                  backgroundColor: 'transparent',
                  color: secondaryColor,
                  border: `2px solid ${secondaryColor}`,
                }}
              >
                <ArrowRightIcon className="w-5 h-5" />
                Explore Services
              </Link>
            </motion.div>

            {/* Trust Signals (Embedded for Credibility) - Moved to be under CTAs */}
            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-gray-700 mx-auto lg:mx-0 max-w-fit"
              variants={itemVariants}
            >
              {reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(roundedRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {averageRating.toFixed(1)}/5
                  </span>
                  <span className="text-sm hidden md:inline text-gray-600">
                    ({reviewCount} verified reviews)
                  </span>
                </div>
              )}
              {awardsData.length > 0 && (
                <div className="flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-bold text-gray-700">
                    Awarded: {awardsData[0]?.name}
                  </span>
                </div>
              )}
            </motion.div>

          </motion.div>

          {/* RIGHT: Visual Element (Image of Security Professional) */}
          <motion.div
            className="lg:col-span-5 flex justify-center lg:justify-end relative mt-12 lg:mt-0 order-1 lg:order-2"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Framed Visual Container - Asymmetric Aspect Ratio on Large Screens */}
            <div className="relative w-full max-w-xs md:max-w-md lg:w-[350px] aspect-[3/5]"> 
              <div 
                className="absolute inset-0 overflow-hidden  transition-all duration-500 ease-in-out hover:scale-[1.03] z-10"
              >
                <Image
                  src={distinctVisualUrl}
                  loader={imageLoader}
                  // **Updated Alt Text**
                  alt="Professional Security Guard or Cyber Security Expert" 
                  fill
                  priority
                  className="object-cover object-center" // Use object-cover for professional portrait
                  sizes="(max-width: 1024px) 100vw, 350px"
                /> 
              </div>
              {/* Decorative Offset Border (Primary Color) */}
              <div 
                className="absolute inset-0 z-0 transition-all duration-500"
                style={{ 
                    // borderColor: primaryColor,
                    // Offset frame effect
                    transform: 'translate(16px, 16px)', 
                    opacity: 0.8,
                }}
              />
            </div>
          </motion.div>
          
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut', delay: 1 }}
        >
          <ArrowRightIcon className="w-6 h-6 text-gray-500 rotate-90 animate-bounce" />
        </motion.div>

      </section>
    </AnimatePresence>
  );
}