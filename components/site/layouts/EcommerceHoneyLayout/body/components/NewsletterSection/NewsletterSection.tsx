'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { PaperAirplaneIcon, BeakerIcon } from '@heroicons/react/24/outline';

export default function NewsletterSection() {
  const { storeFormData } = useStoreContext();
  const [email, setEmail] = useState('');
  
  const primary = storeFormData?.themeSettings?.primaryColor || '#3E2723';

  return (
    <section className="relative py-24 bg-[#FAF9F6] overflow-hidden">
      {/* Decorative "Honey Ring" Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-100 rounded-full opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-amber-50 rounded-full opacity-30 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto bg-[#3E2723] rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row items-stretch"
        >
          {/* Visual Side */}
          <div className="md:w-5/12 relative min-h-[300px] bg-[#2D1B18]">
            <img 
              src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800" 
              alt="Artisanal Honey" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#3E2723] via-transparent to-transparent md:bg-gradient-to-b" />
            
            <div className="relative h-full p-12 flex flex-col justify-center items-start">
              <div className="bg-[#F3A852] p-3 rounded-2xl mb-6 shadow-xl shadow-amber-900/20">
                <BeakerIcon className="w-8 h-8 text-[#3E2723]" />
              </div>
              <h3 className="text-white font-serif italic text-3xl leading-tight">
                Fresh from <br />
                <span className="text-[#F3A852]">The Reserve</span>
              </h3>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-[#3E2723] relative">
            <div className="mb-8">
              <span className="text-[#F3A852] font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">
                Exclusive Access
              </span>
              <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-4">
                Join the Collector's Circle
              </h2>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed max-w-md">
                Be the first to know about seasonal harvests, limited edition batches, and artisanal recipes. No spam, just pure sweetness.
              </p>
            </div>

            <form 
              onSubmit={(e) => e.preventDefault()}
              className="relative flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-grow relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your favorite email address"
                  className="w-full bg-[#2D1B18] border border-white/10 rounded-2xl px-6 py-5 text-white placeholder:text-stone-600 focus:outline-none focus:border-[#F3A852] transition-all"
                />
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#F3A852]/50 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
              </div>
              
              <button className="bg-[#F3A852] hover:bg-white text-[#3E2723] font-black uppercase tracking-widest text-[11px] px-8 py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-amber-900/20 group">
                <span>Subscribe</span>
                <PaperAirplaneIcon className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </form>

            <p className="mt-6 text-[10px] text-stone-500 uppercase tracking-widest font-bold">
              100% Raw • Unfiltered • Hand-Bottled Updates
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Bee Path */}
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-10 left-10 opacity-10 pointer-events-none"
      >
        <svg width="100" height="50" viewBox="0 0 100 50">
          <path d="M0 25 C 20 0, 40 50, 60 25 S 100 25, 100 25" stroke="#B8860B" fill="transparent" strokeDasharray="4 4" />
        </svg>
      </motion.div>
    </section>
  );
}