"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  SparklesIcon, PuzzlePieceIcon, RocketLaunchIcon, CheckCircleIcon // Using solid icons for more pop
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Placeholder for company logos - You should replace these with actual paths to your partner/trust logos
const companyLogos: string[] = [
  '/images/logos/google.svg',
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
    name,
    themeSettings,
  } = storeFormData;

  // Use the same primary and secondary colors for consistency
  const primaryColor = themeSettings?.primaryColor ?? "#4CAF50";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFC107";

  // Dynamically pull a single key image from storeFormData or use a fallback
  const featureImage: string = storeFormData?.themeSettings?.aboutImage || '/images/placeholders/feature-main.jpg';

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120, damping: 12 } },
  };

  const textReveal = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="relative bg-gray-50 py-16 lg:py-24 overflow-hidden text-gray-900">

      {/* Dynamic Background Element */}
      <div
        className="absolute top-0 left-0 w-full h-full hidden lg:block"
        style={{
          background: primaryColor,
          clipPath: 'polygon(0% 0, 100% 0, 100% 50%, 0% 100%)',
          zIndex: 0,
          opacity: 0.05
        }}
      />

      {/* Main Content Container with a higher z-index */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* Top Section: Trust Bar */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.h3
            className="text-gray-500 text-lg font-semibold uppercase tracking-wider mb-8"
            variants={textReveal}
          >
            Trusted by
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
            >
              {" "}Industry Leaders
            </span>
          </motion.h3>
          <div className="flex justify-center items-center flex-wrap gap-x-12 gap-y-8">
            {companyLogos.map((logoUrl: string, idx: number) => (
              <motion.div
                key={idx}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Image
                  loader={loader}
                  src={logoUrl}
                  alt={`Partner logo ${idx + 1}`}
                  width={120}
                  height={50}
                  className="object-contain h-12 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* --- */}

        {/* Main Excellence Section - Three-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Image with unique background frame */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            viewport={{ once: true, amount: 0.3 }}
            className="relative w-full aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group col-span-1 lg:col-span-1"
          >
            {/* Background "Frame" with a subtle offset for depth */}
            <div
              className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 transform translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0"
              style={{ background: secondaryColor }}
            />
            {/* Main Image */}
            <Image
              src={featureImage}
              alt="Our commitment to excellence"
              layout="fill"
              objectFit="cover"
              className="rounded-3xl shadow-xl transition-all duration-500 ease-in-out group-hover:scale-105"
              loader={loader}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20" />
          </motion.div>

          {/* Center Column: Main Headline and Description */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-6 col-span-1 lg:col-span-2 text-center lg:text-left flex flex-col justify-center"
          >
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
              variants={textReveal}
            >
              We’re Driven by{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}
              >
                Excellence
              </span>
            </motion.h2>

            <motion.p
              className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 opacity-90"
              variants={textReveal}
            >
              We go beyond just providing a service. We're dedicated to crafting a seamless and exceptional experience, ensuring every detail is handled with precision and care.
            </motion.p>

            <motion.div
              className="pt-4 flex justify-center lg:justify-start"
              variants={textReveal}
            >
              <Link
                href={`/${slug}/services`}
                className="inline-block px-8 py-4 rounded-full text-white font-bold shadow-lg transition-all duration-300 ease-in-out
                       hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50"
                style={{ backgroundColor: primaryColor, "--tw-ring-color": primaryColor } as React.CSSProperties}
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column: Value Propositions List */}
          <motion.ul
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 pt-4 col-span-1 lg:col-span-1"
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              { title: "Uncompromising Quality", icon: <SparklesIcon className="w-8 h-8" /> },
              { title: "Tailored Solutions", icon: <PuzzlePieceIcon className="w-8 h-8" /> },
              { title: "Reliable & Efficient", icon: <CheckCircleIcon className="w-8 h-8" /> },
              { title: "Innovative Approach", icon: <RocketLaunchIcon className="w-8 h-8" /> },
            ].map((item, index) => (
              <motion.li
                key={index}
                className="flex flex-col items-start space-y-2 p-4 rounded-xl transition-all duration-300 transform"
                style={{
                  border: '2px solid transparent',
                  borderImage: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor}) 1`,
                }}
                whileHover={{ y: -5, boxShadow: "0px 8px 15px rgba(0,0,0,0.1)" }}
              >
                <div className="flex-shrink-0" style={{ color: secondaryColor }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-gray-600">A short description goes here to explain the value proposition.</p>
              </motion.li>
            ))}
          </motion.ul>

        </div>
      </div>
    </section>
  );
}