'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const autoAdvanceDelay = 5000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const primary = themeSettings?.primaryColor || '#F472B6';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  // Fallback slides if none provided
  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [
    {
      imageUrl: 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
      headline: 'Baby Love Sale\nAll Products Discounted!',
      badgeText: 'Free shipping on all your order.',
      subline: 'Sale up to 20% OFF',
      ctaText: 'Shop Now',
      ctaLink: '/ecommerce/products',
    }
  ];

  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    timeoutRef.current = setTimeout(nextSlide, autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current);
  }, [current, nextSlide]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-6 mt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- MAIN SLIDER (Left 2 Columns) --- */}
        <div className="lg:col-span-2 relative rounded-[2rem] overflow-hidden bg-[#EBF4FF] min-h-[450px] md:min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center"
            >
              <div className="relative z-10 pl-8 md:pl-16 w-full md:w-3/5">
                <motion.span 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-block bg-white px-4 py-1 rounded-full text-blue-500 font-bold shadow-sm text-sm mb-4"
                >
                  {slides[current].subline}
                </motion.span>
                <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight whitespace-pre-line">
                  {slides[current].headline}
                </h2>
                <p className="text-sm md:text-base text-gray-500 mt-4 font-medium">
                  {slides[current].badgeText}
                </p>
                <Link href={slides[current].ctaLink || '#'}>
                  <button 
                    className="mt-8 px-10 py-4 rounded-2xl text-white font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                    style={{ backgroundColor: secondary }}
                  >
                    {slides[current].ctaText}
                  </button>
                </Link>
              </div>

              {/* Slider Image */}
              <div className="absolute right-0 bottom-0 w-1/2 h-[90%] hidden md:block">
                <Image 
                  src={slides[current].imageUrl || 'https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80'} 
                  alt="Hero" 
                  fill 
                  className="object-contain object-bottom"
                  loader={loader}
                  priority 
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          {slides.length > 1 && (
            <div className="absolute bottom-8 left-16 flex space-x-2 z-20">
              {slides.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 transition-all duration-300 rounded-full ${i === current ? 'w-8' : 'w-2 bg-gray-300'}`}
                  style={{ backgroundColor: i === current ? secondary : undefined }}
                />
              ))}
            </div>
          )}
        </div>

        {/* --- PROMO CARDS (Right Column) --- */}
        <div className="flex flex-col gap-6">
          {/* Top Card */}
          <div className="flex-1 relative rounded-[2rem] p-8 overflow-hidden bg-[#FFF0F6] group">
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-gray-900">Toy Sale!</h3>
              <p className="text-gray-600 font-medium">Fun for Little Hands</p>
              <p className="text-xs font-bold mt-2" style={{ color: primary }}>Starting at $16.99</p>
              <button className="mt-4 px-6 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:brightness-95 transition-all" style={{ backgroundColor: primary }}>
                Shop Now
              </button>
            </div>
            <div className="absolute -right-2 -bottom-2 w-32 h-32 transition-transform duration-500 group-hover:scale-110">
               <Image src="https://images.unsplash.com/photo-1519408230728-0c7c8f0b2c5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80" alt="Toys" fill className="object-contain" loader={loader} />
            </div>
          </div>

          {/* Bottom Card */}
          <div className="flex-1 relative rounded-[2rem] p-8 overflow-hidden bg-[#FDF2F2] group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Hot product</p>
              <h3 className="text-2xl font-black text-gray-900 leading-tight">Cuteness on Sale!</h3>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-2xl font-black" style={{ color: primary }}>$20.00</span>
                <span className="text-gray-400 line-through text-sm">$32.00</span>
              </div>
              <button className="mt-4 px-6 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:brightness-95 transition-all" style={{ backgroundColor: primary }}>
                Shop Now
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-36 h-36 transition-transform duration-500 group-hover:rotate-6">
               <Image src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80" alt="Clothes" fill className="object-contain" loader={loader} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}