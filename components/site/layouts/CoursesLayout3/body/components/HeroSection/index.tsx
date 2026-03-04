'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';

// --- Assets & Utils ---
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/600x400/CCCCCC/000000?text=School+Image";
};

export default function HeroSection({ storeFormData }: any) {
  // const { storeFormData } = useStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#22c55e'; // Green from reference
  const activeSlide = storeFormData?.heroSlides?.[0];
  const headline = activeSlide?.headline || "Private School Admission";
  const subline = activeSlide?.subline || "Open admission for kids private school. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.";
  const bannerImg = activeSlide?.imageUrl || activeSlide?.productImageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da07bb5e?q=80&w=2022&auto=format&fit=crop";

  return (
    <section className="relative w-full min-h-[700px] bg-white overflow-hidden font-sans flex items-center">
      
      {/* 1. Blueprint Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `linear-gradient(#003366 1px, transparent 1px), linear-gradient(90deg, #003366 1px, transparent 1px)`, 
          backgroundSize: '40px 40px',
        }} 
      />

      {/* 2. Floating School Elements (Absolute Decorative) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Pencil - Top Right */}
        <motion.img 
          animate={{ y: [0, -10, 0], rotate: [12, 15, 12] }}
          transition={{ duration: 4, repeat: Infinity }}
          src="https://cdn-icons-png.flaticon.com/512/583/583802.png" 
          className="absolute top-[15%] right-[5%] w-24 md:w-32 opacity-80"
          alt="pencil"
        />
        {/* Ruler - Bottom Right */}
        <motion.img 
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          src="https://cdn-icons-png.flaticon.com/512/3259/3259454.png" 
          className="absolute bottom-[10%] right-[10%] w-40 md:w-64 rotate-[-15deg] opacity-60"
          alt="ruler"
        />
        {/* Clips/Supplies - Bottom Center */}
        <img 
          src="https://cdn-icons-png.flaticon.com/512/2921/2921179.png" 
          className="absolute bottom-[5%] left-[40%] w-16 opacity-40" 
          alt="clip"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* 3. Text Content Area */}
        <div className="flex flex-col space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-4">
              {headline}
            </h1>
            <h3 className="text-xl md:text-2xl font-bold text-slate-700 mb-4">
              Open admission for kids private school
            </h3>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-xl">
              {subline}
            </p>
          </motion.div>

          {/* Action Buttons - Neubrutalist Gradient Style */}
          <div className="flex flex-wrap gap-4 pt-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-md text-white font-bold text-lg shadow-lg bg-gradient-to-r from-orange-400 to-orange-500"
            >
              Learn more
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-md text-white font-bold text-lg shadow-lg bg-gradient-to-r from-yellow-400 to-yellow-500"
            >
              Register now
            </motion.button>
          </div>

          {/* Bottom Small Text with Icons */}
          <div className="flex flex-col sm:flex-row gap-8 pt-8 border-t border-slate-100">
            <div className="flex items-start gap-3 max-w-[240px]">
              <span className="text-2xl">🔍</span>
              <p className="text-xs text-slate-500 leading-tight">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit sed diam nonummy.
              </p>
            </div>
            <div className="flex items-start gap-3 max-w-[240px]">
              <span className="text-2xl">📊</span>
              <p className="text-xs text-slate-500 leading-tight">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit sed diam nonummy.
              </p>
            </div>
          </div>
        </div>

        {/* 4. The Framed Image Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          {/* The White Border Frame */}
          <div className="relative p-3 bg-white shadow-2xl rounded-sm rotate-[2deg] border border-slate-100">
            <div className="relative w-[300px] h-[200px] md:w-[500px] md:h-[350px] overflow-hidden rounded-sm">
              <Image 
                src={bannerImg} 
                alt="Students with globe" 
                fill 
                className="object-cover"
                priority
                loader={customLoader}
                onError={handleImageError}
              />
            </div>
          </div>
          
          {/* Extra Decorative Element Behind Image */}
          <div className="absolute -z-10 top-10 right-10 w-full h-full bg-slate-100 rounded-lg rotate-[-2deg]" />
        </motion.div>

      </div>
    </section>
  );
}