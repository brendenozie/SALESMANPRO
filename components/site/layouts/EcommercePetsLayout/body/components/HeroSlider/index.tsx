'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
// Using Hero Icons as per saved preference
import { 
  SparklesIcon, 
  ChevronRightIcon, 
  ShoppingBagIcon,
  FaceSmileIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { HeroSlide } from '@/types/typings';

const defaultSlides = [
  {
    id: 1,
    title: "Puppy",
    suffix: "Paradise",
    highlight: "New Arrival",
    description: "Premium handcrafted beds designed for the ultimate puppy dreamland. Better sleep, better play.",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=1000&q=90",
    color: "#0EA5E9", 
    secondary: "#BAE6FD"
  },
  {
    id: 2,
    title: "Feline",
    suffix: "Fortune",
    highlight: "Editor's Choice",
    description: "Luxury modular climbing systems that turn your living room into a feline sanctuary.",
    image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=1000&q=90",
    color: "#F43F5E",
    secondary: "#FECDD3"
  }
];

export default function PetHero({ heroSlides, themeSettings }: { heroSlides: any[] | null, themeSettings: any }) {
  const primary = themeSettings?.primaryColor || '#0EA5E9'; // Sky Blue
  const secondary = themeSettings?.secondaryColor || '#F43F5E'; // Rose/Pink

  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const autoAdvanceDelay = 8000; // 8 seconds

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current);
  }, [current, nextSlide]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 500 : -500, opacity: 0 })
  };

  const [index, setIndex] = useState(0);

  // Auto-play feature
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#FDFCFB] overflow-hidden py-20">
      
      {/* 1. LAYERED LIQUID BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 90, 0],
            borderRadius: ["40% 60% 70% 30%", "60% 40% 30% 70%", "40% 60% 70% 30%"]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] opacity-10 blur-3xl"
          style={{ backgroundColor: slides[index].color }}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            borderRadius: ["50% 50% 30% 70%", "30% 70% 70% 30%", "50% 50% 30% 70%"]
          }}
          transition={{ duration: 15, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] opacity-10 blur-3xl"
          style={{ backgroundColor: slides[index].color }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* 2. TEXT CONTENT (Spans 5 cols) */}
          <div className="lg:col-span-5 space-y-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-6">
                  <SparklesIcon className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    {slides[index].highlight}
                  </span>
                </div>

                {/* Hero Title */}
                <h1 className="text-7xl md:text-9xl font-black text-slate-900 leading-[0.85] tracking-tighter mb-8">
                  {slides[index].title} <br />
                  <span style={{ color: slides[index].color }} className="italic font-serif font-light">
                    {slides[index].suffix}
                  </span>
                </h1>

                <p className="text-xl text-slate-500 max-w-sm mb-12 font-medium leading-relaxed border-l-4 border-slate-100 pl-6">
                  {slides[index].description}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                  <Link
                    href="/shop"
                    style={{ backgroundColor: slides[index].color }}
                    className="w-full sm:w-auto px-10 py-5 rounded-full text-white font-bold flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 active:scale-95"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Shop Now
                  </Link>
                  <Link href="/about" className="group flex items-center gap-2 text-slate-900 font-bold hover:text-slate-600 transition-colors">
                    Our Story 
                    <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3. INTERACTIVE IMAGE STACK (Spans 7 cols) */}
          <div className="lg:col-span-7 relative">
            <div className="relative w-full aspect-[4/5] md:aspect-square max-w-[600px] ml-auto">
              
              {/* Floating Badge: Trust */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 -left-12 z-30 bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-xl border border-white/50 hidden md:flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                  <CheckBadgeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase">Vet Approved</p>
                  <p className="text-[10px] text-slate-500 font-bold">100% Non-Toxic</p>
                </div>
              </motion.div>

              {/* Floating Badge: Community */}
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-10 -right-8 z-30 bg-white/80 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-xl border border-white/50 hidden md:flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200">
                  <FaceSmileIcon className="w-6 h-6 text-white" />
                </div>
                <div className="pr-4">
                  <p className="text-xs font-black text-slate-900 uppercase">Happy Club</p>
                  <p className="text-[10px] text-slate-500 font-bold">50k+ Members</p>
                </div>
              </motion.div>

              {/* Main Image Container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full p-4 bg-white rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden"
                >
                  <img 
                    src={slides[index].image} 
                    alt="Pet Hero" 
                    className="w-full h-full object-cover rounded-[4rem]"
                  />
                  {/* Glass Overlay on Image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Indicators */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className="group relative flex items-center justify-center p-2"
                  >
                    <div className={`h-1.5 transition-all duration-500 rounded-full ${index === i ? 'w-12' : 'w-4 bg-slate-200'}`} 
                         style={{ backgroundColor: index === i ? slides[index].color : '' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BACKGROUND ACCENTS */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden xl:block">
        <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-300 rotate-90 origin-left">
          ESTABLISHED • 2026
        </p>
      </div>

    </section>
  );
}