'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000',
    subline: 'Collection 01',
    headline: 'The Art of\nMinimal Living',
    badgeText: 'Curated Textures',
    ctaText: 'Explore Series',
    ctaLink: '/shop',
    id: '1', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1616486341353-07bb5c0944a3?q=80&w=2000',
    subline: 'New Arrivals',
    headline: 'Form Follows\nFeeling',
    badgeText: 'Sustainably Sourced',
    ctaText: 'View Arrivals',
    ctaLink: '/collection',
    id: '2', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null,
  },
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

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current);
  }, [current, nextSlide]);

  return (
    <section className="relative h-screen min-h-[750px] bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex flex-col md:flex-row"
        >
          {/* LEFT CONTENT PANEL */}
          <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32 z-20 pt-20">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-6 block">
                // {slides[current].subline}
              </span>
              
              <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-zinc-900 dark:text-white uppercase leading-[0.85] mb-8">
                {slides[current].headline?.split('\n').map((line, i) => (
                  <span key={i} className="block">
                    {i === 1 ? <span className="font-serif italic lowercase text-zinc-400">{line}</span> : line}
                  </span>
                ))}
              </h1>

              <div className="flex items-center gap-8 mt-12">
                <Link
                  href={slides[current].ctaLink || '#'}
                  className="group relative px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 overflow-hidden"
                >
                  <span className="relative z-10 text-xs font-black uppercase tracking-widest">
                    {slides[current].ctaText}
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-zinc-700 dark:bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-500" 
                  />
                </Link>

                <div className="hidden sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Materials</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{slides[current].badgeText}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT IMAGE PANEL */}
          <div className="flex-1 relative h-[50vh] md:h-full overflow-hidden">
            <motion.div
              initial={{ scale: 1.2, x: 100 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full h-full"
            >
              <Image
                src={slides[current].imageUrl || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000'}
                alt="Furniture Concept"
                loader={({ src }) => src}
                fill
                priority
                className="object-cover grayscale-[0.2] contrast-[1.1]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 dark:from-zinc-950 via-transparent to-transparent hidden md:block" />
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* NAVIGATION OVERLAY */}
      <div className="absolute bottom-12 left-8 md:left-20 flex items-end gap-12 z-30">
        <div className="flex flex-col gap-4">
          <span className="font-mono text-[10px] text-zinc-400">
            0{current + 1} <span className="mx-2">/</span> 0{slides.length}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all"
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-px w-32 bg-zinc-200 dark:bg-zinc-800 relative hidden md:block mb-6">
          <motion.div 
            key={current}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: autoAdvanceDelay / 1000, ease: "linear" }}
            className="absolute top-0 left-0 h-full bg-zinc-900 dark:bg-white"
          />
        </div>
      </div>
    </section>
  );
}