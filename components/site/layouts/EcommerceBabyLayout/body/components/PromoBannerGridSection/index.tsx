'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

const promoBanners = [
  {
    title: 'KIDS SHOES',
    subtitle: 'Sale!',
    price: '$30.00',
    discount: '15%',
    image: '/promo-shoes.png', // Replace with your actual asset path
    bgColor: 'bg-[#FFF0F6]', // Soft Pink
    textColor: 'text-pink-500',
  },
  {
    title: 'FASHION',
    subtitle: 'Sale!',
    price: '$20.00',
    discount: '25%',
    image: '/promo-fashion.png',
    bgColor: 'bg-[#EBF4FF]', // Soft Blue
    textColor: 'text-blue-500',
  },
  {
    title: 'BLACK FRIDAY',
    subtitle: '50% Off',
    buttonText: 'Shop Now',
    image: '/promo-scooter.png',
    bgColor: 'bg-[#FFF0F6]',
    textColor: 'text-pink-500',
    isSpecial: true,
  },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PromoBannerGridSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6';

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {promoBanners.map((banner, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden rounded-[2.5rem] p-8 min-h-[220px] flex flex-col justify-center ${banner.bgColor}`}
          >
            {/* Content Layer */}
            <div className="relative z-10 max-w-[60%]">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                {banner.title}
              </h3>
              <p className="text-sm font-bold text-gray-500 mt-1">
                {banner.subtitle}
              </p>
              
              <div className="mt-4 flex items-baseline gap-2">
                {banner.price && (
                  <span className={`text-lg font-black ${banner.textColor}`}>
                    {banner.price}
                  </span>
                )}
                {banner.discount && (
                  <span className="text-[10px] font-bold text-pink-300 uppercase">
                    /{banner.discount}
                  </span>
                )}
              </div>

              {banner.isSpecial && (
                <Link href="/shop" className="mt-4 inline-block">
                  <button 
                    className="px-6 py-2 rounded-xl text-white text-xs font-bold transition-transform active:scale-95 shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {banner.buttonText}
                  </button>
                </Link>
              )}
            </div>

            {/* Image Layer - Absolute positioned to the right */}
            <div className="absolute right-0 bottom-0 w-1/2 h-full">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-contain object-right-bottom p-4"
                loader={loader}
              />
            </div>
            
            {/* Subtle decorative cloud/blob shape (optional) */}
            <div className="absolute top-4 left-10 w-12 h-6 bg-white/40 rounded-full blur-xl pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}