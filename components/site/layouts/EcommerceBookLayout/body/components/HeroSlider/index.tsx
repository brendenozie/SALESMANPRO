'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

interface BookSlide {
  imageUrl: string;
  productImgUrl?: string;
  headline: string;
  badgeText: string;
  subline?: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  price: string;
}

export interface BookDukaHeroProps {
  heroSlides?: BookSlide[] | null;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function BookDukaResponsiveHero({ heroSlides }: BookDukaHeroProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const defaultSlides: BookSlide[] = useMemo(() => [
    {
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
      productImgUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
      headline: 'The Silence of Modern Ink',
      badgeText: 'COLLECTION 001',
      description: 'A deep dive into contemporary African literature and the power of silent narratives.',
      ctaText: 'Shop Now',
      ctaLink: '/bookecommerce/products',
      price: 'KES 2,450',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
      productImgUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
      headline: 'Heritage in Hardback',
      badgeText: 'LIMITED EDITION',
      description: 'Collector’s editions featuring hand-pressed covers and archival-quality paper.',
      ctaText: 'Explore Collection',
      ctaLink: '/bookecommerce/products',
      price: 'KES 4,200',
    }
  ], []);

  const slides = useMemo(() => {
    return heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides;
  }, [heroSlides, defaultSlides]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  }, [slides.length]);

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x > threshold) {
      paginate(-1);
    } else if (info.offset.x < -threshold) {
      paginate(1);
    }
  };

  const activeSlide = slides[current] || defaultSlides[0];

  return (
    <section className="relative w-full min-h-[90vh] lg:h-[85vh] bg-white dark:bg-zinc-950 flex flex-col lg:grid lg:grid-cols-2 overflow-hidden transition-colors duration-300">
      
      {/* BACKGROUND DECOR FRAME */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.015] dark:opacity-[0.03] pointer-events-none select-none z-0">
        <AnimatePresence mode="wait">
          <motion.span 
            key={current}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="text-[32rem] sm:text-[45rem] font-black italic tracking-tighter leading-none"
          >
            0{current + 1}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* VISUAL COMPONENT LAYER (Tactile Asset Showcase) */}
      <div className="relative w-full h-[50vh] lg:h-full bg-zinc-50 dark:bg-zinc-900/20 flex items-center justify-center p-3 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-zinc-100 dark:border-zinc-900/60 transition-colors duration-300 z-10 [perspective:1200px]">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-100/30 dark:to-zinc-950/20 pointer-events-none" />
        
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, rotateY: direction > 0 ? 45 : -45, z: -100, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: -12, z: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: direction > 0 ? -45 : 45, z: -100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
            whileHover={{ scale: 1.02, rotateY: -6, transition: { duration: 0.3 } }}
            className="relative w-[85%] sm:w-[75%] lg:w-[85%] xl:w-[80%] h-[85%] max-h-[580px] lg:max-h-[640px] z-10 cursor-grab active:cursor-grabbing [transform-style:preserve-3d]"
          >
            <Image decoding="async"
              src={activeSlide.productImgUrl || activeSlide.imageUrl || defaultSlides[0].imageUrl}
              alt={activeSlide.headline || 'Featured Book Cover'}
              fill
              className="object-contain drop-shadow-[20px_30px_45px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_25px_60px_rgba(20,184,166,0.18)] select-none pointer-events-none"
              priority
            />
            
            {/* Gesture Overlay HUD for Mobile Screens */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 lg:hidden opacity-40 select-none pointer-events-none whitespace-nowrap">
              <ChevronLeftIcon className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[9px] font-black tracking-[0.2em] uppercase">Swipe Cover</span>
              <ChevronRightIcon className="w-3.5 h-3.5 animate-pulse" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* TYPOGRAPHY CONTROL BLOCKS */}
      <div className="w-full h-auto lg:h-full flex flex-col justify-between lg:justify-center px-6 sm:px-12 md:px-16 xl:px-24 pt-8 lg:pt-0 pb-28 sm:pb-32 lg:pb-24 relative z-20">
        <div className="max-w-xl w-full mx-auto lg:mx-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 sm:space-y-8"
            >
              <div className="space-y-3">
                <span className="inline-block text-teal-600 dark:text-teal-400 font-black text-[10px] lg:text-xs tracking-[0.35em] uppercase">
                  {activeSlide.badgeText || 'COLLECTION 001'}
                </span>
                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold text-zinc-900 dark:text-white leading-[1.1] tracking-tight text-balance">
                  {activeSlide.headline}
                </h1>
              </div>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base xl:text-lg max-w-md leading-relaxed font-normal">
                {activeSlide.description || activeSlide.subline}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8 pt-2">
                <Link href={activeSlide.ctaLink || '/bookecommerce/products'} className="w-full sm:w-auto">
                  <motion.span 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black px-8 py-4 rounded-xl font-bold cursor-pointer shadow-md hover:shadow-lg transition-all text-sm uppercase tracking-wider"
                  >
                    <span>{activeSlide.ctaText}</span>
                    <ShoppingBagIcon className="w-4 h-4 flex-shrink-0" />
                  </motion.span>
                </Link>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:block h-8 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                  <div>
                    <span className="block text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-widest mb-0.5">Price</span>
                    <span className="text-xl xl:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{activeSlide.price}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CONTROLS INTERFACE ARCHITECTURE (NOW POSITIONED SAFELY BELOW BUTTONS) */}
        <div className="absolute bottom-6 lg:bottom-8 left-6 sm:left-12 lg:left-16 xl:left-24 flex items-center gap-4 z-30">
          <div className="flex bg-zinc-900/90 dark:bg-zinc-100/90 backdrop-blur-md rounded-xl p-1 shadow-lg border border-white/10 dark:border-black/5">
            <button 
              onClick={() => paginate(-1)}
              className="p-2.5 rounded-lg text-zinc-300 dark:text-zinc-700 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/5 transition-all focus:outline-none"
              aria-label="Previous literary canvas item"
            >
              <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="w-[1px] bg-zinc-700 dark:bg-zinc-300 self-stretch my-1.5" />
            <button 
              onClick={() => paginate(1)}
              className="p-2.5 rounded-lg text-zinc-300 dark:text-zinc-700 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/5 transition-all focus:outline-none"
              aria-label="Next literary canvas item"
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="hidden sm:block text-[10px] font-black tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase select-none">
             0{current + 1} &mdash; 0{slides.length}
          </div>
        </div>
      </div>
    </section>
  );
}