'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as HeroIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';

// Refined MetricCard for a premium feel
const MetricCard = ({
  title,
  description,
  Icon,
  index,
}: {
  title: string;
  description: string;
  Icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 0.45, 0.32, 0.9] }}
      viewport={{ once: true }}
      className="group relative flex flex-col items-center text-center p-8 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-500 rounded-sm"
    >
      {/* Icon with a more sophisticated treatment */}
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 blur-2xl bg-amber-500/10 rounded-full group-hover:bg-amber-500/20 transition-colors duration-500" />
        <Icon className="relative w-10 h-10 text-zinc-900 dark:text-zinc-100 stroke-[1.2] group-hover:text-amber-600 transition-colors duration-500" />
      </div>

      <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-900 dark:text-zinc-100 mb-4">
        {title}
      </h3>
      
      <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 font-light max-w-[240px]">
        {description}
      </p>

      {/* Decorative Corner Accents on Hover */}
      <div className="absolute top-0 left-0 w-0 h-[1px] bg-amber-600 transition-all duration-500 group-hover:w-8" />
      <div className="absolute top-0 left-0 w-[1px] h-0 bg-amber-600 transition-all duration-500 group-hover:h-8" />
    </motion.div>
  );
};

interface MetricCardProps { 
  coreValues: ICoreValue[];
}

export default function MetricsSection({ coreValues }: MetricCardProps) {
  const defaultValues = [
    {
      id: '1',
      title: 'Concierge Support',
      description: 'Our horology experts are available round the clock for personal consultations.',
      icon: 'UserGroupIcon',
    },
    {
      id: '2',
      title: 'Insured Logistics',
      description: 'Every timepiece is shipped with full insurance and white-glove handling.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '3',
      title: 'Lifetime Authenticity',
      description: 'Guaranteed provenance and authenticity certificates with every purchase.',
      icon: 'IdentificationIcon',
    },
  ];

  const values = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="py-24 bg-white dark:bg-[#080808] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="relative mb-20 text-center">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600 mb-4 block"
          >
            The Hallmark of Excellence
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif italic text-zinc-900 dark:text-zinc-100"
          >
            Exquisite Service, <br className="hidden md:block" /> Timeless Trust
          </motion.h2>
          <div className="mt-8 w-12 h-[1px] bg-zinc-300 dark:bg-zinc-800 mx-auto" />
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-zinc-100 dark:border-zinc-900">
          {values.map((value, idx) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((HeroIcons as any)[iconKey] || HeroIcons.SparklesIcon);
            
            return (
              <MetricCard
                key={value.id}
                index={idx}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
              />
            );
          })}
        </div>

        {/* Subtle Footer Brand Mark */}
        <div className="mt-20 flex justify-center opacity-20 dark:opacity-10">
           <HeroIcons.ClockIcon className="w-12 h-12 stroke-[1]" />
        </div>
      </div>
    </section>
  );
}