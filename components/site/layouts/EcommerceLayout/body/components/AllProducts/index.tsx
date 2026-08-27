'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AllProducts({ marketplaceListings, themeSettings }: AllProductsProps) {
  const primary = themeSettings?.primaryColor || '#6366f1';

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-4"
            >
              <Squares2X2Icon className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500">
                Curated Collection
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none"
            >
              Explore <span className="italic font-serif font-light" style={{ color: primary }}>Everything</span>.
            </motion.h2>
          </div>

          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => window.location.href = `/ecommerce/products`}
            className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white transition-all"
          >
            <span>View All Products</span>
            <div className="p-2 rounded-full border border-slate-200 dark:border-gray-800 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </motion.button>
        </div>

        {/* Products Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12"
        >
          {marketplaceListings.map((product) => (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {marketplaceListings.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-gray-900 rounded-[3rem]">
            <p className="text-slate-400 font-medium">No products found in this collection.</p>
          </div>
        )}

        {/* Bottom Call to Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 flex justify-center"
        >
          <div className="h-[1px] w-24 bg-slate-100 dark:bg-gray-800" />
        </motion.div>
      </div>
    </section>
  );
}