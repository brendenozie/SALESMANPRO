"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Placeholder for dynamic data (replace with your actual context/props)

import bannerLaundry from "@/assets/homebanner.png"; // Example image
import bannerDelivery from "@/assets/homebanner.png"; // Example image
import bannerCatering from "@/assets/homebanner.png"; // Example image

import bannerFallback from "@/assets/homebanner.png";

// Icons (choose from a library like Heroicons or custom SVGs)
import { LaundryOutlineIcon, DeliveryOutlineIcon, CookingOutlineIcon } from "./icons"; // Assume these are custom icons

// --- HeroSection Component ---
export default function HeroSection({ storeFormData }) { // Assume storeFormData is passed as a prop
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Fallback data for demonstration
  const defaultStoreData = {
    slug: "your-business",
    name: "Your Local Service Pro",
    description: "Making your life easier, one service at a time.",
    themeSettings: {
      primaryColor: "#4CAF50", // Green for welcome
      secondaryColor: "#FFC107", // Amber for accent
    },
    storeCategories: [
      {
        id: "cat1",
        name: "Washing & Laundry",
        shortDescription: "Fresh clothes, delivered clean.",
        icon: <LaundryOutlineIcon className="w-16 h-16" />,
        banner: bannerLaundry.src,
        slug: "laundry"
      },
      {
        id: "cat2",
        name: "Swift Deliveries",
        shortDescription: "Fast, reliable, every time.",
        icon: <DeliveryOutlineIcon className="w-16 h-16" />,
        banner: bannerDelivery.src,
        slug: "delivery"
      },
      {
        id: "cat3",
        name: "Gourmet Catering",
        shortDescription: "Exquisite flavors for any event.",
        icon: <CookingOutlineIcon className="w-16 h-16" />,
        banner: bannerCatering.src,
        slug: "catering"
      },
      // Add more categories as needed
    ],
  };

  const currentStoreData = storeFormData || defaultStoreData;
  const { slug, name, description, themeSettings, storeCategories } = currentStoreData;

  const primaryColor = themeSettings?.primaryColor ?? "#4CAF50";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107";

  // Auto-rotate categories every few seconds
  useEffect(() => {
    if (storeCategories && storeCategories.length > 1) {
      const interval = setInterval(() => {
        setActiveCategoryIndex((prevIndex) =>
          (prevIndex + 1) % storeCategories.length
        );
      }, 7000); // Change category every 7 seconds
      return () => clearInterval(interval);
    }
  }, [storeCategories]);

  const activeCategory = storeCategories ? storeCategories[activeCategoryIndex] : null;

  // Animation Variants
  const textReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const buttonSlideIn = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.4, ease: "easeOut" } },
  };

  const categoryCardRise = {
    hidden: { opacity: 0, y: 100, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut", delay: 0.6 } },
  };

  const backgroundFade = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } },
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gray-100">
      {/* Background Image / Video (Dynamic) */}
      <motion.div
        key={activeCategory?.banner || "default-banner"} // Key for re-animating on category change
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${activeCategory?.banner || bannerLaundry.src})` }}
        variants={backgroundFade}
        initial="hidden"
        animate="visible"
      >
        {/* Subtle Gradient Overlay for Readability and Mood */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, ${primaryColor}40 100%)`, // Dark top, light bottom with theme color
          }}
        ></div>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${primaryColor}20 0%, transparent 50%, ${secondaryColor}20 100%)`, // Subtle horizontal accent
          }}
        ></div>
        {/* Optional: Add a subtle texture or noise overlay for depth */}
        <div className="absolute inset-0 bg-noise-overlay opacity-10"></div>
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40 text-white text-center flex flex-col items-center">
        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight drop-shadow-lg"
          variants={textReveal}
          initial="hidden"
          animate="visible"
        >
          {name || "Your Life."} <span style={{ color: secondaryColor }}>{activeCategory?.name || "Simplified."}</span>
        </motion.h1>

        {/* Sub-headline / Description */}
        <motion.p
          className="mt-4 text-xl sm:text-2xl max-w-3xl text-gray-100 leading-relaxed drop-shadow-md"
          variants={textReveal}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          {activeCategory?.shortDescription || description || "Effortless solutions for your everyday needs."}
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6"
          variants={buttonSlideIn}
          initial="hidden"
          animate="visible"
        >
          <Link href={`/${slug}/services/${activeCategory?.slug || "all-services"}`} passHref>
            <motion.button
              className="px-8 py-4 bg-white text-gray-800 font-bold rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ backgroundColor: secondaryColor, color: "white" }} // Use secondary color for primary CTA
              whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Services
            </motion.button>
          </Link>
          <Link href={`/${slug}/contact`} passHref>
            <motion.button
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-full text-lg hover:bg-white hover:text-gray-800 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get a Quote
            </motion.button>
          </Link>
        </motion.div>

        {/* Dynamic Category Navigator/Showcase */}
        {storeCategories && storeCategories.length > 0 && (
          <div className="absolute bottom-0 w-full flex justify-center pb-4 lg:pb-6">
            <div className="flex gap-4">
              {storeCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border-2
                              ${index === activeCategoryIndex ? 'scale-110 shadow-lg' : 'opacity-70'}
                              `}
                  style={{
                    backgroundColor: index === activeCategoryIndex ? `white` : `rgba(255,255,255,0.15)`,
                    borderColor: index === activeCategoryIndex ? secondaryColor : `rgba(255,255,255,0.3)`,
                    color: index === activeCategoryIndex ? primaryColor : "white",
                  }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setActiveCategoryIndex(index)}
                  variants={categoryCardRise}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="mb-2 text-current">
                    {category.icon}
                  </div>
                  <span className="text-sm font-semibold">{category.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Placeholder for custom icon components (you would define these or import from a library)
const LaundryOutlineIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.354 1.5A.5.5 0 0 1 12 2v2.5a.5.5 0 0 1-1 0V2a.5.5 0 0 1 .354-.447ZM15 3h1.5A1.5 1.5 0 0 1 18 4.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-16a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
  </svg>
);
const DeliveryOutlineIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5c.576 0 1.05-.474 1.05-1.05V13.5h-2.1v4.95c0 .576.474 1.05 1.05 1.05ZM12 4.5v9m0 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM10 11.5h4c.552 0 1-.448 1-1V5.5c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1V10.5c0 .552.448 1 1 1Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v-2a.5.5 0 0 1 1 0v2" />
  </svg>
);
const CookingOutlineIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM12 18.375a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM5.625 12a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75Zm12.75-9.75v16.5c0 .548-.452 1-.996 1-.548 0-.996-.452-.996-1V2.25c0-.548.452-1 .996-1 .548 0 .996.452.996 1Zm-13.5 0V2.25c0-.548.452-1 .996-1 .548 0 .996.452.996 1v16.5c0 .548-.452 1-.996 1-.548 0-.996-.452-.996-1Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.375a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM12 18.375a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM5.625 12a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM12 5.625a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM18.375 5.625a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM5.625 18.375a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75Z" />
  </svg>
);