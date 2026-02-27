'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Elegant Asymmetrical Hero
  if (promotions.length === 1) {
    const promotion = promotions[0];
    return (
      <section className="py-24 bg-[#FCFBFA] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Image Side with Decorative Element */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative w-full lg:w-1/2"
            >
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl z-10">
                <img
                  src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1558191053-c03db2757e3d?q=80&w=2070&auto=format&fit=crop'}
                  alt={promotion.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                />
              </div>
              {/* Decorative "Stem" Frame */}
              <div 
                className="absolute -top-6 -left-6 w-full h-full border border-rose-200 rounded-[3rem] -z-0"
              />
            </motion.div>

            {/* Content Side */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-1/2 flex flex-col items-start"
            >
              <span className="text-rose-500 text-[11px] uppercase tracking-[0.4em] font-bold mb-6">
                Limited Edition
              </span>
              <h2 className="text-5xl md:text-7xl font-serif italic text-slate-900 leading-[1.1] mb-8">
                {promotion.title}
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-md">
                {promotion.description}
              </p>
              <a
                href={promotion.ctaLink || '#'}
                className="group flex items-center gap-4 py-4 px-10 rounded-full text-white font-bold uppercase tracking-widest text-[12px] shadow-lg transition-all duration-300"
                style={{ backgroundColor: primary }}
              >
                {promotion.ctaText || 'Shop Collection'}
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: Clean Editorial Grid
  const displayedPromotions = promotions.slice(0, 3);
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {displayedPromotions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                <img
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9'}
                  alt={item.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              </div>
              
              <div className="text-center px-4">
                <h3 className="text-2xl font-serif italic text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <a
                  href={item.ctaLink || '#'}
                  className="inline-block text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 border-b-2 pb-1 transition-all duration-300 group-hover:text-rose-500 group-hover:border-rose-500"
                  style={{ borderColor: `${primary}20` }}
                >
                  {item.ctaText || 'Discover'}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}