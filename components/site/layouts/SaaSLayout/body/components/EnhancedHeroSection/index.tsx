"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  StarIcon,
  PlusIcon,
  XMarkIcon,
  SparklesIcon, // Added for a touch of magic/innovation
  RocketLaunchIcon, // Added for speed/growth
  ShieldCheckIcon, // Added for security/trust
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// Mocking the image loader for demonstration purposes
const customLoader = ({ src, width, quality }: any) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Animation variants for staggered reveal (reused for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each item animates with a slight delay
      delayChildren: 0.2, // Overall delay before children start
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring", // More natural bounce
      stiffness: 100, // Less stiff
      damping: 10, // More damping
    },
  },
};

// New animation for the product mockup
const mockupVariants = {
  hidden: { opacity: 0, x: 100, rotate: 5, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15,
      delay: 1, // Appear after text
    },
  },
};

// --- Value Proposition Data (example) ---
const valuePropositions = [
  { icon: RocketLaunchIcon, text: "Blazing Fast" },
  { icon: ShieldCheckIcon, text: "Ironclad Security" },
  { icon: SparklesIcon, text: "Intuitive Design" },
];

//──────────────────────────────────────────────────────────────────────────────
// EnhancedHeroSection
//──────────────────────────────────────────────────────────────────────────────
export default function EnhancedHeroSection({
  store,
  loader,
  handleSignup,
}: {
  store: any;
  loader: any;
  handleSignup: () => void;
}) {
  return (
    <section
      className="relative flex flex-col lg:flex-row justify-center items-center h-screen overflow-hidden bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-600 dark:from-gray-950 dark:via-gray-800 dark:to-gray-900 text-white"
      role="region"
      aria-label="Hero Section for SaaS and Web Apps"
    >
      {/* Animated Background Layers: Subtle Parallax & Gradient */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <Image decoding="async"
          src={store.bannerUrl || "/images/default-saas-hero.jpg"} // Fallback image
          alt={`${store.name} background`}
          fill
          className="object-cover opacity-15 blur-md brightness-75 will-change-transform"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Dynamic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-indigo-900/30 to-purple-800/40 animate-pulse-subtle"></div>
        {/* Conceptual: Add a particles.js or react-tsparticles component here for dynamic background */}
        {/* <ParticlesBg type="cobweb" bg={true} color="#ffffff" num={100} /> */}
      </motion.div>

      {/* Main Content Area */}
      <div className="relative z-20 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl px-6 md:px-12 gap-12">
        {/* Text Content */}
        <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8">
          {/* Subtitle / Tagline */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
            className="text-sm md:text-base uppercase tracking-widest text-indigo-200"
          >
            {store.tagline ?? "Unleash the Power of Innovation"}
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
            className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight drop-shadow-xl text-white"
          >
            {/* Consider a text split animation here for even more impact */}
            {store.name ?? "Your Next-Gen SaaS Solution"}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/90 mx-auto lg:mx-0 max-w-2xl"
          >
            {store.description ??
              "Transform your workflow, scale your business, and achieve unparalleled efficiency with our cutting-edge platform."}
          </motion.p>

          {/* Call-to-Action */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6, ease: "backOut" }}
            className="pt-4"
          >
            <button
              onClick={handleSignup}
              className="inline-flex items-center gap-3 bg-white text-indigo-700 hover:bg-indigo-100 font-bold py-4 px-10 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700
                         relative overflow-hidden group" // Added for shine effect
            >
              <ArrowRightIcon className="h-6 w-6 transform group-hover:rotate-6 transition-transform" />
              Get Started Now
              {/* Shine effect */}
              <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 transform -skew-x-12 -translate-x-full group-hover:opacity-30 group-hover:translate-x-full transition-all duration-700 ease-out"></span>
            </button>
          </motion.div>

          {/* Value Propositions / Key Features */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 pt-6"
          >
            {valuePropositions.map((prop, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center text-white/80 text-sm md:text-base font-medium"
              >
                <prop.icon className="h-5 w-5 text-indigo-300 mr-2" />
                {prop.text}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Product Mockup / Visual Demonstration */}
        <motion.div
          variants={mockupVariants}
          initial="hidden"
          animate="visible"
          className="relative flex-1 hidden lg:flex justify-center items-center p-8"
        >
          {/* Placeholder for your actual SaaS / Web App Mockup Image */}
          {/* Use a high-quality, transparent PNG of your app's UI on a device */}
          <Image decoding="async"
            src="/images/saas-app-mockup.png" // Replace with your actual mockup image
            alt={`${store.name} app interface`}
            width={700} // Adjust width as needed
            height={450}
            priority
            className="rounded-xl shadow-3xl border border-white/10"
            style={{
              // Optional: Add a subtle 3D tilt on hover for engagement
              transform: "perspective(1000px) rotateY(-5deg) rotateX(5deg)",
              transition: "transform 0.5s ease-out",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform =
                "perspective(1000px) rotateY(0deg) rotateX(0deg)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform =
                "perspective(1000px) rotateY(-5deg) rotateX(5deg)")
            }
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-white/5 blur-3xl rounded-full animate-pulse-slow"></div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 md:bottom-10 flex flex-col items-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <ChevronDownIcon className="h-7 w-7 text-white/80 animate-bounce" />
        <p className="text-sm text-white/80">Learn More</p>
      </motion.div>

      {/* Decorative SVG Wave (Remains a nice touch) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg
          className="relative block w-full h-24 md:h-32" // Adjusted height
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.92C195.74,72.13,97.19,106.94,0,120V0H1200V27.35C1085.81,59.06,970.16,46.85,852.27,32.13c-176.4-23-343.75-40.84-510.88-4.23C298.78,39.76,320.64,52.71,321.39,56.92Z"
            fill="rgba(255,255,255,0.08)" // Softer fill to blend with background
          />
        </svg>
      </div>
    </section>
  );
}