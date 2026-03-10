'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#000000';

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Immersive Editorial Feature
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative rounded-[3rem] overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:h-[500px]"
          >
            <img
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070'}
              alt={promo.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Elegant overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex items-center p-8 md:p-20">
              <div className="max-w-xl text-white">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-2 mb-6"
                >
                  <SparklesIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Limited Spotlight</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-6">
                  {promo.title}
                </h2>
                <p className="text-lg text-white/60 font-medium mb-10 leading-relaxed max-w-md">
                  {promo.description}
                </p>
                
                <a
                  href={promo.ctaLink || '#'}
                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-2xl"
                >
                  {promo.ctaText || 'Shop Collection'}
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: Masonry-style Grid
  const displayedPromotions = promotions.slice(0, 3);
  return (
    <section className="py-24 bg-slate-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[600px]">
          {displayedPromotions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`group relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5 
                ${index === 0 ? 'md:col-span-7 md:row-span-1' : 'md:col-span-5'}`}
            >
              <img
                src={item.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070'}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-black text-white tracking-tighter mb-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  {item.title}
                </h3>
                <p className="text-white/60 text-sm font-medium mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2">
                  {item.description}
                </p>
                <a
                  href={item.ctaLink || '#'}
                  className="inline-flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity"
                >
                  {item.ctaText || 'Discover'}
                  <ArrowRightIcon className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}