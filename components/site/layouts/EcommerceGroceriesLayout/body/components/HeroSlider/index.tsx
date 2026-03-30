'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 7000;

export default function FullScreenHero({ heroSlides, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#16a34a'; 
  const secondary = themeSettings?.secondaryColor || '#fbbf24';

  const [current, setCurrent] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  // Default Grocery Data for Immersive Feel
  const slides = (heroSlides && heroSlides.length > 0 ? heroSlides : [
    {
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000',
      subline: 'Fresh from the Soil',
      headline: 'ORGANIC HARVEST$DELIVERED DAILY',
      badgeText: 'Hand-picked premium produce from local farmers, delivered to your doorstep within 2 hours.',
      ctaText: 'Start Shopping',
      ctaLink: '/groceriesecommerce/products'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2000',
      subline: 'Healthy Living',
      headline: 'FUEL YOUR BODY$WITH NATURE',
      badgeText: 'Explore our curated selection of superfoods and seasonal greens to kickstart your wellness journey.',
      ctaText: 'View Seasonal Picks',
      ctaLink: '/groceriesecommerce/products?filter=seasonal'
    }
  ]);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative w-full h-screen min-h-[650px] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          {/* Immersive Background Image */}
          <Image
            src={slides[current].imageUrl}
            alt="Grocery Background"
            fill
            priority
            loader={loader}
            className="object-cover transition-transform duration-[10s] ease-linear scale-110"
            style={{ transform: 'scale(1.1)' }} // Slow zoom effect
            onLoadingComplete={(img) => {
               img.style.transform = 'scale(1)';
            }}
          />
          
          {/* Dynamic Overlays for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-20 h-full container mx-auto px-6 md:px-12 flex flex-col justify-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: secondary }} />
            <span className="text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase">
              {slides[current].subline}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-8"
          >
            {slides[current].headline.split('$').map((part: string, i: number) => (
              <span key={i} className="block">
                {i === 1 ? <span style={{ color: secondary }}>{part}</span> : part}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-lg md:text-2xl text-gray-300 mb-10 max-w-xl leading-relaxed font-light"
          >
            {slides[current].badgeText}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <Link
              href={slides[current].ctaLink || '/groceriesecommerce/products'}
              className="group flex items-center px-10 py-5 rounded-full text-white font-bold text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(22,163,74,0.4)]"
              style={{ backgroundColor: primary }}
            >
              {slides[current].ctaText}
              <ArrowRightIcon className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-2" />
            </Link>
            
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl">4.9/5 Rating</span>
              <span className="text-gray-400 text-sm">from 20,000+ happy customers</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Slider Controls (Minimalist) */}
      <div className="absolute bottom-12 right-12 z-30 flex items-center space-x-6">
         {slides.map((_: any, i: number) => (
           <button
             key={i}
             onClick={() => setCurrent(i)}
             className="group relative h-12 w-1 bg-white/20 rounded-full overflow-hidden transition-all duration-300"
           >
             <div 
               className={`absolute top-0 left-0 w-full bg-white transition-all duration-500 ${current === i ? 'h-full' : 'h-0'}`}
             />
           </button>
         ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-white/50"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] mb-2">Scroll</span>
        <ChevronDownIcon className="w-5 h-5" />
      </motion.div>
    </section>
  );
}