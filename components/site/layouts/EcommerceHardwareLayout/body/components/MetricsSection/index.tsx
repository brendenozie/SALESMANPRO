'use client';

import React from 'react';
import { motion } from 'framer-motion';
// Using Hero Icons as per your saved preference
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
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100 
      }}
      viewport={{ once: true }}
      className="relative flex flex-col items-center text-center gap-6 p-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-white dark:border-zinc-800 group hover:-translate-y-3 transition-all duration-500 z-10"
    >
      <div className="relative">
        {/* The "Halo" Glow */}
        <div 
          className="absolute inset-0 scale-150 blur-[30px] opacity-20 rounded-full transition-all duration-700 group-hover:opacity-40 group-hover:scale-[2]"
          style={{ backgroundColor: color }}
        />
        
        {/* The Icon Container */}
        <motion.div 
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
          className="relative w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:rotate-[10deg] transition-transform duration-500"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-10 h-10" style={{ color: color }} />
        </motion.div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-bold leading-relaxed max-w-[200px] mx-auto">
          {description}
        </p>
      </div>

      {/* Interactive Bottom Accent */}
      <div 
        className="w-12 h-1 rounded-full opacity-30 transition-all duration-500 group-hover:w-20 group-hover:opacity-100" 
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
};

export default function MetricsSection({ coreValues }: { coreValues: ICoreValue[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F472B6';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6';

  const defaultValues = [
    { id: '1', title: 'Safe & Secure', description: 'Bank-level encrypted checkout for your peace of mind.', icon: 'ShieldCheckIcon', color: secondary },
    { id: '2', title: 'Expert Support', description: 'Compassionate help from our team, available 24/7.', icon: 'HeartIcon', color: primary },
    { id: '3', title: 'Express Delivery', description: 'Swift, tracked arrival because babies don’t wait!', icon: 'RocketLaunchIcon', color: '#10B981' },
  ];

  const valuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative pt-32 pb-60 bg-[#FAF9F6] dark:bg-zinc-950 overflow-hidden transition-colors duration-500">
      
      {/* Dynamic Background Elements */}
      <div 
        className="absolute -top-24 -left-24 w-96 h-96 blur-[120px] opacity-10 rounded-full pointer-events-none"
        style={{ backgroundColor: primary }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-24 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700"
          >
            <HeroIconsSolid.SparklesIcon className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
              The Little Details Matter
            </span>
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
            Designed for <br/> 
            <span className="italic" style={{ color: primary }}>Peace of Mind</span>
          </h2>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
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

      {/* --- REFINED ORGANIC WAVE DIVIDER --- */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
        <svg 
          className="relative block w-[calc(100%+1.3px)] h-[150px]" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          {/* Animated Mid-Layer Wave */}
          <motion.path 
            animate={{ 
              d: [
                "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,34.58V0Z",
                "M0,0V46.29c47.79,22.2,120,10,180,20,70.36,15,136.33,10,206.8,5,73.84-10,147.54,5,218.2,20,69.27,15,138.3,10,209.4,0,36.15-15,69.85-10,104.45-5,70,10,180,20,280,30V0Z",
                "M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,2,1200,34.58V0Z"
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            fill={primary} 
            fillOpacity="0.05"
          />
          {/* Main Bottom Solid Wave */}
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.51,22.43-10.89,44.67-30.44,50.6-54.41V0Z" 
            className="fill-white dark:fill-zinc-950 transition-colors duration-500"
          />
        </svg>
      </div>

    </section>
  );
}