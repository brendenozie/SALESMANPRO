'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const dummyPromotionData = {
  title: 'Summer Collection',
  description: 'We have a lot of trendy shoes with wholesale prices in the summer collection.',
  bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  ctaText: 'Explore Collection',
  ctaLink: '/ecommerceshoes/products',
  featureImage1: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
  perks: [
    { label: 'TRENDY' },
    { label: 'POPULAR' },
    { label: 'LATEST' },
  ],
  trustLogos: [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1088px-Adidas_Logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/1187px-Vans-logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Puma-logo-%28text%29.svg/768px-Puma-logo-%28text%29.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/450px-New_Balance_logo.svg.png"
  ],
};

export default function PopularSection({ promotions, themeSettings }: any) {
  const primary = themeSettings?.primaryColor || '#18181b'; // Aligned back to zinc aesthetic or dynamic overrides

  const categoryData = promotions && promotions.length > 0
    ? { ...promotions[0], trustLogos: dummyPromotionData.trustLogos }
    : dummyPromotionData;

  return (
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* LEFT SIDE: Premium Showcase Visual Deck */}
        <div className="w-full lg:w-1/2 flex flex-col items-center relative">
          
          {/* Decorative Engineering Grid Backdrop Elements */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 select-none">
            <div className="absolute w-[120%] h-[120%] bg-zinc-200/40 dark:bg-zinc-900/10 blur-[130px] rounded-full" />
            <div className="w-72 h-72 rounded-full border-2 border-dashed border-zinc-200/60 dark:border-zinc-800/40 absolute animate-[spin_40s_linear_infinite]" />
            <div className="w-[420px] h-[420px] rounded-full border border-zinc-200/40 dark:border-zinc-800/20 absolute" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            className="relative w-full aspect-square max-w-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <motion.div 
              whileHover={{ scale: 1.04, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-full h-full"
            >
              <Image
                src={categoryData.bannerUrl || ''}
                alt={categoryData.title}
                fill
                priority
                loader={loader}
                className="object-contain -rotate-12 drop-shadow-[0_35px_35px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_35px_35px_rgba(255,255,255,0.03)]"
              />
            </motion.div>
          </motion.div>

          {/* Perks Row Integrated Seamlessly with the Layout System Badges */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-6 z-10">
            {categoryData.perks.map((perk: any, idx: number) => (
              <span
                key={idx}
                className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 shadow-md shadow-zinc-200/50 dark:shadow-none border border-transparent dark:border-zinc-800"
              >
                ⚡ {perk.label}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: Information Block Frame */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 border border-transparent dark:border-zinc-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)]"
          >
            {/* Top Identity Tag */}
            <div className="flex items-center gap-2 mb-4">
              <CheckBadgeIcon className="w-4 h-4 text-zinc-900 dark:text-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">
                Premium Design Tier
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-[1.05]">
              {categoryData.title}
            </h2>
            
            <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-base md:text-lg leading-relaxed font-medium">
              {categoryData.description}
            </p>

            {/* Split Display Panel Block */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              
              {/* Left Secondary Concept Card */}
              <div className="relative w-full sm:w-1/2 h-36 bg-zinc-50 dark:bg-zinc-950 rounded-[2rem] p-4 flex justify-center items-center overflow-hidden border border-transparent dark:border-zinc-800/80 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image
                  src={categoryData.featureImage1 || ''}
                  alt="Feature Silhouette Variant"
                  width={140}
                  height={140}
                  loader={loader}
                  className="object-contain -rotate-6 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 drop-shadow-md"
                />
              </div>

              {/* Action Button - Converted from rotated text to dynamic tactile container */}
              <Link href={categoryData.ctaLink || '/ecommerceshoes/products'} className="w-full sm:w-1/2 group">
                <div 
                  style={{ backgroundColor: primary === '#18181b' ? undefined : primary }}
                  className="h-36 w-full rounded-[2rem] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex flex-col justify-between p-6 cursor-pointer transition-all duration-300 shadow-xl shadow-zinc-950/10 dark:shadow-none hover:opacity-90 hover:scale-[1.02]"
                >
                  <div className="flex justify-end w-full">
                    <div className="h-9 w-9 rounded-full bg-white/10 dark:bg-zinc-900/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-300">
                      <ArrowUpRightIcon className="h-4 w-4 stroke-[2.5]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-0.5">Secure Launch Access</p>
                    <span className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                      {categoryData.ctaText}
                    </span>
                  </div>
                </div>
              </Link>

            </div>

            {/* Brand Trust Strip - Wrapped in modern continuous responsive row format */}
            <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800/60">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
                Supported Brand Ecosystems
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 grayscale opacity-40 dark:invert transition-all hover:opacity-70">
                {categoryData.trustLogos.map((logo: string, idx: number) => (
                  <div key={idx} className="h-5 relative w-12 flex items-center">
                    <Image 
                      src={logo || ''} 
                      loader={loader}
                      alt="Brand Partner Identifier" 
                      fill
                      className="object-contain" 
                    />
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </section>
  );
}