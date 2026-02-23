'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  MapPinIcon, 
  PhoneIcon,
  ShoppingBagIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

function AgroCTA() {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-white">
      {/* The "Field" Container */}
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-[#064e3b] rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(6,78,59,0.3)]">
          
          {/* Subtle Abstract Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center">
            
            {/* --- LEFT: Text Content --- */}
            <div className="p-12 md:p-20">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for Harvest?</span>
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-black text-white leading-[0.95] tracking-tighter mb-8">
                Your Farm’s <br /> 
                <span className="italic font-serif font-light text-emerald-400">Next Chapter</span> <br /> 
                Starts Here.
              </h2>

              <p className="text-emerald-100/70 text-lg mb-12 max-w-md leading-relaxed font-medium">
                Whether you’re stocking up for the season or need expert veterinary advice, we’re ready to grow with you.
              </p>

              <div className="flex flex-wrap gap-4">
                <a 
                  href="/shop" 
                  className="group flex items-center gap-3 bg-white text-emerald-900 px-8 py-5 rounded-2xl font-black transition-all hover:bg-emerald-400 hover:text-emerald-950 shadow-xl"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  Start Shopping
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a 
                  href="/contact" 
                  className="flex items-center gap-3 bg-emerald-800/50 text-white border border-emerald-700 px-8 py-5 rounded-2xl font-black hover:bg-emerald-800 transition-all"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Talk to a Specialist
                </a>
              </div>
            </div>

            {/* --- RIGHT: Visual/App Teaser --- */}
            <div className="relative h-full min-h-[400px] flex items-center justify-center lg:justify-end pr-0 lg:pr-20">
              {/* Floating Image Logic */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                className="relative z-20 w-64 md:w-80 aspect-[9/19] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden"
              >
                {/* Mock UI for Mobile App */}
                <div className="p-6 text-white pt-12">
                  <div className="h-1 w-12 bg-slate-700 mx-auto rounded-full mb-8" />
                  <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Account Balance</p>
                  <p className="text-2xl font-black mb-6">KSh 45,200.00</p>
                  <div className="space-y-3">
                    <div className="h-12 w-full bg-white/5 rounded-xl flex items-center px-4 gap-3">
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                        <div className="h-2 w-20 bg-slate-700 rounded-full" />
                    </div>
                    <div className="h-12 w-full bg-white/5 rounded-xl flex items-center px-4 gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <div className="h-2 w-32 bg-slate-700 rounded-full" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Backglow for Mobile */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full" />
            </div>

          </div>
        </div>

        {/* --- Trust Badge Footer --- */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 px-12">
           <div className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Visit our Hub</p>
                <p className="font-bold text-slate-900">Main Office, Agriculture House</p>
              </div>
           </div>

           <div className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 rounded-full bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <CloudArrowDownIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400">Inventory Sync</p>
                <p className="font-bold text-slate-900">Download Our Price Catalog</p>
              </div>
           </div>

           <div className="hidden lg:block">
              <p className="text-slate-300 font-serif italic text-xl">Join 5,000+ farmers nationwide.</p>
           </div>
        </div>
      </div>
    </section>
  );
}


export default AgroCTA;