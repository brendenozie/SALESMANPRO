'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#ea580c'; 

  // Grab the specific promotion (index 1) or provide high-end fallback
  const promotion: any = promotions?.[1] || {
    title: 'Seasonal Refinement',
    subtitle: 'Limited Curation',
    description: 'Elevate your living space with our weekend selection. Exceptional pieces, intentionally priced for a brief window.',
    bannerUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1000',
    ctaText: 'Access Collection',
    ctaLink: '#',
  };

  return (
    <section className="relative overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="flex flex-col lg:flex-row min-h-[700px]">
        
        {/* --- LEFT: The Visual Impact (Flood Side) --- */}
        <div 
          className="relative w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 overflow-hidden"
          style={{ backgroundColor: primary }}
        >
          {/* Subtle Grain Texture Overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg aspect-[3/4] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)]"
          >
            <Image
              src={promotion.bannerUrl}
              alt={promotion.title}
              loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
              fill
              className="object-cover"
              sizes="50vw"
            />
            {/* Architectural Border Frame */}
            <div className="absolute inset-6 border border-white/30 pointer-events-none" />
          </motion.div>

          {/* Large Background Index Number */}
          <div className="absolute top-10 left-10 hidden xl:block">
            <span className="text-white/20 text-[15vw] font-black leading-none select-none tracking-tighter">
              02
            </span>
          </div>
        </div>

        {/* --- RIGHT: The Narrative (Adaptive Side) --- */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-zinc-300 dark:bg-zinc-800" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500">
                  {promotion.subtitle || 'Boutique Event'}
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white">
                {promotion.title}
              </h2>
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-light leading-relaxed">
              {promotion.description}
            </p>

            {/* Status Indicators */}
            <div className="flex flex-wrap gap-8 py-8 border-y border-zinc-200 dark:border-zinc-900">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-widest">Availability</span>
                    <span className="text-zinc-900 dark:text-white text-sm flex items-center gap-2 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Active Collection
                    </span>
                </div>
                <div className="flex flex-col gap-1 pl-8 border-l border-zinc-200 dark:border-zinc-800">
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-widest">Window</span>
                    <span className="text-zinc-900 dark:text-white text-sm font-medium">Ends Sunday, 23:59</span>
                </div>
            </div>

            <div className="pt-6">
              <a
                href={promotion.ctaLink || '#'}
                className="group relative inline-flex items-center justify-between min-w-[280px] overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800 px-10 py-6 transition-all hover:border-zinc-900 dark:hover:border-white"
              >
                <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white group-hover:text-white dark:group-hover:text-zinc-900 transition-colors duration-500">
                  {promotion.ctaText}
                </span>
                
                <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-2">
                    <ArrowRightIcon className="w-5 h-5 text-zinc-900 dark:text-white group-hover:text-white dark:group-hover:text-zinc-900 transition-colors duration-500" />
                </div>

                {/* Animated Background Slide */}
                <div 
                    className="absolute inset-0 -translate-x-full bg-zinc-900 dark:bg-white transition-transform duration-500 ease-out group-hover:translate-x-0" 
                />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}