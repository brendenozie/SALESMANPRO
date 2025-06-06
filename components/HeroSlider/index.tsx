'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useStoreContext } from '../../contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface Slide {
  imageUrl: string;
  subline: string;
  headline: string;
  ctaText?: string;
  ctaLink?: string;
}

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

export default function HeroSlider() {
  const { storeFormData } = useStoreContext();
  const heroSlides: Slide[] = (storeFormData.heroSlides || []).map((slide: any) => ({
    ...slide,
    subline: slide.subline ?? '',
  }));

  const primary = storeFormData.themeSettings?.primaryColor || '#f97316';
  const secondary = storeFormData.themeSettings?.secondaryColor || '#3b82f6';

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<HTMLDivElement>(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlides.length > 0) {
      if (progressRef.current) {
        progressRef.current.style.transition = 'none';
        progressRef.current.style.width = '0%';
        progressRef.current.offsetWidth; // force reflow
        progressRef.current.style.transition = `width ${autoAdvanceDelay}ms linear`;
        progressRef.current.style.width = '100%';
      }

      timeoutRef.current = setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % heroSlides.length);
      }, autoAdvanceDelay);
    }
  }, [heroSlides.length]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const goTo = (idx: number, dir = 0) => {
    clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  };

  const prevSlide = () => {
    if (heroSlides.length > 0) {
      goTo((current - 1 + heroSlides.length) % heroSlides.length, -1);
    }
  };
  const nextSlide = () => {
    if (heroSlides.length > 0) {
      goTo((current + 1) % heroSlides.length, 1);
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    if (offset < -50) nextSlide();
    else if (offset > 50) prevSlide();
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      x: '0%',
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1,
    }),
  };

  return (
    <section className="relative h-screen max-h-[800px] overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        {heroSlides.map((slide, idx) =>
          idx === current ? (
            <motion.div
              key={idx}
              className="absolute inset-0 w-full h-full flex"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: transitionDuration, ease: 'easeInOut' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
            >
              {/* Parallax Background */}
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.2, x: direction > 0 ? 80 : -80 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                <Image
                  src={slide.imageUrl}
                  alt={slide.headline}
                  fill
                  className="object-cover"
                  loader={loader}
                  priority
                />
                {/* Multi‐stop gradient overlay for legibility */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 80%)',
                  }}
                />
              </motion.div>

              {/* Content */}
              <div className="relative flex flex-col justify-center items-start px-6 md:px-16 lg:px-24 text-white w-full">
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-sm md:text-base lg:text-lg uppercase tracking-wider mb-3"
                >
                  {slide.subline}
                </motion.p>

                <motion.h2
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-3xl md:text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
                >
                  {slide.headline}
                </motion.h2>

                {slide.ctaLink && slide.ctaText && (
                   <motion.a
                   href={slide.ctaLink}
                   initial={{ scale: 0.9, opacity: 0 }}
                   animate={{ scale: 1, opacity: 1 }}
                   transition={{ delay: 0.7, duration: 0.6 }}
                   className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all px-8 py-3 rounded-full text-white font-semibold shadow-xl tracking-wide"
                 >
                   {slide.ctaText}
                 </motion.a>
                )}
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r"
          style={{
            backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})`,
            width: '0%',
          }}
        />
      </div>

      {/* Prev / Next Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full text-white shadow-md transition z-10"
        aria-label="Previous slide"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full text-white shadow-md transition z-10"
        aria-label="Next slide"
      >
        <ArrowRightIcon className="h-6 w-6" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx, idx > current ? 1 : -1)}
            className={`relative w-3 h-3 rounded-full overflow-hidden transition-all ${
              idx === current ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          >
            {idx === current && (
              <span className="absolute inset-0 block animate-pulse opacity-75 rounded-full bg-white" />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
