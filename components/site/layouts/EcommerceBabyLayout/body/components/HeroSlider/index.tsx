'use client';

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon, 
  ShoppingBagIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import SidebarCard from '../SidebarCard';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function IntegratedHeroSlider({ heroSlides, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#FF8FA3';
  const secondary = themeSettings?.secondaryColor || '#70D6FF';

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = heroSlides?.length > 0 ? heroSlides : [
    {
      imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
      headline: 'Small Steps,\nBig Wonders',
      badgeText: 'Curated Organic Essentials',
      subline: 'NEW ARRIVALS 2026',
      ctaText: 'Explore Collection',
      ctaLink: '/babyecommerce/products',
      color: primary,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
      headline: 'Pure Play,\nPure Joy',
      badgeText: 'Sustainable Wooden Wonders',
      subline: 'MONTESSORI SERIES',
      ctaText: 'Shop Toys',
      ctaLink: '/babyecommerce/toys',
      color: secondary,
    }
  ];

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  }, [slides.length]);

  return (
    <section className="max-w-[1800px] mx-auto px-4 md:px-8 py-4 lg:py-10 bg-white dark:bg-zinc-950">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
        
        {/* --- MAIN STAGE --- */}
        <div className="lg:col-span-9 relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-[#FDFDFD] dark:bg-zinc-900 shadow-2xl min-h-[850px] md:min-h-[800px]">
          
          {/* Dynamic Background Halo */}
          <motion.div 
            key={`halo-${current}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full blur-[120px] pointer-events-none"
            style={{ backgroundColor: slides[current].color }}
          />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full flex flex-col lg:grid lg:grid-cols-2 p-6 md:p-16 lg:p-20"
            >
              {/* IMAGE: Boosted mobile presence */}
              <div className="relative w-full h-[45vh] lg:h-full flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0">
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: [0, -20, 0] }}
                  transition={{ 
                    scale: { duration: 0.8 },
                    y: { duration: 5, repeat: Infinity, ease: "easeInOut" } 
                  }}
                  className="relative w-full h-full max-w-[320px] sm:max-w-md lg:max-w-full"
                >
                  <Image 
                    src={slides[current].imageUrl} 
                    alt="Hero Product" 
                    fill 
                    className="object-contain z-10 drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)]"
                    loader={loader}
                    priority
                  />
                </motion.div>
              </div>

              {/* TEXT CONTENT */}
              <div className="relative z-20 flex flex-col justify-center space-y-6 md:space-y-8 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-800 backdrop-blur-md w-fit shadow-sm border border-zinc-100 dark:border-zinc-700">
                  <SparklesIcon className="w-4 h-4" style={{ color: slides[current].color }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    {slides[current].subline}
                  </span>
                </div>

                <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif italic text-zinc-900 dark:text-white leading-[0.9] tracking-tighter">
                  {slides[current].headline.split('\n').map((t: string, i: number) => (
                    <span key={i} className="block">{t}</span>
                  ))}
                </h2>

                <p className="text-base md:text-lg text-zinc-500 max-w-xs font-medium leading-relaxed">
                  {slides[current].badgeText}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                  <Link href={slides[current].ctaLink || "/babyecommerce/products"} className="w-full sm:w-auto">
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="w-full flex items-center justify-center gap-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-5 rounded-[1.5rem] font-black shadow-xl"
                    >
                      <span className="uppercase tracking-[0.2em] text-[10px]">{slides[current].ctaText}</span>
                      <ShoppingBagIcon className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  <button className="hidden sm:flex p-5 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-900 bg-white dark:bg-zinc-800 shadow-sm transition-all">
                    <HeartIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* NAV CONTROLS */}
          <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-12 flex items-center justify-between md:justify-start gap-8 z-30">
              <div className="flex gap-3">
                <NavBtn icon={<ChevronLeftIcon className="w-5 h-5" />} onClick={() => paginate(-1)} />
                <NavBtn icon={<ChevronRightIcon className="w-5 h-5" />} onClick={() => paginate(1)} />
              </div>
              <div className="flex gap-2">
                {slides.map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${current === i ? 'w-10 bg-zinc-900 dark:bg-white' : 'w-2 bg-zinc-200 dark:bg-zinc-700'}`} />
                ))}
              </div>
          </div>
        </div>

        {/* --- SIDEBAR CARDS --- */}
        <div className="lg:col-span-3 flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 snap-x scrollbar-hide">
            <SidebarCard title="Sustainable" subtitle="Wooden" img="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1" color="#F0F9FF" />
            <SidebarCard title="Organic" subtitle="Essentials" img="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af" color="#FFF5F7" />
        </div>
      </div>
    </section>
  );
}

function NavBtn({ icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="p-4 rounded-2xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700 shadow-lg text-zinc-900 dark:text-white active:scale-90 transition-all hover:bg-zinc-900 hover:text-white"
    >
      {icon}
    </button>
  );
}
