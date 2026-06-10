'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  StarIcon,
  HandThumbUpIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';
import { ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';

const slides = [
  {
    title: "Tail-Wagging",
    suffix: "Comfort",
    description: "Because your best friend deserves a bed that feels like a hug. Explore our vet-approved orthopedic collection.",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=90",
    productImg: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=90",
    color: "#FFB344", 
    accent: "bg-orange-50",
    tag: "New for Puppies",
    stat: "98% Better Sleep"
  },
  {
    title: "Pure Purr",
    suffix: "Luxury",
    description: "Turn your home into a feline playground. Durable, stylish, and cat-tested climbing trees.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=90",
    productImg: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=400&q=90",
    color: "#9575CD", 
    accent: "bg-purple-50",
    tag: "Cat Favorites",
    stat: "Durable Sisal Fiber"
  }
];

export default function WelcomingPetHero({ heroSlides }: { heroSlides?: any[] }) {
  const [index, setIndex] = useState(0);

  const slidesToUse = heroSlides && heroSlides.length > 0 ? heroSlides.map(slide => ({
    title: slide.title || slide.headline || "Tail-Wagging",
    suffix: slide.suffix || slide.badgeText || "Comfort",
    description: slide.description || slide.subline || "Because your best friend deserves a bed that feels like a hug. Explore our vet-approved orthopedic collection.",
    image: slide.image || slide.imageUrl || "https://images.unsplash.com/photo-1541599540903-216a46ca1df0?auto=format&fit=crop&w=1000&q=90",
    productImg: slide.productImg || slide.productImageUrl || "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=90",
    color: slide.color || "#FFB344",
    accent: slide.accent || "bg-orange-50",
    tag: slide.tag || "New for Puppies",
    stat: slide.stat || "98% Better"
  })) : slides;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slidesToUse.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slidesToUse.length]);

  return (
    // Replaced min-h-[90vh] with 100svh to completely lock out mobile browser navbar jumping
    <section className="relative min-h-[100svh] lg:h-screen lg:min-h-[780px] bg-[#FFFDF9] flex items-center overflow-hidden pt-28 pb-16 lg:py-0">
      
      {/* DECORATIVE BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="90" cy="10" r="20" fill={slidesToUse[index].color} opacity="0.1" />
          <circle cx="10" cy="90" r="15" fill={slidesToUse[index].color} opacity="0.05" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT CONTENT CONTAINER */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-5 md:space-y-6 text-center lg:text-left"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm border border-slate-100">
                  <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">Premium Pet Duka</span>
                </div>

                {/* Fluid Typography Adjustments for Small Screens */}
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-8xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  {slidesToUse[index].title} <br className="hidden sm:inline" />
                  <span className="relative inline-block mt-1 sm:mt-2">
                    <span className="relative z-10" style={{ color: slidesToUse[index].color }}>
                      {slidesToUse[index].suffix}
                    </span>
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      className="absolute bottom-1.5 md:bottom-2 left-0 h-2.5 md:h-4 -z-10 opacity-20"
                      style={{ backgroundColor: slidesToUse[index].color }}
                    />
                  </span>
                </h1>

                <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-md lg:max-w-lg mx-auto lg:ml-0 leading-relaxed font-medium">
                  {slidesToUse[index].description}
                </p>

                {/* Mobile Button Configurations */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
                  <Link
                    href="/shop"
                    style={{ backgroundColor: slidesToUse[index].color }}
                    className="group px-7 py-4 rounded-2xl text-white font-bold text-base md:text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                  >
                    <ShoppingBagIcon className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                    Shop Now
                  </Link>
                  <Link href="/about" className="px-7 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-800 font-bold text-base md:text-lg hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    Our Story
                    <PlayIcon className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>

                {/* Slider Pagination Controls */}
                <div className="flex gap-2 pt-6 justify-center lg:justify-start">
                  {slidesToUse.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${index === i ? 'w-10' : 'w-3 bg-slate-200'}`}
                      style={{ backgroundColor: index === i ? slidesToUse[index].color : undefined }}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT CONTENT COLUMN (VISUAL ARTWORK) */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative px-4 sm:px-6">
            <div className="relative w-full aspect-square max-w-[290px] sm:max-w-[420px] lg:max-w-[480px] mx-auto">
              
              {/* Animated Floating Organic Background Shape */}
              <motion.div 
                animate={{ 
                  borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 70%"],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-15 scale-105 pointer-events-none"
                style={{ backgroundColor: slidesToUse[index].color }}
              />

              {/* Main Image Container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.6 }}
                  className="relative z-10 w-full h-full p-2 sm:p-4"
                >
                  <div className="w-full h-full rounded-[32px] sm:rounded-[60px] lg:rounded-[80px] overflow-hidden shadow-2xl border-[8px] sm:border-[12px] border-white">
                    <img 
                      src={slidesToUse[index].image} 
                      alt="Happy Pet" 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-105" 
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating Trust Metric Card (Hidden on small screens to reduce visual clutter) */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                key={`stat-${index}`}
                className="absolute -right-2 top-1/4 z-20 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-50 hidden sm:block"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${slidesToUse[index].color}20` }}>
                    <HandThumbUpIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: slidesToUse[index].color }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Trust Score</p>
                    <p className="text-xs sm:text-sm font-black text-slate-800">{slidesToUse[index].stat || "High Quality"}</p>
                  </div>
                </div>
              </motion.div>

              {/* Bottom Interactive Product Badge Container */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                // Tamed absolute positioning offsets from -left-6 to balanced responsive parameters to avoid page edge clipping
                className="absolute -left-2 -bottom-2 sm:-left-4 sm:-bottom-4 lg:-left-6 lg:-bottom-6 z-20 bg-slate-900 text-white p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-3 sm:gap-4 border-4 border-white"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 overflow-hidden shrink-0">
                  <img src={slidesToUse[index].productImg} alt="Featured Product Preview" className="w-full h-full object-cover" />
                </div>
                <div className="pr-1 sm:pr-2">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{slidesToUse[index].tag}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />)}
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}