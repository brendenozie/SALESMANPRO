'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BeakerIcon, WrenchScrewdriverIcon, MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function MeetTheWatchmaker() {
  const accent = "#c5a059"; // Champagne Gold

  return (
    <section className="relative py-24 bg-[#faf9f6] dark:bg-[#0a0a0a] overflow-hidden">
      {/* Decorative Blueprint Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none dark:invert">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="0.5" />
          <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="0.2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* --- Image Collage (The Atelier) --- */}
          <div className="lg:col-span-6 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl"
            >
              <Image decoding="async" 
                src="https://images.unsplash.com/photo-1585123334904-845d60e97b29"
                alt="Master Watchmaker at work"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-700" />
            </motion.div>

            {/* Floating Detail Image */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-10 -right-10 w-64 h-64 border-[12px] border-[#faf9f6] dark:border-[#0a0a0a] rounded-sm overflow-hidden shadow-xl hidden md:block"
            >
              <Image decoding="async" 
                src="https://images.unsplash.com/photo-1509048191080-d2984bad6ad5" 
                alt="Watch movement close up"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* --- Narrative Content --- */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <span className="text-[10px] font-bold tracking-[0.4em] text-amber-600 uppercase mb-4 block">
                The Human Touch
              </span>
              <h2 className="text-5xl md:text-6xl font-serif text-zinc-900 dark:text-zinc-100 leading-tight">
                Where Seconds Are <br /> 
                <span className="italic">Scupltured by Hand</span>
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-zinc-600 dark:text-zinc-400 font-light leading-relaxed"
            >
              In our quiet atelier, time doesn't fly—it is meticulously assembled. Our master horologists spend hundreds of hours on a single movement, ensuring that the heartbeat of your timepiece is as unique as the person wearing it.
            </motion.p>

            {/* Craft Icons Grid */}
            <div className="grid grid-cols-2 gap-8 py-6">
              <div className="flex flex-col gap-3">
                <WrenchScrewdriverIcon className="w-6 h-6 text-amber-600 stroke-[1]" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Precision Tools</h4>
                <p className="text-[11px] text-zinc-500 uppercase">Calibrated to the micron</p>
              </div>
              <div className="flex flex-col gap-3">
                <MagnifyingGlassIcon className="w-6 h-6 text-amber-600 stroke-[1]" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Steady Eye</h4>
                <p className="text-[11px] text-zinc-500 uppercase">Inspection at 10x zoom</p>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden relative">
                    <Image decoding="async" src={`https://i.pravatar.cc/150?u=${i+10}`} fill alt="Watchmaker" className="grayscale"/>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Our Master Guild</p>
                <p className="text-xs text-zinc-500 italic font-serif">A combined 85 years of horology</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Subtle Bottom Quote */}
      <div className="mt-24 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-300 dark:text-zinc-800">
          Craftsmanship is the ultimate luxury
        </p>
      </div>
    </section>
  );
}