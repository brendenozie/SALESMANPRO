'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 8000;

export default function HeroSlider({ heroSlides, themeSettings }: { heroSlides: HeroSlide[] | null; themeSettings: any }) {
  const primary = themeSettings?.primaryColor || '#D97706';
  const [current, setCurrent] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const heroSlidesToShow = (heroSlides?.length ? heroSlides : [{
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    headline: 'Experience Sweet Perfection',
    badgeText: 'Artisan Breads & Daily Delights',
    ctaText: 'Shop All Bakes',
    ctaLink: '/ecommerce/products',
  }]).map(slide => ({
    ...slide,
    headline: slide.headline || 'Experience Sweet Perfection',
    badgeText: slide.badgeText || 'Artisan Breads & Daily Delights',
  }));

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX / 60, y: clientY / 60 });
  };

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlidesToShow.length);
  }, [heroSlidesToShow.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative w-full h-[95vh] min-h-[700px] overflow-hidden bg-[#0a0a0a]"
    >
      {/* 1. INTERACTIVE DOODLES (Desktop Only Parallax) */}
      <div className="absolute inset-0 z-20 pointer-events-none hidden md:block">
        <motion.div animate={{ x: mousePos.x, y: mousePos.y }} className="absolute top-[12%] left-[5%] text-7xl opacity-20">🥨</motion.div>
        <motion.div animate={{ x: -mousePos.x * 1.5, y: -mousePos.y * 1.5 }} className="absolute top-[8%] right-[10%] text-8xl opacity-15 rotate-12">🥐</motion.div>
        <motion.div animate={{ x: mousePos.x * 2, y: -mousePos.y * 0.5 }} className="absolute bottom-[20%] left-[8%] text-6xl opacity-20 -rotate-12">🍰</motion.div>
        <motion.div animate={{ x: -mousePos.x, y: mousePos.y * 2 }} className="absolute bottom-[15%] right-[15%] text-7xl opacity-10">🌾</motion.div>
      </div>

      <AnimatePresence mode="wait">
        {heroSlidesToShow.map((slide, idx) => (
          idx === current && (
            <motion.div key={idx} className="absolute inset-0 w-full h-full">
              
              {/* 2. BACKGROUND: Cinematic Zoom */}
              <motion.div 
                initial={{ scale: 1.15 }}
                animate={{ scale: 1.05 }}
                transition={{ duration: 10, ease: "linear" }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={slide.imageUrl || ''}
                  alt="Bakery Hero"
                  fill
                  priority
                  className="object-cover brightness-[0.6] md:brightness-[0.7]"
                  loader={loader}
                />
              </motion.div>

              {/* 3. GRADIENTS (Mobile Focus & Desktop Vignette) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent md:bg-none" />
              <div className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />

              {/* 4. CONTENT GRID */}
              <div className="relative h-full container mx-auto px-6 md:px-24 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                
                {/* RESPONSIVE BADGE */}
                <motion.div 
                   initial={{ scale: 0.8, opacity: 0 }}
                   animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                   transition={{ 
                     scale: { repeat: Infinity, duration: 5, ease: "easeInOut" },
                     opacity: { duration: 0.5 }
                   }}
                   className="mb-8 md:mb-12 relative"
                >
                  <div className="w-32 h-32 md:w-44 md:h-44 border-[2px] border-amber-500/40 rounded-full flex flex-col items-center justify-center backdrop-blur-md bg-black/30 ring-4 ring-black/20">
                    <span className="text-[9px] md:text-[11px] tracking-[0.3em] font-bold text-amber-500 uppercase">Freshly</span>
                    <span className="text-xl md:text-3xl font-black tracking-tighter my-0.5 text-white">BAKED</span>
                    <span className="text-[9px] md:text-[11px] tracking-[0.3em] font-bold text-amber-500 uppercase">Daily!</span>
                    <div className="mt-2 bg-amber-500 text-black px-3 py-1 text-[8px] md:text-[10px] font-black rounded uppercase">Order Now</div>
                  </div>
                  <div className="absolute -top-2 -left-2 md:-top-4 md:-left-6 text-amber-400 text-2xl md:text-4xl animate-pulse">✦</div>
                </motion.div>

                {/* TYPOGRAPHY */}
                <div className="max-w-4xl overflow-hidden">
                  <motion.h1 
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-9xl font-bold mb-6 md:mb-8 leading-[1] tracking-tighter text-white"
                  >
                    {slide.headline}
                  </motion.h1>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className="text-lg md:text-2xl text-gray-300 font-light max-w-xl mb-10 md:mb-12 italic border-l-0 md:border-l-4 border-amber-500 md:pl-6"
                >
                  {slide.badgeText}
                </motion.p>

                {/* ACTIONS */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto"
                >
                  <Link
                    href={slide.ctaLink || '/ecommerce/products'}
                    className="px-10 py-4 md:px-14 md:py-5 bg-amber-600 text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-amber-500 shadow-xl text-center"
                    style={{ backgroundColor: primary }}
                  >
                    {slide.ctaText}
                  </Link>
                  <Link
                    href="/ecommerce/categories"
                    className="px-10 py-4 md:px-14 md:py-5 border border-white/30 text-white font-black uppercase tracking-widest text-xs transition-all hover:bg-white hover:text-black backdrop-blur-sm text-center"
                  >
                    Explore Menu
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* 5. SLIDE INDICATORS */}
      <div className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-30">
        {heroSlidesToShow.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrent(i)}
            className="group flex flex-col items-center gap-2"
          >
            <span className={`text-[10px] font-black transition-all ${current === i ? 'text-amber-500 scale-125' : 'text-white/20'}`}>
              0{i + 1}
            </span>
            <div className={`w-[2px] transition-all duration-500 ${current === i ? 'h-12 bg-amber-500' : 'h-6 bg-white/10'}`} />
          </button>
        ))}
      </div>
    </section>
  );
}