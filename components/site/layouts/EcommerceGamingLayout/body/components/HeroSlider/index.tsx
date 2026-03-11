'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.6;
const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

const defaultSlides: HeroSlide[] = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1605898930773-734733052153?q=80&w=1600&auto=format&fit=crop',
    subline: 'NEW ARRIVAL',
    headline: 'EMPIRE $ GEMS',
    badgeText: 'Upgrade your battle station with professional-grade peripherals. Precision engineering for the elite gamer.',
    ctaText: 'FIND THE PERFECT GEAR',
    ctaLink: '/shop',
    id: '1',
    companyId: '',
    productImageUrl: null,
    price: null,
    endsAt: null,
    order: 0,
    iconKey: null,
    backgroundColor: null,
    textColor: null,
    videoLink: null,
    type: null,
  },
];

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  // Gamer Colors: Deep Purple/Black base
  const defaultPrimaryColor = '#FFFFFF'; // For the "Silver" look
  const defaultAccentColor = '#FF003C'; // Aggressive Red

  const heroSlidesToShow = (heroSlides && heroSlides.length > 0 ? heroSlides : defaultSlides);

  const primary = themeSettings?.primaryColor || defaultPrimaryColor;
  const accent = themeSettings?.secondaryColor || defaultAccentColor;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % heroSlidesToShow.length);
    }, autoAdvanceDelay);
  }, [heroSlidesToShow.length]);

  useEffect(() => {
    resetTimer();
    return () => clearTimeout(timeoutRef.current);
  }, [current, resetTimer]);

  const goTo = (idx: number, dir = 0) => {
    clearTimeout(timeoutRef.current);
    setDirection(dir);
    setCurrent(idx);
  };

  const prevSlide = () => goTo((current - 1 + heroSlidesToShow.length) % heroSlidesToShow.length, -1);
  const nextSlide = () => goTo((current + 1) % heroSlidesToShow.length, 1);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '20%' : '-20%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: transitionDuration, ease: [0.16, 1, 0.3, 1] } },
    exit: (dir: number) => ({ x: dir < 0 ? '20%' : '-20%', opacity: 0, transition: { duration: 0.4 } }),
  };

  return (
    <section className="relative bg-black mt-16 overflow-hidden min-h-[600px] flex flex-col justify-center">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {heroSlidesToShow.map((slide, idx) => idx === current && (
            <motion.div
              key={idx}
              className="flex flex-col md:flex-row items-center h-[550px] gap-8"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {/* TEXT CONTENT */}
              <div className="w-full md:w-1/2 text-left space-y-6 order-2 md:order-1">
                <motion.div 
                   initial={{ opacity: 0, x: -30 }} 
                   animate={{ opacity: 1, x: 0 }}
                   className="flex items-center gap-3"
                >
                   <div className="h-[2px] w-8 bg-red-600" />
                   <span className="text-red-500 font-black tracking-widest text-sm uppercase italic">
                     {slide.badgeText}
                   </span>
                </motion.div>

                <motion.h1 
                  className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-500 leading-[0.9] tracking-tighter italic"
                  style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
                >
                  {slide.headline?.split('$').map((part, i) => (
                    <span key={i} className={i === 1 ? "text-white opacity-90" : ""}>{part}</span>
                  ))}
                </motion.h1>

                <p className="text-gray-400 text-lg max-w-md font-medium leading-relaxed">
                  {slide.subline}
                </p>

                <div className="flex items-center gap-6 pt-4">
                  <Link
                    href={slide.ctaLink || '#'}
                    className="group relative bg-white text-black font-black px-8 py-4 uppercase tracking-tighter flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    {slide.ctaText}
                    <ChevronRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* IMAGE DISPLAY */}
              <div className="w-full md:w-1/2 h-full relative order-1 md:order-2">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotate: 5 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                  className="relative w-full h-full"
                >
                  <Image
                  // get game console image link for unspash
                    src={slide.imageUrl || 'https://images.unsplash.com/photo-1605898930773-734733052153?q=80&w=1600&auto=format&fit=crop'}
                    alt="Hardware"
                    fill
                    className="object-contain drop-shadow-[0_35px_35px_rgba(255,255,255,0.15)]"
                    priority
                    loader={loader}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* THE TICKER - FROM YOUR IMAGE */}
      <div className="absolute bottom-0 w-full bg-red-600 py-3 overflow-hidden whitespace-nowrap border-y border-red-400/30 rotate-[-1deg] translate-y-4">
        <div className="inline-block animate-marquee">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-white font-black italic text-xl mx-8 uppercase">
              ✦ 40% OFF TODAY AVAILABLE ✦ 40% OFF TODAY AVAILABLE
            </span>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
}