'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLongRightIcon, BeakerIcon, SpeakerWaveIcon, BoltIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const autoAdvanceDelay = 8000;

const loader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=75`;

export default function PremiumHeroSlider({ heroSlides, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#1d4ed8';
  const secondary = themeSettings?.secondaryColor || '#f59e0b';
  
  const [current, setCurrent] = useState(0);
  const slides = heroSlides?.length ? heroSlides : [
    {
      subline: "Limited Edition Release",
      headline: "PURE SOUND. $UNFILTERED.",
      badgeText: "Experience Class 1 Bluetooth connectivity with 40-hour battery life. Engineered for the studio, built for the street.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
      ctaText: "Explore the Series",
      ctaLink: "/shop"
    }
  ];

  // Logic for auto-advancing
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, autoAdvanceDelay);
    return () => clearTimeout(timer);
  }, [current, slides.length]);

  return (
    <section className="relative min-h-[100vh] flex items-center bg-[#050505] overflow-hidden">
      {/* Background Decorative Element - Moving Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full opacity-20 pointer-events-none"
           style={{ background: `radial-gradient(circle, ${primary} 0%, transparent 70%)` }} />

      <div className="container mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* TEXT CONTENT */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <motion.div
                variants={{
                  initial: { opacity: 0, x: -50 },
                  animate: { opacity: 1, x: 0 },
                  exit: { opacity: 0, x: -20 }
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[2px] w-12 bg-current" style={{ color: secondary }} />
                  <span className="text-xs font-bold tracking-[0.3em] uppercase text-white/60">
                    {slides[current].subline}
                  </span>
                </div>

                  <h2 className="text-5xl md:text-8xl font-black text-white leading-[0.9] mb-8 tracking-tighter">
                  {slides[current].headline.split('$').map((part: string, i: number) => (
                    <span key={i} className="block" style={i === 1 ? { WebkitTextStroke: '1px white', color: 'transparent' } : {}}>
                      {part}
                    </span>
                  ))}
                </h2>

                <p className="text-lg text-white/40 max-w-md mb-10 leading-relaxed">
                  {slides[current].badgeText}
                </p>

                <div className="flex flex-wrap gap-6 items-center">
                  <Link
                    href={slides[current].ctaLink}
                    className="relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden group transition-transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {slides[current].ctaText}
                      <ArrowLongRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                    </span>
                  </Link>

                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-gray-800 flex items-center justify-center text-[10px] text-white font-bold">
                        {i === 3 ? '+5k' : <div className="w-full h-full rounded-full bg-gradient-to-tr from-gray-600 to-gray-400" />}
                      </div>
                    ))}
                    <span className="pl-6 text-sm text-white/60 self-center">Trusted by Audiophiles</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* FLOATING IMAGE PANEL */}
            <div className="lg:col-span-6 order-1 lg:order-2 relative">
              <motion.div
                variants={{
                  initial: { opacity: 0, scale: 0.8, rotate: -10 },
                  animate: { opacity: 1, scale: 1, rotate: 0 },
                  exit: { opacity: 0, scale: 1.1, rotate: 10 }
                }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 aspect-square"
              >
                {/* Product Image */}
                <Image
                  src={slides[current].imageUrl}
                  alt="Earphones"
                  fill
                  className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                  priority
                  loader={loader}
                />

                {/* Floating Micro-Badges */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 right-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hidden md:block"
                >
                  <BoltIcon className="w-6 h-6 mb-2 text-yellow-400" />
                  <p className="text-[10px] font-bold text-white tracking-widest uppercase">Fast Charge</p>
                  <p className="text-lg font-black text-white">5 min = 2 hrs</p>
                </motion.div>

                <motion.div 
                   animate={{ y: [0, 20, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute bottom-10 left-0 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 hidden md:block"
                >
                  <SpeakerWaveIcon className="w-6 h-6 mb-2 text-blue-400" />
                  <p className="text-[10px] font-bold text-white tracking-widest uppercase">Active ANC</p>
                  <p className="text-lg font-black text-white">-35dB</p>
                </motion.div>
              </motion.div>

              {/* Huge Background Text for Depth */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-white/[0.03] select-none z-10 tracking-tighter">
                AUDIO
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Custom Progress Indicators */}
        <div className="absolute bottom-12 left-6 flex gap-4 items-center">
            {slides.map((_: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setCurrent(i)}
                  className="group relative h-12 w-1 transition-all"
                >
                    <div className="absolute inset-0 bg-white/10 w-full h-full rounded-full overflow-hidden">
                        {i === current && (
                            <motion.div 
                                initial={{ height: 0 }} 
                                animate={{ height: '100%' }} 
                                transition={{ duration: 8, ease: "linear" }}
                                className="w-full bg-white origin-top" 
                            />
                        )}
                    </div>
                </button>
            ))}
            <span className="text-white/20 font-mono text-xs">0{current + 1} / 0{slides.length}</span>
        </div>
      </div>
    </section>
  );
}