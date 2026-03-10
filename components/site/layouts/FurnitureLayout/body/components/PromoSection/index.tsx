'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useRef } from 'react';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings?.primaryColor || '#ef4444';
  const containerRef = useRef(null);

  if (!promotions || promotions.length === 0) return null;

  // --- 1) HERO FEATURE (SINGLE PROMO) ---
  if (promotions.length === 1) {
    const promo: any = promotions[0];
    
    return (
      <section 
        className="relative bg-white dark:bg-zinc-950 py-24 md:py-40 overflow-hidden transition-colors duration-500" 
        ref={containerRef}
      >
        {/* Background Watermark - Adapts color for contrast */}
        <div className="absolute top-10 left-[-5%] w-full h-full overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.02] select-none">
          <span className="text-[35vw] font-black uppercase leading-none whitespace-nowrap text-zinc-900 dark:text-white">
            {promo.title?.split(' ')[0] || 'ATELIER'}
          </span>
        </div>

        <div className="max-w-[1800px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* --- IMAGE BLOCK --- */}
          <div className="lg:col-span-7 relative group order-2 lg:order-1">
            <div className="relative aspect-[4/5] md:aspect-[16/10] w-full overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-2xl">
              <motion.div 
                initial={{ scale: 1.1, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                className="w-full h-full"
              >
                <Image
                  src={promo.bannerUrl || 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000'}
                  alt={promo.title}
                  loader={loader}
                  fill
                  className="object-cover transition-all duration-1000 group-hover:scale-105"
                />
              </motion.div>
              
              {/* Boutique Badge */}
              <motion.div 
                initial={{ rotate: -15, scale: 0 }}
                whileInView={{ rotate: -5, scale: 1 }}
                className="absolute -top-4 -right-4 w-28 h-28 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full flex flex-col items-center justify-center p-4 text-center shadow-xl z-20 border border-zinc-800 dark:border-zinc-100"
              >
                <span className="text-[8px] font-black uppercase tracking-[0.3em] mb-1">Limited</span>
                <span className="text-[10px] font-serif italic">Edition</span>
              </motion.div>
            </div>
          </div>

          {/* --- CONTENT BLOCK --- */}
          <div className="lg:col-span-5 text-zinc-900 dark:text-white order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-10"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-500">
                      Collection 2026
                    </span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
                  {promo.title || 'Studio'} <br />
                  <span className="font-serif italic font-light text-zinc-400 dark:text-zinc-500 lowercase">
                    {promo.subtitle || 'Exclusives'}
                  </span>
                </h2>
              </div>

              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-light leading-relaxed max-w-md">
                {promo.description || 'Redefining the boundaries of contemporary living through architectural integrity.'}
              </p>

              {/* Artisan Metrics */}
              <div className="flex gap-16 py-10 border-y border-zinc-100 dark:border-zinc-900">
                <div>
                  <span className="block text-4xl font-light tracking-tighter" style={{ color: primary }}>{promo.statOneValue || '100%'}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">{promo.statOneLabel || 'Pure Oak'}</span>
                </div>
                <div>
                  <span className="block text-4xl font-light tracking-tighter" style={{ color: primary }}>{promo.statTwoValue || 'Hand'}</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">{promo.statTwoLabel || 'Finished'}</span>
                </div>
              </div>

              <a
                href={promo.ctaLink || '#'}
                className="group relative inline-flex items-center gap-8 py-2 overflow-hidden"
              >
                <span className="text-[11px] font-black uppercase tracking-[0.3em] z-10">
                    {promo.ctaText || 'Acquire Piece'}
                </span>
                <div className="p-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full transition-transform group-hover:rotate-45">
                   <ArrowUpRightIcon className="w-5 h-5" />
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // --- 2) MULTI-PROMO GRID ---
  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Grid lines created via gap and background colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-px lg:bg-zinc-200 lg:dark:bg-zinc-900 border border-transparent lg:border-zinc-200 lg:dark:border-zinc-900">
          {promotions.slice(0, 3).map((promo, i) => (
            <div key={i} className="bg-white dark:bg-zinc-950 p-8 lg:p-16 group transition-all duration-700 hover:z-10 relative">
              <div className="relative aspect-square mb-12 overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <Image
                  src={promo.bannerUrl || 'https://picsum.photos/800'}
                  alt={promo.title}
                  fill
                  className="object-cover transition-all duration-1000 group-hover:scale-110 filter saturate-[0.1] group-hover:saturate-100"
                />
              </div>
              
              <div className="space-y-6 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    <span className="text-[9px] font-black text-zinc-300 dark:text-zinc-700">0{i + 1}</span>
                    <div className="h-[1px] w-4 bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Archive Selection</span>
                </div>
                <h3 className="text-4xl font-light tracking-tighter uppercase text-zinc-900 dark:text-white leading-none">
                  {promo.title}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto lg:mx-0">
                  {promo.description}
                </p>
                <div className="pt-6">
                    <a
                      href={promo.ctaLink || '#'}
                      className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white group"
                    >
                      <span className="border-b border-zinc-900 dark:border-white pb-1 transition-all group-hover:tracking-[0.5em]">
                        {promo.ctaText || 'Explore'}
                      </span>
                    </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}