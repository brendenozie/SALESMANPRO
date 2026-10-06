'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings'; 

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=85`;

const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const primary = themeSettings?.primaryColor || '#18181b';
  
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const data = heroSlides && heroSlides.length > 0 ? heroSlides : [
    {
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000',
      subline: 'Autumn / Winter 2026',
      headline: 'The Art of\nMinimalist Luxury',
      ctaText: 'Discover Collection',
      ctaLink: '/shop',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000',
      subline: 'Limited Edition',
      headline: 'Elevated $Basics$ For\nModern Life',
      ctaText: 'Shop the Drop',
      ctaLink: '/shop',
    }
  ];

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % data.length);
  }, [data.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + data.length) % data.length);
  };

  useEffect(() => {
    if (!isHovering) {
      timeoutRef.current = setTimeout(nextSlide, autoAdvanceDelay);
      return () => clearTimeout(timeoutRef.current);
    }
  }, [current, nextSlide, isHovering]);

  return (
    <section 
      className="relative w-full h-[100vh] bg-zinc-900 overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image with sophisticated darkening overlay */}
          <Image decoding="async"
            src={data[current].imageUrl || ''}
            alt="Hero Image"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Overlay */}
      <div className="relative z-10 h-full w-full flex flex-col justify-center items-center text-center px-6">
        <motion.div
          key={`content-${current}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="max-w-5xl"
        >
          {/* Subline */}
          <span className="inline-block text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-white/80 mb-6">
            {data[current].subline}
          </span>

          {/* Headline */}
          <h1 className="text-5xl md:text-8xl lg:text-9xl font-light text-white leading-[0.9] tracking-tighter mb-10 whitespace-pre-line uppercase italic">
            {data[current].headline?.split('$').map((part, i) => 
               i % 2 === 1 ? <span key={i} className="font-serif lowercase italic">{part}</span> : part
            )}
          </h1>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href={data[current].ctaLink || '#'}
              className="px-10 py-5 bg-white text-zinc-950 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all duration-300"
            >
              {data[current].ctaText}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-0 w-full px-12 flex justify-between items-end z-20">
        {/* Progress Dots / Index */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {data.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setDirection(idx > current ? 1 : -1); setCurrent(idx); }}
                className="group relative h-12 w-1"
              >
                <div className="h-full w-px bg-white/20 absolute left-1/2 -translate-x-1/2" />
                {idx === current && (
                  <motion.div 
                    layoutId="activeTab"
                    className="h-full w-px bg-white absolute left-1/2 -translate-x-1/2" 
                  />
                )}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-black text-white/50 tracking-widest">
            0{current + 1} / 0{data.length}
          </span>
        </div>

        {/* Side Arrows */}
        <div className="flex gap-8">
          <button onClick={prevSlide} className="text-white hover:text-white/60 transition-colors p-2">
            <ArrowLeftIcon className="w-6 h-6 stroke-1" />
          </button>
          <button onClick={nextSlide} className="text-white hover:text-white/60 transition-colors p-2">
            <ArrowRightIcon className="w-6 h-6 stroke-1" />
          </button>
        </div>
      </div>

      {/* Side "Boutique" Label Decor */}
      <div className="absolute top-1/2 -left-12 -rotate-90 origin-center hidden lg:block">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-[1em]">
          Est. MMXVI — Boutique Experience
        </span>
      </div>
    </section>
  );
}