'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TicketIcon, 
  ArrowRightIcon, 
  CpuChipIcon,
  SparklesIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function HardwareFeaturePromo({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#F59E0B'; // Safety Amber
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3B82F6'; // Tech Blue

  const promo = promotions?.[1] || {
    title: 'Precision Site Systems',
    description: 'Deploy industrial-grade performance across your entire workspace. Our reinforced power systems are engineered for zero-downtime operations in high-load environments.',
    ctaText: 'Secure Inventory',
    ctaLink: '#',
    bannerUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc',
  };

  return (
    <section className="relative py-32 overflow-hidden bg-white dark:bg-[#050505]">
      {/* Structural Backdrop Grid */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative">
        <div className="relative border-4 border-zinc-900 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[40px_40px_0px_0px_rgba(0,0,0,0.05)] dark:shadow-[40px_40px_0px_0px_rgba(255,255,255,0.02)]">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch min-h-[750px]">
            
            {/* --- Left: Industrial Visuals --- */}
            <div className="relative order-2 lg:order-1 overflow-hidden group border-r-0 lg:border-r-4 border-zinc-900 dark:border-zinc-800">
              <motion.img
                initial={{ scale: 1.2, filter: 'grayscale(100%)' }}
                whileInView={{ scale: 1, filter: 'grayscale(0%)' }}
                transition={{ duration: 1.2 }}
                src={promo.bannerUrl}
                alt={promo.title}
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
              />

              {/* Status Display Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="absolute bottom-12 left-12 z-20"
              >
                <div className="bg-zinc-900 dark:bg-zinc-100 p-8 shadow-2xl flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping opacity-30" style={{ backgroundColor: primary }} />
                    <div className="relative p-4 bg-zinc-800 dark:bg-zinc-200">
                      <CpuChipIcon className="w-8 h-8" style={{ color: primary }} />
                    </div>
                  </div>
                  <div className="text-white dark:text-zinc-900">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">System Status</p>
                    <p className="font-black text-2xl uppercase italic tracking-tighter">Operational</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* --- Right: Technical Specs & Copy --- */}
            <div className="p-12 md:p-24 flex flex-col justify-center order-1 lg:order-2 bg-zinc-50 dark:bg-zinc-900/30">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl space-y-12"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-1 bg-amber-500 text-zinc-900">
                    <SparklesIcon className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Technical Bulletin</span>
                  </div>
                  <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter uppercase italic">
                    {promo.title}
                  </h2>
                </div>

                <p className="text-xl text-zinc-600 dark:text-zinc-400 font-bold leading-relaxed border-l-8 border-zinc-200 dark:border-zinc-800 pl-8">
                  {promo.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-10 pt-6">
                  <motion.a
                    href={promo.ctaLink || '/hardwareecommerce/products'}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-16 py-8 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-xl uppercase italic tracking-widest flex items-center justify-center gap-6 shadow-[15px_15px_0px_0px_rgba(245,158,11,0.5)]"
                  >
                    <span>{promo.ctaText}</span>
                    <ArrowRightIcon className="w-6 h-6" />
                  </motion.a>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-zinc-900 dark:text-white">
                      <ShieldCheckIcon className="w-5 h-5 text-amber-500" />
                      <span className="text-[11px] font-black uppercase tracking-widest">ISO 9001 Compliant</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Low Stock Alert: 14 Units</span>
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