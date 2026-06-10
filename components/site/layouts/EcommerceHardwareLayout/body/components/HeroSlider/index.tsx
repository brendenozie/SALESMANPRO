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
  const secondary = themeSettings?.secondaryColor || '#3F3F46';

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
    <section className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 py-4 lg:py-8 bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* --- MAIN STAGE --- */}
        <div className="lg:col-span-9 relative rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-zinc-50 dark:bg-zinc-900/50 shadow-2xl min-h-[750px] sm:min-h-[800px] lg:min-h-[720px] xl:min-h-[780px] border border-zinc-200/80 dark:border-zinc-800/80 transition-all">
          
          {/* Industrial Grid Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] pointer-events-none transition-all duration-500" 
            style={{ 
              backgroundImage: `radial-gradient(${activeSlide.color || primary} 1.5px, transparent 0)`, 
              backgroundSize: '32px 32px' 
            }} 
          />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col lg:grid lg:grid-cols-2 p-6 sm:p-10 md:p-16 xl:p-20 h-full w-full"
            >
              {/* IMAGE SECTION */}
              <div className="relative w-full h-[35vh] sm:h-[40vh] lg:h-full flex items-center justify-center order-1 lg:order-2 mb-6 lg:mb-0">
                <motion.div
                  initial={{ rotate: -4, scale: 0.9, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="relative w-full h-full max-h-[300px] sm:max-h-[380px] lg:max-h-full"
                >
                  <Image 
                    src={activeSlide.imageUrl || defaultSlides[0].imageUrl} 
                    alt="Hardware Product Engineering" 
                    fill 
                    className="object-contain z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_35px_50px_rgba(0,0,0,0.45)]"
                    loader={loader}
                    priority
                  />
                </motion.div>

                {/* Technical Specs Floating Badge */}
                {activeSlide.specs && activeSlide.specs.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute right-0 xl:right-4 top-12 xl:top-1/4 z-20 hidden md:block bg-white/75 dark:bg-zinc-950/75 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-2xl shadow-xl max-w-[200px]"
                  >
                    <p className="text-[10px] font-black uppercase mb-3 tracking-widest text-zinc-400 dark:text-zinc-500">Specifications</p>
                    <div className="space-y-2.5">
                      {activeSlide.specs.map((spec: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <ShieldCheckIcon className="w-4 h-4 flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* TEXT CONTENT */}
              <div className="relative z-20 flex flex-col justify-center order-2 lg:order-1 h-full">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="h-[2px] w-10 sm:w-12 transition-colors duration-500" style={{ backgroundColor: activeSlide.color || primary }} />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
                    {activeSlide.subline}
                  </span>
                </div>

                <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-[85px] font-black text-zinc-900 dark:text-white leading-[0.9] tracking-tighter uppercase mb-4 sm:mb-6">
                  {activeSlide.headline.split('\n').map((textLine: string, i: number) => (
                    <span key={i} className="block">{textLine}</span>
                  ))}
                </h2>

                <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-sm font-semibold tracking-wide mb-8 sm:mb-10">
                  {activeSlide.badgeText}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <Link href={activeSlide.ctaLink || "/hardwareecommerce/products"} className="w-full sm:w-auto">
                    <motion.span 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto flex items-center justify-center gap-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 sm:px-10 py-5 rounded-2xl font-bold cursor-pointer shadow-lg hover:shadow-xl transition-all border border-transparent dark:hover:bg-zinc-100"
                    >
                      <span className="uppercase tracking-[0.15em] text-xs font-extrabold">{activeSlide.ctaText}</span>
                      <WrenchScrewdriverIcon className="w-4 h-4 flex-shrink-0" />
                    </motion.span>
                  </Link>
                  
                  <button className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold uppercase tracking-widest text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all">
                    <CpuChipIcon className="w-4 h-4 flex-shrink-0 text-zinc-400" />
                    Manuals
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* PROGRESS & NAVIGATION HUD */}
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 lg:left-16 xl:left-20 flex items-center gap-8 sm:gap-12 z-30">
            <div className="flex gap-2.5 sm:gap-3">
              <NavBtn icon={<ChevronLeftIcon className="w-5 h-5 sm:w-6 h-5 sm:h-6" />} onClick={() => paginate(-1)} ariaLabel="Previous slider entry" />
              <NavBtn icon={<ChevronRightIcon className="w-5 h-5 sm:w-6 h-5 sm:h-6" />} onClick={() => paginate(1)} ariaLabel="Next slider entry" />
            </div>
            <div className="hidden sm:flex items-center gap-2.5">
              {slides.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > current ? 1 : -1);
                    setCurrent(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-500 focus:outline-none ${
                    current === i ? 'w-12 sm:w-16' : 'w-3 hover:w-6 bg-zinc-300 dark:bg-zinc-700'
                  }`}
                  style={{ backgroundColor: current === i ? (activeSlide.color || primary) : undefined }}
                  aria-label={`Jump to dashboard slide element ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* --- SIDEBAR CARDS --- */}
        <div className="lg:col-span-3 flex lg:flex-col gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-none custom-scrollbar">
          <div className="flex-shrink-0 w-[85vw] sm:w-[48%] lg:w-full snap-start">
            <SidebarCard title="Machinery" subtitle="HEAVY DUTY" img="https://images.unsplash.com/photo-1504148455328-c376907d081c" color="#18181b" isDark />
          </div>
          <div className="flex-shrink-0 w-[85vw] sm:w-[48%] lg:w-full snap-start">
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
      className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg text-zinc-800 dark:text-zinc-200 hover:bg-zinc-900 dark:hover:bg-zinc-100 hover:text-white dark:hover:text-zinc-900 transition-all active:scale-95 focus:outline-none"
    >
      {icon}
    </button>
  );
}