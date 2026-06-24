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
  SparklesIcon
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

// heroicons components are ForwardRefExoticComponent with SVG props; allow flexible props to avoid propTypes mismatch
const iconMap: Record<string, React.ComponentType<any>> = {
  CalendarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
};

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
    ctaLink: '#about',
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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring',
      stiffness: 110,
      damping: 16 
    } 
  },
};

export default function GettingStartedSectionClean() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const { themeSettings = {}, gettingStartedSteps } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#000000';

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

  return (
    <section
      id="getting-started"
      className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100"
    >
      {/* Minimal Wire Grid Background Sync */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Section Header */}
        <motion.div
          className="text-center mb-20 flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Minimal Tagline Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
            variants={itemVariants}
          >
            <SparklesIcon className="w-4 h-4 text-slate-600" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
              Execution Blueprint
            </p>
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] text-slate-900"
            variants={itemVariants}
          >
            Your Path to <span style={{ color: primaryColor }}>Engagement</span>
          </motion.h2>
        </motion.div>

        {/* Dynamic Process Matrix */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          {stepsData.map(({ iconKey, title, description, ctaText, ctaLink }, index) => {
            const IconComponent = iconMap[iconKey ?? 'BriefcaseIcon'] || BriefcaseIcon;

            return (
              <motion.div
                key={index}
                className="group relative bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between items-start transition-all duration-200 hover:border-slate-900 hover:shadow-xl"
                variants={itemVariants}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="w-full">
                  {/* Step Metrics Row */}
                  <div className="w-full flex items-center justify-between mb-8">
                    {/* Crisp Line-Art Icon Box */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 transition-colors duration-200 group-hover:bg-slate-900 group-hover:border-slate-900">
                      <IconComponent className="w-5 h-5 text-slate-800 transition-colors duration-200 group-hover:text-white" strokeWidth={2} />
                    </div>
                    {/* Structural Monochromatic Step Counter */}
                    <span className="text-xs font-black font-mono tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded">
                      PHASE 0{index + 1}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h3 className="text-xl font-bold mb-3 text-slate-900 tracking-tight leading-snug">
                    {title}
                  </h3>
                  
                  {/* Step Description */}
                  <p className="text-sm text-slate-500 leading-relaxed mb-8 font-normal">
                    {description}
                  </p>
                </div>

                {/* Micro-Action Node Button Link */}
                {ctaText && ctaLink && (
                  <Link
                    href={ctaLink}
                    className="w-full inline-flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 transition-all duration-200 group-hover:bg-slate-900 group-hover:border-slate-900 group-hover:text-white group-active:scale-95 shadow-sm mt-auto"
                  >
                    <span>{ctaText}</span>
                    <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} />
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