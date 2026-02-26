'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const transitionDuration = 0.8;
const autoAdvanceDelay = 6000;

const loader = ({ src }: { src: string }) => src;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const sampleSlides: HeroSlide[] = [
  {
    headline: 'Timeless\nElegance',
    subline: 'Limited Edition',
    badgeText: 'The Midnight Limited Edition features new subtle accents of white luminescent hands and new raised steel indices.',
    ctaText: 'EXPLORE',
    ctaLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=400&q=80',
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

export default function HeroSlider({ heroSlides }: HeroSliderProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=400&q=80';

  const heroSlidesToShow: HeroSlide[] = useMemo(() => {
    if (!heroSlides || heroSlides.length === 0) return sampleSlides;

    return heroSlides.map((slide) => ({
      ...slide,
      subline: slide.subline || 'Limited Edition',
      headline: slide.headline || 'Timeless Elegance',
      badgeText: slide.badgeText || 'Experience the new subtle accents of luxury.',
      ctaText: (slide.ctaText || 'EXPLORE').toUpperCase(),
      ctaLink: slide.ctaLink || '/shop',
      imageUrl: slide.imageUrl || fallbackImage,
    }));
  }, [heroSlides]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (heroSlidesToShow.length > 1) {
      timeoutRef.current = window.setTimeout(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % heroSlidesToShow.length);
      }, autoAdvanceDelay);
    }
  }, [heroSlidesToShow.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, resetTimer]);

  const goTo = (idx: number, dir = 0) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  };

  const prevSlide = () => goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1);
  const nextSlide = () => goTo((current + 1) % heroSlidesToShow.length, 1);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -50) nextSlide();
    else if (info.offset.x > 50) prevSlide();
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 100 : -100 }),
    center: { opacity: 1, x: 0, transition: { duration: transitionDuration, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir: number) => ({ opacity: 0, x: dir < 0 ? 100 : -100, transition: { duration: transitionDuration } }),
  };

  if (heroSlidesToShow.length === 0) return null;
  const slide = heroSlidesToShow[current];

  return (
    <section className="relative bg-black min-h-screen flex items-center overflow-hidden">
      
      {/* ORGANIC DESIGN ATTRIBUTES (FROM IMAGE_6204FC) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Top Left Botanical Branch */}
        <div className="absolute top-10 left-10 w-32 h-48 opacity-40 grayscale invert">
           <svg viewBox="0 0 100 150" className="w-full h-full text-white fill-current">
              <path d="M10,140 Q30,100 50,80 T90,20 M10,140 Q15,110 30,105 M30,105 Q40,90 45,70" stroke="currentColor" fill="none" strokeWidth="1.5" />
              <ellipse cx="32" cy="103" rx="8" ry="4" transform="rotate(-30 32 103)" />
              <ellipse cx="47" cy="68" rx="8" ry="4" transform="rotate(-45 47 68)" />
           </svg>
        </div>

        {/* Floating Animated Bees (From Image_6204FC) */}
        <motion.div 
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-[20%] left-[45%] w-8 h-8 opacity-60"
        >
          <Image src="https://img.icons8.com/ios-filled/50/ffffff/bee.png" alt="bee" width={32} height={32} loader={loader} />
        </motion.div>

        {/* Curved Dotted Path (From Image_5F5D62) */}
        <svg className="absolute bottom-0 left-0 w-full h-64 opacity-20" viewBox="0 0 1440 320">
          <path 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeDasharray="8 12" 
            d="M0,224C240,288,480,288,720,224C960,160,1200,160,1440,224" 
          />
        </svg>

        {/* Bottom Left Flowers */}
        <div className="absolute bottom-10 left-10 w-24 h-24 opacity-40 grayscale invert">
          <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
            <circle cx="50" cy="50" r="10" />
            <path d="M50,10 Q60,30 50,40 Q40,30 50,10 M90,50 Q70,60 60,50 Q70,40 90,50 M50,90 Q40,70 50,60 Q60,70 50,90 M10,50 Q30,40 40,50 Q30,60 10,50" />
          </svg>
        </div>
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="w-full z-10"
        >
          <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* TEXT PANEL */}
            <div className="order-2 lg:order-1 space-y-8 z-10">
              <div className="space-y-2">
                <span className="text-[#bc9c64] text-xs font-bold tracking-[0.4em] uppercase">
                  {slide.subline}
                </span>
                <h1 className="text-white text-6xl md:text-7xl lg:text-9xl font-bold leading-[0.9] tracking-tighter">
                  {slide.headline?.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}<br />
                    </React.Fragment>
                  ))}
                </h1>
              </div>

              <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
                {slide.badgeText}
              </p>

              <Link
                href={slide.ctaLink || '/shop'}
                className="inline-block bg-[#bc9c64] hover:bg-[#a68a58] text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">{slide.ctaText}</span>
              </Link>
            </div>

            {/* DUAL IMAGE PANEL (FROM IMAGE_6FA879) */}
            <div className="order-1 lg:order-2 relative flex items-center justify-end h-[450px] md:h-[650px] space-x-6">
              <div className="w-1/5 h-[80%] relative overflow-hidden grayscale opacity-50 border border-white/10">
                <Image
                  src={slide.imageUrl || fallbackImage}
                  alt="Detail"
                  fill
                  className="object-cover"
                  sizes="20vw"
                  priority
                  loader={loader}
                />
              </div>

              <div className="w-4/5 h-full relative overflow-hidden shadow-2xl border border-white/5">
                <Image
                  src={slide.imageUrl || fallbackImage}
                  alt={slide.headline || 'Hero'}
                  fill
                  className="object-cover"
                  sizes="80vw"
                  priority
                  loader={loader}
                />
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* NAVIGATION CONTROLS */}
      <div className="absolute bottom-12 left-6 lg:left-24 flex items-center space-x-12 z-30">
        <div className="flex space-x-6">
          <button onClick={prevSlide} className="text-white hover:text-[#bc9c64] transition-colors p-2 border border-white/10 hover:border-[#bc9c64] rounded-full">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button onClick={nextSlide} className="text-white hover:text-[#bc9c64] transition-colors p-2 border border-white/10 hover:border-[#bc9c64] rounded-full">
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {heroSlidesToShow.map((_, idx) => (
            <div
              key={idx}
              className={`h-[1.5px] transition-all duration-700 ${
                idx === current ? 'w-16 bg-[#bc9c64]' : 'w-6 bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}