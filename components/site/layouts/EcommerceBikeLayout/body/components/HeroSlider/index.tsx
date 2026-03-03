'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, BoltIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: { primaryColor?: string; secondaryColor?: string; fontFamily?: string; };
}

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const slides = heroSlides?.length ? heroSlides : [
    {
      id: 'default-1',
      headline: 'MAMMOTH MOUNTING PONICS',
      subline: 'The peak of electric performance. Engineered for those who refuse to compromise.',
      ctaText: 'Explore Series',
      ctaLink: '/shop',
      imageUrl: 'https://i.ibb.co/v4m8YmP/orange-bike.png',
      price: '€2,499',
      backgroundColor: '#FAFAFA',
    }
  ];

  const primary = themeSettings?.primaryColor || '#FF6B00';
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (slides.length > 1) {
      timeoutRef.current = setTimeout(() => paginate(1), 8000);
    }
  }, [slides.length]);

  useEffect(() => { resetTimer(); return () => clearTimeout(timeoutRef.current); }, [current, resetTimer]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  const slide = slides[current];

  return (
    <section className="relative w-full h-screen min-h-[750px] overflow-hidden bg-[#f4f4f4]">
      
      {/* 1. DYNAMIC BACKGROUND LAYER */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${slide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
          {/* Subtle Texture/Gradient */}
          <div className="absolute inset-0 opacity-40" 
               style={{ background: `radial-gradient(circle at 70% 50%, ${primary}15 0%, transparent 50%)` }} />
          
          {/* Parallax Watermark Text */}
          <motion.h2 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.04 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[25vw] font-black italic select-none"
          >
            {slide.headline?.split(' ')[0]}
          </motion.h2>
        </motion.div>
      </AnimatePresence>

      <div className="container mx-auto px-6 h-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* 2. TEXT CONTENT: Refined Typography */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-gray-400" />
                <span className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500">Edition 2026</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.85] tracking-tighter uppercase italic">
                {slide.headline?.split(' ').map((word, i) => (
                  <span key={i} className={i === 0 ? "block" : "block text-outline opacity-90"} 
                        style={i !== 0 ? { WebkitTextStroke: '1px #111', color: 'transparent' } : {}}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              
              <p className="text-gray-500 text-lg md:text-xl max-w-md mt-8 leading-relaxed font-light">
                {slide.subline}
              </p>

              <div className="flex flex-wrap items-center gap-6 mt-10">
                <Link
                  href={slide.ctaLink || '#'}
                  className="group relative overflow-hidden px-12 py-5 bg-black text-white font-bold uppercase tracking-widest transition-all shadow-2xl hover:shadow-black/20"
                >
                  <span className="relative z-10">{slide.ctaText}</span>
                  <motion.div 
                    className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: primary }}
                  />
                </Link>
                
                <div className="flex items-center gap-4">
                   <div className="h-12 w-px bg-gray-200" />
                   <div>
                     <p className="text-2xl font-black text-gray-900">{slide.price}</p>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Retail Price</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 3. THE PRODUCT: Depth & Shadow Play */}
        <div className="lg:col-span-7 order-1 lg:order-2 relative h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${slide.id}`}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 1.1 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="relative w-full h-[60%] lg:h-[80%] drop-shadow-[0_50px_50px_rgba(0,0,0,0.15)]"
            >
              <Image
                src={slide.imageUrl || 'https://i.ibb.co/v4m8YmP/orange-bike.png'}
                alt={slide.headline || 'Product'}
                fill
                loader={loader}
                className="object-contain"
                priority
              />

              {/* Dynamic Glow Shadow */}
              <div className="absolute inset-0 -z-10 blur-[120px] opacity-20 rounded-full scale-75 translate-y-20"
                   style={{ backgroundColor: primary }} />

              {/* Functional Tech-Badges */}
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 }}
                className="absolute top-[20%] right-[10%] p-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl hidden md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: primary }}>
                    <BoltIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-400">Torque</p>
                    <p className="text-sm font-bold text-gray-800">85Nm Motor</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 4. NAVIGATION: Modern Glass UI */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 lg:left-auto lg:right-12 lg:translate-x-0 z-20">
        <div className="flex items-center gap-6 bg-white/50 backdrop-blur-md p-2 pl-8 rounded-full border border-white/50 shadow-xl">
          <div className="flex gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: i === current ? '32px' : '8px', 
                  backgroundColor: i === current ? '#111' : '#ccc' 
                }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button onClick={() => paginate(-1)} className="p-4 hover:bg-black hover:text-white rounded-full transition-all">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button onClick={() => paginate(1)} className="p-4 hover:bg-black hover:text-white rounded-full transition-all">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}