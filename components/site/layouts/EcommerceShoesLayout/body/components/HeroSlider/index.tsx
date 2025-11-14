'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide, StoreForm } from '@/types/typings';

// Using lucide-react icons instead of heroicons for a modern, sleek look (assuming availability)
// import { ChevronLeft, ChevronRight } from 'lucide-react'; 
// Assuming Image and Link are imported from 'next/image' and 'next/link' as in your original code
// import Image from 'next/image'; 
// import Link from 'next/link'; 

// --- Mock Imports for the single file mandate ---
// const Image = ({ src, alt, width, height, loader, className, priority }:{src: string; alt: string; width?: number; height?: number; loader?: any; className?: string; priority?: boolean}) => (
//     <img src={src} alt={alt} style={{ width: width, height: height, objectFit: 'contain' }} className={className} />
// );
// const Link = ({ href, className, children }:{ href: string; className?: string; children: React.ReactNode }) => (
//     <a href={href} className={className}>{children}</a>
// );
// const ChevronLeftIcon = ChevronLeft;
// const ChevronRightIcon = ChevronRight;
// --- End Mock Imports ---

// Mock Types for standalone component function
// interface HeroSlide {
//     imageUrl: string | null;
//     headline: string | null;
//     subline: string | null;
//     badgeText: string | null;
//     ctaText: string | null;
//     ctaLink: string | null;
//     id: string;
//     companyId: string;
//     type: any;
//     productImageUrl: string | null;
//     videoLink: string | null;
//     price: any;
//     endsAt: any;
//     order: number;
//     iconKey: any;
//     backgroundColor: string | null;
//     textColor: string | null;
// }
interface HeroSliderProps {
    heroSlides?: HeroSlide[];
    themeSettings?: any;
}
// Loader remains the same
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Default slides (updated to use light, friendly colors)
const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=200&h=200&auto=format&fit=crop', // Lifestyle shoe
    headline: 'Step Into Next-Level Comfort',
    subline: 'Sneakers',
    badgeText: 'Experience the perfect blend of ergonomic design and modern street style. Limited edition drop available now!',
    ctaText: 'Discover Collection',
    ctaLink: '#collection',
    id: '1',
    companyId: '',
    type: null,
    productImageUrl: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: '#fef3f4', // Very light rose/pink
    textColor: '#374151' // Dark Slate Gray
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1549298828-5221008d531a?q=80&w=200&h=200&auto=format&fit=crop', // Running shoe
    headline: 'Unleash Your Personal Best',
    subline: 'Performance',
    badgeText: 'Engineered for speed and endurance, featuring carbon fiber plating and responsive cushioning.',
    ctaText: 'Shop Performance',
    ctaLink: '#performance',
    id: '2',
    companyId: '',
    type: null,
    productImageUrl: null,
    videoLink: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: '#e0f2fe', // Very light blue
    textColor: '#1f2937' // Darker Slate Gray
  },
];

const transitionDuration = 0.8; // Smoother transition
const autoAdvanceDelay = 6000;

// Animation variants for orchestration
const slideVariants = {
  enter: (dir: number) => ({
    // Start off-screen
    opacity: 0,
    x: dir > 0 ? '100%' : '-100%',
  }),
  center: {
    // Slide to center and appear
    x: 0,
    opacity: 1,
    transition: {
      duration: transitionDuration,
      ease: [0.35, 0.05, 0.2, 0.95], // Custom ease for a smooth feel
      staggerChildren: 0.15, // Content staggers in after the main slide
      delayChildren: 0.3,
    },
  },
  exit: (dir: number) => ({
    // Slide off-screen
    opacity: 0,
    x: dir < 0 ? '100%' : '-100%',
    transition: { duration: transitionDuration, ease: [0.35, 0.05, 0.2, 0.95] },
  }),
};

// Variants for the content *inside* the slide (staggered)
const contentVariants = {
  enter: { opacity: 0, y: 30 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

// Variants for the image (subtle scale and lift)
const imageVariants = {
  enter: { opacity: 0, scale: 0.95, rotate: -3 },
  center: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    // Add a subtle translate Y for a 'floating' effect
    y: 0,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const slides: HeroSlide[] =
    (heroSlides && heroSlides.length > 0
      ? heroSlides.map((slide, i) => ({
          ...slide,
          // Fallbacks for image and text content
          imageUrl: slide.productImageUrl || slide.imageUrl || defaultSlides[i % defaultSlides.length].imageUrl,
          headline: slide.headline || defaultSlides[i % defaultSlides.length].headline,
          subline: slide.subline || defaultSlides[i % defaultSlides.length].subline,
          badgeText: (slide as any).badgeText || defaultSlides[i % defaultSlides.length].badgeText,
          ctaText: slide.ctaText || defaultSlides[i % defaultSlides.length].ctaText,
          ctaLink: slide.ctaLink || defaultSlides[i % defaultSlides.length].ctaLink,
          // Ensure colors have fallbacks (using light defaults)
          backgroundColor: slide.backgroundColor || defaultSlides[i % defaultSlides.length].backgroundColor,
          textColor: slide.textColor || defaultSlides[i % defaultSlides.length].textColor,
        }))
      : defaultSlides);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    if (index === current) return;
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, autoAdvanceDelay);
  }, [nextSlide]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    resetTimer(); 
    const offset = info.offset.x;
    if (offset < -50) nextSlide();
    else if (offset > 50) prevSlide();
  };

  return (
      <section className="relative my-28 overflow-hidden bg-white">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 relative">
          
          {/* Wrapper for slides: Defines height and layout */}
          <div className="relative min-h-[130vh] md:min-h-[120vh] lg:min-h-[85vh] flex items-center justify-center pt-8 pb-16 md:pt-0 md:pb-0">
            <AnimatePresence initial={false} custom={direction}>
              
              <motion.div
                key={current}
                className="absolute inset-0 flex flex-col-reverse lg:flex-row items-center justify-between p-6 md:p-10 rounded-[3rem] shadow-2xl transition-all duration-700 ease-in-out"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15} 
                onDragEnd={handleDragEnd}
                // Dynamic background and text color based on slide data
                style={{
                  backgroundColor: slides[current].backgroundColor || '#f9fafb',
                  color: slides[current].textColor || '#11182c',
                }}
              >

                {/* 1. Image & Overlay Area (Mobile: Bottom, Desktop: Left) */}
                <div className="w-full md:w-1/2 relative flex justify-center items-center h-1/2 lg:h-full py-4 lg:py-0">
                  
                  {/* Watermark Text */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(20vw,200px)] font-extrabold text-current opacity-5 pointer-events-none z-0 select-none uppercase tracking-widest">
                    {slides[current].subline || 'Shoe'}
                  </div>

                  {/* Product Image (Animated) */}
                  <motion.div
                    variants={imageVariants}
                    className="relative z-10 w-full max-w-[450px] lg:max-w-full transform lg:rotate-[-5deg] hover:rotate-[-2deg] transition-transform duration-500 ease-out"
                  >
                    <Image
                      src={slides[current].imageUrl || ''}
                      alt={slides[current].headline || 'Hero Slide Image'}
                      loader={loader}
                      width={600}
                      height={600}
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  </motion.div>
                </div>

                {/* 2. Content Area (Mobile: Top, Desktop: Right) */}
                {/* FIX: Changed opening <div> to <motion.div> to match the closing tag */}
                <motion.div 
                      variants={contentVariants}
                      className="w-full lg:w-1/2 relative z-10 text-center lg:text-left mt-4 lg:mt-0 px-4"
                  >

                  {/* Subline/Badge */}
                  <motion.p 
                      variants={contentVariants} 
                      className="text-sm font-semibold uppercase tracking-widest text-red-500 mb-2"
                  >
                    {slides[current].subline}
                  </motion.p>
                  
                  {/* Headline */}
                  <motion.h2
                    variants={contentVariants}
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight drop-shadow-md"
                  >
                    {slides[current].headline}
                  </motion.h2>

                  {/* Description Text */}
                  <motion.p
                    variants={contentVariants}
                    className="text-current opacity-80 text-base mt-6 max-w-lg mx-auto lg:mx-0"
                  >
                    {slides[current].badgeText}
                  </motion.p>

                  {/* CTA Button */}
                  <motion.div
                    variants={contentVariants}
                  >
                    <Link
                      href={slides[current].ctaLink || '#shop'}
                      className="inline-flex items-center gap-2 mt-8 font-bold text-sm sm:text-base px-8 py-4 rounded-full bg-red-500 text-white shadow-xl transition-all duration-300 hover:bg-red-600 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98]"
                    >
                      {slides[current].ctaText}
                        <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows (Z-index 30 for visibility) */}
          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 md:left-12 -translate-y-1/2 p-3 rounded-full bg-white/70 backdrop-blur-sm text-gray-800 shadow-xl transition-all hover:bg-white hover:scale-110 active:scale-95 z-30 ring-2 ring-red-100"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 md:right-12 -translate-y-1/2 p-3 rounded-full bg-white/70 backdrop-blur-sm text-gray-800 shadow-xl transition-all hover:bg-white hover:scale-110 active:scale-95 z-30 ring-2 ring-red-100"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>

          {/* Pagination Dots (Z-index 30 for visibility) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-3 rounded-full transition-all duration-300 shadow-inner ${
                  i === current ? 'w-6 bg-red-500' : 'w-3 bg-gray-400/50 hover:bg-gray-500/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
  );
}