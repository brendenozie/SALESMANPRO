'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, ArrowLeftIcon, GlobeAmericasIcon, PlayIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

export default function HeroSlider({ heroSlides, themeSettings, name }: HeroSliderProps) {
  // 1. Data Handling & Fallbacks
  const slides = useMemo(() => {
    if (!heroSlides || heroSlides.length === 0) return [];
    return heroSlides;
  }, [heroSlides]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 2. Navigation Logic
  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (slides.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
      }, autoAdvanceDelay);
    }
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const goTo = (idx: number, dir = 0) => {
    if (slides.length <= 1) return;
    clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  };

  const prevSlide = () => goTo((current - 1 + slides.length) % slides.length, -1);
  const nextSlide = () => goTo((current + 1) % slides.length, 1);

  // 3. Animation Variants
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.4 } }
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[current];
  const systemAccent = themeSettings?.primaryColor || '#F59E0B';

  return (
    <section id="home" className="relative min-h-[90vh] md:min-h-screen w-full flex items-center overflow-hidden bg-zinc-950">
      
      {/* BACKGROUND IMAGE WITH BALANCED VIGNETTE */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          {/* Subtle uniform ambient dim to protect highlights */}
          {/* <div className="absolute inset-0 bg-zinc-950/10 z-10" /> */}
          
          {/* Targeted Left Vignette: Deep shadows behind text, feathering out to reveal full image color & detail on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 via-30% to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10" />
          
          <Image
            src={currentSlide.imageUrl || '/fallback-logistics.jpg'}
            alt={name || "Trading Commodity Operations"}
            loader={loader}
            fill
            priority
            className="object-cover object-right lg:object-center opacity-90 brightness-95 contrast-[1.02] transition-all duration-700"
          />
        </motion.div>
      </AnimatePresence>

      {/* STRATEGIC FINE GRID LINES */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-10">
        <div className="absolute inset-y-0 left-12 w-[1px] bg-zinc-800" />
        <div className="absolute inset-y-0 right-1/4 w-[1px] bg-zinc-800 hidden lg:block" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20 w-full py-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div 
            key={`content-${current}`}
            className="max-w-5xl space-y-6 md:space-y-8"
          >
            {/* SUBHEADER / INSTITUTIONAL BADGE */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-zinc-100"
            >
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-inner" style={{ color: systemAccent }}>
                <GlobeAmericasIcon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.25em]" style={{ color: systemAccent }}>
                {currentSlide.badgeText || "Global Physical Execution"}
              </span>
            </motion.div>

            {/* MAIN HEADING - Safeguarded Responsive Scale */}
            <motion.h1 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-zinc-100 leading-[1.1] tracking-tight uppercase max-w-4xl"
            >
              {currentSlide.headline?.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line.includes('$') ? (
                    <>
                      <span className="text-zinc-500 font-light italic normal-case tracking-normal block sm:inline">
                        {line.split('$')[1]}
                      </span>
                    </>
                  ) : (
                    line
                  )}
                  <br className="hidden sm:inline" />
                </React.Fragment>
              ))}
            </motion.h1>

            {/* CONTEXT DESCRIPTION */}
            <motion.p 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="text-zinc-300 text-base md:text-lg max-w-xl leading-relaxed font-light border-l border-zinc-800 pl-6 text-justify"
            >
              {currentSlide.subline}
            </motion.p>

            {/* INSTITUTIONAL CTAs */}
            <motion.div 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
            >
              <button
                onClick={() => document.getElementById("corporate-profile")?.scrollIntoView({ behavior: "smooth" })}
                className="relative group overflow-hidden h-14 px-8 bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
              >
                <span>{currentSlide.ctaText || "Review Infrastructure"}</span> 
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              
              {currentSlide.videoLink && (
                <div className="flex items-center justify-center sm:justify-start gap-4 group cursor-pointer py-2 px-4 rounded-xl hover:bg-zinc-900/30 transition-colors duration-300">
                  <div className="h-11 w-11 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-center text-zinc-400 group-hover:border-zinc-700 relative transition-all" style={{ '--hover-color': systemAccent } as React.CSSProperties}>
                    <PlayIcon className="h-4 w-4 fill-current ml-0.5 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-zinc-200 font-bold text-xs uppercase tracking-wider">Operational</span>
                    <span className="text-zinc-500 font-medium text-[10px] uppercase tracking-wider">Briefing</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* PREMIUM CHRONO PACING CONTROLS */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 right-6 lg:right-12 flex items-center gap-6 z-30">
          <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-zinc-500">
            <span className="font-bold" style={{ color: systemAccent }}>[0{current + 1}]</span>
            <div className="w-8 h-[1px] bg-zinc-800" />
            <span>0{slides.length}</span>
          </div>

          <div className="flex gap-1.5 bg-zinc-950/60 p-1.5 rounded-xl border border-zinc-900 backdrop-blur-md">
            <button 
              onClick={prevSlide}
              className="h-10 w-10 border border-zinc-900 bg-zinc-900/30 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 flex items-center justify-center transition-all rounded-lg"
              aria-label="Previous Slide"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={nextSlide}
              className="h-10 w-10 bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center transition-all rounded-lg shadow-md"
              aria-label="Next Slide"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* STRUCTURAL ASSET ANCHOR */}
      <div className="absolute left-6 bottom-12 hidden lg:flex flex-col gap-6 text-zinc-600 z-30">
        <span className="vertical-text tracking-[0.3em] text-[9px] font-bold uppercase mb-2">{name || "Trading Limited"}</span>
        <div className="w-[1px] h-16 bg-zinc-800 mx-auto" />
      </div>

      <style jsx>{`
        .vertical-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
      `}</style>
    </section>
  );
}