// File: components/HeroSlider.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import homeBanner from '../../assets/asset3.png';
import Image from 'next/image';
import { useStoreContext } from '../../contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const HeroSlider: React.FC = () => {
  const { storeFormData } = useStoreContext();
  const { heroSlides } = storeFormData;

  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlides.length > 0) {
      timeoutRef.current = setTimeout(() => {
        setCurrent((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [current, heroSlides.length]);

  const goTo = (idx: number) => {
    clearTimeout(timeoutRef.current);
    setCurrent(idx);
  };

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
    <section className="relative h-screen overflow-hidden">
      <AnimatePresence>
        {heroSlides.map((slide:any, i:any) =>
          i === current ? (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={slide.imageUrl ?? homeBanner.src}
                alt={slide.headline ?? 'banner image'}
                fill
                className="object-cover"
                loader={loader}
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-start px-6 md:px-16 text-white">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl mb-2"
                >
                  {slide.subline}
                </motion.p>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl md:text-5xl font-bold mb-4"
                >
                  {slide.headline}
                </motion.h2>
                {slide.ctaLink && slide.ctaText && (
                  <motion.a
                    href={slide.ctaLink}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="inline-block bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg text-white font-medium"
                  >
                    {slide.ctaText}
                  </motion.a>
                )}
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
        aria-label="Previous slide"
      >
        <ArrowLeftIcon />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white"
        aria-label="Next slide"
      >
        <ArrowRightIcon />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_:any, idx:any) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-3 h-3 rounded-full transition ${
              idx === current ? 'bg-white' : 'bg-white/40'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
