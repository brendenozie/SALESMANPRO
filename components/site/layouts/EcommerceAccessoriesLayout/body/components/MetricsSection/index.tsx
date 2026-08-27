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
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.15, type: "spring", stiffness: 100 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative p-10 bg-white dark:bg-[#0c0c0e] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden z-10"
    >
      {/* Dynamic Hover Glow / Ambient Engine Heat */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700 blur-2xl"
        style={{ backgroundColor: color }}
      />
      
      {/* Subtle Grid Track Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_11px)]" />

      <div className="relative flex flex-col items-start gap-8 z-20">
        {/* Icon with Aerodynamic Wrapper */}
        <div 
          className="w-16 h-16 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 group-hover:-translate-y-2 transition-transform duration-500"
        >
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 animate-pulse" style={{ backgroundColor: color }} />
          <Icon className="relative z-10 w-8 h-8 text-zinc-900 dark:text-white transition-colors duration-500" style={{ '--hover-color': color } as any} />
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tighter drop-shadow-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-zinc-900 group-hover:to-zinc-500 dark:group-hover:from-white dark:group-hover:to-zinc-500 transition-all duration-500">
            {title}
          </h3>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest leading-relaxed">
            {description}
          </p>
        </div>

        {/* Tactical "RPM" Progress Bar */}
        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
          <motion.div 
            initial={{ x: '-100%' }}
            whileInView={{ x: '200%' }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            className="w-1/2 h-full rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ 
              background: `linear-gradient(90deg, transparent, ${color}, transparent)` 
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function AutomotiveMetricsSection({ coreValues }: { coreValues: ICoreValue[] }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#EF4444'; // Racing Red

  const defaultValues = [
    { id: '1', title: 'OEM Certified', description: 'Genuine aftermarket and factory-spec parts strictly verified for performance.', icon: 'ShieldCheckIcon', color: primaryColor },
    { id: '2', title: 'Express Dispatch', description: 'Same-day shipping protocols for all high-priority performance components.', icon: 'TruckIcon', color: primaryColor },
    { id: '3', title: 'Pit-Stop Support', description: 'Expert automotive technicians on standby for installation guidance.', icon: 'WrenchScrewdriverIcon', color: primaryColor },
  ];

  const valuesToUse = coreValues?.length > 0 ? coreValues : defaultValues;

  return (
    <section className="relative py-40 bg-zinc-50 dark:bg-[#09090b] overflow-hidden">
      
      {/* Background Redline Markers */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-[0.02] dark:opacity-[0.04] pointer-events-none select-none overflow-hidden font-black text-[25vw] leading-none uppercase italic whitespace-nowrap">
        REDLINE
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: High-Octane Title */}
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-900 dark:text-white">
              Performance Standards
            </span>
            <div className="w-2 h-2 rounded-full animate-pulse delay-75" style={{ backgroundColor: primaryColor }} />
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[0.9] uppercase italic drop-shadow-md">
            Engineered for <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-900 dark:from-zinc-400 dark:to-white">
              Maximum RPM
            </span>
          </h2>
        </div>

        {/* Grid: Sleek Float Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Subtle connecting line behind cards */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-800 to-transparent -translate-y-1/2 z-0" />
          
          {valuesToUse.map((value: any, index: number) => {
            const iconKey = value.icon || 'FireIcon';
            const Icon = (HeroIconsSolid as any)[iconKey] || HeroIconsSolid.FireIcon;
            
            return (
              <MetricCard
                key={value.id}
                index={index}
                title={value.title}
                description={value.description}
                Icon={Icon}
                color={primaryColor}
              />
            );
          })}
        </div>
      </div>

      {/* --- AERODYNAMIC SLASH DIVIDER --- */}
      <div className="absolute bottom-0 left-0 w-full h-16 pointer-events-none overflow-hidden">
        {/* Adds a fast, slanted "racing stripe" edge to the bottom of the section */}
        <div 
          className="absolute bottom-0 left-0 h-full w-full bg-white dark:bg-[#050505] origin-bottom-right" 
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%, 0 100%)' }}
        />
        <div 
          className="absolute bottom-0 left-0 h-full w-full origin-bottom-right opacity-50" 
          style={{ backgroundColor: primaryColor, clipPath: 'polygon(0 100%, 100% 60%, 100% 100%, 0 100%)' }}
        />
      </div>

    </section>
  );
}