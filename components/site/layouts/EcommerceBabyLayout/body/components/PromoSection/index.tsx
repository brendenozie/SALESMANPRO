'use client';

import React from 'react';
import { motion } from 'framer-motion';
// Using Hero Icons as requested
import { ArrowRightIcon, GiftIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import Image from 'next/image';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#F472B6';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Full-Width "Cloud" Banner
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-20 bg-[#FAF9F6] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative rounded-[4rem] bg-white p-8 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-white flex flex-col md:flex-row items-center gap-12"
          >
            {/* Soft background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100/50 blur-[100px] rounded-full" />
            
            <div className="relative z-10 flex-1 space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100">
                <GiftIcon className="w-4 h-4" style={{ color: primary }} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Special Offer</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1]">
                {promo.title}
              </h2>
              <p className="text-lg text-slate-500 max-w-xl font-medium">
                {promo.description}
              </p>
              <motion.a
                href={promo.ctaLink || '#'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 font-bold py-4 px-10 rounded-[2rem] text-white shadow-xl transition-all"
                style={{ backgroundColor: primary }}
              >
                {promo.ctaText || 'Shop Now'}
                <ArrowRightIcon className="w-5 h-5" />
              </motion.a>
            </div>

            <div className="flex-1 relative w-full h-80 md:h-[450px]">
              <div className="absolute inset-0 bg-slate-50 rounded-[3rem] rotate-3 -z-10" />
              <img
                src={promo.bannerUrl || ''}
                alt={promo.title}
                className="w-full h-full object-cover rounded-[3rem] shadow-2xl shadow-pink-100"
              />
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: Asymmetric Bento Grid
  const displayed = promotions.slice(0, 3);
  return (
    <section className="py-20 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {displayed.map((item, index) => {
            const isLarge = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-[3rem] group bg-white shadow-sm border border-slate-100 
                  ${isLarge ? 'md:col-span-8 h-[500px]' : 'md:col-span-4 h-[500px]'}`}
              >
                <img
                  src={item.bannerUrl || ''}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Glassmorphism Content Card */}
                <div className="absolute inset-x-6 bottom-6 p-8 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-xl transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4" style={{ color: secondary }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Limited Edition</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium">
                    {item.description}
                  </p>
                  <a
                    href={item.ctaLink || '#'}
                    className="inline-flex items-center gap-2 text-sm font-black group/btn"
                    style={{ color: primary }}
                  >
                    {item.ctaText || 'Shop Now'}
                    <motion.div 
                      animate={{ x: [0, 5, 0] }} 
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRightIcon className="w-4 h-4" />
                    </motion.div>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}