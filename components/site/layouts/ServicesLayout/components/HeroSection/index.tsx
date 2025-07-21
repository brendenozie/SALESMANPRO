"use client";

import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useStoreContext } from '@/contexts/StoreContext';

// IMPORTANT: Replace this with a truly high-quality, abstract, or inspiring image.
// Think crisp, clean, slightly out-of-focus background textures, modern home interiors,
// or a dynamic, abstract light pattern. Avoid literal service images for versatility.
import bannerFallback from "@/assets/homebanner.png"; 
import { CogIcon, RssIcon, TvIcon } from "@heroicons/react/24/outline";
import { MapIcon } from "@heroicons/react/20/solid";

// --- ICON PLACEHOLDERS ---
// You MUST replace these with actual, distinct SVG icons for each category.
// Using a "dumbbell" for everything makes it not intuitive.
// Example:
// import laundryIcon from "@/assets/icons/laundry-machine.svg";
// import deliveryIcon from "@/assets/icons/delivery-truck.svg";
// import cookingIcon from "@/assets/icons/chef-hat.svg";
// import cleaningIcon from "@/assets/icons/sparkle.svg";
// import { GiWashingMachine, GiCook, GiDeliveryDrone, GiVacuumCleaner } from 'react-icons/gi'; // Example react-icons


export default function HeroSection() {
  const { storeFormData } = useStoreContext();
  const { scrollYProgress } = useScroll();

  // Parallax effect for the background: more subtle and refined
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-700 dark:text-gray-300 text-lg animate-pulse">Crafting your perfect experience...</p>
      </div>
    );
  }

  const {
    slug,
    bannerUrl,
    name,
    description,
    storeCategories, // array of { id, name, icon, items, sortOrder, visible }
    stats,
    themeSettings,
  } = storeFormData;

  // Utilize the theme colors more dynamically
  const primaryColor = themeSettings?.primaryColor ?? "#2563EB"; // Default Blue
  const secondaryColor = themeSettings?.secondaryColor ?? "#EC4899"; // Default Pink

  // Dynamic icon mapping - essential for intuitiveness
  const getCategoryIcon = (categoryName : any) => {
    switch (categoryName) {
      case "Washing & Laundry": return <TvIcon className="text-4xl lg:text-5xl" />;
      case "Deliveries": return <CogIcon className="text-4xl lg:text-5xl" />;
      case "Cooking & Catering": return <RssIcon className="text-4xl lg:text-5xl" />;
      case "Home Cleaning": return <MapIcon className="text-4xl lg:text-5xl" />;
      // Add more cases for your specific categories
      default: return <svg className="w-10 h-10 lg:w-12 lg:h-12 text-current" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-4C9.79 12.5 8 10.71 8 8.5S9.79 4.5 12 4.5s4 1.79 4 4-1.79 4-4 4z" /></svg>; // Generic fallback icon
    }
  };

  // Animation variants for a more dynamic, layered entrance
  const fadeInGrow = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.9, ease: [0.17, 0.55, 0.55, 1], delay: 0.1 } // Custom ease for a smoother feel
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Increased stagger for more dramatic effect
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 12 } },
  };

  // Button interactive states
  const buttonVariants = {
    rest: { scale: 1, boxShadow: "0px 4px 15px rgba(0,0,0,0.2)" },
    hover: { scale: 1.03, boxShadow: "0px 8px 25px rgba(0,0,0,0.3)" },
    tap: { scale: 0.98, boxShadow: "0px 2px 10px rgba(0,0,0,0.15)" },
  };

  // Card interactive states
  const cardVariants = {
    rest: { y: 0, scale: 1, rotateX: 0, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" },
    hover: {
      y: -5, // Lift effect
      scale: 1.02,
      rotateX: 2, // Subtle tilt
      boxShadow: "0px 15px 30px rgba(0,0,0,0.3)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98, y: 0, rotateX: 0, boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }
  };


  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden text-white">
      {/* Immersive Background with Subtle Parallax */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform" // Add will-change for smoother animation
        style={{
          backgroundImage: `url(${bannerUrl || bannerFallback.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y: backgroundY, // Apply parallax transform
        }}
      />

      {/* Dynamic Overlay: Darker, more atmospheric, using theme colors */}
      <div
        className="absolute inset-0 z-10"
        style={{
          // background: `linear-gradient(145deg, ${primaryColor}E0, ${secondaryColor}E0)`, // E0 for ~88% opacity
          backdropFilter: 'blur(12px) brightness(0.8)', // Stronger blur, slightly dims background
        }}
      />

      {/* Main Content Area: Centered and Spacious */}
      <motion.div
        className="relative z-20 max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center space-y-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-8xl font-black leading-tight tracking-tight drop-shadow-2xl" // Stronger shadow
          variants={fadeInGrow}
        >
          Your Life. Simplified.
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, #fff, ${secondaryColor})` }}
          >
            Seamlessly Serviced.
          </span>
        </motion.h1>

        {/* Sub-headline / Description */}
        <motion.p
          className="mt-4 text-xl sm:text-2xl lg:text-2xl max-w-4xl text-gray-100 leading-relaxed opacity-90 font-light drop-shadow-xl" // Lighter font-weight
          variants={fadeInGrow}
        >
          {description || "Discover a world where every task is handled with precision and care. From daily chores to special requests, we connect you with top-tier professionals, making your life effortlessly better."}
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div className="mt-12 flex flex-wrap justify-center gap-6" variants={fadeInGrow}>
          <Link href={`/${slug}/services`} passHref>
            <motion.button
              className="px-12 py-5 bg-white text-gray-900 font-extrabold rounded-full shadow-2xl text-xl flex items-center justify-center gap-3 transition-colors duration-300
                         hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Explore Services
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </Link>
          <Link href={`/${slug}/about`} passHref>
            <motion.button
              className="px-12 py-5 border-2 border-white text-white font-bold rounded-full text-xl flex items-center justify-center gap-3 transition-colors duration-300
                         hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Our Story
            </motion.button>
          </Link>
        </motion.div>

        {/* Dynamic Category/Service Highlight Cards: More prominent, interactive */}
        {storeCategories && storeCategories.length > 0 && (
          <motion.div
            className="mt-20 w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-6 max-w-5xl" // Increased max-width and gap
            variants={staggerContainer}
          >
            {storeCategories.slice(0, 4).map((category) => (
              <motion.div
                key={category.id}
                variants={listItemVariants} // Use listItemVariants for these
                className="relative flex flex-col items-center justify-center p-8 text-center rounded-3xl cursor-pointer transition-all duration-300 ease-in-out
                           bg-white/15 backdrop-blur-md border border-white/20 shadow-lg text-white" // Brighter background, distinct border
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                // Conditional styling for subtle unique card colors
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}30, ${secondaryColor}30)`,
                  borderColor: `rgba(255,255,255,0.2)`
                }}
              >
                <div className="mb-4 text-white" style={{ color: secondaryColor }}>
                  {getCategoryIcon(category.name)}
                </div>
                <h3 className="text-2xl font-semibold mb-1 leading-tight text-white">{category.name}</h3>
                <p className="text-sm opacity-80 text-gray-200">{category.items?.length || 0} services</p>
                {/* Optional: Add a subtle overlay on hover for effect */}
                <div className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 hover:opacity-10"
                     style={{ background: `radial-gradient(circle at center, ${secondaryColor}10, transparent 70%)` }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}