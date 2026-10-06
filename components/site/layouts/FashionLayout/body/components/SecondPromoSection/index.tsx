'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

const customLoader = ({ src, width }: any) => `${src}?w=${width}&q=80`;

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b';

  // Grab the second promotion or use high-fashion fallback
  const promo = promotions?.[1] || {
    title: 'The Weekend Series',
    description: 'A curated selection of archival pieces and new arrivals, specifically gathered for the modern silhouette.',
    bannerUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000',
    ctaText: 'View Series',
    ctaLink: '#',
  };

  return (
    <section className="relative py-24 md:py-40 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Subtle Background Text Layer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none overflow-hidden whitespace-nowrap opacity-[0.03] dark:opacity-[0.05]">
        <span className="text-[20vw] font-black uppercase tracking-tighter leading-none">
          {promo.title}
        </span>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          
          {/* --- Image Stage (Floating with Offset) --- */}
          <div className="w-full md:w-1/2 relative group">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[3/4] w-full max-w-md mx-auto"
            >
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border border-zinc-100 dark:border-zinc-800 -z-10 translate-x-8 translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-700" />
              
              <Image decoding="async"
                src={promo.bannerUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000'}
                alt={promo.title}
                fill
                className="object-cover shadow-2xl transition-transform duration-1000 group-hover:scale-[1.02]"
              />
              
              {/* Floating "Label" */}
              <div className="absolute -bottom-6 -right-6 bg-zinc-900 text-white p-6 hidden lg:block">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Est. 2026</p>
              </div>
            </motion.div>
          </div>

          {/* --- Content Stage --- */}
          <div className="w-full md:w-1/2 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 block mb-6">
                // Limited Edition
              </span>
              
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.9] mb-8">
                {promo.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? 'font-serif italic lowercase block translate-x-4 text-zinc-500' : 'block'}>
                    {word}
                  </span>
                ))}
              </h2>

              <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed max-w-md italic font-serif">
                "{promo.description}"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-8 pt-4"
            >
              <a
                href={promo.ctaLink || '/fashionecommerce/products'}
                className="relative group inline-flex items-center justify-center px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 overflow-hidden shadow-xl"
              >
                <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em]">
                  {promo.ctaText || 'Explore'}
                </span>
                <motion.div 
                  className="absolute inset-0 bg-zinc-700 dark:bg-zinc-200"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ type: 'tween', ease: 'circOut' }}
                />
              </a>

              <div className="hidden sm:block h-px w-24 bg-zinc-200 dark:bg-zinc-800" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}