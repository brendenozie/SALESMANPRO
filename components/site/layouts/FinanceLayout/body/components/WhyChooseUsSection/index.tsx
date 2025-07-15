"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image'; // Import Image from next/image
import {
  ShieldCheckIcon, // Trusted Expertise
  HandThumbUpIcon, // Personalized Service
  ClockIcon, // Timely Communication
  UsersIcon, // Client-Focused
  SparklesIcon, // For a potential decorative element or an alternative feature icon
} from '@heroicons/react/24/solid';

// Framer Motion variants (reusing from previous sections for consistency)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Slightly faster stagger for features
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 }, // Cards animate from slightly below
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
const accentColor = "#66B2FF"; // A bright blue for icons/highlights

const features = [
  {
    id: 1,
    icon: ShieldCheckIcon,
    title: "Unrivaled Expertise",
    description: "Benefit from over two decades of combined legal and financial mastery, ensuring your matters are handled with precision.",
  },
  {
    id: 2,
    icon: HandThumbUpIcon,
    title: "Tailored Strategies",
    description: "Receive personalized solutions meticulously crafted to align with your unique objectives and intricate requirements.",
  },
  {
    id: 3,
    icon: ClockIcon,
    title: "Proactive Communication",
    description: "Experience prompt responses and transparent updates, keeping you informed and confident at every stage.",
  },
  {
    id: 4,
    icon: UsersIcon,
    title: "Client-Centric Approach",
    description: "Your success is our priority. We are dedicated to delivering exceptional service and building lasting relationships.",
  },
];

export default function WhyChooseUsSection() {
  return (
    <section
      id="why-choose-us" // Renamed ID for clarity
      className="py-20 sm:py-28 lg:py-36 relative overflow-hidden"
      style={{ background: `linear-gradient(to right, ${darkBackground}, ${cardBackground})` }} // Subtle gradient background for depth
    >
      {/* Background pattern for visual interest */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <Image
          src="/images/dots-pattern-light.svg" // Ensure this SVG exists in your public folder (subtle dots or grid)
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
            Why Our Clients Trust Us
          </h2>
          <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Discover the core principles that set us apart and consistently deliver outstanding results.
          </p>
        </motion.div>

        {/* Feature List Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.id}
              variants={itemVariants} // Use common itemVariants for consistent animation
              className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-[#1B2A41] to-[#122033] rounded-3xl shadow-xl border border-transparent hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] cursor-default"
            >
              <div className="flex-shrink-0 p-4 bg-blue-600/20 text-blue-400 rounded-full mb-6 transition-colors duration-300 group-hover:bg-blue-500/30">
                {React.createElement(f.icon, { className: "h-12 w-12" })} {/* Dynamic icon rendering */}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 leading-tight group-hover:text-blue-200 transition-colors duration-300">
                {f.title}
              </h3>
              <p className="text-blue-100/80 text-base leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}