'use client';

import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon, 
  ShoppingBagIcon,
  ArrowUpRightIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

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
      ctaLink: '/products',
      color: primary,
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1',
      headline: 'Pure Play,\nPure Joy',
      badgeText: 'Sustainable Wooden Wonders',
      subline: 'MONTESSORI SERIES',
      ctaText: 'Shop Toys',
      ctaLink: '/toys',
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
        <div className="lg:col-span-9 relative rounded-[2.5rem] md:rounded-[4rem] overflow-hidden bg-[#F8F8F8] dark:bg-zinc-900 shadow-2xl min-h-[750px] md:min-h-[800px]">
          
          <motion.div 
            animate={{ backgroundColor: slides[current].color, scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-20 -right-20 w-[70%] h-[70%] rounded-full opacity-10 blur-[100px] pointer-events-none"
          />

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.5 }}
              className="relative h-full flex flex-col lg:grid lg:grid-cols-2 p-6 md:p-16 lg:p-20"
            >
              {/* IMAGE: Now forced to a larger height on mobile */}
              <div className="relative w-full h-[350px] md:h-full flex items-center justify-center order-1 lg:order-2">
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full h-full max-w-[280px] md:max-w-md"
                >
                  <Image 
                    src={slides[current].imageUrl} 
                    alt="Hero" 
                    fill 
                    className="object-contain z-10 drop-shadow-2xl"
                    loader={loader}
                    priority
                  />
                </motion.div>
              </div>

              {/* TEXT CONTENT: Spacing optimized to prevent button overlap */}
              <div className="relative z-20 flex flex-col justify-center space-y-6 md:space-y-8 order-2 lg:order-1 mt-4 lg:mt-0">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 w-fit shadow-sm border border-zinc-100 dark:border-zinc-700">
                  <SparklesIcon className="w-4 h-4" style={{ color: slides[current].color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {slides[current].subline}
                  </span>
                </div>

                <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-zinc-900 dark:text-white leading-[0.95] tracking-tighter">
                  {slides[current].headline.split('\n').map((t: string, i: number) => (
                    <span key={i} className="block">{t}</span>
                  ))}
                </h2>

                <p className="text-base md:text-lg text-zinc-500 max-w-sm font-medium leading-relaxed">
                  {slides[current].badgeText}
                </p>

                {/* BUTTONS: Responsive grid prevents overlapping */}
                <div className="grid grid-cols-[1fr_auto] sm:flex sm:items-center gap-3 w-full max-w-md">
                  <Link href={slides[current].ctaLink} className="w-full sm:w-auto">
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-4 md:py-5 rounded-2xl font-bold"
                    >
                      <span className="uppercase tracking-widest text-[10px] md:text-xs">{slides[current].ctaText}</span>
                      <ShoppingBagIcon className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  <button className="p-4 md:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-900 bg-white dark:bg-zinc-800 shadow-sm">
                    <HeartIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* NAV CONTROLS: Shifted up slightly for mobile bottom-thumb safety */}
          <div className="absolute bottom-6 left-6 right-6 md:bottom-12 md:left-12 flex items-center justify-between md:justify-start gap-6 z-30">
             <div className="flex gap-2">
                <NavBtn icon={<ChevronLeftIcon className="w-5 h-5" />} onClick={() => paginate(-1)} />
                <NavBtn icon={<ChevronRightIcon className="w-5 h-5" />} onClick={() => paginate(1)} />
             </div>
             <div className="flex gap-1.5">
                {slides.map((_: any, i: number) => (
                  <div key={i} className={`h-1 rounded-full transition-all duration-500 ${current === i ? 'w-8 bg-zinc-900 dark:bg-white' : 'w-2 bg-zinc-300 dark:bg-zinc-700'}`} />
                ))}
             </div>
          </div>
        </div>

        {/* --- SIDEBAR CARDS --- */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-6 lg:pb-0 snap-x scrollbar-hide">
           <SidebarCard title="The Nursery" subtitle="Organic Textures" img="https://images.unsplash.com/photo-1544122159-39c212109245" color="#FDF2F8" />
           <SidebarCard title="Playtime" subtitle="Sustainable Oak" img="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1" color="#F0F9FF" />
        </div>
      </div>
    </section>
  );
}

function NavBtn({ icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="p-4 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-700 shadow-md text-zinc-900 dark:text-white active:scale-95 transition-all"
    >
      {icon}
    </button>
  );
}

function SidebarCard({ title, subtitle, img, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="min-w-[280px] lg:min-w-full flex-1 relative rounded-[2.5rem] p-8 overflow-hidden snap-center cursor-pointer shadow-sm"
      style={{ backgroundColor: color }}
    >
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-zinc-900 tracking-tight">{title}</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{subtitle}</p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-36 h-36">
        <Image src={img} alt={title} fill className="object-contain" loader={loader} />
      </div>
    </motion.div>
  );
}