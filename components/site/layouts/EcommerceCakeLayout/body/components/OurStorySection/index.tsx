'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function OurStorySection() {
  return (
    <section className="relative py-24 bg-[#FDFCF9] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* 1. VISUAL SIDE: The Heritage Collage */}
          <div className="relative w-full lg:w-1/2">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0">
              {/* Main Image: The Craft */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl border-[12px] border-white"
              >
                <Image decoding="async" 
                  src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80" 
                  alt="Baker at work" 
                  fill
                  className="object-cover" // Use the URL directly without modification
                />
              </motion.div>

              {/* Floating Accent Image: The Result */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-12 -right-8 md:-right-16 z-20 w-1/2 aspect-square rounded-2xl overflow-hidden shadow-2xl border-[8px] border-white hidden sm:block"
              >
                <Image decoding="async" 
                  src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80" 
                  alt="Fresh bread" 
                  fill
                  className="object-cover" // Use the URL directly without modification
                />
              </motion.div>

              {/* Decorative Flourish: Est. Date */}
              <div className="absolute -top-6 -left-6 z-0 w-32 h-32 border-2 border-amber-200 rounded-full flex items-center justify-center opacity-50">
                <span className="text-amber-800 font-serif italic text-sm">Est. 1994</span>
              </div>
            </div>
          </div>

          {/* 2. TEXT SIDE: The Welcoming Narrative */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-amber-600 font-bold uppercase tracking-[0.4em] text-xs mb-6 block"
            >
              Our Heritage
            </motion.span>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter text-gray-900 mb-8 leading-tight"
            >
              From a Small Kitchen <br />
              <span className="italic font-serif font-light text-amber-700">to Your Table</span>
            </motion.h2>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 text-gray-600 text-lg leading-relaxed font-light"
            >
              <p>
                At <span className="font-bold text-gray-900">Sweet Crumbs</span>, we believe that bread is the soul of the home. What started thirty years ago as a single stone oven in a family garage has grown into a community staple.
              </p>
              <p>
                We don’t cut corners. Every croissant is laminated by hand, every sourdough starter is aged for days, and every grain is sourced from local farmers who share our passion for quality.
              </p>
            </motion.div>

            {/* Signature Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-col lg:flex-row items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="Baker" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="font-serif italic text-2xl text-gray-800">The Crumbs Family</p>
                <p className="text-[10px] uppercase tracking-widest font-black text-amber-600">Master Bakers & Founders</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
      
      {/* Background Element: Large Flour Sifter Icon */}
      <div className="absolute right-[-5%] top-[10%] opacity-[0.03] pointer-events-none select-none">
        <span className="text-[30vw]">🥖</span>
      </div>
    </section>
  );
}