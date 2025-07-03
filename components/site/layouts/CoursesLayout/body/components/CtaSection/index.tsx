"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid'; // Added SparklesIcon, ArrowRightIcon
import { useStoreContext } from '@/contexts/StoreContext'; // Import useStoreContext

// Mocking the image loader for standard <img> tags
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function CtaSection({
  title = "Ignite Your Learning Journey Today",
  subtitle = "Join our vibrant community and unlock endless possibilities for growth and discovery. Your future starts here!",
  buttonLabel = "Explore Courses",
  buttonHref = "#courses",
  imageUrl = "https://placehold.co/1200x800/D1D5DB/4B5563?text=Engage+Your+Mind", // Lighter placeholder
}) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  // For this specific issue, I'm using a mock to ensure consistent defaults and data structure.
  const useMockStoreContext = () => ({
    storeFormData: {
      themeSettings: {
        primaryColor: "#fd2121", // Red from your sample
        secondaryColor: "#ffffff", // White from your sample
      },
      // You might want to add CTA specific data to storeFormData in a real app
      // For now, using props and default values, but colors are dynamic
    },
  });

  const { storeFormData } = useMockStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121'; // Your brand's primary color (red)
  const accentColor = "#FFC107"; // A vibrant amber/yellow for highlights

  // Mock navigation for demonstration
  const mockNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // In a real Next.js app, this would be router.push(path);
    // window.location.href = path; // Uncomment if you want actual page redirection in browser
  };

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 8,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  // Animation variants for individual elements
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
  };

  return (
    <motion.section
      className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white" // Changed main background to white
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto bg-white text-gray-900
                      rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row items-stretch border border-gray-100"> {/* Light background, shadow, border */}

        {/* Left Section - Image */}
        <motion.div
          className="relative w-full lg:w-1/2 h-80 lg:h-auto flex-shrink-0"
          variants={itemVariants}
        >
          <img
            src={customLoader({ src: imageUrl, width: 1200 })}
            alt="Learning engagement"
            className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://placehold.co/1200x800/D1D5DB/4B5563?text=Image+Not+Found"; // Lighter placeholder on error
            }}
          />
          {/* Subtle gradient overlay on image (optional, can be removed if too dark) */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div> {/* Very subtle dark overlay */}
        </motion.div>

        {/* Right Section - Content (CTA & Subscribe) */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center text-center lg:text-left">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-gray-900 drop-shadow-sm" // Dark text, subtle shadow
            variants={itemVariants}
          >
            {title.split(' ').map((word, index) => (
              <span key={index}>
                {word === "Ignite" || word === "Learning" ? (
                  <span style={{ color: primaryColor }}>{word} </span>
                ) : (
                  `${word} `
                )}
              </span>
            ))}
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl text-gray-700 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed" // Darker text
            variants={itemVariants}
          >
            {subtitle}
          </motion.p>

          {/* Main CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${primaryColor}40` }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center justify-center text-white
                        px-10 py-4 rounded-md text-lg font-bold shadow-xl transition-all duration-300 mb-10
                        focus:outline-none focus:ring-4 focus:ring-opacity-75 self-center lg:self-start`}
            style={{
              background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`, // Primary to Accent gradient
              '--tw-ring-color': `${accentColor} !important`
            }}
            variants={itemVariants}
            onClick={() => mockNavigation(buttonHref)}
          >
            {buttonLabel}
            <ArrowRightIcon className="ml-3 w-5 h-5" />
          </motion.button>

          {/* Separator */}
          <motion.div
            className="relative w-full h-px bg-gray-300 my-8" // Lighter separator
            variants={itemVariants}
          >
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500 uppercase tracking-wider font-semibold"> {/* Lighter "or" background */}
              or
            </span>
          </motion.div>

          {/* Subscribe Section */}
          <motion.div
            className="w-full flex flex-col items-center lg:items-start"
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900"> {/* Dark text */}
              <SparklesIcon className={`w-6 h-6 text-[${primaryColor}]`} /> Get Our Latest Updates {/* Dynamic primary color for icon */}
            </h3>
            <p className="text-gray-700 mb-6 text-base max-w-md mx-auto lg:mx-0"> {/* Darker text */}
              Stay informed with our newest courses, events, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row w-full max-w-md gap-3 sm:gap-0">
              <input
                type="email"
                placeholder="Enter your email..."
                className={`w-full p-4 rounded-md sm:rounded-r-none sm:rounded-l-md
                            text-gray-900 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2
                            focus:ring-[${accentColor}] transition-all shadow-sm placeholder-gray-500`} // Adjusted for light theme
              />
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 5px 15px ${primaryColor}40` }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 px-8 py-4 bg-[${primaryColor}] text-white font-bold rounded-md sm:rounded-l-none sm:rounded-r-md
                            hover:bg-[${primaryColor}D0] transition-all duration-300 shadow-md
                            focus:outline-none focus:ring-4 focus:ring-opacity-75`}
                style={{
                  '--tw-ring-color': `${primaryColor} !important`
                }}
                onClick={() => console.log('Subscribe Now clicked!')}
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" /> Subscribe Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
