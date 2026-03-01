'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';
// Using Hero Icons as per saved preference
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
      className="relative w-full h-[95vh] min-h-[750px] overflow-hidden bg-slate-950"
    >
      <AnimatePresence mode="wait">
        {heroSlidesToShow.map((slide, idx) => (
          idx === current && (
            <motion.div key={idx} className="absolute inset-0 w-full h-full">
              
              {/* Cinematic Background with Parallax */}
              <motion.div 
                style={{ x: springX, y: springY, scale: 1.1 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={slide.imageUrl || ''}
                  alt="Bakery Hero"
                  fill
                  priority
                  className="object-cover brightness-[0.5] md:brightness-[0.6] transition-opacity duration-1000"
                  loader={loader}
                />
              </motion.div>

              {/* Sophisticated Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20 pointer-events-none" />

              {/* Main Content Layout */}
              <div className="relative h-full container mx-auto px-6 md:px-16 flex items-center">
                <div className="max-w-4xl">
                  
                  {/* Floating Badge Header */}
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
                  >
                    <SparklesIcon className="w-5 h-5" style={{ color: primary }} />
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">
                      {slide.badgeText}
                    </span>
                  </motion.div>

                  {/* Editorial Typography */}
                  <div className="space-y-4 mb-10">
                    <motion.h1 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="text-6xl md:text-[10rem] font-black text-white leading-[0.85] tracking-tighter"
                    >
                      {slide.headline.split(' ').slice(0, -1).join(' ')} <br/>
                      <span className="italic font-serif font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                        {slide.headline.split(' ').pop()}
                      </span>
                    </motion.h1>
                  </div>

                  {/* Primary & Secondary Actions */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-6 items-center"
                  >
                    <Link href={slide.ctaLink || '/ecommerce/products'}>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center gap-3 px-10 py-5 rounded-full text-white font-black uppercase tracking-widest text-xs shadow-2xl transition-all"
                        style={{ backgroundColor: primary }}
                      >
                        <ShoppingBagIcon className="w-5 h-5" />
                        {slide.ctaText}
                        <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                      </motion.button>
                    </Link>

                    <Link href="/ecommerce/categories" className="group flex items-center gap-4 text-white/70 hover:text-white transition-colors">
                      <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
                        <CakeIcon className="w-6 h-6" />
                      </div>
                      <span className="font-black text-xs uppercase tracking-widest">See our menu</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {/* Vertical Navigation Bar */}
      <div className="absolute right-8 md:right-16 bottom-16 flex flex-row md:flex-col items-center gap-8 z-30">
        {heroSlidesToShow.map((_, i) => (
          <button 
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative h-12 w-1 flex flex-col items-center"
          >
             <motion.div 
              className={`absolute top-0 w-1 rounded-full transition-all duration-700 ${current === i ? 'h-full' : 'h-2 bg-white/20'}`}
              style={{ backgroundColor: current === i ? primary : undefined }}
             />
             <span className={`absolute -left-12 top-0 text-[10px] font-black transition-opacity ${current === i ? 'opacity-100' : 'opacity-0'} text-white`}>
              0{i + 1}
             </span>
          </button>
        ))}
      </div>

      {/* Decorative Bottom Vignette */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  );
}