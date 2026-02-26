'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

// --- Custom USP Icons (Matching the Image Line-Art) ---


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
  },
  {
    headline: 'SMOOTH & CREAMY\nPERFECTION',
    subline: 'Gourmet Selection',
    badgeText: 'Indulge in the velvety texture and rich flavor of our premium peanut butter.',
    ctaText: 'Discover More',
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
  },
  {
    headline: 'MADE WITH LOVE\nAND PEANUTS',
    subline: 'Gourmet Selection',
    badgeText: 'Crafted with care, our peanut butter is the perfect blend of taste and quality.',
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


export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const CustomPalmIcon = () => (
  <svg viewBox="0 0 100 100" className="h-10 w-10 text-gray-800">
    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M50 85V45 M50 45C50 45 30 40 25 25 M50 45C50 45 70 40 75 25 M50 45C50 45 35 60 20 65 M50 45C50 45 65 60 80 65" 
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const CustomGlutenIcon = () => (
  <svg viewBox="0 0 100 100" className="h-10 w-10 text-gray-800">
    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M50 80V30 M40 45L50 35L60 45 M40 60L50 50L60 60 M40 30L50 20L60 30" 
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomSoyIcon = () => (
  <svg viewBox="0 0 100 100" className="h-10 w-10 text-gray-800">
    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M40 75H60L55 40L65 25H35L45 40L40 75Z" 
          fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
  </svg>
);

// --- Component ---

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const defaultPrimaryColor = '#F3A852';
  const primary = themeSettings?.primaryColor || defaultPrimaryColor;
  
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const heroSlidesToShow = (heroSlides && heroSlides.length > 0 ? heroSlides : sampleSlides).map(slide => ({
    ...slide,
    headline: slide.headline || '100% NATURAL\nPEANUT BUTTER',
    badgeText: slide.badgeText || 'Peanutty Peanut Butters are created to be a gourmet snack that can easily be enjoyed by the whole family.',
  }));

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % heroSlidesToShow.length);
    }, 5000);
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

  return (
    <section className="relative mt-20 py-12 md:py-24 overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-12 lg:px-20 relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {heroSlidesToShow.map((slide, idx) => idx === current && (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
            >
              {/* Left Content Area */}
              <div className="z-20 space-y-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h1 className="text-6xl md:text-8xl font-black text-[#1a1a1a] leading-[0.9] tracking-tight mb-8">
                    {slide.headline.split('\n').map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </h1>
                  <p className="text-gray-600 text-lg md:text-xl max-w-md leading-relaxed">
                    {slide.badgeText}
                  </p>
                </motion.div>

                <div className="pt-4">
                  <Link
                    href={slide.ctaLink || '/shop'}
                    className="inline-block px-12 py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:brightness-110 transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: primary }}
                  >
                    {slide.ctaText || 'Shop Now'}
                  </Link>
                </div>

                {/* Specific Stylized Icons from Image */}
                <div className="flex items-center gap-10 pt-12">
                  <div className="flex flex-col items-center gap-3">
                    <CustomPalmIcon />
                    <span className="text-[11px] font-bold text-gray-700 tracking-widest uppercase">Palm Free</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <CustomGlutenIcon />
                    <span className="text-[11px] font-bold text-gray-700 tracking-widest uppercase">Gluten Free</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <CustomSoyIcon />
                    <span className="text-[11px] font-bold text-gray-700 tracking-widest uppercase">Soy Free</span>
                  </div>
                </div>
              </div>

              {/* Right Image Area */}
              <div className="relative flex justify-center items-center h-[500px]">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={slide.imageUrl || '/peanut-butter-jars.png'}
                    alt="Product"
                    fill
                    className="object-contain"
                    priority
                    loader={loader}
                  />
                </motion.div>
                
                {/* Floating Elements mimicking reference */}
                <div className="absolute top-10 right-0 w-20 h-20 opacity-30 blur-2xl rounded-full bg-amber-400 -z-10" />
                <div className="absolute bottom-10 left-0 w-32 h-32 opacity-20 blur-3xl rounded-full bg-orange-300 -z-10" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Navigation Arrows (Hero Icons) */}
        <div className="hidden md:block">
          <button onClick={() => goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1)} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-gray-50 hover:bg-white shadow-md text-gray-400 hover:text-gray-900 transition-all">
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <button onClick={() => goTo((current + 1) % heroSlidesToShow.length, 1)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-gray-50 hover:bg-white shadow-md text-gray-400 hover:text-gray-900 transition-all">
            <ArrowRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}