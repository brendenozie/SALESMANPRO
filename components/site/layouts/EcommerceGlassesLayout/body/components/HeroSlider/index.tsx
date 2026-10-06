'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EyeIcon, SunIcon, SparklesIcon, ShoppingBagIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; 
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings?: any;
}

const imageLoader = ({ src }: { src: string }) => src;
const autoAdvanceDelay = 7500;

// Directional slide animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '15%' : '-15%',
    opacity: 0,
    filter: 'blur(6px)'
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      x: { type: 'spring', stiffness: 120, damping: 22 },
      opacity: { duration: 0.4 },
      filter: { duration: 0.4 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '15%' : '-15%',
    opacity: 0,
    filter: 'blur(6px)',
    transition: { duration: 0.35 }
  })
};

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function HeroSlider({ heroSlides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Consolidated premium local default data fallbacks
  const slides = useMemo(() => {
    if (heroSlides && heroSlides.length > 0) return heroSlides;
    return [
      {
        id: '1',
        headline: 'CLARITY & STYLE',
        highlight: 'ALL IN ONE',
        badgeText: '2026 LUXE COLLECTION',
        subline: 'Bespoke eyewear crafted for those who see the world differently. Merging clinical precision with runway aesthetics.',
        ctaText: 'Explore Collection',
        imageUrl: 'https://dozi4r4ug9739.cloudfront.net/images/1772312106481-zeelool-glasses-aShmUdodJ3w-unsplash.jpg',
        productImageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=500&auto=format&fit=crop',
        productName: 'Metal Lennons',
        price: '$175.00',
        oldPrice: '$199.00',
        accentColor: '#0D4C4F'
      },
      {
        id: '2',
        headline: 'MINIMAL DESIGN',
        highlight: 'PURE VISION',
        badgeText: 'TITANIUM SERIE',
        subline: 'Ultralight silhouettes designed for continuous comfort. Engineered with featherweight Japanese titanium alloys.',
        ctaText: 'Shop Titanium',
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
        productImageUrl: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=500&auto=format&fit=crop',
        productName: 'Classic Aviators',
        price: '$210.00',
        oldPrice: '$245.00',
        accentColor: '#1A1A1A'
      }
    ];
  }, [heroSlides]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered, slides.length]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 45;
    const moveY = (clientY - window.innerHeight / 2) / 45;
    setMousePos({ x: moveX, y: moveY });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-[100svh] lg:h-screen flex items-center overflow-hidden bg-[#F9F6F2] pt-28 pb-20 lg:py-0 select-none"
    >
      {/* BACKGROUND TYPOGRAPHY ENGINE */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-0">
        <motion.h2 
          style={{ x: mousePos.x * -0.8, y: mousePos.y * -0.8 }}
          className="text-[24vw] font-black text-black/[0.025] leading-none whitespace-nowrap tracking-tighter"
        >
          VISIONARY
        </motion.h2>
      </div>

      {/* AMBIENT ACCENT BLUR */}
      <motion.div 
        animate={{ 
          x: mousePos.x * 1.5, 
          y: mousePos.y * 1.5,
          rotate: mousePos.x * 0.5
        }}
        className="absolute top-[-10%] right-[-5%] w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] bg-[#F3A852] opacity-[0.08] rounded-full blur-[80px] sm:blur-[120px] pointer-events-none z-0"
      />

      <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 xl:gap-16 items-center">
          
          {/* LEFT COLUMN: EDITORIAL CONTENT CARD */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6 md:space-y-8 text-center lg:text-left"
              >
                <motion.div variants={textItemVariants} className="inline-flex items-center gap-3 justify-center lg:justify-start">
                  <span className="h-[1px] w-8 bg-[#F3A852]" />
                  <span className="text-[11px] font-bold tracking-[0.3em] text-[#F3A852] uppercase">
                    {slides[current].badgeText}
                  </span>
                </motion.div>
                
                <motion.h1 
                  variants={textItemVariants}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl font-serif text-gray-900 leading-[1.05] tracking-tight"
                >
                  {slides[current].headline} <br />
                  <span 
                    className="italic font-normal"
                    style={{ 
                      WebkitTextStroke: `1.2px ${slides[current].accentColor || '#0D4C4F'}`,
                      color: 'transparent'
                    }}
                  >
                    {slides[current].highlight || ''}
                  </span>
                </motion.h1>
                
                <motion.p 
                  variants={textItemVariants}
                  className="text-base sm:text-lg text-gray-600 max-w-md mx-auto lg:ml-0 leading-relaxed font-light"
                >
                  {slides[current].subline}
                </motion.p>

                {/* CALL TO ACTION ROW */}
                <motion.div 
                  variants={textItemVariants}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-2"
                >
                  <Link
                    href="/shop"
                    className="w-full sm:w-auto group relative px-8 py-4 bg-[#0D4C4F] text-white overflow-hidden rounded-xl text-center shadow-lg shadow-emerald-950/10 transition-transform active:scale-[0.98]"
                    style={{ backgroundColor: slides[current].accentColor }}
                  >
                    <div className="absolute inset-0 bg-black/20 translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative z-10 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2.5">
                      {slides[current].ctaText}
                      <ShoppingBagIcon className="w-4 h-4" />
                    </span>
                  </Link>
                  
                  {/* USER PROOF MATRIX */}
                  <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-5 w-full sm:w-auto justify-center">
                    <div className="flex -space-x-2.5">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#F9F6F2] bg-gray-200 overflow-hidden shrink-0 relative">
                          <Image decoding="async" src={`https://i.pravatar.cc/100?img=${i + 12}`} alt="User profile illustration" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-xs font-bold text-gray-900 leading-none">46K+ Styled</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Glasses Duka Community</p>
                    </div>
                  </div>
                </motion.div>

                {/* FEATURES USP ROW */}
                <motion.div 
                  variants={textItemVariants}
                  className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-gray-200/60 max-w-sm mx-auto lg:ml-0"
                >
                  <USPItem icon={<SunIcon className="w-4 h-4" />} label="UV400 Safe" />
                  <USPItem icon={<EyeIcon className="w-4 h-4" />} label="Anti-Blue" />
                  <USPItem icon={<SparklesIcon className="w-4 h-4" />} label="No-Glare" />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE VISUAL CANVAS */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative flex items-center justify-center w-full">
            <div className="relative w-full aspect-[4/5] sm:aspect-square max-w-[340px] sm:max-w-[440px] lg:max-w-[460px] xl:max-w-[500px]">
              
              {/* MAIN MODEL COMPOSITION PANEL */}
              <AnimatePresence mode="popLayout" custom={direction}>
                <motion.div 
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ x: mousePos.x * 0.4, y: mousePos.y * 0.4 }}
                  className="relative w-full h-full rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl z-10 bg-stone-100"
                >
                  <Image decoding="async" 
                    src={slides[current].imageUrl || ''}
                    alt="Premium Editorial Eyewear" 
                    fill
                    priority
                    className="object-cover transition-transform duration-[5s] ease-out hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* FLOATING PRODUCT DETAIL CARD */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={current}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ duration: 0.45 }}
                  style={{ x: mousePos.x * -0.6 }}
                  className="absolute -bottom-6 -left-4 sm:left-[-10%] lg:left-[-6%] z-20 bg-white p-4 sm:p-5 rounded-2xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] border border-stone-100 w-[210px] sm:w-[240px]"
                >
                  <div className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider">SALE</div>
                  <div className="h-20 sm:h-24 w-full relative mb-3 bg-stone-50 rounded-xl p-1">
                    <Image decoding="async" src={slides[current].productImageUrl || ''} alt="Product frame item illustration" fill className="object-contain" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <p className="text-[9px] text-[#F3A852] font-bold tracking-widest uppercase">New Arrival</p>
                    <h3 className="text-base font-serif text-gray-900 truncate">{slides[current].productName}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-gray-900">{slides[current].price}</span>
                      {slides[current].oldPrice && (
                        <span className="text-xs text-gray-400 line-through font-light">{slides[current].oldPrice}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* FLOATING HIGH-DEFINITION SPECIFICATION BADGE */}
              <motion.div 
                animate={{ y: mousePos.y * -1.2, x: mousePos.x * 0.6 }}
                className="absolute top-8 -right-4 sm:right-[-6%] z-20 bg-gray-900/95 backdrop-blur-md text-white py-3 px-4 rounded-xl shadow-xl border border-white/10 hidden sm:block"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400">
                    <SparklesIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-gray-400 leading-none">Lens Quality</p>
                    <p className="text-xs font-bold mt-1">HD Polished Glass</p>
                  </div>
                </div>
              </motion.div>

              {/* COMPOSITION BOTTOM BACKGROUND GLOW DEPTH CUSHION */}
              <div className="absolute -z-10 -bottom-4 -right-4 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl opacity-60" />
            </div>
          </div>

        </div>

        {/* INTERACTIVE CONTROLS HUD INTERFACE */}
        {slides.length > 1 && (
          <div className="mt-12 lg:mt-0 lg:absolute lg:bottom-10 lg:right-16 xl:right-20 flex items-center justify-center lg:justify-end gap-6 z-20">
            <div className="text-[11px] font-mono font-bold text-gray-900 tracking-[0.2em]">
              0{current + 1} <span className="text-gray-300 mx-1.5">/</span> 0{slides.length}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-900 hover:text-white transition-all active:scale-95 shadow-sm focus:outline-none"
                aria-label="Previous Frame"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button 
                onClick={nextSlide}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-900 hover:text-white transition-all active:scale-95 shadow-sm focus:outline-none"
                aria-label="Next Frame"
              >
                <ChevronRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

function USPItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 justify-center lg:justify-start">
      <div className="w-7 h-7 rounded-lg bg-white shadow-sm border border-stone-200/40 flex items-center justify-center text-gray-800 shrink-0">
        {icon}
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 shrink-0">{label}</span>
    </div>
  );
}