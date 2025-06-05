// File: components/HeroSlider.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import homeBanner from '../../assets/asset3.png';
import Image from 'next/image';
import { useStoreContext } from '../../contexts/StoreContext';

// Custom loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const HeroSlider: React.FC = () => {
  const { storeFormData } = useStoreContext();
  const { heroSlides } = storeFormData; // expect an array of { imageUrl, subline, headline, ctaText, ctaLink }

  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Automatically advance every 5 seconds
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlides.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [current, heroSlides.length]);

  // Navigate directly to a specific slide
  const goTo = (idx: number) => {
    clearTimeout(timeoutRef.current);
    setCurrent(idx);
  };

  // Previous / Next helpers
  const prev = () => {
    if (heroSlides.length > 0) {
      goTo((current - 1 + heroSlides.length) % heroSlides.length);
    }
  };
  const next = () => {
    if (heroSlides.length > 0) {
      goTo((current + 1) % heroSlides.length);
    }
  };

  return (
    <section className="relative h-screen max-h-[800px] sm:h-[70vh] overflow-hidden">
      <AnimatePresence>
        {heroSlides.map((slide: any, i: number) =>
          i === current ? (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full overflow-hidden"
            >
              {/* Background image with slow zoom */}
              <motion.div
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 20, ease: 'linear' }}
                className="absolute inset-0"
              >
                <Image
                  src={slide.imageUrl ?? homeBanner.src}
                  alt={slide.headline ?? 'banner image'}
                  fill
                  className="object-cover"
                  loader={loader}
                  priority
                />
              </motion.div>

              {/* Gradient overlay + text/content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-center items-start px-6 md:px-16 text-white">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm md:text-base lg:text-lg mb-4 tracking-wide"
                >
                  {slide.subline}
                </motion.p>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl md:text-4xl lg:text-6xl font-extrabold mb-6 leading-tight"
                >
                  {slide.headline}
                </motion.h2>

                {slide.ctaLink && slide.ctaText && (
                  <motion.a
                    href={slide.ctaLink}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="inline-block bg-orange-600 hover:bg-orange-700 hover:scale-105 transition-transform px-8 py-3 rounded-2xl text-white font-bold shadow-lg"
                  >
                    {slide.ctaText}
                  </motion.a>
                )}
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Previous / Next Buttons */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full text-white shadow-md transition"
        aria-label="Previous slide"
      >
        <ArrowLeftIcon className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-3 rounded-full text-white shadow-md transition"
        aria-label="Next slide"
      >
        <ArrowRightIcon className="h-6 w-6" />
      </button>

      {/* Dots / Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {heroSlides.map((_, idx: number) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-4 h-4 rounded-full transition-all ring-offset-2 focus:ring-2 ${
              idx === current ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
