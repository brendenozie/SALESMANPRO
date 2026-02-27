'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#f97316';

  // Grab the second promotion (index 1) with high-quality fallbacks
  const promotion = promotions?.[1] || {
    title: 'Weekend Special',
    subtitle: 'Hyper-Limited Collection',
    description: 'Elevate your rotation with exclusive drops. Available until the clock hits zero.',
    bannerUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2000',
    ctaText: 'Access Drop',
    ctaLink: '#',
  };

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden border-y border-white/5">
      {/* Background Graphic: Giant Outline Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="text-[25vw] font-black text-white/[0.02] uppercase italic leading-none whitespace-nowrap">
          {promotion.title.split(' ')[0]}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* --- Image Block (Layered & Floating) --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-[3rem] border border-white/10 group">
              <img
                src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2000'}
                alt={promotion.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-2"
              />
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 opacity-60" />
            </div>

            {/* Floating "Badge" UI */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -right-8 md:-right-12 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(255,255,255,0.1)] hidden sm:block"
            >
              <p className="text-black font-black text-3xl italic uppercase leading-none">50%</p>
              <p className="text-black/40 text-[10px] font-bold uppercase tracking-widest mt-1">Reduction</p>
            </motion.div>
          </motion.div>

          {/* --- Text Block (Brutalist Typography) --- */}
          <div className="lg:col-span-6 order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="h-[2px] w-12 bg-primary-color" style={{ backgroundColor: primary }} />
                <span className="text-xs font-black uppercase tracking-[0.4em] text-primary-color" style={{ color: primary }}>
                  Featured Offer
                </span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.85]"
              >
                {promotion.title}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/50 text-lg md:text-xl font-medium max-w-md leading-relaxed"
              >
                {promotion.description}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <a
                href={promotion.ctaLink || '#'}
                className="group relative inline-flex items-center gap-4 bg-white px-10 py-5 rounded-2xl overflow-hidden transition-all hover:pr-14"
              >
                <span className="relative z-10 text-black font-black uppercase tracking-widest text-sm">
                  {promotion.ctaText}
                </span>
                <ArrowUpRightIcon className="w-5 h-5 text-black relative z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                
                {/* Button Hover Glow */}
                <div className="absolute inset-0 bg-primary-color opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: primary }} />
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}