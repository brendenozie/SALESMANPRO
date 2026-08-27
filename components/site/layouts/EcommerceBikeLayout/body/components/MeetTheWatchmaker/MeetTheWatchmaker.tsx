'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  WrenchScrewdriverIcon, 
  BeakerIcon, 
  CpuChipIcon, 
  BoltIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function MeetTheMechanics() {
  const racingOrange = "#FF5733"; // Signature Bike Duka Orange

  return (
    <section className="relative py-32 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Decorative Technical Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none dark:opacity-[0.07]">
        <svg width="100%" height="100%" className="stroke-zinc-900 dark:stroke-white">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          
          {/* --- Image Collage (The Workshop) --- */}
          <div className="lg:col-span-6 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-zinc-900"
            >
              <Image 
                src="https://images.unsplash.com/photo-1485965120184-e220f721d03e" 
                loader={({ src }) => src}
                alt="Master bike mechanic at work"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent" />
            </motion.div>

            {/* Floating Technical Detail */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="absolute -bottom-8 -right-8 w-72 h-72 border-[12px] border-zinc-50 dark:border-zinc-950 rounded-[2.5rem] overflow-hidden shadow-2xl hidden md:block"
            >
              <Image 
                src="https://images.unsplash.com/photo-1532298229144-0ee050c996bd" 
                alt="Carbon fiber derailleur close up"
                fill
                className="object-cover"
                loader={({ src }) => src}
              />
            </motion.div>
          </div>

          {/* --- Narrative Content --- */}
          <div className="lg:col-span-6 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <span className="text-[10px] font-black tracking-[0.5em] text-[#FF5733] uppercase mb-6 block">
                The Lab Standard
              </span>
              <h2 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-zinc-100 leading-[0.85] uppercase tracking-tighter">
                Tuned For <br /> 
                <span className="italic text-zinc-300 dark:text-zinc-800">Pure Torque.</span>
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xl"
            >
              At the Bike Duka workshop, we don't just "fix" bikes—we calibrate them. Our lead engineers combine aerospace-grade materials with professional racing data to ensure your machine responds instantly to every watt of power you put down.
            </motion.p>

            {/* Performance Icons Grid */}
            <div className="grid grid-cols-2 gap-10 py-4">
              <div className="flex flex-col gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center group-hover:bg-[#FF5733] transition-colors duration-300">
                   <WrenchScrewdriverIcon className="w-6 h-6 text-[#FF5733] group-hover:text-white stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Torque Specs</h4>
                  <p className="text-[11px] text-zinc-500 uppercase mt-1">Calibrated to 0.1Nm</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center group-hover:bg-[#FF5733] transition-colors duration-300">
                   <CpuChipIcon className="w-6 h-6 text-[#FF5733] group-hover:text-white stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Electronic Tuning</h4>
                  <p className="text-[11px] text-zinc-500 uppercase mt-1">Di2 & AXS Optimization</p>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-10 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-8"
            >
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-14 h-14 rounded-full border-4 border-zinc-50 dark:border-zinc-950 overflow-hidden relative grayscale hover:grayscale-0 transition-all cursor-pointer">
                    <Image src={`https://i.pravatar.cc/150?u=bike${i}`} fill alt="Lead Mechanic" loader={({ src }) => src}/>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">The Race Support Team</p>
                <p className="text-xs text-[#FF5733] font-bold uppercase tracking-widest">Nairobi's Elite Mechanics</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Decorative Brand Text */}
      <div className="mt-32 overflow-hidden whitespace-nowrap opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <p className="text-[12rem] font-black uppercase italic tracking-tighter">
          RACING PERFORMANCE • NAIROBI BUILT • BIKE DUKA • RACING PERFORMANCE
        </p>
      </div>
    </section>
  );
}