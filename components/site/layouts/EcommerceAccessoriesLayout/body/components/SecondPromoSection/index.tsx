'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  FireIcon,
  ShieldCheckIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function AutomotiveFeaturePromo({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#EF4444'; // Racing Red default

  const promo = promotions?.[1] || {
    title: 'Peak Performance Tuning',
    description: 'Unlock maximum horsepower and reliability with our premium aftermarket selection. Engineered for the streets, track-tested for durability, and built to push redline limits.',
    ctaText: 'Upgrade Ride',
    ctaLink: '#',
    bannerUrl: 'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?q=80&w=2000&auto=format&fit=crop', // Automotive engine/parts fallback
  };

  return (
    <section className="relative py-32 overflow-hidden bg-white dark:bg-[#09090b]">
      
      {/* Asphalt / Track Backdrop Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle, #808080 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      
      {/* Dynamic Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] rounded-full blur-[200px] opacity-[0.05] dark:opacity-[0.1] pointer-events-none" 
           style={{ backgroundColor: primaryColor }} />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative z-10">
        <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-zinc-200 dark:border-zinc-800/50">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[700px]">
            
            {/* --- Left: Automotive Visuals --- */}
            <div className="relative order-2 lg:order-1 overflow-hidden group">
              {/* Angled Racing Overlay */}
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-transparent to-white dark:to-zinc-950 w-full" />
              
              <motion.img
                initial={{ scale: 1.1, filter: 'contrast(120%) saturate(80%)' }}
                whileInView={{ scale: 1, filter: 'contrast(100%) saturate(100%)' }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                src={promo.bannerUrl}
                alt={promo.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
              />

              {/* Engine Diagnostics Display Badge */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute bottom-12 left-6 md:left-12 z-20"
              >
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-2xl flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping opacity-40 rounded-full" style={{ backgroundColor: primaryColor }} />
                    <div className="relative p-3 rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                      <Cog8ToothIcon className="w-8 h-8 animate-[spin_4s_linear_infinite]" style={{ color: primaryColor }} />
                    </div>
                  </div>
                  <div className="text-zinc-900 dark:text-white pr-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-1">Diagnostics</p>
                    <p className="font-black text-xl uppercase italic tracking-tighter">Optimized</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* --- Right: Performance Specs & Copy --- */}
            <div className="relative p-10 md:p-20 flex flex-col justify-center order-1 lg:order-2 bg-zinc-50 dark:bg-zinc-900/20 z-20">
              
              {/* Decorative Redline Bar */}
              <div className="absolute top-0 right-0 w-32 h-1.5" style={{ backgroundColor: primaryColor }} />

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl space-y-10"
              >
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 shadow-inner">
                    <FireIcon className="w-4 h-4 animate-pulse" style={{ color: primaryColor }} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Garage Highlight</span>
                  </div>
                  
                  <h2 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter uppercase italic drop-shadow-sm">
                    {promo.title}
                  </h2>
                </div>

                <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed border-l-4 pl-6" style={{ borderColor: primaryColor }}>
                  {promo.description}
                </p>

                <div className="flex flex-col xl:flex-row items-start xl:items-center gap-8 pt-6">
                  
                  <motion.a
                    href={promo.ctaLink || '/automotiveecommerce/products'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative w-full sm:w-auto px-12 py-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-lg uppercase italic tracking-widest flex items-center justify-center gap-4 overflow-hidden rounded-lg shadow-xl"
                  >
                    {/* Hover Racing Stripe */}
                    <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" style={{ backgroundColor: primaryColor }} />
                    
                    <span className="relative z-10 group-hover:text-white transition-colors">{promo.ctaText}</span>
                    <ArrowRightIcon className="relative z-10 w-5 h-5 group-hover:translate-x-2 group-hover:text-white transition-all duration-300" />
                  </motion.a>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
                      <ShieldCheckIcon className="w-6 h-6" style={{ color: primaryColor }} />
                      <span className="text-[11px] font-black uppercase tracking-widest">OEM Certified Parts</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-3 py-1.5 rounded-md w-max">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Limited Stock: 3 Kits Left</span>
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