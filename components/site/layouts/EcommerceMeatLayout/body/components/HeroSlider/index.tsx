'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightIcon,
  MapPinIcon,
  SunIcon,
  CloudIcon,
  ArrowLongRightIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

const farmChapters = [
  {
    tag: "The Origin",
    title: "Tuyia $ Highlands",
    description: "Nestled in the lush valleys of Laikipia, where the air is crisp and the pastures are endless. This is where the story of quality begins.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
    stats: { elevation: "2,100m", rainfall: "950mm" }
  },
  {
    tag: "The Ethics",
    title: "Pasture $ Raised",
    description: "Our livestock roams free, grazing on organic clover and Kikuyu grass. No shortcuts, no hormones—just nature's pace.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
    stats: { roaming: "Free", diet: "100% Grass" }
  },
  {
    tag: "The Craft",
    title: "Master $ Butchery",
    description: "From our farm to your table. Every cut is hand-selected and dry-aged in our Himalayan salt cellar for unparalleled flavor.",
    image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&q=80&w=2000",
    stats: { aging: "28 Days", grade: "Premium" }
  },
];

export default function TuyiaFarmImmersiveHero({heroSlides, themeSettings}: {heroSlides: any[], themeSettings: any}) {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState(heroSlides.length > 0 ? heroSlides : farmChapters);

  useEffect(() => {
    const timer = setInterval(() => setActive((prev) => (prev + 1) % slides.length), 12000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full bg-[#080807] overflow-hidden selection:bg-red-500 selection:text-black py-24 px-6">
      
      {/* 1. LAYERED BACKGROUND TYPOGRAPHY (The 'Tuyia' Soul) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.05 }}
          className="text-[40vw] font-black text-white uppercase leading-none tracking-tighter"
        >
          Tuyia
        </motion.h1>
      </div>

      {/* 2. DYNAMIC BACKGROUND IMAGE CANVAS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.6, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={slides[active]?.imageUrl || slides[active]?.image || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000"} 
            alt="Farm Scenery" 
            fill 
            className="object-cover"
            priority
            loader={({ src }) => src}
          />
          {/* Cinematic Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-transparent to-[#080807]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080807] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* 3. FLOATING DASHBOARD (TOP RIGHT) */}
      <div className="absolute top-12 right-12 z-30 hidden lg:flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Farm Status</span>
          <span className="text-sm font-bold text-white uppercase tracking-tighter flex items-center gap-2">
            <SunIcon className="w-4 h-4 text-red-500" /> Optimal Conditions
          </span>
        </div>
        <div className="h-10 w-px bg-white/10" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Location</span>
          <span className="text-sm font-bold text-white uppercase tracking-tighter flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-red-500" /> Laikipia, Kenya
          </span>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <div className="relative z-20 h-full container mx-auto px-8 flex flex-col justify-center">
        <div className="max-w-4xl">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Tagline */}
            <div className="flex items-center gap-4 mb-6">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: 48 }}
                 className="h-[2px] bg-red-500"
               />
               <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.5em]">
                 {slides[active]?.tag || "Chapter " + (active + 1)}
               </span>
            </div>

            {/* Split Serif Title */}
            <h2 className="text-[6rem] md:text-[9rem] font-black text-white leading-[0.8] tracking-tighter mb-10">
              {slides[active]?.title?.split('$').map((word: string, i: number) => (
                <span key={i} className="block">
                  {i === 1 ? (
                    <span className="text-transparent italic font-serif font-light pr-4" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.6)' }}>
                      {word}
                    </span>
                  ) : word}
                </span>
              )) || "Tuyia Highlands"}
            </h2>

            <p className="text-xl md:text-2xl text-stone-400 max-w-xl mb-12 font-medium leading-snug">
              {slides[active]?.description || "Experience the essence of ethical farming and masterful butchery with Tuyia Farm. From our pastures to your plate, savor the story behind every cut."}
            </p>

            {/* Actions & Stats */}
            <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
              <button className="group relative flex items-center gap-6 bg-white px-10 py-6 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5">
                 <span className="relative z-10 text-black font-black text-xs uppercase tracking-widest">Explore the Farm</span>
                 <ArrowLongRightIcon className="relative z-10 w-6 h-6 text-black group-hover:translate-x-2 transition-transform" />
                 <div className="absolute inset-0 bg-red-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>

              <div className="flex gap-12 border-l border-white/10 pl-12">
                {Object.entries(slides[active]?.stats || {
                    elevation: "",
                    rainfall: "",
                    roaming: "",
                    diet: "",
                    aging: "",
                    grade: ""
                }).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">{key}</span>
                    <span className="text-3xl font-black text-white italic tracking-tighter">{typeof value === 'string' ? value : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 5. SIDEBAR NAVIGATION */}
      <div className="absolute left-12 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4">
        {slides.map((_, i) => (
          <button 
            key={i}
            onClick={() => setActive(i)}
            className="group flex items-center gap-4"
          >
            <div className={`h-[2px] transition-all duration-500 ${active === i ? 'w-12 bg-red-500' : 'w-4 bg-white/20 group-hover:bg-white/50'}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity duration-500 ${active === i ? 'opacity-100' : 'opacity-0'}`}>
              0{i + 1}
            </span>
          </button>
        ))}
      </div>

      {/* 6. BOTTOM TRUST BAR */}
      <div className="absolute bottom-6 left-12 right-12 z-30 flex flex-col md:flex-row justify-between items-end md:items-center gap-8 border-t border-white/5 pt-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
               <CloudIcon className="w-5 h-5 text-stone-500" />
             </div>
             <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-tight">
               Verified Organic <br /> <span className="text-white">Eco-System</span>
             </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-md">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             </div>
             <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest leading-tight">
               Live Harvest <br /> <span className="text-white">Traceability</span>
             </p>
          </div>
        </div>

        <div className="text-right">
           <p className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em]">Tuyia Farm Operating System v1.0</p>
        </div>
      </div>

    </section>
  );
}