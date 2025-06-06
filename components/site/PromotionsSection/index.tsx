'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

interface Promotion {
  bannerUrl?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}

interface PromotionsSectionProps {
  promotions: Promotion[];
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function PromotionsSection({ promotions }: PromotionsSectionProps) {
  const { storeFormData } = useStoreContext();
  const { themeSettings = {} } = storeFormData || {};
  const primary = themeSettings.primaryColor || '#10B981';
  const secondary = themeSettings.secondaryColor || '#3B82F6';

  if (!promotions || promotions.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl font-extrabold text-center mb-8"
          style={{
            background: `linear-gradient(90deg, ${primary}, ${secondary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Special Promotions
        </h2>

        <motion.div
          className="flex space-x-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:space-x-0 sm:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          {promotions.map((promo, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="
                relative 
                flex-shrink-0 sm:flex-shrink
                w-[300px] sm:w-auto
                bg-white rounded-2xl overflow-hidden 
                shadow-md hover:shadow-xl 
                transition-shadow duration-300
              "
            >
              {/* Top Corner Ribbon */}
              <div
                className="absolute top-0 right-0 z-10 px-3 py-1 bg-gradient-to-br from-[rgba(16,185,129,0.8)] to-[rgba(59,130,246,0.8)] text-white text-xs font-semibold rounded-bl-lg"
              >
                Promo
              </div>

              {/* Image */}
              <div className="relative h-48 w-full">
                <Image
                  src={promo.bannerUrl || '/placeholder.png'}
                  alt={promo.title}
                  fill
                  className="object-cover"
                  loader={({ src, width, quality }) => `${src}?w=${width}&q=${quality || 75}`}
                  priority={idx === 0}
                />
                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>

              {/* Content Overlay */}
              <div className="p-6 flex flex-col justify-between h-[220px]">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{promo.title}</h3>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{promo.description}</p>
                </div>
                {promo.ctaLink && promo.ctaText && (
                  <Link href={promo.ctaLink}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-full font-medium text-white"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${primary}, ${secondary})`,
                      }}
                    >
                      {promo.ctaText}
                      <ArrowRightIcon className="h-4 w-4 ml-2 text-white" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
