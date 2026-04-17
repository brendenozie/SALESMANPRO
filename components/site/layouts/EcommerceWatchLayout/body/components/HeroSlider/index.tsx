'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Hero Icons as per saved preference
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ArrowRightIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 7000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=80',
    subline: 'The Midnight Limited Edition features subtle accents of white luminescent hands and raised steel indices.',
    headline: 'Precision & Heritage',
    ctaText: 'View Collection',
    ctaLink: '/shop',
    id: '1',
    companyId: '',
    productImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    badgeText: 'New Arrival',
    price: '$2,450',
    backgroundColor: '#0a0a0a',
    textColor: '#FFFFFF',
    order: 0,
    iconKey: null,
    videoLink: null,
    type: null,
    endsAt: null
  }
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const slides = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const primary = themeSettings?.primaryColor || '#C5A059'; 

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide, isHovered]);

  return (
    <section 
      className="relative w-full bg-[#050505] min-h-[700px] lg:h-screen flex items-center overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* BACKGROUND ACCENT */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#C5A059]/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* LEFT CONTENT: EDITORIAL STYLE */}
            <div className="lg:col-span-6 space-y-8 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="h-[1px] w-12 bg-[#C5A059]" />
                <span className="text-[#C5A059] uppercase tracking-[0.3em] text-xs font-bold">
                  {slides[current].badgeText || "Masterpiece Series"}
                </span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-8xl font-serif italic text-white leading-tight"
              >
                {slides[current]?.headline?.split(' ')[0] || 'Slide ' + (current + 1)} <br />
                <span className="not-italic font-sans font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">
                  {slides[current]?.headline?.split(' ').slice(1).join(' ') || 'Headline'}
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-400 text-lg md:text-xl max-w-md leading-relaxed font-light"
              >
                {slides[current]?.subline || 'Subline'}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-6"
              >
                <Link
                  href={slides[current]?.ctaLink || '/watchecommerce/products'}
                  className="group relative inline-flex items-center gap-3 bg-[#C5A059] text-black font-bold uppercase tracking-widest px-10 py-5 transition-all hover:pr-14 hover:bg-white"
                >
                  {slides[current]?.ctaText || 'Shop Now'}
                  <ArrowRightIcon className="w-5 h-5 absolute right-4 opacity-0 group-hover:opacity-100 transition-all" />
                </Link>
                
                {slides[current].price && (
                  <div className="text-white border-l border-gray-800 pl-6">
                    <p className="text-xs uppercase text-gray-500 mb-1">Starting At</p>
                    <p className="text-2xl font-mono">{slides[current].price}</p>
                  </div>
                )}
              </motion.div>

              {/* Trust Bars */}
              <div className="grid grid-cols-2 gap-4 pt-10 opacity-50">
                <div className="flex items-center gap-2 text-white text-xs uppercase tracking-widest">
                  <ShieldCheckIcon className="w-4 h-4 text-[#C5A059]" /> 2 Year Warranty
                </div>
                <div className="flex items-center gap-2 text-white text-xs uppercase tracking-widest">
                  <SparklesIcon className="w-4 h-4 text-[#C5A059]" /> Certified Authentic
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT: THE VISUAL STORY */}
            <div className="lg:col-span-6 relative order-1 lg:order-2">
              <div className="relative w-full aspect-square max-w-[550px] mx-auto group">
                
                {/* Main Hero Image with Floating Effect */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                >
                  <Image
                    src={slides[current].imageUrl || 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1200&q=80'}
                    alt={slides[current].headline || 'Hero Image'}
                    fill
                    className="object-cover scale-110 group-hover:scale-100 transition-transform duration-[3s]"
                    loader={loader}
                    priority
                  />
                </motion.div>

                {/* Overlapping Detail Image (The "Watch Face") */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-12 -bottom-12 z-20 w-1/2 aspect-[4/5] bg-[#111] border-[8px] border-[#050505] shadow-2xl rounded-sm overflow-hidden hidden md:block"
                >
                  <Image
                    src={slides[current].productImageUrl || slides[current].imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                    alt="Macro detail"
                    fill
                    className="object-cover"
                    loader={loader}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <ClockIcon className="w-6 h-6 text-[#C5A059] mb-2" />
                    <p className="text-[10px] text-white uppercase font-bold tracking-[0.2em]">Swiss Made</p>
                  </div>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 border border-[#C5A059]/20 rounded-full animate-pulse pointer-events-none" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* BOTTOM NAVIGATION: PREMIUM DASHBOARD */}
        <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between border-t border-gray-900 pt-8">
          <div className="flex items-center gap-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`group relative py-2 transition-all ${current === i ? 'text-white' : 'text-gray-600'}`}
              >
                <span className="text-xs font-mono tracking-tighter mr-2">0{i + 1}</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest transition-all ${current === i ? 'opacity-100' : 'opacity-0'}`}>
                  {slides[i]?.headline?.split(' ')[0] || 'Slide ' + (i + 1)}
                </span>
                <div className={`absolute bottom-0 left-0 h-[2px] bg-[#C5A059] transition-all duration-500 ${current === i ? 'w-full' : 'w-0 group-hover:w-4'}`} />
              </button>
            ))}
          </div>

          <div className="flex gap-[1px] bg-gray-900">
            <button 
              onClick={prevSlide}
              className="p-5 bg-[#050505] text-white hover:bg-white hover:text-black transition-all"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="p-5 bg-[#050505] text-white hover:bg-white hover:text-black transition-all"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}