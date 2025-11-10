'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldExclamationIcon, // New: For Assessment/Discovery
  ShieldCheckIcon,      // New: For Strategy/Protection
  RocketLaunchIcon,     // New: For Deployment/Execution
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Type definitions (kept for clarity)
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

// Map iconKey to actual icon component
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldExclamationIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SparklesIcon,
};

// Default steps tailored for a Security Firm's client journey
const defaultSecuritySteps: DynamicStep[] = [
  {
    iconKey: 'ShieldExclamationIcon',
    title: 'Phase 1: Deep Assessment',
    description: "We begin with a thorough vulnerability scan and risk analysis to identify and prioritize your most critical security gaps.",
    ctaText: 'View Assessment Services',
    ctaLink: '/services/assessment',
  },
  {
    iconKey: 'ShieldCheckIcon',
    title: 'Phase 2: Custom Defense Strategy',
    description: 'Our experts design a tailored security architecture and implementation roadmap, focusing on preventative measures and resilience.',
    ctaText: 'Explore Our Methodology',
    ctaLink: '/about/methodology', 
  },
  {
    iconKey: 'RocketLaunchIcon',
    title: 'Phase 3: Secure Deployment & Launch',
    description: 'We execute the plan, integrate new defenses, and provide hands-on training for your team, ensuring long-term protection and compliance.',
    ctaText: 'Start Your Transformation',
    ctaLink: '/contact/booking',
  },
];

// --- Framer Motion Variants ---
const headingVariants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } },
  hover: { scale: 1.03, boxShadow: '0 15px 35px rgba(0,0,0,0.15)', transition: { duration: 0.3 } },
};

export default function GettingStartedSectionSecurityRoadmap() {
  // Mocking context hook since it's not available here, but keeping structure
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };

  // const { themeSettings = {}, gettingStartedSteps } = storeFormData;
  // const storeFormData = { themeSettings: {}, gettingStartedSteps: undefined } as StoreFormData; 
  // const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData }; 
  const { themeSettings = {}, gettingStartedSteps } = storeFormData;

  // Use security-aligned colors for defaults (e.g., deep blue/teal for trust/tech)
  const primaryColor = themeSettings.primaryColor || '#00A880'; // Teal
  const secondaryColor = themeSettings.secondaryColor || '#3B82F6'; // Blue

  // Determine steps data: use custom steps if provided and valid, otherwise use security defaults
  const stepsData: DynamicStep[] =
    Array.isArray(gettingStartedSteps) && gettingStartedSteps.length >= 3
      ? gettingStartedSteps.map((step: any) => ({
          iconKey: step.iconKey || 'SparklesIcon',
          title: step.title || 'Step',
          description: step.description || '',
          ctaText: step.ctaText,
          ctaLink: step.ctaLink,
        })).slice(0, 4) 
      : defaultSecuritySteps;

  const cssVars = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties;

  return (
    <section
      id="roadmap"
      className="relative py-24 md:py-32 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden"
      style={cssVars}
    >
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10">
        
        {/* --- Section Header --- */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-20"
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <p 
            className="text-lg font-semibold uppercase tracking-widest mb-3" 
            style={{ color: primaryColor }}
          >
            Our Proven Methodology
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
            Your Security{' '}
            <span style={{ color: secondaryColor }}>Transformation Roadmap</span>
          </h2>
        </motion.div>

        {/* --- VERTICAL FUNNEL/TIMELINE CONTAINER --- */}
        <motion.div
          className="relative"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          
          {/* Main Vertical Funnel Line (Desktop) */}
          <div 
            className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 rounded-full opacity-70"
            // Use a dramatic security gradient, potentially darker on the edges
            style={{ 
                background: `linear-gradient(to bottom, var(--primary), var(--secondary))`, 
                boxShadow: `0 0 10px 2px var(--primary)30` // Subtle glow
            }}
          />

          {stepsData.map((step, index) => {
            const IconComponent = iconMap[step.iconKey ?? 'SparklesIcon'] || SparklesIcon;
            const isOdd = index % 2 !== 0; 
            
            return (
              <motion.div
                key={index}
                className={`flex flex-col lg:flex-row items-start py-8 relative ${isOdd ? 'lg:justify-end' : 'lg:justify-start'}`}
                variants={itemVariants}
                style={{ zIndex: stepsData.length - index }} 
              >
                
                {/* Timeline Dot (Desktop) - Security Badge style */}
                <div className="hidden lg:flex absolute left-1/2 top-[70px] transform -translate-x-1/2 z-20">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center p-1 shadow-2xl"
                    style={{ 
                        backgroundColor: primaryColor,
                        // High contrast background matching for the "badge" effect
                        boxShadow: `0 0 0 8px ${isOdd ? 'rgba(255,255,255,1)' : 'rgba(249,250,251,1)'}`, 
                        border: `4px solid var(--secondary)`
                    }}
                  >
                    <span className="text-white text-lg font-extrabold">{index + 1}</span>
                  </div>
                </div>

                {/* Step Content Card */}
                <motion.div
                  className={`w-full lg:w-[45%] p-8 rounded-3xl shadow-xl transition-all duration-300 transform border border-gray-200 dark:border-gray-700 ${
                    isOdd ? 'lg:ml-20' : 'lg:mr-20' 
                  }`}
                  whileHover="hover"
                  // Using a clean white background for readability and crispness in a security context
                  style={{ backgroundColor: 'rgba(255,255,255,0.98)' }} 
                >
                    <div className="flex items-start mb-4">
                        <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 mr-4"
                            // Strong visual gradient on the icon container
                            style={{ background: `linear-gradient(45deg, var(--primary), var(--secondary))` }}
                        >
                            <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold pt-2 text-gray-900 leading-snug flex-grow">
                            {step.title}
                        </h3>
                    </div>

                    <p className="text-base text-gray-600 mb-6 leading-relaxed">
                        {step.description}
                    </p>

                    {/* Button */}
                    {step.ctaText && step.ctaLink && (
                        <Link
                            href={step.ctaLink}
                            className="inline-flex items-center gap-2 text-base font-semibold px-6 py-3 rounded-full text-white shadow-lg transition-all duration-300 hover:opacity-90"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {step.ctaText}
                            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}