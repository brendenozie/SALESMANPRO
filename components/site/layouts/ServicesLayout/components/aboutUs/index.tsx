'use client';

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  StarIcon,
  ShieldCheckIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// Utility function for Next.js Image loader (Kept unchanged)
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function AboutSection() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400 text-lg animate-pulse">
          Gathering insights for you...
        </p>
      </div>
    );
  }

  const { slug, bannerUrl, name, description, themeSettings, CoreValues } =
    storeFormData;

  const primaryColor = themeSettings?.primaryColor ?? "#43A047";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFB300";

  // Animation variants (Kept unchanged - they are great)
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemSlideIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  // --- Core Values Logic (Kept unchanged) ---
  const values = CoreValues ?? [];
  let listValues = values;
  let guaranteedValue: typeof values[number] | null = null;

  if (values.length === 1) {
    listValues = [];
    guaranteedValue = values[0];
  } else if (values.length === 4) {
    listValues = values.slice(0, 3);
    guaranteedValue = values[3];
  }

  return (
    <section className="relative overflow-hidden py-28 lg:py-40 bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-50">
      
      {/* Background Blob Shapes (Unchanged) */}
      <div className="absolute inset-0 z-0 opacity-15 blur-3xl"> 
        <motion.div
          className="absolute rounded-full -top-20 -left-20 w-96 h-96"
          style={{ backgroundColor: primaryColor }}
          animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
        />
        <motion.div
          className="absolute rounded-full -bottom-30 -right-30 w-[400px] h-[400px]"
          style={{ backgroundColor: secondaryColor }}
          animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", repeatType: "mirror", delay: 5 }}
        />
      </div>

      {/* Subtle Background Pattern (Unchanged) */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          background: `radial-gradient(circle, ${primaryColor}50 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left: Text Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-8 order-2 lg:order-1 text-center lg:text-left"
        >
            {/* NEW: Intro container for subtle visual separation and focus */}
            <motion.div variants={itemSlideIn} className="flex flex-col items-center lg:items-start">
                <span
                  className="inline-block text-base font-semibold tracking-widest uppercase text-gray-600 dark:text-gray-400"
                >
                    Our Journey & Commitment
                </span>

                <motion.h2
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mt-2"
                  variants={itemSlideIn}
                >
                    About{" "}
                    <span
                      className="bg-clip-text text-transparent"
                      style={{ 
                        backgroundImage: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})` 
                      }}
                    >
                      {name}
                    </span>
                </motion.h2>
            </motion.div>
            

            <motion.p
              className="text-lg sm:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 text-gray-700 dark:text-gray-300"
              variants={itemSlideIn}
            >
              {description ||
                `At **${name}**, we're passionate about simplifying your life through **exceptional service**. With a dedication to quality and a team of trusted professionals, we ensure every interaction is seamless and satisfying.`}
            </motion.p>

          {/* Core Values Section */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
          >
            {listValues.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemSlideIn}
                custom={index}
                // Glassmorphism and border refinement
                className="flex flex-col items-center p-6 rounded-2xl transition-all duration-500 transform bg-white/50 dark:bg-gray-700/50 shadow-2xl hover:shadow-primary-lg hover:-translate-y-1 group relative overflow-hidden backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                style={{ 
                    // Removed individual border style since we added a Tailwind border
                    "--tw-shadow-primary-lg": `0 10px 15px -3px ${primaryColor}30, 0 4px 6px -4px ${primaryColor}30`,
                } as React.CSSProperties}
              >
                {/* Subtle Primary Color Accent Bar on Top (Unchanged) */}
                <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primaryColor, opacity: 0.7 }} />

                <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="mb-4 text-white p-3 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-50">
                    {value.title}
                  </h3>
                  <p className="text-md opacity-80 text-center text-gray-700 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Guaranteed Section (Unchanged) */}
          {guaranteedValue && (
            <motion.div
              variants={itemSlideIn}
              className="relative col-span-1 md:col-span-3 p-6 sm:p-8 rounded-3xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] flex flex-col sm:flex-row items-center justify-between mt-8 shadow-xl"
              style={{ 
                    backgroundColor: primaryColor,
                    borderBottom: `6px solid ${secondaryColor}`,
                }}
              >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-black/10 transition-colors duration-300"></div>
              <div className="relative text-white text-center sm:text-left flex-grow">
                <h3 className="text-2xl font-extrabold mb-1">
                  {guaranteedValue.title || "Guaranteed Satisfaction"}
                </h3>
                <p className="text-base opacity-95 font-medium">
                  {guaranteedValue.description ||
                    "We stand behind our work. Your complete satisfaction is our ultimate priority."}
                </p>
              </div>
              <div className="w-16 h-16 mt-4 sm:mt-0 flex items-center justify-center rounded-full bg-white transition-colors duration-300 flex-shrink-0 shadow-inner">
                {guaranteedValue.icon || (
                  <ShieldCheckIcon className="w-9 h-9" style={{ color: secondaryColor }} />
                )}
              </div>
            </motion.div>
          )}

          {/* CTA Buttons (Unchanged) */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-4 pt-8"
            variants={itemSlideIn}
          >
            <Link
              href={`/${slug}/contact`}
              className="px-8 py-4 rounded-full text-white font-bold shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center gap-2"
              style={
                {
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 15px -3px ${primaryColor}40, 0 4px 6px -4px ${primaryColor}40`,
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties
              }
            >
              Get a Quote
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href={`/${slug}/faq`}
              className="px-8 py-4 border-2 rounded-full font-bold transition-all duration-300 ease-in-out hover:bg-gray-100 hover:scale-[1.03] dark:hover:bg-gray-800"
              style={
                {
                  borderColor: primaryColor,
                  color: primaryColor,
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties
              }
            >
              Read FAQs
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Image Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-center lg:justify-end order-1 lg:order-2"
        >
          <div className="relative w-full max-w-lg aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group shadow-2xl">
            {/* Background "Frame" Enhancement (Unchanged) */}
            <div
              className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 transform translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0"
              style={{ background: primaryColor }}
            />

            {/* Main Image */}
            <Image
              src={bannerUrl || "/placeholder-about.jpg"}
              alt={`${name} About Image`}
              layout="fill"
              objectFit="cover"
              className="rounded-3xl transition-all duration-500 ease-in-out group-hover:scale-[1.03] **border-4 border-white dark:border-gray-950**" // Added border for crisp edge
              loader={loader}
            />

            {/* Gradient Overlay (Unchanged) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-black/20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}