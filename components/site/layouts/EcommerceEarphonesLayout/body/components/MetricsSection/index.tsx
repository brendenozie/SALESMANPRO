'use client';

import React from 'react';
import { motion } from 'framer-motion';
import * as OutlineIcons from '@heroicons/react/24/outline';
import { ICoreValue } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

// MetricCard: Responsive Tech-Module
const MetricCard = ({
  title,
  description,
  Icon,
  index,
  primary
}: {
  title: string;
  description: string;
  Icon: (props: React.ComponentProps<'svg'>) => JSX.Element;
  index: number;
  primary: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative flex items-center p-8 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[2rem] hover:bg-white dark:hover:bg-white/[0.08] hover:border-black/10 dark:hover:border-white/20 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl"
    >
      {/* Dynamic Glow Background */}
      <div 
        className="absolute -right-4 -bottom-4 w-24 h-24 blur-[50px] opacity-0 group-hover:opacity-20 dark:group-hover:opacity-30 transition-opacity duration-500"
        style={{ backgroundColor: primary }}
      />

      <div className="flex items-center gap-6 relative z-10">
        <div className="flex-shrink-0 p-4 rounded-2xl bg-black/5 dark:bg-white/5 group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-8 h-8" style={{ color: primary }} />
        </div>
        
        <div className="text-left">
          <h3 className="text-lg font-black text-black dark:text-white italic uppercase tracking-tighter leading-none mb-2">
            {title}
          </h3>
          <p className="text-black/50 dark:text-white/40 text-sm font-medium tracking-tight leading-snug">
            {description}
          </p>
        </div>
      </div>

      {/* Interactive Corner Accent */}
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1 h-1 rounded-full bg-black dark:bg-white shadow-[0_0_8px_currentColor]" />
      </div>
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
    { id: '1', title: 'Secure Payment', description: 'Encrypted transaction protocols', icon: 'ShieldCheckIcon' },
    { id: '2', title: '24/7 Support', description: 'Round-the-clock expert assist', icon: 'PhoneIcon' },
    { id: '3', title: 'Fast Delivery', description: 'Hyper-speed fulfillment network', icon: 'TruckIcon' },
  ];

  const coreValuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="py-24 bg-white dark:bg-[#050505] relative overflow-hidden border-t border-black/5 dark:border-white/5 transition-colors duration-300">
      {/* Background Decor Glow */}
      <div 
        className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 blur-[120px] pointer-events-none opacity-10 dark:opacity-[0.07]" 
        style={{ backgroundColor: primary }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Branding Block */}
          <div className="lg:col-span-4 text-left space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-black/10 dark:bg-white/20" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40 dark:text-white/40">Our Standard</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white italic tracking-tighter uppercase leading-[0.9]">
              The Core <br />
              <span style={{ color: primary }}>Experience.</span>
            </h2>
            <p className="text-black/60 dark:text-white/40 text-sm font-medium leading-relaxed max-w-xs">
              Engineered for reliability. We bridge the gap between high-performance gear and world-class service.
            </p>
          </div>

          {/* Right: Feature Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreValuesToUse.map((value: any, index: number) => {
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
            
            {/* CTA Final Card: Dashed Border Style */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center p-8 border border-dashed border-black/10 dark:border-white/10 rounded-[2rem] hover:border-black/30 dark:hover:border-white/30 transition-all group bg-transparent"
            >
              <button className="flex items-center gap-3 text-black/30 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors">
                <span className="text-[10px] font-black uppercase tracking-widest">Read Mission</span>
                <OutlineIcons.ArrowLongRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}