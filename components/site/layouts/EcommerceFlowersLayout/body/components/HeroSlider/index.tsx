'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings?: any;
}

const imageLoader = ({ src }: { src: string }) => src;
const autoAdvanceDelay = 6500;

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 1.03,
    filter: 'blur(4px)',
    x: direction > 0 ? '4%' : '-4%',
  }),
  center: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    x: 0,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.98,
    filter: 'blur(4px)',
    x: direction < 0 ? '4%' : '-4%',
    transition: {
      duration: 0.6,
    },
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const primaryColor = themeSettings?.primaryColor || '#E11D48';
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fallbackSlides: HeroSlide[] = useMemo(() => [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1600&q=80',
      subline: 'Spring Collection 2026',
      headline: 'THE ULTIMATE\n$FLOWER$ DESTINATION',
      badgeText: 'Transform your space into a paradise with our hand-picked seasonal blooms and artisanal arrangements.',
      ctaText: 'Shop the Collection',
      ctaLink: '/shop',
      productImageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
      backgroundColor: '#FFF9F9',
      companyId: '', price: null, endsAt: null, order: 0, iconKey: null, textColor: null, videoLink: null, type: null,
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1600&q=80',
      subline: 'Artisan Curated',
      headline: 'NATURE\'S FINEST\n$MOMENTS$',
      badgeText: 'Discover the language of flowers through our bespoke bouquets designed for life\'s most precious celebrations.',
      ctaText: 'View Bouquets',
      ctaLink: '/collection',
      productImageUrl: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80',
      backgroundColor: '#F7F9F7',
      companyId: '', price: null, endsAt: null, order: 0, iconKey: null, textColor: null, videoLink: null, type: null,
    },
  ], []);

  const slides = useMemo(() => {
    return heroSlides && heroSlides.length > 0 ? heroSlides : fallbackSlides;
  }, [heroSlides, fallbackSlides]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const handleGoTo = (idx: number) => {
    if (idx === current) return;
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    timerRef.current = setInterval(handleNext, autoAdvanceDelay);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleNext, isHovered, slides.length]);

  // Safe Token Extraction Engine
  const renderHeadline = (text: string) => {
    return (text ?? '').split('\n').map((line, index) => {
      if (line.includes('$')) {
        const structuralSegments = line.split('$');
        return (
          <React.Fragment key={index}>
            {structuralSegments[0]}
            <span className="italic font-light text-rose-500 font-serif pr-2">{structuralSegments[1]}</span>
            {structuralSegments[2]}
            {index < (text.split('\n').length - 1) && <br />}
          </React.Fragment>
        );
      }
      return (
        <React.Fragment key={index}>
          {line}
          {index < (text.split('\n').length - 1) && <br />}
        </React.Fragment>
      );
    });
  };

  const activeSlide = slides[current];

  return (
    <section 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-[100svh] lg:h-screen flex items-center overflow-hidden bg-[#FAFAFA] select-none"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full flex items-center"
        >
          {/* BACKGROUND MEDIA WRAPPER */}
          <div className="absolute inset-0 z-0">
            <Image decoding="async"
              src={activeSlide.imageUrl || ''}
              alt="Seasonal florist background composition"
              fill
              className="object-cover brightness-[0.93] scale-100"
              priority
            />
            {/* GRADIENT MAP OPTIMIZED FOR MOBILE LEGIBILITY */}
            <div className="absolute inset-0 bg-gradient-to-b via-white/70 from-white/90 to-white/90 md:bg-gradient-to-r md:from-white/95 md:via-white/70 md:to-transparent" />
          </div>

          <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 items-center w-full">
            
            {/* LEFT COLUMN: EDITORIAL BRIEF */}
            <div className="md:col-span-7 lg:col-span-6 xl:col-span-5 text-center md:text-left mt-20 md:mt-0">
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 max-w-xl mx-auto md:mx-0"
              >
                <motion.span 
                  variants={itemVariants}
                  className="inline-block text-[11px] uppercase tracking-[0.35em] font-black text-rose-600 bg-rose-50 px-3 py-1 rounded-md md:bg-transparent md:p-0"
                >
                  {activeSlide.subline}
                </motion.span>
                
                <motion.h1 
                  variants={itemVariants}
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-slate-900 leading-[1.1] tracking-tight"
                >
                  {renderHeadline(activeSlide.headline || '')}
                </motion.h1>

                <motion.p 
                  variants={itemVariants}
                  className="text-sm sm:text-base md:text-lg text-slate-700 font-normal leading-relaxed max-w-md mx-auto md:ml-0"
                >
                  {activeSlide.badgeText}
                </motion.p>

                <motion.div 
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5 pt-2"
                >
                  <Link
                    href={activeSlide.ctaLink || '/shop'}
                    className="w-full sm:w-auto group relative px-8 py-4 bg-slate-900 text-white rounded-full overflow-hidden text-center transition-transform active:scale-[0.98] shadow-lg shadow-slate-900/10"
                  >
                    <span className="relative z-10 font-bold uppercase tracking-widest text-xs">{activeSlide.ctaText}</span>
                    <div 
                      className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" 
                      style={{ backgroundColor: primaryColor }}
                    />
                  </Link>
                  
                  <div className="hidden sm:flex items-center gap-2 text-slate-500 text-xs uppercase font-bold tracking-widest">
                    <span className="w-6 h-[1px] bg-slate-300" />
                    Eco-friendly Sourcing
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* RIGHT COLUMN: VOGUE FLOATING PANEL */}
            <div className="hidden md:flex md:col-span-5 lg:col-span-6 xl:col-span-7 items-center justify-end w-full relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] w-full max-w-[280px] lg:max-w-[340px] xl:max-w-[380px] shadow-2xl rounded-3xl overflow-visible group"
              >
                <div className="absolute inset-0 border border-white/30 rounded-3xl z-10 pointer-events-none" />
                <div className="relative h-full w-full overflow-hidden rounded-3xl border-4 border-white bg-stone-50">
                   <Image decoding="async" 
                    src={activeSlide.productImageUrl || activeSlide.imageUrl || ''} 
                    alt="Artisan floral design variant representation" 
                    fill 
                    className="object-cover transition-transform duration-[4s] ease-out group-hover:scale-105"
                   />
                </div>

                {/* ABSTRACT FLOATING ATTRIBUTE BADGE */}
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -bottom-5 -left-6 bg-white/95 backdrop-blur-md p-4 px-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] flex flex-col border border-stone-100 text-left min-w-[130px]"
                >
                   <span className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">Freshly Picked</span>
                   <span className="text-lg font-serif font-normal text-slate-900 mt-0.5">Every Morning</span>
                </motion.div>
              </motion.div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* SYSTEM CONTROLS HUD CONSOLE */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-12 lg:right-16 xl:right-20 z-30 flex flex-col sm:flex-row items-center gap-6">
        {/* PAGINATION PROGRESS BAR PIPES */}
        <div className="flex items-center gap-2.5">
           {slides.map((_, idx) => (
             <button
               key={idx}
               onClick={() => handleGoTo(idx)}
               className="h-1.5 rounded-full transition-all duration-500 focus:outline-none"
               style={{ 
                 width: idx === current ? '40px' : '10px',
                 backgroundColor: idx === current ? primaryColor : '#CBD5E1'
               }}
               aria-label={`Jump to panel slide number 0${idx + 1}`}
             />
           ))}
        </div>

        {/* DIRECTIONAL STEPPERS */}
        <div className="flex gap-2">
          <button 
            onClick={handlePrev}
            className="p-2.5 border border-slate-200 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm focus:outline-none"
            aria-label="Previous editorial view"
          >
            <ArrowLeftIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button 
            onClick={handleNext}
            className="p-2.5 border border-slate-200 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm focus:outline-none"
            aria-label="Next editorial view"
          >
            <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* SYNCHRONIZED VISUAL PROGRESS PIPELINE RUNNER */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-200/40 z-30 pointer-events-none">
        <motion.div 
          key={current}
          initial={{ width: '0%' }}
          animate={isHovered ? { width: '0%' } : { width: '100%' }}
          transition={{ duration: autoAdvanceDelay / 1000, ease: 'linear' }}
          className="h-full"
          style={{ backgroundColor: primaryColor }}
        />
      </div>
    </section>
  );
}