'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';
import { MarketListingForm } from '@/types/typings';

interface AllProductsProps {      
  martketplaceListings?: MarketListingForm[];
  themeSettings?: any;
}

export default function AllProducts({ martketplaceListings, themeSettings }: AllProductsProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const primary = themeSettings?.primaryColor || '#f97316';
  const categories = ['All', 'Sneakers', 'Running', 'Casual', 'Formal'];

  // Simplified fallback data
  const dummyProducts: Partial<MarketListingForm>[] = Array(8).fill(null).map((_, i) => ({
    id: `dummy-${i}`,
    name: ['Nike Air Force 1', 'Red Runner', 'Classic Black', 'Blue Sky'][i % 4],
    finalPrice: 99.99 + (i * 10),
    sellingPrice: 120.00 + (i * 10),
    images: ['https://via.placeholder.com/400'],
    category: "Men's Shoes",
    status: 'ACTIVE',
  }));

  const productsToShow = martketplaceListings && martketplaceListings.length > 0 
    ? martketplaceListings 
    : (dummyProducts as MarketListingForm[]);

  return (
    <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
              Explore <span className="text-transparent" style={{ WebkitTextStroke: '1px currentColor' }}>All Gear</span>
            </h2>
            <p className="text-gray-500 dark:text-zinc-500 text-sm font-medium">
              Showing {productsToShow.length} premium listings
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg' 
                  : 'bg-gray-100 text-gray-500 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* View Controls (Visual Only) */}
        <div className="flex justify-end mb-8 gap-4 border-b border-gray-100 dark:border-zinc-900 pb-4">
           <button className="p-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-zinc-900 rounded-lg">
             <Squares2X2Icon className="w-5 h-5" />
           </button>
           <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
             <ListBulletIcon className="w-5 h-5" />
           </button>
        </div>

        {/* Products Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
        >
          {productsToShow.map((product: MarketListingForm) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <div className="mt-20 flex justify-center">
          <button 
            onClick={() => window.location.href = `/ecommerceshoes/products`}
            className="group flex items-center gap-3 px-10 py-5 rounded-2xl border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-black uppercase text-sm tracking-widest hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300"
          >
            Load More Products
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-2" />
          </button>
        </div>

      </div>
    </section>
  );
}