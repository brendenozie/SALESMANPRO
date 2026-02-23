'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRightIcon, BeakerIcon, SparklesIcon, GlobeAmericasIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=2000&q=90',
    subline: 'VET-APPROVED CARE',
    headline: 'Nourishing Your \n Livestock $ Better',
    badgeText: 'Maximize productivity with our scientifically formulated supplements and trusted veterinary solutions.',
    ctaText: 'Shop Animal Health',
    ctaLink: '/livestock',
    id: '1', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null,
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=2000&q=90',
    subline: 'MAXIMUM YIELD',
    headline: 'Quality Seeds $ For \n Every Season',
    badgeText: 'Certified hybrid seeds engineered for drought resistance and higher harvest weight.',
    ctaText: 'Explore Seeds',
    ctaLink: '/seeds',
    id: '2', companyId: '', productImageUrl: null, price: null, endsAt: null, order: 0, iconKey: null, backgroundColor: null, textColor: null, videoLink: null, type: null,
  },
];

export default function StunningAgrovetHero({ heroSlides, themeSettings }: { heroSlides: HeroSlide[] | null; themeSettings: any }) {
  const primary = themeSettings?.primaryColor || '#064e3b'; // Deep Emerald
  const accent = '#fbbf24'; // Amber Glow
  const slides = heroSlides?.length ? heroSlides : defaultSlides;

  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextSlide, 7000);
    return () => clearInterval(interval);
  }, [nextSlide, isHovered]);

  return (
    <section className="relative w-full h-[90vh] min-h-[700px] bg-[#f8fafc] overflow-hidden flex items-center">
      
      {/* 1. BACKGROUND LAYER: SOFT GRADIENTS & GLASS ORBS */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[80%] rounded-full opacity-20 blur-[120px]"
          style={{ background: primary }}
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* 2. TEXT CONTENT: ELEGANT & BOLD */}
          <div className="order-2 lg:order-1 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] bg-white border border-slate-200 shadow-sm text-slate-500 uppercase">
                    {slides[current].subline}
                  </span>
                  <div className="h-[1px] w-12 bg-slate-200" />
                </div>

                <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 leading-[0.9] tracking-tighter mb-8">
                  {(slides[current].headline || '').split('\n').map((line, i) => (
                    <span key={i} className="block">
                      {line.includes('$') ? (
                        <>
                          {line.split('$')[0]}
                          <span className="italic font-serif font-light text-slate-400">
                            {line.split('$')[1]}
                          </span>
                        </>
                      ) : line}
                    </span>
                  ))}
                </h1>

                <p className="text-slate-500 text-lg md:text-xl max-w-md leading-relaxed mb-10">
                  {slides[current].badgeText}
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Link
                    href={slides[current].ctaLink || '#'}
                    className="group relative px-10 py-5 bg-slate-900 rounded-full overflow-hidden transition-all hover:pr-14 active:scale-95 shadow-2xl"
                  >
                    <span className="relative z-10 text-white font-bold tracking-tight">
                      {slides[current].ctaText}
                    </span>
                    <ArrowRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white opacity-0 transition-all group-hover:opacity-100 group-hover:right-4" />
                    <motion.div 
                      className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: primary }}
                    />
                  </Link>

                  <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                    <div className="flex items-center justify-center pl-6 text-xs font-bold text-slate-400">
                      Trusted by 4,000+ Farmers
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 3. VISUAL LAYER: THE "ORGANIC STACK" */}
          <div className="order-1 lg:order-2 relative h-[450px] lg:h-[600px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                className="relative w-full h-full flex items-center justify-center"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                {/* Main Abstract Shape Background */}
                <motion.div 
                  initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 5, scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0 bg-slate-100 rounded-[60px] md:rounded-[100px] -z-10"
                  style={{ borderRadius: '63% 37% 30% 70% / 50% 45% 55% 50%' }}
                />

                {/* The Stunning Image Card */}
                <motion.div 
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="relative w-[85%] h-[90%] rounded-[40px] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[8px] border-white"
                >
                  <Image
                    src={slides[current].imageUrl || ''}
                    alt="Agrovet Visual"
                    fill
                    className="object-cover transition-transform duration-[10s] ease-linear hover:scale-110"
                    loader={loader}
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </motion.div>

                {/* Floating "Smart" Indicators */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -right-4 bg-white/80 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-white flex items-center gap-4 z-20"
                >
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600"><SparklesIcon className="w-6 h-6" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Pure Grade</p>
                    <p className="text-lg font-black text-slate-800 tracking-tighter">Premium Quality</p>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-8 -left-4 bg-white p-5 rounded-3xl shadow-xl border border-white flex items-center gap-4 z-20"
                >
                  <div className="p-3 bg-blue-100 rounded-2xl text-blue-600"><GlobeAmericasIcon className="w-6 h-6" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Certified</p>
                    <p className="text-lg font-black text-slate-800 tracking-tighter">Eco-Friendly</p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* 4. SLIDE INDICATOR: THE "DNA" STRIP */}
      <div className="absolute bottom-12 right-12 flex items-center space-x-4 z-30">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Next Slide</span>
        <div className="flex space-x-2">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${current === i ? 'w-12 bg-slate-900' : 'w-4 bg-slate-200 hover:bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}