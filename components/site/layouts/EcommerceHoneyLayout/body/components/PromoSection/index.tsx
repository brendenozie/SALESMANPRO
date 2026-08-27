'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#3E2723';

  if (!promotions || promotions.length === 0) return null;

  const displayedPromotions = promotions.slice(0, 3);

  return (
    <section className="py-24 bg-[#FDFCF7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="text-[#B8860B] font-black text-[10px] uppercase tracking-[0.5em] mb-4">
            Limited Opportunities
          </span>
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#3E2723] mb-6">
            Alchemy in <span className="text-[#F3A852]">Every Drop</span>
          </h2>
          <div className="w-12 h-[1px] bg-stone-300" />
        </div>

        {/* Dynamic Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 min-h-[600px]">
          
          {/* Main Feature Promo (60% width on Desktop) */}
          {displayedPromotions[0] && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-7 relative group rounded-[2.5rem] overflow-hidden shadow-2xl shadow-stone-200"
            >
              <img
                src={displayedPromotions[0].bannerUrl || 'https://images.unsplash.com/photo-1471943311424-646960669fbc?q=80&w=1000'}
                alt={displayedPromotions[0].title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/80 via-[#3E2723]/20 to-transparent" />
              
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <div className="max-w-md">
                  <h3 className="text-3xl md:text-4xl font-serif italic text-white mb-4">
                    {displayedPromotions[0].title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base mb-8 font-medium leading-relaxed">
                    {displayedPromotions[0].description}
                  </p>
                  <a
                    href={displayedPromotions[0].ctaLink || '/honeyecommerce/products'}
                    className="inline-flex items-center gap-3 bg-white text-[#3E2723] px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#F3A852] transition-colors group/btn"
                  >
                    {displayedPromotions[0].ctaText || 'Claim Offer'}
                    <ArrowUpRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {/* Secondary Promos Stack (40% width on Desktop) */}
          <div className="md:col-span-5 flex flex-col gap-8">
            {displayedPromotions.slice(1, 3).map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative flex-1 group rounded-[2rem] overflow-hidden border border-stone-100 bg-white"
              >
                <div className="h-full w-full relative">
                    <img
                      src={item.bannerUrl || 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=800'}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-white/90 group-hover:opacity-0 transition-opacity duration-500" />
                    
                    {/* Floating Info Overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B8860B] mb-2">Exclusive</span>
                        <h4 className="text-xl font-bold text-[#3E2723] mb-4 group-hover:text-white transition-colors duration-500 relative z-10">
                            {item.title}
                        </h4>
                        <a 
                            href={item.ctaLink || '#'}
                            className="text-[10px] font-black uppercase tracking-widest text-[#3E2723] border-b-2 border-[#F3A852] pb-1 group-hover:text-white group-hover:border-white transition-all relative z-10"
                        >
                            {item.ctaText || 'Explore'}
                        </a>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#F3A852] opacity-[0.03] blur-[100px] -z-10" />
    </section>
  );
}