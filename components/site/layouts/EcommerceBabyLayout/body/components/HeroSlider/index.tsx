'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon, 
  ShoppingBagIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline'; // Switched to outline for a cleaner 'Atelier' look
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HeroSlider({ heroSlides, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#FF8FA3';
  const secondary = themeSettings?.secondaryColor || '#70D6FF';

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = heroSlides?.length > 0 ? heroSlides : [{
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
    productImgUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
    headline: 'Small Steps,\nBig Wonders',
    badgeText: 'Curated Organic Essentials',
    subline: 'NEW ARRIVALS 2026',
    ctaText: 'Explore Collection',
    ctaLink: '/products',
  }];

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrent((prev) => (prev + newDirection + slides.length) % slides.length);
  }, [slides.length]);

  return (
    <section className="max-w-[1800px] mx-auto px-4 md:px-8 py-4 lg:py-10 bg-white dark:bg-zinc-950">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        
        {/* --- CINEMATIC MAIN STAGE --- */}
        <div className="lg:col-span-9 relative rounded-[4rem] overflow-hidden bg-[#F8F8F8] dark:bg-zinc-900 shadow-2xl">
          
          {/* Animated Background Text (Parallax) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
             <motion.span 
               key={`bg-text-${current}`}
               initial={{ opacity: 0, scale: 1.2 }}
               animate={{ opacity: 0.05, scale: 1 }}
               className="text-[25vw] font-black text-zinc-900 dark:text-white whitespace-nowrap"
             >
               {slides[current].subline.split(' ')[0]}
             </motion.span>
          </div>

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -100 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 items-center p-8 md:p-20"
            >
              {/* Left Side: Content */}
              <div className="relative z-20 space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700"
                >
                  <SparklesIcon className="w-4 h-4" style={{ color: primary }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                    {slides[current].subline}
                  </span>
                </motion.div>

                <h2 className="text-6xl md:text-[7rem] font-black text-zinc-900 dark:text-white leading-[0.85] tracking-tighter">
                  {slides[current].headline.split('\n').map((t: string, i: number) => (
                    <span key={i} className="block">{t}</span>
                  ))}
                </h2>

                <p className="text-lg text-zinc-500 max-w-sm font-medium">
                  {slides[current].badgeText}
                </p>

                <Link href={slides[current].ctaLink}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center gap-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-5 rounded-3xl font-bold transition-all"
                  >
                    <span className="uppercase tracking-widest text-xs">{slides[current].ctaText}</span>
                    <div className="bg-white/20 dark:bg-zinc-900/10 p-2 rounded-full group-hover:rotate-45 transition-transform">
                      <ArrowUpRightIcon className="w-5 h-5" />
                    </div>
                  </motion.button>
                </Link>
              </div>

              {/* Right Side: Visual Centerpiece */}
              <div className="relative h-full flex items-center justify-center mt-12 lg:mt-0">
                <motion.div
                   animate={{ y: [0, -20, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   className="relative w-full aspect-square max-w-md"
                >
                   {/* Glow Aura */}
                   <div 
                    className="absolute inset-0 rounded-full blur-[120px] opacity-40 animate-pulse"
                    style={{ backgroundColor: slides[current].color || (current % 2 === 0 ? primary : secondary) }}
                   />
                   <Image 
                    src={slides[current].imageUrl || slides[current].productImgUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'} 
                    alt="Hero" 
                    fill 
                    className="object-contain z-10 drop-shadow-[0_50px_50px_rgba(0,0,0,0.2)]"
                    loader={loader}
                  />
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Minimalist Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {slides.map((_: any, i: number) => (
              <button 
                key={i} 
                onClick={() => setCurrent(i)}
                className={`h-1 transition-all duration-500 rounded-full ${current === i ? 'w-12 bg-zinc-900 dark:bg-white' : 'w-4 bg-zinc-300 dark:bg-zinc-700'}`}
              />
            ))}
          </div>

          {/* Glass Navigation */}
          <div className="absolute right-12 bottom-12 flex gap-2 z-30">
            <NavBtn icon={<ChevronLeftIcon className="w-6 h-6" />} onClick={() => paginate(-1)} />
            <NavBtn icon={<ChevronRightIcon className="w-6 h-6" />} onClick={() => paginate(1)} />
          </div>
        </div>

        {/* --- SIDEBAR DISCOVERIES --- */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <SidebarCard 
             title="The Nursery" 
             subtitle="Organic Textures" 
             img="https://images.unsplash.com/photo-1544122159-39c212109245"
             color="#FDF2F8" 
           />
           <SidebarCard 
             title="Playtime" 
             subtitle="Sustainable Oak" 
             img="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1"
             color="#F0F9FF" 
           />
        </div>
      </div>
    </section>
  );
}

function NavBtn({ icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="p-5 rounded-3xl bg-white/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/20 hover:bg-white dark:hover:bg-white transition-all text-zinc-900 dark:text-white hover:text-zinc-900 dark:hover:text-zinc-900 shadow-xl"
    >
      {icon}
    </button>
  );
}

function SidebarCard({ title, subtitle, img, color }: any) {
  return (
    <motion.div 
      whileHover="hover"
      className="flex-1 relative rounded-[3.5rem] p-10 overflow-hidden group transition-all"
      style={{ backgroundColor: color }}
    >
      <div className="relative z-10 space-y-2">
        <h3 className="text-2xl font-black text-zinc-900 tracking-tighter">{title}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{subtitle}</p>
      </div>
      
      <motion.div 
        variants={{ hover: { scale: 1.1, rotate: -5, y: -10 } }}
        className="absolute -right-8 -bottom-8 w-48 h-48"
      >
        <Image src={img} alt={title} fill className="object-contain drop-shadow-2xl" loader={loader} />
      </motion.div>
      
      <div className="absolute bottom-10 left-10 opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white">
            <ArrowUpRightIcon className="w-5 h-5" />
         </div>
      </div>
    </motion.div>
  );
}