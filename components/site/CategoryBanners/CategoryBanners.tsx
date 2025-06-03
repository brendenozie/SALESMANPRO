// File: components/site/CategoryBanners/CategoryBanners.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '../../../contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;


export default function CategoryBanners() {
  const { storeFormData } = useStoreContext();
  const { storeCategories, slug } = storeFormData;

  return (
    <section className="py-16 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {storeCategories.map((cat:any) => (
            <Link
              key={cat.id}
              href={`/${slug}/products?category=${cat.id}`}
              className="group relative block rounded-xl overflow-hidden shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-48"
              >
                <Image
                  src={cat.icon ?? cat.imageUrl ?? '/images/category-placeholder.jpg'}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loader={loader}
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />

                <div className="absolute inset-0 flex flex-col items-start justify-end p-4 z-10">
                  <span className="text-white text-lg font-semibold">{cat.name}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
