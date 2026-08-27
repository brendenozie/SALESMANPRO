'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStore } from '@/contexts/StoreContext';

// --- Editorial Metric Card ---
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
  const Icon = (OutlineIcons as any)[iconName] || OutlineIcons.SparklesIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.21, 0.45, 0.32, 0.9] }}
      viewport={{ once: true }}
      className="group relative flex flex-col items-center text-center p-8 border-x border-transparent hover:border-gray-100 dark:hover:border-zinc-800 transition-colors duration-500"
    >
      {/* Delicate Icon Representation */}
      <div className="mb-8 relative">
        <div 
          className="absolute inset-0 scale-150 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{ backgroundColor: primaryColor }}
        />
        <Icon 
          className="w-10 h-10 stroke-[1px] relative z-10 transition-transform duration-700 group-hover:scale-110" 
          style={{ color: primaryColor }} 
        />
      </div>

      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <p className="text-gray-500 dark:text-zinc-400 text-sm leading-relaxed font-light max-w-[240px]">
        {description}
      </p>

      {/* Decorative Dot */}
      <div 
        className="mt-8 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
  const primaryColor = store?.storeFormData?.themeSettings?.primaryColor || '#18181b';

  const defaultValues: ICoreValue[] = [
    {
      id: '1',
      title: 'Premium Quality',
      description: 'Sourced from the finest fabrics and world-class artisans.',
      icon: 'ScissorsIcon',
    },
    {
      id: '2',
      title: 'Global Curation',
      description: 'A hand-picked collection of international styles and trends.',
      icon: 'GlobeEuropeAfricaIcon',
    },
    {
      id: '3',
      title: 'Ethical Fashion',
      description: 'Committed to sustainability and fair-trade craftsmanship.',
      icon: 'HandRaisedIcon',
    },
  ];

  const data = coreValues && coreValues.length > 0 ? coreValues : defaultValues;

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Editorial Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="h-[1px] w-8 bg-gray-200 dark:bg-zinc-800" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400">
              The Philosophy
            </span>
            <div className="h-[1px] w-8 bg-gray-200 dark:bg-zinc-800" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-3xl md:text-5xl font-light text-gray-900 dark:text-white tracking-tight leading-tight uppercase italic"
          >
            Elegance in <span className="font-serif italic">Every Detail.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-y border-gray-100 dark:border-zinc-900">
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

        {/* Brand Footer Ticker */}
        <div className="mt-16 overflow-hidden whitespace-nowrap opacity-10 pointer-events-none">
          <div className="flex animate-marquee text-[8vh] font-black uppercase tracking-tighter">
            <span className="mx-4">Sophistication</span>
            <span className="mx-4">Artistry</span>
            <span className="mx-4">Heritage</span>
            <span className="mx-4">Modernity</span>
            <span className="mx-4">Sophistication</span>
            <span className="mx-4">Artistry</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </section>
  );
}