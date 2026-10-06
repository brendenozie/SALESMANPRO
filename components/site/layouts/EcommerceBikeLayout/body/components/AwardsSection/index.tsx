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
    transition: { staggerChildren: 0.2 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.21, 0.45, 0.32, 0.9] } 
  },
};

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function AwardsSection({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#1a1a1a';
  const gold = '#D4AF37'; // Classic Watch Gold

  const defaultAwards = [
    { name: 'Grand Prix d\'Horlogerie', year: '2025 Winner' },
    { name: 'Chronometer Excellence', year: 'Certified Partner' },
    { name: 'Master Artisan Guild', year: 'Gold Medalist' },
    { name: 'Swiss Heritage Award', year: 'Excellence in Craft' },
  ];

  const awardsToDisplay = awards && awards.length > 0 ? awards : defaultAwards;

  return (
    <section className="relative py-32 bg-white dark:bg-[#050505] overflow-hidden">
      {/* Background Sophistication */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <h2 className="text-[20vw] font-serif italic select-none">Excellence</h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Refined Header */}
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="h-[1px] w-12 bg-zinc-300 dark:bg-zinc-800" />
            <span className="text-[10px] font-bold tracking-[0.4em] text-zinc-400 uppercase">
              The Hall of Horology
            </span>
            <div className="h-[1px] w-12 bg-zinc-300 dark:bg-zinc-800" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-zinc-900 dark:text-zinc-100"
          >
            A Legacy of <span className="italic">Distinction</span>
          </motion.h2>
        </div>
        
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
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
                className="group flex flex-col items-center text-center"
              >
                {/* Prestige Icon Circle */}
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                  {/* Rotating Border on Hover */}
                  <div className="absolute inset-0 rounded-full border border-zinc-100 dark:border-zinc-900 group-hover:border-gold/30 transition-all duration-700 group-hover:rotate-180" />
                  
                  <div className="relative w-16 h-16 transition-transform duration-500 group-hover:scale-110">
                    {src ? (
                      <Image decoding="async"
                        src={src || 'https:images.unsplash.com/photo-1508971344143-1c0b9a1e8c9b?auto=format&fit=crop&w=256&q=80'}
                        alt={award.name}
                        fill
                        className="object-contain grayscale brightness-110 group-hover:grayscale-0"
                      />
                    ) : (
                      <StarIcon className="w-full h-full text-zinc-300 dark:text-zinc-700 group-hover:text-gold transition-colors stroke-[1]" />
                    )}
                  </div>
                  
                  {/* Subtle Accent badge */}
                  <div className="absolute -bottom-2 bg-white dark:bg-zinc-900 px-3 py-1 shadow-xl border border-zinc-100 dark:border-zinc-800 rounded-full">
                    <p className="text-[8px] font-black tracking-widest text-gold uppercase">Verified</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-wider uppercase">
                    {award.name}
                  </h3>
                  <p className="text-xs font-serif italic text-zinc-500 dark:text-zinc-400">
                    {award.year || 'Excellence Standard'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Floating Brand Seals */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-32 flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-125"
        >
          <CheckBadgeIcon className="w-8 h-8" />
          <TrophyIcon className="w-8 h-8" />
          <StarIcon className="w-8 h-8" />
          <div className="font-serif text-xl italic">Authentic</div>
        </motion.div>
      </div>
    </section>
  );
}