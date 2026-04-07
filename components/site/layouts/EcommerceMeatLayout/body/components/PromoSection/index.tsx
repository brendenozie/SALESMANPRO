'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, TicketIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  
  if (!promotions || promotions.length === 0) return null;

  return (
    <section className="py-24 bg-white dark:bg-[#080808] overflow-hidden transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header - Butchery Aesthetic */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-500">
              <TicketIcon className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Exclusive Butcher's Deals</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-stone-900 dark:text-white tracking-tighter leading-[0.9]">
              Prime Cuts, <span className="italic font-serif font-light text-red-600">Lower Prices.</span>
            </h2>
          </div>
          <p className="text-stone-500 font-medium max-w-xs border-l-2 border-stone-200 dark:border-stone-800 pl-6">
            Hand-selected weekly specials from our master butchers, directly to your kitchen.
          </p>
        </div>

        {/* Dynamic Promotion Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feature Promotion (Slot 1) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 relative group cursor-pointer"
          >
            <div className="relative h-[600px] w-full rounded-[3.5rem] overflow-hidden shadow-2xl bg-stone-900">
              <Image
                src={promotions[0].bannerUrl || 'https://images.unsplash.com/photo-1544022613-e87ca75a784a'}
                alt={promotions[0].title}
                loader={({ src }) => src}
                fill
                className="object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 p-10 md:p-16 w-full">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                      Live Offer
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      <ClockIcon className="w-4 h-4" />
                      Ends Soon
                    </div>
                </div>
                <h3 className="text-4xl md:text-6xl font-black text-white mb-6 leading-none max-w-lg">
                  {promotions[0].title}
                </h3>
                <p className="text-lg text-stone-300 mb-10 max-w-md leading-relaxed line-clamp-2 font-medium">
                  {promotions[0].description}
                </p>
                <a
                  href={promotions[0].ctaLink || '/meatecommerce/products'}
                  className="inline-flex items-center gap-4 bg-red-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-white hover:text-black transition-all group/btn shadow-2xl"
                >
                  {promotions[0].ctaText || 'Claim This Cut'}
                  <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Secondary Stack (Slot 2) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {promotions.slice(1, 3).map((promo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative flex-1 bg-stone-100 dark:bg-stone-900/50 rounded-[3rem] p-10 border border-stone-200 dark:border-white/5 hover:border-red-500/50 transition-all group overflow-hidden"
              >
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white dark:bg-stone-800 text-stone-900 dark:text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                        Flash Deal
                      </span>
                      <SparklesIcon className="w-6 h-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-3xl font-black text-stone-900 dark:text-white mb-3 group-hover:text-red-600 transition-colors">
                      {promo.title}
                    </h4>
                    <p className="text-stone-500 dark:text-stone-400 font-medium leading-relaxed line-clamp-2">
                      {promo.description}
                    </p>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-between">
                    <a 
                      href={promo.ctaLink || '/meatecommerce/products'} 
                      className="group/link inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-stone-900 dark:text-white"
                    >
                      <span>Shop Deal</span>
                      <div className="h-px w-6 bg-red-600 group-hover/link:w-12 transition-all" />
                    </a>
                    
                    <div className="h-16 w-16 rounded-2xl overflow-hidden relative rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-xl">
                        <Image 
                            src={promo.bannerUrl || 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f'} 
                            alt="promo-thumb" 
                            fill 
                            className="object-cover"
                            loader={({ src }) => src}
                        />
                    </div>
                  </div>
                </div>
                {/* Subtle background glow on hover */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-red-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}

            {/* Placeholder for Single-Promo Scenarios */}
            {promotions.length === 1 && (
               <div className="flex-1 bg-stone-950 rounded-[3rem] p-10 text-white flex flex-col justify-center relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                      <TicketIcon className="w-7 h-7 text-red-500" />
                    </div>
                    <h4 className="text-2xl font-black mb-3">Join the <span className="text-red-500">Carnivore Club</span></h4>
                    <p className="text-stone-400 font-medium text-sm leading-relaxed mb-8">
                      Be the first to know about weekend roasts and limited wagyu arrivals.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-[0.3em] py-3 px-6 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all">
                      Subscribe Now
                    </button>
                  </div>
                  {/* Decorative background Icon */}
                  <TicketIcon className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 -rotate-12" />
               </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}