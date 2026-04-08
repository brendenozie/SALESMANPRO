'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, WrenchIcon, BoltIcon, Square3Stack3DIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import Link from 'next/link';

export default function HardwarePromoSection({ promotions }: { promotions: IPromotion[] }) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber

  if (!promotions || promotions.length === 0) return null;

  // --- SINGLE PROMO: THE "INDUSTRIAL POWER" BANNER ---
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-20 bg-white dark:bg-[#080808] overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[600px] border border-zinc-200 dark:border-zinc-800"
          >
            {/* Structural Accent Lines */}
            <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: primary }} />
            
            <div className="relative z-10 flex-1 p-12 md:p-24 flex flex-col justify-center space-y-8">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                className="inline-flex items-center gap-3"
              >
                <BoltIcon className="w-6 h-6 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Project Ready Solution</span>
              </motion.div>

              <h2 className="text-6xl md:text-9xl font-black text-zinc-900 dark:text-white leading-[0.8] tracking-tighter uppercase">
                {promo.title}
              </h2>

              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl font-bold uppercase tracking-tight leading-snug">
                {promo.description}
              </p>

              <Link href={promo.ctaLink || '/hardware/products'}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center gap-6 py-6 px-12 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-900 font-black transition-all"
                >
                  <span className="uppercase tracking-[0.2em] text-xs">{promo.ctaText || 'Get Quote'}</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-3 transition-transform" />
                </motion.button>
              </Link>
            </div>

            <div className="flex-1 relative min-h-[400px] lg:min-h-auto overflow-hidden">
              <img
                src={promo.bannerUrl || 'https://images.unsplash.com/photo-1581244276891-6bc618f3a697'}
                alt={promo.title}
                className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-1000"
              />
              {/* Industrial Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-100 dark:from-zinc-900 via-transparent to-transparent lg:block hidden" />
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // --- MULTI PROMO: THE "HEAVY-DUTY" BENTO GRID ---
  const displayed = promotions.slice(0, 3);
  return (
    <section className="py-20 bg-white dark:bg-[#080808]">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {displayed.map((item, index) => {
            const isLarge = index === 0;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden group border border-zinc-200 dark:border-zinc-800
                  ${isLarge ? 'lg:col-span-7 h-[700px]' : 'lg:col-span-5 h-[700px]'}`}
              >
                <img
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1530124566582-a618bc2615ad'}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                />
                
                {/* Heavy Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-70" />
                
                {/* Content - Bottom Docked */}
                <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-1 border border-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">Department Spotlight</span>
                  </div>
                  
                  <h3 className="text-5xl md:text-6xl font-black text-white mb-6 leading-[0.85] tracking-tighter uppercase">
                    {item.title}
                  </h3>
                  
                  <p className="text-zinc-300 text-sm mb-10 line-clamp-2 font-bold uppercase tracking-tight max-w-sm">
                    {item.description}
                  </p>
                  
                  <Link
                    href={item.ctaLink || '/hardwareecommerce/products'}
                    className="inline-flex items-center gap-0 group/btn"
                  >
                    <div className="px-10 py-5 bg-white text-zinc-900 font-black text-[10px] uppercase tracking-widest group-hover/btn:bg-amber-500 transition-colors">
                        {item.ctaText || 'View Series'}
                    </div>
                    <div className="w-14 h-14 bg-zinc-900 flex items-center justify-center transition-all group-hover/btn:translate-x-1">
                        <ArrowRightIcon className="w-5 h-5 text-white" />
                    </div>
                  </Link>
                </div>

                {/* Corner Industrial Accent */}
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Square3Stack3DIcon className="w-8 h-8 text-white" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}