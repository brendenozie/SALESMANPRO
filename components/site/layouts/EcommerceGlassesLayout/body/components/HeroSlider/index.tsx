'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { EyeIcon, SunIcon, SparklesIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'; 
import Image from 'next/image';
import Link from 'next/link';
import { HeroSlide } from '@/types/typings';

// Enhanced Mock Data
const opticalSlides = [
  {
    id: '1',
    headline: 'CLARITY & STYLE',
    highlight: 'ALL IN ONE',
    subline: '2026 LUXE COLLECTION',
    description: 'Bespoke eyewear crafted for those who see the world differently. Merging clinical precision with runway aesthetics.',
    ctaText: 'Explore Collection',
    imageUrl: 'https://dozi4r4ug9739.cloudfront.net/images/1772312106481-zeelool-glasses-aShmUdodJ3w-unsplash.jpg', // Better High-Res Model
    productImage: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=500&auto=format&fit=crop', // Isolated Glasses
    productName: 'Metal Lennons',
    price: '$175.00',
    oldPrice: '$199.00',
    accentColor: '#0D4C4F'
  }
];

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const transitionDuration = 0.8;
const autoAdvanceDelay = 5000;

export interface HeroSliderProps {
  heroSlides: HeroSlide[] | null;
  themeSettings: any;
}

// Custom Leaf SVG for "Palm Free"
const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10a9.99 9.99 0 009.95-9H20a8 8 0 01-8-8zM11 14h2v2h-2v-2zm0-8h2v6h-2V6z" />
  </svg>
);

export default function HeroSlider({ heroSlides, themeSettings }: HeroSliderProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Parallax Effect Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 50;
    const moveY = (clientY - window.innerHeight / 2) / 50;
    setMousePos({ x: moveX, y: moveY });
  };

  return (
    <section 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center overflow-hidden bg-[#F9F6F2] py-20 lg:py-20"
    >
      {/* 1. HUGE BACKGROUND TYPOGRAPHY (The "Wow" Factor) */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
        <motion.h2 
          style={{ x: mousePos.x * -1, y: mousePos.y * -1 }}
          className="text-[25vw] font-black text-black/[0.03] leading-none whitespace-nowrap"
        >
          VISIONARY
        </motion.h2>
      </div>

      {/* 2. DYNAMIC ACCENT SHAPES */}
      <motion.div 
        animate={{ 
          x: mousePos.x * 2, 
          y: mousePos.y * 2,
          rotate: mousePos.x 
        }}
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#F3A852] opacity-10 rounded-full blur-[100px]"
      />

      <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT CONTENT */}
          <div className="lg:col-span-5 space-y-10 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="h-[1px] w-12 bg-[#F3A852]" />
                <span className="text-xs font-bold tracking-[0.4em] text-[#F3A852] uppercase">
                  {heroSlides && heroSlides.length > 0 ? heroSlides[0].subline : 'Default Subline'}
                </span>
              </div>
              
              <h1 className="text-7xl md:text-8xl xl:text-9xl font-serif text-gray-900 leading-[0.85] tracking-tighter mb-8">
                {heroSlides && heroSlides.length > 0 ? heroSlides[0].headline : 'Default Headline'} <br />
                <span className="text-transparent italic stroke-text">{opticalSlides[0].highlight}</span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-md leading-relaxed font-light">
                {opticalSlides[0].description}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-6"
            >
              <Link
                href="/glassesecommerce/products"
                className="group relative px-10 py-5 bg-[#0D4C4F] text-white overflow-hidden"
              >
                <motion.div className="absolute inset-0 bg-black translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 font-bold uppercase tracking-widest text-sm flex items-center gap-3">
                  {opticalSlides[0].ctaText}
                  <ShoppingBagIcon className="w-5 h-5" />
                </span>
              </Link>
              
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <Image src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" width={40} height={40} loader={imageLoader} />
                  </div>
                ))}
                <div className="pl-6 flex flex-col justify-center">
                  <span className="text-sm font-bold text-gray-900 leading-none">46K+ Users</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Styled Weekly</span>
                </div>
              </div>
            </motion.div>

            {/* MINIMAL USPs */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gray-200/50">
                <USPItem icon={<SunIcon className="w-5 h-5"/>} label="UV400" />
                <USPItem icon={<EyeIcon className="w-5 h-5"/>} label="Anti-Blue" />
                <USPItem icon={<SparklesIcon className="w-5 h-5"/>} label="Anti-Glare" />
            </div>
          </div>

          {/* RIGHT VISUALS (The Masterpiece) */}
          <div className="lg:col-span-7 relative order-1 lg:order-2">
            <div className="relative w-full aspect-[4/5] md:aspect-square">
              
              {/* Main Image with Frame */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ x: mousePos.x * 0.5, y: mousePos.y * 0.5 }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className="relative z-20 w-full h-full rounded-[40px] overflow-hidden shadow-2xl"
              >
                <Image 
                  src={opticalSlides[0].imageUrl || "https://dozi4r4ug9739.cloudfront.net/images/1772312106481-zeelool-glasses-aShmUdodJ3w-unsplash.jpg"} 
                  loader={imageLoader}
                  alt="Model"
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </motion.div>

              {/* FLOATING PRODUCT CARD */}
              <motion.div 
                animate={{ 
                    y: [0, -20, 0],
                    x: mousePos.x * -1.5
                }}
                transition={{ 
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute -bottom-10 -left-10 md:left-[-15%] z-30 bg-white p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] max-w-[280px]"
              >
                <div className="absolute top-4 right-4 bg-[#F3A852] text-white text-[10px] font-black px-2 py-0.5">SALE</div>
                <div className="h-32 w-full relative mb-4">
                  <Image src={opticalSlides[0].productImage} loader={imageLoader} alt="Product" fill className="object-contain" />
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-[#F3A852] font-black tracking-widest uppercase">New Arrival</p>
                    <h3 className="text-xl font-serif text-gray-900">{opticalSlides[0].productName}</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-[#0D4C4F]">{opticalSlides[0].price}</span>
                        <span className="text-sm text-gray-400 line-through font-light">{opticalSlides[0].oldPrice}</span>
                    </div>
                </div>
              </motion.div>

              {/* SECONDARY FLOATING ELEMENT (LENS DETAIL) */}
              <motion.div 
                animate={{ y: mousePos.y * -2, x: mousePos.x * 1 }}
                className="absolute top-10 -right-8 z-30 bg-black text-white p-5 rounded-2xl shadow-xl hidden md:block"
              >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-[#F3A852]" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-widest opacity-60">Tech</p>
                        <p className="text-sm font-bold">HD Polished Lens</p>
                    </div>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .stroke-text {
          -webkit-text-stroke: 1px #0D4C4F;
        }
      `}</style>
    </section>
  );
}

function USPItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-900">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
    </div>
  );
}