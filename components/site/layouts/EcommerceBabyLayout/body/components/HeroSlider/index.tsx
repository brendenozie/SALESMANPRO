'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// Using Hero Icons as requested
import { ChevronLeftIcon, ChevronRightIcon, CloudIcon, SparklesIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 6000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const primary = themeSettings?.primaryColor || '#F472B6'; // Soft Pink
  const secondary = themeSettings?.secondaryColor || '#3B82F6'; // Soft Blue

  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [
    {
      imageUrl: 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f',
      headline: 'Sweet Dreams\nfor Little Ones',
      badgeText: 'New Organic Collection',
      subline: 'Up to 30% OFF',
      ctaText: 'Explore Now',
      ctaLink: '/products',
    }
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setTimeout(nextSlide, autoAdvanceDelay);
    return () => clearTimeout(timer);
  }, [current, nextSlide]);

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 500 : -500, opacity: 0 })
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- MAIN SLIDER --- */}
        <div className="lg:col-span-2 relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#EBF4FF] to-[#F3E8FF] min-h-[500px] shadow-sm">
           {/* --- ANIMATED BUBBLE BACKGROUND --- */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [0, -40, 0],
                            x: [0, 20, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 5 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute rounded-full blur-3xl opacity-20"
                          style={{
                            width: `${150 + i * 50}px`,
                            height: `${150 + i * 50}px`,
                            backgroundColor: i % 2 === 0 ? primary : secondary,
                            left: `${i * 20}%`,
                            top: `${10 + i * 15}%`,
                          }}
                        />
                      ))}
                      {/* Soft Cloud Watermarks */}
                      <CloudIcon className="absolute top-10 left-10 w-32 h-32 text-white/40 -rotate-12" />
                      <CloudIcon className="absolute bottom-20 right-1/3 w-24 h-24 text-white/30 rotate-12" />
                    </div>
                    
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex flex-col md:flex-row items-center px-8 md:px-16 py-12"
            >
              <div className="relative z-10 w-full md:w-1/2 text-center md:text-left">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-white"
                >
                  <SparklesIcon className="w-4 h-4" style={{ color: primary }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    {slides[current].subline}
                  </span>
                </motion.div>
                
                <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
                  {slides[current].headline}
                </h2>
                
                <p className="text-lg text-gray-600 mb-8 font-medium">
                  {slides[current].badgeText}
                </p>

                <Link href={slides[current].ctaLink || '#'}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-12 py-5 rounded-2xl text-white font-extrabold shadow-xl hover:shadow-2xl transition-all"
                    style={{ backgroundColor: secondary, boxShadow: `0 20px 40px -12px ${secondary}44` }}
                  >
                    {slides[current].ctaText}
                  </motion.button>
                </Link>
              </div>

              {/* Floating Product Image */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full md:w-1/2 h-64 md:h-full mt-8 md:mt-0"
              >
                <Image 
                  src={slides[current].imageUrl || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f'} 
                  alt="Baby Product" 
                  fill 
                  className="object-contain drop-shadow-2xl"
                  loader={loader}
                  priority 
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Custom Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 z-20 pointer-events-none">
            <button onClick={prevSlide} className="p-3 rounded-full bg-white/50 backdrop-blur-md pointer-events-auto hover:bg-white transition-colors shadow-sm">
              <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
            </button>
            <button onClick={nextSlide} className="p-3 rounded-full bg-white/50 backdrop-blur-md pointer-events-auto hover:bg-white transition-colors shadow-sm">
              <ChevronRightIcon className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>

        {/* --- PROMO CARDS --- */}
        <div className="flex flex-col gap-6">
          <PromoCard 
            title="Toy Sale!" 
            subtitle="Starting at $16.99" 
            color="#FFF0F6" 
            btnColor={primary}
            img="https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f"
          />
          <PromoCard 
            title="Soft Basics" 
            subtitle="Buy 2 Get 1 Free" 
            color="#F0F9FF" 
            btnColor={secondary}
            img="https://images.unsplash.com/photo-1523381210434-271e8be1f52b"
            isHot
          />
        </div>
      </div>
    </section>
  );
}

function PromoCard({ title, subtitle, color, btnColor, img, isHot }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="flex-1 relative rounded-[2.5rem] p-8 overflow-hidden group shadow-sm"
      style={{ backgroundColor: color }}
    >
      <div className="relative z-10">
        {isHot && (
          <span className="bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase mb-2 inline-block">
            Hot Deal
          </span>
        )}
        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
        <p className="text-gray-600 font-bold mt-1">{subtitle}</p>
        <button 
          className="mt-5 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg hover:brightness-95 transition-all"
          style={{ backgroundColor: btnColor }}
        >
          Shop Now
        </button>
      </div>
      <div className="absolute -right-4 -bottom-4 w-32 h-32 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
        <Image src={img || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f'} alt={title} fill className="object-contain" loader={loader} />
      </div>
    </motion.div>
  );
}