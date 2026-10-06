'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
// Using Hero Icons as per saved preference
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  TagIcon,
  CakeIcon
} from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#D97706';

  if (!promotions || promotions.length === 0) return null;

  // Render a Full-Width Cinematic Feature if only 1 promo exists
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative group h-[600px] rounded-[3rem] overflow-hidden shadow-2xl border border-white"
          >
            <Image decoding="async"
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a'}
              alt={promo.title} // Use the original URL without optimization
              fill
              className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-24 max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <SparklesIcon className="w-6 h-6 text-amber-400" />
                <span className="text-white/80 font-black uppercase tracking-[0.5em] text-[10px]">Exclusive Masterpiece</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                {promo.title}
              </h2>
              <p className="text-xl md:text-2xl text-white/70 mb-12 font-light italic max-w-xl">
                {promo.description}
              </p>
              <Link href={promo.ctaLink || '#'}>
                <motion.button 
                  whileHover={{ x: 10 }}
                  className="flex items-center gap-4 bg-white px-10 py-5 rounded-full text-black font-black uppercase tracking-widest text-xs shadow-xl hover:bg-amber-500 hover:text-white transition-all"
                >
                  {promo.ctaText || 'Claim Yours'}
                  <ArrowRightIcon className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Render the "Artisan Grid" for multiple promos
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[300px] md:auto-rows-[450px]">
          {promotions.slice(0, 3).map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              viewport={{ once: true }}
              className={`relative group rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 ${
                idx === 0 ? 'md:col-span-7' : idx === 1 ? 'md:col-span-5' : 'md:col-span-12'
              }`}
            >
              {/* Background Layer */}
              <Image decoding="async"
                src={item.bannerUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'}
                alt={item.title} // Use the original URL without optimization
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Modern Frosted Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              
              {/* Content Layer */}
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-4">
                  {idx === 0 ? <CakeIcon className="w-5 h-5 text-amber-400" /> : <TagIcon className="w-5 h-5 text-amber-400" />}
                  <span className="text-amber-500 font-black text-[10px] tracking-[0.4em] uppercase">
                    {idx === 0 ? 'Chef Selection' : 'Special Offer'}
                  </span>
                </div>

                <h3 className={`text-white font-black tracking-tighter transition-all group-hover:translate-x-2 duration-500 ${
                  idx === 2 ? 'text-4xl md:text-6xl' : 'text-3xl md:text-4xl'
                }`}>
                  {item.title}
                </h3>
                
                <p className="text-slate-300 text-sm md:text-base mt-4 mb-8 max-w-lg line-clamp-2 font-medium italic opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {item.description}
                </p>

                <Link href={item.ctaLink || '/cakeecommerce/products'} className="block">
                  <motion.button 
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
                  >
                    {item.ctaText || 'Discover'}
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>

              {/* Decorative Corner Glow */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}