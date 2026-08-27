'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#10B981';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  if (!promotions || promotions.length === 0) return null;

  // Render a full-width hero banner for a single promotion
  if (promotions.length >= 1) {
    const promotion = promotions[0];
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={promotion.bannerUrl || 'https://www.unsplash.com/'}
              alt={promotion.title}
              className="w-full h-96 md:h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
                  {promotion.title}
                </h2>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-6 opacity-90">
                  {promotion.description}
                </p>
                <a
                  href={promotion.ctaLink || '/peanutecommerce/products'}
                  className="inline-block font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ backgroundColor: primary, color: '#FFFFFF' }}
                >
                  {promotion.ctaText || 'Shop Now'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render a grid for multiple promotions, limited to a max of 3
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
                  src={item.bannerUrl  || 'https://www.unsplash.com/'}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 h-10 overflow-clip">
                    {item.description}
                  </p>
                  <a
                    href={item.ctaLink || '/peanutecommerce/products'}
                    className="block text-center font-semibold py-2 px-4 rounded-md transition-colors hover:opacity-90"
                    style={{ background: primary, color: '#FFFFFF' }}
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