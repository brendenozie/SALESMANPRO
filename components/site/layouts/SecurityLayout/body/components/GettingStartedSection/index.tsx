'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldExclamationIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldExclamationIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SparklesIcon,
};

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
    title: 'Phase 3: Secure Deployment',
    description: 'We execute the plan, integrate new defenses, and provide hands-on training for your team, ensuring long-term protection and compliance.',
    ctaText: 'Start Your Transformation',
    ctaLink: '/contact/booking',
  },
];

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      type: 'spring',
      stiffness: 140,
      damping: 22,
    },
  }),
};

export default function GettingStartedSectionSecurityRoadmap() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const { themeSettings = {}, gettingStartedSteps } = storeFormData || {};

  const primaryColor = themeSettings.primaryColor || '#00A880'; 
  const secondaryColor = themeSettings.secondaryColor || '#3B82F6'; 

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
      className="relative py-28 md:py-36 bg-white text-gray-900 overflow-hidden border-b border-gray-100"
      style={cssVars}
    >
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 z-10">
        
        {/* CONTROL HEADING SECTION */}
        <motion.div
          className="text-left max-w-3xl mb-24"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-8 h-[2px] rounded-full" style={{ backgroundColor: primaryColor }} />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">
              Implementation Pipeline
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-[1.1]">
            Your Security Transformation Roadmap
          </h2>
        </motion.div>

        {/* SEQUENTIAL TRACK REVENUE CONTAINER */}
        <div className="relative max-w-5xl mx-auto">
          
          {/* Central Structural Framework Vector (Left on mobile, Center on Desktop) */}
          <div 
            className="absolute left-6 lg:left-1/2 transform lg:-translate-x-1/2 top-2 bottom-2 w-[2px] bg-gray-100"
          />

          <div className="space-y-16">
            {stepsData.map((step, index) => {
              const IconComponent = iconMap[step.iconKey ?? 'SparklesIcon'] || SparklesIcon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={index}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className={`relative flex flex-col lg:flex-row items-start ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* High Precision Sequence Telemetry Bubble */}
                  <div className="absolute left-6 lg:left-1/2 transform -translate-x-1/2 flex items-center justify-center z-20">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs border bg-white shadow-sm"
                      style={{ 
                        borderColor: 'rgba(0,0,0,0.06)',
                        color: primaryColor
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Operational Content Container Block */}
                  <div className="w-full lg:w-1/2 pl-16 lg:pl-0 lg:px-12">
                    <div className="group p-8 rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all duration-300">
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                          {step.title}
                        </h3>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {step.ctaText && step.ctaLink && (
                        <Link
                          href={step.ctaLink}
                          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase transition-colors duration-200"
                          style={{ color: primaryColor }}
                        >
                          <span>{step.ctaText}</span>
                          <ArrowRightIcon className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Empty Spacer column balancing desktop timeline structure */}
                  <div className="hidden lg:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}