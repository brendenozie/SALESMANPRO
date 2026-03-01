'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#ea580c'; 
  const secondary = themeSettings?.secondaryColor || '#18181b';

  // Grab the specific promotion (index 1) or provide high-end fallback
  const promotion: any = promotions?.[1] || {
    title: 'Seasonal Refinement',
    subtitle: 'Limited Time Offer',
    description: 'Elevate your living space with our weekend curation. Exceptional pieces, intentionally priced for a brief window.',
    bannerUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1000',
    ctaText: 'Access the Collection',
    ctaLink: '#',
  };

  return (
    <section className="relative overflow-hidden bg-zinc-950">
      <div className="flex flex-col md:flex-row min-h-[600px]">
        
        {/* --- LEFT: The Visual Impact (Flood Side) --- */}
        <div 
          className="relative w-full md:w-1/2 flex items-center justify-center p-12 overflow-hidden"
          style={{ backgroundColor: primary }}
        >
          {/* Subtle Texture Overlay */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            className="relative z-10 w-full max-w-md aspect-[3/4] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
          >
            <Image
              src={promotion.bannerUrl}
              alt={promotion.title}
              loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
              fill
              className="object-cover rounded-sm"
              sizes="50vw"
            />
            {/* Architectural Border Frame */}
            <div className="absolute inset-4 border border-white/20 pointer-events-none" />
          </motion.div>

          {/* Floating Text Detail */}
          <div className="absolute top-10 left-10 hidden lg:block">
            <span className="text-white/40 text-[12vw] font-black leading-none select-none">
              02
            </span>
          </div>
        </div>

        {/* --- RIGHT: The Narrative (Dark Side) --- */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-24 bg-zinc-950 text-white">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg space-y-10"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="h-px w-12 bg-zinc-700" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">
                  {promotion.subtitle || 'Flash Event'}
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter uppercase leading-[0.9]">
                {promotion.title}
              </h2>
            </div>

            <p className="text-zinc-400 text-lg font-light leading-relaxed">
              {promotion.description}
            </p>

            {/* Time Indicator - Captivating detail */}
            <div className="flex gap-6 py-6 border-y border-zinc-900">
                <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Status</span>
                    <span className="text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Now
                    </span>
                </div>
                <div className="flex flex-col pl-6 border-l border-zinc-900">
                    <span className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Ending</span>
                    <span className="text-white">Sunday, 11:59 PM</span>
                </div>
            </div>

            <div className="pt-4">
              <a
                href={promotion.ctaLink || '#'}
                className="group relative inline-flex items-center gap-8 overflow-hidden rounded-full border border-white/10 px-12 py-5 transition-all hover:border-white/40"
              >
                <span className="relative z-10 text-xs font-black uppercase tracking-[0.3em]">
                  {promotion.ctaText}
                </span>
                <div 
                    className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 group-hover:translate-y-0" 
                />
                {/* Arrow that changes color on hover */}
                <svg 
                    className="relative z-10 w-5 h-5 transition-colors duration-500 group-hover:text-black" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}