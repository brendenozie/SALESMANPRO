'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

const MetricCard = ({
  title,
  description,
  Icon,
  primaryColor,
}: {
  title: string;
  description: string;
  Icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  primaryColor: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="relative flex flex-col items-center text-center p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-2xl dark:shadow-none transition-all duration-500"
    >
      {/* Icon Circle */}
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:rotate-12"
        style={{ backgroundColor: `${primaryColor}15` }} // 15% opacity of primary
      >
        <Icon className="w-8 h-8" style={{ color: primaryColor }} />
      </div>

      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
        {description}
      </p>
      
      {/* Decorative Bottom Line */}
      <div 
        className="absolute bottom-6 w-8 h-1 rounded-full opacity-20"
        style={{ backgroundColor: primaryColor }}
      />
    </motion.div>
  );
};

interface MetricCardProps { 
  coreValues: ICoreValue[];
}

export default function MetricsSection({ coreValues }: MetricCardProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';

  const defaultValues = [
    {
      id: '1',
      title: 'Secure Payments',
      description: 'Encrypted transactions for your peace of mind and data safety.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '2',
      title: 'Premium Support',
      description: 'Dedicated lifestyle experts available to assist you 24/7.',
      icon: 'UserIcon',
    },
    {
      id: '3',
      title: 'Express Delivery',
      description: 'Speedy, tracked shipping on all orders across the globe.',
      icon: 'TruckIcon',
    },
  ];

  const coreValuesToUse = coreValues && coreValues.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-24 bg-[#fafaf9] dark:bg-black overflow-hidden transition-colors duration-300">
      {/* Background Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-30 dark:opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-200 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-rose-200 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 mb-4 block"
          >
            The Retail Standard
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-6"
          >
            Elevating Your <span className="italic font-serif font-light" style={{ color: primary }}>Shopping</span> Experience
          </motion.h2>
          <p className="text-slate-500 dark:text-gray-400 text-lg">
            We combine high-end service with seamless technology to ensure every interaction with our brand is world-class.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {coreValuesToUse.map((value) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);

            return (
              <MetricCard
                key={value.id}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
                primaryColor={primary}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}