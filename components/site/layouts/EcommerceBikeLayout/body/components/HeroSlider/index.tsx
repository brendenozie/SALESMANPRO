'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, BoltIcon, Square3Stack3DIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

const imageLoader = ({ src }: { src: string }) => src;
const autoAdvanceDelay = 7500;

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? '12%' : '-12%',
    scale: 0.96,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 70, damping: 15 },
      opacity: { duration: 0.5, ease: 'easeOut' },
      scale: { duration: 0.6, ease: 'easeOut' }
    }
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? '12%' : '-12%',
    scale: 0.96,
    transition: {
      x: { duration: 0.4, ease: 'easeIn' },
      opacity: { duration: 0.35 },
      scale: { duration: 0.4 }
    }
  })
};

const watermarkVariants = {
  enter: { opacity: 0, scale: 0.85, x: '-45%' },
  center: { 
    opacity: 0.04, 
    scale: 1, 
    x: '-50%',
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.4 } }
};

export default function PerformanceHeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const primaryColor = themeSettings?.primaryColor || '#FF6B00';
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackSlides: HeroSlide[] = useMemo(() => [
    {
      id: 'default-1',
      badgeText: 'New Arrival',
      headline: 'MAMMOTH MOUNTING PONICS',
      subline: 'The peak of electric performance. Engineered for those who refuse to compromise on power, style, and range.',
      ctaText: 'Explore Series',
      ctaLink: '/bikeecommerce/products',
      imageUrl: 'https://i.ibb.co/v4m8YmP/orange-bike.png',
      productImageUrl: 'https://i.ibb.co/v4m8YmP/orange-bike.png',
      price: '€2,499',
      companyId: '', endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null, priceBefore: null
    },
    {
      id: 'default-2',
      badgeText: 'Limited Edition',
      headline: 'STEALTH CARBON ORE',
      subline: 'Ultra-lightweight frame chassis integrated with advanced telemetry and a smart powertrain control systems.',
      ctaText: 'Pre-Order Now',
      ctaLink: '/bikeecommerce/products?filter=stealth',
      imageUrl: 'https://i.ibb.co/v4m8YmP/orange-bike.png',
      productImageUrl: 'https://i.ibb.co/v4m8YmP/orange-bike.png',
      price: '€3,150',
      companyId: '', endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null, priceBefore: null
    }
  ], []);

  const slides = useMemo(() => {
    return heroSlides && heroSlides.length > 0 ? heroSlides : fallbackSlides;
  }, [heroSlides, fallbackSlides]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleGoTo = (idx: number) => {
    if (idx === current) return;
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    timerRef.current = setInterval(handleNext, autoAdvanceDelay);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleNext, isHovered, slides.length]);

  const activeSlide = slides[current];
  const headlineWords = activeSlide?.headline?.split(' ') || [];

  return (
    <section 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-[100svh] lg:h-screen flex items-center overflow-hidden bg-[#EFEFEF] select-none font-sans"
    >
      {/* BACKGROUND TEXT WATERMARK AND RADIAL AMBIENT GLOW */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 transition-all duration-1000 ease-in-out" 
          style={{ background: `radial-gradient(circle at 75% 50%, ${primaryColor}20 0%, transparent 60%)` }} 
        />
        <AnimatePresence initial={false} custom={direction}>
          <motion.h2 
            key={`watermark-${activeSlide.id}`}
            variants={watermarkVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute top-1/2 left-1/2 -translate-y-1/2 text-[24vw] font-black italic text-stone-900/[0.04] uppercase tracking-tighter shrink-0 whitespace-nowrap"
          >
            {headlineWords[0]}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-12 items-center w-full h-full pt-20 pb-32 lg:py-0">
        
        {/* TEXT CONTENT COLUMN */}
        <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 md:space-y-8 max-w-xl mx-auto lg:mx-0"
            >
              <div className="flex items-center justify-center lg:justify-start gap-3.5">
                <span className="h-[2px] w-6 bg-stone-400" />
                <span className="text-xs font-black tracking-[0.35em] uppercase text-stone-500">
                  {activeSlide.badgeText || "Edition 2026"}
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-stone-900 leading-[0.9] tracking-tighter uppercase italic flex flex-col">
                {headlineWords.map((word, i) => (
                  <span 
                    key={i} 
                    className={i === 0 ? "block" : "block text-transparent"}
                    style={i !== 0 ? { WebkitTextStroke: '1.5px #1c1917' } : {}}
                  >
                    {word}
                  </span>
                ))}
              </h1>
              
              <p className="text-stone-600 text-sm sm:text-base md:text-lg max-w-md mx-auto lg:ml-0 leading-relaxed font-normal">
                {activeSlide.subline}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4">
                <Link
                  href={activeSlide.ctaLink || '/shop'}
                  className="w-full sm:w-auto group relative overflow-hidden px-10 py-5 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest transition-transform active:scale-[0.98] rounded-none shadow-xl"
                >
                  <span className="relative z-10 block transition-transform duration-300 group-hover:translate-x-1">{activeSlide.ctaText}</span>
                  <div 
                    className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" 
                    style={{ backgroundColor: primaryColor }}
                  />
                </Link>
                
                {activeSlide.price && (
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="h-10 w-[1px] bg-stone-300 hidden sm:block" />
                    <div className="text-left">
                      <p className="text-2xl font-black text-stone-900 tracking-tight">{activeSlide.price}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-stone-400 mt-0.5">MSRP Base Value</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* HERO PRODUCT ART WORKCASE */}
        <div className="lg:col-span-7 order-1 lg:order-2 relative w-full h-[55vw] sm:h-[400px] lg:h-[75vh] flex items-center justify-center min-h-[280px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`img-${activeSlide.id}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative w-full h-full max-w-[320px] sm:max-w-[500px] lg:max-w-none flex items-center justify-center"
            >
              {/* ACCENT AMBIENT CHASSIS CORE LIGHT GLOW */}
              <div 
                className="absolute inset-0 -z-10 blur-[100px] opacity-25 rounded-full scale-75 transition-all duration-1000 translate-y-4"
                style={{ backgroundColor: primaryColor }} 
              />
              
              <div className="relative w-full h-full">
                <Image decoding="async"
                  src={activeSlide.imageUrl || activeSlide.productImageUrl || ''}
                  alt={activeSlide.headline || 'Product Frame Engine Show'}
                  fill
                  className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.18)]"
                  priority
                />
              </div>

              {/* TELEMETRY PERFORMANCE FLOATING CHIP */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ delay: 0.45, type: 'spring', stiffness: 90 }}
                className="absolute top-[12%] right-[2%] md:right-[10%] lg:right-[4%] p-4 bg-white/90 backdrop-blur-xl border border-white border-b-stone-200/80 shadow-xl rounded-2xl hidden sm:flex items-center gap-3.5 text-left"
              >
                <div className="p-2.5 rounded-xl text-white shadow-md shadow-stone-950/10" style={{ backgroundColor: primaryColor }}>
                  <BoltIcon className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black text-stone-400 tracking-wider">Peak Torq</p>
                  <p className="text-sm font-extrabold text-stone-800">85Nm Powertrain</p>
                </div>
              </motion.div>

              {/* FRAME PROFILE FLOATING CHIP */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                transition={{ delay: 0.55, type: 'spring', stiffness: 90 }}
                className="absolute bottom-[8%] left-0 md:left-[8%] lg:left-0 p-4 bg-white/90 backdrop-blur-xl border border-white border-b-stone-200/80 shadow-xl rounded-2xl hidden sm:flex items-center gap-3.5 text-left"
              >
                <div className="p-2.5 rounded-xl bg-stone-900 text-white shadow-md shadow-stone-950/10">
                  <Square3Stack3DIcon className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <p className="text-[9px] uppercase font-black text-stone-400 tracking-wider">Chassis Structure</p>
                  <p className="text-sm font-extrabold text-stone-800">Grade-5 Carbon</p>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* MODERN GLASS CONTROL HUD CONSOLE */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:right-12 lg:translate-x-0 z-30">
          <div className="flex items-center gap-6 bg-white/70 backdrop-blur-md p-1.5 pl-6 pr-1.5 rounded-full border border-white/60 shadow-lg shadow-stone-900/5">
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleGoTo(i)}
                  className="h-1.5 rounded-full transition-all duration-500 focus:outline-none"
                  style={{ 
                    width: i === current ? '28px' : '6px', 
                    backgroundColor: i === current ? '#1c1917' : '#cbd5e1' 
                  }}
                  aria-label={`Jump to presentation deck page index 0${i + 1}`}
                />
              ))}
            </div>
            <div className="flex gap-0.5">
              <button 
                onClick={handlePrev} 
                className="p-3 bg-stone-900/5 hover:bg-stone-900 hover:text-white rounded-full transition-colors active:scale-95 focus:outline-none"
                aria-label="Previous slider slide panel view"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNext} 
                className="p-3 bg-stone-900/5 hover:bg-stone-900 hover:text-white rounded-full transition-colors active:scale-95 focus:outline-none"
                aria-label="Next slider slide panel view"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}