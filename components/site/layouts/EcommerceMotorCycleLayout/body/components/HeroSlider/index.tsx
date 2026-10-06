'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

const imageLoader = ({ src }: { src: string }) => src;
const autoAdvanceDelay = 8000;

const contentVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 40 : -40,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      x: { type: 'spring', stiffness: 90, damping: 16 },
      opacity: { duration: 0.45, ease: 'easeOut' },
    }
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction < 0 ? 40 : -40,
    transition: { duration: 0.35, ease: 'easeIn' }
  })
};

const productVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 0.92,
    rotate: direction > 0 ? 4 : -4,
    y: 15
  }),
  center: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 75,
      damping: 15,
      mass: 1.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -10,
    transition: { duration: 0.4, ease: 'easeIn' }
  }
};

const watermarkVariants = {
  enter: { opacity: 0, y: 30 },
  center: { opacity: 0.03, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4 } }
};

export default function MotoHero({ heroSlides, themeSettings }: HeroSliderProps) {
  const primaryColor = themeSettings?.primaryColor || '#E62E2E';
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackSlides: HeroSlide[] = useMemo(() => [
    {
      id: 'moto-1',
      badgeText: 'Next-Gen Performance',
      headline: 'APEX PREDATOR V.4',
      subline: '1200cc of pure adrenaline. Engineered for the fearless, built directly for dominant track performance.',
      ctaText: 'Pre-Order Now',
      ctaLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&w=1600&q=80',
      productImageUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&w=800&q=80',
      price: '$18,500',
      companyId: '', endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null, priceBefore: null
    },
    {
      id: 'moto-2',
      badgeText: 'Hyper Tuning Edition',
      headline: 'MONARCH STEALTH 12',
      subline: 'Lightweight titanium framework paired with immediate electric engine response mechanics.',
      ctaText: 'Configure Build',
      ctaLink: '/shop?filter=stealth',
      imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=80',
      productImageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      price: '$22,900',
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
      className="relative w-full min-h-[100svh] lg:h-screen flex items-center overflow-hidden bg-[#F6F6F6] select-none font-sans"
    >
      {/* 1. ASYMMETRIC BG SPLIT RUNNER */}
      <div className="absolute inset-0 z-0 flex pointer-events-none">
        <div className="w-full lg:w-7/12 h-full bg-white" />
        <div className="hidden lg:block w-5/12 h-full bg-[#EEEEEE]" />
      </div>

      {/* 2. OVERSIZED WATERMARK ENGINE */}
      <div className="absolute right-12 bottom-4 z-0 select-none hidden xl:block pointer-events-none">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.h2 
            key={`watermark-${activeSlide.id}`}
            variants={watermarkVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-[22rem] font-black leading-none text-stone-900 uppercase tracking-tighter"
          >
            {headlineWords[0]}
          </motion.h2>
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 h-full grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-8 items-center relative z-10 pt-24 pb-28 lg:py-0">
        
        {/* 3. CORE EDITORIAL COMPOSITION COLUMN */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeSlide.id}
              custom={direction}
              variants={contentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 md:space-y-8 max-w-xl mx-auto lg:mx-0"
            >
              <div className="flex items-center gap-3.5">
                <span className="h-[3px] w-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-400">
                  {activeSlide.badgeText || 'Next-Gen Performance'}
                </span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-stone-900 leading-[0.9] uppercase tracking-tighter flex flex-col">
                {headlineWords.map((word, i) => (
                  <span 
                    key={i} 
                    className={i === 1 ? "italic font-light tracking-tight" : "block"} 
                    style={i === 1 ? { color: primaryColor } : {}}
                  >
                    {word}
                  </span>
                ))}
              </h1>
              
              <p className="text-stone-500 text-sm sm:text-base md:text-lg max-w-sm leading-relaxed font-normal">
                {activeSlide.subline}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5 pt-2">
                <Link
                  href={activeSlide.ctaLink || '/shop'}
                  className="group relative px-10 py-5 bg-stone-900 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 border border-transparent hover:bg-stone-800 transition-all duration-300 shadow-xl shadow-stone-900/10"
                >
                  {activeSlide.ctaText}
                  <ArrowRightIcon className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform stroke-[2.5]" />
                </Link>
                
                <button className="flex items-center justify-center gap-3.5 group text-stone-900 font-black uppercase tracking-widest text-[10px] py-3 focus:outline-none">
                  <div className="w-11 h-11 rounded-full border border-stone-200 bg-white shadow-sm flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white group-hover:border-stone-900 transition-all duration-300">
                    <PlayIcon className="w-4 h-4 ml-0.5" />
                  </div>
                  Launch Media Gallery
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. INTERACTIVE HARDWARE ENGINE SHOWCASE */}
        <div className="lg:col-span-7 relative w-full h-[55vw] sm:h-[450px] lg:h-[75vh] flex items-center justify-center min-h-[260px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`img-${activeSlide.id}`}
              custom={direction}
              variants={productVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative w-full h-full flex items-center justify-center"
            >
              <Image decoding="async"
                src={activeSlide.productImageUrl || activeSlide.imageUrl || ''}
                alt={activeSlide.headline || 'Motorsport Variant presentation display'}
                fill
                className="object-contain drop-shadow-[0_35px_45px_rgba(0,0,0,0.16)] scale-105 md:scale-100"
                priority
              />

              {/* FLOATING INSTRUMENT SPECS CLUSTER HUD */}
              <div className="absolute top-2 right-0 md:top-8 md:right-4 lg:right-0 space-y-3 z-20">
                {[
                  { label: 'Power Matrix', val: '215 HP' },
                  { label: 'Dry Weight', val: '168 KG' }
                ].map((spec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 100 }}
                    className="bg-white/70 backdrop-blur-xl border border-white/60 p-3 md:p-4 w-28 md:w-36 shadow-lg shadow-stone-900/5 rounded-2xl text-left"
                  >
                    <p className="text-[9px] font-black text-stone-400 uppercase tracking-wider">
                      {spec.label}
                    </p>
                    <p className="text-lg md:text-2xl font-black text-stone-900 italic mt-0.5 tracking-tight">
                      {spec.val}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 5. MINIMALIST INDUSTRIAL PROGRESS LINE TIMELINE */}
      <div className="absolute bottom-8 left-6 sm:left-8 md:left-12 lg:left-16 xl:left-20 z-20 flex items-center gap-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleGoTo(i)}
            className="group flex items-center gap-3.5 focus:outline-none"
            aria-label={`Navigate presentation to frame module number 0${i + 1}`}
          >
            <div 
              className={`h-[2px] transition-all duration-500 rounded-full`} 
              style={{
                width: i === current ? '44px' : '20px',
                backgroundColor: i === current ? '#1c1917' : '#cbd5e1'
              }}
            />
            <span className={`text-[10px] font-black transition-opacity duration-300 ${i === current ? 'opacity-100 text-stone-900' : 'opacity-0 text-stone-400'}`}>
              0{i + 1}
            </span>
          </button>
        ))}
      </div>

      {/* STACKED CHRONO CONTROLLER STEPPERS */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-8 md:right-12 lg:right-16 xl:right-20 z-20 flex gap-1.5 bg-white p-1 rounded-2xl border border-stone-200/60 shadow-md">
          <button 
            onClick={handlePrev} 
            className="p-3.5 bg-transparent hover:bg-stone-50 rounded-xl transition-colors active:scale-95 focus:outline-none"
            aria-label="Previous hardware build slide view"
          >
            <ChevronLeftIcon className="w-4 h-4 text-stone-800 stroke-[2.5]" />
          </button>
          <button 
            onClick={handleNext} 
            className="p-3.5 bg-transparent hover:bg-stone-50 rounded-xl transition-colors active:scale-95 focus:outline-none"
            aria-label="Next hardware build slide view"
          >
            <ChevronRightIcon className="w-4 h-4 text-stone-800 stroke-[2.5]" />
          </button>
        </div>
      )}
    </section>
  );
}