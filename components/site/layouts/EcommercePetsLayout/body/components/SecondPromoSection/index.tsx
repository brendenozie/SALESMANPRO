'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { 
  TicketIcon, 
  CursorArrowRaysIcon, 
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#f97316';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3b82f6';

  // Targeting the second promotion with enhanced fallbacks
  const promo = promotions?.[1] || {
    title: 'Weekend Paw-ty Special',
    description: 'Enjoy exclusive discounts on our top-rated kibble and toys this weekend only. Grab your furry friend\'s favorites before they\'re gone!',
    bannerUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=1000',
    ctaText: 'Claim Discount',
    ctaLink: '/petsecommerce/products?companyId=default&flag=weekend-pawty' // Fallback link,
  };

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Dynamic Background "Blob" */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[110%] opacity-5 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle, ${primary} 0%, transparent 70%)`,
        }}
      />

      <div className="container mx-auto px-6">
        <div 
          className="relative rounded-[4rem] overflow-hidden p-8 md:p-16 lg:p-20 shadow-2xl"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
        >
          {/* Animated Decorative Icons */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-10 right-10 text-white/20 hidden lg:block"
          >
            <BoltIcon className="w-32 h-32" />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* --- Content Column --- */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white"
              >
                <SparklesIcon className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Flash Deal</span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter"
              >
                {promo.title}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-white/90 max-w-xl font-medium leading-relaxed"
              >
                {promo.description}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-4"
              >
                <a
                  href={promo.ctaLink || '/petsecommerce/products'}
                  className="group relative flex items-center gap-3 bg-white px-10 py-5 rounded-2xl text-slate-900 font-black transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                >
                  <TicketIcon className="w-6 h-6 text-slate-900 group-hover:rotate-12 transition-transform" />
                  {promo.ctaText}
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-[10px] text-white font-bold">!</span>
                  </div>
                </a>
                
                <div className="flex items-center gap-3 text-white/80 font-bold px-6">
                  <CursorArrowRaysIcon className="w-5 h-5 animate-bounce" />
                  <span className="text-sm">Limited Slots Left</span>
                </div>
              </motion.div>
            </div>

            {/* --- Image/Visual Column --- */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="relative z-10"
              >
                <div className="relative aspect-square md:aspect-[4/5] rounded-[3rem] overflow-hidden border-8 border-white/20 shadow-2xl">
                  <Image
                    src={promo.bannerUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1000'}
                    alt={promo.title}
                    loader={({ src }) => src} 
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Floating "Badge" Decoration */}
                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-6 -right-6 md:-right-12 bg-white p-6 rounded-[2rem] shadow-2xl flex flex-col items-center"
                >
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Ends In</span>
                  <span className="text-2xl font-black text-slate-900" style={{ color: primary }}>23:59:59</span>
                </motion.div>
              </motion.div>

              {/* Backglow decoration */}
              <div 
                className="absolute inset-0 blur-3xl opacity-40 scale-110"
                style={{ background: `radial-gradient(circle, white 0%, transparent 70%)` }}
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}