'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import Image from 'next/image';
import React from 'react';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#F97316'; // orange accent
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  if (!promotions || promotions.length === 0) return null;

  // ------------------------------
  // 1) MATERIAL FOCUS – MAIN BANNER
  // ------------------------------
  if (promotions.length >= 1) {
    const promo : any = promotions[0];

    return (
      <section className="bg-stone-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* --- TEXT SIDE --- */}
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6">
              {promo.title || 'Designed for Life,'} <br />
              {promo.subtitle || 'Crafted to Last.'}
            </h2>

            <p className="text-stone-400 text-lg mb-8 leading-relaxed">
              {promo.description ||
                'We believe furniture should be more than just functional. It should be an extension of your personality. That’s why we source only the finest materials.'}
            </p>

            {/* Metrics – fallback if promotion has none */}
            <div className="grid grid-cols-2 gap-8">

              <div>
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: primary }}
                >
                  {promo.statOneValue || '100%'}
                </div>
                <div className="text-stone-400 text-sm">
                  {promo.statOneLabel || 'Sustainable Wood'}
                </div>
              </div>

              <div>
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: primary }}
                >
                  {promo.statTwoValue || '25+'}
                </div>
                <div className="text-stone-400 text-sm">
                  {promo.statTwoLabel || 'Artisan Partners'}
                </div>
              </div>

            </div>

            {/* CTA */}
            <a
              href={promo.ctaLink || '#'}
              className="inline-block mt-10 py-3 px-10 font-semibold rounded-md transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ backgroundColor: primary }}
            >
              {promo.ctaText || 'Shop Now'}
            </a>
          </div>

          {/* --- IMAGE SIDE --- */}
          <div className="relative h-[500px] w-full">
            <div className="absolute inset-0 border border-white/20 translate-x-4 translate-y-4 z-0" />

            <div className="relative z-10 h-full w-full overflow-hidden">
              <Image
                src={
                  promo.bannerUrl ||
                  'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1000&auto=format&fit=crop'
                }
                alt={promo.title || 'Promotion'}
                loader={loader}
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // --------------------------------------
  // 2) MULTIPLE PROMOTIONS – FALLBACK GRID
  // (kept same, but slightly styled to match new theme)
  // --------------------------------------
  const displayedPromos = promotions.slice(0, 3);

  return (
    <section className="py-16 bg-stone-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayedPromos.map((promo, i) => (
            <div
              key={i}
              className="bg-white shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="relative h-64">
                <Image
                  src={promo.bannerUrl || 'https://picsum.photos/800'}
                  alt={promo.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                  {promo.title}
                </h3>

                <p className="text-stone-500 text-sm mb-4 line-clamp-2">
                  {promo.description}
                </p>

                <a
                  href={promo.ctaLink || '#'}
                  className="inline-block py-2 px-4 rounded-md font-semibold transition-all duration-300"
                  style={{ backgroundColor: primary, color: '#fff' }}
                >
                  {promo.ctaText || 'Learn More'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
