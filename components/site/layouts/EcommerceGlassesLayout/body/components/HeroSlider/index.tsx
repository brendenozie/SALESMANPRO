'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, CheckBadgeIcon, BeakerIcon } from '@heroicons/react/24/outline'; // Using Hero Icons
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

const sampleSlides: HeroSlide[] = [
  {
    headline: '100% NATURAL\nPEANUT BUTTER',
    subline: 'Gourmet Selection',
    badgeText: 'Created to be a gourmet snack that can easily be enjoyed by the whole family.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    id: '',
    companyId: '',
    type: null,
    productImageUrl: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null
  }
];

// Custom Leaf SVG for "Palm Free"
const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10a9.99 9.99 0 009.95-9H20a8 8 0 01-8-8zM11 14h2v2h-2v-2zm0-8h2v6h-2V6z" />
  </svg>
);

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const defaultPrimaryColor = '#F3A852'; // Adapted to the peanut butter theme
  const defaultSecondaryColor = '#2D3748';

  const heroSlidesToShow: HeroSlide[] = (heroSlides && heroSlides.length > 0 ? heroSlides : sampleSlides).map(
    (slide, index) => ({
      ...slide,
      subline: slide.subline || 'Gourmet Selection',
      headline: slide.headline || '100% NATURAL\nPEANUT BUTTER',
      badgeText: slide.badgeText || 'Created to be a gourmet snack that can easily be enjoyed by the whole family.',
      ctaText: slide.ctaText || 'Shop Now',
      ctaLink: slide.ctaLink || '/shop',
    })
  );

  const primary = themeSettings?.primaryColor || defaultPrimaryColor;
  
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlidesToShow.length > 0) {
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

  const nextSlide = () => goTo((current + 1) % heroSlidesToShow.length, 1);
  const prevSlide = () => goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1);

  return (
    <section className="relative mt-20 py-12 md:py-20 overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16 relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {heroSlidesToShow.map((slide, idx) => idx === current && (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[500px]"
            >
              {/* LEFT CONTENT */}
              <div className="order-2 md:order-1 space-y-8 z-20">
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 }}
                >
                  <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight">
                    {slide.headline?.split('\n').map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </h1>
                  <p className="mt-6 text-lg text-gray-600 max-w-sm font-medium">
                    {slide.badgeText}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href={slide.ctaLink || '/shop'}
                    className="inline-block px-10 py-4 rounded-xl text-white font-bold text-lg shadow-xl hover:brightness-110 transition-all"
                    style={{ backgroundColor: primary }}
                  >
                    {slide.ctaText}
                  </Link>
                </motion.div>

                {/* USPs - New feature from design */}
                <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-100">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
                      <LeafIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Palm Free</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
                      <CheckBadgeIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gluten Free</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
                      <BeakerIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Soy Free</span>
                  </div>
                </div>
              </div>

              {/* RIGHT PRODUCT IMAGE */}
              <div className="order-1 md:order-2 relative flex justify-center items-center h-[400px] md:h-full">
                {/* Floating Decoration (Peanuts) */}
                <motion.div 
                  animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-10 right-10 z-0 opacity-20"
                >
                    {/* This would be a peanut image asset */}
                    <div className="w-16 h-16 bg-amber-200 rounded-full blur-xl" />
                </motion.div>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={slide.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'}
                    alt="Product jars"
                    fill
                    className="object-contain"
                    priority
                    loader={loader}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* NAVIGATION CONTROLS */}
        <div className="absolute top-1/2 -left-4 md:left-4 z-30 -translate-y-1/2">
            <button onClick={prevSlide} className="p-3 rounded-full bg-white shadow-lg text-gray-800 hover:bg-gray-50">
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="absolute top-1/2 -right-4 md:right-4 z-30 -translate-y-1/2">
            <button onClick={nextSlide} className="p-3 rounded-full bg-white shadow-lg text-gray-800 hover:bg-gray-50">
              <ArrowRightIcon className="h-6 w-6" />
            </button>
        </div>
      </div>
    </section>
  );
}