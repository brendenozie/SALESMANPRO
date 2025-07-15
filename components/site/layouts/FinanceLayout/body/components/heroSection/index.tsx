"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import { ArrowRightIcon, ScaleIcon, CurrencyDollarIcon, LightBulbIcon, UsersIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// New variants for the feature icons
const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
};

export default function HeroSection({
  headline = "Your Trusted Partner in Finance & Legal Matters",
  subline = "Navigating complex financial and legal landscapes with clarity, expertise, and personalized solutions.",
  ctaText = "Get a Free Consultation",
  ctaLink = "/contact",
  imageUrl = "/images/hero-legal-finance.webp", // Sample image URL
  primary = "#004085", // A deep blue, often associated with trust and professionalism
  secondary = "#1F77B4", // A slightly lighter blue for gradient effect
}) {
  return (
    <section
      className="relative overflow-hidden text-white py-24 sm:py-32 lg:py-40"
      style={{
        background: `linear-gradient(to right, ${primary}, ${secondary})`,
      }}
    >
      {/* Background patterns for visual interest */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image
          src="/images/abstract-pattern.svg" // Sample abstract pattern SVG
          alt="background pattern"
          fill
          className="object-cover"
          style={{ mixBlendMode: "overlay" }}
          loader={({ src, width, quality }) =>
            `${src}?w=${width}&q=${quality || 75}`
          }
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
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-md"
            >
              {headline}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl mb-8 text-white/95 leading-relaxed"
            >
              {subline}
            </motion.p>
            <motion.a
              variants={itemVariants}
              href={ctaLink}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              {ctaText}
              <ArrowRightIcon className="ml-3 h-5 w-5" />
            </motion.a>

            {/* Added: Key Value Propositions/Features */}
            <motion.div
              variants={containerVariants}
              className="mt-12 grid grid-cols-2 sm:grid-cols-2 gap-6 text-sm sm:text-base"
            >
              <motion.div variants={iconVariants} className="flex items-center text-white/90">
                <ScaleIcon className="h-6 w-6 mr-3 text-white" />
                Expert Legal Counsel
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-white/90">
                <CurrencyDollarIcon className="h-6 w-6 mr-3 text-white" />
                Strategic Financial Planning
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-white/90">
                <LightBulbIcon className="h-6 w-6 mr-3 text-white" />
                Innovative Solutions
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-white/90">
                <UsersIcon className="h-6 w-6 mr-3 text-white" />
                Client-Centric Approach
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Image Content */}
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="hidden md:block relative w-full max-w-lg mx-auto aspect-w-16 aspect-h-9 md:aspect-w-1 md:aspect-h-1 rounded-xl overflow-hidden shadow-2xl"
            >
              <Image
                src={imageUrl}
                alt="Empowering your financial and legal future"
                fill
                className="object-cover object-center transform hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loader={({ src, width, quality }) =>
                  `${src}?w=${width}&q=${quality || 75}`
                }
              />
              {/* Image Overlay for a subtle effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/10"></div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}