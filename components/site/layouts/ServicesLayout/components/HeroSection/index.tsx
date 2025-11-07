'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { HeroSlide } from "@/types/typings";

// Local banners as fallback
import bannerLaundry from "@/assets/homebanner.png";

// --- HeroSection Component ---
export default function HeroSection({
  storeFormData,
  heroSlides,
}: {
  storeFormData: any;
  heroSlides?: HeroSlide[];
}) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Fallback data (unchanged)
  const defaultStoreData = {
    slug: "your-business",
    name: "Your Life.",
    description: "Effortless solutions for your everyday needs.",
    themeSettings: {
      primaryColor: "#43A047",
      secondaryColor: "#FFB300",
    },
    storeCategories: [
      {
        id: "cat1",
        name: "Washing & Laundry",
        shortDescription: "Fresh clothes, delivered clean.",
        banner: bannerLaundry.src,
        slug: "laundry",
      },
    ],
  };

  const currentStoreData = storeFormData || defaultStoreData;
  const { slug, name, description, themeSettings, storeCategories } =
    currentStoreData;

  // Ensure theme colors are high-contrast defaults
  const primaryColor = themeSettings?.primaryColor ?? "#4CAF50"; 
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107"; 

  // Use first hero slide if available
  const firstSlide =
    heroSlides && heroSlides.length > 0
      ? heroSlides[0]
      : {
        productImageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
          imageUrl:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
          headline: name,
          subline: "Simplified.",
          badgeText: description,
          ctaText: "Explore Services",
          ctaLink: `/${slug}/services`,
        };

  const activeCategory = storeCategories
    ? storeCategories[activeCategoryIndex]
    : null;

  // Animation variants (same)
  const contentVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { staggerChildren: 0.1, duration: 0.8, ease: "easeOut" },
    },
  };

  const wordReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const imageFade = {
    initial: { opacity: 0, scale: 1.05 },
    animate: { opacity: 1, scale: 1, transition: { duration: 1.5, ease: "easeInOut" } },
    exit: { opacity: 0, transition: { duration: 1, ease: "easeInOut" } },
  };

  const dynamicTextFade = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col items-stretch overflow-hidden bg-gray-50 text-gray-900">
      
      {/* 1. Updated Background Shape for better contrast */}
      <div
        className="absolute top-0 right-0 w-3/4 h-full hidden lg:block"
        style={{
          // Increased opacity on secondary color for more visual presence
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor}66 100%)`, 
          clipPath: "polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      ></div>

      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row items-stretch">
        {/* Left: Hero Image */}
        <div className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={firstSlide.productImageUrl||firstSlide.imageUrl}
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${firstSlide.productImageUrl||firstSlide.imageUrl})`,
                backgroundSize: "cover",
              }}
              variants={imageFade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* 2. Subtle Dark Vignette Added for Depth */}
              <motion.div
                className="absolute inset-0"
                style={{
                  // Gentle radial gradient for a high-end photo feel
                  background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.15) 100%)',
                }}
              ></motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right: Content */}
       {/* Right: Content - Optimized for Contrast and Hierarchy */}
<div className="relative w-full lg:w-1/2 p-8 md:p-14 lg:py-40 lg:px-16 flex flex-col justify-center text-center lg:text-left">
    
    <motion.div
        className="flex flex-col items-center lg:items-start"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
    >
        {/* 1. Introductory Badge/Tag (Optional, but adds structure) */}
        <motion.p
            className="mb-4 inline-block px-4 py-1.5 text-sm font-semibold rounded-full bg-black/5 text-gray-800 tracking-wider uppercase" 
            variants={wordReveal}
        >
            {firstSlide.badgeText || description}
        </motion.p>

        {/* 2. H1: Main Headline (The punchiest phrase, now in high-contrast dark text) */}
        <motion.h1
            // Use the dark color seen in your image for maximum contrast
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tighter text-gray-900" 
            variants={wordReveal}
        >
            {firstSlide.headline}
        </motion.h1>

        {/* 3. H2: Dynamic Subline (Service Name or secondary benefit) - Uses the bright primary color */}
        <AnimatePresence mode="wait">
            {/* <motion.h2
                key={firstSlide.subline}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mt-4" 
                style={{
                    // Use the Primary Color (the bright orange/yellow) for this text
                    color: primaryColor, 
                }}
                variants={dynamicTextFade}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                {firstSlide.subline || "Schedule Your Pickup Today"}
            </motion.h2> */}

        {/* 4. Paragraph/Description - Now dark and highly readable */}
        <motion.p
            key={firstSlide.subline}
                // className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mt-4" 
                // style={{
                //     // Use the Primary Color (the bright orange/yellow) for this text
                //     color: primaryColor, 
                // }}
                // variants={dynamicTextFade}
                initial="initial"
                animate="animate"
                exit="exit"
            className="mt-8 text-xl max-w-xl font-medium text-gray-800 leading-relaxed" 
            variants={wordReveal}
        >
            {/* The original descriptive text, now legible: */}
            {/* Enjoy crisp, clean clothes without lifting a finger. **Schedule your pickup and get them back same day.** */}
            {firstSlide.subline || "Schedule Your Pickup Today"}
        </motion.p>
        
        </AnimatePresence>

        {/* 5. CTA Buttons - Clean, high-impact button retained */}
        <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-5 sm:gap-7"
            variants={wordReveal}
        >
            <Link href={firstSlide.ctaLink || `/${slug}/services`}>
                <motion.button
                    className="w-full sm:w-auto px-10 py-5 font-bold rounded-xl text-lg shadow-2xl transition-all duration-300" 
                    style={{
                        background: primaryColor,
                        color: "white",
                    }}
                    whileHover={{ 
                        scale: 1.05, 
                        boxShadow: `0 15px 30px -5px ${primaryColor}77, 0 4px 6px -4px ${primaryColor}4D` 
                    }}
                >
                    {firstSlide.ctaText || "Book a Pickup"}
                </motion.button>
            </Link>
        </motion.div>
    </motion.div>
</div>
      </div>

      {/* Scroll Down Indicator (Unchanged) */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-600 animate-bounce hidden md:block"
        initial={{ y: -10 }}
        animate={{ y: 10 }}
        transition={{ y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
      >
        <ChevronDownIcon className="w-8 h-8" />
      </motion.div>
    </section>
  );
}