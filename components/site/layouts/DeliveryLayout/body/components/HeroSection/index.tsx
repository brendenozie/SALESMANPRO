/**
 * HeroSection.jsx
 *
 * This component implements a static, content-focused hero section
 * that matches the provided image layout. It dynamically incorporates
 * data from the first available 'heroSlides' element.
 */
"use client";
import React from "react";
import { motion } from "framer-motion";
import { HeroSlide } from "@/types/typings"; // Ensure this import is correct

// --------------------------------------------------
// 1. MOCK UTILITIES (Adapted for Static Layout)
// --------------------------------------------------

// Utility component for safe image loading and fallback
const SafeImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        // Fallback to a clear placeholder on error
        e.currentTarget.onerror = null; 
        e.currentTarget.src = 'https://placehold.co/600x400/D1D5DB/1F2937?text=Image+Unavailable';
        e.currentTarget.alt = 'Image load error placeholder';
        e.currentTarget.style.objectFit = 'contain'; // Keep placeholder contained
    };
    
    return (
        <img
            src={src}
            alt={alt}
            onError={handleError}
            className={className}
        />
    );
};

// A. Inline Icons (Replaces @heroicons/react)
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
    />
  </svg>
);

interface Props {
  // Accepts the array of slides, but we only use the first one for this static layout
  heroSlides?: HeroSlide[] | null;
  themeSettings?: {
    primaryColor?: string | null | undefined;
    secondaryColor?: string | null | undefined;
  } | null | undefined;
}

// --------------------------------------------------
// 2. HERO CONTENT (Base content and Fallback Images)
// --------------------------------------------------

const IMAGE_HERO_CONTENT = {
  // Default values used if slide data is missing
  badge: "ENHANCE YOUR SKILLS",
  headline: "Master the Art of Public Speaking",
  subline: "Join our specialized training programs designed to build confidence, polish your message, and captivate any audience.",
  ctaText: "GET STARTED",
  ctaLink: "#contact",
  // Placeholder images - These will only be used if the slide's imageUrls are also null
  imageUrl: "https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=2670&auto=format&fit=crop", 
  productImageUrl: "https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=2670&auto=format&fit=crop", 
};

const HeroSection = ({ heroSlides, themeSettings } : Props) => {
  // Use the first slide if it exists, otherwise fall back to IMAGE_HERO_CONTENT for text defaults
  const currentHeroSlide: any = heroSlides?.[0] || {}; 

  // --- Dynamic Content Resolution ---
  const badgeText = currentHeroSlide.badgeText || IMAGE_HERO_CONTENT.badge;
  const headline = currentHeroSlide.headline || IMAGE_HERO_CONTENT.headline;
  const subline = currentHeroSlide.subline || IMAGE_HERO_CONTENT.subline;
  const ctaText = currentHeroSlide.ctaText || IMAGE_HERO_CONTENT.ctaText;
  const ctaLink = currentHeroSlide.ctaLink || IMAGE_HERO_CONTENT.ctaLink;
  
  // Assuming the first slide's imageUrl is the main hero image (used for the wide image on the right)
  const mainImageUrl = currentHeroSlide.imageUrl || IMAGE_HERO_CONTENT.imageUrl;
  // Using a fallback for the secondary image (The tall one on the left) since the HeroSlide type only has one `imageUrl` field.
  const secondaryImageUrl = currentHeroSlide.productImageUrl || IMAGE_HERO_CONTENT.productImageUrl;

  const CTA_BG_COLOR = themeSettings?.primaryColor || "#800000"; // Use theme primary color or default Maroon

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };
  
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 1.0, ease: "easeOut" } },
  };


  return (
    <section 
      id="hero" 
      className="bg-gray-50/70 min-h-screen pt-24 md:pt-32 pb-16 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- 1. Headline & CTA Area (Top Half) --- */}
        <div className="flex justify-between items-start mb-8 lg:mb-12 pt-8">
          
          {/* Text Content */}
          <div className="max-w-4xl">
            <motion.p
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
              className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3"
            >
              {badgeText}
            </motion.p>

            <motion.h1
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight"
            >
              {headline}
            </motion.h1>
          </div>

          {/* Desktop CTA Button */}
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="hidden md:block mt-8"
          >
            <a
              href={ctaLink}
              style={{ backgroundColor: CTA_BG_COLOR }}
              className="inline-flex items-center px-6 py-3 text-base font-bold text-white rounded shadow-lg transition-all duration-300 transform hover:scale-[1.03] hover:shadow-xl"
            >
              {ctaText}
              <ArrowRightIcon className="ml-2" />
            </a>
          </motion.div>
        </div>

        {/* Dynamic Subline/Body Content (Placed between headline and images) */}
        <motion.p
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto sm:mx-0 mb-12"
        >
            {subline}
        </motion.p>

        {/* Mobile CTA (Visible below text on small screens) */}
        <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="md:hidden mb-12"
          >
            <a
              href={ctaLink}
              style={{ backgroundColor: CTA_BG_COLOR }}
              className="inline-flex items-center justify-center  px-6 py-3 text-base font-bold text-white rounded shadow-lg transition-all duration-300 hover:bg-red-800"
            >
              {ctaText}
              <ArrowRightIcon className="ml-2" />
            </a>
          </motion.div>
        
        {/* --- 2. Image Grid Area (Bottom Half) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Left Image */}
  <motion.div
    variants={imageVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay: 0.6 }}
    className="md:col-span-1 h-auto md:h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-gray-400/50 transition-all duration-500 ease-out hover:shadow-3xl hover:scale-[1.02]"
  >
    <SafeImage
      src={secondaryImageUrl}
      alt="Public speaking coach providing guidance"
      className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-[1.03]"
    />
  </motion.div>

  {/* Right Image */}
  <motion.div
    variants={imageVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay: 0.8 }}
    className="md:col-span-2 h-auto md:h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-gray-400/50 transition-all duration-500 ease-out hover:shadow-3xl hover:scale-[1.02]"
  >
    <SafeImage
      src={mainImageUrl}
      alt="Group workshop attendees collaborating"
      className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-[1.03]"
    />
  </motion.div>
</div>


        
      </div>
    </section>
  );
};

export default HeroSection;