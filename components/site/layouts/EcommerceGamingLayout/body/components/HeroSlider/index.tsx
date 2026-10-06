'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Using Hero Icons as per saved preference
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.8;
const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1605898930773-734733052153?q=80&w=1600&auto=format&fit=crop',
    subline: 'Upgrade your battle station with professional-grade peripherals. Precision engineering for the elite gamer.',
    headline: 'EMPIRE $ GEMS',
    badgeText: 'NEW ARRIVAL',
    ctaText: 'FIND THE PERFECT GEAR',
    ctaLink: '/gamingecommerce/products',
    id: '1',
    companyId: '',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
  },
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const slides = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoAdvanceDelay);
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '10%' : '-10%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? '10%' : '-10%', opacity: 0 }),
  };

  return (
    <section className="relative bg-white dark:bg-[#050505] mt-16 overflow-hidden min-h-[700px] md:min-h-[600px] flex flex-col justify-center transition-colors duration-500">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-red-500/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {slides.map((slide, idx) => idx === current && (
            <motion.div
              key={slide.id || idx}
              className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: transitionDuration, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* 1. IMAGE DISPLAY - LARGER & HIGHER ON MOBILE */}
              <div className="w-full md:w-1/2 h-[300px] sm:h-[400px] md:h-[550px] relative order-1 md:order-2">
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <Image decoding="async"
                    src={slide.imageUrl || slide.productImageUrl || 'https://images.unsplash.com/photo-1605898930773-734733052153?q=80&w=1600&auto=format&fit=crop'}
                    alt={slide.headline || 'Product'}
                    fill
                    className="object-contain drop-shadow-[0_20px_50px_rgba(255,0,0,0.2)] dark:drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                    priority
                  />
                  {/* Floating Animation Effect */}
                  <motion.div 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 pointer-events-none"
                  />
                </motion.div>
              </div>

              {/* 2. TEXT CONTENT - OPTIMIZED FOR READABILITY */}
              <div className="w-full md:w-1/2 text-left space-y-4 md:space-y-6 order-2 md:order-1 pb-12 md:pb-0">
                <motion.div 
                   initial={{ opacity: 0, x: -20 }} 
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-3"
                >
                   <div className="h-[2px] w-12 bg-red-600" />
                   <span className="text-red-600 dark:text-red-500 font-black tracking-[0.3em] text-xs uppercase italic">
                     {slide.badgeText}
                   </span>
                </motion.div>

                <motion.h1 
                  className="text-5xl sm:text-7xl md:text-8xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter italic"
                >
                  {slide.headline?.split('$').map((part, i) => (
                    <span key={i} className={i === 1 ? "block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-600" : ""}>
                      {part}
                    </span>
                  ))}
                </motion.h1>

                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-md font-medium leading-relaxed">
                  {slide.subline}
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-6 pt-4">
                  <Link
                    href={slide.ctaLink || '/gamingecommerce/products'}
                    className="group relative w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black font-black px-10 py-5 uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all duration-300 shadow-xl shadow-red-600/10"
                  >
                    {slide.ctaText}
                    <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MOBILE-FRIENDLY PAGINATION DOTS */}
      <div className="absolute bottom-16 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className={`h-1 transition-all duration-500 rounded-full ${i === current ? 'w-10 bg-red-600' : 'w-3 bg-gray-300 dark:bg-gray-700'}`}
          />
        ))}
      </div>

      {/* THE TICKER - Visual Anchor */}
      <div className="absolute bottom-0 w-full bg-red-600 py-3 overflow-hidden whitespace-nowrap border-y border-red-400/30 rotate-[-1deg] translate-y-4 shadow-lg z-20">
        <div className="inline-block animate-marquee">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-white font-black italic text-xl mx-8 uppercase tracking-widest">
              ✦ NEW GEAR ARRIVED ✦ ELITE PRECISION ✦ 40% OFF SELECT ITEMS
            </span>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
}