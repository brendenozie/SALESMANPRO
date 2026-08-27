'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as HeroIconsOutline from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

const MetricCard = ({
  title,
  description,
  Icon,
  index,
  primaryColor
}: {
  title: string;
  description: string;
  Icon: any;
  index: number;
  primaryColor: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="relative p-12 group border-l border-zinc-100 dark:border-zinc-900 last:border-r"
    >
      <div className="space-y-12">
        {/* Monospaced Technical Index */}
        <div className="flex justify-between items-start">
          <span className="font-mono text-[9px] text-zinc-300 dark:text-zinc-800 uppercase tracking-widest">
            Standard 00{index + 1}
          </span>
          <div className="p-3 border border-zinc-100 dark:border-zinc-900 group-hover:border-zinc-900 dark:group-hover:border-white transition-colors duration-500">
            <Icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-serif italic text-zinc-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <p className="text-[10px] font-mono uppercase leading-relaxed tracking-widest text-zinc-400 dark:text-zinc-500 max-w-[220px]">
            {description}
          </p>
        </div>

        {/* Minimalist Progress Line */}
        <div className="relative h-[1px] w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            whileInView={{ x: "0%" }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="absolute inset-0 w-full h-full"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function MetricsSection({ coreValues }: { coreValues: ICoreValue[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';

  const defaultValues = [
    { id: '1', title: 'Global Security', description: 'Bank-level encrypted checkout protocols.', icon: 'ShieldCheckIcon' },
    { id: '2', title: 'Concierge Support', description: 'Compassionate assistance available 24/7.', icon: 'UserGroupIcon' },
    { id: '3', title: 'Priority Logistics', description: 'Swift, tracked arrival for essential needs.', icon: 'TruckIcon' },
  ];

  const valuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-40 bg-[#FDFDFB] dark:bg-zinc-950 overflow-hidden transition-colors duration-500">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-zinc-900 dark:bg-white" />
              <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-900 dark:text-white">Our Commitments</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-serif text-zinc-900 dark:text-white leading-[0.8] tracking-tighter">
              Defined by <br />
              <span className="italic text-zinc-400 dark:text-zinc-600">Integrity.</span>
            </h2>
          </div>

          <div className="max-w-xs text-right hidden lg:block">
            <p className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest leading-relaxed">
              Every interaction is governed by our studio standards for safety, support, and delivery.
            </p>
          </div>
        </div>

        {/* The Grid - Architectural approach */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-zinc-100 dark:border-zinc-900">
          {valuesToUse.map((value: any, index: number) => {
            const iconKey = value.icon || 'SparklesIcon';
            const Icon = (HeroIconsOutline as any)[iconKey] || HeroIconsOutline.SparklesIcon;
            
            return (
              <MetricCard
                key={value.id}
                index={index}
                title={value.title}
                description={value.description}
                Icon={Icon}
                primaryColor={primary}
              />
            );
          })}
        </div>
      </div>

      {/* Structured Footer Detail */}
      <div className="absolute bottom-10 left-12 hidden md:block">
        <span className="font-mono text-[8px] text-zinc-300 dark:text-zinc-800 tracking-[1em] uppercase">
          Studio Archive © 2026
        </span>
      </div>
    </section>
  );
}