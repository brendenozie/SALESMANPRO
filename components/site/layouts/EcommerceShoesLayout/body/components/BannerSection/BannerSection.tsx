'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';

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
    'https://images.unsplash.com/photo-1549298980-043125e8340d?auto=format&fit=crop&w=1500&q=80',
  secondaryImage:
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80',
  themePrimary: '#000000',
  themeSecondary: '#FFD700',
  themeAccent: '#FFFFFF',
};

export default function BannerSection({ promotions = [], themeSettings = {} }: BannerSectionProps) {
  const { buildUrl } = useEditableContent();
  const [isHovered, setIsHovered] = useState(false);

  // Pick third promotion (or fallback)
  const promo = promotions?.[2] || dummyBanner;

  // Theme colors hierarchy: promo > themeSettings > fallback
  const primary = promo.themePrimary || themeSettings?.primaryColor || '#000000';
  const secondary = promo.themeSecondary || themeSettings?.secondaryColor || '#FFD700';
  const accent = promo.themeAccent || themeSettings?.accentColor || '#FFFFFF';

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
        <EditableElement
          targetId="home.banner.bannerUrl"
          componentKey="BannerSection"
          elementKey="bannerUrl"
          label="Banner Image"
          type="image"
          defaultValue={promo.bannerUrl || dummyBanner.bannerUrl}
          className="w-full h-full"
        >
          {(val) => (
            <img
              src={val || promo.bannerUrl || dummyBanner.bannerUrl}
              alt={promo.title || 'Primary Product Image'}
              className="w-full object-cover transform scale-[1.1] rotate-[-5deg] transition-all duration-700 ease-in-out opacity-80 group-hover:scale-[1.15] group-hover:rotate-[-2deg] drop-shadow-2xl"
              style={{ filter: `drop-shadow(0 0 15px ${secondary})` }}
            />
          )}
        </EditableElement>
      </div>

      {/* --- Main Content Block (Intuitive & Engaging) --- */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-20 backdrop-blur-sm p-4 lg:p-0">
        
        {/* Left Spacer (Focus on Product) */}
        <div className="hidden lg:block"></div>

        {/* Right Content */}
        <div className="text-center lg:text-left">
          <motion.div initial="initial" whileInView="animate" variants={fadeInUp} viewport={{ once: true }}>
            <EditableElement
              targetId="home.banner.subtitle"
              componentKey="BannerSection"
              elementKey="subtitle"
              label="Banner Subtitle"
              defaultValue={promo.subtitle || 'Experience The Difference'}
              inline
            >
              {(val) => (
                <p className="text-lg font-medium tracking-widest uppercase mb-2" style={{ color: secondary }}>
                  {val}
                </p>
              )}
            </EditableElement>
          </motion.div>
          
          <motion.div initial="initial" whileInView="animate" variants={{ ...fadeInUp, transition: { delay: 0.2 } }} viewport={{ once: true }}>
            <EditableElement
              targetId="home.banner.title"
              componentKey="BannerSection"
              elementKey="title"
              label="Banner Title"
              defaultValue={promo.title || 'THE NEW RELEASE'}
            >
              {(val) => (
                <h1 className="text-5xl md:text-8xl font-black leading-tight drop-shadow-lg" style={{ color: accent }}>
                  {val}
                </h1>
              )}
            </EditableElement>
          </motion.div>
          
          <motion.div initial="initial" whileInView="animate" variants={{ ...fadeInUp, transition: { delay: 0.4 } }} viewport={{ once: true }}>
            <EditableElement
              targetId="home.banner.description"
              componentKey="BannerSection"
              elementKey="description"
              label="Banner Description"
              type="textarea"
              defaultValue={promo.description || dummyBanner.description}
            >
              {(val) => (
                <p className="mt-6 text-xl max-w-lg font-light text-white/80">
                  {val}
                </p>
              )}
            </EditableElement>
          </motion.div>

          {/* CTA Button with Glow Effect */}
          <motion.div initial="initial" whileInView="animate" variants={{ ...fadeInUp, transition: { delay: 0.6 } }} viewport={{ once: true }}>
            <Link href={buildUrl(promo.ctaLink || '/shop/legend')} passHref>
              <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="mt-10 px-12 py-5 font-bold text-lg rounded-full shadow-2xl transition-all duration-300 transform hover:scale-[1.03] focus:ring-4 focus:ring-offset-2"
                style={{
                  backgroundColor: secondary,
                  color: primary,
                  boxShadow: isHovered ? `0 0 20px 5px ${secondary}` : `0 10px 15px rgba(0, 0, 0, 0.5)`,
                  borderColor: secondary,
                  '--tw-ring-color': secondary,
                } as React.CSSProperties}
              >
                <EditableElement
                  targetId="home.banner.ctaText"
                  componentKey="BannerSection"
                  elementKey="ctaText"
                  label="Button Text"
                  defaultValue={promo.ctaText || 'Shop Now'}
                  inline
                >
                  {(val) => <span>{isHovered ? 'VIEW DETAILS' : val}</span>}
                </EditableElement>
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Subtle light effect at the bottom for mood */}
      <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
      
    </section>
  );
}