'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function EyewearStandards() {
  const primaryGold = '#F3A852';
  const darkTeal = '#004743';

  return (
    <section className="py-32 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
          
          {/* Left Column: Craftsmanship Story */}
          <div className="space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[500px] w-full overflow-hidden rounded-[3rem] bg-zinc-100"
            >
              <Image decoding="async" 
                src="https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=800&q=80" 
                alt="Artisan Crafting Frames" 
                fill 
                className="object-cover transition-transform duration-1000 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors duration-500" />
            </motion.div>

            <div className="max-w-md">
              <h4 className="text-[#F3A852] text-[10px] font-black uppercase tracking-[0.4em] mb-4">The Material</h4>
              <h2 className="text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-[0.9] mb-6">
                Hand-Polished <br /> <span className="italic text-zinc-300 dark:text-zinc-700">Acetate.</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Our frames are carved from premium Italian Mazzucchelli acetate. Unlike injected plastic, 
                this organic material retains its luster for decades and offers a flexible, 
                tailored fit that adapts to your facial structure.
              </p>
              <button className="mt-8 group flex items-center gap-4 text-zinc-900 dark:text-white font-black text-[10px] uppercase tracking-widest">
                <span className="border-b-2 border-[#F3A852] pb-1">View the Craft</span>
                <span className="w-8 h-[1px] bg-zinc-300 group-hover:w-12 transition-all" />
              </button>
            </div>
          </div>

          {/* Right Column: Engineering Excellence */}
          <div className="space-y-12 lg:pt-40">
            <div className="max-w-md lg:ml-auto text-left lg:text-right">
              <h4 className="text-[#F3A852] text-[10px] font-black uppercase tracking-[0.4em] mb-4">The Science</h4>
              <h2 className="text-5xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-[0.9] mb-6">
                Digital <br /> <span className="italic text-zinc-300 dark:text-zinc-700">Surfacing.</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Every lens is engineered using point-of-wear technology. We calculate 
                the light path through every millimeter of the lens to eliminate 
                peripheral distortion and provide high-definition vision.
              </p>
              <button className="mt-8 group flex flex-row-reverse lg:flex-row items-center gap-4 text-zinc-900 dark:text-white font-black text-[10px] uppercase tracking-widest ml-auto">
                <span className="w-8 h-[1px] bg-zinc-300 group-hover:w-12 transition-all" />
                <span className="border-b-2 border-[#F3A852] pb-1">Our Lab Standards</span>
              </button>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px] w-full overflow-hidden rounded-[3rem] bg-[#004743] p-12 flex items-center justify-center shadow-2xl"
            >
               <Image decoding="async" 
                src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=1200&q=80" 
                alt="Precision Lenses" 
                fill 
                className="object-contain p-16 rotate-12 group-hover:rotate-0 transition-transform duration-700"
              />
              {/* Decorative Glassmorphism Element */}
              <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                 <span className="text-white text-[10px] font-black uppercase tracking-tighter text-center px-2">100% UV Protection</span>
              </div>
              <Image decoding="async" 
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                alt="Quality Assurance"
                fill
                className="object-contain p-16 rotate-12 group-hover:rotate-0 transition-transform duration-700"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}