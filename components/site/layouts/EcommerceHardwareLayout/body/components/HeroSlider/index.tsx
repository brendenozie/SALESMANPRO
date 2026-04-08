'use client';

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  WrenchScrewdriverIcon, 
  ShoppingCartIcon,
  CpuChipIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import SidebarCard from '../SidebarCard';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HardwareHeroSlider({ heroSlides, themeSettings }: any) {
  // Defaulting to Hardware-centric colors (Safety Orange/Amber and Industrial Slate)
  const primary = themeSettings?.primaryColor || '#F59E0B'; 
  const secondary = themeSettings?.secondaryColor || '#3F3F46';

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = heroSlides?.length > 0 ? heroSlides : [
    {
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c', // High-end Power Tool
      headline: 'Built For\nPrecision.',
      badgeText: 'Professional Grade Power Tools',
      subline: 'INDUSTRIAL SERIES 2026',
      ctaText: 'Shop Power Tools',
      ctaLink: '/hardwareecommerce/powertools',
      color: primary,
      specs: ['20V Max', 'Brushless Motor', '4.0Ah Battery']
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c', // Construction Gear
      headline: 'Reinforce\nYour Vision.',
      badgeText: 'Heavy Duty Structural Materials',
      subline: 'CONSTRUCTION READY',
      ctaText: 'View Materials',
      ctaLink: '/hardwareecommerce/construction',
      color: '#0EA5E9',
      specs: ['ASTM Certified', 'Corrosion Resistant', 'Bulk Available']
    }
  ];

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  }, [slides.length]);

  return (
    <section className="max-w-[1800px] mx-auto px-4 md:px-8 py-4 lg:py-10 bg-white dark:bg-[#0a0a0a]">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* --- MAIN STAGE --- */}
        <div className="lg:col-span-9 relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-zinc-50 dark:bg-zinc-900 shadow-2xl min-h-[850px] md:min-h-[800px] border border-zinc-200 dark:border-zinc-800">
          
          {/* Industrial Grid Overlay */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none" 
               style={{ backgroundImage: `radial-gradient(${slides[current].color} 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full flex flex-col lg:grid lg:grid-cols-2 p-8 md:p-16 lg:p-24"
            >
              {/* IMAGE SECTION */}
              <div className="relative w-full h-[40vh] lg:h-full flex items-center justify-center order-1 lg:order-2">
                <motion.div
                  initial={{ rotate: -5, y: 40 }}
                  animate={{ rotate: 0, y: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative w-full h-full"
                >
                  <Image 
                    src={slides[current].imageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c'} 
                    alt="Hardware Product" 
                    fill 
                    className="object-contain z-10 drop-shadow-[0_50px_50px_rgba(0,0,0,0.25)]"
                    loader={loader}
                    priority
                  />
                </motion.div>

                {/* Technical Specs Floating Badge (Stunning Detail) */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-0 top-1/4 z-20 hidden xl:block bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] shadow-2xl"
                >
                  <p className="text-[10px] font-black text-amber-500 uppercase mb-3 tracking-widest">Specifications</p>
                  <div className="space-y-3">
                    {slides[current].specs?.map((spec: string, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{spec}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* TEXT CONTENT */}
              <div className="relative z-20 flex flex-col justify-center space-y-8 order-2 lg:order-1">
                <div className="flex items-center gap-3">
                  <div className="h-[2px] w-12 bg-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 dark:text-amber-500">
                    {slides[current].subline}
                  </span>
                </div>

                <h2 className="text-6xl sm:text-7xl lg:text-[100px] font-black text-zinc-900 dark:text-white leading-[0.85] tracking-[ -0.04em] uppercase">
                  {slides[current].headline.split('\n').map((t: string, i: number) => (
                    <span key={i} className="block">{t}</span>
                  ))}
                </h2>

                <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-sm font-bold uppercase tracking-wide">
                  {slides[current].badgeText}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full pt-4">
                  <Link href={slides[current].ctaLink || "/hardwareecommerce/products"} className="w-full sm:w-auto">
                    <motion.button 
                      onClick={() => paginate(1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-4 bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-900 px-10 py-6 rounded-2xl font-black shadow-[0_20px_40px_-15px_rgba(245,158,11,0.3)] transition-all"
                    >
                      <span className="uppercase tracking-[0.2em] text-[11px]">{slides[current].ctaText}</span>
                      <WrenchScrewdriverIcon className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  
                  <button className="flex items-center justify-center gap-3 px-8 py-6 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-black uppercase tracking-widest text-[10px] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                    <CpuChipIcon className="w-5 h-5" />
                    Manuals
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* PROGRESS & NAV */}
          <div className="absolute bottom-12 left-8 md:left-16 flex items-center gap-12 z-30">
              <div className="flex gap-4">
                <NavBtn icon={<ChevronLeftIcon className="w-6 h-6" />} onClick={() => paginate(-1)} />
                <NavBtn icon={<ChevronRightIcon className="w-6 h-6" />} onClick={() => paginate(1)} />
              </div>
              <div className="hidden md:flex gap-3">
                {slides.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${current === i ? 'w-16 bg-amber-500' : 'w-4 bg-zinc-300 dark:bg-zinc-700'}`} />
                ))}
              </div>
          </div>
        </div>

        {/* --- SIDEBAR CARDS --- */}
        <div className="lg:col-span-3 flex lg:flex-col gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x">
            <SidebarCard title="Machinery" subtitle="HEAVY DUTY" img="https://images.unsplash.com/photo-1504148455328-c376907d081c" color="#18181b" isDark />
            <SidebarCard title="Plumbing" subtitle="ELITE TOOLS" img="https://images.unsplash.com/photo-1585713181935-d5f622cc2415" color="#f59e0b" />
        </div>
      </div>
    </section>
  );
}

function NavBtn({ icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="p-5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl text-zinc-900 dark:text-white hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-all active:scale-95"
    >
      {icon}
    </button>
  );
}