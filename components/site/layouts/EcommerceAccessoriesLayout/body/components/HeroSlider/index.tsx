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
      imageUrl: 'https://images.unsplash.com/photo-1599908617830-466d62886a87', // High-quality engine part
      headline: 'ENGINEERED\nTO PERFORM.',
      badgeText: 'OEM Quality Lubricants & Additives',
      subline: 'PERFORMANCE CORE',
      ctaText: 'Explore Fluids',
      ctaLink: '/automotiveecommerce/fluids',
      color: primary,
      category: 'Maintenance'
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e', // Racing Brake Kit
      headline: 'ULTIMATE\nSTOPPING POWER.',
      badgeText: 'Carbon-Ceramic Brake Systems',
      subline: 'CONTROL SYSTEMS',
      ctaText: 'Upgrade Brakes',
      ctaLink: '/automotiveecommerce/brakes',
      color: '#EF4444', // Red for brakes
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
      className="max-w-[1800px] mx-auto px-4 md:px-8 py-6 lg:py-10 bg-white dark:bg-[#09090b] transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-zinc-50 dark:bg-zinc-900/60 shadow-2xl shadow-zinc-200/50 dark:shadow-black/20 min-h-[600px] sm:min-h-[700px] lg:min-h-[680px] xl:min-h-[750px] border border-zinc-200/80 dark:border-zinc-800 transition-all">
        
        {/* --- PERFORMANCE GRID OVERLAY --- */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none transition-all duration-500 z-10" style={{ backgroundImage: 'url("/assets/grid_pattern.svg")', backgroundSize: '60px 60px' }} />
        
        {/* --- Dynamic Color Radial Highlight --- */}
        <div 
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full opacity-10 dark:opacity-20 blur-[150px] pointer-events-none transition-all duration-1000" 
          style={{ backgroundColor: activeSlide.color || primary }}
        />

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col lg:grid lg:grid-cols-12 h-full w-full"
          >
            {/* TEXT CONTENT (LHS) */}
            <div className="relative z-20 flex flex-col justify-center order-2 lg:order-1 h-full col-span-12 lg:col-span-6 p-8 md:p-16 xl:p-24 lg:pr-0">
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-6 sm:mb-8"
              >
                <TagIcon className="w-4 h-4 transition-colors duration-500" style={{ color: activeSlide.color || primary }} />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                  {activeSlide.subline}
                </span>
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-600">//</span>
                <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">{activeSlide.category}</span>
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-6xl lg:text-7xl xl:text-[80px] font-black text-zinc-900 dark:text-white leading-[0.95] tracking-tighter uppercase mb-6 sm:mb-8"
              >
                {activeSlide.headline.split('\n').map((textLine: string, i: number) => (
                  <span key={i} className="block">{textLine}</span>
                ))}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-md font-medium tracking-wide mb-10 sm:mb-12"
              >
                {activeSlide.badgeText}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full"
              >
                <Link href={activeSlide.ctaLink || "/automotiveecommerce/products"} className="w-full sm:w-auto">
                  <motion.span 
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 px-10 py-5 rounded-xl font-bold cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-zinc-950/20 dark:hover:shadow-white/10 transition-all border border-transparent dark:hover:bg-zinc-100"
                  >
                    <span className="uppercase tracking-[0.15em] text-xs font-extrabold">{activeSlide.ctaText}</span>
                    <WrenchScrewdriverIcon className="w-4 h-4 flex-shrink-0" />
                  </motion.span>
                </Link>
                
                <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-widest text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all group">
                  <ArchiveBoxIcon className="w-4 h-4 flex-shrink-0 text-zinc-400 group-hover:text-[var(--primary-color)]" />
                  Specifications
                </button>
              </motion.div>
            </div>

            {/* IMAGE SECTION (RHS) */}
            <div className="relative w-full h-[40vh] sm:h-[45vh] lg:h-full flex items-center justify-center order-1 lg:order-2 col-span-12 lg:col-span-6 p-8 lg:p-0 mt-8 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 50, rotate: 5 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full h-full max-w-[400px] sm:max-w-[500px] lg:max-w-none lg:w-[120%] lg:-ml-[10%] xl:-ml-[15%]"
              >
                <Image 
                  src={activeSlide.imageUrl || defaultSlides[0].imageUrl} 
                  alt="Automotive Performance Part" 
                  fill 
                  className="object-contain z-10 drop-shadow-[0_25px_45px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)]"
                  loader={loader}
                  priority
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* --- NAVIGATION & PROGRESS HUD --- */}
        <div className="absolute bottom-6 md:bottom-10 right-6 md:right-10 lg:right-16 xl:right-24 flex items-center gap-6 z-30 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl p-3 md:p-4 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl">
          <div className="flex gap-2">
            <NavBtn icon={<ChevronLeftIcon className="w-5 h-5" />} onClick={() => paginate(-1)} ariaLabel="Previous parts slide" />
            <NavBtn icon={<ChevronRightIcon className="w-5 h-5" />} onClick={() => paginate(1)} ariaLabel="Next parts slide" />
          </div>
          
          <div className="hidden md:flex items-center gap-1.5 pr-2">
            {slides.map((_: any, i: number) => {
              const isActive = current === i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className="relative h-2 rounded-full focus:outline-none group overflow-hidden"
                  style={{ width: isActive ? '40px' : '10px' }}
                  aria-label={`Jump to drive slide ${i + 1}`}
                >
                  {/* Background Track */}
                  <span className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                  
                  {/* Active Progress Bar with animation */}
                  {isActive && (
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: isPaused ? '100%' : '100%' }}
                      transition={{ duration: isPaused ? 0.5 : 7, ease: isPaused ? "easeOut" : "linear" }}
                      className="absolute inset-y-0 left-0 rounded-full z-10" 
                      style={{ backgroundColor: activeSlide.color || primary }}
                    />
                  )}
                  
                  {/* Hover indicator for inactive tabs */}
                  {!isActive && (
                    <span className="absolute inset-0 bg-zinc-400 dark:bg-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Mobile Category Label */}
        <div className="absolute top-6 left-6 z-30 lg:hidden flex items-center gap-2 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-lg px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800">
           <CursorArrowRaysIcon className="w-4 h-4" style={{ color: activeSlide.color || primary }} />
           <span className="text-[10px] font-black text-zinc-950 dark:text-white uppercase tracking-wider">{activeSlide.category}</span>
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
      className="p-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition-all active:scale-95 focus:outline-none"
    >
      {icon}
    </button>
  );
}