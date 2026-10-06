'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  WrenchScrewdriverIcon, 
  CpuChipIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import SidebarCard from '../SidebarCard';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HardwareHeroSlider({ heroSlides, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#F59E0B'; 

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const defaultSlides = useMemo(() => [
    {
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c',
      headline: 'Built For\nPrecision.',
      badgeText: 'Professional Grade Power Tools',
      subline: 'INDUSTRIAL SERIES 2026',
      ctaText: 'Shop Power Tools',
      ctaLink: '/hardwareecommerce/powertools',
      color: primary,
      specs: ['20V Max', 'Brushless Motor', '4.0Ah Battery']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c',
      headline: 'Reinforce\nYour Vision.',
      badgeText: 'Heavy Duty Structural Materials',
      subline: 'CONSTRUCTION READY',
      ctaText: 'View Materials',
      ctaLink: '/hardwareecommerce/construction',
      color: '#0EA5E9',
      specs: ['ASTM Certified', 'Corrosion Resistant', 'Bulk Available']
    }
  ], [primary]);

  const slides = useMemo(() => {
    return heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides;
  }, [heroSlides, defaultSlides]);

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  }, [slides.length]);

  const activeSlide = slides[current] || defaultSlides[0];

  return (
    <section className="max-w-[1800px] mx-auto px-3 sm:px-6 md:px-8 py-3 sm:py-4 lg:py-6 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* --- MAIN STAGE --- */}
        <div className="lg:col-span-9 relative rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 shadow-xl dark:shadow-2xl min-h-[480px] sm:min-h-[560px] md:min-h-[620px] lg:min-h-[580px] xl:min-h-[660px] border border-zinc-200/80 dark:border-zinc-800/80 transition-all flex flex-col justify-between">
          
          {/* Industrial Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none transition-all duration-500" 
            style={{ 
              backgroundImage: `radial-gradient(${activeSlide.color || primary} 1.5px, transparent 0)`, 
              backgroundSize: '28px 28px' 
            }} 
          />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 p-5 sm:p-8 md:p-12 xl:p-16 pb-20 sm:pb-24 lg:pb-16 h-full w-full items-center"
            >
              
              {/* TEXT CONTENT */}
              <div className="lg:col-span-7 relative z-20 flex flex-col justify-center order-2 lg:order-1">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-4">
                  <div className="h-[2px] w-7 sm:w-10 transition-colors duration-500" style={{ backgroundColor: activeSlide.color || primary }} />
                  <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
                    {activeSlide.subline}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-zinc-900 dark:text-white leading-[0.95] tracking-tighter uppercase mb-2 sm:mb-4">
                  {activeSlide.headline.split('\n').map((textLine: string, i: number) => (
                    <span key={i} className="block">{textLine}</span>
                  ))}
                </h2>

                <p className="text-xs sm:text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-md font-semibold tracking-wide mb-5 sm:mb-8 line-clamp-2 sm:line-clamp-none">
                  {activeSlide.badgeText}
                </p>

                <div className="flex flex-row items-center gap-2.5 sm:gap-4 w-full">
                  <Link href={activeSlide.ctaLink || "/hardwareecommerce/products"} className="flex-1 sm:flex-none">
                    <motion.span 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 sm:gap-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold cursor-pointer shadow-md hover:shadow-lg transition-all border border-transparent dark:hover:bg-zinc-100"
                    >
                      <span className="uppercase tracking-[0.12em] text-[10px] sm:text-xs font-extrabold whitespace-nowrap">{activeSlide.ctaText}</span>
                      <WrenchScrewdriverIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    </motion.span>
                  </Link>
                  
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-wider text-[10px] sm:text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all whitespace-nowrap">
                    <CpuChipIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-zinc-400" />
                    Manuals
                  </button>
                </div>
              </div>

              {/* IMAGE SECTION */}
              <div className="lg:col-span-5 relative w-full h-[180px] sm:h-[240px] md:h-[280px] lg:h-full flex items-center justify-center order-1 lg:order-2">
                <motion.div
                  initial={{ rotate: -3, scale: 0.9, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative w-full h-full max-h-[220px] sm:max-h-[300px] lg:max-h-[420px]"
                >
                  <Image decoding="async" 
                    src={activeSlide.imageUrl || defaultSlides[0].imageUrl} 
                    alt="Hardware Engineering Product" 
                    fill 
                    className="object-contain z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_25px_40px_rgba(0,0,0,0.4)]"
                    priority
                  />
                </motion.div>

                {/* Technical Specs Floating Badge (Tablet & Large Screens) */}
                {activeSlide.specs && activeSlide.specs.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="absolute right-0 top-2 lg:top-8 z-20 hidden md:block bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg max-w-[170px] lg:max-w-[190px]"
                  >
                    <p className="text-[9px] font-black uppercase mb-2 tracking-widest text-zinc-400 dark:text-zinc-500">Specifications</p>
                    <div className="space-y-1.5 sm:space-y-2">
                      {activeSlide.specs.map((spec: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <ShieldCheckIcon className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
                          <span className="text-[10px] sm:text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>

          {/* PROGRESS & NAVIGATION HUD */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-5 sm:left-8 md:left-12 lg:left-12 xl:left-16 flex items-center gap-4 sm:gap-8 z-30">
            <div className="flex gap-2">
              <NavBtn icon={<ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />} onClick={() => paginate(-1)} ariaLabel="Previous slider entry" />
              <NavBtn icon={<ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />} onClick={() => paginate(1)} ariaLabel="Next slider entry" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {slides.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 focus:outline-none ${
                    current === i ? 'w-10 sm:w-14' : 'w-2.5 hover:w-5 bg-zinc-300 dark:bg-zinc-700'
                  }`}
                  style={{ backgroundColor: current === i ? (activeSlide.color || primary) : undefined }}
                  aria-label={`Jump to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- SIDEBAR CARDS --- */}
        <div className="lg:col-span-3 flex lg:flex-col gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 snap-x snap-mandatory scrollbar-none custom-scrollbar">
          <div className="flex-shrink-0 w-[80vw] sm:w-[48%] lg:w-full snap-start">
            <SidebarCard title="Machinery" subtitle="HEAVY DUTY" img="https://images.unsplash.com/photo-1504148455328-c376907d081c" color="#18181b" isDark />
          </div>
          <div className="flex-shrink-0 w-[80vw] sm:w-[48%] lg:w-full snap-start">
            <SidebarCard title="Plumbing" subtitle="ELITE TOOLS" img="https://images.unsplash.com/photo-1585713181935-d5f622cc2415" color="#f59e0b" />
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
      className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md text-zinc-800 dark:text-zinc-200 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 transition-all active:scale-95 focus:outline-none"
    >
      {icon}
    </button>
  );
}