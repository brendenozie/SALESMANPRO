'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import Image from 'next/image';
import React from 'react';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

const loader = ({ src }: any) => src;

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#FFFFFF';

  if (!promotions || promotions.length === 0) return null;

  // ---------------------------
  // FULL-WIDTH HERO PROMOTION
  // ---------------------------
  if (promotions.length >= 1) {
    const promo = promotions[0];

    return (
      <section className="relative py-32 bg-slate-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30">
          <Image
            src={promo.bannerUrl || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80'}
            alt={promo.title}
            fill
            loader={loader}
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Optional Tag */}
          {promo.badgeText && (
            <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-white text-sm mb-6 backdrop-blur-sm">
              {promo.badgeText}
            </span>
          )}

          {/* Title */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {promo.title}
          </h2>

          {/* Description */}
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            {promo.description}
          </p>

          {/* CTA */}
          <a
            href={promo.ctaLink || '#'}
            className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold hover:bg-indigo-50 transition-colors"
            style={{ backgroundColor: primary, color: '#111' }}
          >
            {promo.ctaText || 'Shop Now'}
          </a>
        </div>
      </section>
    );
  }

  // ---------------------------
  // MULTIPLE PROMOTIONS GRID
  // ---------------------------
  const displayedPromotions = promotions.slice(0, 3);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedPromotions.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>

                {/* Text + CTA */}
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>

                  <p className="text-gray-300 text-sm mb-4 h-10 overflow-clip">
                    {item.description}
                  </p>

                  <a
                    href={item.ctaLink || '#'}
                    className="block text-center font-semibold py-2 px-4 rounded-md transition-colors hover:opacity-90"
                    style={{ background: primary, color: '#111' }}
                  >
                    {item.ctaText || 'Shop Now'}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
