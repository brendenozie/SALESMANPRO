'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, BeakerIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#064e3b';

  // Targeting the second promotion (index 1) with fallbacks
  const promotion = promotions?.[1] || {
    title: 'Precision Soil Testing',
    description:
      'Unlock the full potential of your acreage. Get 20% off comprehensive lab analysis this weekend. Science-backed yields start beneath the surface.',
    bannerUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9',
    ctaText: 'Book Analysis',
    ctaLink: '#',
  };

  if (!promotions || promotions.length < 2 && !promotion) return null;

  return (
    <section className="relative py-24 bg-[#FCFAFA] overflow-hidden">
      {/* Background Accent Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 pointer-events-none hidden lg:block" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* --- Content Block --- */}
          <motion.div 
            className="lg:col-span-6 text-left"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest mb-6">
              <BeakerIcon className="w-4 h-4" />
              Expert Solutions
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-6">
              {promotion.title.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="italic font-serif font-light text-emerald-600">
                {promotion.title.split(' ').slice(-1)}
              </span>
            </h2>

            <p className="text-lg text-slate-500 mb-10 max-w-xl leading-relaxed font-medium">
              {promotion.description}
            </p>

            <motion.a
              href={promotion.ctaLink || '/agrovetecommerce/products'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-tighter shadow-xl hover:bg-emerald-700 transition-colors group"
            >
              {promotion.ctaText || 'Claim Offer'}
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>

          {/* --- Image Block --- */}
          <motion.div 
            className="lg:col-span-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative aspect-[4/5] md:aspect-video lg:aspect-[4/3] w-full rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white">
              <Image decoding="async"
                src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1622383529984-6d5018432102'}
                alt={promotion.title}
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105" // Simple loader for optimization
              />
              
              {/* Badge Overlay */}
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
                <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Status</p>
                <p className="text-sm font-bold text-emerald-600 uppercase">Available Now</p>
              </div>
            </div>

            {/* Decorative Geometric Element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Border Accent */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
    </section>
  );
}