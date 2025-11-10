'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
} from '@heroicons/react/24/solid';

import { useStoreContext } from "@/contexts/StoreContext";
import { StoreForm } from "@/types/typings";

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

// Fallback data for a standalone preview to make the component self-contained
const storeData = {
  themeSettings: {
    primaryColor: '#00A880',
    secondaryColor: '#10B981',
  },
  tagline: 'Delivering exceptional services with a personal touch.',
  promotions: [],
  name: "My Brand",
};

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

// Animation variants for a springy, staggered appearance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
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

  const primary = themeSettings?.primaryColor || "#00A880";
  const secondary = themeSettings?.secondaryColor || "#10B981";
  const accentBg = `${primary}20`;

  // Static fallback features with an icon mapping
  const fallbackFeatures: { icon: IconKey; title: string; desc: string }[] = [
    { icon: "CheckIcon", title: "Creative Portfolio", desc: "Showcase of selected works and case studies to highlight my expertise." },
    { icon: "UserGroupIcon", title: "Client Testimonials", desc: "Real feedback from clients I have collaborated with, demonstrating impact." },
    { icon: "AdjustmentsVerticalIcon", title: "Personal Branding", desc: "Tailored strategies to build and elevate your personal brand presence." },
    { icon: "ClockIcon", title: "Consultation", desc: "Schedule a session to discuss projects, career guidance, or collaboration." },
    { icon: "LockClosedIcon", title: "Secure Collaborations", desc: "Confidential and professional engagement on all projects and contracts." },
    { icon: "Cog6ToothIcon", title: "Custom Solutions", desc: "Bespoke services aligned to your unique goals and industry requirements." },
  ];

  // Dynamic data from promotions, with a fallback to static features
  const features = promotions?.[0]?.perks?.length > 0
    ? promotions?.[0].perks.map((perk: any) => ({
      // Use a generic icon, since the API likely doesn't provide one
      icon: "StarIcon",
      title: perk.label,
      desc: perk.description,
    }))
    : fallbackFeatures;

  const brandName = name || "My Services";

  return (
    <AnimatePresence>
      <section className="relative py-24 md:py-32 px-4 sm:px-12 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
        {/* Dynamic, blurred radial gradient background */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
            style={{ backgroundColor: primary }}
            animate={{ x: ['-25%', '25%', '-25%'], y: ['-25%', '25%', '-25%'] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
            style={{ backgroundColor: secondary }}
            animate={{ x: ['25%', '-25%', '25%'], y: ['25%', '-25%', '25%'] }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Heading */}
        <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
          <motion.span
            className="inline-block text-sm font-semibold px-5 py-2 rounded-full shadow-sm"
            style={{ backgroundColor: accentBg, color: primary }}
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            My Expertise & Services
          </motion.span>
          <motion.h2
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            viewport={{ once: true }}
          >
            Why Clients <span style={{ color: primary }}>Choose {brandName}</span>
          </motion.h2>
          {tagline && (
            <motion.p
              className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              viewport={{ once: true }}
            >
              {tagline}
            </motion.p>
          )}
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map(({ icon, title, desc }:{ icon: any; title: string; desc: string }, idx:number) => {
            const Icon = icons[icon as IconKey];
            return (
              <motion.div
                key={title}
                className="group rounded-2xl border border-gray-200/50 dark:border-gray-800/50 p-8 shadow-md relative z-10 transition-all duration-300 backdrop-blur-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.03)',
                }}
                variants={itemVariants}
                whileHover={{ scale: 1.05, translateY: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.05)' }}
              >
                {/* Subtle light glow on hover (behind content) */}
                <div
                  className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at center, ${primary}22 0%, transparent 70%)`,
                    filter: 'blur(30px)',
                  }}
                />
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg mb-5 relative z-10 group-hover:scale-110 transition-transform duration-200"
                  style={{
                    backgroundColor: primary,
                    // backgroundImage: `linear-gradient(to bottom right, ${primary}, ${secondary})`,
                    boxShadow: `0 0 15px ${primary}66`,
                  }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold relative z-10">
                  {title}
                </h3>
                <p className="text-md text-gray-600 dark:text-gray-400 mt-2 relative z-10">{desc || 'Showcase of selected works and case studies to highlight my expertise.'}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </AnimatePresence>
  );
}
