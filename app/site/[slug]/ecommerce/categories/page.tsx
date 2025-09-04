'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Section from '@/components/site/Section/Section';
import { useStore } from '@/contexts/StoreContext';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function CategoriesPage() {
  const store = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Store not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen mt-20">
      <Section title="Shop by Category">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              <p>No categories available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/site/${storeSlug}/ecommerce/products?category=${cat.id}`}
                  className="group block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-48 w-full">
                    {cat.icon && (
                      <Image
                        src={cat.icon}
                        alt={cat.name || cat.displayName || cat.category?.name || ''}
                        loader={imageLoader}
                        fill
                        priority
                        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {cat.name || cat.displayName || cat.category?.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
