'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { BoltIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  
  // Moto Duka Palette: High-Octane Red, Asphalt Black, and Stark White
  const nitroRed = "#E63946"; 

  const promotion = promotions?.[1] || {
    title: 'Full Throttle Freedom',
    subtitle: 'THE END-OF-MONTH RIDERS EVENT',
    description:
      'Own the road with exclusive financing and weekend pricing on our flagship cruiser and sport series. Performance engineering meets the spirit of the open highway.',
    bannerUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    ctaText: 'View The Fleet',
    ctaLink: '/motorcycleecommerce/products',
  };

  return (
    <section className="relative min-h-[700px] flex items-center overflow-hidden bg-[#080808]">
      {/* Background Decorative Element: Large faded Bolt or Gear outline */}
      <div className="absolute right-[-15%] top-[-10%] opacity-[0.03] pointer-events-none rotate-12">
         <BoltIcon className="w-[1000px] h-[1000px] text-white" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* --- Image Block with "Industrial" Effect --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative group">
              {/* Rugged Frame Decoration */}
              <div className="absolute -inset-4 border-2 border-white/5 rounded-2xl" />
              
              <div className="relative overflow-hidden aspect-[4/5] rounded-2xl shadow-[0_40px_80px_-15px_rgba(230,57,70,0.2)] bg-zinc-900">
                <img
                  src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80'}
                  alt={promotion.title}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </div>

              {/* Floating Detail Card: The "Spec Badge" */}
              <div className="absolute -bottom-8 -right-4 md:right-8 bg-zinc-900 border border-white/10 p-8 shadow-2xl rounded-2xl hidden sm:block">
                <div className="flex items-center gap-3 mb-2">
                   <div className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse" />
                   <span className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">Status: In Stock</span>
                </div>
                <p className="text-white font-black italic uppercase text-xl">The Renegade 1200</p>
                <p className="text-[#E63946] text-[10px] font-bold uppercase tracking-widest mt-1">Nairobi Showroom</p>
              </div>
            </div>
          </motion.div>

          {/* --- Content Block --- */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-left order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 border border-[#E63946]/30 bg-[#E63946]/5 rounded-lg mb-10">
              <span className="text-[10px] font-black tracking-[0.4em] text-[#E63946] uppercase">
                {promotion.badgeText || 'Limited Flash Deal'}
              </span>
            </div>

            <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.85] uppercase tracking-tighter mb-10">
              {promotion.title}
            </h2>

            <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg mb-12">
              {promotion.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
              <a
                href={promotion.ctaLink || '/motorcycleecommerce/products'}
                className="group relative inline-flex items-center gap-4 bg-white text-black px-12 py-6 font-black uppercase tracking-widest text-xs transition-all hover:bg-[#E63946] hover:text-white rounded-md"
              >
                {promotion.ctaText}
                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </a>
              
              <button className="text-zinc-500 text-[10px] font-black tracking-[0.3em] uppercase hover:text-white transition-colors border-b-2 border-transparent hover:border-[#E63946] pb-1">
                Download Brochure
              </button>
            </div>

            {/* Performance Stats / Social Proof */}
            <div className="mt-20 pt-10 border-t border-white/5 flex gap-16">
               <div>
                  <p className="text-white text-4xl font-black italic">5.2k</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">Riders in Kenya</p>
               </div>
               <div>
                  <p className="text-white text-4xl font-black italic">12.5%</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">APR Financing</p>
               </div>
               <div className="hidden sm:block">
                  <p className="text-white text-4xl font-black italic">2YR</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest mt-1">Full Warranty</p>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}