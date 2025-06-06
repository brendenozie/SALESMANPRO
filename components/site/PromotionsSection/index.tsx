'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Promotion } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';

interface PromotionsSectionProps {
  promotions: Promotion[];
}

export default function PromotionsSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#10B981';   // emerald fallback
  const secondary = themeSettings.secondaryColor || '#3B82F6'; // blue fallback

  if (!promotions || promotions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo, idx) => (
            <motion.div
              key={idx}
              className="
                relative
                rounded-3xl
                overflow-hidden
                shadow-lg
                bg-white/10 backdrop-blur-sm
                group
                hover:shadow-2xl
                hover:-translate-y-1
                transition-all duration-300
              "
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                delay: idx * 0.1,
                duration: 0.6,
                ease: 'easeOut',
                type: 'spring',
                stiffness: 250,
                damping: 20,
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Background Image */}
              <div className="relative w-full h-64">
                <Image
                  src={promo.bannerUrl || '/placeholder.png'}
                  alt={promo.title}
                  fill
                  className="object-cover"
                  loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                  priority={idx === 0}
                />
                {/* Slight dark overlay so text stands out */}
                <div className="absolute inset-0 bg-black/30" />
              </div>

              {/* Frosted-Glass Text Panel at Bottom */}
              <div className="absolute bottom-0 left-0 w-full bg-white/70 backdrop-blur-sm rounded-b-3xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {promo.title}
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  {promo.description}
                </p>
                {promo.ctaLink && promo.ctaText && (
                  <a
                    href={promo.ctaLink}
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${primary}, ${secondary})`,
                    }}
                    className="
                      inline-block
                      text-white
                      font-semibold
                      px-5 py-2
                      rounded-full
                      shadow-lg
                      transition-transform duration-300
                      group-hover:scale-105
                    "
                  >
                    {promo.ctaText}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
