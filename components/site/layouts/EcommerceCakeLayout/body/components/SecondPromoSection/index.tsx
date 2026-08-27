'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
// Using Hero Icons as per your saved preference
import { 
  GiftIcon, 
  ArrowRightIcon, 
  ClockIcon,
  StarIcon 
} from '@heroicons/react/24/solid';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#D97706'; 
  const secondary = themeSettings?.secondaryColor || '#FDF2F2'; // Soft cream/pink

  const promotion = promotions?.[1] || {
    title: 'Weekend Sweet Special',
    subtitle: 'Freshly Baked Happiness',
    description:
      'Treat yourself to our artisan cake collection this weekend. Every bite is crafted with premium ingredients and a sprinkle of magic. Available while supplies last!',
    bannerUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80',
    ctaText: 'Claim My Treat',
    ctaLink: '/cakeecommerce/products',
  };

  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Decorative Background Shapes */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: primary }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-30" style={{ backgroundColor: secondary }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* --- Image Block (Left/Center) --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 relative order-2 lg:order-1"
          >
            <div className="relative aspect-square w-full max-w-md mx-auto">
              {/* Main Image Frame */}
              <div className="absolute inset-0 rounded-[3rem] rotate-3 bg-slate-100 shadow-inner" />
              <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-2">
                <Image
                  src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=80'}
                  alt={promotion.title}
                  loader={({ src }) => src} // Use the original URL without optimization
                  fill
                  className="object-cover"
                />
              </div>

              {/* Floating "Quality" Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white shadow-xl flex flex-col items-center justify-center p-2 border-4 border-slate-50"
              >
                <StarIcon className="w-6 h-6 text-amber-400" />
                <span className="text-[10px] font-black text-center leading-tight uppercase tracking-tighter">Premium Quality</span>
              </motion.div>

              {/* Timer Badge */}
              <div className="absolute -bottom-4 left-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 border border-white">
                <ClockIcon className="w-4 h-4" style={{ color: primary }} />
                <span className="text-xs font-bold text-slate-700">Limited Offer</span>
              </div>
            </div>
          </motion.div>

          {/* --- Text Block (Right) --- */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
                <GiftIcon className="w-5 h-5" style={{ color: primary }} />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">Weekend Exclusive</span>
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                {promotion.title.split(' ').slice(0, -1).join(' ')} <br/>
                <span style={{ color: primary }}>{promotion.title.split(' ').pop()}</span>
              </h2>

              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                {promotion.description}
              </p>

              <div className="pt-6 flex flex-col sm:flex-row gap-6 items-center">
                <a
                  href={promotion.ctaLink || '#'}
                  className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full text-white font-black text-sm uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: primary }}
                >
                  {promotion.ctaText}
                  <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </a>
                
                <div className="flex -space-x-3">
                    {[1,2,3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                        </div>
                    ))}
                    <div className="pl-6 flex flex-col">
                        <span className="text-xs font-black text-slate-900 leading-none">4.9/5</span>
                        <span className="text-[10px] font-bold text-slate-400">Happy Customers</span>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-pixels.png')] opacity-40 pointer-events-none" />
    </section>
  );
}