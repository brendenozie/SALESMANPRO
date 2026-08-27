'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowRightIcon, ArrowLeftIcon, ArchiveBoxIcon, PlayIcon,  } from "@heroicons/react/24/outline";
import Image from 'next/image';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  // 1. Data Handling & Fallbacks
  const slides = useMemo(() => {
    if (!heroSlides || heroSlides.length === 0) return [];
    return heroSlides;
  }, [heroSlides]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const primary = themeSettings?.primaryColor || '#f7941d';

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
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4 } }
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[current];

  return (
    <section id="home" className="relative min-h-[90vh] md:min-h-screen w-full flex items-center overflow-hidden bg-[#111]">
      {/* BACKGROUND IMAGE WITH SLIDE ANIMATION */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`bg-${current}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10" />
          <Image
            src={currentSlide.imageUrl || '/fallback-logistics.jpg'}
            alt="Logistics Background"
            loader={loader}
            fill
            priority
            className="object-cover object-right lg:object-center"
          />
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-6 lg:px-12 relative z-20">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div 
            key={`content-${current}`}
            className="max-w-5xl space-y-6 md:space-y-8"
          >
            {/* SUBHEADER / BADGE */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-white"
            >
              <div className="p-2 bg-[#f7941d] rounded-sm">
                <ArchiveBoxIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-[#f7941d]">
                {currentSlide.badgeText || "Logistics & Transportation"}
              </span>
            </motion.div>

            {/* MAIN HEADING - Dynamic with Highlight logic */}
            <motion.h1 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-[12vw] md:text-[7rem] lg:text-[9rem] font-black text-white leading-[0.85] tracking-tighter uppercase"
            >
              {currentSlide.headline?.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line.includes('$') ? (
                    <>
                      <span className="text-transparent stroke-white" style={{ WebkitTextStroke: '1.5px white' }}>
                        {line.split('$')[1]}
                      </span>
                    </>
                  ) : (
                    line
                  )}
                  <br />
                </React.Fragment>
              ))}
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="text-gray-200 text-base md:text-xl max-w-xl leading-relaxed font-light border-l-2 border-[#f7941d] pl-6"
            >
              {currentSlide.subline}
            </motion.p>

            {/* ACTIONS */}
            <motion.div 
              variants={fadeUp}
              initial="initial"
              animate="animate"
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-10 pt-4"
            >
              <button
                onClick={() => document.getElementById("contact us")?.scrollIntoView({ behavior: "smooth" })}
                className="relative group overflow-hidden h-16 px-10 bg-[#f7941d] text-white font-black text-sm uppercase transition-all transform hover:scale-105 skew-x-[-12deg]"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <span className="skew-x-[12deg] flex items-center gap-3">
                  {currentSlide.ctaText} <ArrowRightIcon className="h-4 w-4" />
                </span>
              </button>
              
              {currentSlide.videoLink && (
                <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="h-16 w-16 rounded-full border border-white/30 flex items-center justify-center text-white relative">
                    <PlayIcon className="h-6 w-6 fill-white ml-1" />
                    <div className="absolute inset-0 rounded-full border border-white/50 animate-ping opacity-20" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-xs uppercase tracking-widest">Watch</span>
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Showcase</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* NAVIGATION CONTROLS */}
      {slides.length > 1 && (
        <div className="absolute bottom-10 right-10 md:right-20 flex flex-col md:flex-row items-end md:items-center gap-8 z-30">
          <div className="flex items-center gap-4 text-white font-black text-2xl tracking-tighter">
            <span className="text-[#f7941d]">0{current + 1}</span>
            <div className="w-12 h-[1px] bg-white/30" />
            <span className="text-white/40 text-sm italic">0{slides.length}</span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              className="h-14 w-14 border border-white/20 text-white flex items-center justify-center hover:bg-[#f7941d] transition-all rounded-sm"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="h-14 w-14 bg-[#f7941d] text-white flex items-center justify-center hover:bg-white hover:text-black transition-all rounded-sm"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* VERTICAL DECORATION */}
      <div className="absolute left-6 bottom-12 hidden lg:flex flex-col gap-6 text-white/50 z-30">
        <span className="vertical-text tracking-widest text-[10px] font-bold uppercase mb-4">Imevo Logistics</span>
        <div className="w-[1px] h-12 bg-white/20 mx-auto" />
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