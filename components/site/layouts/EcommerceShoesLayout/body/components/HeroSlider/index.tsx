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
  description: string;
  ctaText: string;
  ctaLink: string;
}

const defaultSlides: Slide[] = [
  {
    imageUrl: '/images/nike-shoe.png',
    headline: 'STEP INTO STYLE & COMFORT',
    subline: 'Shoes',
    description:
      'Out too the been like hard off. Improve enquire welcome own beloved matters her. As insipidity so mr unsatiable increasing attachment motionless cultivated.',
    ctaText: 'Buy Now',
    ctaLink: '/shop',
  },
  {
    imageUrl: '/images/another-shoe.png',
    headline: 'ELEVATE YOUR LOOK TODAY',
    subline: 'Awesome',
    description:
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
  // Use a different name for the slides data to avoid conflict
  const storeSlides: Slide[] | undefined = storeFormData?.heroSlides as Slide[];

  // Use store data if available, otherwise fall back to default slides
  const slides: Slide[] =
    (storeSlides && storeSlides.length > 0 ? storeSlides : defaultSlides).map((slide, index) => ({
      imageUrl: slide.imageUrl || defaultSlides[index]?.imageUrl || defaultSlides[0].imageUrl,
      headline: slide.headline || defaultSlides[index]?.headline,
      subline: slide.subline || defaultSlides[index]?.subline,
      description: slide.description || defaultSlides[index]?.description,
      ctaText: slide.ctaText || defaultSlides[index]?.ctaText,
      ctaLink: slide.ctaLink || defaultSlides[index]?.ctaLink,
    }));

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, slides]); // Added slides to the dependency array to reset the timer when data changes

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, autoAdvanceDelay);
  }, [slides]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
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
      transition: { duration: transitionDuration },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { duration: transitionDuration },
    }),
  };

  return (
    <section className="relative mt-12 py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative">
        <AnimatePresence initial={false} custom={direction}>
          {slides.map((slide, idx) =>
            idx === current ? (
              <motion.div
                key={idx}
                className="relative flex flex-col md:flex-row items-center justify-between"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
              >
                {/* Overlay big SNEAKERS text */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                     text-[min(20vw,220px)] font-extrabold text-gray-200 opacity-40 pointer-events-none z-0"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {slide.subline || 'SNEAKERS'}
                </div>

                {/* LEFT CONTENT */}
                <div className="w-full md:w-1/2 relative z-10">
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-black">
                    {slide.headline.split(' ').map((word, i, arr) =>
                      i === arr.length - 1 ? (
                        <span key={i} className="text-black">
                          {word}
                        </span>
                      ) : (
                        word + ' '
                      )
                    )}
                  </h2>

                  <p className="text-gray-600 text-sm sm:text-base mt-6 max-w-sm">
                    {slide.description}
                  </p>

                  <Link
                    href={slide.ctaLink}
                    className="inline-block mt-6 font-semibold text-sm sm:text-base px-6 py-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    {slide.ctaText}
                  </Link>
                </div>

                {/* RIGHT IMAGE */}
                <div className="w-full md:w-1/2 relative flex justify-center items-center mt-10 md:mt-0">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.headline}
                    loader={loader}
                    width={500}
                    height={500}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 p-3 rounded-full bg-gray-100 text-gray-700 shadow hover:bg-gray-200 transition z-20"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 p-3 rounded-full bg-gray-100 text-gray-700 shadow hover:bg-gray-200 transition z-20"
        >
          <ArrowRightIcon className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}