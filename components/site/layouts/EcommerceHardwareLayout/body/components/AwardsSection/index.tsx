'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { 
  TrophyIcon, 
  CheckBadgeIcon, 
  ShieldCheckIcon, 
  RectangleGroupIcon,
  StarIcon 
} from '@heroicons/react/24/solid';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => src;

export default function IndustrialAccreditations({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber
  
  const defaultAwards = [
    { name: 'KEBS Standard Certified', icon: <CheckBadgeIcon /> },
    { name: 'Industrial Grade 2026', icon: <RectangleGroupIcon /> },
    { name: 'High-Load Tested', icon: <ShieldCheckIcon /> },
    { name: 'Regional Tech Leader', icon: <TrophyIcon /> },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-40 bg-white dark:bg-[#050505] overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      {/* Technical Blueprint Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header: Offset Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32 items-end">
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-900"
            >
              <StarIcon className="w-3 h-3" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Audit Compliance</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter uppercase italic">
              Built for <span className="text-transparent" style={{ WebkitTextStroke: '1px currentColor' }}>Performance</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:text-right pb-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-loose">
              Every system and component in the SalesmanPro hardware ecosystem undergoes rigorous field testing for the East African industrial landscape.
            </p>
          </div>
        </div>
        
        {/* Awards/Accreditation Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 border-t border-l border-zinc-200 dark:border-zinc-800"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl;
            
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative p-16 bg-white dark:bg-zinc-950 border-r border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors duration-500"
              >
                {/* Visual Accent: Serial Number Look */}
                <span className="absolute top-6 left-8 text-[10px] font-black text-zinc-200 dark:text-zinc-800 tracking-tighter group-hover:text-amber-500/30 transition-colors">
                  REG_CODE: 00{idx + 1}
                </span>

                <div className="flex flex-col items-center justify-center space-y-10">
                  <div className="relative w-24 h-24 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-amber-500 transition-all duration-500 group-hover:scale-110">
                    {src ? (
                      <Image decoding="async"
                        src={src}
                        alt={award.name}
                        fill
                        className="object-contain grayscale contrast-125"
                      />
                    ) : (
                      React.cloneElement(award.icon as React.ReactElement, { className: "w-full h-full" })
                    )}
                  </div>

                  <div className="text-center">
                    <h3 className="text-[13px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] leading-tight">
                      {award.name}
                    </h3>
                    <div className="mt-4 flex justify-center gap-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-1 h-1 bg-amber-500 rounded-full group-hover:animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Global Compliance Footer */}
        <div className="mt-32 p-12 bg-zinc-900 dark:bg-white flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="flex items-center gap-6">
            <ShieldCheckIcon className="w-12 h-12 text-amber-500" />
            <div className="text-left text-white dark:text-zinc-900">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Facility Authentication</p>
              <p className="text-2xl font-black uppercase italic tracking-tighter">ISO 9001:2026 Certified</p>
            </div>
          </div>
          
          <div className="flex gap-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="w-12 h-1 bg-white/10 dark:bg-zinc-900/10 group-hover:bg-amber-500 transition-colors duration-700" style={{ transitionDelay: `${i * 100}ms` }} />
             ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right text-white dark:text-zinc-900">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-60">Compliance Agency</p>
              <p className="text-2xl font-black uppercase italic tracking-tighter">KEBS ACCREDITED</p>
            </div>
            <CheckBadgeIcon className="w-12 h-12 text-amber-500" />
          </div>
        </div>
      </div>
    </section>
  );
}