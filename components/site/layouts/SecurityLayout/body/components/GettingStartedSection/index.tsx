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
  CheckCircleIcon,
  MagnifyingGlassIcon,
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
    iconKey: 'MagnifyingGlassIcon',
    title: 'Explore My Work',
    description:
      "Dive into my portfolio to discover projects, case studies, and the creative solutions I've passionately brought to life.",
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

export default function GettingStartedSectionClean() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const { themeSettings = {}, gettingStartedSteps } = storeFormData;

  // Let's use more neutral, yet distinct, default colors for this section
  const primaryColor = themeSettings.primaryColor || '#1f2937'; // Dark Gray for primary text/accents
  const secondaryColor = themeSettings.secondaryColor || '#60a5fa'; // A nice blue for highlights/CTAs

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

  // Framer Motion variants for subtle animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Slight delay between cards
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    hover: { scale: 1.02, boxShadow: '0 15px 30px rgba(0,0,0,0.1)', transition: { duration: 0.2 } },
  };

  const headingVariants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  return (
    <section
      id="getting-started"
      className="relative py-24 md:py-32 px-6 lg:px-12 bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-500 overflow-hidden"
    >
      {/* NO ABSTRACT BACKGROUNDS OR BLOBS */}

      <div className="relative max-w-7xl mx-auto text-center z-10">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-16 leading-tight"
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ color: primaryColor }} // Using primary color for headline
        >
          {/* Subtle text styling: no heavy drop shadow, but a soft text shadow for definition */}
          <span style={{ textShadow: `0px 2px 4px rgba(0, 0, 0, 0.1)` }}>
            Your Path to Engagement
          </span>
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 items-start" /* Align items to start for cleaner look */
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {stepsData.map(({ iconKey, title, description, ctaText, ctaLink }, index) => {
            const IconComponent = iconMap[iconKey ?? 'BriefcaseIcon'] || BriefcaseIcon;
            const isLastStep = index === stepsData.length - 1;

            return (
              <motion.div
                key={index}
                className="relative bg-white dark:bg-gray-800 rounded-xl p-8 flex flex-col items-center text-center shadow-lg border border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out"
                variants={itemVariants}
                whileHover="hover"
              >
                {/* Step Number Badge - Redesigned for a cleaner look */}
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-full text-black font-bold text-lg shadow-md"
                  style={{ backgroundColor: secondaryColor }} // Secondary color for the badge
                >
                  {index + 1}
                </div>

                {/* Icon Container - Clean, solid background from secondaryColor */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white mb-6 mt-4 p-2 shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white leading-snug">
                  {title}
                </h3>
                {/* Description */}
                <p className="text-base text-gray-600 dark:text-gray-300 flex-grow mb-6 leading-relaxed">
                  {description}
                </p>

                {/* Button */}
                {ctaText && ctaLink && (
                  <Link
                    href={ctaLink}
                    className="inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
                    style={{
                      backgroundColor: primaryColor,
                      // No gradient on button, keep it clean
                    }}
                  >
                    {ctaText}
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}

                {/* Connector Line and Arrow (Desktop Only, not last step) */}
                {!isLastStep && (
                  <div className="hidden md:flex absolute top-[calc(50%+20px)] left-[calc(100%+32px)] w-16 h-px bg-gray-300 dark:bg-gray-700 items-center justify-end">
                    <ArrowRightIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 -mr-3" />
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