'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  MapPinIcon, 
  PhoneIcon,
  ShoppingBagIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

function ButcheryCTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-white dark:bg-[#050505] transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-stone-950 rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5)]">
          
          {/* Subtle Industrial Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="industrialGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#industrialGrid)" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center">
            
            {/* --- LEFT: The Hook --- */}
            <div className="p-12 md:p-24">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-red-600/10 border border-red-600/20 text-red-500 mb-10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Limited Prime Stock</span>
              </motion.div>

              <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.85] tracking-tighter mb-10">
                Secure Your <br /> 
                <span className="italic font-serif font-light text-red-600">Next Cut</span> <br /> 
                Today.
              </h2>

              <p className="text-stone-400 text-lg mb-14 max-w-sm leading-relaxed font-medium">
                Whether you're stocking your home freezer or sourcing for a five-star kitchen, our masters are ready to prep your order.
              </p>

              <div className="flex flex-wrap gap-5">
                <a 
                  href="/shop" 
                  className="group flex items-center gap-4 bg-white text-stone-950 px-10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-red-600 hover:text-white shadow-2xl"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Reserve Inventory
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </a>
                
                <a 
                  href="/contact" 
                  className="flex items-center gap-4 bg-stone-900 text-white border border-stone-800 px-10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-stone-800 transition-all"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Custom Orders
                </a>
              </div>
            </div>

            {/* --- RIGHT: Visual Identity --- */}
            <div className="relative h-full min-h-[500px] hidden lg:flex items-center justify-center overflow-hidden">
              {/* Abstract Meat-Safe/Vault Door Visual */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative z-20 w-[450px] h-[450px] border border-white/5 rounded-full flex items-center justify-center"
              >
                <div className="absolute inset-0 border border-red-600/20 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="w-80 h-80 bg-gradient-to-br from-stone-900 to-black rounded-full flex flex-col items-center justify-center border border-white/10 shadow-[0_0_100px_rgba(220,38,38,0.15)]">
                    <p className="text-[60px] font-black text-white leading-none mb-2">98.5%</p>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.5em]">Freshness Score</p>
                </div>
                
                {/* Floating Tags */}
                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute top-10 right-0 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl"
                >
                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Current Aging</p>
                    <p className="text-xl font-black text-white">21 Days Dry</p>
                </motion.div>
              </motion.div>

              {/* Red Backglow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 blur-[120px] rounded-full" />
            </div>

          </div>
        </div>

        {/* --- Footer Details --- */}
        <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-12 px-6">
           <div className="flex items-center gap-5 group cursor-pointer">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 text-stone-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all duration-500">
                <MapPinIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Our Butchery Hub</p>
                <p className="font-bold text-stone-900 dark:text-white">Industrial Area, Block G-12</p>
              </div>
           </div>

           <div className="flex items-center gap-5 group cursor-pointer">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 text-stone-400 group-hover:bg-red-50 dark:group-hover:bg-red-950/30 group-hover:text-red-600 transition-all duration-500">
                <CalendarDaysIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest mb-1">Pre-Order Schedule</p>
                <p className="font-bold text-stone-900 dark:text-white">Catalog Updated Every 6 AM</p>
              </div>
           </div>

           <div className="hidden lg:block text-right">
              <p className="text-stone-300 dark:text-stone-700 font-serif italic text-2xl tracking-tighter leading-tight">
                Crafting the standard <br /> for Kenyan kitchens.
              </p>
           </div>
        </div>
      </div>
    </section>
  );
}

export default ButcheryCTA;