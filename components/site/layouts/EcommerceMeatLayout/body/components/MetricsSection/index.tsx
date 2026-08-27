'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';

interface MetricCardProps { 
  coreValues: ICoreValue[];
}

const CoreValueCard = ({
  title,
  description,
  Icon,
  index,
}: {
  title: string;
  description: string;
  Icon: any;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="group relative p-12 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2rem] hover:bg-stone-950 dark:hover:bg-white transition-all duration-500 overflow-hidden"
    >
      {/* Structural Number Accent */}
      <span className="absolute -bottom-4 -right-2 text-9xl font-black text-stone-100 dark:text-stone-800 group-hover:text-white/10 dark:group-hover:text-black/5 transition-colors pointer-events-none z-0">
        0{index + 1}
      </span>

      <div className="relative z-10 flex flex-col items-start text-left">
        {/* Sharp Icon Container */}
        <div className="mb-10">
          <div className="relative p-5 bg-stone-900 dark:bg-stone-800 text-white rounded-2xl group-hover:bg-red-600 transition-colors duration-500">
            <Icon className="w-8 h-8" />
          </div>
        </div>

        <h3 className="text-2xl font-black text-stone-950 dark:text-white mb-4 tracking-tighter group-hover:text-white dark:group-hover:text-stone-900 transition-colors">
          {title}
        </h3>
        
        <p className="text-stone-500 dark:text-stone-400 text-base leading-relaxed font-medium group-hover:text-stone-300 dark:group-hover:text-stone-600 transition-colors">
          {description}
        </p>

        {/* Tactical Accent Line */}
        <div className="mt-10 w-full h-px bg-stone-100 dark:bg-stone-800 group-hover:bg-white/20 transition-colors" />
      </div>
    </motion.div>
  );
};

export default function TrustSection({ coreValues }: MetricCardProps) {
  const defaultValues = [
    { id: '1', title: 'Prime Grading', description: 'Every cut is hand-inspected and graded for marbling and maturity.', icon: 'CheckBadgeIcon' },
    { id: '2', title: 'Cold Chain Mastery', description: 'Strict 2°C temperature control from the facility to your doorstep.', icon: 'SnowflakeIcon' },
    { id: '3', title: 'Farm-Direct Sourcing', description: 'Direct partnerships with local ranches ensuring 100% grass-fed quality.', icon: 'BuildingStorefrontIcon' },
  ];

  const values = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-40 bg-stone-50 dark:bg-[#050505] overflow-hidden transition-colors duration-500">
      {/* Background Architectural Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-stone-200 dark:bg-stone-900" />
      
      <div className="container relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 mb-10 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-600 dark:text-stone-400">The Master's Standard</span>
          </motion.div>

          <h2 className="text-6xl md:text-8xl font-black text-stone-950 dark:text-white leading-[0.8] tracking-tighter mb-10">
            Uncompromising <br /> 
            <span className="italic font-serif font-light text-red-600">Quality Control.</span>
          </h2>

          <p className="text-xl text-stone-500 dark:text-stone-400 max-w-2xl leading-relaxed font-medium">
            Beyond the cut, we maintain a legacy of excellence through precision logistics and heritage sourcing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8">
          {values.map((value, idx) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);
            
            return (
              <CoreValueCard
                key={value.id}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
                index={idx}
              />
            );
          })}
        </div>

        {/* Bottom Trust Signifier - Culinary Certifications */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 pt-16 border-t border-stone-200 dark:border-stone-900 flex flex-wrap justify-between items-center gap-12"
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Verified By</span>
            <div className="flex flex-wrap gap-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <span className="font-black text-xl tracking-tighter text-stone-900 dark:text-white italic">HACCP CERTIFIED</span>
                <span className="font-black text-xl tracking-tighter text-stone-900 dark:text-white italic">HALAL GUARANTEED</span>
                <span className="font-black text-xl tracking-tighter text-stone-900 dark:text-white italic">KBS REGISTERED</span>
            </div>
          </div>

          <div className="h-20 w-px bg-stone-200 dark:bg-stone-900 hidden lg:block" />

          <div className="max-w-xs">
            <p className="text-xs font-bold text-stone-400 leading-relaxed uppercase tracking-tighter">
                Our facilities undergo weekly independent sanitation audits to ensure 100% compliance with Kenya's safety regulations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}