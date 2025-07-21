"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowSmallRightIcon } from '@heroicons/react/24/outline'; // Using a subtle arrow icon for the button
import { useStoreContext } from '@/contexts/StoreContext'; // To get dynamic theme colors

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

export default function GetStartedSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-900 -mb-24 relative z-10">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Preparing your journey...</p>
      </div>
    );
  }

  const { slug, themeSettings } = storeFormData;

  // Use primary for background, secondary for accent if that fits your theme better for this section
  const primaryColor = themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback for general elements
  const secondaryColor = themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback for the CTA button/accent

  // Animation variants
  const ctaCardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.04, 0.62, 0.23, 0.98] // Custom ease for a smoother spring-like feel
      },
    },
    hover: { scale: 1.01, boxShadow: "0 30px 60px rgba(0,0,0,0.25)" }, // More pronounced shadow on hover
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.2 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.4 } },
    hover: { scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" },
    tap: { scale: 0.95 },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: 50, rotate: -5 },
    visible: { opacity: 1, x: 0, rotate: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } },
  };

  return (
    <section className="relative z-20 -mb-24 lg:-mb-32"> {/* Increased z-index to ensure it overlaps content below */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={ctaCardVariants}
          whileHover="hover"
          viewport={{ once: true, amount: 0.5 }}
          className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl shadow-2xl px-8 py-10 md:py-16 md:px-20 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden transform-gpu"
          style={{
            // Dynamic subtle gradient based on primary/secondary colors for background
            // backgroundImage: `linear-gradient(to right, ${primaryColor}10, ${secondaryColor}10)`
          }}
        >
          {/* Text Content */}
          <div className="max-w-xl text-center md:text-left">
            <motion.h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-6" variants={textVariants}>
              Ready for a <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>
                Sparkling Clean Home?
              </span>
            </motion.h2>
            <motion.p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md mx-auto md:mx-0" variants={textVariants}>
              Experience the difference with our professional cleaning services. It's easier than you think!
            </motion.p>
            <motion.div variants={buttonVariants}>
              <Link
                href={`/${slug}/contact`} // Ensure this path is correct for your contact form
                passHref
              >
                <motion.button
                  className="inline-flex items-center justify-center px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out gap-2"
                  style={{ backgroundColor: secondaryColor, color: 'white' }}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Get Your Free Quote
                  <ArrowSmallRightIcon className="w-6 h-6" />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Image */}
          <motion.div
            className="relative w-[300px] h-[200px] md:w-[400px] md:h-[250px] flex-shrink-0" // Adjusted size and flex-shrink
            variants={imageVariants}
          >
            <Image
              loader={loader}
              src="/images/cta-cleaning-hand.png" // Ensure this image path is correct
              alt="Hand cleaning with spray and cloth"
              fill
              className="object-contain drop-shadow-lg" // Added drop-shadow for depth
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Optimize image loading
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}