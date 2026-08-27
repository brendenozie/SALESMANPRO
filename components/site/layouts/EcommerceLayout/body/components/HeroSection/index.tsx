'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ArrowUpRightIcon, 
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const heroItems = {
  main: {
    label: 'Economy',
    title: 'Exploring the Intricacies of Markets, Money, and Global Economies',
    description: 'An in-depth analysis of how shifting fiscal policies are reshaping the 2026 global landscape.',
    img: 'https://images.unsplash.com/photo-1611974714851-482061394735?q=80&w=2070&auto=format&fit=crop',
  },
  side: [
    {
      label: 'Style',
      title: 'A Journey Through Colors, Textures, and Modern Trends',
      img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    },
    {
      label: 'Art',
      title: 'Inspiring Creativity and Fostering Expression',
      img: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=1972&auto=format&fit=crop',
    },
  ],
};

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 bg-white dark:bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Editorial Header */}
        <div className="flex flex-col items-center mb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 mb-6"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Edition 2026</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.85]"
          >
            NEWS<span className="italic font-serif font-light text-slate-300 dark:text-gray-700">24</span>
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feature */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-8 group relative aspect-[16/10] lg:aspect-auto lg:h-[600px] rounded-[2.5rem] overflow-hidden bg-slate-100 dark:bg-gray-900 shadow-2xl"
          >
            <img 
              src={heroItems.main.img} 
              alt={heroItems.main.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-white">
                  {heroItems.main.label}
                </span>
                <div className="flex items-center gap-1.5 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>March 2026</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4 max-w-2xl">
                {heroItems.main.title}
              </h2>
              <p className="text-white/60 text-sm md:text-base max-w-lg font-medium leading-relaxed hidden md:block">
                {heroItems.main.description}
              </p>
            </div>
            
            <button className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
              <ArrowUpRightIcon className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Side Stack */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {heroItems.side.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="group relative flex-1 min-h-[250px] rounded-[2.5rem] overflow-hidden shadow-xl"
              >
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                      {item.label}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight leading-tight group-hover:translate-x-1 transition-transform">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}