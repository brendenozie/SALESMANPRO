'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';

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
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 1.02, 0.73, 1] }}
      viewport={{ once: true }}
      className="relative flex flex-col items-center text-center group"
    >
      {/* The Honeycomb Arch Backdrop */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-amber-100 rounded-t-full rounded-b-3xl scale-0 group-hover:scale-110 transition-transform duration-500 ease-out opacity-40" />
        <div className="relative p-6 border border-stone-100 rounded-t-full rounded-b-3xl bg-white shadow-sm group-hover:shadow-md transition-all duration-300">
          <Icon className="w-10 h-10 text-[#3E2723] stroke-[1.5]" />
        </div>
        
        {/* Subtle Drip Decoration */}
        <motion.div 
          animate={{ height: [4, 12, 4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-amber-400 to-transparent"
        />
      </div>

      <h3 className="text-lg font-bold text-[#3E2723] uppercase tracking-widest mb-3">
        {title}
      </h3>
      <p className="text-stone-500 text-sm font-medium leading-relaxed max-w-[240px]">
        {description}
      </p>
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
      title: 'Purity Guaranteed',
      description: '100% Raw, unfiltered honey directly from our protected valley hives.',
      icon: 'ShieldCheckIcon',
    },
    {
      id: '2',
      title: 'Ethical Harvest',
      description: 'Supporting bee populations through sustainable, low-stress gathering.',
      icon: 'HeartIcon',
    },
    {
      id: '3',
      title: 'Golden Delivery',
      description: 'Carefully packaged in glass to preserve the enzyme-rich profile.',
      icon: 'TruckIcon',
    },
  ];

  const valuesToUse = coreValues && coreValues.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-32 bg-[#FDFCF7] overflow-hidden">
      {/* Decorative Organic Line */}
      <svg className="absolute top-0 left-0 w-full h-24 text-white fill-current" preserveAspectRatio="none" viewBox="0 0 1440 320">
        <path d="M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,144C1120,139,1280,181,1360,202.7L1440,224L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
      </svg>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[#B8860B] font-black text-[10px] uppercase tracking-[0.5em] block mb-4"
          >
            Our Core Promise
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#3E2723] mb-6">
            Crafted by Bees, <span className="text-[#F3A852]">Protected by Us</span>
          </h2>
          <div className="w-16 h-[1px] bg-amber-200 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
          {valuesToUse.map((value, idx) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);

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
      </div>

      {/* Decorative Bee Path (Subtle) */}
      <svg className="absolute bottom-10 right-10 w-64 h-32 opacity-10 pointer-events-none" viewBox="0 0 200 100">
        <path 
          d="M0,80 C50,80 50,20 100,20 C150,20 150,80 200,80" 
          fill="none" 
          stroke="#B8860B" 
          strokeWidth="1" 
          strokeDasharray="4 4" 
        />
      </svg>
    </section>
  );
}