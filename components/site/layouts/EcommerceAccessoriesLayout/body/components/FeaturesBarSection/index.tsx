'use client';

import React from 'react';
import { 
  TruckIcon, 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon, 
  ArrowPathRoundedSquareIcon 
} from '@heroicons/react/24/solid'; // Changed to Solid icons for a stronger presence
import { useStoreContext } from '@/contexts/StoreContext';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Site Delivery',
    description: 'Direct to your garage, shop, or location',
    tag: 'LOGISTICS-01',
    Icon: TruckIcon,
  },
  {
    title: 'Technical Support',
    description: 'Expert diagnostics for every component',
    tag: 'SUPPORT-02',
    Icon: WrenchScrewdriverIcon,
  },
  {
    title: 'Verified Warranty',
    description: '100% Genuine product cover on parts',
    tag: 'SECURE-03',
    Icon: ShieldCheckIcon,
  },
  {
    title: 'Easy Exchange',
    description: 'Hassle-free automotive parts returns',
    tag: 'RETURN-04',
    Icon: ArrowPathRoundedSquareIcon,
  },
];

export default function AutomotiveFeaturesBar() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

  return (
    <section 
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
      className="relative w-full py-8 lg:py-10 bg-white dark:bg-[#09090b] transition-colors duration-300"
    >
      {/* Refined Boundary Lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-zinc-100 dark:bg-zinc-800/80" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-zinc-100 dark:bg-zinc-800/80" />

      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800/80 border-x border-zinc-100 dark:border-zinc-800/80">
          
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative p-8 md:p-10 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors duration-500 overflow-hidden"
            >
              {/* Subtle Tech Pattern Background (Hover) */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] pointer-events-none transition-opacity duration-700" 
                style={{ 
                  backgroundImage: 'url("/assets/parts_pattern.svg")', 
                  backgroundSize: '80px 80px' 
                }} 
              />

              {/* Technical Serial Tag */}
              <span className="absolute top-4 right-6 text-[8px] font-mono font-bold tracking-[0.3em] text-zinc-300 dark:text-zinc-700 uppercase group-hover:text-[var(--primary-color)] transition-colors">
                {feature.tag}
              </span>

              <div className="flex flex-col gap-6 relative z-10">
                {/* Refined Icon Frame */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Hexagon Border Effect */}
                  <div 
                    className="absolute inset-0 border border-zinc-200 dark:border-zinc-800/80 transform group-hover:rotate-6 transition-transform duration-500 shadow-inner rounded-xl"
                  />
                  
                  <div 
                    className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--primary-color)]/30 rounded-xl transform group-hover:-rotate-3 transition-transform duration-700"
                  />
                  
                  {/* Subtle Glow (Hover) */}
                  <div 
                    className="absolute inset-2 rounded-xl opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-xl transition-opacity duration-500" 
                    style={{ backgroundColor: primaryColor }}
                  />

                  <feature.Icon 
                    className="relative z-10 h-8 w-8 transition-all duration-500 group-hover:scale-110" 
                    style={{ color: primaryColor }}
                  />
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white group-hover:text-[var(--primary-color)] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium tracking-wide leading-relaxed max-w-[240px]">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Active Indicator Line */}
              <div 
                className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-700"
                style={{ backgroundColor: primaryColor }}
              />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}