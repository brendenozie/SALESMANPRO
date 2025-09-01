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
  storeFormData: StoreForm | null;
}

// Dummy data fallback
const dummyData = {
  mainCard: {
    imageUrl: '/images/yellow-shoe.png',
    headline: 'Summer Collection',
    description: 'We have a lot of trendy shoes with wholesale prices in the summer collection.',
    ctaLink: '/shop/summer',
    tags: [
      { id: 't1', name: 'COMFORT' },
      { id: 't2', name: 'STYLISH AND MODERN' },
      { id: 't3', name: 'ORIGINAL' },
    ],
  },
  secondaryImage: '/images/black-white-shoe.png',
};

export default function CategorySection({ storeFormData }: CategorySectionProps) {
  const { StoreCategory = [] } = storeFormData || {};

  const categoryData =
    StoreCategory.length > 0
      ? {
          mainCard: {
            imageUrl: StoreCategory[0].imageUrl || '/images/yellow-shoe.png',
            headline: StoreCategory[0].displayName || 'Featured Collection',
            description: StoreCategory[0].description || 'Discover our latest and most popular collection.',
            ctaLink: StoreCategory[0].slug || '/shop',
            tags: [
              { id: 't1', name: 'TRENDY' },
              { id: 't2', name: 'POPULAR' },
              { id: 't3', name: 'LATEST' },
            ],
          },
          secondaryImage: StoreCategory[1]?.imageUrl || '/images/black-white-shoe.png',
        }
      : dummyData;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        {/* LEFT SIDE: Main image + tags */}
        <div className="w-full lg:w-3/5 flex flex-col items-center">
          {/* Sneaker image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full flex items-center justify-center -rotate-6"
          >
            <Image
              src={categoryData.mainCard.imageUrl}
              alt={categoryData.mainCard.headline}
              width={500}
              height={500}
              loader={loader}
              className="object-contain"
            />
          </motion.div>

          {/* Tag buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {categoryData.mainCard.tags.map((tag) => (
              <button
                key={tag.id}
                className="px-6 py-2 rounded-full border border-gray-400 text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 transition"
              >
                {tag.name}
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
              {categoryData.mainCard.headline}
            </h2>
            <p className="mt-3 text-gray-700 text-sm md:text-base">
              {categoryData.mainCard.description}
            </p>
          </div>

          {/* Secondary shoe + Explore button */}
          <div className="flex items-center justify-between">
            <Image
              src={categoryData.secondaryImage}
              alt="Secondary shoe"
              width={280}
              height={280}
              loader={loader}
              className="object-contain -rotate-6"
            />

            <Link href={categoryData.mainCard.ctaLink}>
              <div className="bg-red-500 text-white font-bold px-4 py-20 flex items-center justify-center cursor-pointer hover:bg-red-600 transition">
                <span className="rotate-90 text-lg flex items-center gap-1">
                  Explore <ArrowUpRightIcon className="h-5 w-5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
