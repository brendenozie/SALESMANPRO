'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';
import { motion } from 'framer-motion';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ id, marketplaceListings, themeSettings }: AllProductsProps) {
  const primary = themeSettings?.primaryColor || '#18181b';

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-zinc-900 dark:bg-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
                The Collection
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
              Full <span className="font-serif italic font-light lowercase text-zinc-400 dark:text-zinc-600">Inventory</span>
            </h2>
          </div>

          <Link 
            href={`/furnitureecommerce/products`}
            className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white"
          >
            Explore All 
            <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-full group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-all duration-300">
              <ArrowRightIcon className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* --- PRODUCTS GRID --- */}
        {/* Using a sophisticated gap and responsive layout that feels intentional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {marketplaceListings.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 4) * 0.1 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* --- EMPTY STATE --- */}
        {marketplaceListings.length === 0 && (
          <div className="py-40 text-center border-t border-zinc-100 dark:border-zinc-900">
            <p className="text-zinc-400 font-serif italic text-2xl">
              Our current collection is being curated. Check back shortly.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}