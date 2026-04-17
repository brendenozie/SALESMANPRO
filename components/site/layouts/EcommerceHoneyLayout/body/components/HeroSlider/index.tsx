'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Hero Icons as per saved preference
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  BeakerIcon, 
  SunIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const autoAdvanceDelay = 8000;
const loader = ({ src }: { src: string }) => src;

export default function HoneyHero({ heroSlides }: { heroSlides: HeroSlide[] | null }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = useMemo(() => {
    const fallback = 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop';
    if (!heroSlides || heroSlides.length === 0) return [{
      headline: "PURE GOLD\nFROM THE HIVE.",
      badgeText: "Limited Harvest / Batch 724",
      subline: "Experience unfiltered, raw honey sourced from remote sun-drenched meadows. Each jar tells a story of the season.",
      ctaText: "Explore the Harvest",
      ctaLink: "/shop",
      imageUrl: fallback,
      productImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
      price: "From $24.00"
    }];
    return heroSlides;
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
    const timer = setInterval(nextSlide, autoAdvanceDelay);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative min-h-[85vh] lg:min-h-screen flex items-center bg-[#FFFCF5] overflow-hidden pt-20 lg:pt-0">
      
      {/* 1. LAYERED DECORATIVE BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Honeycomb Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-rule='evenodd' stroke='%23B8860B' stroke-width='2' fill='none'/%3E%3C/svg%3E")`, backgroundSize: '60px' }} />
        
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -120, 0], 
              x: [0, 40, 0],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.4, 0.1] 
            }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-2 h-2 bg-[#D4AF37] rounded-full blur-[1px]"
            style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          />
        ))}

        {/* Large Sun Glow */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-200/20 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center"
          >
            {/* TEXT CONTENT */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-50 border border-amber-100/50">
                  <SparklesIcon className="w-4 h-4 text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-800">
                    {slides[current].badgeText}
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-stone-900 leading-[0.95] tracking-tight">
                  {slides[current].headline?.split('\n').map((text, i) => (
                    <span key={i} className="block last:italic last:text-amber-600">
                      {text}
                    </span>
                  ))}
                </h1>

                <p className="text-stone-600 text-lg md:text-xl max-w-md leading-relaxed">
                  {slides[current].subline}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                  <Link
                    href={slides[current].ctaLink || '/shop'}
                    className="w-full sm:w-auto px-12 py-5 bg-[#3E2723] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-amber-600 transition-all duration-500 shadow-2xl shadow-amber-900/20 hover:scale-105 flex justify-center"
                  >
                    {slides[current].ctaText}
                  </Link>
                  <div className="flex items-center gap-4 text-stone-400">
                    <div className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center">
                      <BeakerIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest leading-none">Purity Verified</p>
                      <p className="text-[10px] font-medium italic">100% Organic & Raw</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* VISUAL COMPOSITION */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="relative w-full aspect-[4/5] max-w-[500px] mx-auto">
                {/* Main Image Arch */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className="relative w-full h-full z-10 rounded-t-[240px] rounded-b-3xl overflow-hidden border-[16px] border-white shadow-[0_32px_64px_-16px_rgba(184,134,11,0.3)]"
                >
                  <Image 
                    src={slides[current].imageUrl || slides[current].productImageUrl || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1200&auto=format&fit=crop'} 
                    alt="Artisanal Honey" 
                    fill 
                    loader={loader}
                    className="object-cover scale-105 hover:scale-110 transition-transform duration-[3s]"
                  />
                  {/* Subtle Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 to-transparent" />
                </motion.div>

                {/* Floating "Nectar" Card */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-8 bottom-12 z-20 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white hidden md:block"
                >
                  <div className="flex flex-col items-center text-center">
                    <SunIcon className="w-8 h-8 text-amber-500 mb-2" />
                    <p className="text-[10px] font-black uppercase text-stone-400 tracking-tighter">Vitamin Content</p>
                    <p className="text-xl font-serif text-stone-900">Naturally Rich</p>
                  </div>
                </motion.div>

                {/* Organic Decorative Blob */}
                <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-60" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* REFINED NAVIGATION CONTROLS */}
      <div className="absolute bottom-10 left-0 right-0 z-30 container mx-auto px-6 lg:px-16 flex justify-between items-end pointer-events-none">
        {/* Progress Bars */}
        <div className="flex gap-4 mb-4 pointer-events-auto">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrent(i)}
              className={`h-[3px] transition-all duration-700 rounded-full ${i === current ? 'w-16 bg-amber-600' : 'w-4 bg-stone-200'}`} 
            />
          ))}
        </div>

        {/* Action Arrows */}
        <div className="flex gap-[1px] rounded-full overflow-hidden border border-stone-200 bg-white pointer-events-auto shadow-lg">
          <button 
            onClick={prevSlide} 
            className="p-5 hover:bg-amber-50 text-stone-400 hover:text-amber-900 transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="w-[1px] bg-stone-100" />
          <button 
            onClick={nextSlide} 
            className="p-5 hover:bg-amber-50 text-stone-400 hover:text-amber-900 transition-all"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}