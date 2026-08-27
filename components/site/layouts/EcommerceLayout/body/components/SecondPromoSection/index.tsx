'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { 
  ShoppingBagIcon, 
  ArrowRightIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#000000';
  const secondary = themeSettings?.secondaryColor || '#6366f1';

  // Grab the second promotion (index 1) or use a more editorial default
  const promo = promotions?.[1] || {
    title: 'Weekend Curations',
    subtitle: 'Limited Time Offer',
    description: 'Elevate your daily ritual with pieces designed for longevity. Our weekend special features a selection of archive favorites at exclusive pricing.',
    bannerUrl: 'https://images.unsplash.com/photo-1515494191661-6d0d99347d4d?q=80&w=2070',
    ctaText: 'Shop the Archive',
    ctaLink: '#',
  };

  return (
    <section className="relative py-24 bg-slate-50 dark:bg-black overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* --- Image Showcase Block --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-2 lg:order-1"
          >
            {/* The "Floating" Frame */}
            <div className="relative z-10 rounded-[2rem] overflow-hidden aspect-square md:aspect-[4/5] shadow-2xl group">
              <img
                src={promo.bannerUrl || 'https://images.unsplash.com/photo-1515494191661-6d0d99347d4d?q=80&w=2070'}
                alt={promo.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-[2rem]" />
            </div>

            {/* Aesthetic Accents */}
            <div 
              className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
              style={{ background: primary }}
            />
            <div 
              className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20"
              style={{ background: secondary }}
            />
            
            {/* Floating Tag */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-12 -left-6 md:-left-12 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl z-20 border border-slate-100 dark:border-gray-800 hidden md:flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ends in</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">48 Hours Only</p>
              </div>
            </motion.div>
          </motion.div>

          {/* --- Content Block --- */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="h-px w-6 bg-slate-300 dark:bg-gray-700" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                  {promo.badgeText || 'Exclusive Access'}
                </span>
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-8">
                {promo.title}
              </h2>

              <p className="text-lg text-slate-500 dark:text-gray-400 font-medium leading-relaxed mb-10 max-w-lg">
                {promo.description}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <a
                  href={promo.ctaLink || '#'}
                  className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <ShoppingBagIcon className="w-4 h-4" />
                    {promo.ctaText}
                  </span>
                  {/* Subtle hover liquid effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </a>

                <div className="flex items-center gap-2 group cursor-pointer">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    View Lookbook
                  </span>
                  <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>

            {/* Brand Proof - Optional subtle row */}
            <div className="mt-16 pt-12 border-t border-slate-100 dark:border-gray-900 grid grid-cols-3 gap-4">
              {['Free Shipping', 'Secure Payment', '2-Year Warranty'].map((text, i) => (
                <div key={i} className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-gray-700">
                  • {text}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}