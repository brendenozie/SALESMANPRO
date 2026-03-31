'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  MapPinIcon, 
  SunIcon, 
  ArrowUpRightIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';

const sampleSlides = [
  {
    category: "Crop Science",
    title: "High-Yield $ Hybrids",
    desc: "Engineered for drought resistance and 30% higher harvest weight in diverse climates.",
    img: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1500&q=80",
    stats: { yield: "+32%", water: "-15%" }
  },
  {
    category: "Animal Health",
    title: "Elite $ Nutrition",
    desc: "Vet-formulated supplements to boost immunity and milk production in dairy herds.",
    img: "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=1500&q=80",
    stats: { growth: "+20%", health: "100%" }
  }
];

export default function RethoughtAgrovetHero({heroSlides, themeSettings }: { heroSlides:any; themeSettings:any }) {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState(heroSlides.length > 0 ? heroSlides : sampleSlides);
  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };


  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 10000);
    return () => clearInterval(timer);
  }, []);


  return (
    <section className="relative h-screen min-h-[750px] bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* 1. THE DYNAMIC BACKGROUND DUALITY */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={slides[index].img} 
            alt="Agrovet" 
            fill 
            className="object-cover opacity-60 grayscale-[20%]"
            loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* 2. THE UTILITY SIDEBAR (Market & Weather) */}
      <div className="absolute top-32 right-8 z-20 hidden xl:flex flex-col gap-4 w-64">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <SunIcon className="w-6 h-6 text-yellow-400" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">Local Forecast</span>
          </div>
          <p className="text-3xl font-black mb-1">28°C</p>
          <p className="text-sm opacity-80">Optimal for planting Maize</p>
        </div>
        
        <div className="bg-emerald-500 p-6 rounded-3xl text-emerald-950 shadow-2xl">
          <p className="text-[10px] font-black uppercase mb-4 tracking-widest">Market Price Index</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-bold">Fertilizer Grade A</p>
              <p className="text-xl font-black">KSH 2,400</p>
            </div>
            <ArrowUpRightIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT CARDS */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <motion.div
            key={`content-${index}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[2px] w-12 bg-emerald-500" />
              <span className="text-emerald-500 font-black text-sm uppercase tracking-[0.4em]">
                {slides[index].category}
              </span>
            </div>

            <h1 className="text-7xl md:text-[6.5rem] font-black leading-[0.85] tracking-tighter mb-8">
              {(slides[index].title || slides[index].headline).split('$').map((word: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ReactFragment | React.ReactPortal | null | undefined, i: React.Key | null | undefined) => (
                <span key={i} className={i === 1 ? "text-transparent stroke-white" : ""}>
                  {word}
                  {i === 1 && <style jsx>{`.stroke-white { -webkit-text-stroke: 1px white; }`}</style>}
                </span>
              ))}
            </h1>

            <p className="text-xl text-white/70 max-w-lg mb-12 font-medium leading-relaxed">
              {slides[index].desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <button className="group relative bg-emerald-500 hover:bg-white text-emerald-950 px-10 py-5 rounded-full font-black transition-all flex items-center gap-4 overflow-hidden">
                <span className="relative z-10 uppercase tracking-tighter">Enter Store</span>
                <PlusIcon className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform" />
                <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </button>

              <div className="flex gap-8 border-l border-white/20 pl-8">
                <div>
                  <p className="text-2xl font-black text-emerald-400">{String(Object.values(slides[index].stats)[0] || 'N/A')}</p>
                  <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">{String(Object.keys(slides[index].stats)[0])} Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">{String(Object.values(slides[index].stats)[1] || 'N/A')}</p>
                  <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest">{String(Object.keys(slides[index].stats)[1])} Optimization</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. THE AUTHENTICITY BADGE (Floating Footer) */}
      <div className="absolute bottom-12 left-12 z-20 flex items-center gap-4">
        <div className="flex -space-x-3">
          {[1,2,3].map(i => (
            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0a0a0a] bg-slate-800 overflow-hidden">
              <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Farmer" />
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-1 text-emerald-500">
            <CheckBadgeIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase">Government Certified</span>
          </div>
          <p className="text-xs font-bold text-white/50">Joined by 12,000+ Kenyan Farmers</p>
        </div>
      </div>

      {/* Navigation Progress */}
      <div className="absolute bottom-12 right-12 flex items-center gap-4">
        {slides.map((_: any, i: React.Key | null | undefined) => (
          <div 
            key={i} 
            className={`h-1 transition-all duration-700 rounded-full ${index === i ? 'w-24 bg-emerald-500' : 'w-4 bg-white/20'}`} 
          />
        ))}
      </div>
    </section>
  );
}