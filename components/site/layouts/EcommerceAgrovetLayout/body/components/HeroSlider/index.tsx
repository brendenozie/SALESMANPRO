'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, BeakerIcon, BugAntIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 6000;

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
    subline: 'Planting Season 2026',
    headline: 'PREMIUM HYBRID\nCERTIFIED SEEDS',
    badgeText: 'Boost your yield with our drought-resistant corn and high-yield vegetable varieties.',
    ctaText: 'Shop Seeds',
    ctaLink: '/category/seeds',
    id: '1', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: 'seed', backgroundColor: null, textColor: null, videoLink: null, type: null,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80',
    subline: 'Livestock Care',
    headline: 'VETERINARY\nSOLUTIONS',
    badgeText: 'Expert-grade vaccines and nutrition supplements to keep your herd healthy and productive.',
    ctaText: 'View Pharma',
    ctaLink: '/category/animal-health',
    id: '2', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: 'med', backgroundColor: null, textColor: null, videoLink: null, type: null,
  },
];

export default function AgrovetHeroSlider({ heroSlides, themeSettings }: { heroSlides: HeroSlide[] | null; themeSettings: any }) {
  const primary = themeSettings?.primaryColor || '#15803d'; // Forest Green
  const secondary = themeSettings?.secondaryColor || '#eab308'; // Amber

  const slides = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoAdvanceDelay);
  }, [slides.length]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const goTo = (idx: number, dir = 0) => {
    setDirection(dir);
    setCurrent(idx);
  };

  return (
    <section className="relative w-full bg-slate-50 pt-24 pb-12 overflow-hidden min-h-[600px] lg:min-h-[750px]">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 opacity-[0.05]" 
           style={{ backgroundImage: `radial-gradient(${primary} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
          
          {/* LEFT: CONTENT PANEL (40%) */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center space-y-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-2">
                  <span className="h-[2px] w-12 rounded-full" style={{ background: secondary }} />
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    {slides[current].subline}
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[0.95] tracking-tight whitespace-pre-line">
                  {slides[current].headline}
                </h1>

                <p className="text-slate-600 text-lg md:text-xl max-w-md leading-relaxed">
                  {slides[current].badgeText}
                </p>

                <div className="flex items-center space-x-4 pt-4">
                  <Link
                    href={slides[current].ctaLink || '#'}
                    className="flex items-center justify-center space-x-2 px-10 py-5 rounded-full text-white font-bold text-lg shadow-xl transition-all hover:scale-105 active:scale-95"
                    style={{ background: primary }}
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    <span>{slides[current].ctaText}</span>
                  </Link>
                  
                  {/* NAV CONTROLS */}
                  <div className="flex space-x-2 pl-4">
                    <button onClick={() => goTo((current - 1 + slides.length) % slides.length, -1)} 
                            className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                      <ChevronLeftIcon className="h-6 w-6 text-slate-600" />
                    </button>
                    <button onClick={() => goTo((current + 1) % slides.length, 1)}
                            className="p-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                      <ChevronRightIcon className="h-6 w-6 text-slate-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* QUICK CATEGORY ACCESS */}
            <div className="grid grid-cols-3 gap-4 pt-10">
              {[
                { label: 'Crop Care', icon: <BugAntIcon className="w-5 h-5" />, link: '/crop-care' },
                { label: 'Animal Health', icon: <BeakerIcon className="w-5 h-5" />, link: '/livestock' },
                { label: 'Tools', icon: <ShoppingBagIcon className="w-5 h-5" />, link: '/equipment' }
              ].map((cat, i) => (
                <Link key={i} href={cat.link} className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="p-2 rounded-full mb-2" style={{ backgroundColor: `${primary}15`, color: primary }}>{cat.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-tighter text-slate-700">{cat.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT: IMAGE PANEL (60%) */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative h-[400px] lg:h-[650px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.95, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 1.05, x: -50 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-full w-full"
              >
                {/* DECORATIVE "SOIL" FRAME */}
                <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[40px] opacity-10" style={{ backgroundColor: primary }} />
                
                <div className="relative h-full w-full rounded-[40px] overflow-hidden border-[12px] border-white shadow-2xl">
                  <Image
                    src={slides[current].imageUrl || ''}
                    alt="Agrovet Hero"
                    fill
                    className="object-cover transition-transform duration-[8000ms] ease-linear scale-110 group-hover:scale-100"
                    loader={loader}
                    priority
                  />
                  {/* SOFT OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                </div>

                {/* FLOATING STAT BADGE */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 z-20 hidden md:block"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl" style={{ background: secondary }}>
                      <BeakerIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Quality Tested</p>
                      <p className="text-xl font-black text-slate-800 tracking-tight">100% Certified</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* PROGRESS BAR */}
            <div className="absolute bottom-10 right-10 flex space-x-3 z-30">
              {slides.map((_, idx) => (
                <div key={idx} className="h-1.5 rounded-full bg-white/30 overflow-hidden w-12">
                  {idx === current && (
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: '100%' }} 
                      transition={{ duration: autoAdvanceDelay / 1000, ease: 'linear' }}
                      className="h-full bg-white" 
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}