'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const loader = ({ src }: { src: string }) => src;

export default function SecondPromoSection({ promotions }: { promotions: IPromotion[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#3E2723';

  // Extract the second promotion or use our themed fallback
  const promotion = promotions?.[1] || {
    title: 'The Weekend Reserve',
    description: 'Our rarest wildflower harvest is back for a limited time. Experience the deep, amber notes of the late summer bloom before the season ends.',
    bannerUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=1000',
    ctaText: 'Access the Reserve',
    ctaLink: '#',
  };

  return (
    <section className="relative py-24 bg-[#1A1612] overflow-hidden">
      {/* Texture & Ambient Light */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F3A852] opacity-10 blur-[150px] rounded-full" />

      <div className="container mx-auto px-6 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Visual Side: The "Apothecary" Presentation */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-square max-w-[500px] mx-auto">
              {/* Decorative Frame */}
              <div className="absolute inset-4 border border-[#F3A852]/30 rounded-[3rem] -rotate-3 group-hover:rotate-0 transition-transform duration-700" />
              
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src={promotion.bannerUrl || "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=1000"}
                  alt={promotion.title}
                  fill
                  loader={loader}
                  className="object-cover scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#1A1612]/60 to-transparent" />
              </div>

              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -right-8 w-32 h-32 bg-[#F3A852] rounded-full flex flex-col items-center justify-center text-center p-4 shadow-xl border-4 border-[#1A1612]"
              >
                <span className="text-[10px] font-black uppercase tracking-tighter text-[#3E2723] leading-none">Limited</span>
                <span className="text-2xl font-serif italic text-[#3E2723]">Batch</span>
                <span className="text-[9px] font-bold text-[#3E2723]/60 uppercase">No. 08</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Text Side: The "Story" Presentation */}
          <div className="text-left order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[1px] w-12 bg-[#F3A852]" />
                <span className="text-[#F3A852] text-[10px] font-black uppercase tracking-[0.4em]">
                  Limited Weekend Release
                </span>
              </div>

              <h2 className="text-4xl md:text-6xl font-serif italic text-white leading-tight mb-8">
                {promotion.title}
              </h2>

              <p className="text-stone-400 text-lg mb-12 max-w-lg leading-relaxed font-medium">
                {promotion.description}
              </p>

              <div className="flex flex-wrap items-center gap-8">
                <a
                  href={promotion.ctaLink || '/honeyecommerce/products'}
                  className="group relative px-10 py-5 bg-[#F3A852] text-[#3E2723] rounded-full font-black uppercase tracking-widest text-[11px] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#F3A852]/10"
                >
                  <span className="relative z-10">{promotion.ctaText}</span>
                  <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </a>

                <div className="flex flex-col">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">Ending In:</span>
                  <span className="text-[#F3A852] font-mono text-xl font-black">22 : 14 : 05</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Subtle Bottom Border Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-stone-800 to-transparent" />
    </section>
  );
}