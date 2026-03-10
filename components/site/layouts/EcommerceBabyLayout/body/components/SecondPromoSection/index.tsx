'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TicketIcon, 
  ArrowRightIcon, 
  CursorArrowRaysIcon,
  SparklesIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#FF8FA3';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#70D6FF';

  const promo = promotions?.[1] || {
    title: 'Sweet Weekend Surprises',
    description: 'Wrap your little ones in love with our organic cotton essentials. This weekend only, enjoy a special treat on us with every bundle purchase.',
    bannerUrl: 'https://images.unsplash.com/photo-1522771917743-28b90c0db61b',
    ctaText: 'Claim My Offer',
    ctaLink: '#',
  };

  return (
    <section className="relative py-32 overflow-hidden bg-white dark:bg-zinc-950">
      {/* Background Decorative Blob */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[160px] opacity-10 rounded-full pointer-events-none"
        style={{ backgroundColor: secondary }}
      />
      
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative">
        <div className="relative rounded-[5rem] overflow-hidden bg-[#FAFAFA] dark:bg-zinc-900 border border-white dark:border-zinc-800 shadow-3xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[700px]">
            
            {/* --- Left: The Visual Portal --- */}
            <div className="relative order-2 lg:order-1 overflow-hidden group">
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#FAFAFA] dark:from-zinc-900 via-transparent to-transparent hidden lg:block w-32" />
              
              <motion.img
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                src={promo.bannerUrl || 'https://images.unsplash.com/photo-1522771917743-28b90c0db61b'}
                alt={promo.title}
                className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
              />

              {/* Urgency Badge */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="absolute top-12 left-12 z-20"
              >
                <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-zinc-700/50 flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: primary }} />
                    <div className="relative p-3 rounded-full" style={{ backgroundColor: `${primary}20` }}>
                      <TicketIcon className="w-6 h-6" style={{ color: primary }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Valid Until</p>
                    <p className="font-black text-zinc-900 dark:text-white text-lg">Sunday Midnight</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* --- Right: The Editorial Content --- */}
            <div className="p-12 md:p-24 flex flex-col justify-center order-1 lg:order-2 relative bg-white dark:bg-zinc-900">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl space-y-10"
              >
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                  <SparklesIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-400">Exclusive Collection</span>
                </div>

                <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter">
                  {promo.title}
                </h2>

                <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {promo.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
                  <motion.a
                    href={promo.ctaLink || '#'}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-12 py-6 text-white rounded-[2.5rem] font-black text-lg shadow-2xl flex items-center justify-center gap-4 group relative overflow-hidden"
                    style={{ backgroundColor: primary, boxShadow: `0 20px 40px ${primary}44` }}
                  >
                    <span className="relative z-10">{promo.ctaText}</span>
                    <ArrowRightIcon className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                  </motion.a>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                      <ShieldCheckIcon className="w-5 h-5" style={{ color: secondary }} />
                      <span className="text-sm font-black uppercase tracking-widest">Certified Organic</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <CursorArrowRaysIcon className="w-4 h-4" />
                      <span className="text-xs font-bold tracking-tight">Only 14 bundles remaining</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}