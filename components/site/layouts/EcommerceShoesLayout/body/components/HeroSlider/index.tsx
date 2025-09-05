'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useStoreContext } from '../../../../../../../contexts/StoreContext';
import { StoreForm } from '@/types/typings';

// Loader remains the same for Next.js image optimization
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Interface for each slide
interface Slide {
  imageUrl: string;
  headline: string;
  subline: string;
  badgeText: string;
  ctaText: string;
  ctaLink: string;
}

const defaultSlides: Slide[] = [
  {
    imageUrl: '/images/nike-shoe.png',
    headline: 'STEP INTO STYLE & COMFORT',
    subline: 'Shoes',
    badgeText:
      'Out too the been like hard off. Improve enquire welcome own beloved matters her. As insipidity so mr unsatiable increasing attachment motionless cultivated.',
    ctaText: 'Buy Now',
    ctaLink: '/shop',
  },
  {
    imageUrl: '/images/another-shoe.png',
    headline: 'ELEVATE YOUR LOOK TODAY',
    subline: 'Awesome',
    badgeText:
      'Discover fresh drops and timeless classics. Comfort and style perfectly combined.',
    ctaText: 'Shop Now',
    ctaLink: '/collection',
  },
];

const transitionDuration = 0.6;
const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  storeFormData: StoreForm | null;
}

export default function HeroSlider({ storeFormData }: HeroSliderProps) {
  // Map the store data to the Slide interface, providing fallbacks for missing data
  const slides: Slide[] =
    (storeFormData?.heroSlides && storeFormData.heroSlides.length > 0
      ? storeFormData.heroSlides.map((slide) => ({
          imageUrl: slide.imageUrl || defaultSlides[0].imageUrl,
          headline: slide.headline || defaultSlides[0].headline,
          subline: slide.subline || defaultSlides[0].subline,
          badgeText: (slide as any).badgeText || defaultSlides[0].badgeText, // Safely handle the description property
          ctaText: slide.ctaText || defaultSlides[0].ctaText,
          ctaLink: slide.ctaLink || defaultSlides[0].ctaLink,
        }))
      : defaultSlides);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

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

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
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
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: transitionDuration, ease: 'easeInOut' },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { duration: transitionDuration, ease: 'easeInOut' },
    }),
  };

  return (
    <section className="relative mt-12 py-20 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative">
        <AnimatePresence initial={false} custom={direction}>
          {slides.map((slide, idx) =>
            idx === current ? (
              <motion.div
                key={idx}
                className="relative flex flex-col-reverse md:flex-row items-center justify-between"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
              >
                {/* Image & Text Overlay */}
                <div className="w-full md:w-1/2 relative flex justify-center items-center p-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="relative z-10 w-full max-w-[500px]"
                  >
                    <Image
                      src={slide.imageUrl}
                      alt={slide.headline}
                      loader={loader}
                      width={600}
                      height={600}
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(20vw,200px)] font-extrabold text-gray-200 opacity-40 pointer-events-none z-0 select-none">
                      {slide.subline || 'SNRS'}
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="w-full md:w-1/2 relative z-10 text-center md:text-left mt-10 md:mt-0 px-4">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-black">
                    {slide.headline.split(' ').map((word, i, arr) => (
                      <span key={i} className="inline-block">
                        {word}
                        {i === arr.length - 1 && (
                          <span className="text-red-500">.</span>
                        )}
                        {i !== arr.length - 1 && ' '}
                      </span>
                    ))}
                  </h2>

                  <p className="text-gray-600 text-sm sm:text-base mt-6 max-w-lg mx-auto md:mx-0">
                    {slide.badgeText}
                  </p>

                  <Link
                    href={slide.ctaLink}
                    className="inline-block mt-8 font-semibold text-sm sm:text-base px-8 py-4 rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 hover:scale-105"
                  >
                    {slide.ctaText}
                  </Link>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 md:left-12 -translate-y-1/2 p-3 rounded-full bg-white/50 backdrop-blur-sm text-gray-700 shadow-md transition-all hover:bg-white z-20"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 md:right-12 -translate-y-1/2 p-3 rounded-full bg-white/50 backdrop-blur-sm text-gray-700 shadow-md transition-all hover:bg-white z-20"
        >
          <ArrowRightIcon className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}