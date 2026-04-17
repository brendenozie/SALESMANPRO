'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
// Hero Icons as per saved preference
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
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=90",
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
  // const slidesToUse = heroSlides && heroSlides.length > 0 ? heroSlides : slides;
  const  slidesToUse = heroSlides && heroSlides.length > 0 ? heroSlides.map(slide => ({
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
    <section className="relative min-h-[90vh] lg:min-h-screen bg-[#FFFDF9] flex items-center overflow-hidden py-12 lg:py-0">
      
      {/* DECORATIVE BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="90" cy="10" r="20" fill={slidesToUse[index].color} opacity="0.1" />
          <circle cx="10" cy="90" r="15" fill={slidesToUse[index].color} opacity="0.05" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-100">
                  <SparklesIcon className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Premium Pet Duka</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 leading-[1.05] tracking-tight">
                  {slidesToUse[index].title} <br />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10" style={{ color: slidesToUse[index].color }}>
                      {slidesToUse[index].suffix}
                    </span>
                    <motion.span 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      className="absolute bottom-2 left-0 h-4 -z-10 opacity-20"
                      style={{ backgroundColor: slidesToUse[index].color }}
                    />
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed font-medium">
                  {slidesToUse[index].description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    href="/shop"
                    style={{ backgroundColor: slidesToUse[index].color }}
                    className="group px-8 py-5 rounded-2xl text-white font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    <ShoppingBagIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    Shop Now
                  </Link>
                  <Link href="/about" className="px-8 py-5 rounded-2xl bg-white border-2 border-slate-100 text-slate-800 font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    Our Story
                    <PlayIcon className="w-5 h-5 text-slate-400" />
                  </Link>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-2 pt-8">
                  {slidesToUse.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ${index === i ? 'w-12' : 'w-4 bg-slate-200'}`}
                      style={{ backgroundColor: index === i ? slidesToUse[index].color : undefined }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT CONTENT: VISUALS */}
          <div className="lg:col-span-6 order-1 lg:order-2 relative">
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              
              {/* Background Organic Shape */}
              <motion.div 
                animate={{ 
                  borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 70%"],
                  rotate: [0, 90, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20 scale-110"
                style={{ backgroundColor: slidesToUse[index].color }}
              />

              {/* Main Image Container */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10 w-full h-full p-4"
                >
                  <div className="w-full h-full rounded-[40px] md:rounded-[80px] overflow-hidden shadow-2xl border-[12px] border-white">
                    <img 
                      src={slidesToUse[index].image} 
                      alt="Pet Hero" 
                      className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-110" 
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating Stat Card */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                key={`stat-${index}`}
                className="absolute -right-4 top-1/4 z-20 bg-white p-5 rounded-3xl shadow-xl border border-slate-50 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: `${slidesToUse[index].color}20` }}>
                    <HandThumbUpIcon className="w-6 h-6" style={{ color: slidesToUse[index].color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Trust Score</p>
                    <p className="text-sm font-black text-slate-800">{slidesToUse[index].stat || "High Quality"}</p>
                  </div>
                </div>
              </motion.div>

              {/* Product Badge */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-6 -bottom-6 z-20 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl flex items-center gap-4 border-4 border-white"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 overflow-hidden shrink-0">
                  <img src={slidesToUse[index].productImg} alt="Quick View" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">{slidesToUse[index].tag}</p>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 text-amber-400" />)}
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