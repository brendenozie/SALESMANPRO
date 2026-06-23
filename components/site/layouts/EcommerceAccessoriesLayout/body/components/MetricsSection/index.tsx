'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative p-10 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-amber-500 transition-all duration-500"
    >
      {/* Structural Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-transparent group-hover:border-amber-500 transition-colors" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-transparent group-hover:border-amber-500 transition-colors" />

      <div className="flex flex-col items-start gap-8">
        {/* Icon with "Hard" Shadow */}
        <div 
          className="w-16 h-16 flex items-center justify-center bg-zinc-900 dark:bg-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] group-hover:shadow-[6px_6px_0px_0px_rgba(245,158,11,0.5)] transition-all"
        >
          <Icon className="w-8 h-8 text-white group-hover:text-amber-500 transition-colors" />
        </div>

        <div className="space-y-3">
          <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter">
            {title}
          </h3>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tactical "Scanner" Progress Bar */}
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            whileInView={{ x: '100%' }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-1/3 h-full bg-amber-500 opacity-0 group-hover:opacity-100"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function HardwareMetricsSection({ coreValues }: { coreValues: ICoreValue[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

  const defaultValues = [
    { id: '1', title: 'Tactical Security', description: 'Encrypted trade-portal architecture for bulk procurement.', icon: 'ShieldCheckIcon', color: primary },
    { id: '2', title: 'Site Logistics', description: '24/7 technical dispatch and procurement coordination.', icon: 'TruckIcon', color: primary },
    { id: '3', title: 'ISO Certified', description: 'Full compliance with international industrial safety standards.', icon: 'CheckBadgeIcon', color: primary },
  ];

  const valuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-40 bg-zinc-50 dark:bg-[#050505] overflow-hidden">
      
      {/* Background Technical Markers */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] dark:opacity-[0.05] pointer-events-none select-none overflow-hidden font-black text-[20vw] leading-none uppercase italic">
        WARRANTY
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header: Centered Minimalist */}
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <div className="px-4 py-1 bg-zinc-900 dark:bg-zinc-800 text-white text-[9px] font-black uppercase tracking-[0.5em]">
            Service Level Agreement
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none uppercase italic">
            Engineered for <br/> 
            <span className="text-transparent" style={{ WebkitTextStroke: '1px currentColor' }}>Extreme Performance</span>
          </h2>
        </div>

        {/* Grid: Mechanical Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-2 border-l-2 border-zinc-100 dark:border-zinc-800">
          {valuesToUse.map((value: any, index: number) => {
            const iconKey = value.icon || 'BoltIcon';
            const Icon = (HeroIconsSolid as any)[iconKey] || HeroIconsSolid.BoltIcon;
            
            return (
              <div key={value.id} className="border-r-2 border-b-2 border-zinc-100 dark:border-zinc-800">
                <MetricCard
                  index={index}
                  title={value.title}
                  description={value.description}
                  Icon={Icon}
                  color={primary}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* --- GEOMETRIC SAWTOOTH DIVIDER --- */}
      <div className="absolute bottom-0 left-0 w-full h-24 pointer-events-none">
        <div 
          className="h-full w-full bg-white dark:bg-zinc-950" 
          style={{ clipPath: 'polygon(0% 100%, 5% 80%, 10% 100%, 15% 80%, 20% 100%, 25% 80%, 30% 100%, 35% 80%, 40% 100%, 45% 80%, 50% 100%, 55% 80%, 60% 100%, 65% 80%, 70% 100%, 75% 80%, 80% 100%, 85% 80%, 90% 100%, 95% 80%, 100% 100%)' }}
        />
      </div>

    </section>
  );
}