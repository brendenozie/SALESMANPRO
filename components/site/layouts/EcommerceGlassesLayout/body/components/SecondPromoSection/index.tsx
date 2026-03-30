'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const theme = storeFormData?.themeSettings;

  const primary = theme?.primaryColor || '#0D4C4F'; // Deep Teal
  const accent = '#F3A852'; // Peanut Orange

  // Grab the second promotion or use the high-end fallback
  const promotion = promotions?.[1] || {
    title: 'Weekend Frames Special',
    subtitle: 'Limited Time Offer',
    description:
      'Elevate your perspective with our exclusive weekend collection. Precisely crafted, architectural silhouettes available at an exceptional value for 48 hours only.',
    bannerUrl: 'https://images.unsplash.com/photo-1511499767350-a1590fdb7351?q=80&w=1200&auto=format&fit=crop',
    ctaText: 'Shop the Drop',
    ctaLink: '/ecommerce/products',
  };

  return (
    <section className="relative py-24 bg-white overflow-hidden">
      {/* Background Decorative Element: Large Outlined Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] hidden lg:block">
        <h2 className="text-[25vw] font-black uppercase leading-none tracking-tighter text-black outline-text">
          LIMITED
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-[#0D4C4F] rounded-[3rem] overflow-hidden shadow-2xl relative">
          
          {/* Decorative Teal/Peanut shapes inside the box */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F3A852] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[500px]">
            
            {/* --- Image Block: Layered & Floating --- */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative p-12 lg:p-20 flex justify-center lg:justify-start order-2 lg:order-1"
            >
              <div className="relative group">
                {/* Image Backdrop Shadow */}
                <div className="absolute inset-0 bg-black/40 blur-2xl rounded-2xl scale-90 translate-y-8 group-hover:translate-y-12 transition-transform duration-500" />
                
                <div className="relative w-full aspect-square md:w-[400px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  <img
                    src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1511499767350-a1590fdb7351?q=80&w=1200&auto=format&fit=crop'}
                    alt={promotion.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                  />
                  
                  {/* Glassmorphism Badge on Image */}
                  <div className="absolute top-4 right-4 backdrop-blur-md bg-white/10 border border-white/20 px-4 py-2 rounded-full">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Ending Soon</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* --- Text Block: Clean Editorial --- */}
            <div className="p-12 lg:p-20 order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-px w-8 bg-[#F3A852]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F3A852]">
                    Flash Event
                  </span>
                </div>

                <h2 className="text-4xl md:text-6xl font-serif text-white leading-none mb-8">
                  {promotion.title}
                </h2>

                <p className="text-white/70 text-base md:text-lg font-light leading-relaxed mb-10 max-w-lg">
                  {promotion.description}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={promotion.ctaLink || '/glassesecommerce/products'}
                    className="inline-flex items-center gap-3 bg-[#F3A852] text-white px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl transition-all"
                  >
                    {promotion.ctaText || 'Shop Collection'}
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </motion.a>
                  
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0D4C4F] bg-gray-200 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                            </div>
                        ))}
                    </div>
                    <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                        +200 Browsing
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>

      <style jsx>{`
        .outline-text {
          -webkit-text-stroke: 1px currentColor;
          color: transparent;
        }
      `}</style>
    </section>
  );
}