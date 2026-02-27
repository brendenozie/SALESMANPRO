'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { RocketLaunchIcon, ShieldCheckIcon, TagIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const accent = '#FF003C'; // Empire Red

  if (!promotions || promotions.length === 0) return null;

  // Single Promotion: Full-Width Tactical Banner
  if (promotions.length === 1) {
    const promo = promotions[0];
    return (
      <section className="py-20 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="relative group h-[500px] w-full bg-zinc-900 border border-white/10 overflow-hidden"
          >
            {/* Background Image with Parallax Effect */}
            <img
              src={promo.bannerUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070'}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
            />

            {/* Slashed Overlay Design */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
            <div 
              className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 skew-x-[-15deg] translate-x-32 border-l border-red-600/30" 
            />

            {/* HUD Content */}
            <div className="relative z-20 h-full flex flex-col justify-center p-12 md:p-20">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-red-600" />
                <span className="text-red-600 font-mono text-sm tracking-[0.4em] uppercase font-black">
                  Priority_Intel
                </span>
              </div>

              <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none mb-6">
                {promo.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 2 !== 0 ? 'text-red-600' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h2>

              <p className="max-w-xl text-zinc-400 text-lg md:text-xl font-medium mb-10 leading-relaxed border-l-2 border-white/10 pl-6">
                {promo.description}
              </p>

              <div className="flex items-center gap-6">
                <a
                  href={promo.ctaLink || '#'}
                  className="relative px-10 py-4 bg-white text-black font-black uppercase tracking-tighter italic text-lg hover:bg-red-600 hover:text-white transition-all overflow-hidden"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)' }}
                >
                  <span className="relative z-10">{promo.ctaText || 'Deploy Now'}</span>
                </a>
                
                <div className="hidden md:flex flex-col font-mono text-[10px] text-zinc-500 uppercase">
                  <span>Status: Active</span>
                  <span>Encryption: AES-256</span>
                </div>
              </div>
            </div>

            {/* Decorative Corner Reticles */}
            <div className="absolute top-10 right-10 flex gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              <span className="text-red-600 font-mono text-xs">LIVE_TRANSMISSION</span>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Multiple Promotions: Tactical Grid
  const displayedPromotions = promotions.slice(0, 3);
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedPromotions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group bg-zinc-900 border border-white/5 overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400'}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Tactical Badge */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 p-2">
                  {index === 0 ? <RocketLaunchIcon className="w-5 h-5 text-red-600" /> : 
                   index === 1 ? <ShieldCheckIcon className="w-5 h-5 text-red-600" /> : 
                   <TagIcon className="w-5 h-5 text-red-600" />}
                </div>
              </div>

              {/* Content Container */}
              <div className="p-8">
                <div className="text-[10px] font-mono text-red-600 uppercase tracking-widest mb-2">
                  Module_0{index + 1}
                </div>
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-4 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-500 text-sm mb-8 leading-relaxed h-12 line-clamp-2">
                  {item.description}
                </p>
                
                <a
                  href={item.ctaLink || '#'}
                  className="flex items-center justify-between group/btn"
                >
                  <span className="text-sm font-black text-white uppercase tracking-widest italic group-hover/btn:text-red-600 transition-colors">
                    {item.ctaText || 'Initialize'}
                  </span>
                  <div className="h-[2px] w-12 bg-white/10 group-hover/btn:bg-red-600 group-hover/btn:w-20 transition-all duration-300" />
                </a>
              </div>

              {/* Bottom Decorative Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 group-hover:bg-red-600 transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}