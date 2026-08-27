'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const theme = storeFormData?.themeSettings;

  const primary = theme?.primaryColor || '#0D4C4F';
  const accent = '#F3A852'; // Our brand Peanut color

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Editorial Split Banner
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative h-[600px] rounded-[3rem] overflow-hidden group"
          >
            {/* Background Image with Zoom Effect */}
            <img
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1511499767350-a1590fdb7351?q=80&w=2000&auto=format&fit=crop'}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
            
            {/* Sophisticated Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            {/* Content: Left Aligned Editorial Style */}
            <div className="relative h-full flex items-center p-12 md:p-24">
              <div className="max-w-xl">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="h-px w-8 bg-[#F3A852]" />
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-[#F3A852]">Limited Collection</span>
                </motion.div>
                
                <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-[1.1]">
                  {promo.title}
                </h2>
                
                <p className="text-lg text-white/80 mb-10 leading-relaxed font-light">
                  {promo.description}
                </p>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={promo.ctaLink || '/glassesecommerce/products'}
                  className="inline-flex items-center gap-4 px-10 py-5 rounded-full text-white text-xs font-black uppercase tracking-widest transition-all shadow-2xl"
                  style={{ backgroundColor: primary }}
                >
                  {promo.ctaText || 'Discover Now'}
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: Floating Glass Grid
  return (
    <section className="py-24 bg-[#FDF8F4]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {promotions.slice(0, 3).map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-[500px] rounded-[2.5rem] overflow-hidden bg-white shadow-xl"
            >
              <img
                src={item.bannerUrl || 'https://images.unsplash.com/photo-1509100194014-d49809396daa?q=80&w=1000'}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Floating Glass Card */}
              <div className="absolute inset-x-6 bottom-6">
                <div className="backdrop-blur-md bg-black/30 border border-white/20 rounded-[2rem] p-8 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-serif mb-3 leading-tight">{item.title}</h3>
                  <p className="text-sm text-white/70 mb-6 font-light line-clamp-2">
                    {item.description}
                  </p>
                  <a
                    href={item.ctaLink || '/glassesecommerce/products'}
                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F3A852] hover:text-white transition-colors"
                  >
                    {item.ctaText || 'Shop Collection'} <ArrowRightIcon className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}