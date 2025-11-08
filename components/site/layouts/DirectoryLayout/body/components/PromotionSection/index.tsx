'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useStoreContext } from '@/contexts/StoreContext';
import { IPromotion } from '@/types/typings';

// Optimized image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Static fallback data for banners
const fallbackBanners = [
  {
    id: 'fallback-summer-clearance',
    label: 'SUMMER SAVINGS',
    title: 'Up to 50% Off Everything!',
    description: 'Refresh your wardrobe with our hottest deals. Limited stock available.',
    imgSrc: 'https://images.unsplash.com/photo-1588117765119-9403330601f0?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bgClass: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900',
    imgPosition: 'right',
    ctaText: 'Shop Summer Deals',
    ctaLink: '/shop/summer-clearance',
  },
  {
    id: 'fallback-winter-collection',
    label: 'NEW ARRIVALS',
    title: 'Cozy Winter Collection',
    description: 'Embrace the cold in style with our latest collection of warm essentials.',
    imgSrc: 'https://images.unsplash.com/photo-1612443429399-ea16bb1c2c2f?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bgClass: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900',
    imgPosition: 'left',
    ctaText: 'Explore Winter Styles',
    ctaLink: '/shop/winter-collection',
  },
];
// Animation variants for individual banner cards (slightly adjusted)
const bannerCardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 10,
    },
  },
};

interface PromotionProps {
  promotions?: IPromotion[];
}

export default function PromotionSection({ promotions: dynamicPromotions }: PromotionProps) {
  // const { storeFormData } = useStoreContext() || {};
  // const { promotions: dynamicPromotions } = storeFormData || {};

  // Determine which banners to render: dynamic or fallback
  const bannersToRender = Array.isArray(dynamicPromotions) && dynamicPromotions.length > 0
    ? dynamicPromotions.map((promo, idx) => ({
        id: promo.id,
        label: promo.code || 'PROMOTION',
        title: promo.title,
        description: promo.description || '',
        imgSrc: promo.bannerUrl || 'https://placehold.co/600x400/CCCCCC/333333?text=Promotion+Image',
        // Alternating color backgrounds for visual variation
        bgClass:
          idx % 2 === 0
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900'
            : 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900',
        imgPosition: idx % 2 === 0 ? 'right' : 'left',
        ctaText: promo.ctaText || 'Learn More',
        ctaLink: promo.ctaLink || '#',
      }))
    : fallbackBanners;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/600x400/CCCCCC/333333?text=Image+Not+Found';
  };

  const isSinglePromotion = bannersToRender.length === 1;

  // New: Constant gentle hover animation for the card (for extra visual pop)
  const gentleFloat = {
    y: [0, -2, 0], // Slight vertical movement
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  };

  return (
    <motion.section
      className="py-16 px-4 md:px-8 lg:px-16 bg-gray-50 dark:bg-gray-950 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header (omitted for brevity) */}
        <motion.div className="text-center mb-12">
           <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-3">
             Limited-Time Offers You Can't Miss! 🔥
           </h2>
           <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
             Discover exclusive discounts and new collections. Shop smart, save big.
           </p>
        </motion.div>

        {/* Banners Grid - Conditional Layout Change */}
        <div
          className={clsx('grid gap-8', {
            'lg:grid-cols-1': isSinglePromotion, // Full width for a single item
            'lg:grid-cols-2': !isSinglePromotion, // Two columns for multiple items
          })}
        >
          {bannersToRender.map((banner) => (
            <motion.div
              key={banner.id}
              variants={bannerCardVariants}
              // CAPTIVATING: Add gentle movement for single promo, and enhanced hover
              animate={isSinglePromotion ? gentleFloat : {}}
              whileHover={{ scale: isSinglePromotion ? 1.01 : 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={clsx(
                `relative flex items-center rounded-3xl shadow-xl overflow-hidden transition-transform transform cursor-pointer group`,
                banner.bgClass,
                banner.imgPosition === 'right' ? 'flex-row' : 'flex-row-reverse',
                // INTUITIVE/APPEALING: Make the single banner taller and more imposing
                isSinglePromotion ? 'h-[30rem] lg:h-[28rem] md:h-[20rem]' : 'h-[16rem] md:h-[20rem]',
              )}
            >
              {/* Text Content */}
              <div className="w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center z-10 text-gray-900 dark:text-gray-100">
                {/* INTUITIVE: Label as a distinct badge */}
                <span className="text-xs sm:text-sm font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full inline-block backdrop-blur-sm bg-white/30 dark:bg-gray-900/40 border border-gray-400/20 text-gray-900 dark:text-gray-100">
                  {banner.label}
                </span>

                {/* VISUALLY APPEALING: Dominant Title */}
                <h3 className="mt-1 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                  {banner.title}
                </h3>
                <p className="mt-3 text-sm md:text-lg text-gray-600 dark:text-gray-400 max-h-32 overflow-hidden">
                  {banner.description}
                </p>
                <Link href={banner.ctaLink} passHref>
                  {/* CAPTIVATING: Enhanced CTA button hover */}
                  <motion.button
                    whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-7 inline-flex items-center justify-center px-7 py-3 text-sm font-bold bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-300 ease-in-out transform"
                  >
                    {banner.ctaText}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </motion.button>
                </Link>
              </div>

              {/* Image Block */}
              <div className="w-1/2 h-full relative">
                <Image
                  src={banner.imgSrc}
                  alt={banner.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  // ENGAGING: Deeper image scale on hover
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-115"
                  loader={loader}
                  onError={handleImageError}
                />
                {/* Subtle overlay for visual depth and dark mode text readability */}
                <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-0 transition-opacity duration-300"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}