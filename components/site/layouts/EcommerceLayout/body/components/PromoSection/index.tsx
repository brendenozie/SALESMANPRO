'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

const customLoader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  // Extract dynamic theme setup, with a safe fallback
  const primaryColor = themeSettings?.primaryColor || '#4f46e5';

  if (!promotions || promotions.length === 0) return null;

  // Layout 1: Single Immersive Promotion Block
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-12 sm:py-20 md:py-24 bg-white dark:bg-black transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            whileTap={{ scale: 0.99 }}
            className="group relative rounded-[2rem] md:rounded-[3rem] overflow-hidden min-h-[420px] md:h-[500px] w-full bg-slate-100 dark:bg-gray-900 shadow-xl"
          >
            <Image decoding="async"
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070'}
              alt={promo.title}
              fill
              className="object-cover object-center transition-transform duration-1000 group-hover:scale-105 pointer-events-none"
            />
            {/* Ambient vignette shield overlays */}
            <div className="absolute inset-0 bg-black/40 md:bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            
            <div className="absolute inset-0 flex items-end md:items-center p-6 sm:p-12 md:p-20 z-10">
              <div className="max-w-xl text-left text-white">
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10"
                >
                  <SparklesIcon className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/90">Limited Spotlight</span>
                </motion.div>
                
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-4">
                  {promo.title}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-white/80 font-medium mb-6 md:mb-8 leading-relaxed line-clamp-3 md:line-clamp-none">
                  {promo.description}
                </p>
                
                <Link
                  href={promo.ctaLink || '#'}
                  className="group inline-flex items-center gap-3 px-6 py-3.5 md:px-8 md:py-4 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-xl"
                >
                  {promo.ctaText || 'Shop Collection'}
                  <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Layout 2: Asymmetric Multi-Grid Format (Max 3 Items)
  const displayedPromotions = promotions.slice(0, 3);
  return (
    <section className="py-12 sm:py-20 md:py-24 bg-slate-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Fixed mathematical grid structure: 12 base columns mapped over 2 clean desktop rows */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 sm:gap-6 lg:gap-8 h-auto md:h-[640px]">
          {displayedPromotions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.08 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden shadow-md bg-white dark:bg-gray-900 min-h-[320px] md:min-h-0
                ${index === 0 
                  ? 'md:col-span-7 md:row-span-2' // Main Hero card
                  : 'md:col-span-5 md:row-span-1' // Stacked secondary cards
                }`}
            >
              <Image decoding="async"
                src={item.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070'}
                alt={item.title}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105 pointer-events-none"
              />
              {/* Darkening bottom shield layer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/5" />
              
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white z-10">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tighter mb-2 md:translate-y-2 md:group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </h3>
                
                {/* Fixed mobile display bug: descriptions are readable on mobile, hidden via group-hover only on desktop */}
                <p className="text-white/80 md:text-white/60 text-xs sm:text-sm font-medium mb-4 sm:mb-6 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                  {item.description}
                </p>
                
                <div>
                  <Link
                    href={item.ctaLink || '#'}
                    style={{ '--brand-accent': primaryColor } as React.CSSProperties}
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:text-[var(--brand-accent)] md:group-hover:text-[var(--brand-accent)] transition-colors duration-300"
                  >
                    {item.ctaText || 'Discover'}
                    <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}