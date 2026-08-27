'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

// MetricCard Component with a "Floating Glass" design
const MetricCard = ({
  title,
  description,
  Icon,
  index,
  primary,
}: {
  title: string;
  description: string;
  Icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  index: number;
  primary: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative flex items-start gap-6 p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1"
    >
      {/* Dynamic Icon Container */}
      <div 
        className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: `${primary}10`, color: primary }}
      >
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col text-left">
        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-1">
          {title}
        </h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {/* Decorative Corner Element */}
      <div 
        className="absolute bottom-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-tl-[2rem]"
        style={{ backgroundColor: primary }}
      />
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
    { id: '1', title: 'Secure Payment', description: 'PCI-compliant checkout for every transaction.', icon: 'ShieldCheckIcon' },
    { id: '2', title: '24/7 Support', description: 'Our expert team is always a message away.', icon: 'ChatBubbleLeftRightIcon' },
    { id: '3', title: 'Carbon Neutral', description: 'Eco-friendly shipping on all local orders.', icon: 'LeafIcon' },
  ];

  const coreValuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="py-24 bg-gray-50/50 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10 blur-[120px] rounded-full pointer-events-none"
        style={{ backgroundColor: primary }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xs font-black uppercase tracking-[0.3em] text-gray-400"
          >
            Our Philosophy
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter"
          >
            Crafted for <span className="italic font-light text-gray-400">Excellence</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {coreValuesToUse.map((value: ICoreValue, index: number) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);
            
            return (
              <MetricCard
                key={value.id}
                index={index}
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