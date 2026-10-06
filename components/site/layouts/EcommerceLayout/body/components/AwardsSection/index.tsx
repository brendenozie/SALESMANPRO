'use client';

import React from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/outline';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  },
};

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#6366f1';

  // Fallback data tailored for a premium retail store
  const defaultAwards = [
    { name: 'Vogue Fashion Choice', iconUrl: 'https://images.unsplash.com/photo-1542838686-37a5027588b3?w=400' },
    { name: 'Sustainability Award 2025', iconUrl: 'https://images.unsplash.com/photo-1629910419355-6b2257321598?w=400' },
    { name: 'Global Design Excellence', iconUrl: 'https://images.unsplash.com/photo-1579201529431-a4773221b033?w=400' },
    { name: 'Customer Trust Label', iconUrl: 'https://images.unsplash.com/photo-1563729571343-98282367c00e?w=400' },
  ];

  const displayAwards = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-24 bg-white dark:bg-black overflow-hidden border-t border-slate-100 dark:border-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <TrophyIcon className="w-5 h-5" style={{ color: primary }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">
                Industry Recognition
              </span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none"
            >
              Setting the <span className="italic font-serif font-light" style={{ color: primary }}>Standard</span>.
            </motion.h2>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-slate-500 dark:text-gray-400 text-sm md:text-base max-w-sm font-medium border-l-2 border-slate-100 dark:border-gray-800 pl-6"
          >
            Acknowledged by world-class institutions for our commitment to quality, design, and customer satisfaction.
          </motion.p>
        </div>

        {/* Awards Gallery */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
        >
          {displayAwards.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? award?.url;
            
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -5 }}
                className="group relative h-48 md:h-64 flex items-center justify-center rounded-[2rem] bg-slate-50 dark:bg-gray-900/40 border border-slate-100 dark:border-gray-800/50 overflow-hidden transition-all duration-500 hover:bg-white dark:hover:bg-gray-800 hover:shadow-2xl dark:hover:shadow-none"
              >
                <div className="relative w-full h-full p-8 flex flex-col items-center justify-center text-center">
                  {src ? (
                    <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out opacity-60 group-hover:opacity-100">
                      <Image decoding="async"
                        src={src}
                        alt={award?.name || 'Award'}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <StarIcon className="w-8 h-8 opacity-20 dark:opacity-40" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">
                        {award?.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Subtle Label on Hover */}
                  <div className="absolute bottom-4 left-0 w-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-gray-500">
                      Official Partner
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-slate-100 dark:border-gray-900 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 opacity-40 dark:opacity-20 grayscale"
        >
          <span className="text-xs font-bold tracking-[0.4em] uppercase">Trusted Globally</span>
          <span className="text-xs font-bold tracking-[0.4em] uppercase">Premium Quality</span>
          <span className="text-xs font-bold tracking-[0.4em] uppercase">Certified Retailer</span>
        </motion.div>
      </div>
    </section>
  );
}