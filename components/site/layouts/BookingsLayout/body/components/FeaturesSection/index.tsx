'use client';

import React from 'react';
import Image from 'next/image';
import {
  CheckIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  AdjustmentsVerticalIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';
import { motion, useInView } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Animation variants for staggered appearance
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

export default function FeaturesSection() {
  const { storeFormData } = useStoreContext();

  const sampleData = {
    name: 'SwiftCare',
    description: 'Experience seamless booking and unparalleled service quality for all your needs—fast, flexible, and utterly reliable. Simplify your life with us.',
    themeSettings: {
      primaryColor: '#00A880',
    },
    marketplaceListings: Array(5).fill({}),
    pricingTiers: [{ isFeatured: true, description: 'Find flexible options and customized plans to perfectly suit your unique needs.' }],
  };

  const {
    name,
    description,
    themeSettings,
    marketplaceListings = [],
    pricingTiers = [],
  } = storeFormData || sampleData;

  const features = [
    {
      Icon: CheckIcon,
      title: 'Effortless Booking',
      description: 'Book any service in seconds—anywhere, anytime. Streamlined for your convenience.',
    },
    {
      Icon: UserGroupIcon,
      title: 'Top Service Providers',
      description: `Choose from ${marketplaceListings.length > 0 ? marketplaceListings.length : 'many'} highly skilled, local professionals.`,
    },
    {
      Icon: LockClosedIcon,
      title: 'Secure & Transparent Payments',
      description: 'Protected transactions with MPESA, Card, and more trusted local options. Your peace of mind is our priority.',
    },
    {
      Icon: AdjustmentsVerticalIcon,
      title: 'Tailored Packages',
      description: pricingTiers[0]?.description || 'Find flexible options and customized plans to perfectly suit your unique needs.',
    },
    {
      Icon: ClockIcon,
      title: 'Real-time Availability',
      description: 'See live schedules and book instantly. No more waiting games—just clear, up-to-date information.',
    },
    {
      Icon: Cog6ToothIcon,
      title: 'Trusted & Vetted Experts',
      description: 'Every professional is hand-verified and rigorously vetted for exceptional quality and unwavering reliability.',
    },
  ];

  const primaryColor = themeSettings?.primaryColor || '#00A880';

  return (
    <section className="relative bg-gray-50 py-24 px-6 sm:px-12 text-gray-900 overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-white/50 backdrop-filter backdrop-blur-3xl"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${primaryColor}2A 0%, transparent 60%)`,
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.span
          className="inline-block text-sm font-semibold px-5 py-2 rounded-full border border-emerald-400 text-emerald-700 bg-emerald-100 shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          Uncover the {name || 'Platform'} Difference
        </motion.span>

        <motion.h2
          className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          Why Our Users <span className="text-emerald-600">Choose Us</span>
        </motion.h2>

        <motion.p
          className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          {description}
        </motion.p>
      </div>

      {/* Feature Cards Grid */}
      <motion.div
        className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {features.map(({ Icon, title, description }, i) => (
          <motion.div
            key={title}
            className="bg-white/70 backdrop-filter backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
            variants={itemVariants}
            whileHover={{ scale: 1.03, translateY: -5 }}
          >
            {/* Subtle light glow on hover (behind content) */}
            <div
              className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
              style={{
                background: `radial-gradient(circle at center, ${primaryColor}22 0%, transparent 70%)`,
                filter: 'blur(30px)',
              }}
            />
            
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg mb-5 relative z-10"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${primaryColor}, #10B981)`,
                boxShadow: `0 0 15px ${primaryColor}66`,
              }}
            >
              <Icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-200" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200 relative z-10">
              {title}
            </h3>
            <p className="text-md text-gray-600 mt-2 relative z-10">{description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}