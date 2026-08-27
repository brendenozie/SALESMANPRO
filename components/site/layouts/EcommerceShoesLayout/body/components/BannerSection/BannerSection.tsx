'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion'; // Using Framer Motion for entrance effects

interface BannerSectionProps {
  promotions?: any[];
  themeSettings?: any;
}

// --- Fallback for when no promo is provided ---
const dummyBanner = {
  title: 'THE LEGEND REBORN',
  subtitle: 'Limited Edition Drop',
  description:
    'Experience the fusion of heritage design and cutting-edge technology. This exclusive release offers unparalleled comfort and collector-grade aesthetics.',
  ctaText: 'Explore Exclusive Access',
  ctaLink: '/shop/legend',
  bannerUrl:
    'https://images.unsplash.com/photo-1549298980-043125e8340d?auto=format&fit=crop&w=1500&q=80', // Premium, dramatic product shot
  secondaryImage:
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80', // Abstract background texture/pattern
  themePrimary: '#000000', // Deep Black/Void
  themeSecondary: '#FFD700', // Gold/Vibrant Accent
  themeAccent: '#FFFFFF', // White for primary text
};

export default function BannerSection({ promotions = [], themeSettings = {} }: BannerSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Pick third promotion (or fallback)
  const promo = promotions?.[2] || dummyBanner;

  // Theme colors hierarchy: promo > themeSettings > fallback
  const primary = promo.themePrimary || themeSettings?.primaryColor || '#000000'; // Dark Background
  const secondary = promo.themeSecondary || themeSettings?.secondaryColor || '#FFD700'; // Gold/Accent
  const accent = promo.themeAccent || themeSettings?.accentColor || '#FFFFFF'; // White Text

  // Animation variants
  const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section
      className="relative min-h-[70vh] flex items-center justify-center py-20 overflow-hidden group"
      style={{
        backgroundColor: primary,
        color: accent,
      }}
    >
      
      {/* --- Background Image & Shadow Effect (Captivating) --- */}
      <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
        <img
          src={promo.secondaryImage || dummyBanner.secondaryImage}
          alt="Background Texture"
          className="w-full h-full object-cover blur-sm mix-blend-lighten"
        />
      </div>
      
      {/* Large central product image - Positioned for cinematic depth */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 md:w-1/2 lg:w-2/5 z-10 pointer-events-none">
        <img
          src={promo.bannerUrl || dummyBanner.bannerUrl}
          alt={promo.title || 'Primary Product Image'}
          // Subtle parallax/scale effect on group hover
          className="w-full object-cover transform scale-[1.1] rotate-[-5deg] transition-all duration-700 ease-in-out opacity-80 group-hover:scale-[1.15] group-hover:rotate-[-2deg] drop-shadow-2xl"
          style={{ filter: `drop-shadow(0 0 15px ${secondary})` }} // Light glow around the product
        />
      </div>

      
      {/* --- Main Content Block (Intuitive & Engaging) --- */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-20 backdrop-blur-sm p-4 lg:p-0">
        
        {/* Left Spacer (Focus on Product) */}
        <div className="hidden lg:block"></div>

        {/* Right Content */}
        <div className="text-center lg:text-left">
          <motion.div initial="initial" whileInView="animate" variants={fadeInUp} viewport={{ once: true }}>
            <p className="text-lg font-medium tracking-widest uppercase mb-2" style={{ color: secondary }}>
              {promo.subtitle || 'Experience The Difference'}
            </p>
          </motion.div>
          
          <motion.div initial="initial" whileInView="animate" variants={{ ...fadeInUp, transition: { delay: 0.2 } }} viewport={{ once: true }}>
            <h1 className="text-5xl md:text-8xl font-black leading-tight drop-shadow-lg" style={{ color: accent }}>
              {promo.title || 'THE NEW RELEASE'}
            </h1>
          </motion.div>
          
          <motion.div initial="initial" whileInView="animate" variants={{ ...fadeInUp, transition: { delay: 0.4 } }} viewport={{ once: true }}>
            <p className="mt-6 text-xl max-w-lg font-light text-white/80">
              {promo.description || dummyBanner.description}
            </p>
          </motion.div>

          {/* CTA Button with Glow Effect */}
          <motion.div initial="initial" whileInView="animate" variants={{ ...fadeInUp, transition: { delay: 0.6 } }} viewport={{ once: true }}>
            {promo.ctaLink && (
              <Link href={promo.ctaLink} passHref>
                <button
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className="mt-10 px-12 py-5 font-bold text-lg rounded-full shadow-2xl transition-all duration-300 transform hover:scale-[1.03] focus:ring-4 focus:ring-offset-2"
                  style={{
                    backgroundColor: secondary, // Gold
                    color: primary, // Black text on Gold
                    boxShadow: isHovered ? `0 0 20px 5px ${secondary}` : `0 10px 15px rgba(0, 0, 0, 0.5)`,
                    borderColor: secondary,
                    // Focus ring uses accent color
                    '--tw-ring-color': secondary,
                  } as React.CSSProperties}
                >
                  {isHovered ? 'VIEW DETAILS' : promo.ctaText || 'Shop Now'}
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Subtle light effect at the bottom for mood */}
      <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
      
    </section>
  );
}