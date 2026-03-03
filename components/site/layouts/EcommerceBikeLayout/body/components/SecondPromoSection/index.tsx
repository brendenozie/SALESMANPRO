'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  
  // Luxury Watch Palette: Deep Navy, Gold, and Off-White
  const primary = storeFormData?.themeSettings?.primaryColor || '#0f172a'; 
  const accent = "#c5a059"; // Champagne Gold

  const promotion = promotions?.[1] || {
    title: 'Precision in Every Second',
    subtitle: 'THE WEEKEND COLLECTOR\'S EVENT',
    description:
      'Elevate your collection with exclusive weekend pricing on our mechanical movements and chronographs. Heritage craftsmanship meets modern precision.',
    bannerUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49',
    ctaText: 'View Event',
    ctaLink: '#',
  };

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden bg-[#050505]">
      {/* Background Decorative Element: Large faded watch dial outline or Roman Numerals */}
      <div className="absolute right-[-10%] top-[-10%] opacity-5 pointer-events-none">
         <ClockIcon className="w-[800px] h-[800px] text-white" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* --- Image Block with "Lifting" Effect --- */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative group">
              {/* Frame Decoration */}
              <div className="absolute -inset-4 border border-white/10 rounded-sm" />
              
              <div className="relative overflow-hidden aspect-[4/5] rounded-sm shadow-2xl">
                <img
                  src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49'}
                  alt={promotion.title}
                  className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Float-over Detail Card */}
              <div className="absolute -bottom-10 -right-6 md:right-10 bg-white p-6 shadow-2xl rounded-sm hidden sm:block">
                <div className="flex items-center gap-3 mb-2">
                   <ClockIcon className="w-5 h-5 text-amber-600" />
                   <span className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">Ending Soon</span>
                </div>
                <p className="text-gray-900 font-serif italic">The Obsidian Series</p>
              </div>
            </div>
          </motion.div>

          {/* --- Content Block --- */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-left order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-amber-600/30 bg-amber-600/5 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-amber-500 uppercase">
                {promotion.badgeText || 'Exclusive Offer'}
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-[1.1] mb-8">
              {promotion.title}
            </h2>

            <p className="text-lg text-gray-400 font-light leading-relaxed max-w-lg mb-10">
              {promotion.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <a
                href={promotion.ctaLink || '#'}
                className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-5 font-bold uppercase tracking-widest text-xs transition-all hover:bg-amber-600 hover:text-white"
              >
                {promotion.ctaText}
                <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <button className="text-white/60 text-[10px] font-bold tracking-[0.2em] uppercase hover:text-amber-500 transition-colors">
                Request a Catalog
              </button>
            </div>

            {/* Micro-Stat for social proof */}
            <div className="mt-16 pt-8 border-t border-white/10 flex gap-12">
               <div>
                  <p className="text-white text-xl font-serif">10k+</p>
                  <p className="text-gray-500 text-[9px] uppercase tracking-widest">Enthusiasts</p>
               </div>
               <div>
                  <p className="text-white text-xl font-serif">24h</p>
                  <p className="text-gray-500 text-[9px] uppercase tracking-widest">Dispatch</p>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}