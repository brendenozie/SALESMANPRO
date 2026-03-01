'use client';

import React from 'react';
import { motion } from 'framer-motion';
// Using Hero Icons as requested
import { 
  TicketIcon, 
  ArrowRightIcon, 
  CursorArrowRaysIcon,
  SparklesIcon 
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#F472B6'; 
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  const promo = promotions?.[1] || {
    title: 'Sweet Weekend Surprises',
    description: 'Wrap your little ones in love with our organic cotton essentials. This weekend only, enjoy a special treat on us with every bundle purchase.',
    bannerUrl: 'https://images.unsplash.com/photo-1522771917743-28b90c0db61b',
    ctaText: 'Claim My Offer',
    ctaLink: '#',
  };

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Decorative Organic Shapes */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#FAF9F6] to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="relative rounded-[4rem] overflow-hidden bg-slate-50 border border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.06)]">
          
          {/* Animated Background Gradients */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[100px]"
            style={{ backgroundColor: primary }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            
            {/* --- Left: Image Block with Floating Elements --- */}
            <div className="relative h-[400px] lg:h-[600px] order-2 lg:order-1">
              <div className="absolute inset-0 p-8 md:p-12">
                <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl">
                  <img
                    src={promo.bannerUrl || 'https://images.unsplash.com/photo-1522771917743-28b90c0db61b'}
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Glass Overlay on Image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                </div>
              </div>

              {/* Floating "Limited" Tag */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-16 right-4 md:right-0 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl z-20 flex items-center gap-3 border border-white"
              >
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${primary}20` }}>
                  <TicketIcon className="w-6 h-6" style={{ color: primary }} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Offer Ends In</p>
                  <p className="font-bold text-slate-800">48 Hours</p>
                </div>
              </motion.div>
            </div>

            {/* --- Right: Text Block --- */}
            <div className="p-10 md:p-20 order-1 lg:order-2 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Weekend Special</span>
                </div>

                <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1]">
                  {promo.title}
                </h2>

                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  {promo.description}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                  <motion.a
                    href={promo.ctaLink || '#'}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto text-center px-10 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl flex items-center justify-center gap-3 group"
                  >
                    {promo.ctaText}
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </motion.a>

                  <div className="flex items-center gap-2 text-slate-400">
                    <CursorArrowRaysIcon className="w-5 h-5" />
                    <span className="text-sm font-bold">Limited supply</span>
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