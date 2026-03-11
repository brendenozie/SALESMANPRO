'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { BoltIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();

  const promotion = promotions?.[1] || {
    title: 'WEEKEND WARRIOR DROP',
    description:
      'The armory has been restocked. Deploy now to claim exclusive legendary-tier equipment. Supplies are strictly limited to active-duty operators.',
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070',
    ctaText: 'CLAIM LOOT',
    ctaLink: '#',
  };

  return (
    <section className="relative py-24 bg-zinc-50 dark:bg-zinc-950 overflow-hidden border-t border-zinc-200 dark:border-white/5 transition-colors duration-500">
      
      {/* Background HUD Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/5 skew-x-[-20deg] translate-x-32 pointer-events-none" />
      
      {/* Adaptive Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, 
             backgroundSize: '50px 50px' 
           }} 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* --- Text Content Pane --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Mission Badge */}
            <div className="flex items-center gap-4 mb-8">
               <div className="bg-red-600 p-2 shadow-[0_0_20px_rgba(255,0,60,0.4)]">
                 <ShieldExclamationIcon className="w-6 h-6 text-white" />
               </div>
               <span className="font-mono text-xs tracking-[0.4em] text-red-600 dark:text-red-500 uppercase font-black">
                 Priority_Protocol_02
               </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black italic text-zinc-900 dark:text-white uppercase tracking-tighter leading-[0.9] mb-8 transition-colors">
              {promotion.title}
            </h2>

            {/* Glassmorphism Content Pane */}
            <div className="relative p-8 bg-white/40 dark:bg-white/5 backdrop-blur-md border-l-4 border-red-600 overflow-hidden shadow-xl dark:shadow-none">
               {/* Cyber Decoration Corners */}
               <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-zinc-900/10 dark:border-white/10" />
               
               <p className="text-zinc-700 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed italic transition-colors">
                 "{promotion.description}"
               </p>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-8">
              <a
                href={promotion.ctaLink || '#'}
                className="group relative px-12 py-5 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-tighter italic text-xl hover:bg-red-600 hover:text-white transition-all overflow-hidden shadow-2xl"
                style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0% 100%)' }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  {promotion.ctaText} <BoltIcon className="w-5 h-5 animate-bounce" />
                </span>
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-red-600 transition-transform duration-300" />
              </a>

              <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-widest leading-tight">
                Timer: 48:00:00 <br />
                Location: Global_Sector
              </div>
            </div>
          </motion.div>

          {/* --- Visual Display Block --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative group">
              {/* Animated Border Frames */}
              <div className="absolute -inset-4 border border-red-600/20 group-hover:border-red-600/50 transition-colors duration-500" />
              <div className="absolute -inset-1 border border-zinc-900/10 dark:border-white/10 group-hover:scale-105 transition-transform duration-500" />

              {/* Main Image Container */}
              <div className="relative w-[320px] md:w-[450px] aspect-[4/5] overflow-hidden bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/20 shadow-2xl">
                <img
                  src={promotion.bannerUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070'}
                  alt={promotion.title}
                  className="w-full h-full object-cover opacity-90 dark:opacity-80 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                />
                
                {/* Scanner Line Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/20 dark:via-red-600/10 to-transparent h-20 w-full animate-scan pointer-events-none" />
                
                {/* HUD Overlay Text */}
                <div className="absolute bottom-4 left-4 font-mono text-[10px] text-zinc-900/60 dark:text-white/50 bg-white/80 dark:bg-black/60 p-2 backdrop-blur-sm">
                   COORD: 40.7128° N, 74.0060° W <br />
                   SIG_STRENGTH: 98%
                </div>
              </div>

              {/* Decorative Floating Icon */}
              <div className="absolute -top-8 -right-8 w-24 h-24 border border-red-600/40 rotate-45 flex items-center justify-center bg-white dark:bg-zinc-950/80 backdrop-blur-xl shadow-xl">
                 <span className="text-red-600 font-black text-2xl -rotate-45">GEM</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </section>
  );
}