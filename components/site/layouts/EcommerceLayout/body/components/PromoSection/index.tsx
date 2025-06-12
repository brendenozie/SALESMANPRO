'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import React from 'react';

export interface PromoItem {
  bannerUrl?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface PromotionsSectionProps {
  promotions: PromoItem[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  // Use theme colors to style the CTA button
  const primary = themeSettings.primaryColor || '#10B981';
  const secondary = themeSettings.secondaryColor || '#3B82F6';

  if (!promotions || promotions.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Responsive grid: 1 column on small devices, 2 on md, 3 on lg */}
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
            >
              {/* Header image with overlay */}
              {item.bannerUrl && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.bannerUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50"></div>
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    {/* Content area */}
                    <div>
                      <p className="text-gray-300 text-sm mb-4 h-10 overflow-clip ">{item.description}</p>
                      <a
                        href={item.ctaLink || '#'}
                        className="block text-center font-semibold py-2 px-4 rounded-md transition-colors hover:opacity-90"
                        style={{ background: primary }}
                      >
                        {item.ctaText || 'Shop Now'}
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
