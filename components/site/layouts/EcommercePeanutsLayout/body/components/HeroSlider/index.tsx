'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

/* -------------------------------------------------------------------------- */
/* Design Sub-Components */
/* -------------------------------------------------------------------------- */



const StatBadge = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col text-left">
    <span className="text-lg md:text-2xl font-black text-[#3E2723] leading-none tracking-tight">{value}</span>
    <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mt-1.5">{label}</span>
  </div>
);

const loader = ({ src }: { src: string }) => src;

/* -------------------------------------------------------------------------- */
/* Animation Physics Configurations */
/* -------------------------------------------------------------------------- */

const stageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '12%' : '-12%',
    opacity: 0,
    filter: 'blur(4px)'
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      x: { type: 'spring', stiffness: 140, damping: 22 },
      opacity: { duration: 0.35 },
      filter: { duration: 0.35 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '12%' : '-12%',
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.3 }
  })
};

const textGroupVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } 
  }
};

/* -------------------------------------------------------------------------- */
/* Main Module Component */
/* -------------------------------------------------------------------------- */

export default function PeanutHeroIntuitive({ heroSlides }: any) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = useMemo(() => {
    if (heroSlides && heroSlides.length > 0) return heroSlides;
    return [
      {
        headline: "The Art of the Roast.",
        badgeText: "Batch No. 042",
        subline: "Discover a deeper, more complex peanut butter. Slow-roasted in small batches to unlock hidden notes of caramel and smoke.",
        ctaText: "Explore the Collection",
        imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1000&auto=format&fit=crop",
        productImageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1000&auto=format&fit=crop",
      },
      {
        headline: "Texture, Refined.",
        badgeText: "Velvet Smoothness",
        subline: "Our triple-milled process ensures a silk-like consistency that melts instantly. No stabilizers, just pure nut oils.",
        ctaText: "Shop Creamy",
        imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=1000&auto=format&fit=crop",
        productImageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=1000&auto=format&fit=crop",
      }
    ];
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
    const autoAdvance = setInterval(nextSlide, 7500);
    return () => clearInterval(autoAdvance);
  }, [nextSlide, isHovered]);

  return (
    <section 
      className="relative min-h-[100svh] lg:h-screen flex items-center bg-[#FCFAF7] overflow-hidden pt-28 pb-20 lg:py-0 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* BACKGROUND GRAPHIC INTERPOLATION */}
      <div className="absolute top-0 right-0 w-full lg:w-[38%] h-full bg-[#F3A852]/5 pointer-events-none z-0" />
      <div className="absolute left-8 top-1/2 -translate-y-1/2 h-48 w-[1px] bg-stone-200/80 hidden xl:block pointer-events-none" />

      <div className="container mx-auto px-6 sm:px-8 lg:px-16 xl:px-24 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-16 items-center">
          
          {/* CONTENT COLUMNS */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                variants={textGroupVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6 md:space-y-8 text-center lg:text-left"
              >
                {/* Fixed Data Mapping Inversion: badgeText now renders as the badge banner element */}
                <motion.div variants={textItemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 rounded-full border border-amber-200/30 shadow-sm">
                  <SparklesIcon className="w-3.5 h-3.5 text-[#F3A852]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#3E2723]">
                    {slides[current].badgeText}
                  </span>
                </motion.div>

                {/* Primary Hero Typography */}
                <motion.h1 
                  variants={textItemVariants}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-black text-[#3E2723] leading-[1.1] tracking-tight"
                >
                  {slides[current].headline}
                </motion.h1>

                {/* Fixed Data Mapping Inversion: subline renders cleanly inside the description block */}
                <motion.p 
                  variants={textItemVariants}
                  className="text-sm md:text-base text-stone-500 max-w-md mx-auto lg:ml-0 font-medium leading-relaxed"
                >
                  {slides[current].subline}
                </motion.p>

                {/* Actionable Link Integration */}
                <motion.div variants={textItemVariants} className="flex justify-center lg:justify-start pt-2">
                  <Link
                    href="/shop"
                    className="group inline-flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-[#3E2723]"
                  >
                    <span className="border-b-2 border-[#3E2723]/30 pb-1.5 group-hover:border-[#3E2723] transition-colors duration-300">
                      {slides[current].ctaText}
                    </span>
                    <div className="p-3 bg-[#3E2723] rounded-full text-white group-hover:bg-[#F3A852] group-hover:text-[#3E2723] transition-all duration-300 transform group-hover:translate-x-1 shadow-md">
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>

                {/* Quality Metrics Row */}
                <motion.div 
                  variants={textItemVariants} 
                  className="grid grid-cols-3 gap-6 pt-8 border-t border-stone-200/60 max-w-sm mx-auto lg:ml-0"
                >
                  <StatBadge value="100%" label="Natural" />
                  <StatBadge value="0%" label="Palm Oil" />
                  <StatBadge value="Pure" label="Origin" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* VISUAL LAYOUT PIECE */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative flex items-center justify-center">
            <div className="relative w-full aspect-square max-w-[290px] sm:max-w-[400px] xl:max-w-[460px]">
              
              {/* Minimal Clean Backdrop Shape */}
              <div className="absolute inset-0 bg-white rounded-full shadow-[0_32px_70px_rgba(62,39,35,0.04)] scale-95 border border-stone-100" />
              
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  // variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 w-full h-full p-6 sm:p-10"
                >
                  <Image decoding="async"
                    src={slides[current].imageUrl || slides[current].productImageUrl}
                    alt="Premium Jar Showcase"
                    fill
                    className="object-contain drop-shadow-[0_24px_48px_rgba(62,39,35,0.14)] p-4 select-none transition-transform duration-700 hover:scale-[1.03]"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Guarded Dynamic Batch Overlay Card */}
              <div className="absolute bottom-[8%] right-1 sm:right-[-12px] lg:right-[-4px] bg-white/95 backdrop-blur-sm py-3 px-4 rounded-xl shadow-lg border border-stone-100/80 flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#3E2723]">In Stock: Limited Release</span>
              </div>
            </div>
          </div>

        </div>

        {/* CONTROLS HUD WRAPPER */}
        <div className="mt-12 lg:mt-0 lg:absolute lg:bottom-12 lg:right-16 xl:right-24 flex items-center justify-center lg:justify-end gap-8">
          
          {/* Micro Pagination Counters */}
          <div className="text-[11px] font-mono font-bold text-[#3E2723] tracking-[0.2em]">
            0{current + 1} <span className="text-stone-300 mx-2">/</span> 0{slides.length}
          </div>
          
          {/* Tactical Navigation Stepper Loops */}
          <div className="flex gap-2.5">
            <button 
              onClick={prevSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm hover:bg-[#3E2723] hover:border-[#3E2723] hover:text-white transition-all duration-300 active:scale-95 group focus:outline-none"
              aria-label="Previous Slide"
            >
              <ChevronLeftIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm hover:bg-[#3E2723] hover:border-[#3E2723] hover:text-white transition-all duration-300 active:scale-95 group focus:outline-none"
              aria-label="Next Slide"
            >
              <ChevronRightIcon className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}