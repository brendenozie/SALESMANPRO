'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldExclamationIcon, // Vigilance
  FingerPrintIcon,      // Integrity/Identity
  LockClosedIcon,       // Protection
  RocketLaunchIcon,     // Innovation/Execution
  ArrowRightIcon,
  CodeBracketSquareIcon, // Technicality
} from '@heroicons/react/24/solid'; // Use solid icons for greater impact
import Image from 'next/image';
import { ICoreValue } from '@/types/typings';

// Framer Motion variants (kept for smooth experience)
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  hover: {
    scale: 1.03,
    translateY: -5,
    boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
    transition: { duration: 0.3 },
  },
};

const iconMap = {
  Vigilance: ShieldExclamationIcon,
  Integrity: FingerPrintIcon,
  Protection: LockClosedIcon,
  Innovation: RocketLaunchIcon,
  Technical: CodeBracketSquareIcon,
};

type IconKey = keyof typeof iconMap;

interface CoreValuesSectionProps {
  themeSettings: Record<string, any> | undefined | null;
  CoreValues: ICoreValue[];
}

export default function CoreValuesSectionSecurityLight({ themeSettings, CoreValues }: CoreValuesSectionProps) {

  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Teal (Tech/Safety)
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6'; // Blue (Trust/Cyber)
  // Subtle light background for the card header/accent
  const accentBg = `${primaryColor}10`; 

  // --- SECURITY-FOCUSED FALLBACK CORE VALUES ---
  const defaultSecurityCoreValues: ICoreValue[] = [
    {
      id: "cv1",
      title: "Unwavering Vigilance",
      description: "We maintain a 24/7 proactive stance, ensuring threats are predicted and mitigated before they materialize.",
      icon: "Vigilance",
    },
    {
      id: "cv2",
      title: "Absolute Integrity",
      description: "Confidentiality, transparency, and ethical conduct are non-negotiable in all our client engagements.",
      icon: "Integrity",
    },
    {
      id: "cv3",
      title: "Client-Centric Protection",
      description: "Our solutions are tailored, prioritizing your business continuity and specific compliance requirements above all else.",
      icon: "Protection",
    },
    {
      id: "cv4",
      title: "Relentless Innovation",
      description: "We continuously adapt our defense strategies, leveraging the latest AI and threat intelligence to stay ahead of adversaries.",
      icon: "Innovation",
    },
    // Adding a fifth for visual balance if needed, or keeping it at 4
    {
      id: "cv5",
      title: "Technical Mastery",
      description: "Our team comprises certified, elite experts with deep domain knowledge in penetration testing and security architecture.",
      icon: "Technical",
    },
  ];

  // Map values to render, prioritizing the first few
  const coreValuesToRender: ICoreValue[] =
    CoreValues && CoreValues.length > 0
      ? CoreValues.map((val: any, idx: number) => ({
          ...val,
          // Ensure icons are mapped correctly or fall back to a specific set
          label: val.label || defaultSecurityCoreValues[idx]?.icon || 'Vigilance',
        })).slice(0, 5) // Limit to 5 for a potential 3-2 or 2-3 grid layout
      : defaultSecurityCoreValues.slice(0, 5); // Use 5 default security values

  const gridClass = coreValuesToRender.length === 3 
    ? "lg:grid-cols-3" 
    : coreValuesToRender.length === 4 
      ? "md:grid-cols-2 lg:grid-cols-4" 
      : "md:grid-cols-2 lg:grid-cols-3"; // Default to 3, wrapping to 2

  return (
    <AnimatePresence>
      <section
        id="core-values"
        className="relative py-24 md:py-32 px-6 lg:px-16 overflow-hidden bg-white text-gray-900" // Light Mode Background
      >
        {/* Background animation - Toned down for Light Mode */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <motion.div
            className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl"
            style={{ backgroundColor: primaryColor }}
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl"
            style={{ backgroundColor: secondaryColor }}
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Heading */}
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 leading-tight drop-shadow-sm"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              The Foundational <span style={{ color: primaryColor }}>Pillars</span> of Our <span style={{ color: secondaryColor }}>Trust</span>
            </motion.h2>
            <motion.p
              className="mt-4 text-gray-600 text-lg md:text-xl"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              These are the core principles that define our commitment to your security and our standard of excellence.
            </motion.p>
          </div>

          {/* Core Values Grid */}
          <motion.div
            className={`grid grid-cols-1 gap-8 ${gridClass}`}
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {coreValuesToRender.map((item, idx) => {
              const IconComponent = iconMap[item.icon as IconKey] || ShieldExclamationIcon;
              
              return (
                <motion.div
                  key={item.id || `cv-${idx}`}
                  className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white transition-all duration-300 group"
                  variants={cardVariants}
                  whileHover="hover"
                >
                  <div className="p-8 h-full flex flex-col justify-start">
                    
                    {/* Header Block - Color Accent */}
                    <div 
                        className="p-4 rounded-xl flex items-center shadow-lg w-fit mb-6"
                        style={{ backgroundColor: accentBg }}
                    >
                        <IconComponent 
                            className="w-10 h-10" 
                            style={{ color: primaryColor }} 
                        />
                    </div>
                    
                    <span 
                        className="text-xs uppercase tracking-widest font-bold mb-2"
                        style={{ color: secondaryColor }}
                    >
                        {item.icon}
                    </span>
                    
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 leading-snug">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-gray-600 text-base leading-relaxed mb-8 flex-grow">
                        {item.description}
                      </p>
                    )}
                    
                    {/* Consistent CTA Button */}
                    <button
                      className="inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all duration-300 w-fit text-white shadow-md hover:shadow-lg"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Explore Our Commitment
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          
          {/* Fallback to display the static placeholder image if only the original code was used */}
          {coreValuesToRender.length === 0 && (
            <div className='text-center text-gray-500 mt-12'>
                <p>No core values data available. Displaying default security placeholders.</p>
            </div>
          )}
        </div>
      </section>
    </AnimatePresence>
  );
}