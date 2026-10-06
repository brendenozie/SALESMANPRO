'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

/* ---------------------------------- */
/* Types based on Prisma Model        */
/* ---------------------------------- */

interface BannerSlide {
  id: string;
  type?: string | null;
  imageUrl?: string | null;
  productImageUrl?: string | null; // Available for future use (e.g., side-by-side layouts)
  headline?: string | null;
  subline?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  badgeText?: string | null;
  price?: string | null;
  stats?: Record<string, any> | null;
  backgroundColor?: string | null;
  textColor?: string | null;
}

interface HeroProps {
  heroSlides: BannerSlide[];
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

/* ---------------------------------- */
/* Fallback Data                      */
/* ---------------------------------- */

const sampleSlides: BannerSlide[] = [
  {
    id: 'fallback-1',
    type: 'Hero',
    headline: 'High-Yield $ Hybrids',
    subline: 'Engineered for drought resistance and 30% higher harvest weight in diverse climates.',
    imageUrl: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1500&q=80',
    ctaText: 'Shop Hybrids',
    ctaLink: '/store/seeds',
    price: '2,400 KES',
    badgeText: 'Premium Grade A',
    stats: { yield: '+32%', water: '-15%' },
    backgroundColor: '#10b981',
    textColor: '#022c22',
  },
  {
    id: 'fallback-2',
    type: 'Promo',
    headline: 'Next-Gen $ Protection',
    subline: 'Advanced crop defense systems that keep your yields safe from seasonal pests without harming the soil.',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1500&q=80',
    ctaText: 'View Solutions',
    ctaLink: '/store/chemicals',
    badgeText: 'Eco-Friendly',
    stats: { coverage: '100%', toxic: '0%' },
    backgroundColor: '#3b82f6',
    textColor: '#eff6ff',
  }
];

/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */

export default function RethoughtAgrovetHero({
  heroSlides = [],
  themeSettings,
}: HeroProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const slides = heroSlides.length ? heroSlides : sampleSlides;
  const currentSlide = slides[index];

  const themePrimary = themeSettings?.primaryColor || currentSlide.backgroundColor || '#10b981';
  const themeSecondary = themeSettings?.secondaryColor || currentSlide.textColor || '#022c22';

  // Manual Navigation
  const goToSlide = (slideIndex: number) => setIndex(slideIndex);

  // Auto-play Logic with Pause on Hover
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 8000); // Slightly faster default (8s) for better engagement
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  return (
    <section 
      className="relative min-h-[100svh] bg-[#0a0a0a] text-white overflow-hidden flex flex-col"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Layer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0 z-0"
        >
          {/* Subtle Ken Burns Zoom Effect */}
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, ease: 'linear' }}
            className="absolute inset-0 w-full h-full"
          >
            {currentSlide.imageUrl && (
              <Image decoding="async"
                src={currentSlide.imageUrl}
                alt={currentSlide.headline || 'Agrovet Hero Image'}
                fill
                priority
                className="object-cover opacity-50 grayscale-[15%]"
                sizes="100vw"
              />
            )}
          </motion.div>
          {/* Richer Gradient for better text pop */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 pt-12 h-full flex flex-grow items-center">
        <div className="max-w-[42rem] xl:max-w-[48rem] pt-20 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {/* Eyebrow & Badge */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-[2px] w-8 md:w-12 transition-colors duration-500" style={{ backgroundColor: themePrimary }} />
                  <span className="text-xs md:text-sm font-black tracking-[0.25em] uppercase transition-colors duration-500" style={{ color: themePrimary }}>
                    {currentSlide.badgeText || 'Showcase'}
                  </span>
                </div>
                
                {/* {currentSlide.badgeText && (
                  <span className="px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                    {currentSlide.badgeText}
                  </span>
                )} */}
              </div>

              {/* Headline */}
              <h1 className="font-black tracking-tight leading-[1.05] text-[clamp(2.5rem,6vw,5.5rem)] xl:leading-[0.95] mb-6">
                {(currentSlide.headline || '').split('$').map((word: string, i: number) => (
                  <span
                    key={i}
                    className={i === 1 ? 'text-transparent' : ''}
                    style={i === 1 ? { WebkitTextStroke: '1.5px white' } : {}}
                  >
                    {word}
                  </span>
                ))}
              </h1>

              {/* Subline */}
              <p className="text-[clamp(1rem,1.5vw,1.25rem)] text-white/80 leading-relaxed mb-10 max-w-xl font-light">
                {currentSlide.subline}
              </p>

              {/* Price & CTA Section */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                <Link href={currentSlide.ctaLink || '#'}>
                  <button
                    className="group relative px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 overflow-hidden transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
                    style={{ backgroundColor: themePrimary, color: themeSecondary }}
                  >
                    <span className="relative z-10 uppercase tracking-wide text-sm md:text-base">
                      {currentSlide.ctaText || 'Learn More'}
                    </span>
                    <PlusIcon className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                  </button>
                </Link>

                {/* Price (If applicable) */}
                {currentSlide.price && (
                   <div className="flex flex-col">
                     <span className="text-xs uppercase tracking-wider opacity-60">Starting at</span>
                     <span className="text-2xl font-bold">{currentSlide.price}</span>
                   </div>
                )}
              </div>

              {/* Stats - Refactored for Mobile */}
              {currentSlide.stats && Object.keys(currentSlide.stats).length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-8 md:gap-12">
                  {Object.entries(currentSlide.stats).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <p className="text-2xl md:text-3xl font-black transition-colors duration-500" style={{ color: themePrimary }}>
                        {String(value)}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mt-1">
                        {key}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slider Controls & Trust Badge */}
      <div className="relative z-20 container mx-auto px-6 pb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Pagination Dots */}
        {slides.length > 1 && (
          <div className="flex items-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Authenticity Badge */}
        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md py-2 px-4 rounded-full border border-white/5">
          <CheckBadgeIcon className="w-5 h-5 transition-colors duration-500" style={{ color: themePrimary }} />
          <p className="text-xs md:text-sm font-medium text-white/80">
            Trusted by 12,000+ Kenyan Farmers
          </p>
        </div>
      </div>
    </section>
  );
}