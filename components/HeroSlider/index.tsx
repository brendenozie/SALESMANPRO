'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useStoreContext } from '../../contexts/StoreContext';

// Loader remains the same so Next.js can optimize your images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Each slide should at minimum have an imageUrl/headline/subline.
// Description and CTA are optional but recommended.
interface Slide {
  imageUrl: string;
  subline: string;
  headline: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

export default function HeroSlider() {
  const { storeFormData } = useStoreContext();

  // Map your backend “heroSlides” into our shape:
  const heroSlides: Slide[] = (storeFormData.heroSlides || []).map((slide: any) => ({
    imageUrl: slide.imageUrl,
    subline: slide.subline || 'Free Shipping – orders over $100',
    headline: slide.headline || 'Free Shipping on orders over $100',
    description:
      slide.description ||
      'First-time customers enjoy free shipping after all discounts and promotions are applied.',
    ctaText: slide.ctaText || 'Shop Now',
    ctaLink: slide.ctaLink || '/shop',
  }));

  // These theme colors control the little progress bar at the bottom:
  const primary = storeFormData.themeSettings?.primaryColor || '#10B981'; // default: emerald
  const secondary = storeFormData.themeSettings?.secondaryColor || '#3B82F6'; // default: blue

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<HTMLDivElement>(null);

  // Reset the auto-advance timer & animate the little progress bar
  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlides.length > 0) {
      if (progressRef.current) {
        progressRef.current.style.transition = 'none';
        progressRef.current.style.width = '0%';
        // Force reflow so that “none” → “linear” takes effect
        // @ts-ignore
        progressRef.current.offsetWidth;
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
      scale: 1.02,
    }),
    center: {
      x: '0%',
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.02,
    }),
  };

  return (
    <section className="relative mt-16 py-16 bg-gray-50">
      <div className="container mx-auto py-8 px-4 md:px-8 lg:px-16">
        <AnimatePresence initial={false} custom={direction}>
          {heroSlides.map((slide, idx) =>
            idx === current ? (
              <motion.div
                key={idx}
                className="relative flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-lg bg-white"
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
                {/* ========= LEFT PANEL: TEXT CONTENT ========= */}
                <div className="w-full md:w-1/2 px-6 py-12 md:px-12 lg:px-20 flex flex-col justify-center relative">
                  {/* Semi-opaque “glass” panel behind text for contrast */}
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-3xl"></div>
                  <div className="relative space-y-6">
                    {/* Badge */}
                    <span className="inline-block bg-yellow-400 text-black text-xs sm:text-sm font-semibold px-3 py-1 rounded-md">
                      {slide.subline}
                    </span>

                    {/* Headline */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                      {slide.headline.includes('$') ? (
                        <>
                          {slide.headline.split('$')[0]}
                          <span className="text-green-500">${slide.headline.split('$')[1]}</span>
                        </>
                      ) : (
                        slide.headline
                      )}
                    </h2>

                    {/* Description */}
                    {slide.description && (
                      <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-md">
                        {slide.description}
                      </p>
                    )}

                    {/* CTA Button */}
                    {slide.ctaLink && slide.ctaText && (
                      <a
                        href={slide.ctaLink}
                        className="inline-block bg-green-500 hover:bg-green-600 text-white font-semibold text-sm sm:text-base px-6 py-3 rounded-full shadow-md transition transform hover:scale-105"
                      >
                        {slide.ctaText}
                      </a>
                    )}
                  </div>
                </div>

                {/* ========= RIGHT PANEL: IMAGE + BLOB ACCENT ========= */}
                <div className="hidden md:block md:w-1/2 relative overflow-hidden">
                  {/* Faint SVG “blob” behind the photo */}
                  <svg
                    className="absolute -bottom-10 -right-20 w-[400px] h-[400px] text-green-50"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M314.5 92.7C332 157.2 289 218.3 234.6 254.6C180.2 290.8 115.3 302.2 63.8 273C12.3 243.8 -2.1 175.1 11.8 118.7C25.7 62.3 68.1 18.2 122.3 7.8C176.5 -2.6 247 28.2 314.5 92.7Z"
                      fill="currentColor"
                    />
                  </svg>

                  {/* The actual produce image */}
                  <Image
                    src={slide.imageUrl}
                    alt={slide.headline}
                    fill
                    className="object-cover object-center rounded-r-3xl"
                    loader={loader}
                    priority
                  />
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* ========= PROGRESS BAR ========= */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
          <div
            ref={progressRef}
            className="h-full bg-gradient-to-r"
            style={{
              backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})`,
              width: '0%',
            }}
          />
        </div>

        {/* ========= PREV / NEXT BUTTONS ========= */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 p-2 md:p-3 rounded-full text-gray-700 shadow-md transition z-20"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-6 w-6 md:h-7 md:w-7" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 p-2 md:p-3 rounded-full text-gray-700 shadow-md transition z-20"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-6 w-6 md:h-7 md:w-7" />
        </button>

        {/* ========= PAGINATION DOTS ========= */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > current ? 1 : -1)}
              className={`relative w-3 h-3 rounded-full overflow-hidden transition-all ${
                idx === current ? 'bg-gray-800' : 'bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              {idx === current && (
                <span className="absolute inset-0 block animate-pulse opacity-60 rounded-full bg-gray-800" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
