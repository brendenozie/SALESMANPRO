'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  ArrowRightIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { FireIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

const meatSlides = [
  {
    category: "Prime Reserve",
    title: "Black $ Angus",
    desc: "Grain-finished and hand-selected for intense marbling. A masterclass in texture and flavor, delivered from ranch to table.",
    img: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=1500&q=80",
    stats: { marble: "MBS 7+", aging: "21 Days" }
  },
  {
    category: "The Cellar",
    title: "Bone-In $ Ribeye",
    desc: "Aged to perfection with the bone in for maximum flavor. Each cut is a symphony of tenderness and rich, beefy depth.",
    img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1500&q=80",
    stats: { weight: "16 oz", age: "28 Days" }
   },
  {
    category: "The Vault",
    title: "Dry $ Aged",
    desc: "Our signature Himalayan salt-aged cuts. Patiently matured to develop a deep, nutty complexity that melts away.",
    img: "https://images.unsplash.com/photo-1602484281540-0239366fbd81?auto=format&fit=crop&w=1500&q=80",
    stats: { humidity: "85%", temp: "1.5°C" }
  },  
];

export default function PremiumButcheryHero({ heroSlides, themeSettings }: { heroSlides?: any; themeSettings?: any }) {
  const [index, setIndex] = useState(0);
  const slides = heroSlides?.length > 0 ? heroSlides : meatSlides;

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 10000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen min-h-[850px] bg-[#050505] text-white overflow-hidden selection:bg-red-600 selection:text-white">
      
      {/* 1. LAYERED BACKGROUND WITH DEPTH GAUSS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={slides[index] || slides[index]?.img || "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=1500&q=80"} 
            alt="Premium Cut" 
            fill 
            priority
            className="object-cover opacity-40 contrast-125 brightness-75"
            loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
          />
          {/* Brutalist Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_90%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
        </motion.div>
      </AnimatePresence>

      {/* 2. FLOATING MARKET INTELLIGENCE (RIGHT DOCK) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-12 z-30 hidden xl:flex flex-col gap-6">
        {[
          { icon: <FireIcon className="w-5 h-5 text-orange-500" />, label: "Demand", value: "High" },
          { icon: <GlobeAltIcon className="w-5 h-5 text-blue-400" />, label: "Trace", value: "Laikipia" },
          { icon: <BeakerIcon className="w-5 h-5 text-red-500" />, label: "Grade", value: "A1" }
        ].map((item, i) => (
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            key={i} 
            className="bg-white/5 backdrop-blur-3xl border border-white/10 p-5 rounded-3xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all cursor-crosshair"
          >
            {item.icon}
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">{item.label}</span>
            <span className="text-sm font-black text-white">{item.value}</span>
          </motion.div>
        ))}
      </div>

      {/* 3. CORE CONTENT AREA */}
      <div className="relative z-20 h-full container mx-auto px-8 flex flex-col justify-center">
        <div className="max-w-5xl">
          <motion.div
            key={`content-${index}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Category Badge */}
            <div className="flex items-center gap-4 mb-8">
              <span className="px-4 py-1.5 bg-red-600/10 border border-red-600/30 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">
                {slides[index].category}
              </span>
              <div className="h-px w-24 bg-gradient-to-r from-red-600 to-transparent" />
            </div>

            {/* Split Typography Title */}
            <h1 className="text-[6rem] md:text-[10rem] font-black leading-[0.75] tracking-tighter mb-12">
              {slides[index].title.split('$').map((word: string, i: number) => (
                <span key={i} className="block relative">
                  {i === 1 ? (
                    <span className="text-transparent italic font-serif font-light py-2" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}>
                      {word}
                    </span>
                  ) : word}
                </span>
              ))}
            </h1>

            <p className="text-xl md:text-2xl text-stone-400 max-w-xl mb-16 font-medium leading-tight">
              {slides[index].desc}
            </p>

            {/* CTA & Technical Stats */}
            <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
              <button className="group relative h-20 px-14 bg-red-600 hover:bg-white transition-all duration-500 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(220,38,38,0.2)]">
                <div className="relative z-10 flex items-center gap-4 text-white group-hover:text-black transition-colors duration-500">
                  <span className="text-xs font-black uppercase tracking-[0.3em]">Browse Selection</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo" />
              </button>

              <div className="flex gap-12 border-l border-white/10 pl-12">
                {Object.entries(slides[index].stats || {}).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-2">{key}</span>
                    <span className="text-4xl font-black text-white italic tracking-tighter">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. FOOTER TRUST & SOCIAL PROOF */}
      <div className="absolute bottom-12 left-12 right-12 z-30 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
        <div className="flex items-center gap-8">
          <div className="flex -space-x-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-16 h-16 rounded-2xl border-4 border-[#050505] bg-stone-900 overflow-hidden relative rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image src={`https://i.pravatar.cc/150?u=chef${i}`} alt="Partner" fill className="grayscale hover:grayscale-0 transition-all" loader={() => `https://i.pravatar.cc/150?u=chef${i}`} />
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center gap-2 text-white mb-1">
              <CheckBadgeIcon className="w-5 h-5 text-red-600" />
              <span className="text-xs font-black uppercase tracking-widest">Master Butcher Certified</span>
            </div>
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Supply Chain Verified by KEPHIS & HALAAL</p>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="flex flex-col items-end gap-3 min-w-[200px]">
          <div className="flex gap-3">
             {slides.map((_: any, i: number) => (
                <button 
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`group relative h-1 transition-all duration-700 rounded-full overflow-hidden ${index === i ? 'w-24 bg-white/20' : 'w-8 bg-white/5'}`}
                >
                  {index === i && (
                    <motion.div 
                      layoutId="activeBar"
                      className="absolute inset-0 bg-red-600"
                      initial={{ x: '-100%' }}
                      animate={{ x: '0%' }}
                      transition={{ duration: 10, ease: "linear" }}
                    />
                  )}
                </button>
             ))}
          </div>
          <span className="text-[9px] font-black text-stone-600 uppercase tracking-[0.5em]">Inventory Sync Active</span>
        </div>
      </div>

    </section>
  );
}