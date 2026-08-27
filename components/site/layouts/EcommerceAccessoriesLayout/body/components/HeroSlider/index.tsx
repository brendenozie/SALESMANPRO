'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  WrenchScrewdriverIcon, 
  TagIcon,
  ArchiveBoxIcon,
  CursorArrowRaysIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Custom Hook for Auto-Play functionality
const useAutoplay = (callback: () => void, delay: number | null) => {
  const savedCallback = React.useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default function AutomotiveHero({ heroSlides, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#F59E0B'; 
  
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const defaultSlides = useMemo(() => [
    {
      imageUrl: 'https://images.unsplash.com/photo-1599908617830-466d62886a87',
      headline: 'ENGINEERED\nTO PERFORM.',
      badgeText: 'OEM Quality Lubricants & Additives',
      subline: 'PERFORMANCE CORE',
      ctaText: 'Explore Fluids',
      ctaLink: '/automotiveecommerce/fluids',
      color: primary,
      category: 'Maintenance'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e',
      headline: 'ULTIMATE\nSTOPPING POWER.',
      badgeText: 'Carbon-Ceramic Brake Systems',
      subline: 'CONTROL SYSTEMS',
      ctaText: 'Upgrade Brakes',
      ctaLink: '/automotiveecommerce/brakes',
      color: '#EF4444',
      category: 'Performance'
    }
  ], [primary]);

  const slides = useMemo(() => {
    return heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides;
  }, [heroSlides, defaultSlides]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play logic (pauses on hover)
  useAutoplay(() => paginate(1), isPaused ? null : 7000);

  const activeSlide = slides[current] || defaultSlides[0];

  return (
    <section 
      style={{ '--primary-color': primary } as React.CSSProperties}
      className="max-w-[1800px] mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 lg:py-10 bg-white dark:bg-[#09090b] transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-zinc-50 dark:bg-zinc-900/60 shadow-2xl shadow-zinc-200/50 dark:shadow-black/20 min-h-[640px] sm:min-h-[700px] lg:min-h-[680px] xl:min-h-[750px] border border-zinc-200/80 dark:border-zinc-800 transition-all flex flex-col justify-between">
        
        {/* --- PERFORMANCE GRID OVERLAY --- */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none transition-all duration-500 z-10" style={{ backgroundImage: 'url("/assets/grid_pattern.svg")', backgroundSize: '60px 60px' }} />
        
        {/* --- Dynamic Color Radial Highlight --- */}
        <div 
          className="absolute -top-1/4 -right-1/4 w-[400px] sm:w-[600px] lg:w-[800px] h-[400px] sm:h-[600px] lg:h-[800px] rounded-full opacity-10 dark:opacity-20 blur-[100px] sm:blur-[150px] pointer-events-none transition-all duration-1000" 
          style={{ backgroundColor: activeSlide.color || primary }}
        />

        {/* Dynamic Mobile Category Badge */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 lg:hidden flex items-center gap-2 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CursorArrowRaysIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: activeSlide.color || primary }} />
          <span className="text-[9px] sm:text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-wider">{activeSlide.category}</span>
        </div>

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full flex flex-col lg:grid lg:grid-cols-12 flex-1 relative z-20"
          >
            {/* IMAGE SECTION (MOBILE FIRST: TOP ORDER / DESKTOP: RHS ORDER 2) */}
            <div className="relative w-full h-[240px] sm:h-[340px] lg:h-full flex items-center justify-center order-1 lg:order-2 col-span-12 lg:col-span-6 p-4 sm:p-8 lg:p-0 mt-10 sm:mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 3 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full max-w-[320px] sm:max-w-[480px] lg:max-w-none lg:w-[115%] lg:-ml-[8%] xl:-ml-[12%]"
              >
                <Image 
                  src={activeSlide.imageUrl || defaultSlides[0].imageUrl} 
                  alt="Automotive Performance Part" 
                  fill 
                  className="object-contain z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
                  loader={loader}
                  priority
                  unoptimized
                />
              </motion.div>
            </div>

            {/* TEXT CONTENT (MOBILE SECOND: BOTTOM ORDER / DESKTOP: LHS ORDER 1) */}
            <div className="relative z-20 flex flex-col justify-center order-2 lg:order-1 col-span-12 lg:col-span-6 p-5 sm:p-10 md:p-16 xl:p-24 lg:pr-0 pb-24 sm:pb-28 lg:pb-24">
              
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6"
              >
                <TagIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-500" style={{ color: activeSlide.color || primary }} />
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                  {activeSlide.subline}
                </span>
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600">//</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider hidden sm:inline-block">{activeSlide.category}</span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] font-black text-zinc-900 dark:text-white leading-[1.0] sm:leading-[0.95] tracking-tighter uppercase mb-4 sm:mb-6"
              >
                {activeSlide.headline.split('\n').map((textLine: string, i: number) => (
                  <span key={i} className="block">{textLine}</span>
                ))}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-xs sm:text-base md:text-lg text-zinc-600 dark:text-zinc-300 max-w-md font-medium tracking-wide mb-8 sm:mb-10"
              >
                {activeSlide.badgeText}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full"
              >
                <Link href={activeSlide.ctaLink || "/automotiveecommerce/products"} className="w-full sm:w-auto">
                  <motion.span 
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 sm:gap-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl font-bold cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-zinc-950/20 dark:hover:shadow-white/10 transition-all border border-transparent dark:hover:bg-zinc-100"
                  >
                    <span className="uppercase tracking-[0.15em] text-xs font-extrabold">{activeSlide.ctaText}</span>
                    <WrenchScrewdriverIcon className="w-4 h-4 flex-shrink-0" />
                  </motion.span>
                </Link>
                
                <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 sm:gap-3 px-6 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-widest text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all group">
                  <ArchiveBoxIcon className="w-4 h-4 flex-shrink-0 text-zinc-400 group-hover:text-[var(--primary-color)]" />
                  Specifications
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* --- NAVIGATION & PROGRESS HUD --- */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-10 md:right-10 lg:right-16 xl:right-24 flex items-center gap-3 sm:gap-6 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl p-2 sm:p-3 md:p-4 rounded-full border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl">
          <div className="flex gap-1.5 sm:gap-2">
            <NavBtn icon={<ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />} onClick={() => paginate(-1)} ariaLabel="Previous slide" />
            <NavBtn icon={<ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />} onClick={() => paginate(1)} ariaLabel="Next slide" />
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 pr-1 sm:pr-2">
            {slides.map((_: any, i: number) => {
              const isActive = current === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className="relative h-1.5 sm:h-2 rounded-full focus:outline-none group overflow-hidden transition-all duration-300"
                  style={{ width: isActive ? '32px' : '8px' }}
                  aria-label={`Jump to slide ${i + 1}`}
                >
                  {/* Track */}
                  <span className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                  
                  {/* Progress fill */}
                  {isActive && (
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: isPaused ? 0.3 : 7, ease: isPaused ? "easeOut" : "linear" }}
                      className="absolute inset-y-0 left-0 rounded-full z-10" 
                      style={{ backgroundColor: activeSlide.color || primary }}
                    />
                  )}
                  
                  {!isActive && (
                    <span className="absolute inset-0 bg-zinc-400 dark:bg-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function NavBtn({ icon, onClick, ariaLabel }: { icon: React.ReactNode; onClick: () => void; ariaLabel?: string }) {
  return (
    <button 
      onClick={onClick}
      aria-label={ariaLabel}
      className="p-2 sm:p-3 md:p-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition-all active:scale-95 focus:outline-none"
    >
      {icon}
    </button>
  );
}