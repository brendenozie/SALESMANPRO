"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LightBulbIcon, SparklesIcon, ChevronRightIcon } from '@heroicons/react/24/solid'; // Using solid icons for visual punch
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function GetStartedSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-900 -mb-24 relative z-10">
        <p className="text-gray-600 dark:text-gray-300 text-lg animate-pulse">Crafting your perfect welcome...</p>
      </div>
    );
  }

  const { slug, themeSettings, bannerUrl } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || '#0d9488'; // Teal-600 fallback
  const secondaryColor = themeSettings?.secondaryColor || '#f97316'; // Orange-500 fallback

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom ease for a smooth, slightly bouncy feel
        when: "beforeChildren", // Animate container before children
        staggerChildren: 0.2
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 1.2, ease: "easeOut", delay: 0.3 } },
  };

  const buttonHoverTap = {
    hover: { scale: 1.07, boxShadow: "0 12px 25px rgba(0,0,0,0.25)" },
    tap: { scale: 0.95 },
  };

  return (
    <section className="relative z-20 -mb-24 lg:-mb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={sectionVariants}
          viewport={{ once: true, amount: 0.4 }} // Trigger animation when 40% in view
          className="relative rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between p-8 md:p-16 lg:p-20
                     bg-gradient-to-br from-white to-gray-50 dark:from-gray-850 dark:to-gray-750"
          style={{
            // Dynamic subtle gradient based on primary/secondary colors
            background: `linear-gradient(145deg, ${primaryColor}1A, ${secondaryColor}1A), 
                         var(--bg-default, linear-gradient(to bottom, #ffffff, #f0f0f0))`, // Fallback light bg
            // Dark mode background override (adjust if your theme handles this globally)
            // This is a simple example; usually, you'd use Tailwind's dark: variant classes directly
            // For this specific section, you might use a CSS variable controlled by JS for dark mode,
            // or rely on a global dark mode class that modifies the component's default styling.
          }}
        >
          {/* Dynamic background shapes for visual flow */}
          <motion.div
            className="absolute -top-20 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
            style={{ backgroundColor: primaryColor }}
            animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
            style={{ backgroundColor: secondaryColor }}
            animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear", repeatType: "mirror", delay: 5 }}
          />

          {/* Text Content - Left Side */}
          <div className="relative z-10 max-w-xl text-center md:text-left flex-shrink-0 md:pr-12">
            <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-gray-100 leading-tight mb-6" variants={itemVariants}>
              Ready for a <br />
              <span className="bg-clip-text text-transparent" style={{ backgroundColor: `${primaryColor}` }}>
                Sparkling New Beginning?
              </span>
            </motion.h2>

            <motion.p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-md mx-auto md:mx-0" variants={itemVariants}>
              Unlock the **comfort and confidence** of a professionally cleaned space. Our seamless process makes booking effortless and results breathtaking.
            </motion.p>

            <motion.div variants={itemVariants}>
              <ul className="space-y-3 text-left text-gray-700 dark:text-gray-300 mb-10 text-lg">
                <li className="flex items-center">
                  <LightBulbIcon className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: primaryColor }} />
                  <span>Transparent Pricing, No Surprises.</span>
                </li>
                <li className="flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-3 flex-shrink-0" style={{ color: primaryColor }} />
                  <span>Expert Cleaners, Impeccable Results.</span>
                </li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href={`/${slug}/contact`}
                passHref
              >
                <motion.button
                  className="inline-flex items-center justify-center px-10 py-4 rounded-full font-bold text-lg shadow-xl transition-all duration-300 ease-in-out gap-2
                             text-white group relative overflow-hidden" // Added group and relative/overflow for button hover effect
                  style={{ backgroundColor: ` ${primaryColor} ` }}
                  variants={buttonHoverTap}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span className="relative z-10">Get Your Free Quote</span>
                  <ChevronRightIcon className="w-6 h-6 ml-1 relative z-10 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                  {/* Subtle highlight effect on hover */}
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Image - Right Side */}
          <motion.div
            className="relative w-full md:w-[450px] lg:w-[550px] h-[300px] md:h-[350px] lg:h-[450px] flex-shrink-0 mt-12 md:mt-0"
            variants={imageVariants}
          >
            <Image
              loader={loader}
              src={bannerUrl || 'https://via.placeholder.com/550'} // Replace with an aspirational, abstract "clean" image
              alt="Abstract representation of sparkling clean results"
              fill
              className="object-cover rounded-2xl shadow-2xl saturate-125" // Adjusted objectFit and added saturation
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            {/* Overlay for depth and light effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-transparent to-black/10" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}