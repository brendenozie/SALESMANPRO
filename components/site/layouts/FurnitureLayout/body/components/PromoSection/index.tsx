'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { motion, useScroll, useTransform } from 'framer-motion';
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
  const primary = themeSettings?.primaryColor || '#18181b';
  const containerRef = useRef(null);

  if (!promotions || promotions.length === 0) return null;

  // --- 1) HERO FEATURE (SINGLE PROMO) ---
  if (promotions.length === 1) {
    const promo: any = promotions[0];
    
    return (
      <section className="relative bg-zinc-950 py-32 overflow-hidden" ref={containerRef}>
        {/* Background Text Decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03]">
          <span className="text-[20vw] font-black uppercase leading-none whitespace-nowrap">
            {promo.title?.split(' ')[0] || 'CRAFTS'}
          </span>
        </div>

        <div className="max-w-[1700px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* --- IMAGE BLOCK (Span 7) --- */}
          <div className="lg:col-span-7 relative group">
            <div className="relative aspect-[4/5] md:aspect-video w-full overflow-hidden">
              <motion.div 
                initial={{ scale: 1.2 }}
                whileInView={{ scale: 1 }}
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
              
              {/* Floating Badge */}
              <motion.div 
                initial={{ rotate: -10, opacity: 0 }}
                whileInView={{ rotate: 5, opacity: 1 }}
                className="absolute -top-6 -right-6 w-32 h-32 bg-white rounded-full flex items-center justify-center text-zinc-950 p-4 text-center shadow-2xl z-20"
              >
                <span className="text-[10px] font-black uppercase tracking-tighter leading-tight">
                  Limited <br /> Collection
                </span>
              </motion.div>
            </div>
          </div>

          {/* --- CONTENT BLOCK (Span 5) --- */}
          <div className="lg:col-span-5 text-white z-10">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 block">
                  // Selection 2026
                </span>
                <h2 className="text-5xl md:text-7xl font-light tracking-tighter uppercase leading-[0.9]">
                  {promo.title || 'Designed for Life'} <br />
                  <span className="font-serif italic lowercase text-zinc-400">
                    {promo.subtitle || 'Crafted to Last'}
                  </span>
                </h2>
              </div>

              <p className="text-zinc-400 text-lg font-light leading-relaxed max-w-md">
                {promo.description || 'Furniture as an extension of personality. Sourcing only the finest sustainably harvested materials.'}
              </p>

              {/* Artisan Metrics */}
              <div className="flex gap-12 border-t border-zinc-800 pt-8">
                <div>
                  <span className="block text-3xl font-light tracking-tighter">{promo.statOneValue || '100%'}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">{promo.statOneLabel || 'Sustainable'}</span>
                </div>
                <div>
                  <span className="block text-3xl font-light tracking-tighter">{promo.statTwoValue || '25+'}</span>
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500">{promo.statTwoLabel || 'Artisans'}</span>
                </div>
              </div>

              <a
                href={promo.ctaLink || '#'}
                className="group inline-flex items-center gap-6 bg-white text-zinc-950 py-5 px-10 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all"
              >
                {promo.ctaText || 'Discover Piece'}
                <ArrowUpRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // --- 2) MULTI-PROMO GRID (EDITORIAL STYLE) ---
  return (
    <section className="py-32 bg-zinc-50 dark:bg-zinc-900">
      <div className="max-w-[1700px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
          {promotions.slice(0, 3).map((promo, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-950 p-12 group hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-500">
              <div className="relative aspect-square mb-10 overflow-hidden bg-zinc-200">
                <Image
                  src={promo.bannerUrl || 'https://picsum.photos/800'}
                  alt={promo.title}
                  fill
                  className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                />
              </div>
              
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">
                  Offer 0{i + 1}
                </span>
                <h3 className="text-3xl font-light tracking-tighter uppercase text-zinc-900 dark:text-white">
                  {promo.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                  {promo.description}
                </p>
                <a
                  href={promo.ctaLink || '#'}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white pb-1"
                >
                  {promo.ctaText || 'View Archive'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}