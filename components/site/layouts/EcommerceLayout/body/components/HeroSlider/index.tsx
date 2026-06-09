'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
    subline: 'Spring Collection 2026',
    headline: 'REDEFINING\nMODERN ELEGANCE',
    badgeText: 'Experience the intersection of high-performance materials and avant-garde tailoring.',
    ctaText: 'Explore Lookbook',
    ctaLink: '/shop',
    id: '1', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null,
    stats: null
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    subline: 'Limited Release',
    headline: 'THE ART OF\nMINIMALISM',
    badgeText: 'Curated essentials designed for those who find beauty in simplicity.',
    ctaText: 'Shop Essentials',
    ctaLink: '/collection',
    id: '2', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null,
    stats: null
  }
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const slides = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current);
  }, [current, nextSlide]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) nextSlide();
    else if (info.offset.x > 50) prevSlide();
  };

  return (
    // Replaced 100vh with 100dvh to perfectly fit mobile screen enclosures without toolbar clipping
    <section className="relative h-[100dvh] w-full bg-slate-50 dark:bg-gray-950 overflow-hidden select-none">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {/* Background Image Layer */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={slides[current].imageUrl || ''}
              alt="Hero Presentation"
              fill
              priority
              loader={loader}
              className="object-cover object-center pointer-events-none"
            />
            {/* Responsive overlays: deeper mask on mobile to enhance text contrast */}
            <div className="absolute inset-0 bg-black/40 md:bg-black/30 dark:bg-black/60 dark:md:bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center target-content">
            <div className="max-w-2xl text-left">
              
              {/* Subline */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6"
              >
                <div className="h-[1px] w-6 md:w-8 bg-white/60" />
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-white/90">
                  {slides[current].subline}
                </span>
              </motion.div>

              {/* Headline - Solved mobile line collapsing */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter mb-4 md:mb-6 text-wrap leading-[1.1] md:leading-[0.9]"
              >
                {slides[current].headline?.split('\n').map((line, i) => (
                  // Using inline-block on mobile keeps multi-line text structured but fluid
                  <span key={i} className="block md:inline-block md:mr-4 last:mr-0">
                    {line}
                  </span>
                ))}
              </motion.h2>

              {/* Description Body */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-sm sm:text-base md:text-lg text-white/80 font-medium mb-6 md:mb-10 max-w-sm md:max-w-md leading-relaxed"
              >
                {slides[current].badgeText}
              </motion.p>

              {/* Call To Action */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Link
                  href={slides[current].ctaLink || '/'}
                  className="group inline-flex items-center gap-3 bg-white text-black px-6 py-3.5 md:px-8 md:py-4 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-black/20"
                >
                  {slides[current].ctaText}
                  <ArrowRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls - Shifted layout slightly on tiny devices */}
      <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex items-center gap-3 z-20">
        <button
          onClick={prevSlide}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-90"
        >
          <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-black transition-all active:scale-90"
        >
          <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Slide Indicators - Hidden on extra-small mobile devices to preserve minimal clarity */}
      <div className="hidden sm:flex absolute bottom-12 left-6 md:left-12 gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className="group relative h-10 w-1 flex flex-col justify-end"
          >
            <div className={`w-full transition-all duration-500 rounded-full ${i === current ? 'h-full bg-white' : 'h-2 bg-white/30 group-hover:bg-white/50'}`} />
          </button>
        ))}
      </div>
    </section>
  );
}