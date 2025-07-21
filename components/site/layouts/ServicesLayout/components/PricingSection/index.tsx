"use client";

import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { motion } from 'framer-motion'; // Import motion for animations

// Placeholder for default pricing plans if storeFormData.pricingTiers is empty or undefined
const defaultPricingPlans = [
  {
    name: 'Standard Clean',
    price: 99,
    description: 'Perfect for regular maintenance to keep your home fresh.',
    features: ['Dusting & Wiping Surfaces', 'Vacuuming & Mopping Floors', 'Bathroom Sanitization', 'Kitchen Countertop Wipe Down'],
    isFeatured: false,
    frequency: 'Monthly', // Assuming a default frequency if not specified by backend
    iconPath: "M5 3v4M3 5h4m6 0H9m10 0h-4m-6 0h.01M17 13h.01M10 13h.01M5 13h.01M12 21v-4m-2 2h4m-6-6h.01M17 21v-4m-2 2h4" // Placeholder icon path (adjust or use Heroicons)
  },
  {
    name: 'Deep Clean Pro',
    price: 189,
    description: 'Comprehensive service for a sparkling, refreshed home.',
    features: ['All Standard Clean Features', 'Inside Window Cleaning', 'Oven & Fridge Interior', 'Baseboards & Wall Spot Cleaning'],
    isFeatured: true,
    frequency: 'Monthly',
    badge: 'Most Popular',
    iconPath: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V6m3 10h6m-6 0a2 2 0 100 4m0-4a2 2 0 110 4m0 4v2m0-6V6"
  },
  {
    name: 'Move-In/Out Clean',
    price: 299,
    description: 'Thorough cleaning for seamless transitions.',
    features: ['Deep Clean Pro Features', 'Inside Cabinets & Drawers', 'Grout Cleaning', 'Post-Construction Cleanup (light)'],
    isFeatured: false,
    frequency: 'One-time',
    iconPath: "M10 21h7a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zm2.5-12h3M14 7h.01M12 17h.01"
  },
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly' | 'One-time'>('Monthly'); // Added 'One-time' for flexibility

  const { storeFormData } = useStoreContext();

  const { pricingTiers, themeSettings } = storeFormData || {}; // Safely destructure

  const primaryColor = themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
  const secondaryColor = themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback

  // Determine which pricing plans to display
  const currentPricingPlans = pricingTiers && pricingTiers.length > 0
    ? pricingTiers.filter(plan => plan.frequency === billingCycle || !plan.frequency) // Filter by frequency, or show all if frequency not specified
    : defaultPricingPlans.filter(plan => plan.frequency === billingCycle || !plan.frequency); // Fallback to default, filtered

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
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    hover: { scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" },
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-16 lg:py-24 px-4 text-center text-gray-900 dark:text-gray-100 relative overflow-hidden">
      {/* Background blobs for visual interest */}
      <div
        className="absolute top-0 -left-20 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-0"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000"
        style={{ backgroundColor: secondaryColor }}
      />

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        initial="hidden"
        whileInView="visible"
        variants={sectionVariants}
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4" variants={sectionVariants}>
          Flexible <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }}>Pricing</span> for Every Need
        </motion.h2>
        <motion.p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto" variants={sectionVariants}>
          Choose the perfect plan that fits your space and budget. No hidden fees, just transparent value.
        </motion.p>

        {/* Toggle - More refined look */}
        <motion.div className="inline-flex p-1 rounded-full bg-gray-200 dark:bg-gray-700 mb-12 shadow-inner" variants={sectionVariants}>
          {['Monthly', 'Yearly', 'One-time'].map((option) => (
            <button
              key={option}
              onClick={() => setBillingCycle(option as 'Monthly' | 'Yearly' | 'One-time')}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 relative z-10 text-base ${
                billingCycle === option
                  ? 'text-white' // Text color for active state
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {billingCycle === option && (
                <motion.span
                  layoutId="bubble" // Magic Motion for smooth background transition
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: secondaryColor }} // Use secondary color for the active toggle background
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative">{option}</span>
            </button>
          ))}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {currentPricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name || index} // Use plan name or index as key
              className={`relative p-8 rounded-3xl shadow-xl transition-all duration-300 flex flex-col items-center border ${
                plan.isFeatured
                  ? `bg-gradient-to-br from-[${primaryColor}] to-[${secondaryColor}] text-white border-${primaryColor}`
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700'
              }`}
              variants={cardVariants}
              whileHover="hover"
              viewport={{ once: true }}
              custom={index} // Pass index for staggered animation (if desired)
            >
              {/* Badge for featured plan */}
              {plan.isFeatured && (
                <div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide shadow-md"
                  style={{ backgroundColor: secondaryColor, color: 'white' }}
                >
                  {plan.badge || 'Most Popular'}
                </div>
              )}

              {/* Icon / Image Placeholder */}
              <div
                className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center p-4`}
                style={{ backgroundColor: plan.isFeatured ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', border: `2px solid ${plan.isFeatured ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}` }}
              >
                {/* Dynamically render SVG or Image based on `iconPath` or `iconUrl` */}
                {plan.iconPath ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={plan.isFeatured ? 'white' : primaryColor}
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={plan.iconPath}
                    />
                  </svg>
                ) : (
                  <CheckCircleIcon className="w-10 h-10 text-gray-500" /> // Fallback if no specific icon path
                )}
              </div>

              <h3 className="text-3xl font-bold mb-3">{plan.name}</h3>
              <p className={`text-sm mb-4 ${plan.isFeatured ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                {plan.description || "A flexible plan designed to meet your specific needs."}
              </p>
              <p className="text-5xl font-extrabold mb-1">
                ${plan.price.toFixed(0)}{' '} {/* Remove decimals if price is always whole number, or keep .toFixed(2) */}
                <span className={`text-lg font-medium ${plan.isFeatured ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                  / {plan.frequency || 'service'}
                </span>
              </p>

              {/* Features List */}
              <ul className={`mt-8 space-y-4 text-left w-full ${plan.isFeatured ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {plan.features?.map((feature, i) => (
                  <motion.li key={i} className="flex items-center gap-3" variants={featureVariants}>
                    <CheckCircleIcon
                      className={`w-6 h-6 flex-shrink-0 ${
                        plan.isFeatured ? 'text-white' : 'text-green-500' // Use white check for featured, green for others
                      }`}
                    />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <button
                className={`mt-10 px-8 py-4 w-full rounded-full text-lg font-bold shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50`}
                style={{
                  backgroundColor: plan.isFeatured ? 'white' : primaryColor, // White button on featured, primary on others
                  color: plan.isFeatured ? primaryColor : 'white',
                  '--tw-ring-color': plan.isFeatured ? primaryColor : primaryColor, // Ring matches button color
                }}
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