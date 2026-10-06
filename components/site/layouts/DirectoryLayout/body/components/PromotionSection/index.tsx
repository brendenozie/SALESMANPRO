'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { IPromotion } from '@/types/typings';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/solid';

// ---------------------------------------------------------
// UTILS & MOCK DATA
// ---------------------------------------------------------

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const fallbackBanners = [
  {
    id: 'fallback-summer',
    label: 'LIMITED TIME',
    title: 'Summer Clearance Event',
    description: 'Up to 50% off on all seasonal favorites. Don’t miss out.',
    imgSrc: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
    ctaText: 'Shop Sale',
    ctaLink: '/shop/sale',
    theme: 'from-orange-500/20 to-red-600/20' // Warm overlay
  },
  {
    id: 'fallback-winter',
    label: 'NEW DROP',
    title: 'The Winter Edit',
    description: 'Essentials designed to keep you warm and stylish.',
    imgSrc: 'https://images.unsplash.com/photo-1485230405346-71acb9518d9c?q=80&w=2094&auto=format&fit=crop',
    ctaText: 'View Collection',
    ctaLink: '/shop/winter',
    theme: 'from-blue-500/20 to-indigo-600/20' // Cool overlay
  },
];

interface PromotionProps {
  promotions?: IPromotion[];
}

export default function PromotionSection({ promotions: dynamicPromotions }: PromotionProps) {
  
  // 1. DATA PREP
  const bannersToRender = Array.isArray(dynamicPromotions) && dynamicPromotions.length > 0
    ? dynamicPromotions.map((promo, idx) => ({
        id: promo.id,
        label: promo.code || (idx === 0 ? 'FEATURED' : 'OFFER'),
        title: promo.title,
        description: promo.description,
        imgSrc: promo.bannerUrl || 'https://placehold.co/1200x800',
        ctaText: promo.ctaText || 'Explore',
        ctaLink: promo.ctaLink || '#',
        // Alternate themes based on index
        theme: idx % 2 === 0 
          ? 'from-emerald-500/20 to-teal-900/40' 
          : 'from-purple-500/20 to-indigo-900/40'
      }))
    : fallbackBanners;

  const isSingle = bannersToRender.length === 1;

  // 2. ANIMATION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2 } 
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 50, damping: 20 } 
    }
  };

  return (
    <section className="relative py-24 bg-white dark:bg-gray-950 overflow-hidden font-sans">
      
      {/* Background Texture (Noise) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Don't Miss Out
            </h2>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              Exclusive offers curated just for you.
            </p>
          </div>
          {/* Decorative Line */}
          <div className="hidden md:block flex-1 h-px bg-gray-200 dark:bg-gray-800 mx-8 mb-4 relative">
             <div className="absolute right-0 -top-1 w-2 h-2 bg-gray-900 dark:bg-white rounded-full" />
          </div>
        </motion.div>

        {/* Banners Grid */}
        <motion.div 
          className={clsx(
            "grid gap-6",
            isSingle ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
          )}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {bannersToRender.map((banner) => (
            <motion.div
              key={banner.id}
              variants={cardVariants}
              className={clsx(
                "group relative overflow-hidden rounded-[2.5rem] shadow-2xl isolate cursor-pointer",
                isSingle ? "h-[500px] lg:h-[600px]" : "h-[450px] lg:h-[550px]"
              )}
            >
              <Link href={banner.ctaLink} className="block h-full w-full">
                
                {/* 1. BACKGROUND IMAGE (Zoom Effect) */}
                <div className="absolute inset-0 z-0">
                  <Image decoding="async"
                    src={banner.imgSrc}
                    alt={banner.title}
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                  {/* Dark Overlay Gradient for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-70" />
                  
                  {/* Colored Tint Overlay (adds vibe) */}
                  <div className={clsx("absolute inset-0 bg-gradient-to-br mix-blend-overlay opacity-40", banner.theme)} />
                </div>

                {/* 2. BADGE (Top Left) */}
                <div className="absolute top-8 left-8 z-20">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                    <SparklesIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold tracking-widest text-white uppercase">
                      {banner.label}
                    </span>
                  </div>
                </div>

                {/* 3. TEXT CONTENT (Bottom Left) */}
                <div className="absolute bottom-0 left-0 z-20 p-8 md:p-12 w-full max-w-2xl flex flex-col items-start">
                  
                  <motion.h3 
                    className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-[1.1] mb-4 drop-shadow-lg"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {banner.title}
                  </motion.h3>
                  
                  <p className="text-lg text-gray-200 mb-8 line-clamp-2 max-w-md font-medium">
                    {banner.description}
                  </p>

                  {/* 4. CTA BUTTON */}
                  <div className="flex items-center gap-4">
                    <motion.button
                      className="relative overflow-hidden group/btn flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-sm tracking-wide transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="relative z-10">{banner.ctaText}</span>
                      <ArrowRightIcon className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      
                      {/* Button Fill Effect */}
                      <div className="absolute inset-0 bg-gray-100 transform scale-x-0 origin-left group-hover/btn:scale-x-100 transition-transform duration-300 ease-out" />
                    </motion.button>
                  </div>
                </div>

              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}