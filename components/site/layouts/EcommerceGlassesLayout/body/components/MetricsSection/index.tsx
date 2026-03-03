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
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6 p-4 group"
    >
      {/* Icon with Architectural Background */}
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-[#F3A852] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-full" />
        <div className="relative z-10 w-14 h-14 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm group-hover:border-[#F3A852]/30 transition-colors">
          <Icon className="w-7 h-7 text-[#0D4C4F] group-hover:text-[#F3A852] transition-colors duration-300" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-500 font-light leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

interface MetricCardProps {
  coreValues: ICoreValue[];
}

export default function MetricsSection({ coreValues }: MetricCardProps) {
  const { storeFormData } = useStoreContext();
  
  const defaultValues = [
    {
      id: '1',
      title: 'Secure Checkout',
      description: 'End-to-end encrypted payment processing.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '2',
      title: 'Concierge Support',
      description: 'Dedicated specialists ready to assist you.',
      icon: 'UserGroupIcon',
    },
    {
      id: '3',
      title: 'Global Logistics',
      description: 'White-glove delivery to your doorstep.',
      icon: 'GlobeAltIcon',
    },
  ];

  const coreValuesToUse = coreValues && coreValues.length > 0 ? coreValues : defaultValues;

  return (
    <section className="bg-white py-24 border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Subtle Section Header */}
        <div className="flex flex-col items-center mb-20">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-[#F3A852]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F3A852]">Service Standards</span>
              <span className="h-px w-6 bg-[#F3A852]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 text-center">
                Our <span className="italic font-light">Service Commitment</span>
            </h2>
        </div>

        {/* Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {coreValuesToUse.map((value: ICoreValue, idx: number) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);
            
            return (
              <MetricCard
                key={value.id}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
                index={idx}
              />
            );
          })}
        </div>

        {/* Bottom Decorative Line */}
        <div className="mt-20 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>
    </section>
  );
}