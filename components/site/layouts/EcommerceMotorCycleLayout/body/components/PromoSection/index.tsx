'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, BoltIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#E63946'; // Moto Duka Red

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: The "Power Feature"
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="relative py-24 bg-[#fafafa] dark:bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 space-y-8 z-10"
            >
              <div className="flex items-center gap-3 text-[#E63946]">
                <BoltIcon className="w-6 h-6 stroke-[2.5]" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase">Limited Release</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-black leading-[0.85] text-zinc-900 dark:text-white uppercase tracking-tighter">
                {promo.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 !== 0 ? "text-zinc-300 dark:text-zinc-800 italic" : ""}>
                    {word}{' '}
                  </span>
                ))}
              </h2>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-lg">
                {promo.description}
              </p>
              <a
                href={promo.ctaLink || '/motorcycleecommerce/products'}
                className="group inline-flex items-center gap-6 pt-6"
              >
                <div className="relative">
                  <span className="text-xs font-black uppercase tracking-[0.2em] dark:text-white">
                    {promo.ctaText || 'Inspect the Fleet'}
                  </span>
                  <span className="absolute -bottom-3 left-0 w-full h-1 bg-[#E63946] transform scale-x-100 group-hover:scale-x-110 transition-transform origin-left" />
                </div>
                <div className="p-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl group-hover:bg-[#E63946] group-hover:text-white transition-all duration-300 -rotate-12 group-hover:rotate-0">
                  <ArrowUpRightIcon className="w-5 h-5 stroke-[3]" />
                </div>
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1 }}
              className="flex-1 relative w-full aspect-square lg:h-[700px]"
            >
              {/* Industrial "Shadow" Box */}
              <div className="absolute inset-0 border-[1px] border-zinc-200 dark:border-zinc-800 rounded-[3rem] translate-x-8 translate-y-8" />
              <img
                src={promo.bannerUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39'}
                alt={promo.title}
                className="relative w-full h-full object-cover rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]"
              />
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: "The Paddock" Mosaic Grid
  const items = promotions.slice(0, 3);
  return (
    <section className="py-24 bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[750px]">
          {/* Hero Promo: Large Left Panel */}
          <motion.div 
            whileHover={{ scale: 0.99 }}
            className="md:col-span-7 relative group overflow-hidden rounded-[2rem] bg-zinc-900"
          >
            <img 
              src={items[0].bannerUrl || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527'} 
              className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
              alt={items[0].title} 
            />
            <div className="absolute inset-0 p-12 flex flex-col justify-end bg-gradient-to-t from-black via-black/20 to-transparent">
              <span className="text-[#E63946] text-[10px] font-black tracking-[0.4em] mb-4 uppercase">Track Edition</span>
              <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6">{items[0].title}</h3>
              <a href={items[0].ctaLink || '/motorcycleecommerce/products'} className="group flex items-center gap-4 text-xs font-black tracking-widest uppercase bg-white text-black w-fit px-8 py-4 rounded-full hover:bg-[#E63946] hover:text-white transition-colors">
                Configure
                <ArrowUpRightIcon className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Side Stack: Two Smaller Promos */}
          <div className="md:col-span-5 grid grid-rows-2 gap-6">
            {items.slice(1).map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 0.98 }}
                className="relative group overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/5"
              >
                <img 
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1440115637344-847ec389134a'} 
                  className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-all duration-1000" 
                  alt="" 
                />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-500 font-medium line-clamp-1 mb-6">
                    {item.description}
                  </p>
                  <a href={item.ctaLink || '/motorcycleecommerce/products'} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E63946] hover:text-white transition-colors">
                    View Specs <ArrowUpRightIcon className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}