'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  PhoneIcon, 
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

// Dummy data updated for the footwear context
const dummyPromotionData = {
  title: 'Engineered for the Modern Athlete',
  subtitle: 'The Ultimate Comfort & Style',
  description:
    'Experience a breakthrough in footwear technology. Our shoes are designed to provide unparalleled kinetic support and cloud-like cushioning, ensuring you stay peak-performance all day long. Whether you’re hitting the track or the terminal, move with absolute confidence.',
  bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', 
  ctaText: 'Shop the Collection',
  ctaLink: '/products',
  featureImage1: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=400&q=80',
  featureImage2: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80',
  perks: [
    { icon: TruckIcon, text: 'Fast Global Shipping' },
    { icon: ShieldCheckIcon, text: 'Authenticity Guarantee' },
    { icon: PhoneIcon, text: '24/7 Concierge' },
  ],
};

interface ShoePromotionAdProps {
  promotions?: any;
  themeSettings?: any;
}

export default function ShoePromotionAd({ promotions, themeSettings }: ShoePromotionAdProps) {
  // Take the second promotion if available, otherwise fallback
  const promotion = promotions?.length >= 2 ? promotions[1] : null;
  const adData = promotion || dummyPromotionData;

  const primary = themeSettings?.primaryColor || '#3B82F6';
  const secondary = themeSettings?.secondaryColor || '#10B981';

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      {/* Background Abstract Shapes */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] dark:opacity-[0.07] pointer-events-none select-none"
        style={{ color: primary }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-150">
          <path fill="currentColor" d="M44.7,-76.4C58.3,-69.2,70.1,-59,78.5,-46.3C86.9,-33.6,91.9,-18.3,90.4,-3.4C88.9,11.5,80.9,26,71.5,39C62.1,52,51.3,63.5,38.2,71.8C25.1,80.1,9.7,85.2,-5.4,84.3C-20.5,83.4,-35.3,76.5,-48.4,67.3C-61.5,58.1,-72.9,46.6,-79.8,33.1C-86.7,19.6,-89.1,4.1,-86.3,-10.5C-83.5,-25.1,-75.5,-38.8,-64.4,-48.5C-53.3,-58.2,-39.1,-63.9,-25.7,-71.2C-12.3,-78.5,0.3,-87.4,12.3,-86.4C24.3,-85.4,31.1,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
        
        {/* --- Left Block: Dynamic Visuals --- */}
        <div className="lg:col-span-5 relative">
          <motion.div 
            initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
            whileInView={{ opacity: 1, rotate: 3, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-20 group"
          >
            <img
              src={adData.bannerUrl}
              alt="Promotion"
              className="w-full rounded-[2rem] shadow-2xl border-8 border-white dark:border-zinc-900 transition-transform duration-700 group-hover:rotate-0"
            />
            {/* Glossy Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl flex items-center gap-4 border border-gray-100 dark:border-zinc-700">
               <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-800 bg-gray-200" />
                 ))}
               </div>
               <span className="text-xs font-black uppercase tracking-widest dark:text-white">10k+ Sold</span>
            </div>
          </motion.div>
          
          {/* Floating Accents */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 z-10 hidden md:block"
          >
            <img 
              src={adData.featureImage1} 
              alt="Feature" 
              className="w-40 h-40 rounded-3xl object-cover shadow-2xl border-4 border-white dark:border-zinc-900"
            />
          </motion.div>
        </div>

        {/* --- Right Block: Content --- */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="inline-block text-xs font-black uppercase tracking-[0.4em] mb-4"
              style={{ color: primary }}
            >
              {adData.subtitle}
            </motion.span>
            
            <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-[1.1] uppercase italic tracking-tighter">
              {adData.title}
            </h2>
            
            <p className="mt-6 text-lg text-gray-600 dark:text-zinc-400 max-w-xl leading-relaxed">
              {adData.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href={adData.ctaLink || '/products'}>
              <button 
                className="group flex items-center gap-3 text-white font-bold py-5 px-10 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: primary }}
              >
                {adData.ctaText}
                <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          {/* Perks Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 border-t border-gray-100 dark:border-zinc-800">
            {adData.perks.map((perk: any, index: number) => (
              <div key={index} className="flex flex-col items-center sm:items-start text-center sm:text-left group">
                <div 
                  className="p-3 rounded-xl mb-3 transition-colors group-hover:bg-opacity-20"
                  style={{ backgroundColor: `${primary}15`, color: primary }}
                >
                  <perk.icon className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {perk.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Wave Mask */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M1200 120L0 120L0 0L1200 120Z" className="fill-gray-50 dark:fill-zinc-950"></path>
        </svg>
      </div>
    </section>
  );
}