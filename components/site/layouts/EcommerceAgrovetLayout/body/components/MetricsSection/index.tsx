'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';

interface MetricCardProps { 
  coreValues: ICoreValue[];
}

const CoreValueCard = ({
  title,
  description,
  Icon,
  index,
}: {
  title: string;
  description: string;
  Icon: any;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.21, 1, 0.36, 1] }}
      viewport={{ once: true }}
      className="group relative p-10 bg-white border border-slate-100 rounded-[3rem] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] transition-all duration-500"
    >
      {/* Subtle Background Number */}
      <span className="absolute top-8 right-10 text-8xl font-black text-slate-50 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
        0{index + 1}
      </span>

      <div className="relative z-10 flex flex-col items-start text-left">
        {/* Animated Icon Container */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-100 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500" />
          <div className="relative p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-200 group-hover:-translate-y-1 transition-transform">
            <Icon className="w-8 h-8 md:w-10 md:h-10" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight group-hover:text-emerald-700 transition-colors">
          {title}
        </h3>
        
        <p className="text-slate-500 text-lg leading-relaxed font-medium">
          {description}
        </p>

        {/* Decorative Progress Bar */}
        <div className="mt-8 h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            whileInView={{ x: '0%' }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-emerald-500 w-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function TrustSection({ coreValues }: MetricCardProps) {
  const defaultValues = [
    { id: '1', title: 'Secured Capital', description: 'End-to-end encrypted transactions protecting your farm investments.', icon: 'ShieldCheckIcon' },
    { id: '2', title: 'Vet Support', description: 'Real-time consultation access to certified veterinary specialists.', icon: 'ChatBubbleLeftRightIcon' },
    { id: '3', title: 'Farm-Gate Logistics', description: 'Rapid, climate-controlled delivery directly to your farm entrance.', icon: 'TruckIcon' },
  ];

  const values = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-32 bg-white overflow-hidden">
      {/* Background Micro-details */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-slate-100 to-transparent" />
      
      <div className="container relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">The Agrovet Advantage</span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
            Built for the <br /> 
            <span className="italic font-serif font-light text-emerald-600">Resilient Farmer.</span>
          </h2>

          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed">
            We don’t just sell products; we provide the foundation for sustainable agricultural success through three core pillars.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {values.map((value, idx) => {
            const iconKey = (value.icon ?? 'SparklesIcon') as string;
            const Icon = ((OutlineIcons as any)[iconKey] || OutlineIcons.SparklesIcon);
            
            return (
              <CoreValueCard
                key={value.id}
                title={value.title}
                description={value.description || ''}
                Icon={Icon}
                index={idx}
              />
            );
          })}
        </div>

        {/* Bottom Trust Signifier */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 pt-12 border-t border-slate-100 flex flex-wrap justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        >
          {/* You would insert partner/certification logos here */}
          <span className="font-black text-xl tracking-tighter text-slate-900 italic">ISO 9001:2015</span>
          <span className="font-black text-xl tracking-tighter text-slate-900 italic">KEPHIS CERTIFIED</span>
          <span className="font-black text-xl tracking-tighter text-slate-900 italic">GLOBAL G.A.P.</span>
        </motion.div>
      </div>
    </section>
  );
}