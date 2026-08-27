'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  
  // Grab the second promotion (index 1) or use a "Peanut-Branded" fallback
  const promotion = promotions?.[1] || {
    title: 'The Weekend Roast Special',
    subtitle: 'Limited Batch Release',
    description:
      'Every weekend, we fire up the vintage roaster for a special small-batch blend. Rich, aromatic, and delivered straight from the cooling tray to your door.',
    bannerUrl:
      'https://images.unsplash.com/photo-1590004953392-5aba2e78636b?auto=format&fit=crop&q=80&w=800',
    ctaText: 'Claim Your Jar',
    ctaLink: '#',
  };

  const gold = '#F3A852';
  const cocoa = '#3E2723';

  return (
    <section className="relative py-24 bg-[#FAF7F2] overflow-hidden">
      {/* Background Text Decor */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20vw] font-black text-[#3E2723]/[0.02] select-none pointer-events-none whitespace-nowrap">
        FRESH BATCH
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-white rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(62,39,35,0.08)] border border-stone-100 flex flex-col md:flex-row">
          
          {/* --- Image Block --- */}
          <div className="w-full md:w-1/2 relative h-[400px] md:h-auto overflow-hidden">
            <motion.img
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 1.5 }}
              src={promotion.bannerUrl}
              alt={promotion.title}
              className="w-full h-full object-cover"
            />
            {/* Stamp Overlay */}
            <div className="absolute top-8 left-8 w-24 h-24 bg-[#F3A852] rounded-full flex items-center justify-center rotate-[-15deg] shadow-lg border-4 border-white">
              <span className="text-[#3E2723] font-black text-[10px] uppercase tracking-tighter text-center leading-tight">
                Freshly<br/>Roasted<br/>2026
              </span>
            </div>
          </div>

          {/* --- Text Block --- */}
          <div className="w-full md:w-1/2 p-10 md:p-20 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#8B4513] font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
                {promotion.badgeText || 'Seasonal Exclusive'}
              </span>
              
              <h2 className="text-4xl md:text-5xl font-black text-[#3E2723] leading-[0.95] tracking-tighter mb-8">
                {promotion.title}
              </h2>
              
              <p className="text-stone-500 font-medium text-lg leading-relaxed mb-10">
                {promotion.description}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <a
                  href={promotion.ctaLink || '/peanutecommerce/products'}
                  className="group relative inline-flex items-center gap-3 bg-[#3E2723] text-white font-black py-5 px-10 rounded-2xl transition-all duration-300 hover:bg-[#F3A852] hover:text-[#3E2723]"
                >
                  <span className="uppercase tracking-widest text-xs">{promotion.ctaText}</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Ending In</span>
                   <span className="text-[#F3A852] font-black">24 : 59 : 01</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Subtle Floating Nut Decor (Optional - can use a local SVG) */}
      <div className="absolute -bottom-10 right-10 w-40 h-40 bg-[#F3A852]/10 rounded-full blur-3xl" />
    </section>
  );
}