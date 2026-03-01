'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStore } from '@/contexts/StoreContext';
import clsx from 'clsx';

// --- Improved Metric Card ---
const MetricCard = ({
  title,
  description,
  iconName,
  index,
  primaryColor
}: {
  title: string;
  description: string;
  iconName: string;
  index: number;
  primaryColor: string;
}) => {
  // Safe Icon Resolution
  const Icon = (OutlineIcons as any)[iconName] || OutlineIcons.SparklesIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      {/* Decorative Number/Index Overlay */}
      <span className="absolute top-4 right-6 text-6xl font-black opacity-[0.03] dark:opacity-[0.05] italic select-none">
        0{index + 1}
      </span>

      <div className="relative z-10 flex flex-col items-start text-left">
        <div 
          className="p-3 rounded-2xl mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        >
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {title}
        </h3>
        
        <p className="text-gray-500 dark:text-zinc-400 leading-relaxed text-sm font-medium">
          {description}
        </p>
      </div>

      {/* Bottom Progress/Accent Bar */}
      <div 
        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 rounded-b-3xl"
        style={{ backgroundColor: primaryColor }}
      />
    </motion.div>
  );
};

interface MetricsSectionProps {
  coreValues?: ICoreValue[];
}

export default function MetricsSection({ coreValues }: MetricsSectionProps) {
  const store = useStore();
  const primaryColor = store?.storeFormData?.themeSettings?.primaryColor || '#ef4444';

  const defaultValues: ICoreValue[] = [
    {
      id: '1',
      title: 'Global Shipping',
      description: 'Expedited delivery to over 50 countries with real-time tracking.',
      icon: 'GlobeAmericasIcon',
    },
    {
      id: '2',
      title: 'Authenticity Guaranteed',
      description: 'Every pair is verified by our experts before it reaches your door.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '3',
      title: 'Flexible Returns',
      description: 'Not the perfect fit? Return or exchange within 30 days, no questions asked.',
      icon: 'ArrowPathRoundedSquareIcon',
    },
  ];

  const data = coreValues && coreValues.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-24 bg-gray-50 dark:bg-black overflow-hidden">
      {/* Blueprint Grid Background Effect */}
      <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.1] pointer-events-none" 
           style={{ backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`, size: '40px 40px', backgroundSize: '40px 40px' }} 
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-xs font-black uppercase tracking-[0.3em]"
              style={{ color: primaryColor }}
            >
              The Standard
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mt-2 italic"
            >
              ENGINEERED FOR <br /> EXCELLENCE.
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gray-500 dark:text-zinc-400 max-w-xs text-sm font-medium"
          >
            We don’t just sell shoes; we deliver a premium service ecosystem tailored for the modern athlete.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {data.map((value, idx) => (
            <MetricCard
              key={value.id}
              index={idx}
              title={value.title}
              description={value.description || ''}
              iconName={value.icon || 'SparklesIcon'}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}