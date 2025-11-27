'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import { IStoreCategory } from '@/types/typings';

export interface HeroSliderProps {
  StoreCategory: IStoreCategory[] | null;
  themeSettings: any;
}

export default function CategorySection({ StoreCategory , themeSettings }: HeroSliderProps) {

  // const { StoreCategory = [], themeSettings = {} } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#10B981';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Explore Categories
          </h2>
          <p className="mt-2 text-gray-600 text-sm">
            Find products by category – from essentials to extras.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {StoreCategory && StoreCategory.map((cat: IStoreCategory) => (
            <motion.div
              key={cat.id}
              onClick={() => {
                // Navigate to category page
                window.location.href = `/furnitureecommerce/products?category=${cat.id}`;
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col items-center text-center cursor-pointer"
            >
              {/* Icon */}
              {cat.icon && (
                <div className="w-14 h-14 mb-3 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                  {cat.icon.startsWith('http') ? (
                    <img
                      src={cat.icon}
                      alt={cat.displayName || cat.category?.name || ''}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span>{cat.icon}</span>
                  )}
                </div>
              )}

              {/* Name */}
              <h3 className="text-sm font-semibold text-gray-800">{ cat.displayName || cat.category?.name || '' }</h3>
              <p className="text-xs text-gray-500 mt-1">View</p>
            </motion.div>
          ))}

          {/* See All */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              // Navigate to all categories page
              window.location.href = `/furnitureecommerce/categories`;
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-400 transition-all"
          >
            <ArrowRightCircleIcon className="w-6 h-6 text-gray-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">See All</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
