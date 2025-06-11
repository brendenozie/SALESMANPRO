'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useStoreContext } from '../../../../../../../contexts/StoreContext';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  icon?: string; // emoji or image URL
}

export default function CategorySection() {
  
  const { storeFormData } = useStoreContext();
  const { storeCategories = [], themeSettings = {} } = storeFormData || {};

  return (

    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {storeCategories.map((cat: Category) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center"
            >
              {cat.icon && (
                <div className="w-12 h-12 mb-3">
                  <img src={cat.icon} alt={cat.name} className="object-contain" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-700">{cat.name}</h3>
              {<p className="text-sm text-gray-500">view</p>}
            </motion.div>
          ))}

          {/* "See All" Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-green-100 rounded-lg shadow-md p-6 flex flex-col items-center cursor-pointer"
          >
            <ArrowRightCircleIcon className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-green-700 font-medium">See all</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
