"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { StarIcon, ShieldCheckIcon, TruckIcon, CurrencyDollarIcon, ArrowRightIcon } from "@heroicons/react/24/outline"; // Added ArrowRightIcon
import { useStoreContext } from "@/contexts/StoreContext";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 text-lg animate-pulse">Gathering insights for you...</p>
      </div>
    );
  }

  const {
    slug,
    bannerUrl, // Suggestion: Ideally this is an 'about us' specific image URL
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
      icon: <TruckIcon className="w-8 h-8" />,
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

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Slightly increased stagger for more noticeable effect
      },
    },
  };

  const itemFadeIn = {
    hidden: { opacity: 0, y: 30 }, // Increased y for more pronounced slide
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } }, // Slightly softer spring
  };

  return (
    <section className="relative overflow-hidden py-28 lg:py-36 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Dynamic Background Accents: More integrated and subtle - Replaced with CSS for better performance & flexibility */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          '--primary': primary,
          '--secondary': secondary,
        } as React.CSSProperties} // Pass CSS variables
      >
        {/* Animated Background Shapes */}
        <motion.div
          className="absolute rounded-full opacity-10 blur-3xl -top-20 -left-20 w-80 h-80"
          style={{ backgroundColor: primary }}
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        />
        <motion.div
          className="absolute rounded-full opacity-10 blur-3xl -bottom-20 -right-20 w-96 h-96"
          style={{ backgroundColor: secondary }}
          animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear", repeatType: "mirror", delay: 5 }}
        />
      </div>

      {/* Subtle textured overlay for depth */}
      {/* Assuming bg-dot-pattern is defined in your global CSS */}
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
          <div className="relative w-full max-w-lg aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group">
            {/* Background "Frame" that shifts */}
            <motion.div
                className="absolute inset-0 rounded-3xl -z-10"
                style={{ background: primary }}
                initial={{ scale: 1, rotate: 0 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.03, rotate: -2, boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }} // Added shadow on hover
            />

            {/* Main Image */}
            <Image
              src={bannerUrl || "/placeholder-about.jpg"} // Ensure this is a relevant 'About Us' image
              alt={`${name} About Image`}
              layout="fill"
              objectFit="cover"
              className="rounded-3xl shadow-3xl transform rotate-3 transition-transform duration-500 ease-in-out group-hover:rotate-0 group-hover:scale-105"
              loader={loader}
            />
            {/* Image Overlay for brand integration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20 group-hover:to-black/30 transition-all duration-500" />
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
            Our Journey & Commitment
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
            {description || `At ${name}, we're passionate about simplifying your life through exceptional service. With a dedication to quality and a team of trusted professionals, we ensure every interaction is seamless and satisfying.`}
          </motion.p>

          {/* Core Values / Perks Section: Grid of value cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {coreValues.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemFadeIn}
                custom={index}
                className="flex items-start p-5 rounded-xl transition-all duration-300 transform
                           bg-white dark:bg-gray-800 shadow-md hover:shadow-xl hover:-translate-y-1
                           border border-gray-100 dark:border-gray-700"
              >
                <div className="flex-shrink-0 mr-4" style={{ color: primary }}> {/* Icon color controlled here */}
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: primary }}>{value.title}</h3> {/* Bolded title */}
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
              href={`/${slug}/contact`}
              className="px-8 py-4 rounded-full text-white font-bold shadow-xl transition-all duration-300 ease-in-out
                          hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: primary, "--tw-ring-color": primary } as React.CSSProperties} // Dynamic ring color
            >
              Get a Quote
              <ArrowRightIcon className="h-5 w-5" /> {/* Replaced icon with ArrowRightIcon */}
            </Link>
            <Link
              href={`/${slug}/faq`}
              className="px-8 py-4 border-2 rounded-full font-medium transition-all duration-300 ease-in-out
                          hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-4 focus:ring-opacity-50"
              style={{ borderColor: primary, color: primary, "--tw-ring-color": primary } as React.CSSProperties} // Dynamic border/text/ring color
            >
              Read FAQs
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}