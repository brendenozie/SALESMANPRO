'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { HeroSlide } from '@/types/typings';

const STATIC_SLIDES = [
  {
    id: 'static1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2670&auto=format&fit=crop',
    badgeText: 'ECONOMY',
    headline: 'Exploring the Intricacies of Global Economies',
    subline: 'Dive deep into markets, money, and macroeconomic trends that shape our world.',
    ctaText: 'Learn More',
    ctaLink: '#',
    order: 1,
  },
  {
    id: 'static2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop',
    badgeText: 'STYLE',
    headline: 'A Journey Through Colors, Textures, and Trends',
    subline: 'Stay ahead of the curve with our comprehensive style guides.',
    ctaText: 'Explore Style',
    ctaLink: '#',
  },
  {
    id: 'static3',
    type: 'video',
    url: 'https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4',
    badgeText: 'ART',
    headline: 'Inspiring Creativity and Fostering Artistic Expression',
    subline: 'Discover inspiring art, artist profiles, and creative processes.',
    ctaText: 'View Art',
    ctaLink: '#',
    order: 3,
  },
];

interface HeroSectionProps { 
  heroSlides?: HeroSlide[];
}

const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const contentVariants = {
  initial: { y: 15, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
};

const itemVariants = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const HeroSection = ({ heroSlides }: HeroSectionProps) => {
  const { storeFormData } = useStoreContext() || {};
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#f97316';
  const autoAdvanceDelay = 8000;

  // Standardize normalization across mixed dynamic types or fallback arrays
  const slides = React.useMemo(() => {
    if (Array.isArray(heroSlides) && heroSlides.length > 0) {
      return [...heroSlides]
        .sort((a, b) => a.order - b.order)
        .map((slide) => ({
          id: slide.id,
          type: 'image',
          url: slide.imageUrl || slide.productImageUrl || 'https://placehold.co/1200x800/1E90FF/FFFFFF?text=No+Media',
          badgeText: slide.badgeText || 'UPDATE',
          headline: slide.headline || '',
          subline: slide.subline || '',
          ctaText: slide.ctaText || 'Read More',
          ctaLink: slide.ctaLink || '#',
        }));
    }
    return STATIC_SLIDES;
  }, [heroSlides]);

  const advanceSlide = useCallback((direction: "next" | "prev") => {
    setCurrent((prev) =>
      direction === "next"
        ? (prev + 1) % slides.length
        : (prev - 1 + slides.length) % slides.length
    );
  }, [slides.length]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, advanceSlide]);

  const handleDotClick = (index: number) => {
    setCurrent(index);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/1200x800/1e293b/ffffff?text=Image+Unavailable';
  };

  const currentSlide = slides[current];

  if (!currentSlide) return null;

  return (
    <div className="w-full h-screen bg-slate-950 text-white font-sans overflow-hidden relative border-b border-slate-900">
      
      {/* ===== BACKGROUND MEDIA INTERACTION ===== */}
      <AnimatePresence initial={false} mode="ignore">
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {currentSlide.type === "video" ? (
            <video
              src={currentSlide.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentSlide.url}
              alt={currentSlide.headline}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          {/* Professional Solid Uniform Mask tinting for contrast optimization */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>

      {/* ===== MAIN CONTAINER AND TEXT CORE ===== */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="initial"
            className="max-w-3xl text-left space-y-5"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <span className="px-3 py-1 rounded border border-slate-700 bg-slate-900 text-xs font-semibold uppercase tracking-wider text-slate-300">
                {currentSlide.badgeText}
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
            >
              {currentSlide.headline}
            </motion.h1>
            
            <motion.p 
              variants={itemVariants} 
              className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl"
            >
              {currentSlide.subline}
            </motion.p>
            
            <motion.div variants={itemVariants} className="pt-2">
              <a
                href={currentSlide.ctaLink}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: primaryColor }}
              >
                {currentSlide.ctaText}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===== LOWER NAVIGATION LAYOUT TRAY ===== */}
      <div className="absolute bottom-8 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between border-t border-slate-800/60 pt-4">
          
          {/* Manual Triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => advanceSlide("prev")}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Previous Slide"
            >
              <ArrowLeftIcon />
            </button>
            <button
              onClick={() => advanceSlide("next")}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Next Slide"
            >
              <ArrowRight />
            </button>
          </div>

          {/* Clean Pagination Dots indicators */}
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  index === current ? 'w-6' : 'w-1.5 opacity-40 hover:opacity-100'
                }`}
                style={{ backgroundColor: index === current ? primaryColor : '#94a3b8' }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </div>

    </div>
  );
};

export default HeroSection;