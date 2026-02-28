'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, BeakerIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const autoAdvanceDelay = 7000;
const loader = ({ src }: { src: string }) => src;

export default function HoneyHero({ heroSlides }: { heroSlides: HeroSlide[] | null }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = useMemo(() => {
    const fallback = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop';
    if (!heroSlides || heroSlides.length === 0) return [{
      headline: "NATURE'S GOLDEN\nALCHEMY.",
      subline: "Batch No. 724 / Wildflower",
      badgeText: "Unfiltered, raw honey harvested from the sun-drenched meadows of the valley. A complex profile with notes of clover and citrus.",
      ctaText: "Shop the Harvest",
      ctaLink: "/shop",
      imageUrl: fallback
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
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative min-h-[90vh] flex items-center bg-[#FDFCF7] overflow-hidden">
      {/* Organic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated Pollen Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -100, 0], 
              x: [0, 50, 0],
              opacity: [0, 0.4, 0] 
            }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, delay: i * 1.5 }}
            className="absolute w-1 h-1 bg-[#D4AF37] rounded-full"
            style={{ top: `${20 + i * 15}%`, left: `${10 + i * 12}%` }}
          />
        ))}
        {/* Decorative Golden Blur */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F3A852] opacity-10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 lg:px-20 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
          >
            {/* 01. Text Block */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block text-[10px] font-black uppercase tracking-[0.5em] text-[#B8860B] mb-6"
              >
                {slides[current].subline}
              </motion.span>
              
              <h1 className="text-5xl md:text-7xl font-serif italic text-[#3E2723] leading-[0.9] mb-8 tracking-tight">
                {slides[current].headline.split('\n').map((text, i) => (
                  <span key={i} className="block">{text}</span>
                ))}
              </h1>

              <p className="text-stone-500 text-sm md:text-base max-w-sm mb-10 leading-relaxed font-medium">
                {slides[current].badgeText}
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-8">
                <Link
                  href={slides[current].ctaLink || '#'}
                  className="px-10 py-4 bg-[#3E2723] text-white text-[11px] font-black uppercase tracking-widest rounded-full hover:bg-[#B8860B] transition-colors shadow-xl shadow-stone-200"
                >
                  {slides[current].ctaText}
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <BeakerIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Lab-Tested Purity</span>
                </div>
              </div>
            </div>

            {/* 02. Image Composition */}
            <div className="lg:col-span-7 order-1 lg:order-2 relative h-[400px] md:h-[600px]">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Main Image Frame */}
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-4/5 h-[90%] z-10 rounded-t-[200px] rounded-b-2xl overflow-hidden border-[12px] border-white shadow-2xl"
                >
                  <Image 
                    src={slides[current].imageUrl} 
                    alt="Honey" 
                    fill 
                    loader={loader}
                    className="object-cover"
                  />
                </motion.div>
                
                {/* Accent Detail Frame */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -right-4 bottom-10 w-48 h-64 z-20 rounded-2xl overflow-hidden border-8 border-white shadow-xl hidden md:block"
                >
                  <Image 
                    src={slides[current].imageUrl} 
                    alt="Detail" 
                    fill 
                    loader={loader}
                    className="object-cover scale-150" 
                  />
                  <div className="absolute inset-0 bg-amber-900/10" />
                </motion.div>

                {/* Decorative "Honey Drop" SVG */}
                <svg className="absolute -left-10 top-20 w-32 h-32 text-amber-100 fill-current -z-10" viewBox="0 0 100 100">
                    <path d="M50 0 C20 40 20 70 50 100 C80 70 80 40 50 0" />
                </svg>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Layer */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-12 z-30">
        <button onClick={prevSlide} className="group flex items-center gap-2">
            <ChevronLeftIcon className="w-5 h-5 text-stone-300 group-hover:text-[#3E2723] transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 group-hover:text-[#3E2723]">Prev</span>
        </button>
        
        <div className="flex gap-3">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 rounded-full transition-all duration-500 ${i === current ? 'w-12 bg-[#B8860B]' : 'w-2 bg-stone-200'}`} 
            />
          ))}
        </div>

        <button onClick={nextSlide} className="group flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 group-hover:text-[#3E2723]">Next</span>
            <ChevronRightIcon className="w-5 h-5 text-stone-300 group-hover:text-[#3E2723] transition-colors" />
        </button>
      </div>
    </section>
  );
}