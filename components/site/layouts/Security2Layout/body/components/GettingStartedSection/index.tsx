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
    title: 'Phase 3: Secure Deployment & Launch',
    description: 'We execute the plan, integrate new defenses, and provide hands-on training for your team, ensuring long-term protection and compliance.',
    ctaText: 'Start Your Transformation',
    ctaLink: '/contact/booking',
  },
];

const headingVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: 'linear' } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'linear' } },
};

export default function GettingStartedSectionSecurityRoadmap() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const { themeSettings = {}, gettingStartedSteps } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#00A880';

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

  return (
    <section
      id="roadmap"
      className="relative py-28 md:py-36 bg-white text-gray-900 border-b border-gray-100 overflow-hidden"
    >
      {/* BACKGROUND TELEMETRY MESHGRID */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-gray-900 h-full" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        
        {/* ASYMMETRIC METHODOLOGY HEADER */}
        <motion.div
          className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-20 border-b border-gray-100 pb-12"
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-[2px]" style={{ backgroundColor: primaryColor }} />
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                EXECUTION_FLOW // STRATEGY
              </p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900 leading-[1.1]">
              METHODOLOGY DEPLOYMENT ROUTINE
            </h2>
          </div>
          <p className="text-xs font-mono text-gray-400 leading-relaxed max-w-sm lg:mt-8">
            Systemized staging environments tracking client baseline profiles through isolated identification, engineering diagnostics, and infrastructure hardening pipelines.
          </p>
        </motion.div>

        {/* HIGH-DENSITY HORIZONTAL GRID CHANNELS */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-gray-100"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {stepsData.map((step, index) => {
            const IconComponent = iconMap[step.iconKey ?? 'SparklesIcon'] || SparklesIcon;
            const hexStep = `0${index + 1}`.slice(-2);
            
            return (
              <motion.div
                key={index}
                className="p-8 border-r border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors flex flex-col justify-between group min-h-[340px]"
                variants={itemVariants}
              >
                <div>
                  {/* STEP SPEC STREAM */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-mono font-bold text-gray-300 group-hover:text-gray-900 transition-colors">
                      [SEQ_NODE_{hexStep}]
                    </span>
                    <IconComponent className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </div>

                  <span className="text-[9px] font-mono font-black uppercase tracking-widest block mb-2 text-gray-400">
                    ROUTINE STAGE // INTERCEPT
                  </span>

                  <h3 className="text-sm font-mono font-black uppercase tracking-tight text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  <p className="text-xs font-mono text-gray-400 leading-relaxed mb-8">
                    {step.description}
                  </p>
                </div>

                {/* DISPATCH LINK ENTRY */}
                {step.ctaText && step.ctaLink && (
                  <Link
                    href={step.ctaLink}
                    className="inline-flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-900 transition-colors py-2 px-3 w-fit"
                  >
                    {step.ctaText}
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}