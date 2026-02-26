'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Full-width "Boutique Feature"
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-24 bg-[#FCFAF7]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative group h-[500px] md:h-[600px] rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <Image
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a'}
              alt={promo.title}
              fill
              className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
            />
            {/* Elegant overlay: Darker on left for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-20 max-w-3xl">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-amber-500 font-black uppercase tracking-[0.4em] text-xs mb-4"
              >
                Limited Time Offer
              </motion.span>
              <h2 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tighter leading-none">
                {promo.title}
              </h2>
              <p className="text-lg md:text-xl text-gray-200 mb-10 font-light italic leading-relaxed">
                {promo.description}
              </p>
              <div>
                <a
                  href={promo.ctaLink || '#'}
                  className="inline-block bg-white text-black font-black uppercase tracking-widest text-xs px-10 py-5 hover:bg-amber-500 hover:text-white transition-all duration-300 rounded-sm shadow-xl"
                >
                  {promo.ctaText || 'Discover More'}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: "Artisan Gallery Grid"
  return (
    <section className="py-24 bg-[#FCFAF7]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {promotions.slice(0, 3).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative h-[450px] group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
            >
              <Image
                src={item.bannerUrl || ''}
                alt={item.title}
                loader={({ src }) => src} // Use the URL directly without modification
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Subtle vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-amber-500 font-bold text-[10px] tracking-[0.3em] uppercase mb-2">Special</span>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm mb-6 line-clamp-2 italic font-light">
                  {item.description}
                </p>
                <a
                  href={item.ctaLink || '#'}
                  className="w-full text-center py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
                >
                  {item.ctaText || 'Explore'}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}