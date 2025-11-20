'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import {
  CheckIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'; 
import { motion, useInView } from 'framer-motion';
import { ICoreValue } from '@/types/typings';

// --- ANIMATION VARIANTS ---
// Updated for a subtle 3D 'flipping' entrance
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
  hidden: { opacity: 0, y: 50, rotateX: 10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

// Map string icon names to Heroicon components
const IconMap: { [key: string]: React.ElementType } = {
  CheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  Cog6ToothIcon,
  SparklesIcon,
};

interface FeaturesSectionProps {
    name : string | null | undefined;
    description : string | null | undefined;
    themeSettings: Record<string, any> | null | undefined;
    CoreValues: ICoreValue[] | null | undefined ;
}

// Sample props for demonstration (if context data is missing)
const sampleProps: FeaturesSectionProps = {
    name: 'SwiftCare',
    description: 'Experience seamless booking and unparalleled service quality for all your needs—fast, flexible, and utterly reliable. Simplify your life with us.',
    themeSettings: { primaryColor: '#059669' },
    CoreValues: [] , 
}

export default function FeaturesSection({ name, description, themeSettings, CoreValues }: FeaturesSectionProps = sampleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const defaultFeatures: ICoreValue[] = [
    {
      icon: 'CheckIcon',
      title: 'Lightning-Fast Booking',
      description: 'Find, schedule, and confirm any service in seconds. Seamlessly integrated for modern life.',
    },
    {
      icon: 'UserGroupIcon',
      title: 'Elite Network of Pros',
      description: `Access a curated list of highly-rated, insured, and experienced local service providers.`,
    },
    {
      icon: 'LockClosedIcon',
      title: 'Guaranteed Secure Payment',
      description: 'Protected transactions using cards and digital wallets. Safety is built into every click.',
    },
    {
      icon: 'AdjustmentsVerticalIcon',
      title: 'Customized Solutions',
      description: 'Easily modify and adapt packages to get a service that perfectly matches your specific requirements.',
    },
    {
      icon: 'ClockIcon',
      title: 'Live Schedule Sync',
      description: 'View real-time availability and lock in your appointment instantly. No more phone tag or guesswork.',
    },
    {
      icon: 'SparklesIcon',
      title: 'Quality Vetting Process',
      description: 'Every expert is rigorously vetted and background-checked, ensuring exceptional quality and trust.',
    },
  ];

  const primaryColor = themeSettings?.primaryColor || '#059669';
  const processCoreValues = CoreValues?.length ? CoreValues : defaultFeatures;

  // Helper for dynamic RGB shadows
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '5, 150, 105';
  };
  const primaryRgb = hexToRgb(primaryColor);

  return (
    <section id="benefits" ref={ref} className="relative bg-gray-50/50 py-24 px-6 sm:px-12 text-gray-900 overflow-hidden">
      
      {/* 1. ANIMATED BACKGROUND ORBS (Atmosphere) */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none">
        {/* Orb 1 */}
        <motion.div
          className="absolute w-96 h-96 -top-20 -right-20 rounded-full filter blur-3xl opacity-50 animate-blob"
          style={{ backgroundColor: primaryColor }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        {/* Orb 2 */}
        <motion.div
          className="absolute w-80 h-80 bottom-0 left-0 rounded-full bg-teal-400 filter blur-3xl opacity-50 animate-blob animation-delay-4000"
          animate={{ scale: [1, 0.8, 1], rotate: [0, -45, 0] }}
          transition={{ duration: 30, repeat: Infinity, delay: 5 }}
        />
        {/* Subtle grid pattern for texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-color-gray-200)_1px,_transparent_1px)] [background-size:20px_20px] opacity-10" />
      </div>
      
      {/* 2. Section Header */}
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.span
          className="inline-block text-sm font-bold px-6 py-2 rounded-full text-white shadow-xl uppercase tracking-wider"
          style={{ backgroundColor: primaryColor }}
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Uncover the **{name || 'Platform'}** Difference
        </motion.span>

        <motion.h2
          className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tighter text-gray-900 leading-snug"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          Why Our Users <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${primaryColor}, #10B981)` }}>Choose Our Platform</span>
        </motion.h2>

        <motion.p
          className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          {description}
        </motion.p>
      </div>

      {/* 3. Feature Cards Grid */}
      <motion.div
        className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {processCoreValues.map(({ icon, title, description }, i) => {
          const FeatureIcon = IconMap[(icon ?? 'CheckIcon') as keyof typeof IconMap] ?? CheckIcon;
          return (
            <motion.div
              key={title}
              className="bg-white/85 backdrop-blur-md rounded-3xl border border-white/50 p-8 shadow-xl transition-all duration-500 group relative overflow-hidden flex flex-col hover:shadow-2xl"
              variants={itemVariants}
              // Enhanced Hover Effect: Lifts, subtly rotates, and creates a primary color glow shadow
              whileHover={{ 
                scale: 1.03, 
                translateY: -5, 
                rotate: 0.5, 
                boxShadow: `0 20px 40px -10px rgba(${primaryRgb}, 0.3), 0 5px 10px -2px rgba(0,0,0,0.05)`
              }}
            >
              {/* Subtle accent line on hover */}
              <div 
                  className="absolute top-0 left-0 w-full h-1" 
                  style={{ backgroundColor: primaryColor }}
              />

              <div
                // Icon styling: Larger, gradient background, subtle shadow/glow
                className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg mb-5 relative z-10 transition-all duration-300 ring-4 ring-white"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${primaryColor}, #10B981)`,
                  boxShadow: `0 5px 20px -5px rgba(${primaryRgb}, 0.6)`,
                }}
              >
                {FeatureIcon && <FeatureIcon className="w-8 h-8 text-white" />}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200 relative z-10">
                {title}
              </h3>
              <p className="text-lg text-gray-600 mt-3 relative z-10 flex-grow">{description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

// NOTE: Ensure your CSS includes the necessary keyframes for the 'animate-blob' class 
// if you want the background orbs to gently move:
/*
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob { animation: blob 25s infinite; }
*/