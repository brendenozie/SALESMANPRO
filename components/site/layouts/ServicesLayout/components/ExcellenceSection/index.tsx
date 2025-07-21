"use client";

import React, { useContext } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircleIcon, SparklesIcon, PuzzlePieceIcon, RocketLaunchIcon } from '@heroicons/react/24/solid'; // Using solid icons for more pop
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

// Placeholder for company logos - You should replace these with actual paths to your partner/trust logos
const companyLogos: string[] = [
  '/images/logos/google.svg', // Example: Replace with your actual logo paths
  '/images/logos/microsoft.svg',
  '/images/logos/shopify.svg',
  '/images/logos/stripe.svg',
  '/images/logos/netflix.svg',
];

export default function ExcellenceSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Crafting excellence...</p>
      </div>
    );
  }

  const {
    slug,
    bannerUrl, // Consider using a dedicated 'excellenceImage' or 'missionImage' field
    name,
    description,
    themeSettings,
  } = storeFormData;

  const primary = themeSettings?.primaryColor ?? '#0d9488'; // teal-600 fallback
  const secondary = themeSettings?.secondaryColor ?? '#f97316'; // orange-500 fallback

  // Dynamically pull images from storeFormData if available, or use fallbacks
  // Adjust this logic to map to specific 'feature' images if your data structure allows
  const featureImages: string[] = [
    storeFormData?.themeSettings?.featureImage1 || '/images/placeholders/feature-main.jpg',
    storeFormData?.themeSettings?.featureImage2 || '/images/placeholders/feature-sub1.jpg',
    storeFormData?.themeSettings?.featureImage3 || '/images/placeholders/feature-sub2.jpg',
  ];

  // Animation variants
  const slideInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 12 } },
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 lg:py-24 overflow-hidden">
      {/* Trust Bar / Logos - More subtle and integrated */}
      <motion.div
        className="max-w-7xl mx-auto px-6 mb-16 opacity-75"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <h3 className="text-center text-gray-500 dark:text-gray-400 text-lg font-semibold uppercase mb-8">Trusted by leading brands</h3>
        <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-8">
          {companyLogos.map((logoUrl: string, idx: number) => (
            <motion.div key={idx} variants={fadeIn}>
              <Image
                loader={loader}
                src={logoUrl}
                alt={`Partner logo ${idx + 1}`}
                width={120} // Slightly larger for better visibility
                height={50}
                className="object-contain h-12 w-auto grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300" // Grayscale for sophistication
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Excellence Card - Enhanced Design */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="relative rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between p-8 md:p-16 lg:p-20"
          style={{
            background: `linear-gradient(145deg, ${primary}EE, ${secondary}EE)`, // Slightly more opaque for richness
            color: 'white',
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={slideInUp}
        >
          {/* Background pattern/gradient overlay */}
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 10% 20%, ${primary}50, transparent 70%), 
                               radial-gradient(circle at 90% 80%, ${secondary}50, transparent 70%)`,
            }}
          />

          {/* Text Section */}
          <div className="relative z-10 w-full md:w-1/2 md:pr-12 text-center md:text-left mb-10 md:mb-0">
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg"
              variants={fadeIn}
            >
              Our Commitment to <br />
              <span className="text-white" style={{ background: `linear-gradient(to right, #ffffff, ${secondary})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Excellence Experiences
              </span>
            </motion.h2>

            <motion.p
              className="text-white/90 text-lg sm:text-xl mb-8 max-w-lg mx-auto md:mx-0"
              variants={fadeIn}
            >
              Explore the core mission and vision that drives us every day. We're not just about services; we're about crafting **lasting value, unparalleled quality, and genuine trust** in every interaction.
            </motion.p>

            {/* Enhanced Perks / Value Propositions */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-10">
              <motion.li className="flex items-center text-lg" variants={listItemVariants}>
                <SparklesIcon className="w-6 h-6 mr-3 text-white" />
                <span>Uncompromising Quality</span>
              </motion.li>
              <motion.li className="flex items-center text-lg" variants={listItemVariants}>
                <PuzzlePieceIcon className="w-6 h-6 mr-3 text-white" />
                <span>Tailored Solutions</span>
              </motion.li>
              <motion.li className="flex items-center text-lg" variants={listItemVariants}>
                <CheckCircleIcon className="w-6 h-6 mr-3 text-white" />
                <span>Reliable & Efficient</span>
              </motion.li>
              <motion.li className="flex items-center text-lg" variants={listItemVariants}>
                <RocketLaunchIcon className="w-6 h-6 mr-3 text-white" />
                <span>Innovative Approach</span>
              </motion.li>
            </ul>

            <Link
              href={`/${slug}/services`}
              className="inline-block bg-white hover:bg-white/95 text-gray-900 font-extrabold px-8 py-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Explore Our Services
            </Link>
          </div>

          {/* Image Collage - More dynamic and artistic */}
          <motion.div
            className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-[3/4] lg:aspect-[4/5] flex items-center justify-center p-4" // Added padding for spacing
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="relative w-full h-full">
              {/* Main Image - Central, larger, with border */}
              {featureImages[0] && (
                <motion.div
                  className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-xl border-4 border-white transform hover:scale-105 transition-transform duration-500 ease-in-out"
                  style={{ zIndex: 3 }}
                  initial={{ rotate: -3 }} // Subtle initial rotation
                  whileHover={{ rotate: 0 }}
                >
                  <Image
                    src={featureImages[0]}
                    loader={loader}
                    alt="Main feature"
                    layout="fill"
                    objectFit="cover"
                    className="object-cover"
                  />
                </motion.div>
              )}

              {/* Secondary Image - Top right, smaller, overlapping */}
              {featureImages[1] && (
                <motion.div
                  className="absolute top-0 right-0 w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform translate-x-1/4 -translate-y-1/4 hover:scale-110 transition-transform duration-500 ease-in-out"
                  style={{ zIndex: 4 }} // Higher z-index to overlap
                  initial={{ rotate: 5 }} // Subtle initial rotation
                  whileHover={{ rotate: 0 }}
                >
                  <Image
                    src={featureImages[1]}
                    loader={loader}
                    alt="Secondary feature"
                    layout="fill"
                    objectFit="cover"
                  />
                </motion.div>
              )}

              {/* Tertiary Image - Bottom left, smaller, overlapping */}
              {featureImages[2] && (
                <motion.div
                  className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform -translate-x-1/4 translate-y-1/4 hover:scale-110 transition-transform duration-500 ease-in-out"
                  style={{ zIndex: 4 }} // Higher z-index to overlap
                  initial={{ rotate: -5 }} // Subtle initial rotation
                  whileHover={{ rotate: 0 }}
                >
                  <Image
                    src={featureImages[2]}
                    loader={loader}
                    alt="Tertiary feature"
                    layout="fill"
                    objectFit="cover"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}