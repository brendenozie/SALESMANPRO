"use client";

import React, { useState } from 'react';
import { CheckCircleIcon, SparklesIcon, RocketLaunchIcon, CubeTransparentIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { motion } from 'framer-motion';
import { PricingTier } from '@/types/typings';

// Placeholder for default pricing plans with Heroicons
const defaultPricingPlans: Array<{
  name: string;
  price: number;
  description: string;
  features: string[];
  isFeatured: boolean;
  frequency: 'Monthly' | 'Yearly' | 'One-time';
  badge?: string;
  icon: React.ReactNode;
}> = [
  {
    name: 'Standard',
    price: 99,
    description: 'Perfect for regular maintenance to keep your home fresh.',
    features: ['Dusting & Wiping Surfaces', 'Vacuuming & Mopping Floors', 'Bathroom Sanitization', 'Kitchen Countertop Wipe Down'],
    isFeatured: false,
    frequency: 'Monthly',
    icon: <CubeTransparentIcon />,
  },
  {
    name: 'Deep Clean Pro',
    price: 189,
    description: 'Comprehensive service for a sparkling, refreshed home.',
    features: ['All Standard Features', 'Inside Window Cleaning', 'Oven & Fridge Interior', 'Baseboards & Wall Spot Cleaning'],
    isFeatured: true,
    frequency: 'Monthly',
    badge: 'Most Popular',
    icon: <SparklesIcon />,
  },
  {
    name: 'Move-In/Out',
    price: 299,
    description: 'Thorough cleaning for seamless transitions.',
    features: ['Deep Clean Pro Features', 'Inside Cabinets & Drawers', 'Grout Cleaning', 'Post-Construction Cleanup (light)'],
    isFeatured: false,
    frequency: 'One-time',
    icon: <RocketLaunchIcon />,
  },
];

interface PricingSectionProps {
  pricingTiers?: PricingTier[];
  themeSettings?: any;
}

export default function PricingSection( { pricingTiers, themeSettings }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly' | 'One-time'>('Monthly');

  const primaryColor = themeSettings?.primaryColor || '#4CAF50';
  const secondaryColor = themeSettings?.secondaryColor || '#FFC107';

  const currentPricingPlans = pricingTiers && pricingTiers.length > 0
    ? pricingTiers.filter(plan => plan.frequency === billingCycle || !plan.frequency)
    : defaultPricingPlans.filter(plan => plan.frequency === billingCycle || !plan.frequency);

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12, mass: 0.8 } },
    hover: {
      y: -10,
      boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  return (
    <section  id="packages" className="bg-white dark:bg-gray-950 py-16 lg:py-24 px-4 text-center text-gray-900 dark:text-gray-100 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-5 dark:bg-dot-pattern-dark z-0" />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4" variants={sectionVariants}>
          Flexible{" "}
          <span className="bg-clip-text text-transparent" style={{ backgroundColor: primaryColor }}>
            Pricing
          </span>{" "}
          for Every Need
        </motion.h2>
        <motion.p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto" variants={sectionVariants}>
          Choose the perfect plan that fits your space and budget. No hidden fees, just transparent value.
        </motion.p>

        {/* Toggle - Enhanced with a cleaner style and layout animation */}
        <div className="flex justify-center mb-12">
          <motion.div
            className="relative inline-flex p-1 rounded-full bg-gray-200 dark:bg-gray-700 shadow-inner"
            variants={sectionVariants}
          >
            {['Monthly', 'Yearly', 'One-time'].map((option) => (
              <button
                key={option}
                onClick={() => setBillingCycle(option as 'Monthly' | 'Yearly' | 'One-time')}
                className={`px-6 py-2 rounded-full font-semibold transition-colors duration-300 relative z-10 text-base ${
                  billingCycle === option
                    ? 'text-black'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {billingCycle === option && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative">{option}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {currentPricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name || index}
              className={`relative p-8 rounded-3xl shadow-xl transition-all duration-300 flex flex-col items-center
                ${plan.isFeatured
                  ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-2 border-transparent relative'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                }`}
              variants={cardVariants}
              whileHover="hover"
              viewport={{ once: true }}
            >
              {/* Featured Card Ribbon and Border */}
              {plan.isFeatured && (
                <>
                  <div
                    className="absolute inset-0 rounded-3xl -z-10"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                  />
                  <div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide shadow-md"
                    style={{ backgroundColor: secondaryColor, color: 'white' }}
                  >
                    {plan.badge || 'Most Popular'}
                  </div>
                </>
              )}

              {/* Icon / Image Placeholder */}
              <div
                className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center p-4 ${
                  plan.isFeatured ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div className="w-10 h-10" style={{ color: plan.isFeatured ? 'white' : primaryColor }}>
                  {/* {plan.icon} */}
                  <RocketLaunchIcon />
                </div>
              </div>

              <h3 className="text-3xl font-bold mb-3">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.isFeatured ? 'text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>
                {plan.description || "A flexible plan designed to meet your specific needs."}
              </p>
              <p className="text-5xl font-extrabold mb-1">
                <span className={plan.isFeatured ? 'text-white' : 'text-gray-900 dark:text-gray-100'}>
                  {plan.price.toFixed(0)}
                </span>
                <span className={`text-lg font-medium ${plan.isFeatured ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                  {' '} / {plan.frequency || 'service'}
                </span>
              </p>

              {/* Features List */}
              <ul className={`mt-8 space-y-4 text-left w-full flex-grow`}>
                {plan.features?.map((feature, i) => (
                  <motion.li key={i} className="flex items-start gap-3" variants={featureVariants}>
                    <CheckCircleIcon
                      className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                        plan.isFeatured ? 'text-white' : 'text-green-500'
                      }`}
                    />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <button
                className={`mt-10 px-8 py-4 w-full rounded-full text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50
                  ${plan.isFeatured
                    ? 'bg-white text-gray-900 dark:text-gray-900 hover:bg-gray-200'
                    : 'text-white hover:bg-opacity-80'
                  }`}
                style={{
                  backgroundColor: plan.isFeatured ? 'white' : primaryColor,
                  color: plan.isFeatured ? primaryColor : 'white',
                  '--tw-ring-color': primaryColor,
                } as React.CSSProperties}
              >
                Choose Plan
              </button>
            </motion.div>
          ))}
          {currentPricingPlans.length === 0 && (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400 text-xl py-10">
              No pricing plans available for this billing cycle.
            </p>
          )}
        </div>
      </motion.div>
    </section>
  );
}