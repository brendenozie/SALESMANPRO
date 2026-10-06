'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';
import { 
  SparklesIcon, 
  ShoppingBagIcon, 
  ArrowRightIcon,
  CakeIcon
} from '@heroicons/react/24/outline';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 8000;

export default function HeroSlider({ heroSlides, themeSettings }: { heroSlides: HeroSlide[] | null; themeSettings: any }) {
  const primary = themeSettings?.primaryColor || '#D97706';
  const [current, setCurrent] = useState(0);
  
  // Parallax Mouse Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const heroSlidesToShow = (heroSlides?.length ? heroSlides : [{
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    headline: 'Experience Sweet Perfection',
    badgeText: 'Artisan Breads & Daily Delights',
    ctaText: 'Shop All Bakes',
    ctaLink: '/ecommerce/products',
  }]).map(slide => ({
    ...slide,
    headline: slide.headline || 'Experience Sweet Perfection',
    badgeText: slide.badgeText || 'Artisan Breads & Daily Delights',
  }));

  const handleMouseMove = (e: React.MouseEvent) => {
    // Disable parallax calculations on mobile touch devices to save performance
    if (window.innerWidth < 768) return;
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 40;
    const moveY = (clientY - window.innerHeight / 2) / 40;
    mouseX.set(moveX);
    mouseY.set(moveY);
  };

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroSlidesToShow.length);
  }, [heroSlidesToShow.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section 
      onMouseMove={handleMouseMove}
      // Using svh (Small Viewport Height) to respect mobile browser address bars perfectly
      className="relative w-full h-[100svh] md:h-[95vh] min-h-[620px] md:min-h-[750px] overflow-hidden bg-slate-950"
    >
      <AnimatePresence mode="wait">
        {heroSlidesToShow.map((slide, idx) => (
          idx === current && (
            <motion.div key={idx} className="absolute inset-0 w-full h-full">
              
              {/* Cinematic Background with Responsive Scale */}
              <motion.div 
                style={{ x: springX, y: springY, scale: 1.08 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image decoding="async"
                  src={slide.imageUrl || ''}
                  alt="Bakery Hero"
                  fill
                  priority
                  className="object-cover brightness-[0.45] md:brightness-[0.6] transition-opacity duration-1000"
                />
              </motion.div>

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent md:to-black/10" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-15 pointer-events-none" />

              {/* Main Content Layout - Added pt-28 to push elements safely down away from fixed navbars */}
              <div className="relative h-full container mx-auto px-6 md:px-16 flex items-center pt-24 pb-20 md:py-0">
                <div className="max-w-5xl w-full">
                  
                  {/* Floating Badge Header */}
                  <motion.div 
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-5 md:mb-8"
                  >
                    <SparklesIcon className="w-4 h-4 md:w-5 h-5" style={{ color: primary }} />
                    <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.25em] text-white/90">
                      {slide.badgeText}
                    </span>
                  </motion.div>

                  {/* Editorial Fluid Typography */}
                  <div className="space-y-4 mb-8 md:mb-10">
                    <motion.h1 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      // clamp sizing guarantees it never drops below 2.25rem on tiny phones, or grows past 8.5rem on ultra-wide screens
                      className="text-[clamp(2.25rem,7.5vw,6.5rem)] xl:text-[8.5rem] font-black text-white leading-[1.05] md:leading-[0.85] tracking-tighter"
                    >
                      {slide.headline.split(' ').slice(0, -1).join(' ')} <br className="hidden sm:inline" />
                      <span className="italic font-serif font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 ml-0 sm:ml-2">
                        {slide.headline.split(' ').pop()}
                      </span>
                    </motion.h1>
                  </div>

                  {/* Primary & Secondary Actions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center"
                  >
                    <Link href={slide.ctaLink || '/cakeecommerce/products'} className="w-full sm:w-auto">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group flex items-center justify-center gap-3 px-8 md:px-10 py-4 md:py-5 rounded-full text-white font-bold uppercase tracking-widest text-[11px] md:text-xs shadow-2xl transition-all w-full sm:w-auto"
                        style={{ backgroundColor: primary }}
                      >
                        <ShoppingBagIcon className="w-4 h-4 md:w-5 h-5" />
                        <span>{slide.ctaText}</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1.5" />
                      </motion.button>
                    </Link>

                    <Link href="/cakeecommerce/categories" className="group flex items-center gap-3 text-white/80 hover:text-white transition-colors py-2 pl-2 sm:pl-0">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors">
                        <CakeIcon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-[11px] md:text-xs uppercase tracking-widest">See our menu</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Responsive Slide Progress Indicators */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 md:left-auto md:translate-x-0 md:right-16 md:bottom-16 flex flex-row md:flex-col items-center gap-4 md:gap-8 z-30">
        {heroSlidesToShow.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative h-2 w-8 md:h-12 md:w-1 flex items-center justify-center"
            aria-label={`Go to slide ${i + 1}`}
          >
             <motion.div 
              className={`absolute rounded-full transition-all duration-500 ${
                current === i 
                  ? 'h-full w-full bg-amber-500' 
                  : 'h-1.5 w-full bg-white/20 md:h-2 md:w-1'
              }`}
              style={{ backgroundColor: current === i ? primary : undefined }}
             />
             <span className={`absolute -top-6 md:top-0 md:-left-12 text-[10px] font-black transition-opacity ${current === i ? 'opacity-100' : 'opacity-0'} text-white/60 hidden md:inline`}>
              0{i + 1}
             </span>
          </button>
        ))}
      </div>

      {/* Bottom Vignette */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
    </section>
  );
}