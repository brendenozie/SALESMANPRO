// app/[slug]/categories/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Section from '@/components/site/Section/Section';
import { useStore } from '@/contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

export default function CategoriesPage() {
  const store  = useStore();
  const categories = store?.storeFormData?.StoreCategory || [];
  const storeSlug = store?.storeFormData?.slug;

  if (!storeSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Store not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
      <Section title="Shop by Category">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/security/products?category=${cat.id}`}
                className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={cat.icon || ''}
                    alt={cat.displayName || 'displayName'}
                    loader={loader}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  {cat.icon && <div className="mb-2 text-3xl">{cat.icon}</div>}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {cat.displayName}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
