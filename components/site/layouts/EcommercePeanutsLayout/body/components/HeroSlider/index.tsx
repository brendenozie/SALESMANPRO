'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

/* -------------------------------------------------------------------------- */
/* Design Elements */
/* -------------------------------------------------------------------------- */

const USPItem = ({ Icon, label }: { Icon: React.FC; label: string }) => (
  <div className="flex flex-col items-center group">
    <div className="w-14 h-14 rounded-full border-2 border-amber-100 flex items-center justify-center mb-2 group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-300">
      <div className="text-amber-900 group-hover:text-white">
        <Icon />
      </div>
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-amber-900/40 group-hover:text-amber-900 transition-colors">
      {label}
    </span>
  </div>
);

const loader = ({ src }: { src: string }) => src; // Bypass Next.js optimization for external URLs

const FloatingPeanut = ({ delay, className }: { delay: number; className: string }) => (
  <motion.div
    initial={{ y: 0, rotate: 0 }}
    animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
    transition={{ duration: 5, repeat: Infinity, delay }}
    className={`absolute pointer-events-none select-none opacity-20 md:opacity-40 ${className}`}
  >
    <span className="text-4xl">🥜</span>
  </motion.div>
);

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

export default function PeanutHeroRedesign({ heroSlides, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#8B4513';
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = (heroSlides && heroSlides.length > 0) ? heroSlides : [
    {
      headline: "PURELY NUTS.\nNO NONSENSE.",
      subline: "Stone-Ground Perfection",
      badgeText: "Experience the crunch of 100% slow-roasted Argentinian peanuts. No palm oil, just pure energy.",
      ctaText: "Grab a Jar",
      imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1000&auto=format&fit=crop",
      color: "#FDF8F1"
    },
    {
      headline: "CREAMY OR\nCRUNCHY?",
      subline: "The Great Debate",
      badgeText: "Whether you're a smooth operator or a texture seeker, we've got the perfect roast for your toast.",
      ctaText: "Explore Texture",
      imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=1000&auto=format&fit=crop",
      color: "#FFFBF2"
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FAF7F2]">
      
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')] z-10" />

      {/* Background Floating Elements */}
      <FloatingPeanut delay={0} className="top-20 left-[10%]" />
      <FloatingPeanut delay={1} className="bottom-40 left-[5%]" />
      <FloatingPeanut delay={2} className="top-40 right-[15%]" />
      <FloatingPeanut delay={0.5} className="bottom-20 right-[10%]" />

      <div className="container mx-auto px-6 lg:px-12 relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left: Content Stage */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/50 text-amber-900 mb-6">
                  <SparklesIcon className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">{slides[current].subline}</span>
                </div>

                <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-[#3E2723] leading-[0.9] mb-6">
                  {slides[current].headline.split('\n').map((text: string, i: number) => (
                    <span key={i} className="block">{text}</span>
                  ))}
                </h1>

                <p className="text-lg text-stone-600 mb-10 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                  {slides[current].badgeText}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                  <Link
                    href="/shop"
                    className="group relative px-10 py-5 bg-[#3E2723] text-white rounded-2xl font-black uppercase tracking-widest text-sm overflow-hidden transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10">{slides[current].ctaText}</span>
                    <div className="absolute inset-0 bg-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                  
                  <Link href="/about" className="text-sm font-black uppercase tracking-widest text-[#3E2723] hover:text-amber-600 transition-colors">
                    Our Process
                  </Link>
                </div>
              </motion.div>

              {/* USPs: Line Icons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center lg:justify-start gap-12 mt-16 pt-8 border-t border-amber-900/5"
              >
                <USPItem Icon={() => <span>🚫🌴</span>} label="Palm Free" />
                <USPItem Icon={() => <span>🌾</span>} label="Gluten Free" />
                <USPItem Icon={() => <span>🫘</span>} label="No Added Soy" />
              </motion.div>
            </div>

            {/* Right: Visual Stage */}
            <div className="order-1 lg:order-2 relative h-[400px] md:h-[600px] flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="relative w-full h-full"
              >
                {/* Decorative Jar Backdrop */}
                <div className="absolute inset-0 bg-[#F5DEB3] clip-path-peanut opacity-20 scale-110 rotate-12" />
                
                <Image
                  src={slides[current].imageUrl}
                  alt="Peanut Butter"
                  fill
                  className="object-contain drop-shadow-[0_35px_35px_rgba(62,39,35,0.2)]"
                  priority
                  loader={loader}
                />
              </motion.div>

              {/* Floating "Natural" Badge */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 right-10 w-24 h-24 md:w-32 md:h-32 pointer-events-none"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600/20 fill-current">
                   <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-amber-900 text-center leading-tight">
                  100%<br/>Natural
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 z-30">
        <button 
          onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
          className="p-3 rounded-full border border-amber-900/10 hover:bg-white hover:shadow-xl transition-all"
        >
          <ChevronLeftIcon className="w-5 h-5 text-[#3E2723]" />
        </button>

        <div className="flex gap-2">
          {slides.map((_ : any, i : any) => (
            <div 
              key={i} 
              className={`h-1.5 transition-all duration-500 rounded-full ${i === current ? 'w-8 bg-[#3E2723]' : 'w-2 bg-[#3E2723]/20'}`} 
            />
          ))}
        </div>

        <button 
          onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
          className="p-3 rounded-full border border-amber-900/10 hover:bg-white hover:shadow-xl transition-all"
        >
          <ChevronRightIcon className="w-5 h-5 text-[#3E2723]" />
        </button>
      </div>

      <style jsx global>{`
        .clip-path-peanut {
          clip-path: ellipse(40% 50% at 50% 50%);
        }
      `}</style>
    </section>
  );
}