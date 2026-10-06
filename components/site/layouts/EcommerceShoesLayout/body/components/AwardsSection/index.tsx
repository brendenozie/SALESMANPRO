'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon, StarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.3 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
  },
};

const imageLoader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=80`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#000000';

  const defaultAwards = [
    { iconUrl: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519', name: 'Design Excellence' },
    { iconUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a', name: 'Performance Choice' },
    { iconUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', name: 'Sustainable Innovation' },
    { iconUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2', name: 'Global Footwear' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-24 bg-white dark:bg-black overflow-hidden border-t border-gray-100 dark:border-zinc-900">
      {/* Dynamic Background Element */}
      <div 
        className="absolute top-0 right-0 w-1/3 h-full opacity-[0.02] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="h-px w-12 bg-gray-300 dark:bg-zinc-700" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-zinc-500">
                Industry_Benchmark
              </span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white leading-[0.85] tracking-tighter uppercase italic">
              Elite <br />
              <span className="text-transparent" style={{ WebkitTextStroke: `1.5px ${primaryColor}` }}>
                Recognition.
              </span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4 text-gray-400 dark:text-zinc-600">
             <TrophyIcon className="w-12 h-12 stroke-1" />
             <p className="text-xs font-bold uppercase tracking-widest leading-tight">
               Verified by <br /> Independent Panels
             </p>
          </div>
        </div>
        
        {/* Awards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-100 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {awardsToDisplay.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? '';
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative bg-white dark:bg-zinc-950 p-12 flex flex-col items-center text-center transition-all duration-500 hover:z-10"
              >
                {/* Visual Content */}
                <div className="relative w-32 h-32 mb-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-3">
                    {src ? (
                      <div className="relative w-full h-full filter grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-40 group-hover:opacity-100">
                         <Image decoding="async"
                            src={src}
                            alt={award?.name}
                            fill
                            className="object-contain"
                          />
                      </div>
                    ) : (
                      <TrophyIcon className="w-full h-full text-gray-100 dark:text-zinc-900" />
                    )}
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${primaryColor}15` }} />
                </div>

                <div className="relative z-10 space-y-3">
                    <div className="flex justify-center">
                      <StarIcon className="w-5 h-5 scale-0 group-hover:scale-100 transition-transform duration-500" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                      {award?.name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-tighter">
                      Verified // Global Standard
                    </p>
                </div>

                {/* Industrial Corner Detail */}
                <div 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"
                    style={{ color: primaryColor }}
                >
                  <CheckBadgeIcon className="w-6 h-6" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Technical Specs Footer */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 items-center opacity-60 hover:opacity-100 transition-opacity duration-500">
            <div className="flex items-center gap-6">
                <span className="text-4xl font-black italic tracking-tighter text-gray-900 dark:text-white">A+</span>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quality Index</span>
                    <span className="text-xs font-bold dark:text-zinc-300">Certified Durable</span>
                </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-zinc-800 w-full" />

            <div className="flex justify-end gap-10">
                <div className="text-right">
                    <span className="block text-[10px] font-black uppercase text-gray-400">Global Reach</span>
                    <span className="text-xs font-bold dark:text-zinc-300">50+ Countries</span>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] font-black uppercase text-gray-400">Innovation</span>
                    <span className="text-xs font-bold dark:text-zinc-300">Patented Tech</span>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}