'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';

interface MetricCardProps {
  coreValues: ICoreValue[];
}

const MetricItem = ({
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: [0.21, 1.02, 0.73, 1] }}
      viewport={{ once: true }}
      className="flex flex-col items-start text-left group"
    >
      <div className="mb-6 relative">
        {/* Subtle geometric backdrop */}
        <div className="absolute -inset-2 bg-zinc-100 dark:bg-zinc-800 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full -z-10" />
        <Icon className="w-8 h-8 text-zinc-900 dark:text-white stroke-[1.25]" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
          0{index + 1} // {title}
        </h3>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[200px]">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function MetricsSection({ coreValues }: MetricCardProps) {
  // Enhanced default values for furniture context
  const defaultValues = [
    {
      id: 'v1',
      title: 'Structural Integrity',
      description: 'Hand-inspected joints and premium hardwoods for generational longevity.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: 'v2',
      title: 'Concierge Support',
      description: 'Dedicated specialists available to guide your interior curation.',
      icon: 'ChatBubbleLeftRightIcon',
    },
    {
      id: 'v3',
      title: 'White-Glove Logistics',
      description: 'Climate-controlled delivery and in-home assembly by our experts.',
      icon: 'TruckIcon',
    },
  ];

  const coreValuesToUse = coreValues && coreValues.length > 0 ? coreValues : defaultValues;

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 border-y border-zinc-100 dark:border-zinc-900">
      <div className="max-w-[1700px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Section Lead */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-3xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
              The <br />
              <span className="font-serif italic lowercase text-zinc-400">Standard</span>
            </h2>
            <div className="h-px w-12 bg-zinc-900 dark:bg-white" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Reliability is our <br /> invisible foundation.
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16">
            {coreValuesToUse.map((value: ICoreValue, idx) => {
              const iconKey = (value.icon ?? 'SparklesIcon') as string;
              const Icon =
                ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon) as (
                  props: React.ComponentProps<'svg'>
                ) => JSX.Element;

              return (
                <MetricItem
                  key={value.id}
                  index={idx}
                  title={value.title}
                  description={value.description || ''}
                  Icon={Icon}
                />
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}