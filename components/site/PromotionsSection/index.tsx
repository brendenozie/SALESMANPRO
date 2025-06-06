'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Promotion } from '@/types/typings';
import { useStoreContext } from '@/contexts/StoreContext';


const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface PromotionsSectionProps {
  promotions: Promotion[];
}

export default function PromotionsSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#f97316';
  const secondary = themeSettings.secondaryColor || '#3b82f6';

  if (promotions.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
  
      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 md:px-8 lg:px-16">
        {promotions.map((promo, idx) => (
          <motion.div
            key={idx}
            className="relative rounded-2xl overflow-hidden shadow-2xl group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              delay: idx * 0.1,
              duration: 0.6,
              ease: 'easeOut',
              type: 'spring',
              stiffness: 250,
              damping: 20
            }}
            whileHover={{ scale: 1.03 }}
          >
            {/* Background Image + Gradient Overlay */}
            <div className="relative w-full h-56 md:h-64 lg:h-72">
              <Image
                src={promo.bannerUrl || '/placeholder.png'}
                loader={loader}
                alt={promo.title}
                fill
                className="object-cover"
                priority={idx === 0} // preload first one if you like
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 80%)',
                }}
              />
            </div>

            {/* Text & CTA */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-10">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-2 drop-shadow-md">
                {promo.title}
              </h3>
              <p className="text-sm md:text-base text-white mb-4 drop-shadow-sm">
                {promo.description}
              </p>
              {/* {promo.ctaLink && promo.ctaText && ( */}
                <a
                  href={"promo.ctaLink"}
                  className={`
                    inline-block
                    bg-gradient-to-r from-[${primary}] to-[${secondary}]
                    hover:from-[${secondary}] hover:to-[${primary}]
                    text-white font-semibold
                    px-5 py-2 md:px-6 md:py-3
                    rounded-full
                    shadow-lg
                    transition-all
                    transform group-hover:scale-105
                  `}
                >
                  {"promo.ctaText"}
                </a>
              {/* )} */}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
