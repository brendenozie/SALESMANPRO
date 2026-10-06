'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon } from '@heroicons/react/24/solid';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#FF003C';

  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1542838686-37a5027588b3', name: 'Innovation 2026' },
    { iconUrl: 'https://images.unsplash.com/photo-1629910419355-6b2257321598', name: 'Excellence' },
    { iconUrl: 'https://images.unsplash.com/photo-1579201529431-a4773221b033', name: 'Elite Choice' },
    { iconUrl: 'https://images.unsplash.com/photo-1563729571343-98282367c00e', name: 'Vanguard' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-white dark:bg-[#050505] overflow-hidden border-t border-black/5 dark:border-white/5 transition-colors duration-300">
      {/* Background HUD Elements */}
      <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-black/10 dark:from-white/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="h-px w-8 bg-black/10 dark:bg-white/20" />
            <span className="font-mono text-[10px] tracking-[0.5em] text-black/40 dark:text-white/40 uppercase">
              Accreditation_Verified
            </span>
            <div className="h-px w-8 bg-black/10 dark:bg-white/20" />
          </motion.div>
          
          <h2 className="text-5xl md:text-7xl font-black italic text-black dark:text-white uppercase tracking-tighter leading-none mb-6">
            Industry <span style={{ color: primary }}>Authority.</span>
          </h2>
          <p className="text-black/40 dark:text-white/30 font-medium text-sm md:text-base max-w-lg uppercase tracking-wider">
            Setting the benchmark for high-performance commerce and digital architecture.
          </p>
        </div>
        
        {/* Awards Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl dark:shadow-none"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? '';
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative bg-white dark:bg-[#080808] p-10 md:p-16 flex flex-col items-center justify-center transition-all duration-500 hover:bg-transparent"
              >
                {/* Visual Content */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative w-16 h-16 md:w-24 md:h-24 mb-8">
                    {src ? (
                      <Image decoding="async"
                        src={src}
                        alt={award?.name}
                        fill
                        className="object-contain filter grayscale brightness-75 dark:brightness-50 contrast-125 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <TrophyIcon className="w-full h-full text-black/5 dark:text-white/5 group-hover:text-black dark:group-hover:text-white transition-colors duration-500" />
                    )}
                  </div>
                  
                  <h3 className="text-[10px] md:text-xs font-black text-black/30 dark:text-white/20 group-hover:text-black dark:group-hover:text-white uppercase tracking-[0.3em] text-center transition-colors duration-500">
                    {award?.name}
                  </h3>
                </div>

                {/* Hover Reveal: Primary Color Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-700"
                  style={{ backgroundColor: primary }}
                />
                
                {/* Corner Decorative Dots */}
                <div className="absolute top-4 right-4 w-1 h-1 bg-black/10 dark:bg-white/5 group-hover:bg-black dark:group-hover:bg-white transition-colors" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer Status Bar */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 px-8 py-6 border border-black/5 dark:border-white/5 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] bg-zinc-200 dark:bg-zinc-800" />
               ))}
            </div>
            <p className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">
              Trusted by 500+ Global Partners
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: primary }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: primary }}></span>
            </span>
            <span className="font-mono text-[10px] text-black/50 dark:text-white/60 uppercase tracking-widest">System Status: Optimal</span>
          </div>
        </div>
      </div>
    </section>
  );
}