'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AcademicCapIcon, BanknotesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import Image from 'next/image';

// --- Assets & Utils ---
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/1200x800/CCCCCC/000000?text=Image+Unavailable";
};

// --- Doodle Components (Matching the Reference Style) ---
const FloatingDoodle = ({ children, className, delay = 0, yOffset = 15 }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1, y: [0, -yOffset, 0] }}
    transition={{ opacity: { duration: 0.8, delay }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay } }}
    className={`${className} pointer-events-none absolute z-0 text-[#003366] opacity-80`}
  >
    {children}
  </motion.div>
);

const WashiTape = () => (
  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-yellow-200/60 rotate-[-2deg] border-x border-dashed border-yellow-400/50 z-20" />
);

const StatCard = ({ stat, index, primaryColor }: any) => {
  const Icons = [AcademicCapIcon, BanknotesIcon, RocketLaunchIcon];
  const Icon = Icons[index % Icons.length];
  const rotation = index % 2 === 0 ? 'rotate-1' : 'rotate-[-1deg]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`relative flex-1 min-w-[180px] bg-white border-2 border-slate-900 p-6 shadow-[6px_6px_0px_#0f172a] ${rotation} z-30`}
    >
      <WashiTape />
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 p-2 rounded-full border border-slate-900 bg-white" style={{ color: primaryColor }}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
      </div>
    </motion.div>
  );
};

export default function HeroSection() {
  const { storeFormData } = useStoreContext();
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, -50]);

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#007bff';
  const activeSlide = storeFormData?.heroSlides?.[0];
  const headline = activeSlide?.headline || "PRIVATE SCHOOL";
  const subline = activeSlide?.subline || "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna";
  const bannerImg = activeSlide?.imageUrl || activeSlide?.productImageUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97";

  const stats = storeFormData?.stats || [
    { label: 'Students', value: '5K+' },
    { label: 'Courses', value: '120+' },
    { label: 'Awards', value: '25+' }
  ];

  return (
    <section className="relative w-full bg-white overflow-hidden font-sans">
      
      {/* 1. Blueprint Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.1]" 
        style={{ 
          backgroundImage: `linear-gradient(#003366 1px, transparent 1px), linear-gradient(90deg, #003366 1px, transparent 1px)`, 
          backgroundSize: '45px 45px',
        }} 
      />

      {/* 2. Doodles & Background Accents */}
      <motion.div style={{ y: yParallax }} className="absolute inset-0 z-0">
         {/* Top Left Rocket Area */}
         <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
         
         <FloatingDoodle className="left-[2%] top-[10%] w-24 md:w-32 rotate-[-10deg]" delay={0.1}>
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3"><path d="M30 70 L50 20 L70 70 Z M40 70 L40 85 M60 70 L60 85" /></svg>
         </FloatingDoodle>

         <FloatingDoodle className="right-[10%] top-[8%] w-16" delay={0.4}>
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4"><path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" /></svg>
         </FloatingDoodle>

         <FloatingDoodle className="right-[5%] top-[25%] w-20 rotate-12" delay={0.6}>
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3"><rect x="30" y="20" width="40" height="60" rx="2" /><path d="M30 40 H70 M30 60 H70" /></svg>
         </FloatingDoodle>
      </motion.div>

      {/* 3. Hero Text Content */}
      <div className="relative z-10 pt-24 pb-16 px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
        <motion.h1 
          className="text-6xl md:text-[100px] font-black text-[#002b5c] mb-6 tracking-tighter uppercase leading-[0.85]"
        >
          {headline}
        </motion.h1>
        
        <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto mb-10 leading-relaxed">
          {subline}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            className="px-8 py-3 bg-[#007bff] text-white font-bold text-sm uppercase rounded-sm shadow-sm hover:brightness-110 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            Register Now!
          </button>
          
          <button 
            className="px-8 py-3 border-2 border-[#007bff] text-[#007bff] font-bold text-sm uppercase rounded-sm bg-white hover:bg-blue-50 transition-all"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Read More
          </button>
        </div>
      </div>

      {/* 4. The S-Curve Transition & Image */}
      <div className="relative w-full mt-10">
        
        {/* 1. We use a container with a background color that matches the curve fill.
            2. We apply a clip-path to the image container.
        */}
        <div 
          className="relative w-full h-[400px] md:h-[650px] overflow-hidden"
          style={{
            /* This creates the "mask". 
              We use the same path data from your SVG to ensure they line up perfectly.
            */
            clipPath: "path('M0,160 C320,40 480,200 960,80 C1280,0 1440,120 1440,120 V800 H0 Z')",
            // Note: I added "V800 H0 Z" to close the shape at the bottom
          }}
        >
          <Image 
            src={bannerImg} 
            alt="Students" 
            fill 
            className="object-cover object-center"
            priority
            loader={customLoader}
            onError={handleImageError}
          />
        </div>

        {/* Keep the SVG Border on top as well! 
            This adds the crisp "stroke" or solid color transition 
            that makes the edge look sharp.
        */}
        <div className="absolute top-0 left-0 w-full z-20 -translate-y-[99%] pointer-events-none">
          <svg 
            viewBox="0 0 1440 160" 
            fill="none" 
            preserveAspectRatio="none" 
            className="w-full h-[80px] md:h-[160px]"
          >
            <path 
              d="M0,160 C320,40 480,200 960,80 C1280,0 1440,120 1440,120" 
              stroke="#002b5c" 
              strokeWidth="8" // This mimics the thick blue line in your reference
              fill="none"
            />
          </svg>
        </div>

        {/* 5. Stats Overlay */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 z-30 w-full max-w-5xl px-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {stats.slice(0, 3).map((stat, i) => (
              <StatCard key={i} stat={stat} index={i} primaryColor={primaryColor} />
            ))}
          </div>
        </div>
      </div>
          
    </section>
  );
}