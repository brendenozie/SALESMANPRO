'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';

export interface SecondPromoSectionProps {
  promotions: IPromotion[];
}

export default function SecondPromoSection({ promotions }: SecondPromoSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#f97316'; // fallback orange
  const secondary = themeSettings?.secondaryColor || '#3b82f6'; // fallback blue

  // Grab the second promotion (index 1)
  const promotion = promotions?.[1] || {
    title: 'Ultimate Sleep Tapes',
    subtitle: 'Relax, Rest, Revive',
    description:
      'Improve your nightly rest with Blume Sleep Tape. Experience the perfect blend of natural ingredients that promotes deep relaxation and rejuvenation.',
    bannerUrl:
      'https://images.unsplash.com/photo-1610276346363-761dd5bfbf3a?auto=format&fit=crop&w=800&q=80',
    ctaText: 'Shop Now',
    ctaLink: '#',
  };

  return (
    <section
      className="relative py-20 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* --- Text Block --- */}
        <div className="text-center md:text-left relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
            {promotion.title}
          </h2>
          {/* {promotion.subtitle && (
            <h3 className="mt-4 text-2xl md:text-3xl font-semibold text-white/90">
              {promotion.subtitle}
            </h3>
          )} */}
          <p className="mt-6 text-base md:text-lg text-white/80 max-w-xl mx-auto md:mx-0">
            {promotion.description}
          </p>
          <a
            href={promotion.ctaLink || '#'}
            className="mt-8 inline-block bg-white text-black font-semibold py-3 px-8 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
          >
            {promotion.ctaText}
          </a>
        </div>

        {/* --- Image Block --- */}
        <div className="flex justify-center md:justify-end relative">
          <div className="relative">
            <img
              src={promotion.bannerUrl || 'https://www.unsplash.com/'}
              alt={promotion.title}
              className="w-72 md:w-80 lg:w-96 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
            />
            {/* Decorative Glow Circle */}
            <div
              className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-30 blur-2xl"
              style={{ background: secondary }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
