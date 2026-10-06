"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon, // Example icon for "Intuitive UI"
  RocketLaunchIcon, // Example icon for "Performance"
  CloudArrowUpIcon, // Example icon for "Scalability"
  ShieldCheckIcon, // Example icon for "Security"
  AdjustmentsHorizontalIcon, // Example icon for "Customization"
  ChartBarIcon, // Example icon for "Analytics"
  PuzzlePieceIcon, // Example icon for "Integration"
  UsersIcon, // Example icon for "Collaboration"
} from "@heroicons/react/24/outline";

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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
      delay: 0.4,
    },
  },
};

const imageVariantsRight = {
  hidden: { opacity: 0, x: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
      delay: 0.4,
    },
  },
};

// --- Dummy Data for Features (Replace with your actual data) ---
const mainFeatures = [
  {
    title: "Intuitive Dashboard & Analytics",
    description: "Gain actionable insights with our easy-to-use, customizable dashboards. Track key metrics and make data-driven decisions effortlessly.",
    image: "/images/feature-dashboard.png", // Replace with your dashboard screenshot
    alt: "Intuitive Dashboard Screenshot",
    icon: ChartBarIcon,
  },
  {
    title: "Seamless Team Collaboration",
    description: "Facilitate efficient teamwork with real-time collaboration tools, shared workspaces, and integrated communication features.",
    image: "/images/feature-collaboration.png", // Replace with your collaboration screenshot
    alt: "Team Collaboration Interface",
    icon: UsersIcon,
  },
  {
    title: "Powerful Integrations & API",
    description: "Connect with your favorite tools and extend functionality with our robust API, ensuring your workflow is always streamlined.",
    image: "/images/feature-integrations.png", // Replace with your integrations screenshot
    alt: "Integrations Screen",
    icon: PuzzlePieceIcon,
  },
];

const secondaryFeatures = [
  {
    title: "Blazing Fast Performance",
    description: "Experience lightning-fast load times and smooth operations, powered by optimized infrastructure.",
    icon: RocketLaunchIcon,
  },
  {
    title: "Enterprise-Grade Security",
    description: "Your data is protected with advanced encryption and compliance standards, ensuring peace of mind.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Scalable for Any Size",
    description: "Designed to grow with your business, our platform effortlessly handles increasing demands.",
    icon: CloudArrowUpIcon,
  },
  {
    title: "Customizable Workflows",
    description: "Tailor the platform to fit your unique business processes with flexible customization options.",
    icon: AdjustmentsHorizontalIcon,
  },
];

//──────────────────────────────────────────────────────────────────────────────
// FeaturesSection
//──────────────────────────────────────────────────────────────────────────────
export default function FeaturesSection({ features = [] }: { features?: any[] }) {
  // Use the dummy data if no features are passed (for demonstration)
  const allFeatures = features.length > 0 ? features : [...mainFeatures, ...secondaryFeatures];
  const displayMainFeatures = allFeatures.slice(0, mainFeatures.length);
  const displaySecondaryFeatures = allFeatures.slice(mainFeatures.length);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-indigo-700 dark:text-indigo-400 drop-shadow-sm"
            variants={itemVariants}
          >
            Unlock Limitless Possibilities
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Discover how our cutting-edge features empower your business to thrive in a competitive landscape.
          </motion.p>
        </motion.div>

        {/* --- Main Feature Blocks (Alternating Layout) --- */}
        {displayMainFeatures.map((f, i) => (
          <motion.div
            key={i}
            className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20 mb-24 lg:mb-32 p-6 rounded-3xl backdrop-filter backdrop-blur-lg bg-white/50 dark:bg-gray-800/50 shadow-xl border border-white/20 dark:border-gray-700/50`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            {/* Feature Text Content */}
            <motion.div className="flex-1 text-center lg:text-left space-y-6" variants={itemVariants}>
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <div className="p-4 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-lg">
                  {f.icon ? <f.icon className="h-8 w-8 text-white" /> : <CheckCircleIcon className="h-8 w-8 text-white" />}
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-snug">
                {f.title}
              </h3>
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
                {f.description}
              </p>
              <motion.a
                href="#" // Link to feature details page, or open modal
                className="inline-flex items-center gap-2 text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-semibold transition-colors group"
                whileHover={{ x: 5 }}
              >
                Learn more <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </motion.a>
            </motion.div>

            {/* Feature Image/Mockup */}
            <motion.div
              className="flex-1 relative w-full aspect-video md:aspect-[4/3] lg:aspect-[5/4] rounded-2xl overflow-hidden shadow-2xl border border-white/30 dark:border-gray-700 transform hover:scale-[1.02] transition-transform duration-300"
              variants={i % 2 === 0 ? imageVariants : imageVariantsRight}
            >
              <Image decoding="async"
                src={f.image || "/images/placeholder-feature.png"} // Fallback image
                alt={f.alt || f.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
                priority={i === 0} // Prioritize loading the first image
              />
              {/* Subtle overlay for visual depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 dark:to-black/30"></div>
            </motion.div>
          </motion.div>
        ))}

        {/* --- Secondary Features Grid --- */}
        {displaySecondaryFeatures.length > 0 && (
          <>
            <motion.div
              className="text-center mt-20 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
            >
              <motion.h3
                className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-4"
                variants={itemVariants}
              >
                And So Much More...
              </motion.h3>
              <motion.p
                className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                variants={itemVariants}
              >
                We're constantly innovating to bring you the tools you need to succeed.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
            >
              {displaySecondaryFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  className="relative p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-start border border-gray-200 dark:border-gray-700 group cursor-pointer"
                  variants={itemVariants}
                  whileHover={{ translateY: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }} // Enhanced shadow on hover
                >
                  {/* Icon Badge */}
                  <div className="mb-6 p-4 rounded-full bg-indigo-500 dark:bg-indigo-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                    {f.icon ? <f.icon className="h-7 w-7 text-white" /> : <CheckCircleIcon className="h-7 w-7 text-white" />}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-base flex-1">
                    {f.description}
                  </p>
                  <motion.a
                    href="#" // Link to feature details, or open modal
                    className="inline-flex items-center gap-2 mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                    whileHover={{ x: 3 }}
                  >
                    Explore <ArrowRightIcon className="h-4 w-4" />
                  </motion.a>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}