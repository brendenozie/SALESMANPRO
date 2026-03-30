'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};

  // Theme colors
  const primary = themeSettings?.primaryColor || '#10B981';

  if (!promotions || promotions.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {promotions.map((item, index) => (
            <div
              key={index}
              className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-black/5 dark:shadow-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-transparent dark:border-slate-800"
            >
              {/* Image Container */}
              <div className="relative h-72 w-full overflow-hidden">
                <img
                  src={item.bannerUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 dark:opacity-80" />
                
                {/* Badge/Tag - Optional visual flair */}
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
                    Special Offer
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow">
                  {item.description}
                </p>

                <a
                  href={item.ctaLink || '/ecommerceshoes/products'}
                  className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white transition-all hover:brightness-110 active:scale-[0.98] shadow-lg"
                  style={{ 
                    backgroundColor: primary,
                    boxShadow: `0 10px 20px -10px ${primary}66` // Transparent hex shadow
                  }}
                >
                  {item.ctaText || 'Shop Now'}
                  <ArrowRightIcon className="h-4 w-4 stroke-[3]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}