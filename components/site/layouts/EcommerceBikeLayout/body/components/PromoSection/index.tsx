'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, SparklesIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#1a1a1a';

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Luxury Hero Feature
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="relative py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex-1 space-y-6 z-10"
            >
              <div className="flex items-center gap-2 text-amber-600">
                <SparklesIcon className="w-5 h-5" />
                <span className="text-xs font-bold tracking-[0.3em] uppercase">Exclusive Release</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif leading-tight text-gray-900">
                {promo.title}
              </h2>
              <p className="text-lg text-gray-600 font-light leading-relaxed max-w-lg">
                {promo.description}
              </p>
              <a
                href={promo.ctaLink || '/bikeecommerce/collections'}
                className="group inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest pt-4"
              >
                <span className="relative">
                  {promo.ctaText || 'Discover Collection'}
                  <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-black scale-x-100 group-hover:scale-x-50 transition-transform origin-left" />
                </span>
                <div className="p-3 border border-gray-200 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                  <ArrowUpRightIcon className="w-4 h-4" />
                </div>
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="flex-1 relative w-full aspect-[4/5] md:aspect-square lg:aspect-auto lg:h-[600px]"
            >
              <div className="absolute inset-0 border-[12px] border-gray-100 translate-x-6 translate-y-6" />
              <img
                src={promo.bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'}
                alt={promo.title}
                className="relative w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700 shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: Editorial "Mosaic" Grid
  const items = promotions.slice(0, 3);
  return (
    <section className="py-24 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:h-[700px]">
          {/* Main Large Promo */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="md:col-span-7 relative group overflow-hidden rounded-sm"
          >
            <img src={items[0].bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="" />
            <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent">
              <span className="text-amber-500 text-xs font-bold tracking-widest mb-2 uppercase">Feature</span>
              <h3 className="text-4xl font-serif mb-4">{items[0].title}</h3>
              <a href={items[0].ctaLink || '/bikeecommerce/collections'} className="text-sm font-bold tracking-widest uppercase border-b border-white w-fit pb-1 group-hover:text-amber-500 group-hover:border-amber-500 transition-colors">
                Explore
              </a>
            </div>
          </motion.div>

          {/* Right Column Grid */}
          <div className="md:col-span-5 grid grid-rows-2 gap-8">
            {items.slice(1).map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="relative group overflow-hidden rounded-sm"
              >
                <img src={item.bannerUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa'} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000" alt="" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end bg-black/40 group-hover:bg-black/20 transition-all">
                  <h3 className="text-2xl font-serif mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-300 font-light tracking-wide line-clamp-2 mb-4">
                    {item.description}
                  </p>
                  <a href={item.ctaLink || '/bikeecommerce/collections'} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white">
                    View <ArrowUpRightIcon className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}