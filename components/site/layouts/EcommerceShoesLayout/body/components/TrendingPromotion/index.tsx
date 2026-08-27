'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRightIcon, BoltIcon } from '@heroicons/react/24/solid';

interface TrendingProps {
  promotions?: any;
  themeSettings?: any;
}

const dummyTrendingProduct = {
  title: 'THE RUSH V.2',
  description: 'Engineered for speed and urban performance. Experience feather-light comfort and unparalleled energy return. Your new personal best starts now.',
  ctaText: 'Shop The Rush',
  ctaLink: '/ecommerceshoes/products',
  bannerUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  accentColor: '#18181b', 
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 70, damping: 14 } },
};

export default function TrendingPromotion({ promotions, themeSettings }: TrendingProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const product = promotions?.[2] || dummyTrendingProduct;
  const primaryColor = themeSettings?.primaryColor || product.accentColor || '#18181b';
  
  // High-performance Parallax linked strictly to the containing parent element
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const xMove = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"]);

  return (
    <section 
      ref={sectionRef}
      className="relative py-20 bg-zinc-100 dark:bg-zinc-950 transition-colors duration-500 overflow-hidden px-4 sm:px-6 lg:px-8"
    >
      {/* Container Frame matching the Lookbook architecture layout guidelines */}
      <div className="max-w-7xl mx-auto bg-white dark:bg-zinc-900 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden border border-zinc-200/40 dark:border-zinc-800 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.04)] py-16 md:py-24 px-6 sm:px-12 lg:px-16">
        
        {/* --- Kinetic Multi-layered Background Text --- */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden whitespace-nowrap flex items-center select-none opacity-40 dark:opacity-20">
          <motion.h2 
            style={{ x: xMove }}
            className="text-[22vw] font-black uppercase leading-none text-zinc-100 dark:text-zinc-800 tracking-tighter italic font-serif"
          >
            {product.title.split(' ')[0] || 'TRENDING'}
          </motion.h2>
        </div>

        {/* --- Structural Processing Matrix --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* --- LEFT SIDE: Image Display Deck --- */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 order-2 lg:order-1 flex justify-center relative group"
          >
            {/* Engineering Radial Blueprint Backing */}
            <div className="absolute w-72 sm:w-96 aspect-square rounded-full bg-zinc-50 dark:bg-zinc-950/60 border border-dashed border-zinc-200 dark:border-zinc-800 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex items-center justify-center">
              <div className="w-[80%] h-[80%] rounded-full bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200/40 dark:border-zinc-800/20" />
            </div>

            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="relative z-10 w-full max-w-[420px] aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              <img
                src={product.bannerUrl}
                alt={product.title}
                className="w-full h-full object-contain -rotate-12 drop-shadow-[0_30px_45px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_30px_45px_rgba(255,255,255,0.015)]"
              />
            </motion.div>
          </motion.div>

          {/* --- RIGHT SIDE: Copy Frame --- */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left">
            
            {/* Category Taglet */}
            <motion.div variants={itemVariants} className="mb-6">
              <span 
                className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] flex items-center gap-2 bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200/60 dark:border-zinc-800"
              >
                <BoltIcon className="w-3.5 h-3.5 animate-pulse" style={{ color: primaryColor === '#18181b' ? undefined : primaryColor }} />
                System Alert: In Demand
              </span>
            </motion.div>

            {/* Asymmetrical Dynamic Headline Row */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tight text-zinc-900 dark:text-white uppercase"
            >
              {product.title.split(' ').map((word: string, i: number) => (
                <span key={i} className="block last:text-zinc-400 dark:last:text-zinc-500 last:font-normal last:font-serif last:lowercase">
                  {word}{' '}
                </span>
              ))}
            </motion.h1>
            
            {/* Informational Parameter Block */}
            <motion.p 
              variants={itemVariants}
              className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 max-w-md mb-10 font-medium leading-relaxed"
            >
              {product.description}
            </motion.p>

            {/* Micro-Tactile Trigger Capsule */}
            <motion.div variants={itemVariants} className="w-full sm:w-auto">
              <Link href={product.ctaLink || '/ecommerceshoes/products'} passHref>
                <button
                  className="group w-full sm:w-auto relative inline-flex items-center justify-center text-white dark:text-zinc-900 font-black text-[11px] uppercase tracking-widest py-5 px-12 rounded-2xl transition-all duration-300 bg-zinc-900 dark:bg-white hover:opacity-90 active:scale-98 shadow-xl shadow-zinc-950/10 dark:shadow-none"
                  style={{ backgroundColor: primaryColor === '#18181b' ? undefined : primaryColor }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                    {product.ctaText}
                    <ArrowRightIcon className="w-4 h-4 stroke-[2.5] transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </button>
              </Link>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}