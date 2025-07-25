"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image'; // Import Image for optimized images
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your transformCompanyToStoreForm and Prisma schema
export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

// export type StoreForm = {
//   name?: string; // Can be used for CTA title
//   tagline?: string; // Can be used for CTA subtitle
//   description?: string; // Can be used for CTA subtitle
//   bannerUrl?: string; // Can be used for CTA image
//   ctaSection?: { // New field for specific CTA section content
//     title?: string;
//     subtitle?: string;
//     buttonLabel?: string;
//     buttonHref?: string;
//     imageUrl?: string;
//     subscribeText?: string; // Text for the subscribe section
//     subscribePlaceholder?: string; // Placeholder for email input
//     subscribeButtonLabel?: string; // Label for subscribe button
//   };
//   themeSettings?: ThemeSettings;
//   contactEmail?: string; // For subscribe section placeholder
//   // Add other relevant StoreForm fields if needed
// };

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     themeSettings: {
//       primaryColor: "#fd2121", // Red from your sample
//       secondaryColor: "#FFC107", // Amber/Yellow for accent
//     },
//     name: "EduLearn Academy",
//     tagline: "Your Future, Our Expertise",
//     description: "Join our vibrant community and unlock endless possibilities for growth and discovery. Your future starts here with our cutting-edge courses and expert instructors.",
//     bannerUrl: "https://images.unsplash.com/photo-1546410531-bb45ce9b6867?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Example image for CTA
//     contactEmail: "info@edulearn.com",
//     ctaSection: {
//       title: "Ignite Your Learning Journey Today",
//       subtitle: "Unlock endless possibilities for growth and discovery. Your future starts here with our cutting-edge courses and expert instructors.",
//       buttonLabel: "Explore All Courses",
//       buttonHref: "/courses",
//       imageUrl: "https://images.unsplash.com/photo-1546410531-bb45ce9b6867?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Specific image for CTA section
//       subscribeText: "Stay informed with our newest courses, events, and exclusive offers.",
//       subscribePlaceholder: "your.email@example.com",
//       subscribeButtonLabel: "Subscribe Now",
//     },
//   } as StoreForm,
// });

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function CtaSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.secondaryColor || '#FFC107';

  // Dynamic content from storeFormData with fallbacks
  const ctaTitle = storeFormData?.ctaSection?.title || storeFormData?.name || "Ignite Your Learning Journey Today";
  const ctaSubtitle = storeFormData?.ctaSection?.subtitle || storeFormData?.description || "Join our vibrant community and unlock endless possibilities for growth and discovery. Your future starts here!";
  const ctaButtonLabel = storeFormData?.ctaSection?.buttonLabel || "Explore Courses";
  const ctaButtonHref = storeFormData?.ctaSection?.buttonHref || "/courses";
  const ctaImageUrl = storeFormData?.ctaSection?.imageUrl || storeFormData?.bannerUrl || "https://placehold.co/1200x800/D1D5DB/4B5563?text=Engage+Your+Mind";
  const subscribeText = storeFormData?.ctaSection?.subscribeText || "Stay informed with our newest courses, events, and exclusive offers.";
  const subscribePlaceholder = storeFormData?.ctaSection?.subscribePlaceholder || storeFormData?.contactEmail || "Enter your email...";
  const subscribeButtonLabel = storeFormData?.ctaSection?.subscribeButtonLabel || "Subscribe Now";

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/1200x800/CCCCCC/333333?text=Image+Not+Found";
  };

  return (
    <motion.section
      className="relative z-10 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto bg-white text-gray-900
                      rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row items-stretch border border-gray-100">

        {/* Left Section - Image */}
        <motion.div
          className="relative w-full lg:w-1/2 h-80 lg:h-auto flex-shrink-0"
          variants={itemVariants}
        >
          <Image
            src={ctaImageUrl}
            alt="Learning engagement"
            fill
            className="object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-500"
            loader={loader}
            sizes="(max-width: 1024px) 100vw, 50vw"
            onError={handleImageError}
          />
          {/* Subtle gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent"></div>
        </motion.div>

        {/* Right Section - Content (CTA & Subscribe) */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center text-center lg:text-left">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-gray-900 drop-shadow-sm"
            variants={itemVariants}
          >
            {ctaTitle.split(' ').map((word, index) => (
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
            className="text-lg sm:text-xl text-gray-700 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            variants={itemVariants}
          >
            {ctaSubtitle}
          </motion.p>

          {/* Main CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: `0 10px 20px ${primaryColor}40` }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center justify-center text-white
                        px-10 py-4 rounded-md text-lg font-bold shadow-xl transition-all duration-300 mb-10
                        focus:outline-none focus:ring-4 focus:ring-opacity-75 self-center lg:self-start`}
            style={{
              background: `${primaryColor}`
              // `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
              // '--tw-ring-color': `${accentColor} !important` as any
            }}
            variants={itemVariants}
            onClick={() => mockNavigation(ctaButtonHref)}
          >
            {ctaButtonLabel}
            <ArrowRightIcon className="ml-3 w-5 h-5" />
          </motion.button>

          {/* Separator */}
          <motion.div
            className="relative w-full h-px bg-gray-300 my-8"
            variants={itemVariants}
          >
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500 uppercase tracking-wider font-semibold">
              or
            </span>
          </motion.div>

          {/* Subscribe Section */}
          <motion.div
            className="w-full flex flex-col items-center lg:items-start"
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              <SparklesIcon className={`w-6 h-6`} style={{ color: primaryColor }} /> Get Our Latest Updates
            </h3>
            <p className="text-gray-700 mb-6 text-base max-w-md mx-auto lg:mx-0">
              {subscribeText}
            </p>
            <div className="flex flex-col sm:flex-row w-full max-w-md gap-3 sm:gap-0">
              <input
                type="email"
                placeholder={subscribePlaceholder}
                className={`w-full p-4 rounded-md sm:rounded-r-none sm:rounded-l-md
                            text-gray-900 bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2
                            focus:ring-opacity-75 transition-all shadow-sm placeholder-gray-500`}
                // style={{ '--tw-ring-color': `${accentColor} !important` as any }}
              />
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: `0 5px 15px ${primaryColor}40` }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 px-8 py-4 text-white font-bold rounded-md sm:rounded-l-none sm:rounded-r-md
                            hover:bg-opacity-90 transition-all duration-300 shadow-md
                            focus:outline-none focus:ring-4 focus:ring-opacity-75`}
                style={{
                  backgroundColor: primaryColor,
                  '--tw-ring-color': `${primaryColor} !important` as any
                }}
                onClick={() => console.log('Subscribe Now clicked!')}
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" /> {subscribeButtonLabel}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
