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
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    subline: 'Limited Release',
    headline: 'THE ART OF\nMINIMALISM',
    badgeText: 'Curated essentials designed for those who find beauty in simplicity.',
    ctaText: 'Shop Essentials',
    ctaLink: '/collection',
    id: '2', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null,
  }
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const primary = themeSettings?.primaryColor || '#000000';
  
  const slides = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current);
  }, [current, nextSlide]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) nextSlide();
    else if (info.offset.x > 50) prevSlide();
  };

  return (
    <section className="relative h-[100vh] w-full bg-slate-50 dark:bg-gray-950 overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {/* Background Image with Zoom Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={slides[current].imageUrl || ''}
              alt="Hero"
              fill
              priority
              loader={loader}
              className="object-cover object-center scale-105"
            />
            {/* Sophisticated Gradients */}
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex items-center gap-3 mb-6"
              >
                <div className="h-[1px] w-8 bg-white/60" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/80">
                  {slides[current].subline}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8"
              >
                {slides[current].headline?.split('\n').map((line, i) => (
                  <span key={i} className="block">{line}</span>
                ))}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="text-lg text-white/70 font-medium mb-10 max-w-md leading-relaxed"
              >
                {slides[current].badgeText}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <Link
                  href={slides[current].ctaLink || '/'}
                  className="group inline-flex items-center gap-4 bg-white text-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-2xl shadow-white/10"
                >
                  {slides[current].ctaText}
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 right-6 md:right-12 flex items-center gap-4 z-20">
        <button
          onClick={prevSlide}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 left-6 md:left-12 flex gap-3 z-20">
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