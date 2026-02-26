'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    subline: 'Exclusive Offer',
    headline: 'STEP INTO\nSTYLE & COMFORT',
    badgeText:
      'Out too the been like hard off. Improve enquire welcome own beloved matters her. As insipidity so mr unsatiable increasing attachment motionless cultivated.',
    ctaText: 'Buy Now',
    ctaLink: '/shop',
    id: '',
    companyId: '',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    subline: 'New Collection',
    headline: 'ELEVATE YOUR\nLOOK TODAY',
    badgeText: 'Discover fresh drops and timeless classics. Comfort and style perfectly combined.',
    ctaText: 'Shop Now',
    ctaLink: '/collection',
    id: '',
    companyId: '',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
  },
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const defaultPrimaryColor = '#6B46C1';
  const defaultSecondaryColor = '#D53F8C';

  const heroSlidesToShow: HeroSlide[] = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides).map(
    (slide, index) => ({
      ...slide,
      imageUrl: slide.imageUrl || defaultSlides[index]?.imageUrl || defaultSlides[0].imageUrl,
      subline: slide.subline || 'Exclusive Offer',
      headline: slide.headline || defaultSlides[index]?.headline || 'Unlock Amazing Deals Now!',
      badgeText:
        slide.badgeText ||
        defaultSlides[index]?.badgeText ||
        'Discover curated collections and exceptional savings on your favorite products.',
      ctaText: slide.ctaText || 'Explore Collections',
      ctaLink: slide.ctaLink || '/shop',
    })
  );

  const primary = themeSettings?.primaryColor || defaultPrimaryColor;
  const secondary = themeSettings?.secondaryColor || defaultSecondaryColor;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const progressRef = useRef<HTMLDivElement>(null);

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlidesToShow.length > 0) {
      if (progressRef.current) {
        progressRef.current.style.transition = 'none';
        progressRef.current.style.width = '0%';
        // force reflow
        // @ts-ignore
        progressRef.current.offsetWidth;
        progressRef.current.style.transition = `width ${autoAdvanceDelay}ms linear`;
        progressRef.current.style.width = '100%';
      }
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

  const prevSlide = () =>
    goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1);
  const nextSlide = () => goTo((current + 1) % heroSlidesToShow.length, 1);

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
      transition: { duration: transitionDuration, ease: 'easeOut' },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { duration: transitionDuration, ease: 'easeInOut' },
    }),
  };

  return (
    <section className="relative mt-20 py-16 overflow-hidden min-h-[500px]">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {heroSlidesToShow.map(
            (slide, idx) =>
              idx === current && (
                <motion.div
                  key={idx}
                  className="relative overflow-hidden rounded-3xl shadow-2xl group flex flex-col md:flex-row h-[500px]"
                  style={{ willChange: 'transform, opacity' }}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={handleDragEnd}
                >
                  {/* IMAGE PANEL */}
                  {/* IMAGE PANEL */}
                  <div className="relative w-full md:w-1/2 overflow-hidden will-change-transform h-full"> 
                    {/* FIX 1: Set inner image wrapper to h-full (no fixed pixel heights for mobile) */}
                    <div className="relative h-full w-full overflow-hidden">
                      <Image
                        src={
                          slide.imageUrl ||
                          'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80'
                        }
                        alt={slide.headline || 'Hero Image'}
                        fill
                        sizes="100vw"
                        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        loader={loader}
                        priority
                      />
                    </div>

                    {/* FIX 2: Mobile Gradient for Contrast (kept the to-black/70 fix) */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 z-10 md:hidden" />

                    {/* Mobile Text - Z-INDEX CONFIRMATION */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-30 text-white md:hidden"> 
                      <h2 className="text-2xl font-bold">{slide.headline}</h2>
                      {slide.badgeText && (
                        <p className="text-sm mt-2 line-clamp-3">{slide.badgeText}</p>
                      )}
                      {slide.ctaLink && slide.ctaText && (
                        <Link
                          href={slide.ctaLink}
                          className="inline-block mt-3 bg-white text-black font-medium px-4 py-2 rounded-md"
                        >
                          {slide.ctaText}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* TEXT PANEL (Desktop) */}
                  <div className="hidden md:flex md:w-1/2 px-6 py-20 md:px-12 lg:px-20 flex-col justify-center relative overflow-hidden">
                    {/* Translucent gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-white/30 backdrop-blur-[2px]" />

                    <div className="relative z-10 space-y-6 text-gray-900">
                      {/* Badge */}
                      <motion.span
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-block px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold shadow-md"
                        style={{ background: primary, color: 'white' }}
                      >
                        {slide.subline}
                      </motion.span>

                      {/* Headline */}
                      <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-md"
                      >
                        {(slide.headline ?? '').split('\n').map((line, i, arr) => (
                                            <React.Fragment key={i}>
                                              {line.includes('$') ? (
                                                <>
                                                  {line.split('$')[0]}
                                                  <span style={{ color: secondary }}>{line.split('$')[1]}</span>
                                                </>
                                              ) : (
                                                line
                                              )}
                                              {i < arr.length - 1 && <br />}
                                            </React.Fragment>
                                          ))}      
                      </motion.h2>

                      {/* Description */}
                      {slide.badgeText && (
                        <motion.p
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                          className="text-gray-800 text-base sm:text-lg max-w-md drop-shadow-sm"
                        >
                          {slide.badgeText}
                        </motion.p>
                      )}

                      {/* CTA Button */}
                      {slide.ctaLink && slide.ctaText && (
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8, duration: 0.5 }}
                        >
                          <Link
                            href={slide.ctaLink}
                            className="inline-block font-semibold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg transition transform duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden"
                            style={{ background: primary, color: 'white' }}
                          >
                            {slide.ctaText}
                            <span className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                          </Link>
                        </motion.div>
                      )}
                    </div>
                  </div>

                </motion.div>
              )
          )}
        </AnimatePresence>

        {/* ARROWS */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-8 md:left-10 transform -translate-y-1/2 bg-white/50 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-30 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-8 md:right-10 transform -translate-y-1/2 bg-white/50 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-30 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-5 w-5 md:h-6 md:w-6" />
        </button>

        {/* PAGINATION DOTS */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
          {heroSlidesToShow.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > current ? 1 : -1)}
              className={`relative w-3.5 h-3.5 rounded-full overflow-hidden transition-all duration-300 border-2 ${
                idx === current
                  ? 'border-white scale-125'
                  : 'border-gray-400 opacity-70 hover:scale-110'
              }`}
            >
              {idx === current && (
                <div
                  ref={progressRef}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ backgroundColor: 'white', width: '0%' }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
