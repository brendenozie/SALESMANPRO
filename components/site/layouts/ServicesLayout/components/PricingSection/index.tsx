'use client';

import React, { useState } from 'react';
import { CheckCircleIcon, SparklesIcon, RocketLaunchIcon, CubeTransparentIcon, ClockIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { PricingTier } from '@/types/typings';

// Placeholder for default pricing plans (reusing the existing structure)
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
    features: ['All Standard Features', 'Inside Window Cleaning', 'Oven & Fridge Interior', 'Baseboards & Wall Spot Cleaning', 'Priority Scheduling'],
    isFeatured: true,
    frequency: 'Monthly',
    badge: 'Best Value',
    icon: <SparklesIcon />,
  },
  {
    name: 'Move-In/Out',
    price: 299,
    description: 'Thorough cleaning for seamless transitions and new beginnings.',
    features: ['Deep Clean Pro Features', 'Inside Cabinets & Drawers', 'Grout Cleaning', 'Post-Construction Cleanup (light)', '24/7 Support'],
    isFeatured: false,
    frequency: 'One-time',
    icon: <RocketLaunchIcon />,
  },
];

interface PricingSectionProps {
  pricingTiers?: PricingTier[];
  themeSettings?: any;
}

export default function PricingSectionLight({ pricingTiers, themeSettings }: PricingSectionProps) {
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly' | 'One-time'>('Monthly');

  // --- THEME COLORS ---
  const primaryColor = themeSettings?.primaryColor || '#4CAF50'; 
  const secondaryColor = themeSettings?.secondaryColor || '#FFC107';

  const allPlans = pricingTiers && pricingTiers.length > 0 ? pricingTiers : defaultPricingPlans;

  const availableCycles = Array.from(new Set(allPlans.map(p => p.frequency).filter(Boolean))) as ('Monthly' | 'Yearly' | 'One-time')[];

  const currentPricingPlans = allPlans.filter(
    (plan) => plan.frequency === billingCycle || (!plan.frequency && billingCycle === 'One-time') || (!plan.frequency && billingCycle === 'Monthly') || (!plan.frequency && billingCycle === 'Yearly') || billingCycle === 'One-time'
  );

  // --- ANIMATION VARIANTS (Adapted for light mode shadows/elevation) ---
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut", staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
    hover: { y: -8, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }, // Lighter shadow for light mode
  };

  const PricingCard = ({ plan, index }: { plan: PricingTier | typeof defaultPricingPlans[0], index: number }) => {
    const resolvedIcon = (plan as any).icon ?? <CubeTransparentIcon />;

    return (
      <motion.div
        key={plan.name || index}
        className={`relative p-8 rounded-3xl shadow-lg transition-all duration-300 flex flex-col h-full 
          ${plan.isFeatured
            ? 'bg-gray-50 text-gray-900 border-4 border-transparent z-20'
            : 'bg-white text-gray-900 border border-gray-200 z-10'
          }`}
        variants={cardVariants}
        whileHover="hover"
        viewport={{ once: true }}
      >
          {/* --- FEATURED CARD PRISM EFFECT (Primary color background, white card) --- */}
          {plan.isFeatured && (
            <div
              className="absolute inset-0 rounded-3xl -z-10"
              // Dynamic Gradient Border (Prism Effect)
              style={{ 
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, 
                padding: '3px',
              }}
            >
              <div className="absolute inset-0 bg-white rounded-[calc(1.5rem-2px)]" /> 
            </div>
          )}
            
          {/* Badge */}
          {plan.isFeatured && (
            <div
              className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide shadow-md"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              {plan.badge || 'Most Popular'}
            </div>
          )}

          {/* Top Section: Icon, Name, Description */}
          <div className="flex flex-col items-center mb-6">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center p-3`}
              style={{ backgroundColor: plan.isFeatured ? secondaryColor : primaryColor }}
            >
              <div className="w-8 h-8 text-white">
                {resolvedIcon}
              </div>
            </div>

            <h3 className="text-3xl font-extrabold mb-1">{plan.name}</h3>
            <p className={`text-center text-sm ${plan.isFeatured ? 'text-gray-500' : 'text-gray-500'}`}>
              {plan.description || "A flexible plan designed to meet your specific needs."}
            </p>
          </div>

          {/* Price */}
          <div className="text-center mb-8">
            <p className="text-6xl font-black mb-1 text-gray-900">
              ${plan.price.toFixed(0)}
            </p>
            <span className="text-lg font-semibold uppercase tracking-wider text-gray-500">
              {plan.frequency ? `/ ${plan.frequency}` : '/ service'}
            </span>
          </div>

          <div className="h-px w-full mx-auto mb-8 bg-gray-200" />

          {/* Features List */}
          <ul className="mt-2 space-y-4 text-left w-full flex-grow text-gray-700">
            <AnimatePresence mode="wait">
              {plan.features?.map((feature, i) => (
                <motion.li 
                  key={i} 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <CheckCircleIcon
                    className={`w-6 h-6 flex-shrink-0 mt-0.5`}
                    style={{ color: primaryColor }}
                  />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {/* Button */}
          <button
            className={`mt-12 px-8 py-4 w-full rounded-full text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-opacity-50 text-black`}
            style={{
              backgroundColor: plan.isFeatured ? primaryColor : secondaryColor,
              '--tw-ring-color': primaryColor,
            } as React.CSSProperties}
          >
            Select Plan
          </button>
      </motion.div>
    );
  };

  return (
    <section 
      id="packages" 
      className="bg-white py-20 lg:py-32 px-4 text-center text-gray-900 relative overflow-hidden"
    >
      {/* Subtle Background Element (Very light, almost white) */}
      <div 
        className="absolute top-0 left-0 w-full h-[300px] opacity-10"
        style={{ background: `linear-gradient(135deg, ${primaryColor}10 0%, #fff 70%)` }}
      />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* --- HEADER --- */}
        <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4" variants={sectionVariants}>
          Choose Your <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>Perfect Plan</span>
        </motion.h2>
        <motion.p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto" variants={sectionVariants}>
          Select the frequency and package that brings the most value to your space.
        </motion.p>
        
        {/* --- TOGGLE BUTTONS --- */}
        {availableCycles.length > 1 && (
          <div className="flex justify-center mb-16" >
            <motion.div
              className="relative inline-flex p-1 rounded-full bg-gray-200 shadow-inner"
              variants={sectionVariants}
            >
              <AnimatePresence mode="wait">
                {availableCycles.map((option) => (
                  <button
                    key={option}
                    onClick={() => setBillingCycle(option)}
                    className={`px-6 py-3 rounded-full font-bold transition-colors duration-300 relative z-10 text-base ${
                      billingCycle === option
                        ? 'text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
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
              </AnimatePresence>
            </motion.div>
        </div>
        )}

        {/* --- PRICING CARDS GRID --- */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          <AnimatePresence mode="wait">
            {currentPricingPlans.map((plan, index) => (
              <PricingCard key={plan.name} plan={plan} index={index} />
            ))}
            {currentPricingPlans.length === 0 && (
              <motion.p 
                className="col-span-full text-center text-gray-500 text-xl py-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ClockIcon className="w-6 h-6 inline-block mr-2" /> No plans available for the {billingCycle} cycle. Please try a different frequency.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}