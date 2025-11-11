'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide, StoreForm } from '@/types/typings';

// Loader remains the same
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Default slides (updated to include colors for demonstration)
const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    headline: 'STEP INTO STYLE & COMFORT',
    subline: 'Shoes',
    badgeText: 'Out too the been like hard off. Improve enquire welcome own beloved matters her. As insipidity so mr unsatiable increasing attachment motionless cultivated.',
    ctaText: 'Buy Now',
    ctaLink: '/shop',
    id: '1',
    companyId: '',
    type: null,
    productImageUrl: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: '#fde6e6', // NEW: Added example color
    textColor: '#442c2c' // NEW: Added example color
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    headline: 'ELEVATE YOUR LOOK TODAY',
    subline: 'Awesome',
    badgeText: 'Discover fresh drops and timeless classics. Comfort and style perfectly combined.',
    ctaText: 'Shop Now',
    ctaLink: '/collection',
    id: '2',
    companyId: '',
    type: null,
    productImageUrl: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: '#e6f0fd', // NEW: Added example color
    textColor: '#2c3a44' // NEW: Added example color
  },
];

const transitionDuration = 0.6;
const autoAdvanceDelay = 6000;

// NEW: Animation variants for orchestration
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: transitionDuration,
      ease: 'easeInOut',
      // NEW: Stagger children animations after parent is 'center'
      staggerChildren: 0.2,
    },
  },
  exit: (dir: number) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: transitionDuration, ease: 'easeInOut' },
  }),
};

// NEW: Variants for the content *inside* the slide
const contentVariants = {
  enter: { opacity: 0, y: 20 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const imageVariants = {
  enter: { opacity: 0, scale: 0.8 },
  center: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.6, -0.05, 0.01, 0.99] }, // A nice springy ease
  },
};

export interface HeroSliderProps {
  heroSlides?: HeroSlide[];
  themeSettings?: any;
}

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  // Map the store data (this logic is preserved)
  const slides: HeroSlide[] =
    (heroSlides && heroSlides.length > 0
      ? heroSlides.map((slide, i) => ({
          ...slide,
          imageUrl: slide.productImageUrl || slide.imageUrl || defaultSlides[i % defaultSlides.length].imageUrl,
          headline: slide.headline || defaultSlides[i % defaultSlides.length].headline,
          subline: slide.subline || defaultSlides[i % defaultSlides.length].subline,
          badgeText: (slide as any).badgeText || defaultSlides[i % defaultSlides.length].badgeText,
          ctaText: slide.ctaText || defaultSlides[i % defaultSlides.length].ctaText,
          ctaLink: slide.ctaLink || defaultSlides[i % defaultSlides.length].ctaLink,
          // NEW: Ensure colors have fallbacks
          backgroundColor: slide.backgroundColor || defaultSlides[i % defaultSlides.length].backgroundColor,
          textColor: slide.textColor || defaultSlides[i % defaultSlides.length].textColor,
        }))
      : defaultSlides);

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

  // NEW: Go to a specific slide (for dots)
  const goToSlide = (index: number) => {
    if (index === current) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, autoAdvanceDelay);
  }, [nextSlide]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    resetTimer(); // Reset timer on manual drag
    const offset = info.offset.x;
    if (offset < -50) nextSlide();
    else if (offset > 50) prevSlide();
  };

  return (
    // CHANGED: Removed py-20, background set to a neutral fallback
    <section className="relative mt-12 overflow-hidden bg-gray-50">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative">
        
        {/* NEW: Wrapper to define height and contain absolute slides */}
        {/* This min-height is crucial for preventing layout collapse */}
        <div className="relative min-h-[70vh] md:min-h-[65vh] lg:min-h-[75vh] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            {/* We only render the *current* slide.
              AnimatePresence handles the exiting slide's animation.
            */}
            <motion.div
              // CHANGED: Key is now stable (slide.id or index)
              key={current}
              // CHANGED: This is the critical fix.
              className="absolute inset-0 flex flex-col-reverse md:flex-row items-center justify-between"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1} // Add a bit of elastic drag
              onDragEnd={handleDragEnd}
              // NEW: Apply dynamic background color
              style={{
                backgroundColor: slides[current].backgroundColor || '#f9fafb',
              }}
              // NEW: Add transition to the background color for a smooth change
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              {/* Image & Text Overlay */}
              <div className="w-full md:w-1/2 relative flex justify-center items-center p-4">
                <motion.div
                  // CHANGED: Use variants for orchestration
                  variants={imageVariants}
                  className="relative z-10 w-full max-w-[500px]"
                >
                  <Image
                    src={slides[current].imageUrl || ''}
                    alt={slides[current].headline || 'Hero Slide Image'}
                    loader={loader}
                    width={600}
                    height={600}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                  {/* CHANGED: Watermark text with lower opacity */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(20vw,200px)] font-extrabold text-gray-500 opacity-10 pointer-events-none z-0 select-none">
                    {slides[current].subline || 'SNRS'}
                  </div>
                </motion.div>
              </div>

              {/* Content */}
              {/* NEW: This container staggers its children */}
              <motion.div
                variants={contentVariants} // This item itself animates in
                className="w-full md:w-1/2 relative z-10 text-center md:text-left mt-10 md:mt-0 px-4"
                // NEW: Apply dynamic text color
                style={{
                  color: slides[current].textColor || '#11182c',
                }}
              >
                <motion.h2
                  // NEW: Each child animates
                  variants={contentVariants}
                  className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight"
                >
                  {slides[current]?.headline?.split(' ').map((word, i, arr) => (
                    <span key={i} className="inline-block">
                      {word}
                      {i === arr.length - 1 && (
                        <span className="text-red-500">.</span>
                      )}
                      {i !== arr.length - 1 && ' '}
                    </span>
                  ))}
                </motion.h2>

                <motion.p
                  // NEW: Each child animates
                  variants={contentVariants}
                  // CHANGED: Use dynamic text color with fallback opacity
                  className="text-current opacity-70 text-sm sm:text-base mt-6 max-w-lg mx-auto md:mx-0"
                >
                  {slides[current].badgeText}
                </motion.p>

                <motion.div
                  // NEW: Each child animates
                  variants={contentVariants}
                >
                  <Link
                    href={slides[current].ctaLink || '/shop'}
                    className="inline-block mt-8 font-semibold text-sm sm:text-base px-8 py-4 rounded-full bg-red-500 text-white shadow-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 hover:shadow-xl"
                  >
                    {slides[current].ctaText}
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {/* CHANGED: Larger, slightly more prominent */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 md:left-12 -translate-y-1/2 p-4 rounded-full bg-white/60 backdrop-blur-sm text-gray-800 shadow-md transition-all hover:bg-white hover:scale-110 z-20"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 md:right-12 -translate-y-1/2 p-4 rounded-full bg-white/60 backdrop-blur-sm text-gray-800 shadow-md transition-all hover:bg-white hover:scale-110 z-20"
        >
          <ArrowRightIcon className="h-6 w-6" />
        </button>

        {/* NEW: Pagination Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`h-3 w-3 rounded-full transition-all ${
                i === current ? 'w-6 bg-red-500' : 'bg-white/70 backdrop-blur-sm'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}