'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import { ArrowRightIcon, GiftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#0EA5E9';
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#F43F5E';

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Cinematic Ultra-Wide
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative h-[500px] md:h-[600px] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]"
          >
            <Image
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?q=80&w=2000'}
              alt={promo.title}
              loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
              fill
              className="object-cover transition-transform duration-[3s] group-hover:scale-110"
            />
            {/* Elegant Radial Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-center p-12 md:p-20">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-white">
                    <SparklesIcon className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-black text-white/80 uppercase tracking-[0.3em]">Exclusive Offer</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl font-black text-white leading-none mb-6 tracking-tighter">
                  {promo.title}
                </h2>
                
                <p className="text-xl text-white/70 mb-10 leading-relaxed font-medium">
                  {promo.description}
                </p>

                <motion.a
                  href={promo.ctaLink || '/petsecommerce/products'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-4 px-10 py-5 rounded-full text-white font-black text-lg shadow-2xl transition-all"
                  style={{ backgroundColor: primary }}
                >
                  {promo.ctaText || 'Claim Offer'}
                  <ArrowRightIcon className="w-6 h-6" />
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: The "Offer Gallery"
  const displayed = promotions.slice(0, 3);
  
  return (
    <section className="py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayed.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col group rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 transition-all duration-500 hover:shadow-2xl 
                ${index === 1 ? 'md:-translate-y-8' : ''}`} // Offset effect
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=800'}
                  alt={item.title}
                  loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm">
                  <GiftIcon className="w-5 h-5" style={{ color: secondary }} />
                </div>
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-500 font-medium text-sm mb-8 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                
                <div className="mt-auto">
                  <a
                    href={item.ctaLink || '/petsecommerce/products'}
                    className="group/btn relative flex items-center justify-between w-full p-1 pl-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-slate-900 overflow-hidden"
                  >
                    <span className="text-sm font-black text-slate-900 group-hover/btn:text-white transition-colors">
                      {item.ctaText || 'Explore'}
                    </span>
                    <div 
                      className="w-10 h-10 flex items-center justify-center rounded-xl text-white transition-transform group-hover/btn:translate-x-1"
                      style={{ backgroundColor: primary }}
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}