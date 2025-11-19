'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { IStoreCategory, StoreForm } from '@/types/typings';
import Image from 'next/image';
import Link from 'next/link';

// Loader remains the same so Next.js can optimize your images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export interface CategorySectionProps {
  promotions?: any[];
  themeSettings?: any;
}

// New dummy promotion data
const dummyPromotionData = {
  title: 'Summer Collection',
  description: 'We have a lot of trendy shoes with wholesale prices in the summer collection.',
  bannerUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', // main image
  ctaText: 'Explore',
  ctaLink: '/shop/summer',
  featureImage1: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', // secondary image
  perks: [
    { icon: 'SparklesIcon', label: 'Fast Shipping' },
    { icon: 'SparklesIcon', label: 'Uncompromising Quality' },
  ],
  trustLogos: [
                "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1088px-Adidas_Logo.svg.png?20240107104015",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/1187px-Vans-logo.svg.png?20150315211742",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Puma-logo-%28text%29.svg/768px-Puma-logo-%28text%29.svg.png?20230824220146",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/450px-New_Balance_logo.svg.png?20160801155106",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Reebok_wordmark_%282008%E2%80%932014%29.svg/450px-Reebok_wordmark_%282008%E2%80%932014%29.svg.png?20090503203208",
                  
  ],
};

export default function CategorySection({ promotions, themeSettings }: CategorySectionProps) {

  const categoryData = promotions &&
    promotions.length > 0
      ? {
          title: promotions[0].title || 'Featured Collection',
          description: promotions[0].description || 'Discover our latest and most popular collection.',
          bannerUrl: promotions[0].bannerUrl || '/images/yellow-shoe.png',
          ctaText: 'Explore',
          ctaLink: promotions[0].ctaLink || '/shop',
          featureImage1: promotions[0]?.featureImage1 || '/images/black-white-shoe.png',
          perks: promotions[0].perks || [
            { icon: 'SparklesIcon', label: 'TRENDY' },
            { icon: 'SparklesIcon', label: 'POPULAR' },
            { icon: 'SparklesIcon', label: 'LATEST' },
          ],
          trustLogos: [
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1088px-Adidas_Logo.svg.png?20240107104015",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/1187px-Vans-logo.svg.png?20150315211742",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Puma-logo-%28text%29.svg/768px-Puma-logo-%28text%29.svg.png?20230824220146",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/450px-New_Balance_logo.svg.png?20160801155106",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Reebok_wordmark_%282008%E2%80%932014%29.svg/450px-Reebok_wordmark_%282008%E2%80%932014%29.svg.png?20090503203208",
                  ]
        }
      : dummyPromotionData;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        {/* LEFT SIDE: Main image + perks */}
        <div className="w-full lg:w-3/5 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full flex items-center justify-center -rotate-6"
          >
            <Image
              src={categoryData.bannerUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'}
              alt={categoryData.title}
              width={500}
              height={500}
              loader={loader}
              className="object-contain"
            />
          </motion.div>

          {/* Perks */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {categoryData.perks.map((perk: { icon: string; label: string }, idx: number) => (
              <button
                key={idx}
                className="px-6 py-2 rounded-full border border-gray-400 text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 transition"
              >
                {perk.label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-2/5 flex flex-col gap-8">
          {/* Headline card */}
          <div className="bg-pink-100 p-8">
            <span className="text-xs font-semibold text-gray-600">Trendy Styles</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
              {categoryData.title}
            </h2>
            <p className="mt-3 text-gray-700 text-sm md:text-base">
              {categoryData.description}
            </p>
          </div>

          {/* Secondary shoe + CTA button */}
          <div className="flex items-center justify-between">
            <Image
              src={categoryData.featureImage1  || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'}
              alt="Secondary shoe"
              width={280}
              height={280}
              loader={loader}
              className="object-contain -rotate-6"
            />

            <Link href={categoryData.ctaLink || '/shop'}>
              <div className="bg-red-500 text-white font-bold px-4 py-20 flex items-center justify-center cursor-pointer hover:bg-red-600 transition">
                <span className="rotate-90 text-lg flex items-center gap-1">
                  {categoryData.ctaText} <ArrowUpRightIcon className="h-5 w-5" />
                </span>
              </div>
            </Link>
          </div>

          {/* Trust logos */}
          <div className="flex items-center gap-6 mt-4">
            { categoryData.trustLogos.length > 0 ? categoryData.trustLogos.map((logo, idx) => (
              <Image key={idx} src={logo} alt="Brand logo" width={60} height={30} loader={loader} />
            )) : ( 
              <>
              {
                [
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1088px-Adidas_Logo.svg.png?20240107104015",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vans-logo.svg/1187px-Vans-logo.svg.png?20150315211742",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Puma-logo-%28text%29.svg/768px-Puma-logo-%28text%29.svg.png?20230824220146",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/450px-New_Balance_logo.svg.png?20160801155106",
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Reebok_wordmark_%282008%E2%80%932014%29.svg/450px-Reebok_wordmark_%282008%E2%80%932014%29.svg.png?20090503203208",
                  
                ].map((logo, idx) => (
                    <Image key={idx} src={logo} alt="Brand logo" width={60} height={30} loader={loader} />
                  ))
              }
              </>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
