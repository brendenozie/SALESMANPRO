'use client';

import React from 'react';
import { motion } from 'framer-motion';
// Using Hero Icons as requested
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

const MetricCard = ({
  title,
  description,
  Icon,
  index,
  color
}: {
  title: string;
  description: string;
  Icon: any;
  index: number;
  color: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative flex items-center gap-5 p-6 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 group hover:shadow-xl transition-all duration-500 z-10"
    >
      <div className="relative flex-shrink-0">
        <div 
          className="absolute inset-0 scale-125 blur-xl opacity-20 rounded-full transition-transform group-hover:scale-150"
          style={{ backgroundColor: color }}
        />
        <div 
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6"
          style={{ backgroundColor: `${color}10` }}
        >
          <Icon className="w-8 h-8" style={{ color: color }} />
        </div>
      </div>

      <div className="text-left">
        <h3 className="text-lg font-black text-slate-800 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function MetricsSection({ coreValues }: { coreValues: ICoreValue[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const defaultValues = [
    { id: '1', title: 'Safe & Secure', description: 'Encrypted checkout', icon: 'ShieldCheckIcon', color: secondary },
    { id: '2', title: 'Parent Support', description: 'Expert help 24/7', icon: 'HeartIcon', color: primary },
    { id: '3', title: 'Express Delivery', description: 'Next day arrival', icon: 'RocketLaunchIcon', color: '#10B981' },
  ];

  const valuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative pt-24 pb-48 bg-[#FAF9F6] overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-xs font-black uppercase tracking-[0.3em] text-slate-400"
          >
            The Little Details Matter
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Designed for <span style={{ color: primary }}>Peace of Mind</span>
          </h2>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
          {valuesToUse.map((value: any, index: number) => {
            const iconKey = value.icon || 'SparklesIcon';
            const Icon = (HeroIconsSolid as any)[iconKey] || HeroIconsSolid.SparklesIcon;
            
            return (
              <MetricCard
                key={value.id}
                index={index}
                title={value.title}
                description={value.description}
                Icon={Icon}
                color={value.color || (index % 2 === 0 ? secondary : primary)}
              />
            );
          })}
        </div>
      </div>

      {/* --- LAYERED WAVE DIVIDER --- */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
        <svg 
          className="relative block w-[calc(100%+1.3px)] h-[120px]" 
          data-name="Layer 1" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          {/* Background Slow Wave */}
          <motion.path 
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,34.58V0Z" 
            fill="#FAF9F6" 
            opacity="0.5"
          />
          {/* Main Solid Wave */}
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.51,22.43-10.89,44.67-30.44,50.6-54.41V0Z" 
            fill="#FFFFFF"
          />
        </svg>
      </div>

    </section>
  );
}