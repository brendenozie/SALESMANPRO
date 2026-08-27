'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  Cog6ToothIcon,
  StarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const icons = {
  CheckIcon,
  UserGroupIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  Cog6ToothIcon,
  StarIcon,
};

type IconKey = keyof typeof icons;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16,
    },
  },
};

interface FeaturesSectionProps { 
  themeSettings: { 
    primaryColor?: string; 
    secondaryColor?: string; 
  } | undefined | null;
  name?: string | undefined | null;
  promotions?: any[];
  tagline?: string | undefined | null;
}

export default function FeaturesClient({ themeSettings, name, promotions, tagline }: FeaturesSectionProps) {
  const primaryColor = themeSettings?.primaryColor || "#000000";

  const fallbackFeatures: { icon: IconKey; title: string; desc: string }[] = [
    { icon: "CheckIcon", title: "Creative Portfolio", desc: "Showcase of selected works and case studies to highlight my expertise." },
    { icon: "UserGroupIcon", title: "Client Testimonials", desc: "Real feedback from clients I have collaborated with, demonstrating impact." },
    { icon: "AdjustmentsVerticalIcon", title: "Personal Branding", desc: "Tailored strategies to build and elevate your personal brand presence." },
    { icon: "ClockIcon", title: "Consultation", desc: "Schedule a session to discuss projects, career guidance, or collaboration." },
    { icon: "LockClosedIcon", title: "Secure Collaborations", desc: "Confidential and professional engagement on all projects and contracts." },
    { icon: "Cog6ToothIcon", title: "Custom Solutions", desc: "Bespoke services aligned to your unique goals and industry requirements." },
  ];

  const features = promotions?.[0]?.perks?.length > 0
    ? promotions?.[0].perks.map((perk: any) => ({
        icon: "StarIcon" as IconKey,
        title: perk.label,
        desc: perk.description,
      }))
    : fallbackFeatures;

  const brandName = name || "My Services";

  return (
    <AnimatePresence>
      <section className="relative py-24 lg:py-32 px-6 lg:px-8 bg-white text-slate-900 overflow-hidden border-b border-slate-100">
        
        {/* Minimal Wire Grid Background Sync */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Section Header */}
          <motion.div
            className="text-center mb-20 flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Minimal Inline Badge Tagline */}
            <motion.div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-slate-50 border border-slate-200 mb-5"
              variants={itemVariants}
            >
              <SparklesIcon className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                Core Competencies
              </p>
            </motion.div>

            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-[1.15] text-slate-900"
              variants={itemVariants}
            >
              Why Clients <span style={{ color: primaryColor }}>Choose {brandName}</span>
            </motion.h2>

            {tagline && (
              <motion.p
                className="mt-6 text-slate-500 max-w-2xl text-lg font-normal leading-relaxed"
                variants={itemVariants}
              >
                {tagline}
              </motion.p>
            )}
          </motion.div>

          {/* Feature Matrix Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {features.map(({ icon, title, desc }: { icon: IconKey; title: string; desc: string }) => {
              const IconComponent = icons[icon] || StarIcon;
              
              return (
                <motion.div
                  key={title}
                  className="group flex flex-col bg-white border border-slate-200 rounded-2xl p-8 justify-between items-start transition-all duration-200 hover:border-slate-900 hover:shadow-xl"
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="w-full">
                    {/* Architectural Icon Node Box */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 mb-6 transition-colors duration-200 group-hover:bg-slate-900 group-hover:border-slate-900">
                      <IconComponent className="w-5 h-5 text-slate-800 transition-colors duration-200 group-hover:text-white" strokeWidth={2} />
                    </div>

                    {/* Feature Title */}
                    <h3 className="text-xl font-bold mb-3 text-slate-900 tracking-tight leading-snug">
                      {title}
                    </h3>

                    {/* Feature Description */}
                    <p className="text-sm text-slate-500 leading-relaxed font-normal">
                      {desc || 'Showcase of selected works and case studies to highlight my expertise.'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </AnimatePresence>
  );
}