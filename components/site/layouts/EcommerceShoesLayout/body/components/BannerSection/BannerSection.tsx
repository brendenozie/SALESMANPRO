'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface BannerSectionProps {
  promotions?: any[];
  themeSettings?: any;
}

// --- Fallback for when no promo is provided ---
const dummyBanner = {
  title: 'PERFORMANCE FIRST',
  subtitle: 'The Apex Drop',
  description:
    'Forget comfort zones. This collection is stripped down, ultra-light, and engineered for maximum speed and raw power. Get ready to break records.',
  ctaText: 'Unlock Speed',
  ctaLink: '/shop/apex',
  bannerUrl:
    'https://images.unsplash.com/photo-1622327599042-3714571d0548?auto=format&fit=crop&w=1500&q=80', // Close-up, raw texture image
  secondaryImage:
    'https://images.unsplash.com/photo-1626027551062-a27926b66804?auto=format&fit=crop&w=1500&q=80', // A technical or schematic image
  themePrimary: '#FF0000', // Striking Red
  themeSecondary: '#F7F7F7', // Off-White/Light Gray
  themeAccent: '#000000', // Black for text and contrast
};

export default function BannerSection({ promotions = [], themeSettings = {} }: BannerSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Pick third promotion (or fallback)
  const promo = promotions?.[2] || dummyBanner;

  // Theme colors hierarchy: promo > themeSettings > fallback
  const primary = promo.themePrimary || themeSettings?.primaryColor || '#FF0000';
  const secondary = promo.themeSecondary || themeSettings?.secondaryColor || '#F7F7F7';
  const accent = promo.themeAccent || themeSettings?.accentColor || '#000000';
  
  // Text color based on secondary background (assuming it's light)
  const textColor = accent; 

  return (
    <section
      className="relative min-h-[500px] lg:min-h-[70vh] flex items-stretch border-8 border-black shadow-2xl"
      style={{
        backgroundColor: secondary,
      }}
    >
      {/* --- Left Block: Image & Accent --- */}
      <div className="relative w-full lg:w-1/2 overflow-hidden flex items-end justify-start p-10 md:p-16"
           style={{ backgroundColor: primary }}>
        
        {/* Main Image - Full bleed with bold color overlay for mood */}
        <div className="absolute inset-0 z-0">
          <img
            src={promo.bannerUrl || dummyBanner.bannerUrl}
            alt={promo.title || 'Primary Banner Image'}
            className="w-full h-full object-cover opacity-30 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ filter: 'grayscale(100%)' }} // Black and white image under red
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x600/FF0000/000000?text=CORE+VISUAL'; }}
          />
        </div>
        
        {/* Secondary Image - Technical detail (Hidden on small screens) */}
        <div className="absolute top-10 right-10 z-10 hidden md:block w-32 h-32 lg:w-40 lg:h-40 border-4 border-black p-2 bg-white/50 backdrop-blur-sm">
          <img
            src={promo.secondaryImage || dummyBanner.secondaryImage}
            alt="Technical Detail"
            className="w-full h-full object-cover object-center"
            onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/000000/F7F7F7?text=DETAIL'; }}
          />
        </div>
        
        {/* Watermark/Subtitle in High Contrast */}
        <p className="relative z-20 text-4xl lg:text-5xl font-extrabold text-black opacity-90 rotate-[-90deg] origin-bottom-left whitespace-nowrap bottom-[-50px] left-0">
          {promo.subtitle || 'BRANDING'}
        </p>
      </div>

      {/* --- Right Block: Content & CTA --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-10 md:p-16 relative z-10">
        
        {/* Title Block with Text Mask Effect (Captivating) */}
        <div className="relative overflow-hidden mb-6">
            <h1 
                className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black uppercase leading-tight transform hover:scale-[1.01] transition-transform duration-300 ease-out"
                style={{ color: accent, WebkitTextStroke: `2px ${primary}` }}
            >
                {/* The main title text */}
                {promo.title || 'BOLD STATEMENT'}
            </h1>
            
            {/* The colored mask layer that shifts on hover for an engaging reveal */}
            <h1 
                className="absolute inset-0 text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black uppercase leading-tight transition-transform duration-300 ease-out transform translate-x-0 group-hover:translate-x-4"
                style={{ color: primary }}
            >
                {promo.title || 'BOLD STATEMENT'}
            </h1>
        </div>

        {/* Description (Intuitive) */}
        {promo.description && (
          <p className="mt-4 text-xl font-medium max-w-lg" style={{ color: textColor }}>
            {promo.description}
          </p>
        )}

        {/* CTA Button (Intuitive & Engaging) */}
        {promo.ctaLink && (
          <Link href={promo.ctaLink} passHref>
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="mt-10 px-10 py-4 border-4 font-extrabold text-xl shadow-brutal transform transition-all duration-200 ease-in-out hover:translate-x-1 hover:translate-y-1"
              style={{
                backgroundColor: primary,
                color: secondary,
                borderColor: accent,
                // Custom "lifted" shadow for Neo-Brutalism
                boxShadow: `8px 8px 0px ${accent}`,
              }}
            >
              {isHovered ? 'ACCESS GRANTED' : promo.ctaText || 'Shop Now'}
            </button>
          </Link>
        )}
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-3" style={{ backgroundColor: primary }} />
      </div>
      
    </section>
  );
}