'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Squares2X2Icon, 
  FunnelIcon, 
  ArrowPathIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ id, marketplaceListings, themeSettings }: AllProductsProps) {
  const [displayCount, setDisplayCount] = useState(8);
  const primary = themeSettings?.primaryColor || '#10B981';

  const visibleProducts = marketplaceListings.slice(0, displayCount);
  const hasMore = displayCount < marketplaceListings.length;

  const handleLoadMore = () => {
    // setDisplayCount(prev => prev + 4);
    window.location.href = `/groceriesecommerce/products`;
  };

  return (
    <section className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* --- Interactive Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Full <span className="text-gray-400 font-light italic">Catalog</span>
            </h2>
            <p className="text-gray-500 font-medium">
              Showing {visibleProducts.length} of {marketplaceListings.length} premium products
            </p>
          </div>

          {/* Glass Filter Bar */}
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[2rem] border border-gray-100 shadow-sm">
            <button className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm text-sm font-bold text-gray-900 border border-gray-100 hover:bg-gray-50 transition-all">
              <FunnelIcon className="w-4 h-4 text-gray-400" />
              Filter
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <button className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all">
              Sort by: <span className="text-gray-900">Newest</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* --- Product Discovery Grid --- */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"
        >
          <AnimatePresence mode='popLayout'>
            {visibleProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: (index % 4) * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* --- Load More / Pagination --- */}
        {hasMore && (
          <div className="mt-20 flex flex-col items-center justify-center space-y-6">
            <div className="w-full max-w-xs bg-gray-100 h-1 rounded-full overflow-hidden">
              <motion.div 
                className="h-full" 
                style={{ backgroundColor: primary }}
                initial={{ width: 0 }}
                animate={{ width: `${(visibleProducts.length / marketplaceListings.length) * 100}%` }}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              className="group flex items-center gap-3 px-10 py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-gray-200 hover:bg-gray-800 transition-all"
            >
              <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
              Explore More
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {marketplaceListings.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-300">
              <Squares2X2Icon className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        )}

      </div>
    </section>
  );
}