'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import Link from 'next/link';

export default function PromoSection({ promotions }: { promotions: IPromotion[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0D9488';

  if (!promotions || promotions.length === 0) return null;

  // --- SINGLE PROMO: THE "EDITORIAL SPREAD" ---
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-0 bg-[#FDFDFB] dark:bg-zinc-950 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[80vh]">
          {/* Content Side */}
          <div className="flex-1 flex flex-col justify-center px-6 md:px-24 py-24 bg-zinc-50 dark:bg-zinc-900/50">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl space-y-10"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-[1px] bg-zinc-400" />
                <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-400">
                  Exclusive Invitation
                </span>
              </div>

              <h2 className="text-6xl md:text-9xl font-serif text-zinc-900 dark:text-white leading-[0.8] tracking-tighter">
                {promo.title}
              </h2>

              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-serif italic leading-relaxed">
                {promo.description}
              </p>

              <Link href={promo.ctaLink || '/bookecommerce/products'}>
                <motion.button
                  whileHover={{ gap: '2.5rem' }}
                  className="flex items-center gap-6 py-4 border-b border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-mono text-xs uppercase tracking-[0.3em] transition-all"
                >
                  <span>{promo.ctaText || 'Explore Collection'}</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Image Side */}
          <div className="flex-1 relative min-h-[500px] overflow-hidden">
            <motion.img
              initial={{ scale: 1.2 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000"
            />
          </div>
        </div>
      </section>
    );
  }

  // --- MULTI PROMO: THE "GALLERY LIST" ---
  const displayed = promotions.slice(0, 3);
  return (
    <section className="py-32 bg-[#FDFDFB] dark:bg-zinc-950">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1">
          {displayed.map((item, index) => {
            const isLarge = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className={`relative group overflow-hidden bg-zinc-100 dark:bg-zinc-900
                  ${isLarge ? 'lg:col-span-7 h-[700px]' : 'lg:col-span-5 h-[700px]'}`}
              >
                <img
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s]"
                />
                
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
                
                {/* Minimalist Overlay Content */}
                <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
                  <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500 space-y-6">
                    <div className="flex items-center gap-3">
                      <SparklesIcon className="w-4 h-4 text-white/70" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/70">Archive Spotlight</span>
                    </div>
                    
                    <h3 className="text-4xl md:text-6xl font-serif italic leading-none tracking-tighter">
                      {item.title}
                    </h3>
                    
                    <p className="text-white/60 text-sm font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                      {item.ctaText || 'View Details'}
                    </p>
                  </div>
                </div>

                <Link href={item.ctaLink || '/bookecommerce/products'} className="absolute inset-0 z-20" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}