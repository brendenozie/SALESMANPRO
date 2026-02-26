'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.8;
const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=80',
    subline: 'The Midnight Limited Edition features new subtle accents of white luminescent hands and new raised steel indices.',
    headline: 'Timeless Elegance',
    ctaText: 'Explore',
    ctaLink: '/shop',
    id: '1',
    companyId: '',
    productImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    badgeText: '',
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: '#000000',
    textColor: '#FFFFFF',
    videoLink: null,
    type: null,
  }
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const heroSlidesToShow = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);

  const primary = themeSettings?.primaryColor || '#C5A059'; // Golden accent from image
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlidesToShow.length > 1) {
      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % heroSlidesToShow.length);
      }, autoAdvanceDelay);
    }
  }, [heroSlidesToShow.length]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const goTo = (idx: number, dir = 0) => {
    clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  };

  const prevSlide = () => goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1);
  const nextSlide = () => goTo((current + 1) % heroSlidesToShow.length, 1);

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 100 : -100 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir < 0 ? 100 : -100 })
  };

  return (
    <section className="relative w-full bg-[#0a0a0a] min-h-[600px] lg:h-[80vh] flex items-center overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {heroSlidesToShow.map((slide, idx) => (
          idx === current && (
            <motion.div
              key={slide.id || idx}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {/* Left Content */}
              <div className="lg:col-span-5 space-y-8 z-10">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-bold text-white leading-[1.1]"
                >
                  {slide.headline}
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-400 text-lg md:text-xl max-w-md leading-relaxed"
                >
                  {slide.subline}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    href={slide.ctaLink || '#'}
                    className="inline-block bg-[#C5A059] hover:bg-[#b38f4d] text-white font-bold uppercase tracking-widest px-10 py-4 transition-colors"
                  >
                    {slide.ctaText}
                  </Link>
                </motion.div>
              </div>

              {/* Right Images Layout */}
              <div className="lg:col-span-7 relative flex items-center justify-end h-[400px] md:h-[500px]">
                {/* Secondary/Detail Image (Narrow) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="relative w-1/4 h-full mr-4 hidden md:block overflow-hidden rounded-sm"
                >
                   <Image
                    src={slide.productImageUrl || slide.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'  }
                    alt="Detail view"
                    fill
                    className="object-cover"
                    loader={loader}
                  />
                </motion.div>

                {/* Main Hero Image */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative w-full md:w-3/4 h-full overflow-hidden rounded-sm"
                >
                  <Image
                    src={slide.imageUrl || slide.productImageUrl || 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=80'}
                    alt={slide.headline || 'Hero image'}
                    fill
                    className="object-cover"
                    loader={loader}
                    priority
                  />
                </motion.div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Navigation Controls */}
      {heroSlidesToShow.length > 1 && (
        <div className="absolute bottom-10 right-10 flex space-x-4 z-20">
          <button 
            onClick={prevSlide}
            className="p-3 border border-gray-700 text-white hover:bg-white hover:text-black transition-all"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="p-3 border border-gray-700 text-white hover:bg-white hover:text-black transition-all"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </section>
  );
}