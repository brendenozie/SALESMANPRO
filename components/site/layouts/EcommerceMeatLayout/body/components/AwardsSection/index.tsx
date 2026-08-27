'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { Award } from '@/types/typings';
import { TrophyIcon, StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HallOfHeritage({ awards }: { awards?: Award[] | null }) {
  const { storeFormData } = useStoreContext();

  const displayAwards = awards?.length ? awards : [
    { name: 'Prime Cut Excellence 2026', iconUrl: 'https://images.unsplash.com/photo-1551028150-64b9f398f678' },
    { name: 'Top Regional Meat Duka', iconUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e' },
    { name: 'Cold-Chain Innovation', iconUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a' },
    { name: 'Master Butcher Certified', iconUrl: 'https://images.unsplash.com/photo-1593967858208-67ddb5b4c406' },
  ];

  if (!displayAwards.length) return null;

  return (
    <section className="relative py-40 bg-white dark:bg-[#050505] overflow-hidden transition-colors duration-500">
      {/* Decorative Branding Watermark */}
      <div className="absolute top-10 left-10 text-[10rem] font-black text-stone-50 dark:text-stone-900/30 pointer-events-none select-none tracking-tighter leading-none">
        ESTB
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
          <div className="max-w-2xl text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-red-600 mb-6"
            >
              <TrophyIcon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Heritage & Pedigree</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl font-black text-stone-950 dark:text-white tracking-tighter leading-[0.85]">
              A Legacy of <br />
              <span className="italic font-serif font-light text-stone-400 dark:text-stone-600">Mastery.</span>
            </h2>
          </div>

          <div className="max-w-sm">
            <p className="text-stone-500 dark:text-stone-400 font-medium border-l-4 border-red-600 pl-8 text-lg leading-relaxed">
              Every accolade reflects our obsession with the perfect cut, the right temperature, and the highest grade of selection.
            </p>
          </div>
        </div>

        {/* Bento Grid with Internal Borders */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-stone-100 dark:bg-stone-900 gap-[1px] border border-stone-100 dark:border-stone-800 rounded-[3rem] overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {displayAwards.map((award: any, idx) => {
            const src = award?.imageUrl ?? award?.iconUrl ?? award?.url;
            
            return (
              <div 
                key={idx} 
                className="group relative bg-white dark:bg-stone-950 p-16 flex flex-col items-center justify-center text-center transition-all duration-700 hover:bg-stone-50 dark:hover:bg-stone-900"
              >
                <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-100 transition-opacity">
                    <CheckBadgeIcon className="w-5 h-5 text-red-600" />
                </div>

                <div className="relative w-32 h-32 mb-10 grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:rotate-12 group-hover:scale-110">
                  {src ? (
                    <Image
                      src={src}
                      alt={award.name}
                      loader={loader}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-50 dark:bg-stone-900 rounded-full">
                        <StarIcon className="w-12 h-12 text-stone-200 dark:text-stone-800" />
                    </div>
                  )}
                </div>

                <h3 className="text-[11px] font-black text-stone-400 dark:text-stone-600 group-hover:text-stone-900 dark:group-hover:text-white uppercase tracking-[0.2em] leading-relaxed transition-colors max-w-[150px]">
                  {award.name}
                </h3>
                
                {/* Visual Indicator of "The Standard" */}
                <div className="absolute bottom-10 w-1 h-1 bg-red-600 rounded-full scale-0 group-hover:scale-100 transition-transform" />
              </div>
            );
          })}
        </motion.div>

        {/* Impact Stats Section */}
        <div className="mt-24 flex flex-wrap justify-between items-center gap-12 px-12">
            {[
                { label: 'Generations', val: '03' },
                { label: 'Premium Outlets', val: '08' },
                { label: 'Customer Trust', val: '99%' },
                { label: 'Annual Cuts', val: '40k+' }
            ].map((stat, i) => (
                <div key={i} className="flex flex-col items-start">
                    <p className="text-4xl md:text-6xl font-black text-stone-950 dark:text-white tracking-tighter mb-2 tabular-nums">
                        {stat.val}
                    </p>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">
                        {stat.label}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}