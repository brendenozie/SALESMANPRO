'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon, // Added for a sense of completion/action
  MagnifyingGlassIcon, // For "Explore"
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Type definitions for clarity
interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
}

interface DynamicStep {
  iconKey?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}

interface StoreFormData {
  themeSettings?: ThemeSettings;
  // Assuming 'gettingStartedSteps' might come from storeFormData,
  // or it could be hardcoded as defaultSteps if not dynamic.
  gettingStartedSteps?: DynamicStep[];
}

// Map iconKey to actual icon component (extendable)
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
};

// Default steps tailored for a portfolio/personal-branding context
const defaultSteps: DynamicStep[] = [
  {
    iconKey: 'MagnifyingGlassIcon', // Changed to better suit "Explore"
    title: 'Explore My Work',
    description:
      'Dive into my portfolio to discover projects, case studies, and the creative solutions I\'ve passionately brought to life.',
    ctaText: 'View Portfolio',
    ctaLink: '#portfolio',
  },
  {
    iconKey: 'UserGroupIcon',
    title: 'Collaborate & Connect',
    description:
      'Learn about my collaborative process and see how I partner with clients to achieve exceptional outcomes.',
    ctaText: 'View Approach',
    ctaLink: '#about', // Link to your approach or about section
  },
  {
    iconKey: 'CalendarIcon',
    title: 'Book a Consultation',
    description:
      'Ready to start a project? Schedule a personalized consultation to discuss your vision and how we can achieve it.',
    ctaText: 'Schedule Now',
    ctaLink: '#contact',
  },
];

export default function GettingStartedSection() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const { themeSettings = {}, gettingStartedSteps } = storeFormData;

  // Theme colors
  const primaryColor = themeSettings.primaryColor || '#0d675c'; // Default modern green
  const secondaryColor = themeSettings.secondaryColor || '#10b981'; // Default modern light green/teal

  // Determine steps data: dynamic if provided, else defaultSteps
  const stepsData: DynamicStep[] =
    Array.isArray(gettingStartedSteps) && gettingStartedSteps.length > 0
      ? gettingStartedSteps.map((step: any) => ({
          iconKey: step.iconKey || 'BriefcaseIcon',
          title: step.title || 'Step',
          description: step.description || '',
          ctaText: step.ctaText,
          ctaLink: step.ctaLink,
        }))
      : defaultSteps;

  // Framer Motion variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Delay between child animations
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <section
      id="getting-started" // Add ID for direct linking
      className="relative py-24 md:py-32 px-6 lg:px-12 text-white overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, // Modern gradient background
      }}
    >
      {/* Dynamic Background Circles / Blobs */}
      <div
        className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-15"
        style={{ background: `radial-gradient(circle at center, ${primaryColor}, transparent 50%)` }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl opacity-15"
        style={{ background: `radial-gradient(circle at center, ${secondaryColor}, transparent 50%)` }}
      />
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'url("/assets/diagonal-lines-light.svg")', backgroundSize: '30px 30px' }}></div>

      <div className="relative max-w-7xl mx-auto text-center z-10">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-16 leading-tight drop-shadow-md"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          Your Journey Starts Here
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }} // Trigger when 20% of container is visible
        >
          {stepsData.map(({ iconKey, title, description, ctaText, ctaLink }, index) => {
            const IconComponent = iconMap[iconKey ?? 'BriefcaseIcon'] || BriefcaseIcon;
            const isLastStep = index === stepsData.length - 1;

            return (
              <motion.div
                key={index}
                className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl border border-white/20 group transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl"
                variants={itemVariants} // Apply item animation variants
              >
                {/* Step Number Badge */}
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg shadow-lg z-20"
                  style={{ backgroundColor: secondaryColor }}
                >
                  {index + 1}
                </div>

                {/* Icon Container with Gradient */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white mb-6 mt-4 p-2 shadow-inner"
                  style={{
                    background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                    border: `2px solid ${secondaryColor}80` // Subtle border for definition
                  }}
                >
                  <IconComponent className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-3 text-white leading-snug">
                  {title}
                </h3>
                {/* Description */}
                <p className="text-base text-gray-200 flex-grow mb-6 leading-relaxed">
                  {description}
                </p>

                {/* Button */}
                {ctaText && ctaLink && (
                  <Link
                    href={ctaLink}
                    className="inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full text-white shadow-lg transition-all duration-300 ease-in-out transform group-hover:scale-105 group-hover:shadow-xl"
                    style={{
                      backgroundColor: secondaryColor,
                      backgroundImage: `linear-gradient(to right, ${secondaryColor}, ${primaryColor}AA)`, // Subtle gradient on button
                    }}
                  >
                    {ctaText}
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {/* Arrow connecting steps (visible only on desktop, not last step) */}
                {!isLastStep && (
                  <div className="hidden md:block absolute top-1/2 left-[calc(100%+24px)] w-24 h-1 bg-white/20 rounded-full before:absolute before:content-[''] before:w-3 before:h-3 before:rounded-full before:bg-white before:top-1/2 before:-translate-y-1/2 after:absolute after:content-[''] after:w-3 after:h-3 after:rounded-full after:bg-white after:top-1/2 after:-translate-y-1/2 after:right-0">
                    <ArrowRightIcon className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 text-white" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}