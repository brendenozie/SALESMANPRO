'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRightIcon, GiftIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import Image from 'next/image';
import Link from 'next/link';

const customLoader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function PromoSection({ promotions }: { promotions: IPromotion[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#70D6FF';

  if (!promotions || promotions.length === 0) return null;

  // --- SINGLE PROMO: THE "NURSERY CLOUD" BANNER ---
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-24 bg-white dark:bg-zinc-950 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative rounded-[5rem] bg-[#FDFCFB] dark:bg-zinc-900 p-10 md:p-24 overflow-hidden flex flex-col lg:flex-row items-center gap-16 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
          >
            {/* Background Texture & Glow */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: primary }} />
            
            <div className="relative z-10 flex-1 space-y-8 text-center lg:text-left">
              <motion.div 
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700"
              >
                <GiftIcon className="w-5 h-5" style={{ color: primary }} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Limited Treasures</span>
              </motion.div>

              <h2 className="text-5xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter">
                {promo.title}
              </h2>

              <p className="text-xl text-zinc-500 dark:text-zinc-400 max-w-xl font-medium leading-relaxed">
                {promo.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
                <Link href={promo.ctaLink || '#'}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-4 py-6 px-12 rounded-[2.5rem] text-white font-black shadow-2xl transition-all"
                    style={{ backgroundColor: primary, boxShadow: `0 25px 50px -12px ${primary}66` }}
                  >
                    <span className="uppercase tracking-widest text-xs">{promo.ctaText || 'Claim Offer'}</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </div>

            <div className="flex-1 relative w-full aspect-[4/3] lg:aspect-auto lg:h-[600px] group">
              {/* Artistic offset frame */}
              <div className="absolute inset-0 border-2 border-zinc-100 dark:border-zinc-800 rounded-[4rem] translate-x-6 translate-y-6 -z-10 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />
              <img
                src={promo.bannerUrl || ''}
                alt={promo.title}
                className="w-full h-full object-cover rounded-[4rem] shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // --- MULTI PROMO: THE "ATELIER" BENTO GRID ---
  const displayed = promotions.slice(0, 3);
  return (
    <section className="py-24 bg-white dark:bg-zinc-950">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {displayed.map((item, index) => {
            const isLarge = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className={`relative overflow-hidden rounded-[4rem] group shadow-xl hover:shadow-3xl transition-all duration-700
                  ${isLarge ? 'lg:col-span-8 h-[600px] lg:h-[750px]' : 'lg:col-span-4 h-[600px] lg:h-[750px]'}`}
              >
                <img
                  src={item.bannerUrl || ''}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Floating Content Box */}
                <div className="absolute inset-x-8 bottom-8 md:inset-x-12 md:bottom-12 p-10 md:p-14 bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-[3.5rem] border border-white/20 shadow-2xl flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-white/70">Collection Spotlight</span>
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-6 leading-none tracking-tighter">
                    {item.title}
                  </h3>
                  
                  <p className="text-white/70 text-lg mb-8 line-clamp-2 font-medium max-w-md">
                    {item.description}
                  </p>
                  
                  <Link
                    href={item.ctaLink || '#'}
                    className="inline-flex items-center gap-4 group/btn w-fit"
                  >
                    <div className="px-8 py-4 rounded-2xl bg-white text-zinc-900 font-black text-xs uppercase tracking-widest group-hover/btn:bg-zinc-900 group-hover/btn:text-white transition-colors">
                        {item.ctaText || 'Discover'}
                    </div>
                    <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover/btn:translate-x-2"
                        style={{ backgroundColor: secondary }}
                    >
                        <ArrowRightIcon className="w-6 h-6 text-white" />
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}