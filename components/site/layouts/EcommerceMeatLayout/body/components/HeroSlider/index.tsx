'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPinIcon,
  SunIcon,
  CloudIcon,
  ArrowLongRightIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';

const farmChapters = [
  {
    tag: "The Origin",
    badgeText: "The Origin",
    headline: "Tuyia $ Highlandss",
    subline: "Nestled in the lush valleys of Laikipia, where the air is crisp and the pastures are endless. This is where the story begins.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000",
    productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    stats: { elevation: "2,100m", rainfall: "950mm" },
    ctaText: "Explore the Harvest",
    ctaLink: "/shop",
  },
  {
    tag: "The Ethics",
    badgeText: "The Ethics",
    headline: "Pasture $ Raised",
    subline: "Our livestock roams free, grazing on organic clover and Kikuyu grass. No shortcuts, no hormones—just nature's pace.",
    image: "https://images.unsplash.com/photo-1544965838-54ef8406f868?auto=format&fit=crop&q=80&w=2000",
    imageUrl: "https://images.unsplash.com/photo-1544965838-54ef8406f868?auto=format&fit=crop&q=80&w=2000",
    productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    stats: { roaming: "Free", diet: "100% Grass" },
    ctaText: "Explore the Harvest",
    ctaLink: "/meatecommerce/products",
  },
  {
    tag: "The Craft",
    badgeText: "The Craft",
    headline: "Master $ Butchery",
    subline: "Every cut is hand-selected and dry-aged in our Himalayan salt cellar for unparalleled depth of flavor.",
    image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    imageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    productImageUrl: "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=2000",
    stats: { aging: "28 Days", grade: "Premium" },
    ctaText: "Explore the Harvest",
    ctaLink: "/meatecommerce/products",
  },
];

export default function TuyiaFarmImmersiveHero({ heroSlides = [] , themeSettings }:any) {
  const [active, setActive] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Safety: Ensure slides is always an array with at least one valid object
  const slides = (heroSlides && heroSlides.length > 0) ? heroSlides : farmChapters;
  const currentSlide = slides[active] || farmChapters[0];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Parallax logic
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 15,
      y: (e.clientY / window.innerHeight - 0.5) * 15,
    });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#080807] overflow-hidden flex flex-col justify-end lg:justify-center"
    >
      {/* BACKGROUND TYPOGRAPHY - Added defensive check */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10">
        <motion.h1 
          animate={{ x: mousePos.x * -0.5, y: mousePos.y * -0.5 }}
          className="text-[40vw] font-black text-white/[0.02] uppercase leading-none tracking-tighter"
        >
          {currentSlide?.headline?.split('$')[0] || "Pristine"}
        </motion.h1>
      </div>

      {/* DYNAMIC IMAGE CANVAS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.6, scale: 1.02, x: mousePos.x, y: mousePos.y }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image 
            src={currentSlide?.image || currentSlide?.productImageUrl || currentSlide?.imageUrl || farmChapters[0].image} 
            alt={currentSlide?.headline || "Hero Image"}
            loader={({ src }) => src} // Bypass loader for external URLs
            fill 
            className="object-cover"
            priority
            unoptimized // Bypasses production remotePattern errors if not configured
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-transparent to-[#080807]/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-30 container mx-auto px-6 lg:px-12 pb-20 lg:pb-0">
        <div className="max-w-5xl">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none p-8 lg:p-0 rounded-[2rem]"
          >
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-6">
               <div className="h-[2px] w-10 bg-red-600" />
               <span className="text-red-500 text-[10px] lg:text-xs font-black uppercase tracking-[0.4em]">
                 {currentSlide?.tag || currentSlide?.badgeText || 'Exclusive'}
               </span>
            </div>

            {/* Headline - CRASH FIXED with safe chaining and fallbacks */}
            <h2 className="text-[12vw] lg:text-[8rem] font-black text-white leading-[0.85] tracking-tighter mb-8 uppercase">
              {(currentSlide?.headline || "Pasture $ Raised").split('$').map((word, i) => (
                <span key={i} className="block overflow-hidden">
                  <motion.span 
                    initial={{ y: "100%" }} animate={{ y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className={`block ${i === 1 ? "text-transparent italic font-serif" : ""}`}
                    style={i === 1 ? { WebkitTextStroke: '1px rgba(255,255,255,0.4)' } : {}}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h2>

            <p className="text-stone-300 text-lg lg:text-2xl max-w-xl mb-12 font-medium leading-relaxed opacity-80">
              {currentSlide?.subline || `Every cut is hand-selected and dry-aged in our Himalayan salt cellar for unparalleled depth of flavor.`}
            </p>

            {/* Stats - defensive mapping */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start lg:items-center">
              <button className="group relative w-full lg:w-auto flex items-center justify-center gap-6 bg-white px-10 py-6 rounded-full overflow-hidden transition-all active:scale-95">
                  <span className="relative z-10 text-black font-black text-xs uppercase tracking-widest">Explore More</span>
                  <ArrowLongRightIcon className="relative z-10 w-6 h-6 text-black group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-red-600 translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500" />
              </button>

              <div className="flex gap-12 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-16 w-full lg:w-auto">
                {Object.entries(currentSlide?.stats || {elevation: "2,100m", rainfall: "950mm" }).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">{key}</span>
                    <span className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-12 lg:left-12 lg:top-1/2 lg:-translate-y-1/2 z-50 flex lg:flex-col gap-4 w-full lg:w-auto justify-center px-6">
        {slides.map((_, i) => (
          <button 
            key={i}
            onClick={() => setActive(i)}
            className="group flex items-center gap-3"
          >
            <div className={`transition-all duration-500 rounded-full ${active === i ? 'w-12 lg:w-16 h-[2px] bg-red-600' : 'w-4 h-[2px] bg-white/20'}`} />
          </button>
        ))}
      </div>
    </section>
  );
}