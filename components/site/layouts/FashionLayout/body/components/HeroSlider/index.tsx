'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
// Assuming '@/types/typings' and 'HeroSlide' are correctly defined
import { HeroSlide } from '@/types/typings'; 

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 5000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop',
    subline: 'Spring Collection 2025',
    headline: 'Redefine Your\nUnique Style',
    badgeText: 'Discover the latest trends in street fashion and luxury wear. Curated for the bold, designed for the elegant.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    id: '',
    companyId: '',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
  },
  // Add another default slide for testing slider functionality
  {
    imageUrl: 'https://images.unsplash.com/photo-1594928038755-6c71c1b18d23?q=80&w=1000&auto=format&fit=crop',
    subline: 'Limited Edition Drops',
    headline: 'Experience\n$Luxury$ Comfort',
    badgeText: 'Explore exclusive items available for a limited time. Don\'t miss out on these rare pieces.',
    ctaText: 'Explore',
    ctaLink: '/limited-edition',
    id: '2',
    companyId: '',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 1,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
  },
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const heroSlidesToShow: HeroSlide[] = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides).map(
    (slide, index) => ({
      ...slide,
      // Fallback logic for data integrity
      imageUrl: slide.imageUrl || defaultSlides[index % defaultSlides.length]?.imageUrl || defaultSlides[0].imageUrl,
      subline: slide.subline || defaultSlides[index % defaultSlides.length]?.subline || 'Spring Collection 2025',
      headline: slide.headline || defaultSlides[index % defaultSlides.length]?.headline || 'Redefine Your Unique Style',
      badgeText:
        slide.badgeText ||
        defaultSlides[index % defaultSlides.length]?.badgeText ||
        'Discover curated collections and exceptional savings on your favorite products.',
      ctaText: slide.ctaText || 'Shop Now',
      ctaLink: slide.ctaLink || '/shop',
    })
  );

  // Dynamic Theme Colors
  const primary = themeSettings?.primaryColor || '#6366F1'; // Default Indigo
  const secondary = themeSettings?.secondaryColor || '#EC4899'; // Default Pink

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (heroSlidesToShow.length > 1) { // Only auto-advance if more than one slide exists
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
    // Only allow navigation if there's more than one slide
    if (heroSlidesToShow.length <= 1) return;
    clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  };

  const prevSlide = () => goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1);
  const nextSlide = () => goTo((current + 1) % heroSlidesToShow.length, 1);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (heroSlidesToShow.length <= 1) return;
    const offset = info.offset.x;
    if (offset < -50) nextSlide();
    else if (offset > 50) prevSlide();
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 100 : -100 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
    exit: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0, transition: { duration: 0.8 } }),
  };

  const fadeIn = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } } };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.2 } } };

  const currentSlide = heroSlidesToShow[current];

  return (
    <section className="relative w-full min-h-screen flex items-center bg-[#f8f8f8] overflow-hidden">
      {/* Subtle Background Accent (Replaced the harsh skew) */}
      <div className="absolute inset-y-0 right-0 w-[50vw] bg-indigo-50/50 [clip-path:polygon(20%_0%,_100%_0%,_100%_100%,_0%_100%)] z-0 hidden md:block" />

      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Content (Ordered first on mobile, second on desktop) */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer} 
          className="space-y-6 md:order-first"
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {/* The slide wrapper key={current} ensures the entire block re-renders and animates */}
            <motion.div
              key={current}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              custom={direction}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              className="space-y-6" // Apply spacing inside this motion div
            >
              <motion.div variants={fadeIn} className="flex items-center gap-2">
                <span 
                  className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full"
                  style={{ backgroundColor: `${primary}15`, color: primary }} // Themed badge
                >
                  {currentSlide.badgeText}
                </span>
              </motion.div>

              {/* Responsive Headline Sizing */}
              <motion.h1 
                variants={fadeIn} 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] whitespace-pre-line"
              >
                {/* Headline with $highlight$ logic */}
                {currentSlide.headline?.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line.includes('$') ? (
                      <>
                        {line.split('$')[0]}
                        <span style={{ color: secondary }}>{line.split('$')[1]}</span>
                      </>
                    ) : (
                      line
                    )}
                    <br />
                  </React.Fragment>
                ))}
              </motion.h1>

              <motion.p variants={fadeIn} className="text-lg text-slate-600 max-w-lg">
                {currentSlide.subline}
              </motion.p>
              
              {/* CTAs */}
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href={currentSlide.ctaLink || '#'}
                  className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-all group shadow-lg"
                >
                  {currentSlide.ctaText} <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                {/* <button 
                  className="px-8 py-4 rounded-full font-semibold text-slate-700 border border-current hover:bg-slate-50 transition-all justify-center flex items-center"
                  style={{ borderColor: primary, color: primary }} // Themed secondary button
                >
                  View Lookbook
                </button> */}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Image Display */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          // Responsive sizing: Fixed height on mobile, aspect ratio on desktop
          className="relative w-full h-[400px] md:h-auto md:aspect-square md:max-h-[650px] mt-8 md:mt-0"
        >
          <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-slate-400/50">
            <Image
              src={currentSlide.imageUrl || 'https://via.placeholder.com/1000/600/C0C0C0?text=No+Image'}
              alt={currentSlide.headline || 'Hero Image'}
              loader={loader}
              fill
              className="object-cover transition-opacity duration-500"
              priority
            />
            
            {/* Overlay Card - Simplified Product Teaser */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-6 left-6 right-6 bg-white/70 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/50" 
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500">Curated Look</p>
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{currentSlide.headline?.split('\n')[0]}</h3> 
                </div>
                <Link 
                  href={currentSlide.ctaLink || '#'} 
                  className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
                  aria-label={`View featured look: ${currentSlide.headline?.split('\n')[0]}`}
                >
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Arrows (Hidden on small screens, rely on swipe) */}
      {heroSlidesToShow.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-8 transform -translate-y-1/2 bg-white/50 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-30 backdrop-blur-sm hidden sm:block"
            aria-label="Previous slide"
          >
            <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-8 transform -translate-y-1/2 bg-white/50 hover:bg-white p-3 md:p-4 rounded-full text-gray-800 shadow-xl transition-all duration-200 z-30 backdrop-blur-sm hidden sm:block"
            aria-label="Next slide"
          >
            <ArrowRightIcon className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </>
      )}

      {/* Pagination Dots (Always visible, theme-aware) */}
      {heroSlidesToShow.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
          {heroSlidesToShow.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx, idx > current ? 1 : -1)}
              // Styling applied to the button itself for better a11y and click target
              className={`relative w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'scale-125'
                  : 'bg-gray-400 opacity-50 hover:opacity-100'
              }`}
              style={idx === current ? { backgroundColor: primary, boxShadow: `0 0 0 3px ${primary}50` } : {}}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}