'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  if (!promotions || promotions.length === 0) return null;

  // --- Single Promotion: Ultra-Wide Glass Hero ---
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <Image decoding="async"
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000'}
              alt={promo.title}
              fill
              className="object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 flex items-center p-12 md:p-20">
              <div className="max-w-xl space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-1.5 rounded-full text-white text-sm font-bold uppercase tracking-widest"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Limited Time Offer
                </motion.div>
                
                <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                  {promo.title}
                </h2>
                
                <p className="text-xl text-white/80 font-medium leading-relaxed">
                  {promo.description}
                </p>
                
                <motion.a
                  href={promo.ctaLink || '/groceriesecommerce/products'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-black text-lg shadow-xl transition-all hover:bg-opacity-90"
                >
                  {promo.ctaText || 'Claim Offer'}
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // --- Multiple Promotions: Magazine Bento Grid ---
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[600px]">
          {promotions.slice(0, 3).map((item, index) => {
            // Layout logic: First item is large, others are stacked
            const isLarge = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-[2.5rem] overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500 ${
                  isLarge ? 'md:col-span-7 h-[400px] md:h-full' : 'md:col-span-5 h-[300px] md:h-[calc(50%-1rem)]'
                }`}
              >
                <Image decoding="async"
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000'}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="space-y-3">
                    <h3 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-black text-white leading-tight`}>
                      {item.title}
                    </h3>
                    {isLarge && (
                      <p className="text-white/70 text-lg line-clamp-2 max-w-md">
                        {item.description}
                      </p>
                    )}
                    <div className="pt-2">
                      <a
                        href={item.ctaLink || '/groceriesecommerce/products'}
                        className="inline-flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider group/link"
                      >
                        <span className="relative">
                          {item.ctaText || 'Explore'}
                          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all group-hover/link:w-full" />
                        </span>
                        <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Accent Corner Decor */}
                <div 
                  className="absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-40 rounded-full"
                  style={{ backgroundColor: primary }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}