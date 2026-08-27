'use client';

import React, { useState } from 'react';
import { CheckIcon, SparklesIcon, RocketLaunchIcon, CubeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { PricingTier } from '@/types/typings';

const defaultPricingPlans: Array<{
  name: string;
  price: number;
  description: string;
  features: string[];
  isFeatured: boolean;
  frequency: 'Monthly' | 'Yearly' | 'One-time';
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    name: 'Standard',
    price: 99,
    description: 'Perfect for regular maintenance to keep your home fresh.',
    features: ['Dusting & Wiping Surfaces', 'Vacuuming & Mopping Floors', 'Bathroom Sanitization', 'Kitchen Countertop Wipe Down'],
    isFeatured: false,
    frequency: 'Monthly',
    icon: CubeIcon,
  },
  {
    name: 'Deep Clean Pro',
    price: 189,
    description: 'Comprehensive service for a sparkling, refreshed home.',
    features: ['All Standard Features', 'Inside Window Cleaning', 'Oven & Fridge Interior', 'Baseboards & Wall Spot Cleaning', 'Priority Scheduling'],
    isFeatured: true,
    frequency: 'Monthly',
    badge: 'Best Value',
    icon: SparklesIcon,
  },
  {
    name: 'Move-In/Out',
    price: 299,
    description: 'Thorough cleaning for seamless transitions and new beginnings.',
    features: ['Deep Clean Pro Features', 'Inside Cabinets & Drawers', 'Grout Cleaning', 'Post-Construction Cleanup (light)', '24/7 Support'],
    isFeatured: false,
    frequency: 'One-time',
    icon: RocketLaunchIcon,
  },
];

interface PricingSectionProps {
  pricingTiers?: PricingTier[];
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export default function PricingSectionLight({ pricingTiers, themeSettings }: PricingSectionProps) {
  const primaryColor = themeSettings?.primaryColor || '#4CAF50';
  const secondaryColor = themeSettings?.secondaryColor || '#FFC107';

  const allPlans = pricingTiers && pricingTiers.length > 0 ? pricingTiers : defaultPricingPlans;

  // Extract valid frequencies
  const availableCycles = Array.from(
    new Set(allPlans.map((p) => p.frequency).filter(Boolean))
  ) as ('Monthly' | 'Yearly' | 'One-time')[];

  // Set initial state safely based on what cycles actually exist
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly' | 'One-time'>(
    availableCycles.includes('Monthly') ? 'Monthly' : availableCycles[0] || 'Monthly'
  );

  // Filter current plans securely
  const currentPricingPlans = allPlans.filter((plan) => {
    if (!plan.frequency) return billingCycle === 'Monthly';
    return plan.frequency === billingCycle;
  });

  // Dynamic Hex transparency helpers
  const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <section id="packages" className="relative bg-slate-50 dark:bg-slate-900 py-24 lg:py-32 px-4 overflow-hidden">
      {/* Background Ambient Spotlights */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-30 blur-[120px] -z-10"
        style={{
          background: `radial-gradient(100% 100% at 50% 0%, ${hexToRgba(primaryColor, 0.15)} 0%, transparent 80%)`
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-20 blur-[100px] -z-10"
        style={{
          background: `radial-gradient(circle, ${hexToRgba(secondaryColor, 0.2)} 0%, transparent 70%)`
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- HEADER --- */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wider uppercase mb-4"
            style={{ borderColor: hexToRgba(primaryColor, 0.3), color: primaryColor, backgroundColor: hexToRgba(primaryColor, 0.05) }}
          >
            <SparklesIcon className="w-3.5 h-3.5" /> Pricing Plans
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4"
          >
            Transparent plans for <span className="bg-clip-text text-transparent" style={{ backgroundColor: primaryColor }}>every space</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Choose the cleaning frequency and scope that aligns perfectly with your lifestyle. No hidden layout extras.
          </motion.p>
        </div>

        {/* --- TOGGLE BUTTONS --- */}
        {availableCycles.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-16"
          >
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
              {availableCycles.map((option) => (
                <button
                  key={option}
                  onClick={() => setBillingCycle(option)}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-colors duration-300 relative text-sm tracking-wide ${
                    billingCycle === option ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {billingCycle === option && (
                    <motion.span
                      layoutId="activeCycleBg"
                      className="absolute inset-0 rounded-xl shadow-md -z-10"
                      style={{ backgroundColor: primaryColor }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* --- PRICING CARDS GRID --- */}
        <motion.div 
          layout
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch justify-center"
        >
          <AnimatePresence mode="popLayout">
            {currentPricingPlans.map((plan, index) => {
              const IconComponent = (plan as any).icon || CubeIcon;

              return (
                <motion.div
                  layout
                  key={plan.name}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  whileHover={{ y: -8, boxShadow: '0 30px 60px -15px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className={`relative p-8 rounded-3xl bg-white flex flex-col h-full border border-slate-200/80 transition-shadow duration-300 ${
                    plan.isFeatured ? 'shadow-xl' : 'shadow-sm'
                  }`}
                >
                  {/* Premium Prism Border Layer for Featured Card */}
                  {plan.isFeatured && (
                    <div
                      className="absolute inset-0 rounded-3xl -z-10 pointer-events-none"
                      style={{
                        padding: '2px',
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        maskComposite: 'exclude',
                        WebkitMaskComposite: 'xor',
                      }}
                    />
                  )}

                  {/* Asymmetric Elegant Badge */}
                  {plan.isFeatured && (
                    <span
                      className="absolute -top-3 right-6 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                    >
                      {plan.badge || 'Popular'}
                    </span>
                  )}

                  {/* Top Header Layer */}
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">{plan.name}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed min-h-[40px]">
                        {plan.description || 'A highly tailored strategy meeting all structural specifications.'}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: hexToRgba(plan.isFeatured ? primaryColor : secondaryColor, 0.12) }}
                    >
                      <IconComponent className="w-6 h-6" style={{ color: plan.isFeatured ? primaryColor : '#D9A000' }} />
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight text-slate-900">
                      ${plan.price.toFixed(0)}
                    </span>
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider ml-1">
                      {plan.frequency ? `/ ${plan.frequency.toLowerCase()}` : '/ service'}
                    </span>
                  </div>

                  <div className="h-px w-full bg-slate-100 mb-6" />

                  {/* Features List */}
                  <ul className="space-y-3.5 text-left flex-grow text-slate-600 text-sm">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: hexToRgba(primaryColor, 0.1) }}
                        >
                          <CheckIcon className="w-3.5 h-3.5 stroke-[3]" style={{ color: primaryColor }} />
                        </div>
                        <span className="leading-normal font-medium text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Premium Action Button */}
                  <button
                    className="mt-8 px-6 py-3.5 w-full rounded-2xl font-bold text-sm tracking-wide shadow-sm transition-all duration-200 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 border"
                    style={{
                      backgroundColor: plan.isFeatured ? primaryColor : 'transparent',
                      color: plan.isFeatured ? '#fff' : '#0F172A',
                      borderColor: plan.isFeatured ? 'transparent' : '#E2E8F0',
                      '--tw-ring-color': primaryColor,
                    } as React.CSSProperties}
                  >
                    Get Started Now
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty Fallback State */}
          {currentPricingPlans.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center text-slate-500 py-16 bg-white rounded-3xl border border-dashed border-slate-200"
            >
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No options found</p>
              <p className="text-sm text-slate-400 mt-1">There are no packages assigned to the {billingCycle} tier.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}