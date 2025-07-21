"use client";

import React, { useContext } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
// Using Heroicons, but consider custom SVG icons for more unique brand identity
import { CheckCircleIcon, StarIcon, ShieldCheckIcon, TruckIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <p className="text-gray-600 text-lg animate-pulse">Gathering insights for you...</p>
      </div>
    );
  }

  const {
    slug,
    bannerUrl, // This should ideally be an "About Us" specific image, not the main banner
    name,
    description,
    themeSettings,
  } = storeFormData;

  const primary = themeSettings?.primaryColor ?? "#2563EB"; // Default Blue
  const secondary = themeSettings?.secondaryColor ?? "#EC4899"; // Default Pink

  // Re-imagined perks with icons for better visual representation and intuitiveness
  const coreValues = [
    {
      title: "Unmatched Quality",
      description: "Our commitment to excellence ensures every service is performed to the highest standards.",
      icon: <StarIcon className="w-8 h-8" />,
    },
    {
      title: "Seamless Convenience",
      description: "Effortless booking, flexible scheduling, and reliable service at your doorstep.",
      icon: <TruckIcon className="w-8 h-8" />, // Or a calendar icon
    },
    {
      title: "Transparent Pricing",
      description: "Enjoy clear, competitive rates with no hidden fees. Quality service doesn't have to break the bank.",
      icon: <CurrencyDollarIcon className="w-8 h-8" />,
    },
    {
      title: "Guaranteed Satisfaction",
      description: "We stand behind our work. Your complete satisfaction is our ultimate priority.",
      icon: <ShieldCheckIcon className="w-8 h-8" />,
    },
  ];

  // Animation variants
  const fadeInScale = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
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

  const itemFadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
  };

  return (
    <section className="relative overflow-hidden py-28 lg:py-36 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Dynamic Background Accents: More integrated and subtle */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-10"
        style={{
          background: `radial-gradient(circle at top left, ${secondary} 0%, transparent 50%),
                       radial-gradient(circle at bottom right, ${primary} 0%, transparent 50%)`,
        }}
        animate={{ scale: [1, 1.02, 1], rotate: [0, 2, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      {/* Subtle textured overlay for depth */}
      <div className="absolute inset-0 bg-dot-pattern opacity-5 dark:bg-dot-pattern-dark" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left: Image Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeInScale}
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-center lg:justify-end order-2 lg:order-1"
        >
          <div className="relative w-full max-w-lg aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-3xl transform rotate-3 hover:rotate-0 transition-transform duration-500 ease-in-out group">
            {/* Main Image */}
            <Image
              src={bannerUrl || "/placeholder-about.jpg"} // Ensure you have a good placeholder or dynamic 'about' image
              alt={`${name} About Image`}
              layout="fill" // Use fill for responsive images
              objectFit="cover"
              className="transition-transform duration-500 ease-in-out group-hover:scale-110"
              loader={loader}
            />
            {/* Image Overlay for brand integration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20 group-hover:to-black/30 transition-all duration-500" />

            {/* Optional: Small "Seal of Quality" or rating badge on image */}
            {/* If you have a specific stat like "years in service" or "rating" */}
            {/*
            {stats && stats[0] && (
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center shadow-lg">
                    <span className="text-gray-900 text-lg font-bold mr-2">{stats[0].value}</span>
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                </div>
            )}
            */}
          </div>
        </motion.div>

        {/* Right: Text Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8 order-1 lg:order-2 text-center lg:text-left"
        >
          <motion.span
            className="inline-block text-sm font-semibold tracking-widest uppercase"
            style={{ color: secondary }}
            variants={itemFadeIn}
          >
            Our Story & Values
          </motion.span>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight"
            variants={itemFadeIn}
          >
            About <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})` }}>{name}</span>
          </motion.h2>

          <motion.p
            className="text-lg sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-90"
            variants={itemFadeIn}
          >
            {description || "At " + name + ", we're passionate about simplifying your life through exceptional service. With a dedication to quality and a team of trusted professionals, we ensure every interaction is seamless and satisfying."}
          </motion.p>

          {/* Core Values / Perks Section: Grid of value cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemFadeIn}
                custom={index} // Pass index for staggered animation
                className="flex items-start p-5 rounded-xl transition-all duration-300 transform
                           bg-white dark:bg-gray-800 shadow-md hover:shadow-lg hover:-translate-y-1
                           border border-gray-100 dark:border-gray-700"
              >
                <div className="flex-shrink-0 mr-4 text-white" style={{ color: primary }}>
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ color: primary }}>{value.title}</h3>
                  <p className="text-sm opacity-90 text-gray-700 dark:text-gray-300">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-4 pt-8"
            variants={itemFadeIn}
          >
            <Link
              href={`/${slug}/contact`} // Changed to a more specific "Contact Us" or "Get a Quote"
              className="px-8 py-4 rounded-full text-white font-bold shadow-xl transition-all duration-300 ease-in-out
                         hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: primary, "--tw-ring-color": primary }} // Dynamic ring color
            >
              Get a Quote
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8.707 9.293a1 1 0 00-1.414 1.414L10 12.414l2.707-2.707a1 1 0 10-1.414-1.414L10 9.586l-1.293-1.293z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href={`/${slug}/faq`} // Changed to FAQ for learning more about process
              className="px-8 py-4 border-2 rounded-full font-medium transition-all duration-300 ease-in-out
                         hover:bg-white hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-opacity-50"
              style={{ borderColor: primary, color: primary, "--tw-ring-color": primary }} // Dynamic border/text/ring color
            >
              Read FAQs
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}