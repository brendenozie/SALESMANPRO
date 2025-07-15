"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import {
  DocumentTextIcon, // For Consultation
  CalendarDaysIcon, // For Planning
  CheckBadgeIcon, // For Execution
  HandThumbUpIcon, // For Delivery
  ArrowLongRightIcon, // For desktop timeline arrow
} from '@heroicons/react/24/solid'; // Ensure all required icons are imported

// Framer Motion variants (reusing from previous sections for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Slightly faster stagger for steps
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 }, // Steps animate from slightly below
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7, // Smooth entrance duration
      ease: "easeOut",
    },
  },
};

// Colors (matching the previous sections)
const darkBackground = "#0A192F"; // From services section
const cardBackground = "#1B2A41"; // From services section
const accentColor = "#66B2FF"; // A bright blue for highlights
const textColorLight = "#E0E7FF"; // Lighter blue for text on dark background
const textColorMuted = "#A7B8D6"; // Muted blue for secondary text

const steps = [
  {
    id: 1,
    icon: DocumentTextIcon,
    title: "Initial Consultation",
    description: "We begin by understanding your unique needs, challenges, and aspirations through a detailed discussion.",
  },
  {
    id: 2,
    icon: CalendarDaysIcon,
    title: "Strategic Planning",
    description: "Our experts meticulously craft a tailored roadmap, outlining clear objectives and a precise timeline for success.",
  },
  {
    id: 3,
    icon: CheckBadgeIcon,
    title: "Seamless Execution",
    description: "We rigorously implement the agreed-upon strategy, ensuring meticulous attention to detail and full compliance.",
  },
  {
    id: 4,
    icon: HandThumbUpIcon,
    title: "Ongoing Support & Review",
    description: "Receive comprehensive results and continuous support to ensure the sustained success and optimization of your affairs.",
  },
];

export default function ProcessWorkflowSection() {
  return (
    <section
      id="our-process"
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: darkBackground }} // Consistent dark background
    >
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image
          src="/images/lines-pattern-dark.svg" // Subtle lines or grid pattern (darker version for dark background)
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
        {/* Section Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-md">
            Our Streamlined Process
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            We guide you through every step with clarity, expertise, and unwavering dedication.
          </p>
        </motion.div>

        {/* Process Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative grid gap-12 md:grid-cols-2 lg:grid-cols-4 md:gap-x-8 md:gap-y-20 justify-items-center"
        >
          {/* Central Connecting Line for Larger Screens */}
          <div className="hidden lg:block absolute top-[calc(10rem/2)] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-700/50 to-transparent rounded-full z-0"></div>

          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className="relative flex flex-col items-center text-center max-w-xs group" // Added group for hover effects
            >
              {/* Step Number Circle */}
              <div className="relative z-10 flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-blue-700 border-4 border-blue-500 shadow-xl group-hover:bg-blue-600 group-hover:border-blue-400 transition-all duration-300">
                <span className="text-white text-2xl font-bold">{idx + 1}</span>
              </div>

              {/* Step Content */}
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-200 transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-blue-100/80 text-base leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line for Mobile */}
              {idx < steps.length - 1 && (
                <div className="absolute top-[calc(10rem+6rem)] left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-blue-700 block lg:hidden" />
              )}

              {/* Desktop Connectors - Arrows & Lines */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-[calc(10rem/2)] left-[calc(100% + 0.5rem)] transform -translate-y-1/2">
                    <ArrowLongRightIcon className="h-10 w-10 text-blue-500/80" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}