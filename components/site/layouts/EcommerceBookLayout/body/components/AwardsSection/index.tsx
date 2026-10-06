'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { 
  ShieldCheckIcon, 
  CheckBadgeIcon,
  StarIcon 
} from '@heroicons/react/24/outline';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } 
  },
};

const loader = ({ src }: { src: string }) => src;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';
  
  const defaultAwards = [
    { name: 'Gold Index 2026', category: 'Safety Standards', year: '2026' },
    { name: 'Eco-System Award', category: 'Sustainability', year: '2025' },
    { name: 'Derm-Lab Verified', category: 'Quality Control', year: '2026' },
    { name: 'Global Design Merit', category: 'Innovation', year: '2026' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-40 bg-[#FDFDFB] dark:bg-zinc-950 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Editorial Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-4 mb-8">
              <StarIcon className="w-4 h-4 text-zinc-300" />
              <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-400">Excellence Archive</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-serif text-zinc-900 dark:text-white leading-[0.8] tracking-tighter">
              Quality <br />
              <span className="italic text-zinc-400 dark:text-zinc-600">Verification</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:pt-20">
            <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed text-zinc-400">
              Our collection is subjected to rigorous third-party verification to ensure every thread meets our 2026 Studio Standard.
            </p>
          </div>
        </div>
        
        {/* Awards Gallery Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-l border-zinc-100 dark:border-zinc-900"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl;
            
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative p-12 border-r border-b border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-transparent hover:bg-[#F9F9F7] dark:hover:bg-zinc-900/30 transition-colors duration-700"
              >
                {/* Technical Meta Index */}
                <div className="flex justify-between items-start mb-16">
                   <span className="font-mono text-[8px] text-zinc-300 dark:text-zinc-800">NO. {idx + 1}</span>
                   <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest">{award.year || '2026'}</span>
                </div>

                {/* Visual Representation */}
                <div className="h-24 w-full flex items-center justify-center mb-16 grayscale group-hover:grayscale-0 transition-all duration-700 opacity-20 group-hover:opacity-100">
                  {src ? (
                    <div className="relative w-full h-full">
                      <Image decoding="async"
                        src={src}
                        alt={award.name}
                        fill
                        className="object-contain transition-transform duration-1000 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <CheckBadgeIcon className="w-12 h-12 stroke-[1px] text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-serif italic text-zinc-900 dark:text-white leading-tight">
                    {award.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                    <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">
                      {award.category || 'Certified Official'}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Global Compliance Footer */}
        <div className="mt-32 flex flex-col md:flex-row items-center justify-between gap-12 pt-12 border-t border-zinc-100 dark:border-zinc-900">
           <div className="flex items-center gap-10 opacity-30">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-6 h-6" />
                <span className="font-mono text-[8px] uppercase tracking-widest">ISO 9001</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckBadgeIcon className="w-6 h-6" />
                <span className="font-mono text-[8px] uppercase tracking-widest">OEKO-TEX</span>
              </div>
           </div>
           
           <div className="text-right">
             <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-800">
               Studio Verification Series
             </p>
           </div>
        </div>
      </div>
    </section>
  );
}