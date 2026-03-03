'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: { primaryColor?: string; secondaryColor?: string; };
}

export default function MotoHero({ heroSlides, themeSettings }: HeroSliderProps) {
  const slides = heroSlides?.length ? heroSlides : [
    {
      id: 'moto-1',
      headline: 'APEX PREDATOR V.4',
      subline: '1200cc of pure adrenaline. Engineered for the fearless, built for the track.',
      ctaText: 'Pre-Order Now',
      ctaLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&w=1600&q=80',
      price: '$18,500',
    }
  ];

  const primary = themeSettings?.primaryColor || '#E62E2E';
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const paginate = useCallback((newDirection: number) => {
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => paginate(1), 8000);
    return () => clearTimeout(timeoutRef.current);
  }, [current, paginate]);

  const slide = slides[current];

  return (
    <section className="relative w-full h-screen min-h-[800px] overflow-hidden bg-[#F2F2F2] font-sans">
      
      {/* 1. ASYMMETRIC BG SPLIT */}
      <div className="absolute inset-0 z-0 flex">
        <div className="w-full lg:w-2/3 h-full bg-white" />
        <div className="hidden lg:block w-1/3 h-full bg-[#EBEBEB]" />
      </div>

      {/* 2. OVERSIZED WATERMARK (Light Mode) */}
      <div className="absolute right-20 bottom-0 z-0 opacity-[0.03] select-none hidden xl:block">
        <h2 className="text-[25rem] font-black leading-none text-black uppercase tracking-tighter">
          {slide.headline?.split(' ')[0]}
        </h2>
      </div>

      <div className="container mx-auto px-6 h-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* 3. CONTENT BLOCK */}
        <div className="lg:col-span-5 pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6, ease: "circOut" }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="h-1 w-10" style={{ backgroundColor: primary }} />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400">Next-Gen Performance</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-black leading-[0.9] uppercase tracking-tighter mb-8">
                {slide.headline?.split(' ').map((word, i) => (
                  <span key={i} className={`block ${i === 1 ? 'italic' : ''}`} style={i === 1 ? { color: primary } : {}}>
                    {word}
                  </span>
                ))}
              </h1>
              
              <p className="text-gray-500 text-lg max-w-sm mb-12 leading-relaxed font-medium">
                {slide.subline}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Link
                  href={slide.ctaLink || '#'}
                  className="group relative px-10 py-5 bg-black text-white font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:pr-14 transition-all duration-300"
                >
                  {slide.ctaText}
                  <ArrowRightIcon className="w-4 h-4 text-white group-hover:translate-x-2 transition-transform" />
                </Link>
                
                <button className="flex items-center gap-3 group text-black font-black uppercase tracking-widest text-[10px]">
                   <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                     <PlayIcon className="w-4 h-4 ml-0.5" />
                   </div>
                   View Gallery
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 4. MOTORCYCLE IMAGE & SPECS */}
        <div className="lg:col-span-7 relative h-[60%] lg:h-[80%] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${slide.id}`}
              initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative w-full h-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.15)]"
            >
              <Image
                src={slide.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&w=1600&q=80'}
                alt={slide.headline || 'Motorcycle Image'}
                fill
                loader={loader}
                className="object-contain drop-shadow-2xl"
                priority
              />

              {/* FLOATING GLASS SPECS */}
              <div className="absolute top-10 right-0 space-y-3">
                {[
                  { label: 'Power', val: '215 HP' },
                  { label: 'Weight', val: '168 KG' }
                ].map((spec, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="bg-white/40 backdrop-blur-xl border border-white/50 p-4 w-32 shadow-sm"
                  >
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{spec.label}</p>
                    <p className="text-xl font-black text-black italic">{spec.val}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 5. MINIMALIST NAV BAR */}
      <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group flex items-center gap-4"
          >
            <div className={`h-[2px] transition-all duration-500 ${i === current ? 'w-12 bg-black' : 'w-6 bg-black/10'}`} />
            <span className={`text-[10px] font-black transition-opacity ${i === current ? 'opacity-100' : 'opacity-0'}`}>0{i + 1}</span>
          </button>
        ))}
      </div>

      <div className="absolute bottom-10 right-10 z-20 flex gap-1">
        <button onClick={() => paginate(-1)} className="p-4 bg-white border border-black/5 hover:bg-black hover:text-white transition-all">
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <button onClick={() => paginate(1)} className="p-4 bg-white border border-black/5 hover:bg-black hover:text-white transition-all">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

    </section>
  );
}