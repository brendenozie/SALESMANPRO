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
  SparklesIcon, // Added an icon for a new feature suggestion
} from '@heroicons/react/24/outline'; // Switched to outline for a modern touch
import { motion, useInView } from 'framer-motion';
import { ICoreValue } from '@/types/typings';

// --- Sample Data & Types (Defined for a self-contained, runnable example) ---
// Placeholder types for context integration
// type ICoreValue = {
//   icon: string;
//   title: string;
//   description: string;
// };
// const useStoreContext = () => ({
//   storeFormData: null, // Assume no data for this example
// });
// ------------------------------------------------------------------------

// Animation variants for staggered appearance
// 🌟 ENHANCEMENT: Adjusted transition for a more fluid, modern reveal.
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
  hidden: { opacity: 0, y: 30, rotateX: -10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
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

// Sample props for demonstration
const sampleProps: FeaturesSectionProps = {
    name: 'SwiftCare',
    description: 'Experience seamless booking and unparalleled service quality for all your needs—fast, flexible, and utterly reliable. Simplify your life with us.',
    themeSettings: {
      primaryColor: '#059669', // A darker, richer teal/emerald for better contrast
    },
    CoreValues: [] , // Empty to trigger default features
  }

export default function FeaturesSection({ name, description, themeSettings, CoreValues }: FeaturesSectionProps = sampleProps) {
  // const { storeFormData } = useStoreContext();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 }); // Use isInView hook

  // 🌟 ENHANCEMENT: Updated features descriptions for a punchier, benefit-focused message
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
      description: 'Protected transactions using MPESA, Card, and digital wallets. Safety is built into every click.',
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
      icon: 'SparklesIcon', // Using the new icon for a modern feature
      title: 'Quality Vetting Process',
      description: 'Every expert is rigorously vetted and background-checked, ensuring exceptional quality and trust.',
    },
  ];

  const sampleData = {
    name: 'SwiftCare',
    description: 'Experience seamless booking and unparalleled service quality for all your needs—fast, flexible, and utterly reliable. Simplify your life with us.',
    themeSettings: {
      primaryColor: '#059669', // A darker, richer teal/emerald for better contrast
    },
    CoreValues: defaultFeatures,
  };

  

  const primaryColor = themeSettings?.primaryColor || '#059669';

  const processCoreValues = CoreValues?.length ? CoreValues : defaultFeatures;

  return (
    // 🌟 VISUAL: Changed background to a subtle texture or pattern for depth
    <section id="benefits" ref={ref} className="relative bg-white py-24 px-6 sm:px-12 text-gray-900 overflow-hidden">
      {/* Background Visual: Subtle Grid/Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-10">
        {/* Subtle dot pattern or texture (can be a custom CSS pattern or image) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-color-gray-200)_1px,_transparent_1px)] [background-size:20px_20px]"></div>
      </div>
      
      {/* Dynamic Colored Glow for atmosphere */}
      <motion.div
        className="absolute w-96 h-96 -top-20 -right-20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
        style={{ backgroundColor: primaryColor }}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute w-80 h-80 -bottom-20 -left-20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"
        style={{ backgroundColor: '#2DD4BF' }} // A lighter contrasting color
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.7 }}
      />
      
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.span
          className="inline-block text-sm font-bold px-6 py-2 rounded-full text-white shadow-lg uppercase tracking-wider"
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
          Why Our Users <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(90deg, ${primaryColor}, #10B981)` }}>Choose Us</span>
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

      ---

      {/* Feature Cards Grid */}
      <motion.div
        className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'} // Only animate when in view
      >
        {processCoreValues.map(({ icon, title, description }, i) => {
          // Ensure we never index IconMap with null/undefined by defaulting to 'CheckIcon'
          const FeatureIcon = IconMap[(icon ?? 'CheckIcon') as keyof typeof IconMap] ?? CheckIcon;
          return (
            <motion.div
              key={title}
              // 🌟 VISUAL: Added an aggressive shadow and subtle 3D tilt on hover
              className="bg-white/95 rounded-3xl border border-gray-100 p-8 shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col"
              variants={itemVariants}
              whileHover={{ scale: 1.05, translateY: -8, rotate: -0.5, boxShadow: `0 25px 50px -12px ${primaryColor}44, 0 8px 15px -3px ${primaryColor}22` }}
            >
              {/* Card Decoration: Primary color stripe on top for visual flair */}
              <div
                className="absolute top-0 left-0 w-full h-2 rounded-t-3xl"
                style={{ backgroundColor: primaryColor }}
              ></div>

              <div
                // 🌟 VISUAL: Larger, more prominent icon ring with subtle primary color glow
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-5 relative z-10 ring-4 ring-white transition-all duration-300 group-hover:ring-8"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, #10B981)`,
                  boxShadow: `0 0 20px ${primaryColor}88`,
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

// 📌 NOTE: For the 'animate-blob' effect, you would need to add CSS/Tailwind configuration like this:
/*
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
*/