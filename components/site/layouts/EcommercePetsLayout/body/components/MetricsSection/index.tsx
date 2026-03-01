'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as HeroIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

const MetricCard = ({
  title,
  description,
  Icon,
  index,
  primary
}: {
  title: string;
  description: string;
  Icon: any;
  index: number;
  primary: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative flex items-center gap-6 p-8 group"
    >
      {/* Icon with Soft Glow */}
      <div className="relative flex-shrink-0">
        <div 
          className="absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"
          style={{ backgroundColor: primary }}
        />
        <div className="relative w-16 h-16 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center border border-slate-100 dark:border-zinc-700 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-8 h-8 text-slate-900 dark:text-white" />
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* Vertical Divider (Hidden on Mobile/Last Item) */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-12 bg-slate-200 dark:bg-zinc-700 last:hidden" />
    </motion.div>
  );
};

export default function MetricsSection({ coreValues }: { coreValues: ICoreValue[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const defaultValues = [
    { id: '1', title: 'Secure Payment', description: 'SSL Protected Checkout', icon: 'ShieldCheckIcon' },
    { id: '2', title: '24/7 Support', description: 'Expert Pet Care Advice', icon: 'ChatBubbleLeftRightIcon' },
    { id: '3', title: 'Global Shipping', description: 'Fast Doorstep Delivery', icon: 'TruckIcon' },
  ];

  const coreValuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="py-20 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="container mx-auto px-6">
        
        {/* Section Heading */}
        <div className="mb-16 text-center lg:text-left flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">
              // Shop with Confidence
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Built on <span className="font-serif italic font-light text-slate-400">Trust & Care.</span>
            </h2>
          </div>
          <div className="hidden lg:flex items-center gap-2 px-6 py-3 rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-widest">Systems Operational</span>
          </div>
        </div>

        {/* The Metrics Bar */}
        <div className="relative">
          {/* Decorative background element */}
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-zinc-900/50 rounded-[3rem] -z-10" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {coreValuesToUse.map((value, idx) => {
              const iconKey = (value.icon ?? 'SparklesIcon') as string;
              const Icon = (HeroIcons as any)[iconKey] || HeroIcons.SparklesIcon;
              
              return (
                <MetricCard
                  key={value.id}
                  index={idx}
                  title={value.title}
                  description={value.description || ''}
                  Icon={Icon}
                  primary={primary}
                />
              );
            })}
          </div>
        </div>

        {/* Support Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-slate-400"
        >
          <div className="flex items-center gap-2">
             <HeroIcons.ShieldCheckIcon className="w-5 h-5" style={{ color: primary }} />
             <span className="text-xs font-bold uppercase tracking-widest">100% Satisfaction Guarantee</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
          <div className="flex items-center gap-2">
             <HeroIcons.ArrowPathIcon className="w-5 h-5 text-slate-400" />
             <span className="text-xs font-bold uppercase tracking-widest">30-Day Free Returns</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}