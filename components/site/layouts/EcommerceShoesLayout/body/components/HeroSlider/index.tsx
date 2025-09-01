'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useStoreContext } from '../../../../../../../contexts/StoreContext';
import { StoreForm } from '@/types/typings';

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

export interface HeroSliderProps {
  storeFormData: StoreForm | null;
}

export default function HeroSlider({ storeFormData }: HeroSliderProps) {
  // Sample data to use if storeFormData is null or heroSlides is empty
  const defaultHeroSlides: Slide[] = [
    {
      imageUrl: '/images/nike-shoe.png', // Replace with a relevant placeholder image path
      subline: 'EXCLUSIVE DROP',
      headline: 'STEP INTO\nSTYLE & COMFORT',
      description: 'Discover curated collections and experience unpraalled style with our latest drop.',
      ctaText: 'SHOP NOW',
      ctaLink: '/shop',
    },
    {
      imageUrl: '/images/another-shoe.png', // Another placeholder image
      subline: 'SUMMER COLLECTION',
      headline: 'UP TO $50 OFF\nSELECTED STYLES',
      description: 'Refresh your wardrobe with our summer essentials. Limited time offer!',
      ctaText: 'SEE DEALS',
      ctaLink: '/summer-collection',
    },
  ];

  // Map your backend “heroSlides” into our shape, using default if none provided
  const heroSlides: Slide[] =
    storeFormData?.heroSlides && storeFormData.heroSlides.length > 0
      ? storeFormData.heroSlides.map((slide: any) => ({
          imageUrl: slide.imageUrl,
          subline: slide.subline || 'Exclusive Offer',
          headline: slide.headline || 'Unlock Amazing Deals Now!',
          description:
            slide.description || 'Discover curated collections and exceptional savings on your favorite products.',
          ctaText: slide.ctaText || 'Explore Collections',
          ctaLink: slide.ctaLink || '/shop',
        }))
      : defaultHeroSlides;

  // These theme colors control the little progress bar at the bottom:
  const primary = storeFormData?.themeSettings?.primaryColor || '#A855F7'; // default: purple-500
  const secondary = storeFormData?.themeSettings?.secondaryColor || '#EC4899'; // default: pink-500

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

  // Variants for more dynamic entrance/exit animations
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
                className="relative flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 transform group
                           bg-gradient-to-br from-purple-600 to-pink-500" // Updated for gradient background
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
              >
                {/* Overlay SNEAKERS text */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                             text-[min(15vw,200px)] font-extrabold text-white opacity-10 pointer-events-none z-0"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  SNEAKERS
                </div>

                {/* ========= LEFT PANEL: TEXT CONTENT ========= */}
                <div
                  className="w-full md:w-1/2 px-6 py-20 md:px-12 lg:px-20 flex flex-col justify-center relative
                             bg-gradient-to-br from-white via-white to-gray-50/80 backdrop-blur-sm
                             text-gray-900 z-10 rounded-l-3xl md:rounded-r-none" // Frosted glass effect
                >
                  <div className="relative z-10 space-y-6">
                    {/* Badge - enhanced with primary color and subtle animation */}
                    <motion.span
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="inline-block px-4 py-1.5 rounded-full text-sm sm:text-base font-semibold shadow-md
                                 bg-white/30 backdrop-blur-sm text-white" // Lighter, frosted badge
                    >
                      {slide.subline}
                    </motion.span>

                    {/* Headline - dynamic color for numeric values, bold impact */}
                    <motion.h2
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg
                                 text-white" // Headline is white
                    >
                      {slide.headline.split('\n').map((line, lineIdx) => (
                        <React.Fragment key={lineIdx}>
                          {line.includes('$') ? (
                            <>
                              {line.split('$')[0]}
                              <span style={{ color: secondary }}>${line.split('$')[1]}</span>
                            </>
                          ) : (
                            line
                          )}
                          {lineIdx < slide.headline.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </motion.h2>

                    {/* Description - clearer text, increased line-clamp for more visibility */}
                    {slide.description && (
                      <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="text-gray-100 text-base sm:text-lg max-w-md line-clamp-3" // Description is lighter gray
                      >
                        {slide.description}
                      </motion.p>
                    )}

                    {/* CTA Button - vibrant background, hover effects */}
                    {slide.ctaLink && slide.ctaText && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        <Link
                          href={slide.ctaLink}
                          className="inline-block font-semibold text-sm sm:text-base px-8 py-4 rounded-xl shadow-lg
                                     transition transform duration-300 hover:scale-105 hover:shadow-xl relative
                                     overflow-hidden"
                          style={{ background: secondary, color: 'white' }} // CTA uses secondary color
                        >
                          {slide.ctaText}
                          <span className="absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                        </Link>
                      </motion.div>
                    )}
                    {slide.ctaLink && (
                      <div className="mt-4 text-gray-200 text-sm hover:text-white transition-colors duration-200">
                        <Link href={slide.ctaLink}>{slide.ctaLink}</Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* ========= RIGHT PANEL: IMAGE + BLOB ACCENT ========= */}
                <div className="block md:w-1/2 relative overflow-hidden min-h-[300px] md:min-h-0">
                  {/* Faint SVG “blob” behind the photo - now uses primary color for accent */}
                  <svg
                    className="absolute -bottom-10 -right-20 w-[400px] h-[400px] opacity-20"
                    viewBox="0 0 400 400"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M314.5 92.7C332 157.2 289 218.3 234.6 254.6C180.2 290.8 115.3 302.2 63.8 273C12.3 243.8 -2.1 175.1 11.8 118.7C25.7 62.3 68.1 18.2 122.3 7.8C176.5 -2.6 247 28.2 314.5 92.7Z"
                      fill={primary} // Use primary color for the blob
                    />
                  </svg>

                  {/* The actual product image with subtle parallax/transform effect on drag */}
                  <Image
                    src={slide.imageUrl}
                    alt={slide.headline}
                    fill
                    className="object-cover object-center rounded-r-3xl transition-transform duration-500 ease-out group-hover:scale-110" // More pronounced scale on hover
                    loader={loader}
                    priority
                  />
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* ========= PREV / NEXT BUTTONS - Enhanced Styling ========= */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-6 transform -translate-y-1/2 p-3 md:p-4 rounded-full text-white shadow-xl
                     transition-all duration-200 z-20 backdrop-blur-lg bg-white/30 hover:bg-white/50
                     focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900"
          aria-label="Previous slide"
        >
          <ArrowLeftIcon className="h-6 w-6 md:h-7 md:w-7" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-6 transform -translate-y-1/2 p-3 md:p-4 rounded-full text-white shadow-xl
                     transition-all duration-200 z-20 backdrop-blur-lg bg-white/30 hover:bg-white/50
                     focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-900"
          aria-label="Next slide"
        >
          <ArrowRightIcon className="h-6 w-6 md:h-7 md:w-7" />
        </button>

        {/* ========= PAGINATION DOTS - Enhanced with dynamic colors and progress bar ========= */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > current ? 1 : -1)}
              className={`relative w-4 h-4 rounded-full overflow-hidden transition-all duration-300 ease-in-out border-2
                          ${idx === current ? 'border-white scale-125' : 'bg-white/30 border-white/50 opacity-70 hover:scale-110'}
                          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900`}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: idx === current ? `linear-gradient(to right, ${primary}, ${secondary})` : 'transparent',
                }}
              />
              {idx === current && (
                <div
                  ref={progressRef}
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${primary}, ${secondary})`, // Progress bar uses gradient
                    width: '0%', // This will be animated by JS
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