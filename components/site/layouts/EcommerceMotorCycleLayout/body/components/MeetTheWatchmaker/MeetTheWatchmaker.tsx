'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WrenchIcon, CogIcon, BeakerIcon, FireIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function MeetTheMechanics() {
  const nitroRed = "#E63946"; 

  return (
    <section className="relative py-24 bg-zinc-50 dark:bg-[#050505] overflow-hidden">
      {/* Decorative Engineering Background: Piston / Gear Schematic */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none dark:invert select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-current">
          <path d="M30 20 L70 20 L70 80 L30 80 Z" fill="none" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="15" fill="none" strokeWidth="0.2" />
          <path d="M20 50 L80 50 M50 20 L50 80" strokeWidth="0.1" />
          <path d="M40 10 Q50 0 60 10" fill="none" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* --- Image Collage (The Custom Shop) --- */}
          <div className="lg:col-span-6 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "circOut" }}
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-zinc-900"
            >
              <Image decoding="async" 
                src="https://images.unsplash.com/photo-1485965120184-e220f721d03e"
                alt="Master Mechanic tuning a custom engine"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>

            {/* Floating Technical Detail */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-8 -right-8 w-72 h-72 border-[16px] border-zinc-50 dark:border-[#050505] rounded-3xl overflow-hidden shadow-2xl hidden md:block"
            >
              <Image decoding="async" 
                src="https://images.unsplash.com/photo-1615172282427-9a57ef2d142e" 
                alt="Close up of a motorcycle carburetor"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-[#E63946] px-3 py-1 rounded-full">
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Calibration Unit</span>
              </div>
            </motion.div>
          </div>

          {/* --- Narrative Content --- */}
          <div className="lg:col-span-6 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <span className="text-[10px] font-black tracking-[0.5em] text-[#E63946] uppercase mb-4 block">
                Engineering Excellence
              </span>
              <h2 className="text-6xl md:text-7xl font-black text-zinc-900 dark:text-zinc-100 leading-[0.9] uppercase tracking-tighter">
                Built to outrun <br /> 
                <span className="italic text-zinc-300 dark:text-zinc-800">the ordinary</span>
              </h2>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed"
            >
              In our specialized Nairobi workshop, we don't just sell motorcycles—we forge them. Every machine undergoes a 120-point diagnostic ritual, tuned by mechanics who speak the language of torque and compression.
            </motion.p>

            {/* Performance Icons Grid */}
            <div className="grid grid-cols-2 gap-10 py-4">
              <div className="flex flex-col gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 group-hover:bg-[#E63946] transition-colors duration-300">
                  <WrenchIcon className="w-6 h-6 text-[#E63946] group-hover:text-white stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Precision Tuning</h4>
                  <p className="text-xs text-zinc-500 uppercase mt-1 tracking-wider">Optimized for African Roads</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 group">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 group-hover:bg-[#E63946] transition-colors duration-300">
                  <FireIcon className="w-6 h-6 text-[#E63946] group-hover:text-white stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">Performance Dyno</h4>
                  <p className="text-xs text-zinc-500 uppercase mt-1 tracking-wider">Maximum BHP Guaranteed</p>
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
                  <div key={i} className="w-14 h-14 rounded-2xl border-4 border-zinc-50 dark:border-[#050505] overflow-hidden relative rotate-3 hover:rotate-0 transition-transform">
                    <Image decoding="async" src={`https://i.pravatar.cc/150?u=${i+25}`} fill alt="Lead Mechanic" className="grayscale"/>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-md font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">The Pit Crew</p>
                <p className="text-xs text-[#E63946] font-bold uppercase tracking-widest">Certified Master Technicians</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Speed Line Accents */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E63946] to-transparent opacity-20" />
    </section>
  );
}