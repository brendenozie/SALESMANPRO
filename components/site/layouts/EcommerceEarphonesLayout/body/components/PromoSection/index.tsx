'use client';

import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon, TicketIcon } from '@heroicons/react/24/outline';

export interface PromotionsSectionProps {
  promotions: IPromotion[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const primary = storeFormData?.themeSettings?.primaryColor || '#10B981';

  if (!promotions || promotions.length === 0) return null;

  /* -------------------------------------------------------------------------- */
  /* Single Promotion — Cinematic Hero */
  /* -------------------------------------------------------------------------- */
  if (promotions.length === 1) {
    const promo = promotions[0];

    return (
      <section className="py-24 bg-white dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="
              group relative h-[600px] rounded-[3rem] overflow-hidden border
              border-black/10 dark:border-white/10
            "
          >
            {/* Background */}
            <div className="absolute inset-0">
              <img
                src={
                  promo.bannerUrl ||
                  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000'
                }
                alt={promo.title}
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
              />

              {/* Adaptive Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent dark:from-black dark:via-black/40" />
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center p-12 md:p-24 max-w-3xl">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mb-6"
              >
                <div className="px-3 py-1 rounded-full backdrop-blur-md border bg-white/80 border-black/10 dark:bg-white/10 dark:border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">
                    Exclusive Campaign
                  </span>
                </div>
              </motion.div>

              {/* Title with Outline Effect */}
              <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase mb-6 text-black dark:text-white">
                {promo.title.split(' ').map((word, i) => (
                  <span
                    key={i}
                    className="block"
                    style={
                      i % 2 !== 0
                        ? {
                            WebkitTextStroke:
                              '1px rgba(0,0,0,0.4)',
                            color: 'transparent',
                          }
                        : {}
                    }
                  >
                    {word}
                  </span>
                ))}
              </h2>

              <p className="text-gray-600 dark:text-white/60 text-lg md:text-xl font-medium mb-10 max-w-md">
                {promo.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href={promo.ctaLink || '/earphonesecommerce/products'}
                  className="
                    group/btn relative px-10 py-5 rounded-2xl
                    bg-black text-white dark:bg-white dark:text-black
                    font-black uppercase tracking-widest text-sm
                    transition-all hover:pr-14
                  "
                >
                  <span className="relative z-10">
                    {promo.ctaText || 'Get Access'}
                  </span>
                  <ArrowUpRightIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover/btn:opacity-100 transition-all" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* Multi Promotion — Discovery Grid */
  /* -------------------------------------------------------------------------- */

  const displayedPromotions = promotions.slice(0, 3);

  return (
    <section className="py-24 bg-white dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayedPromotions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="
                group relative h-[500px] rounded-[2.5rem] overflow-hidden border
                border-black/10 dark:border-white/5
              "
            >
              <img
                src={
                  item.bannerUrl ||
                  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000'
                }
                alt={item.title}
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2">
                    <TicketIcon
                      className="w-4 h-4"
                      style={{ color: primary }}
                    />
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">
                      Member Only
                    </span>
                  </div>

                  <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none mb-3 text-white">
                    {item.title}
                  </h3>

                  <p className="text-white/60 text-xs font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <a
                  href={item.ctaLink || '/earphonesecommerce/products'}
                  className="
                    w-full py-4 rounded-xl text-center text-xs font-black uppercase tracking-widest
                    bg-white/10 hover:bg-white text-white hover:text-black
                    backdrop-blur-md border border-white/20
                    transition-all
                  "
                >
                  {item.ctaText || 'Claim Now'}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}