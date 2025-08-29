"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

// Placeholder for dynamic data
import bannerLaundry from "@/assets/homebanner.png";
import bannerDelivery from "@/assets/homebanner.png";
import bannerCatering from "@/assets/homebanner.png";

// Placeholder for custom icon components
const LaundryOutlineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.354 1.5A.5.5 0 0 1 12 2v2.5a.5.5 0 0 1-1 0V2a.5.5 0 0 1 .354-.447ZM15 3h1.5A1.5 1.5 0 0 1 18 4.5v1.5a1.5 1.5 0 0 1-1.5 1.5h-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-16a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
  </svg>
);
const DeliveryOutlineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5c.576 0 1.05-.474 1.05-1.05V13.5h-2.1v4.95c0 .576.474 1.05 1.05 1.05ZM12 4.5v9m0 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM10 11.5h4c.552 0 1-.448 1-1V5.5c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1V10.5c0 .552.448 1 1 1Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v-2a.5.5 0 0 1 1 0v2" />
  </svg>
);
const CookingOutlineIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM12 18.375a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM5.625 12a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75Zm12.75-9.75v16.5c0 .548-.452 1-.996 1-.548 0-.996-.452-.996-1V2.25c0-.548.452-1 .996-1 .548 0 .996.452.996 1Zm-13.5 0V2.25c0-.548.452-1 .996-1 .548 0 .996.452.996 1v16.5c0 .548-.452 1-.996 1-.548 0-.996-.452-.996-1Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.375a3.375 3.375 0 1 0 0-6.75 3.375 3.375 0 0 0 0 6.75Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM12 18.375a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM5.625 12a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM12 5.625a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM18.375 5.625a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75ZM5.625 18.375a.375.375 0 1 0 0-.75.375.375 0 0 0 0 .75Z" />
  </svg>
);


// --- HeroSection Component ---
export default function HeroSection({ storeFormData }: { storeFormData: any }) {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  // Fallback data for demonstration
  const defaultStoreData = {
    slug: "your-business",
    name: "Your Life.",
    description: "Effortless solutions for your everyday needs.",
    themeSettings: {
      primaryColor: "#43A047", // A slightly richer green
      secondaryColor: "#FFB300", // A warmer orange/gold
    },
    storeCategories: [
      {
        id: "cat1",
        name: "Washing & Laundry",
        shortDescription: "Fresh clothes, delivered clean.",
        icon: <LaundryOutlineIcon className="w-6 h-6 md:w-8 md:h-8" />,
        banner: bannerLaundry.src,
        slug: "laundry",
      },
      {
        id: "cat2",
        name: "Swift Deliveries",
        shortDescription: "Fast, reliable, every time.",
        icon: <DeliveryOutlineIcon className="w-6 h-6 md:w-8 md:h-8" />,
        banner: bannerDelivery.src,
        slug: "delivery",
      },
      {
        id: "cat3",
        name: "Gourmet Catering",
        shortDescription: "Exquisite flavors for any event.",
        icon: <CookingOutlineIcon className="w-6 h-6 md:w-8 md:h-8" />,
        banner: bannerCatering.src,
        slug: "catering",
      },
    ],
  };

  const currentStoreData = storeFormData || defaultStoreData;
  const { slug, name, description, themeSettings, storeCategories } =
    currentStoreData;

  const primaryColor = themeSettings?.primaryColor ?? "#4CAF50";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107";

  // Auto-rotate categories every few seconds
  useEffect(() => {
    if (storeCategories && storeCategories.length > 1) {
      const interval = setInterval(() => {
        setActiveCategoryIndex(
          (prevIndex) => (prevIndex + 1) % storeCategories.length
        );
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [storeCategories]);

  const activeCategory = storeCategories
    ? storeCategories[activeCategoryIndex]
    : null;

  // Animation Variants
  const contentVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const wordReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const buttonReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2, ease: "easeOut" } },
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
      {/* Updated Background Shape: Softer, More Dynamic */}
      <div
        className="absolute top-0 right-0 w-3/4 h-full hidden lg:block"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor}33 100%)`, // Subtle gradient for depth
          clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)', // A softer, less angular shape
          zIndex: 0,
        }}
      ></div>

      <div className="relative z-10 w-full min-h-screen flex flex-col lg:flex-row items-stretch">
        {/* Left Side: Image Section with Gradient Overlay */}
        <div className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory?.banner || "default-banner"}
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${activeCategory?.banner || bannerLaundry.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              variants={imageFade}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(270deg, rgba(255,255,255,0.7) 0%, transparent 60%)`, // Enhanced gradient for better contrast
                }}
              ></motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: Content Section */}
        <div className="relative w-full lg:w-1/2 p-8 md:p-12 lg:p-20 flex flex-col justify-center lg:items-start text-center lg:text-left">
          <motion.div
            className="flex flex-col items-center lg:items-start"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Headline with a more pronounced style */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-sm"
              variants={contentVariants}
            >
              {(name || "Your Life.").split(" ").map((word: string, i: number) => (
                <motion.span key={i} className="inline-block mr-2" variants={wordReveal}>
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Dynamic Sub-Headline with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={activeCategory?.name || "default"}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mt-2"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${secondaryColor}EE, ${secondaryColor}AA)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                variants={dynamicTextFade}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {activeCategory?.name || "Simplified."}
              </motion.h2>
            </AnimatePresence>

            {/* Sub-headline with a refined, lighter font */}
            <motion.p
              className="mt-6 text-lg sm:text-xl max-w-lg font-light text-gray-700 leading-relaxed"
              variants={wordReveal}
            >
              {activeCategory?.shortDescription ||
                description ||
                "Effortless solutions for your everyday needs."}
            </motion.p>

            {/* Call to Action Buttons */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6"
              variants={buttonReveal}
            >
              <Link href={`/${slug}/services/${activeCategory?.slug || "all-services"}`} passHref>
                <motion.button
                  className="px-8 py-4 font-bold rounded-full text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{
                    background: primaryColor,
                    color: "white",
                  }}
                  whileHover={{ scale: 1.05, boxShadow: "0px 8px 20px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Services
                </motion.button>
              </Link>
              <Link href={`/${slug}/contact`} passHref>
                <motion.button
                  className="px-8 py-4 border-2 font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105"
                  style={{
                    borderColor: primaryColor,
                    color: primaryColor,
                  }}
                  onHoverStart={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = primaryColor; e.currentTarget.style.color = 'white'; }}
                  onHoverEnd={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = primaryColor; }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get a Quote
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Updated Category Navigation: Cleaner Design */}
          {storeCategories && storeCategories.length > 0 && (
            <div className="mt-12 flex justify-center lg:justify-start gap-3 flex-wrap">
              {storeCategories.map((category: any, index: number) => (
                <motion.button
                  key={category.id}
                  className={`flex items-center gap-2 py-2 px-5 rounded-full text-sm font-medium transition-colors duration-300 transform
                    ${index === activeCategoryIndex ? 'bg-white shadow-lg text-gray-900' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                  `}
                  onClick={() => setActiveCategoryIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Down Indicator */}
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