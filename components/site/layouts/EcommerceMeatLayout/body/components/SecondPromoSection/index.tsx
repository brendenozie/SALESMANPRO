'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, SparklesIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();

  // Targeting the second promotion (index 1) with fallbacks for the Butchery aesthetic
  const promotion = promotions?.[1] || {
    title: 'Custom Whole Carcass Cuts',
    description:
      'The ultimate value for families and events. Save up to 25% when you order bulk quarters or halves. Expertly butchered, vacuum sealed, and labeled to your exact specs.',
    bannerUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e',
    ctaText: 'View Bulk Pricing',
    ctaLink: '#',
  };

  if (!promotions || (promotions.length < 2 && !promotion)) return null;

  return (
    <section className="relative py-32 bg-white dark:bg-[#050505] overflow-hidden">
      {/* Editorial Background Accent */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-stone-50 dark:bg-stone-900/20 pointer-events-none hidden lg:block" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* --- Content Block: High Typography Impact --- */}
          <motion.div 
            className="lg:col-span-6 text-left"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-red-600/5 dark:bg-red-500/10 text-red-600 dark:text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-red-100 dark:border-red-900/30">
              <SparklesIcon className="w-4 h-4" />
              Premium Service
            </div>
            
            <h2 className="text-5xl md:text-8xl font-black text-stone-950 dark:text-white leading-[0.85] tracking-tighter mb-8">
              {promotion.title.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="italic font-serif font-light text-red-600 dark:text-red-500 block mt-2">
                {promotion.title.split(' ').slice(-1)}
              </span>
            </h2>

            <p className="text-xl text-stone-500 dark:text-stone-400 mb-12 max-w-lg leading-relaxed font-medium">
              {promotion.description}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <motion.a
                  href={promotion.ctaLink || '/meatecommerce/products'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-4 bg-stone-950 dark:bg-white text-white dark:text-black px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all group"
                >
                  {promotion.ctaText || 'Get Started'}
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </motion.a>

                <div className="flex items-center gap-3 py-2">
                    <CheckBadgeIcon className="w-6 h-6 text-stone-300 dark:text-stone-700" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                        Certified Grade-A <br /> Selection
                    </span>
                </div>
            </div>
          </motion.div>

          {/* --- Image Block: Framed "Masterpiece" Style --- */}
          <motion.div 
            className="lg:col-span-6 relative"
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "backOut" }}
          >
            <div className="relative aspect-[4/5] w-full rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[1px] border-stone-200 dark:border-stone-800 p-4 bg-white dark:bg-stone-900">
              <div className="relative h-full w-full rounded-[3rem] overflow-hidden">
                <Image
                    src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1551028150-64b9f398f678'}
                    alt={promotion.title}
                    fill
                    className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000 hover:scale-110"
                    loader={({ src }) => src} 
                />
              </div>
              
              {/* Floating Data Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white dark:bg-stone-900 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-stone-100 dark:border-stone-800"
              >
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                        %
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-stone-400 leading-none mb-1">Weekly Stock</p>
                        <p className="text-lg font-bold text-stone-900 dark:text-white uppercase tracking-tighter leading-tight">Last Call Today</p>
                    </div>
                </div>
              </motion.div>
            </div>

            {/* Background Texture Element */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] -z-10" />
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Branding Line */}
      <div className="absolute bottom-12 left-6 flex items-center gap-4 opacity-10 dark:opacity-20 pointer-events-none">
          <span className="text-8xl font-black text-stone-900 dark:text-white tracking-tighter">PRIME</span>
          <div className="h-px w-32 bg-stone-900 dark:bg-white" />
      </div>
    </section>
  );
}