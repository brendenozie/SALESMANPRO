'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { BoltIcon, ChevronRightIcon, } from '@heroicons/react/24/solid';
import { TrophyIcon, } from '@heroicons/react/24/outline';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  
  // Bike Duka Palette: Racing Orange, Carbon Black, and White
  const racingOrange = "#FF5733"; 
  const carbonBlack = "#0a0a0a";

  const promotion = promotions?.[1] || {
    title: 'Engineered for the Podium',
    subtitle: 'THE ENDURANCE SERIES EVENT',
    description:
      'Push your limits with our limited-release carbon frames and aerodynamic groupsets. Professional-grade performance, now accessible for the Nairobi cycling elite.',
    bannerUrl: 'https://images.unsplash.com/photo-1532298229144-0ee050c996bd',
    ctaText: 'Shop the Series',
    ctaLink: '/bikeecommerce/products',
  };

  return (
    <section className="relative min-h-[700px] flex items-center overflow-hidden bg-[#050505]">
      {/* Background Decorative Element: Large faded Speed/Crankset Outline */}
      <div className="absolute right-[-5%] top-[-5%] opacity-[0.03] pointer-events-none rotate-12">
         <BoltIcon className="w-[900px] h-[900px] text-white" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* --- Image Block with "Bento" Framing --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:col-span-5 order-2 lg:order-1"
          >
            <div className="relative group">
              {/* Outer Frame Decoration */}
              <div className="absolute -inset-6 border border-white/5 rounded-[3rem] hidden lg:block" />
              
              <div className="relative overflow-hidden aspect-[4/5] rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(255,87,51,0.15)] bg-zinc-900">
                <img
                  src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1532298229144-0ee050c996bd'}
                  alt={promotion.title}
                  className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Floating Technical Tag */}
                <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <span className="text-[10px] font-black tracking-widest text-[#FF5733] uppercase">Weight: 7.2kg</span>
                </div>
              </div>

              {/* Bottom Detail Card: Focus on Endurance */}
              <div className="absolute -bottom-8 -right-4 md:right-8 bg-[#FF5733] p-8 shadow-2xl rounded-3xl hidden sm:block">
                <div className="flex items-center gap-4 mb-1">
                   <TrophyIcon className="w-6 h-6 text-white" />
                   <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Pro Series</span>
                </div>
                <p className="text-white font-black uppercase text-xl leading-none">Carbon T1000</p>
              </div>
            </div>
          </motion.div>

          {/* --- Content Block --- */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 text-left order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 border border-[#FF5733]/30 bg-[#FF5733]/5 rounded-full mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5733] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5733]"></span>
              </span>
              <span className="text-[10px] font-black tracking-[0.3em] text-[#FF5733] uppercase">
                {promotion.badgeText || 'Flash Sale'}
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.85] uppercase tracking-tighter mb-10">
              {promotion.title.split(' ').map((word, i) => (
                <span key={i} className={i % 2 !== 0 ? "text-zinc-800 italic" : "text-white"}>
                  {word}{' '}
                </span>
              ))}
            </h2>

            <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-xl mb-12">
              {promotion.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
              <a
                href={promotion.ctaLink || '/bikeecommerce/products'}
                className="group relative inline-flex items-center gap-4 bg-white text-black px-12 py-6 font-black uppercase tracking-widest text-[10px] transition-all hover:pr-16"
              >
                <span className="relative z-10">{promotion.ctaText}</span>
                <div className="absolute inset-0 bg-[#FF5733] translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                <ChevronRightIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <button className="text-zinc-500 text-[10px] font-black tracking-[0.2em] uppercase hover:text-[#FF5733] transition-colors border-b border-transparent hover:border-[#FF5733] pb-1">
                View Spec Sheet
              </button>
            </div>

            {/* Performance Stats */}
            <div className="mt-20 pt-10 border-t border-white/5 flex gap-16">
               <div>
                  <p className="text-white text-3xl font-black italic tracking-tighter">150km</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Range Capable</p>
               </div>
               <div>
                  <p className="text-white text-3xl font-black italic tracking-tighter">04h</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Pro Build-Time</p>
               </div>
               <div className="hidden sm:block">
                  <p className="text-white text-3xl font-black italic tracking-tighter">FREE</p>
                  <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Nairobi Delivery</p>
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}