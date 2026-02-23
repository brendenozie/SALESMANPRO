'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, TicketIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#064e3b';

  if (!promotions || promotions.length === 0) return null;

  return (
    <section className="py-24 bg-[#fafaf9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header - Aligned with the Category Section style */}
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-600">
              <TicketIcon className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Seasonal Offers</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              Grow More, <span className="italic font-serif font-light text-emerald-700">Spend Less.</span>
            </h2>
          </div>
          <p className="text-slate-500 font-medium max-w-xs mt-4 md:mt-0">
            Exclusive deals on certified inputs and veterinary essentials.
          </p>
        </div>

        {/* Dynamic Promotion Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feature Promotion (First Item) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-8 relative group cursor-pointer"
          >
            <div className="relative h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src={promotions[0].bannerUrl || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2'}
                alt={promotions[0].title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-10 md:p-14 w-full">
                <div className="flex items-center gap-3 mb-4 text-emerald-400">
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Limited Time Only</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight max-w-xl">
                  {promotions[0].title}
                </h3>
                <p className="text-lg text-slate-200 mb-8 max-w-lg leading-relaxed line-clamp-2">
                  {promotions[0].description}
                </p>
                <a
                  href={promotions[0].ctaLink || '#'}
                  className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-black hover:bg-emerald-500 hover:text-white transition-all group/btn shadow-xl"
                >
                  {promotions[0].ctaText || 'Claim Discount'}
                  <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Secondary Promotions (Vertical Stack) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {promotions.slice(1, 3).map((promo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative flex-1 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase mb-4">
                      Promotion {idx + 2}
                    </span>
                    <h4 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                      {promo.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {promo.description}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <a 
                      href={promo.ctaLink || '#'} 
                      className="text-sm font-black uppercase tracking-tighter text-slate-900 border-b-2 border-emerald-500 pb-1"
                    >
                      {promo.ctaText || 'Shop Now'}
                    </a>
                    <div className="h-12 w-12 rounded-2xl overflow-hidden relative grayscale group-hover:grayscale-0 transition-all">
                        <Image 
                            src={promo.bannerUrl || 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884'} 
                            alt="thumb" 
                            fill 
                            className="object-cover"
                        />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* If there's only one promo, we can show a placeholder or "Coming Soon" card */}
            {promotions.length === 1 && (
               <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-center items-center text-center">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                    <TicketIcon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">More Offers Coming</h4>
                  <p className="text-sm text-slate-400">Join our newsletter to get alerts on flash sales.</p>
               </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}