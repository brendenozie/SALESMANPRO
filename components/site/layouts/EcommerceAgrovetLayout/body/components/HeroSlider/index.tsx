'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  SunIcon, 
  ArrowUpRightIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

// Fallback data aligned with the new Prisma Banner model
const sampleSlides = [
  {
    id: "fallback-1",
    type: "Hero",
    category: "Crop Science",
    headline: "High-Yield $ Hybrids",
    subline: "Engineered for drought resistance and 30% higher harvest weight in diverse climates.",
    imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1500&q=80",
    ctaText: "Shop Hybrids",
    ctaLink: "/store/seeds",
    price: "2,400",
    badgeText: "Fertilizer Grade A",
    stats: { yield: "+32%", water: "-15%" },
    backgroundColor: "#10b981", // emerald-500
    textColor: "#022c22" // emerald-950
  },
  {
    id: "fallback-2",
    type: "Hero",
    category: "Animal Health",
    headline: "Elite $ Nutrition",
    subline: "Vet-formulated supplements to boost immunity and milk production in dairy herds.",
    imageUrl: "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=1500&q=80",
    ctaText: "View Supplements",
    ctaLink: "/store/livestock",
    price: "1,850",
    badgeText: "Dairy Booster",
    stats: { growth: "+20%", health: "100%" },
    backgroundColor: "#f59e0b", // amber-500
    textColor: "#451a03" // amber-950
  }
];

export default function RethoughtAgrovetHero({ heroSlides = [], themeSettings }: { heroSlides: any; themeSettings: any }) {
  const [index, setIndex] = useState(0);
  const slides = heroSlides.length > 0 ? heroSlides : sampleSlides;
  
  // Safely grab the current slide to make render logic cleaner
  const currentSlide = slides[index];

  // Theme settings with fallbacks
  const themePrimary = themeSettings?.primaryColor || currentSlide.backgroundColor || '#10b981';
  const themeSecondary = themeSettings?.secondaryColor || currentSlide.textColor || '#022c22';

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 10000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-screen min-h-[750px] bg-[#0a0a0a] text-white overflow-hidden font-sans">
      
      {/* 1. THE DYNAMIC BACKGROUND DUALITY */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {currentSlide.imageUrl && (
            <Image 
              src={currentSlide.imageUrl} 
              alt={currentSlide.headline || "Agrovet"} 
              fill 
              priority
              className="object-cover opacity-60 grayscale-[15%]"
              loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent" />
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
        
        {/* Dynamically display price and badgeText from the Banner model */}
        {(currentSlide.price || currentSlide.badgeText) && (
          <div 
            className="p-6 rounded-3xl shadow-2xl transition-colors duration-500"
            style={{ backgroundColor: themePrimary, color: themeSecondary }}
          >
            <p className="text-[10px] font-black uppercase mb-4 tracking-widest opacity-80">Market Price Index</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs font-bold opacity-90">{currentSlide.badgeText || "Featured Item"}</p>
                <p className="text-xl font-black">
                  KES {currentSlide.price || "N/A"}
                </p>
              </div>
              <ArrowUpRightIcon className="w-6 h-6 opacity-80" />
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN CONTENT CARDS */}
      <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <motion.div
            key={`content-${index}`}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[2px] w-12 transition-colors duration-500" style={{ backgroundColor: themePrimary }} />
              <span 
                className="font-black text-sm uppercase tracking-[0.4em] transition-colors duration-500"
                style={{ color: themePrimary }}
              >
                {currentSlide.type || currentSlide.category || "Promotional"}
              </span>
            </div>

            <h1 className="text-7xl md:text-[6.5rem] font-black leading-[0.85] tracking-tighter mb-8">
              {/* Handles the '$' delimiter logic safely */}
              {(currentSlide.headline || "Welcome to Store").split('$').map((word: string, i: number) => (
                <span key={i} className={i === 1 ? "text-transparent stroke-white" : ""}>
                  {word}
                  {i === 1 && <style jsx>{`.stroke-white { -webkit-text-stroke: 1px white; }`}</style>}
                </span>
              ))}
            </h1>

            <p className="text-xl text-white/70 max-w-lg mb-12 font-medium leading-relaxed">
              {currentSlide.subline || currentSlide.desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <Link href={currentSlide.ctaLink || "#"} passHref>
                <button 
                  className="group relative px-10 py-5 rounded-full font-black transition-all flex items-center gap-4 overflow-hidden"
                  style={{ backgroundColor: themePrimary, color: themeSecondary }}
                >
                  <span className="relative z-10 uppercase tracking-tighter">
                    {currentSlide.ctaText || "Enter Store"}
                  </span>
                  <PlusIcon className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform" />
                  <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                </button>
              </Link>

              {/* Dynamic Stats Rendering safely mapped from Prisma Json type */}
              {currentSlide.stats && typeof currentSlide.stats === 'object' && Object.keys(currentSlide.stats).length > 0 && (
                <div className="flex gap-8 border-l border-white/20 pl-8">
                  {Object.entries(currentSlide.stats).slice(0, 2).map(([key, value], i) => (
                    <div key={key}>
                      <p 
                        className="text-2xl font-black transition-colors duration-500"
                        style={{ color: themePrimary }}
                      >
                        {String(value ?? 'N/A')}
                      </p>
                      <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest mt-1">
                        {key === 'yield' && 'Yield Rate'}
                        {key === 'water' && 'Water Usage'}
                        {key === 'growth' && 'Growth Rate'}
                        {key === 'health' && 'Health Optimization'}
                        {key === 'customers' && 'Active Farmers'}
                        {key === 'countries' && 'Counties Served'}
                        {!['yield', 'water', 'growth', 'health', 'customers', 'countries'].includes(key) && key}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. THE AUTHENTICITY BADGE (Floating Footer) */}
      <div className="absolute bottom-12 left-12 z-20 flex items-center gap-4 hidden md:flex">
        <div className="flex -space-x-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0a0a0a] bg-slate-800 overflow-hidden">
              <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="Farmer Profile" className="object-cover" />
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-1 transition-colors duration-500" style={{ color: themePrimary }}>
            <CheckBadgeIcon className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase">KEBS Certified Products</span>
          </div>
          <p className="text-xs font-bold text-white/50">Joined by 12,000+ Kenyan Farmers</p>
        </div>
      </div>

      {/* Navigation Progress Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-12 right-12 flex items-center gap-4 z-20">
          {slides.map((_: any, i: number) => (
            <button 
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 transition-all duration-700 rounded-full cursor-pointer hover:bg-white/40 ${
                index === i ? 'w-12' : 'w-4 bg-white/20'
              }`}
              style={{ backgroundColor: index === i ? themePrimary : undefined }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}