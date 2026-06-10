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
    id: '1',
    companyId: '',
    imageUrl:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
    subline: 'Spring Collection 2026',
    headline: 'REDEFINING\nMODERN ELEGANCE',
    badgeText:
      'Experience the intersection of high-performance materials and avant-garde tailoring.',
    ctaText: 'Explore Lookbook',
    ctaLink: '/shop',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
    stats: null,
  },
  {
    id: '2',
    companyId: '',
    imageUrl:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    subline: 'Limited Release',
    headline: 'THE ART OF\nMINIMALISM',
    badgeText:
      'Curated essentials designed for those who find beauty in simplicity.',
    ctaText: 'Shop Essentials',
    ctaLink: '/collection',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
    stats: null,
  },
];

export default function HeroSlider({ heroSlides }: HeroSliderProps) {
  const slides = heroSlides?.length ? heroSlides : defaultSlides;

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
    if (info.offset.x > 50) prevSlide();
  };

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden bg-black select-none">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          {/* Background */}
          <div className="absolute inset-0">
            <Image
              src={slides[current].imageUrl || ''}
              alt="Hero background"
              fill
              priority
              loader={loader}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/50 md:bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col justify-center pt-[20dvh] md:pt-0">
            <div className="max-w-[90%] sm:max-w-xl md:max-w-2xl">
              
              {/* Subline */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="h-px w-8 bg-white/60" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
                  {slides[current].subline}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="
                    font-black text-white tracking-tight
                    leading-[1.05] md:leading-[0.95]
                    text-[clamp(2.2rem,5.2vw,4.25rem)]
                    md:text-[clamp(3.5rem,5.8vw,6.25rem)]
                    lg:text-[clamp(4rem,5vw,6.75rem)]
                    max-w-[13ch] md:max-w-none
                  "
                >
                  {slides[current].headline?.split('\n').map((line, i) => (
                    <span key={i} className="block md:inline-block md:mr-4">
                      {line}
                    </span>
                  ))}
                </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 text-sm sm:text-base md:text-lg text-white/80 max-w-md leading-relaxed"
              >
                {slides[current].badgeText}
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <Link
                  href={slides[current].ctaLink || '/'}
                  className="
                    inline-flex items-center justify-center gap-3
                    bg-white text-black
                    w-full max-w-xs
                    px-7 py-4
                    sm:w-auto sm:px-6 sm:py-3.5
                    rounded-full
                    font-black uppercase text-[11px] tracking-widest
                    shadow-xl shadow-black/30
                    active:scale-95 transition
                  "
                >
                  {slides[current].ctaText}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Desktop Arrows */}
      <div className="hidden md:flex absolute bottom-12 right-12 gap-3 z-20">
        <button onClick={prevSlide} className="hero-nav-btn">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={nextSlide} className="hero-nav-btn">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Indicators */}
      <div className="hidden sm:flex absolute bottom-12 left-6 md:left-12 gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className="h-10 w-1 flex items-end"
          >
            <div
              className={`w-full rounded-full transition-all ${
                i === current ? 'h-full bg-white' : 'h-2 bg-white/40'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Mobile scroll cue */}
      <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="h-8 w-px bg-white/40 animate-pulse" />
      </div>

      <style jsx>{`
        .hero-nav-btn {
          width: 3rem;
          height: 3rem;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.25s;
        }
        .hero-nav-btn:hover {
          background: white;
          color: black;
        }
      `}</style>
    </section>
  );
}