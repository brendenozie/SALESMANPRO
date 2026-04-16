'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  PlusIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function BookDukaResponsiveHero({ heroSlides }: any) {
  const [current, setCurrent] = useState(0);

  const slides = heroSlides?.length > 0 ? heroSlides : [
    {
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f', // Direct product focus
      productImgUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f',
      headline: 'The Silence of Modern Ink',
      subline: 'COLLECTION 001',
      description: 'A deep dive into contemporary African literature and the power of silent narratives.',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      price: 'KES 2,450',
    },
    {
      imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
      productImgUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794',
      headline: 'Heritage in Hardback',
      subline: 'LIMITED EDITION',
      description: 'Collector’s editions featuring hand-pressed covers and archival-quality paper.',
      ctaText: 'Explore',
      ctaLink: '/products',
      price: 'KES 4,200',
    }
  ];

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.x > 100) setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    else if (info.offset.x < -100) setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full h-[95vh] lg:h-[90vh] bg-white dark:bg-zinc-950 flex flex-col lg:flex-row overflow-hidden">
      
      {/* BACKGROUND DECOR (Desktop Only) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.04] pointer-events-none hidden lg:flex">
        <span className="text-[45rem] font-black italic select-none">0{current + 1}</span>
      </div>

      {/* TOP/RIGHT: VISUAL AREA (Book Focus) */}
      <div className="relative w-full lg:w-1/2 h-1/2 lg:h-full bg-zinc-100 dark:bg-zinc-900/40 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            // initial={{ opacity: 0, y: 40, rotate: 10, scale: 0.8 }}
            // animate={{ opacity: 1, y: 0, rotate: -5, scale: 1 }}
            // exit={{ opacity: 0, y: -40, rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative w-[60%] lg:w-[70%] aspect-[3/4] z-10 cursor-grab active:cursor-grabbing"
          >
            <Image
              src={slides[current].productImgUrl || slides[current].imageUrl || slides[current].imageUrl}
              alt={slides[current].headline || 'Hero Image'}
              fill
              className="object-contain drop-shadow-[20px_30px_50px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_0_60px_rgba(20,184,166,0.15)]"
              loader={loader}
              priority
            />
            
            {/* Mobile Swipe Indicator Overlay */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 lg:hidden opacity-40">
                <ChevronLeftIcon className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Swipe</span>
                <ChevronRightIcon className="w-4 h-4 animate-pulse" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* BOTTOM/LEFT: CONTENT AREA */}
      <div className="w-full lg:w-1/2 h-1/2 lg:h-full flex flex-col justify-center px-6 md:px-20 relative z-20 -mt-10 lg:mt-0">
        {/* Glassmorphism card for mobile visibility */}
        <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl lg:backdrop-blur-none lg:bg-transparent p-6 lg:p-0 rounded-3xl lg:rounded-none border border-zinc-200/50 dark:border-white/5 lg:border-none shadow-2xl lg:shadow-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 lg:space-y-8"
            >
              <div className="space-y-2">
                <p className="text-teal-600 dark:text-teal-400 font-black text-[10px] lg:text-xs tracking-[0.4em] uppercase">
                  {slides[current].subline}
                </p>
                <h1 className="text-4xl md:text-7xl font-bold text-zinc-900 dark:text-white leading-tight lg:leading-[1.05]">
                  {slides[current].headline}
                </h1>
              </div>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm lg:text-lg max-w-md leading-relaxed">
                {slides[current].description}
              </p>

              <div className="flex flex-wrap items-center gap-4 lg:gap-8 pt-2 ">
                <Link href={slides[current].ctaLink || '/bookecommerce/products'} className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-teal-600 dark:bg-white text-white dark:text-black px-8 py-4 rounded-full font-bold shadow-lg transition-all hover:bg-zinc-900 active:scale-95">
                    {slides[current].ctaText}
                    <ShoppingBagIcon className="w-5 h-5" />
                  </button>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                  <div>
                    <span className="block text-[9px] text-zinc-400 uppercase font-black tracking-widest">Price</span>
                    <span className="text-xl lg:text-2xl font-black text-zinc-900 dark:text-white">{slides[current].price}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CONTROLS: Desktop Side / Mobile Bottom */}
        <div className="absolute bottom-6 lg:bottom-12 right-6 lg:left-auto lg:right-20 flex items-center gap-4">
          <div className="flex bg-zinc-900 dark:bg-white rounded-full p-1 shadow-xl">
            <button 
              onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-3 text-white dark:text-black hover:scale-110 transition-transform"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="w-[1px] bg-white/10 dark:bg-black/10 self-stretch my-2" />
            <button 
              onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
              className="p-3 text-white dark:text-black hover:scale-110 transition-transform"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden sm:block text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">
             0{current + 1} / 0{slides.length}
          </div>
        </div>
      </div>

      {/* Subtle Bottom Highlight (Visual Intuition) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500/50 to-transparent lg:hidden" />
    </section>
  );
}