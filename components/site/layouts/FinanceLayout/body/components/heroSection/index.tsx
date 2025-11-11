"use client";

import React from "react";
import { motion } from "framer-motion";
import { HeroSlide } from "@/types/typings";

// --- SVG Icons (updated for light mode) ---
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 ml-3">
    <path
      fillRule="evenodd"
      d="M3 12a.75.75 0 01.75-.75h12.564l-4.78-4.78a.75.75 0 111.06-1.06l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06l4.78-4.78H3.75A.75.75 0 013 12z"
      clipRule="evenodd"
    />
  </svg>
);
const iconClass = "h-6 w-6 mr-3 text-blue-600"; // new shared light color

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={iconClass}>
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.75 5.25a.75.75 0 00-1.5 0v4.286l-2.062 2.062a.75.75 0 101.06 1.06L12 12.312l1.5-1.5V7.5z"
      clipRule="evenodd"
    />
  </svg>
);
const CurrencyDollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={iconClass}>
    <path d="M11.666 4.475a.75.75 0 01.668 0l7.5 4.5a.75.75 0 010 1.25l-7.5 4.5a.75.75 0 01-.668 0L4.166 10.25a.75.75 0 010-1.25l7.5-4.5Z" />
    <path
      fillRule="evenodd"
      d="M19.166 10.75l-7.5 4.5a.75.75 0 01-.668 0L4.166 10.75V19.5a.75.75 0 00.75.75h14.25a.75.75 0 00.75-.75v-8.75Zm-5.352 1.332 3.144 1.886a.75.75 0 010 1.25l-3.144 1.886a.75.75 0 01-.668 0l-3.144-1.886a.75.75 0 010-1.25l3.144-1.886a.75.75 0 01.668 0Z"
      clipRule="evenodd"
    />
  </svg>
);
const LightBulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={iconClass}>
    <path d="M12 14.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    <path
      fillRule="evenodd"
      d="M5.875 12a6.125 6.125 0 1112.25 0 6.125 6.125 0 01-12.25 0zM12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
      clipRule="evenodd"
    />
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className={iconClass}>
    <path d="M12 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    <path
      fillRule="evenodd"
      d="M12 1.5a.75.75 0 01.75-.75h8.25a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75H14.5a3.75 3.75 0 00-7.5 0H2.25a.75.75 0 01-.75-.75V1.5a.75.75 0 01.75-.75h8.25a.75.75 0 01.75.75z"
      clipRule="evenodd"
    />
  </svg>
);

// --- Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "backOut" } },
};

interface HeroSectionProps {
  heroSlides?: HeroSlide[] | null;
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  } | null;
}

const HeroSection = ({ heroSlides, themeSettings }: HeroSectionProps) => {
  const activeHeroSlide = heroSlides?.[0];
  const headline =
    activeHeroSlide?.headline || "Your Trusted Partner in Finance & Legal Matters";
  const subline =
    activeHeroSlide?.subline ||
    "Navigating complex financial and legal landscapes with clarity, expertise, and personalized solutions.";
  const ctaText = activeHeroSlide?.ctaText || "Get a Free Consultation";
  const ctaLink = activeHeroSlide?.ctaLink || "/contact";
  const imageUrl =
    activeHeroSlide?.imageUrl ||
    activeHeroSlide?.productImageUrl ||
    "https://placehold.co/1920x1080/EBF2FF/1E3A8A?text=Finance+%26+Legal";

  const primary = themeSettings?.primaryColor || "#EFF6FF";
  const secondary = themeSettings?.secondaryColor || "#DBEAFE";

  return (
    <section
      className="relative overflow-hidden font-sans text-gray-900 py-24 sm:py-32 lg:py-40 "
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <img
          src={imageUrl}
          alt="background pattern"
          className="object-cover w-full h-full"
          style={{ mixBlendMode: "soft-light" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center md:text-left"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-gray-900"
            >
              {headline}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl mb-8 text-gray-700 leading-relaxed"
            >
              {subline}
            </motion.p>
            <motion.a
              variants={itemVariants}
              href={ctaLink}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-md transform hover:scale-105"
            >
              {ctaText}
              <ArrowRightIcon />
            </motion.a>

            {/* Features */}
            <motion.div
              variants={containerVariants}
              className="mt-12 grid grid-cols-2 sm:grid-cols-2 gap-6 text-sm sm:text-base"
            >
              <motion.div variants={iconVariants} className="flex items-center text-gray-800">
                <ScaleIcon />
                Expert Legal Counsel
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-gray-800">
                <CurrencyDollarIcon />
                Strategic Financial Planning
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-gray-800">
                <LightBulbIcon />
                Innovative Solutions
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-gray-800">
                <UsersIcon />
                Client-Centric Approach
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
