'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useStoreContext } from '../../../../../../../contexts/StoreContext';
import { HeroSlide, StoreForm } from '@/types/typings';

// Loader remains the same for Next.js image optimization
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

export interface HeroSliderProps {
  storeFormData: StoreForm | null;
}

// Default slides with a subline and a full, rich set of content
const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    subline: 'Exclusive Offer',
    headline: 'STEP INTO\nSTYLE & COMFORT',
    badgeText: 'Out too the been like hard off. Improve enquire welcome own beloved matters her. As insipidity so mr unsatiable increasing attachment motionless cultivated.',
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
    textColor: null
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
    textColor: null
  },
];

export default function HeroSlider({ storeFormData }: HeroSliderProps) {
  const storeSlides: HeroSlide[] | undefined = storeFormData?.heroSlides;
  const defaultPrimaryColor = '#6B46C1'; // deep purple
  const defaultSecondaryColor = '#D53F8C'; // vibrant pink

  const heroSlides: HeroSlide[] = (storeSlides && storeSlides.length > 0 ? storeSlides : defaultSlides).map((slide, index) => ({
    imageUrl: slide.imageUrl || defaultSlides[index]?.imageUrl || defaultSlides[0].imageUrl,
    subline: slide.subline || 'Exclusive Offer',
    headline: slide.headline || defaultSlides[index]?.headline || 'Unlock Amazing Deals Now!',
    badgeText: slide.badgeText || defaultSlides[index]?.badgeText || 'Discover curated collections and exceptional savings on your favorite products.',
    ctaText: slide.ctaText || 'Explore Collections',
    ctaLink: slide.ctaLink || '/shop',
    id: slide.id || '',
    companyId: slide.companyId || '',
    productImageUrl: slide.productImageUrl || null,
    price: slide.price || null,
    endsAt: slide.endsAt || null,
    order: slide.order || 0,
    iconKey: slide.iconKey || null,
    backgroundColor: slide.backgroundColor || null,
    textColor: slide.textColor || null
  }));

  const primary = storeFormData?.themeSettings?.primaryColor || defaultPrimaryColor;
  const secondary = storeFormData?.themeSettings?.secondaryColor || defaultSecondaryColor;

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
        // Force reflow
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
      scale: 0.98,
    }),
    center: {
      x: '0%',
      opacity: 1,
      scale: 1,
      transition: {
        x: { duration: transitionDuration, ease: 'easeInOut' },
        opacity: { duration: transitionDuration * 0.7, ease: 'easeOut' },
        scale: { duration: transitionDuration, ease: 'easeOut' },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { duration: transitionDuration, ease: 'easeInOut' },
        opacity: { duration: transitionDuration * 0.7, ease: 'easeOut' },
        scale: { duration: transitionDuration, ease: 'easeOut' },
      },
    }),
  };

  return (
    <section className="relative mt-16 py-16 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <AnimatePresence initial={false} custom={direction}>
          {heroSlides.map((slide, idx) =>
            idx === current ? (
              <motion.div
                key={idx}
                className="relative flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 transform group"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
              >
                {/* ========= LEFT PANEL: TEXT CONTENT ========= */}
                <div className="w-full md:w-1/2 px-6 py-20 md:px-12 lg:px-20 flex flex-col justify-center relative bg-white md:bg-gradient-to-br md:from-white md:to-gray-50 text-gray-900">
                  <div className="relative z-10 space-y-6">
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
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg"
                    >
                      {slide.headline?.split('\n').map((line, lineIdx) => (
                        <React.Fragment key={lineIdx}>
                          {line.includes('$') ? (
                            <>
                              {line.split('$')[0]}
                              <span style={{ color: secondary }}>${line.split('$')[1]}</span>
                            </>
                          ) : (
                            line
                          )}
                          {slide.headline && slide.headline?.length > 0 && lineIdx < slide.headline?.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </motion.h2>

                    {/* Description */}
                    {slide.badgeText && (
                      <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="text-gray-700 text-base sm:text-lg max-w-md line-clamp-3"
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

                {/* ========= RIGHT PANEL: IMAGE + BLOB ACCENT ========= */}
                <div className="block md:w-1/2 relative overflow-hidden min-h-[300px] md:min-h-0">
                  {/* Faint SVG blob accent */}
                  <svg
                    className="absolute -bottom-10 -right-20 w-[400px] h-[400px] opacity-20"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M314.5 92.7C332 157.2 289 218.3 234.6 254.6C180.2 290.8 115.3 302.2 63.8 273C12.3 243.8 -2.1 175.1 11.8 118.7C25.7 62.3 68.1 18.2 122.3 7.8C176.5 -2.6 247 28.2 314.5 92.7Z"
                      fill={secondary}
                    />
                  </svg>

                  {/* Product image */}
                  <Image
                    src={slide.imageUrl}
                    alt={slide.headline || 'Hero Image'}
                    fill
                    className="object-cover object-center rounded-r-3xl transition-transform duration-500 ease-out group-hover:scale-105"
                    loader={loader}
                    priority
                  />
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* ========= PREV / NEXT BUTTONS ========= */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-white/70 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-20 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-6 w-6 md:h-7 md:w-7" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-white/70 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-20 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-6 w-6 md:h-7 md:w-7" />
        </button>

        {/* ========= PAGINATION DOTS with Progress Bar ========= */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > current ? 1 : -1)}
              className={`relative w-3.5 h-3.5 rounded-full overflow-hidden transition-all duration-300 ease-in-out border-2 ${
                idx === current ? 'border-white scale-125' : 'border-gray-400 opacity-70 hover:scale-110'
              } focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              {idx === current && (
                <div
                  ref={progressRef}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    backgroundColor: 'white',
                    width: '0%',
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}