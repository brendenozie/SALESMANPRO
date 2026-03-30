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
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const slides = [
  {
    title: "Tail-Wagging",
    suffix: "Comfort",
    description: "Because your best friend deserves a bed that feels like a hug. Explore our vet-approved orthopedic collection.",
    image: "https://images.unsplash.com/photo-1541599540903-216a46ca1df0?auto=format&fit=crop&w=1000&q=90",
    productImg: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=90",
    color: "#FFB344", // Warm Orange
    accent: "bg-orange-50",
    tag: "New for Puppies"
  },
  {
    title: "Pure Purr",
    suffix: "Luxury",
    description: "Turn your home into a feline playground. Durable, stylish, and cat-tested climbing trees.",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=90",
    productImg: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=400&q=90",
    color: "#9575CD", // Gentle Purple
    accent: "bg-purple-50",
    tag: "Cat Favorites"
  }
];

export default function WelcomingPetHero({ heroSlides }: { heroSlides?: any[] }) {
  const [index, setIndex] = useState(0);

  const  slidesToUse = heroSlides && heroSlides.length > 0 ? heroSlides.map(slide => ({
    title: slide.title || "Tail-Wagging",
    suffix: slide.suffix || "Comfort",
    description: slide.description || "Because your best friend deserves a bed that feels like a hug. Explore our vet-approved orthopedic collection.",
    image: slide.image || "https://images.unsplash.com/photo-1541599540903-216a46ca1df0?auto=format&fit=crop&w=1000&q=90",
    productImg: slide.productImg || "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=400&q=90",
    color: slide.color || "#FFB344",
    accent: slide.accent || "bg-orange-50",
    tag: slide.tag || "New for Puppies"
  })) : slides;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slidesToUse.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen bg-[#FFFDF9] flex items-center overflow-hidden">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[#F7F3EE] rounded-l-[100px] hidden lg:block z-0" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* LEFT CONTENT: EMOTIONAL HOOK */}
          <div className="lg:col-span-6 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
              >
                {/* Community Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    <span className="font-bold text-slate-900">50k+</span> Happy Pet Parents
                  </p>
                </div>

                <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6">
                  {slidesToUse[index].title} <br />
                  <span style={{ color: slidesToUse[index].color }}>{slidesToUse[index].suffix}</span>
                </h1>

                <p className="text-xl text-slate-600 max-w-lg mb-10 leading-relaxed">
                  {slidesToUse[index].description}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/petsecommerce/products"
                    style={{ backgroundColor: slidesToUse[index].color }}
                    className="px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-orange-200 hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Shop for My Pet
                  </Link>
                  <Link href="/petsecommerce/products" className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-lg hover:bg-slate-50 transition-all flex items-center gap-2">
                    Find the Right Fit
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </div>

                {/* Trust Signals */}
                <div className="mt-12 grid grid-cols-2 gap-4 sm:flex sm:gap-8">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">Eco-Friendly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-tight">30-Day Returns</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT CONTENT: THE VISUAL STORY */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-square max-w-[550px] mx-auto">
              
              {/* Main Lifestyle Image with Blob Mask */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                  className="w-full h-full relative z-10"
                >
                  <div className="w-full h-full overflow-hidden rounded-[60px] shadow-2xl rotate-3">
                    <img src={slidesToUse[index].image} alt="Pet Hero" className="w-full h-full object-cover -rotate-3 scale-110" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating Product Card */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-10 bottom-10 z-20 bg-white p-4 rounded-3xl shadow-2xl border border-slate-50 flex gap-4 max-w-[240px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src={slidesToUse[index].productImg} alt="product" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 text-amber-400" />)}
                  </div>
                  <p className="text-xs font-black text-slate-900 leading-tight mb-1">{slidesToUse[index].tag}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Limited Stock</p>
                </div>
              </motion.div>

              {/* Floating "Love" Badge */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-6 -right-6 z-20 w-24 h-24 bg-rose-500 rounded-full flex flex-col items-center justify-center text-white shadow-xl rotate-12"
              >
                <HeartIcon className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase">Made w/ Love</span>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}