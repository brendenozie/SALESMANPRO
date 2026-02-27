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
  primary
}: {
  title: string;
  description: string;
  Icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  primary: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center p-8 group"
    >
      <div 
        className="w-16 h-16 flex items-center justify-center rounded-full mb-6 transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundColor: `${primary}08` }} // Very subtle tint of primary
      >
        <Icon 
          className="w-7 h-7 stroke-[1.5px] transition-colors duration-300" 
          style={{ color: primary }}
        />
      </div>
      <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-slate-400 font-serif italic text-sm leading-relaxed max-w-[200px]">
        {description}
      </p>
    </motion.div>
  );
};

interface MetricCardProps { 
  coreValues: ICoreValue[];
}

export default function MetricsSection({ coreValues }: MetricCardProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  const defaultValues = [
    {
      id: '1',
      title: 'Secure Checkout',
      description: 'Encrypted & ethereal transactions',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '2',
      title: 'Concierge Support',
      description: 'Dedicated floral assistance 24/7',
      icon: 'UserGroupIcon',
    },
    {
      id: '3',
      title: 'Studio Delivery',
      description: 'Hand-delivered with botanical care',
      icon: 'TruckIcon',
    },
  ];

  const coreValuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="py-24 bg-[#FCFBFA] border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Subtle Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.5em]">
            The Boutique Standard
          </span>
          <h2 className="text-3xl md:text-4xl font-serif italic text-slate-900">
            Why Our <span className="text-slate-400">Patrons</span> Choose Us
          </h2>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {coreValuesToUse.map((value: ICoreValue, index: number) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);

            return (
              <MetricCard
                key={value.id}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
                primary={primary}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}