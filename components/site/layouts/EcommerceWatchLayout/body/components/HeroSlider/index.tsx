'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 7000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=80',
    subline: 'The Midnight Limited Edition features subtle accents of white luminescent hands and raised steel indices.',
    headline: 'Precision & Heritage',
    ctaText: 'View Collection',
    ctaLink: '/shop',
    id: '1',
    companyId: '',
    productImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    badgeText: 'New Arrival',
    price: '$2,450',
    backgroundColor: '#0a0a0a',
    textColor: '#FFFFFF',
    order: 0,
    iconKey: null,
    videoLink: null,
    type: null,
    endsAt: null
  }
];

// High-end staggered text animations variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const slides = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [isHovered, setIsHovered] = useState(false);
  const primary = themeSettings?.primaryColor || '#C5A059'; 

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered]);

  // Defensive parsing for dual-weight headline structures
  const renderHeadline = (headlineStr: string = '') => {
    const parts = headlineStr.trim().split(' ');
    if (parts.length <= 1) {
      return <span className="font-serif italic font-light text-white">{headlineStr}</span>;
    Part}
    const firstWord = parts[0];
    const internalRemainder = parts.slice(1).join(' ');
    return (
      <>
        <span className="font-serif italic font-light text-white">{firstWord}</span>
        <br />
        <span className="not-italic font-sans font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-neutral-400">
          {internalRemainder}
        </span>
      </>
    );
  };

  return (
    <section 
      className="relative w-full bg-[#050505] min-h-[100svh] lg:h-screen flex items-center overflow-hidden pt-24 pb-32 lg:py-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* CINEMATIC LAYERED BACKDROPS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-b lg:bg-gradient-to-l opacity-40 mix-blend-screen transition-all duration-1000 blur-[120px]"
          style={{ backgroundImage: `radial-gradient(circle at 70% 30%, ${primary}25, transparent 60%)` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>
      
      <div className="container mx-auto px-6 sm:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-16 items-center">
          
          {/* LEFT CONTENT CONTAINER: EDITORIAL STYLE */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6 md:space-y-8 text-center lg:text-left"
              >
                {/* Micro-Header Badge */}
                <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start gap-3.5">
                  <div className="h-[1px] w-8 transition-all duration-500" style={{ backgroundColor: primary }} />
                  <span className="uppercase tracking-[0.35em] text-[10px] md:text-xs font-bold" style={{ color: primary }}>
                    {slides[current].badgeText || "Masterpiece Series"}
                  </span>
                </motion.div>

                {/* Main Heading Component */}
                <motion.h1 
                  variants={itemVariants}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] xl:text-[5.5rem] leading-[1.08] tracking-tight"
                >
                  {renderHeadline(slides[current]?.headline)}
                </motion.h1>

                {/* Subheading Content Description */}
                <motion.p 
                  variants={itemVariants}
                  className="text-neutral-400 text-base md:text-lg max-w-md lg:max-w-lg mx-auto lg:ml-0 leading-relaxed font-light"
                >
                  {slides[current]?.subline || 'Luxury timepiece configuration.'}
                </motion.p>

                {/* Interactive Action Hub */}
                <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
                  <Link
                    href={slides[current]?.ctaLink || '/shop'}
                    className="group relative inline-flex items-center justify-center gap-3 text-black font-bold uppercase tracking-widest text-xs md:text-sm px-8 py-4 md:px-10 md:py-5 overflow-hidden transition-transform active:scale-[0.98] rounded-none shadow-xl"
                    style={{ backgroundColor: primary }}
                  >
                    <span className="absolute inset-0 w-full h-full bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0" />
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-black">
                      {slides[current]?.ctaText || 'Shop Now'}
                    </span>
                    <ArrowRightIcon className="w-4 h-4 relative z-10 transform transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-black" />
                  </Link>
                  
                  {slides[current].price && (
                    <div className="text-white border-l border-neutral-800 pl-6 text-left">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-0.5">Value Statement</p>
                      <p className="text-xl md:text-2xl font-light font-mono tracking-tight text-neutral-100">{slides[current].price}</p>
                    </div>
                  )}
                </motion.div>

                {/* Horizontal Baseline Security Trust Badges */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-900 max-w-md mx-auto lg:ml-0">
                  <div className="flex items-center justify-center lg:justify-start gap-2.5 text-neutral-400 text-[10px] md:text-xs uppercase tracking-widest font-medium">
                    <ShieldCheckIcon className="w-4 h-4 shrink-0" style={{ color: primary }} /> 2 Year Warranty
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2.5 text-neutral-400 text-[10px] md:text-xs uppercase tracking-widest font-medium">
                    <SparklesIcon className="w-4 h-4 shrink-0" style={{ color: primary }} /> Certified Authentic
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT CONTENT CONTAINER: VISUAL GALLERY MATRICES */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative w-full aspect-square max-w-[320px] sm:max-w-[440px] lg:max-w-[500px] xl:max-w-[540px] mx-auto group">
              
              {/* Main Photo Card Component with Micro Ken-Burns Effect */}
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] bg-neutral-900 border border-neutral-800/60 relative">
                <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                  <motion.div
                    key={current}
                    custom={direction}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image decoding="async"
                      src={slides[current].imageUrl}
                      alt={slides[current].headline || 'Timepiece showcase'}
                      fill
                      className="object-cover transition-transform duration-[6000ms] group-hover:scale-105"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Floating Picture-in-Picture Macro Product Card */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={current}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute -left-4 -bottom-6 sm:-left-8 sm:-bottom-8 lg:-left-12 lg:-bottom-12 z-20 w-[42%] aspect-[4/5] bg-[#0c0c0c] border-4 sm:border-8 border-[#050505] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.8)] rounded-md overflow-hidden hidden sm:block group/pip"
                >
                  <div className="relative w-full h-full">
                    <Image decoding="async"
                      src={slides[current].productImageUrl || slides[current].imageUrl}
                      alt="Macro detail review"
                      fill
                      className="object-cover transition-transform duration-700 group-hover/pip:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <ClockIcon className="w-5 h-5 mb-1" style={{ color: primary }} />
                        <p className="text-[9px] text-white uppercase font-bold tracking-[0.18em] leading-none">Swiss Made</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Decorative Linear Frame Overlay */}
              <div 
                className="absolute -top-6 -right-6 w-32 h-32 border-t border-r rounded-tr-xl opacity-20 pointer-events-none transition-colors duration-500 hidden md:block" 
                style={{ borderColor: primary }}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM METRIC DASHBOARD & PANEL CONTROL ARRAYS */}
        <div className="absolute bottom-6 left-6 right-6 lg:left-8 lg:right-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-neutral-900/60 pt-6">
          
          {/* Index Pills featuring Real-time Linear Micro-Timers */}
          <div className="flex items-center gap-6 md:gap-8 order-2 sm:order-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`group relative pb-2 text-left transition-colors duration-300 ${current === i ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'}`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-mono tracking-tight font-medium">0{i + 1}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-[0.2em] transition-all duration-300 hidden md:inline-block ${current === i ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 w-0'}`}>
                    {slides[i]?.headline?.split(' ')[0] || 'Series'}
                  </span>
                </div>
                
                {/* Visual Timer Progress Bar */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-neutral-800 w-full overflow-hidden">
                  {current === i && (
                    <motion.div 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: isHovered ? 0.3 : 1 }}
                      transition={{ 
                        duration: isHovered ? 0.2 : (autoAdvanceDelay / 1000), 
                        ease: "linear" 
                      }}
                      className="h-full w-full origin-left"
                      style={{ backgroundColor: primary }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex gap-[1px] bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-none overflow-hidden order-1 sm:order-2 shadow-2xl">
            <button 
              onClick={prevSlide}
              className="p-3.5 md:p-4.5 bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all active:scale-95"
              aria-label="Previous Slide"
            >
              <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="w-[1px] bg-neutral-800 self-stretch" />
            <button 
              onClick={nextSlide}
              className="p-3.5 md:p-4.5 bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all active:scale-95"
              aria-label="Next Slide"
            >
              <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
}