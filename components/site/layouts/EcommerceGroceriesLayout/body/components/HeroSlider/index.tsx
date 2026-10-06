'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

export interface FullScreenHeroProps {
  heroSlides: HeroSlide[] | null;
  themeSettings?: any;
}

const imageLoader = ({ src }: { src: string }) => src;
const autoAdvanceDelay = 7500;

// Optimized motion curves for cinematic scale transitions
const slideBackgroundVariants = {
  enter: { opacity: 0 },
  center: { 
    opacity: 1, 
    transition: { duration: 1.1, ease: 'easeOut' } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.8, ease: 'easeIn' } 
  }
};

const typographyContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 }
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.35, ease: 'easeIn' }
  }
};

const typographyItemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function FullScreenHero({ heroSlides, themeSettings }: FullScreenHeroProps) {
  const primaryColor = themeSettings?.primaryColor || '#16a34a'; 
  const secondaryColor = themeSettings?.secondaryColor || '#fbbf24';

  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const fallbackSlides: HeroSlide[] = useMemo(() => [
    {
      id: '1',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000',
      subline: 'Fresh from the Soil',
      headline: 'ORGANIC HARVEST$DELIVERED DAILY',
      badgeText: 'Hand-picked premium produce from local farmers, delivered to your doorstep within 2 hours.',
      ctaText: 'Start Shopping',
      ctaLink: '/groceriesecommerce/products',
      companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null
    },
    {
      id: '2',
      imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2000',
      subline: 'Healthy Living',
      headline: 'FUEL YOUR BODY$WITH NATURE',
      badgeText: 'Explore our curated selection of superfoods and seasonal greens to kickstart your wellness journey.',
      ctaText: 'View Seasonal Picks',
      ctaLink: '/groceriesecommerce/products?filter=seasonal',
      companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null
    }
  ], []);

  const slides = useMemo(() => {
    return heroSlides && heroSlides.length > 0 ? heroSlides : fallbackSlides;
  }, [heroSlides, fallbackSlides]);

  const handleNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(handleNext, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [handleNext, isHovered, slides.length]);

  // Safe Token Headline Extractor
  const renderHeadline = (text: string) => {
    return (text ?? '').split('$').map((segment, index) => {
      if (index === 1) {
        return (
          <span key={index} className="block text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${secondaryColor}, #fef08a)` }}>
            {segment}
          </span>
        );
      }
      return <span key={index} className="block">{segment}</span>;
    });
  };

  return (
    <section 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-stone-950 select-none"
    >
      {/* BACKGROUND MEDIA ART ENGINE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          variants={slideBackgroundVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <motion.div 
            animate={{ scale: [1.06, 1.01] }}
            transition={{ duration: autoAdvanceDelay / 1000, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <Image decoding="async"
              src={slides[current].imageUrl || ''}
              alt="Immersive fresh food production preview"
              fill
              priority
              className="object-cover"
            />
          </motion.div>
          
          {/* HIGH CONTRAST DOUBLE GRADIENT OVERLAYS */}
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/85 via-black/45 to-black/20 md:to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-10" />
        </motion.div>
      </AnimatePresence>

      {/* CORE TEXT INTERFACES VIEWPORT */}
      <div className="relative z-20 h-full container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 flex flex-col justify-center items-start w-full">
        <div className="max-w-4xl text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={typographyContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6 md:space-y-8"
            >
              {/* SUBTITLE PILL */}
              <motion.div
                variants={typographyItemVariants}
                className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15"
              >
                <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: secondaryColor }} />
                <span className="text-white text-xs font-bold tracking-[0.25em] uppercase">
                  {slides[current].subline}
                </span>
              </motion.div>

              {/* DYNAMIC TEXT HEADER */}
              <motion.h1
                variants={typographyItemVariants}
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight font-sans drop-shadow-sm"
              >
                {renderHeadline(slides[current].headline || '')}
              </motion.h1>

              {/* DESCRIPTION BADGE BLOCK */}
              <motion.p
                variants={typographyItemVariants}
                className="text-base sm:text-lg md:text-xl text-stone-300 max-w-xl leading-relaxed font-light drop-shadow"
              >
                {slides[current].badgeText}
              </motion.p>

              {/* ACTION MATRIX */}
              <motion.div
                variants={typographyItemVariants}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 pt-2"
              >
                <Link
                  href={slides[current].ctaLink || '/shop'}
                  className="group flex items-center justify-center px-10 py-5 rounded-full text-white font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]"
                  style={{ 
                    backgroundColor: primaryColor,
                    boxShadow: `0 10px 30px -10px ${primaryColor}60`
                  }}
                >
                  {slides[current].ctaText}
                  <ArrowRightIcon className="w-4 h-4 ml-2.5 transition-transform group-hover:translate-x-1.5 stroke-[2.5]" />
                </Link>
                
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left justify-center px-2">
                  <span className="text-white font-bold text-lg leading-tight">4.9 / 5 Rating</span>
                  <span className="text-stone-400 text-xs mt-0.5 tracking-wide">From 20,000+ organic customers</span>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* MINIMALIST VERICAL HUD TIMELINE SLIDERS */}
      {slides.length > 1 && (
        <div className="absolute bottom-16 right-8 md:right-12 lg:right-16 xl:right-20 z-30 flex items-center space-x-4">
           {slides.map((_, i) => (
             <button
               key={i}
               onClick={() => setCurrent(i)}
               className="group relative h-10 w-1 bg-white/20 rounded-full overflow-hidden transition-all duration-300 focus:outline-none"
               aria-label={`Advance viewport to image panel presentation index 0${i + 1}`}
             >
               <div 
                 className={`absolute top-0 left-0 w-full bg-white transition-all duration-300 ${current === i ? 'h-full' : 'h-0'}`}
               />
             </button>
           ))}
        </div>
      )}

      {/* SCROLL NAVIGATION ANCHOR ICON */}
      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center text-white/40 pointer-events-none hidden sm:flex"
      >
        <span className="text-[9px] uppercase tracking-[0.3em] font-bold mb-1.5">Scroll</span>
        <ChevronDownIcon className="w-4 h-4 stroke-[2]" />
      </motion.div>
    </section>
  );
}