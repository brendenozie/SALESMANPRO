'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SparklesIcon, TicketIcon } from '@heroicons/react/24/outline';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#f97316';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#3b82f6';

  const promotion = promotions?.[1] || {
    title: 'Weekend Flash Sale',
    subtitle: 'Limited Time Offer',
    description: 'Enjoy exclusive discounts on our top products this weekend only. Available while supplies last. Hurry and grab your favorites!',
    bannerUrl: 'https://dozi4r4ug9739.cloudfront.net/images/1763546711539-composition-black-friday-shopping-cart-with-copy-space.jpg',
    ctaText: 'Claim Your Discount',
    ctaLink: '#',
  };

  return (
    <section className="relative py-28 overflow-hidden bg-white">
      {/* Background Mesh/Gradient Decor */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full blur-[120px] opacity-20"
          style={{ background: primary }}
        />
        <div 
          className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full blur-[120px] opacity-10"
          style={{ background: secondary }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* --- Image Block (Floating Effect) --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-8 border-white">
              <img
                src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000'}
                alt={promotion.title}
                className="w-full h-[400px] md:h-[500px] object-cover transition-transform duration-700 hover:scale-110"
              />
            </div>
            
            {/* Floating Floating "Coupon" Badge */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-6 md:-right-10 z-20 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 hidden sm:block"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                  <TicketIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Flash Code</p>
                  <p className="text-xl font-black text-gray-900">WEEKEND40</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* --- Text Block (Editorial Style) --- */}
          <div className="order-1 lg:order-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-[0.3em]"
            >
              <SparklesIcon className="w-4 h-4 text-amber-400" />
              Exclusive Event
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-gray-900 leading-[0.95] tracking-tighter"
            >
              {promotion.title.split(' ').map((word, i) => (
                <span key={i} className={i === 1 ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500" : ""}>
                  {word}{' '}
                </span>
              ))}
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-lg"
            >
              {promotion.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <a
                href={promotion.ctaLink || '/groceriesecommerce/products'}
                className="group relative px-10 py-5 bg-gray-900 text-white font-black text-lg rounded-2xl overflow-hidden transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
              >
                <span className="relative z-10">{promotion.ctaText}</span>
                <div 
                  className="absolute inset-0 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"
                  style={{ backgroundColor: primary }}
                />
              </a>
              
              <button className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-900 font-black text-lg rounded-2xl hover:bg-gray-50 transition-colors">
                View Catalog
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}