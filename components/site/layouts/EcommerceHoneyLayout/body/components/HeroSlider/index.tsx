'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  BeakerIcon, 
  SunIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const autoAdvanceDelay = 8000;
const loader = ({ src }: { src: string }) => src;

// Hardware-accelerated sliding variants mapped to input direction
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '20%' : '-20%',
    opacity: 0,
    filter: 'blur(8px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      x: { type: 'spring', stiffness: 120, damping: 20 },
      opacity: { duration: 0.4 },
      filter: { duration: 0.4 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '20%' : '-20%',
    opacity: 0,
    filter: 'blur(8px)',
    transition: { duration: 0.35 }
  })
};

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function HoneyHero({ heroSlides }: { heroSlides: HeroSlide[] | null }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = useMemo(() => {
    const fallback = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop';
    if (!heroSlides || heroSlides.length === 0) return [{
      headline: "PURE GOLD\nFROM THE HIVE.",
      badgeText: "Limited Harvest / Batch 724",
      subline: "Experience unfiltered, raw honey sourced from remote sun-drenched meadows. Each jar tells a story of the season.",
      ctaText: "Explore the Harvest",
      ctaLink: "/shop",
      imageUrl: fallback,
      productImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
      price: "From $24.00"
    }];
    return heroSlides;
  }, [heroSlides]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered]);

  return (
    <section 
      className="relative min-h-[100svh] lg:h-screen flex items-center bg-[#FFFCF5] overflow-hidden pt-28 pb-24 lg:py-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* 1. LAYERED DECORATIVE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Crisp Vector Honeycomb Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='56' height='97' viewBox='0 0 56 97' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 0L56 16.16v32.32L28 64.64l-28-16.16V16.16L28 0zm0 32.32l28 16.16v32.32l-28 16.16-28-16.16V48.48l28-16.16z' fill='%2378350f' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`, 
            backgroundSize: '56px 97px' 
          }} 
        />
        
        {/* Hydration-Safe Deterministic Atmospheric Particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -60, 0], 
              x: [0, 25, 0],
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.35, 0.15] 
            }}
            transition={{ 
              duration: 9 + i * 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute w-2 h-2 bg-amber-500 rounded-full blur-[0.5px]"
            style={{ 
              top: `${15 + i * 13}%`, 
              left: `${10 + (i * 17) % 80}%` 
            }}
          />
        ))}

        {/* Ambient Warm Golden Fields Glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-amber-200/30 blur-[130px] rounded-full mix-blend-multiply" />
        <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] bg-orange-100/40 blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      {/* 2. MAIN VIEWPORT CONTENT LAYER */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center">
          
          {/* TEXT EDITORIAL MODULE */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6 md:space-y-8 text-center lg:text-left"
              >
                {/* Dynamic Season Badge */}
                <motion.div variants={textItemVariants} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-200/40 shadow-sm">
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-900">
                    {slides[current].badgeText}
                  </span>
                </motion.div>

                {/* Structured Split Typography */}
                <motion.h1 
                  variants={textItemVariants}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-serif text-stone-900 leading-[1.02] tracking-tight font-normal"
                >
                  {slides[current].headline?.split('\n').map((text, i) => (
                    <span key={i} className="block last:italic last:font-medium last:text-amber-600">
                      {text}
                    </span>
                  ))}
                </motion.h1>

                {/* Body Content Copy */}
                <motion.p 
                  variants={textItemVariants}
                  className="text-stone-600 text-base md:text-lg lg:text-xl max-w-md lg:max-w-lg mx-auto lg:ml-0 leading-relaxed font-light"
                >
                  {slides[current].subline}
                </motion.p>

                {/* Call-to-Actions & Internal Quality Hub */}
                <motion.div variants={textItemVariants} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-2">
                  <Link
                    href={slides[current].ctaLink || '/shop'}
                    className="w-full sm:w-auto text-center px-10 py-6 bg-[#2B1B17] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-600 active:scale-[0.98] transition-all duration-300 shadow-xl shadow-amber-950/10"
                  >
                    {slides[current].ctaText}
                  </Link>
                  
                  <div className="flex items-center gap-3.5 text-stone-500 border-t sm:border-t-0 sm:border-l border-stone-200 pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto justify-center">
                    <div className="w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center shrink-0 shadow-sm">
                      <BeakerIcon className="w-4 h-4 text-stone-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-800 leading-none mb-0.5">Purity Verified</p>
                      <p className="text-[11px] font-serif text-stone-400 italic">100% Organic & Raw</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* VISUAL ARCH GALLERY COMPOSITION */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative w-full aspect-[4/5] max-w-[300px] sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[480px] mx-auto group">
              
              {/* Main Visual Frame Shaped Arch */}
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="relative w-full h-full z-10 rounded-t-[180px] sm:rounded-t-[240px] rounded-b-3xl overflow-hidden border-[12px] sm:border-[16px] border-white shadow-[0_32px_64px_-16px_rgba(120,53,15,0.18)]"
                >
                  <Image 
                    src={slides[current].imageUrl || slides[current].productImageUrl || ''} 
                    alt="Artisanal Honey Harvest" 
                    fill 
                    loader={loader}
                    priority
                    className="object-cover transition-transform duration-[4s] ease-out group-hover:scale-105" 
                  />
                  {/* Subtle Protective Gradient Ambient Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-950/10 via-transparent to-black/5" />
                </motion.div>
              </AnimatePresence>

              {/* Floating Analytical Trust Pill (Hidden on Mobile Viewports to maximize spacing) */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={current}
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="absolute -right-2 sm:-right-4 lg:-right-8 bottom-16 z-20 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-xl border border-stone-100 hidden sm:block"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <SunIcon className="w-5 h-5 text-amber-600 animate-spin-slow" />
                    </div>
                    <div className="text-left pr-2">
                      <p className="text-[9px] font-bold uppercase text-stone-400 tracking-wider mb-0.5">Bio-Active Content</p>
                      <p className="text-sm font-serif text-stone-900 font-medium">Naturally Rich Nectar</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Underlying Organic Blur Shadow Cushion */}
              <div className="absolute -z-10 -bottom-6 -left-6 w-48 h-48 bg-amber-200/40 rounded-full blur-3xl opacity-70" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. REFINED CONTROL DASHBOARD PANELS */}
      <div className="absolute bottom-6 left-0 right-0 z-20 container mx-auto px-6 sm:px-8 lg:px-16 flex items-center justify-between gap-4 pointer-events-none">
        
        {/* Dynamic Linear Active Progress Dots */}
        <div className="flex items-center gap-3.5 pointer-events-auto">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className="group relative py-3 focus:outline-none"
              aria-label={`Jump to slide ${i + 1}`}
            >
              <div className={`h-[3px] rounded-full transition-all duration-500 ${i === current ? 'w-12 bg-amber-700' : 'w-3 bg-stone-300/70 group-hover:bg-stone-400'}`} />
            </button>
          ))}
        </div>

        {/* Tactile Split Navigation Arrows */}
        <div className="flex rounded-full border border-stone-200/80 bg-white/90 backdrop-blur-sm pointer-events-auto shadow-md overflow-hidden shrink-0">
          <button 
            onClick={prevSlide} 
            className="p-3.5 sm:p-4 hover:bg-stone-50 text-stone-500 hover:text-amber-900 active:scale-95 transition-all focus:outline-none"
            aria-label="Previous Slide"
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
          <div className="w-[1px] bg-stone-200 self-stretch" />
          <button 
            onClick={nextSlide} 
            className="p-3.5 sm:p-4 hover:bg-stone-50 text-stone-500 hover:text-amber-900 active:scale-95 transition-all focus:outline-none"
            aria-label="Next Slide"
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
        
      </div>
    </section>
  );
}