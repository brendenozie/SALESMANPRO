'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';

/* -------------------------------------------------------------------------- */
/* Design Elements */
/* -------------------------------------------------------------------------- */

const StatBadge = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col">
    <span className="text-xl font-black text-[#3E2723] leading-none">{value}</span>
    <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold mt-1">{label}</span>
  </div>
);

const loader = ({ src }: { src: string }) => src;

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

export default function PeanutHeroIntuitive({ heroSlides }: any) {
  const [current, setCurrent] = useState(0);

  const slides = (heroSlides && heroSlides.length > 0) ? heroSlides : [
    {
      headline: "The Art of the Roast.",
      subline: "Batch No. 042",
      badgeText: "Discover a deeper, more complex peanut butter. Slow-roasted in small batches to unlock hidden notes of caramel and smoke.",
      ctaText: "Explore the Collection",
      imageUrl: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=1000&auto=format&fit=crop",
    },
    {
      headline: "Texture, Refined.",
      subline: "Velvet Smoothness",
      badgeText: "Our triple-milled process ensures a silk-like consistency that melts instantly. No stabilizers, just pure nut oils.",
      ctaText: "Shop Creamy",
      imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=1000&auto=format&fit=crop",
    }
  ];

  return (
    <section className="relative min-h-[100vh] flex items-center bg-[#FCFAF7] overflow-hidden py-20 lg:py-0">
      
      {/* Structural Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#F3A852]/5 hidden lg:block" />
      <div className="absolute left-12 top-1/2 -translate-y-1/2 h-64 w-[1px] bg-stone-200 hidden xl:block" />

      <div className="container mx-auto px-6 lg:px-24 relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
          >
            {/* 01. Content Stage (5 cols) */}
            <div className="lg:col-span-5 order-2 lg:order-1 text-left">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-[#F3A852] mb-4">
                  {slides[current].subline}
                </span>

                <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-[#3E2723] leading-tight mb-6 tracking-tighter">
                  {slides[current].headline}
                </h1>

                <p className="text-sm md:text-base text-stone-500 mb-10 max-w-sm font-medium leading-relaxed">
                  {slides[current].badgeText}
                </p>

                <div className="flex items-center gap-8">
                  <Link
                    href="/shop"
                    className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#3E2723] transition-all"
                  >
                    <span className="border-b-2 border-[#3E2723] pb-1 group-hover:border-[#F3A852] group-hover:text-[#F3A852] transition-colors">
                      {slides[current].ctaText}
                    </span>
                    <div className="p-3 bg-[#3E2723] rounded-full text-white group-hover:bg-[#F3A852] group-hover:text-[#3E2723] transition-all">
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </Link>
                </div>

                {/* Micro Stats */}
                <div className="flex gap-10 mt-16 pt-10 border-t border-stone-100">
                  <StatBadge value="100%" label="Natural" />
                  <StatBadge value="0%" label="Palm Oil" />
                  <StatBadge value="Argentine" label="Origin" />
                </div>
              </motion.div>
            </div>

            {/* 02. Visual Stage (7 cols) */}
            <div className="lg:col-span-7 order-1 lg:order-2 relative flex items-center justify-center">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full aspect-square max-w-[500px]"
              >
                {/* Minimalist Jar Backdrop */}
                <div className="absolute inset-0 bg-white rounded-full shadow-[0_40px_80px_rgba(0,0,0,0.03)] scale-90" />
                
                <Image
                  src={slides[current].imageUrl}
                  alt="Product"
                  fill
                  className="object-contain drop-shadow-[0_20px_40px_rgba(62,39,35,0.15)] p-12"
                  priority
                  loader={loader}
                />

                {/* Draggable-feel badge */}
                <div className="absolute bottom-[15%] right-0 bg-white p-4 rounded-2xl shadow-xl border border-stone-50 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#3E2723]">In Stock: Limited Batch</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sleek Pagination */}
      <div className="absolute bottom-12 right-12 flex items-center gap-6 z-30">
        <div className="text-[10px] font-black text-[#3E2723] tracking-widest">
          0{current + 1} <span className="text-stone-300 mx-2">/</span> 0{slides.length}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-stone-200 hover:bg-[#3E2723] hover:text-white transition-all"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-stone-200 hover:bg-[#3E2723] hover:text-white transition-all"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}