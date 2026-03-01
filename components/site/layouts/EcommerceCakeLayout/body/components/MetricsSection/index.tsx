'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as HeroIcons from '@heroicons/react/24/outline'; // Using Hero Icons as requested
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

// Refined MetricCard with Boutique Styling
const MetricCard = ({
  title,
  description,
  Icon,
  index,
  primaryColor
}: {
  title: string;
  description: string;
  Icon: React.ElementType;
  index: number;
  primaryColor: string;
}) => {
  // Variations for the background "glow" to feel like different cake flavors
  const flavors = [
    'from-rose-50 to-pink-100 dark:from-rose-950 dark:to-pink-900',
    'from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900',
    'from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: "backOut" }}
      whileHover={{ y: -10 }}
      className="relative group p-8 rounded-[3rem] bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      {/* Dynamic Background "Flavor" Glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br ${flavors[index % flavors.length]} rounded-[3rem] transition-opacity duration-500 -z-10`} />

      <div className="flex flex-col items-center">
        {/* Icon Container with Boutique Ring */}
        <div className="relative mb-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center bg-slate-50 dark:bg-zinc-700 group-hover:bg-white dark:group-hover:bg-zinc-600 shadow-inner group-hover:shadow-md transition-all duration-300"
          >
            <Icon 
              className="w-10 h-10 transition-colors duration-300" 
              style={{ color: primaryColor }} 
            />
          </div>
          {/* Decorative Sparkle */}
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <HeroIcons.SparklesIcon className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

interface MetricCardProps { 
  coreValues?: ICoreValue[];
}

export default function MetricsSection({ coreValues }: MetricCardProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';

  const defaultValues = [
    {
      id: '1',
      title: 'Secure Payment',
      description: 'Your treats are protected with industry-leading encryption.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '2',
      title: 'Expert Support',
      description: 'Our master bakers and support team are here for you 24/7.',
      icon: 'ChatBubbleLeftRightIcon',
    },
    {
      id: '3',
      title: 'Fresh Delivery',
      description: 'Temperature controlled delivery right to your party.',
      icon: 'TruckIcon',
    },
  ];

  const coreValuesToUse = coreValues && coreValues.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-24 bg-[#FCFAF7] dark:bg-zinc-950 overflow-hidden">
      {/* Decorative Floral/Dough Patterns in background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-100/30 dark:bg-pink-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100/30 dark:bg-amber-900/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400"
          >
            The Artisan Difference
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter"
          >
            Baked with Care, <br/>
            <span style={{ color: primary }}>Delivered with Love.</span>
          </motion.h2>
          <div className="w-24 h-1 bg-amber-500/20 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coreValuesToUse.map((value, idx) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as keyof typeof HeroIcons;
            const Icon = HeroIcons[iconKey] || HeroIcons.SparklesIcon;
            
            return (
              <MetricCard
                key={value.id}
                index={idx}
                title={value.title}
                description={value.description || ''}
                Icon={Icon as any}
                primaryColor={primary}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}