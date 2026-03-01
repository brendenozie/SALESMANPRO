'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

const loader = ({ src, width }: any) => `${src}?w=${width}&q=80`;

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#18181b';

  if (!promotions || promotions.length === 0) return null;

  // Single Feature Promotion - The "Editorial" Layout
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="relative w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[80vh]">
          
          {/* Left: Content Stage */}
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-24 z-10">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="max-w-md space-y-8"
            >
              {promo.badgeText && (
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">
                  // {promo.badgeText}
                </span>
              )}
              
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-none italic">
                {promo.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 === 1 ? 'font-serif lowercase italic text-zinc-400 block' : 'block'}>
                    {word}
                  </span>
                ))}
              </h2>

              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                {promo.description}
              </p>

              <motion.a
                href={promo.ctaLink || '#'}
                whileHover={{ gap: '1.5rem' }}
                className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900 dark:text-white group"
              >
                <span>{promo.ctaText || 'Explore Story'}</span>
                <div className="w-12 h-px bg-current transition-all group-hover:w-20" />
                <ArrowUpRightIcon className="w-4 h-4" />
              </motion.a>
            </motion.div>
          </div>

          {/* Right: Visual Stage with Parallax feel */}
          <div className="w-full md:w-1/2 relative h-[60vh] md:h-auto overflow-hidden">
            <motion.div 
              initial={{ scale: 1.2 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <Image
                src={promo.bannerUrl || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80'}
                alt={promo.title}
                fill
                loader={loader}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-zinc-900/10" />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple Promotions - The "Triptych" Layout
  return (
    <section className="py-32 bg-white dark:bg-zinc-950">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {promotions.slice(0, 3).map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-8">
                <Image
                  src={item.bannerUrl || ''}
                  alt={item.title}
                  fill
                  loader={loader}
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                
                {/* Floating Badge */}
                <div className="absolute top-6 left-6 overflow-hidden">
                  <motion.span 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    className="block bg-white text-zinc-900 text-[8px] font-black uppercase tracking-widest px-3 py-1"
                  >
                    {item.badgeText || 'Limited'}
                  </motion.span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-light uppercase tracking-widest text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <a 
                  href={item.ctaLink || '#'} 
                  className="inline-block text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-900 dark:border-white pb-1 mt-4"
                >
                  {item.ctaText || 'Learn More'}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}