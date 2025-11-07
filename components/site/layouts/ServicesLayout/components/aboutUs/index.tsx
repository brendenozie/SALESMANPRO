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

// Utility function for Next.js Image loader (Unchanged)
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

// Custom Card Hover Variant for Interactivity
const cardHover = {
    scale: 1.05,
    y: -5,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)",
    transition: { type: "spring", stiffness: 200, damping: 12 },
};

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

  // Colors
  const primaryColor = themeSettings?.primaryColor ?? "#43A047";
  const secondaryColor = themeSettings?.secondaryColor ?? "#FFB300";

  // Animation variants (Adjusted timing slightly for snappier feel)
  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Faster stagger for engagement
      },
    },
  };

  const itemSlideIn = {
    hidden: { opacity: 0, y: 20 }, // Less vertical shift for subtlety
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  // --- Core Values Logic (Unchanged) ---
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
    <section className="relative overflow-hidden py-28 lg:py-40 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      
      {/* Dynamic Background Blobs (More captivating motion) */}
      <div className="absolute inset-0 z-0 opacity-15 blur-3xl pointer-events-none"> 
        <motion.div
          className="absolute rounded-full -top-40 -left-40 w-96 h-96"
          style={{ backgroundColor: primaryColor }}
          animate={{ x: [0, 80, 0], y: [0, -50, 0], scale: [1, 1.1, 1], rotate: [0, 30, 0] }} // Added rotation
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
        />
        <motion.div
          className="absolute rounded-full -bottom-40 -right-40 w-[450px] h-[450px]"
          style={{ backgroundColor: secondaryColor }}
          animate={{ x: [0, -70, 0], y: [0, 50, 0], scale: [1, 1.1, 1], rotate: [0, -45, 0] }} // Added rotation
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut", repeatType: "mirror", delay: 5 }}
        />
      </div>

      {/* Subtle Background Pattern (Increased density for visual texture) */}
      <div
        className="absolute inset-0 z-0 opacity-10 dark:opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${primaryColor}50 1px, transparent 1px)`,
          backgroundSize: "20px 20px", // Reduced size for higher density
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* Left: Text Content & Values (Intuitive & Engaging) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={staggerContainer}
          viewport={{ once: true, amount: 0.3 }}
          className="space-y-10 order-2 lg:order-1 text-center lg:text-left" // Increased space-y for better flow
        >
          
          {/* Header Block */}
          <motion.div variants={itemSlideIn} className="flex flex-col items-center lg:items-start">
            <span
              className="inline-block text-lg font-bold tracking-widest uppercase mb-1"
              style={{ color: primaryColor }} // Used primary color for emphasis
            >
              🤝 Our Story, Our Promise
            </span>

            <motion.h2
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tighter"
              variants={itemSlideIn}
            >
              Who is{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ 
                  backgroundColor: primaryColor,
                }}
              >
                {name}
              </span>
              ?
            </motion.h2>
          </motion.div>
          
          {/* Description */}
          <motion.p
            className="text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 text-gray-700 dark:text-gray-300 border-l-4 pl-4" // Added left border for visual depth
            style={{ borderColor: primaryColor }}
            variants={itemSlideIn}
          >
            {description ||
              `At **${name}**, we're passionate about simplifying your life through **exceptional service**. With a dedication to quality and a team of trusted professionals, we ensure every interaction is seamless and satisfying. We're more than a service provider; we're your dedicated partner in achieving your goals.`}
          </motion.p>

          {/* Core Values Section (Visually Appealing & Interactive) */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4"
          >
            {listValues.map((value, index) => (
              <motion.div
                key={value.title}
                variants={itemSlideIn}
                whileHover={cardHover} // Apply custom hover effect
                custom={index}
                className="flex flex-col items-center p-6 rounded-2xl transition-all duration-500 transform **bg-white/70 dark:bg-gray-800/70** shadow-lg **hover:shadow-xl** group relative overflow-hidden **backdrop-blur-md** border border-gray-100 dark:border-gray-700" // Enhanced Glassmorphism effect
              >
                {/* Primary Color Shadow/Glow on Hover */}
                <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" 
                    style={{ 
                        background: `radial-gradient(circle at center, ${primaryColor} 0%, transparent 70%)` 
                    }} 
                />
                
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="mb-4 text-white p-4 rounded-full flex items-center justify-center transition-all duration-300 **ring-4 ring-offset-2 dark:ring-offset-gray-800** group-hover:scale-105" // Added a ring effect
                    style={{ backgroundColor: primaryColor, ["--tw-ring-color"]: secondaryColor } as React.CSSProperties}
                  >
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-extrabold mb-1 text-gray-900 dark:text-gray-50 text-center">
                    {value.title}
                  </h3>
                  <p className="text-sm opacity-80 text-center text-gray-700 dark:text-gray-300 mt-1">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Guaranteed Section (Slightly enhanced border/shadow) */}
          {guaranteedValue && (
            <motion.div
              variants={itemSlideIn}
              className="relative col-span-1 md:col-span-3 p-6 sm:p-8 rounded-3xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.01] flex flex-col sm:flex-row items-center justify-between mt-8 shadow-2xl"
              style={{ 
                backgroundColor: primaryColor,
                border: `4px solid ${secondaryColor}`, // Changed to full border for better framing
              }}
            >
              <div className="absolute inset-0 bg-white/10 group-hover:bg-black/10 transition-colors duration-300"></div>
              <div className="relative text-white text-center sm:text-left flex-grow space-y-1">
                <h3 className="text-2xl font-extrabold leading-snug">
                  🎉 {guaranteedValue.title || "Guaranteed Satisfaction"}
                </h3>
                <p className="text-base opacity-95 font-medium">
                  {guaranteedValue.description ||
                    "We stand behind our work. Your complete satisfaction is our ultimate priority. Experience the difference today."}
                </p>
              </div>
              <div className="w-16 h-16 mt-4 sm:mt-0 flex items-center justify-center rounded-full bg-white transition-colors duration-300 flex-shrink-0 shadow-lg">
                {guaranteedValue.icon || (
                  <ShieldCheckIcon className="w-9 h-9" style={{ color: secondaryColor }} />
                )}
              </div>
            </motion.div>
          )}

          {/* CTA Buttons (Stronger visual impact) */}
          <motion.div
            className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8"
            variants={itemSlideIn}
          >
            <Link
              href={`/${slug}/contact`}
              className="px-10 py-4 rounded-full text-white font-extrabold text-lg tracking-wider shadow-2xl transition-all duration-300 ease-in-out hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-opacity-70 flex items-center justify-center gap-2"
              style={
                {
                  backgroundColor: primaryColor,
                  boxShadow: `0 10px 20px -5px ${primaryColor}60`, // Stronger primary shadow
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties
              }
            >
              Start Your Journey
              <ArrowRightIcon className="h-5 w-5 ml-1" />
            </Link>
            <Link
              href={`/${slug}/faq`}
              className="px-10 py-4 border-2 rounded-full font-bold text-lg transition-all duration-300 ease-in-out hover:bg-gray-100 hover:scale-[1.05] dark:hover:bg-gray-800"
              style={
                {
                  borderColor: primaryColor,
                  color: primaryColor,
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties
              }
            >
              Learn More
            </Link>
          </motion.div>
        </motion.div>

        {/* Right: Image Section (More polished) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={fadeIn}
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-center lg:justify-end order-1 lg:order-2"
        >
          <div className="relative w-full max-w-lg aspect-[4/3] lg:aspect-[3/4] rounded-3xl overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-primary-lg"
             style={{ 
                "--tw-shadow-primary-lg": `0 25px 50px -12px ${primaryColor}60`, // Added a shadow variable for stronger glow
            } as React.CSSProperties}>
            
            {/* Background "Frame" Enhancement */}
            <div
              className="absolute inset-0 rounded-3xl -z-10 transition-all duration-700 transform translate-x-5 translate-y-5 group-hover:translate-x-0 group-hover:translate-y-0" // Increased offset for drama
              style={{ background: primaryColor }}
            />

            {/* Main Image */}
            <Image
              src={bannerUrl || "/placeholder-about.jpg"}
              alt={`${name} About Image`}
              layout="fill"
              objectFit="cover"
              className="rounded-3xl transition-all duration-700 ease-in-out group-hover:scale-[1.05] saturate-[0.9] hover:saturate-100 border-4 border-white dark:border-gray-950" 
              loader={loader}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}