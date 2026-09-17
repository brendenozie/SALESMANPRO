'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon, 
  Squares2X2Icon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';
import ProductCard from '../ProductCard';

interface AllProductsProps {
  id: string;
  marketplaceListings: any[];
  themeSettings: Record<string, any> | null;
}

export default function AllProducts({ marketplaceListings, themeSettings }: AllProductsProps) {
  const primaryColor = themeSettings?.primaryColor || '#ef4444';

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- Section Header --- */}
        <div className="flex flex-col gap-8 mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
                <Squares2X2Icon className="w-4 h-4" />
                <span>Full Catalog</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter dark:text-white">
                The <span className="text-transparent" style={{ WebkitTextStroke: `1px ${primaryColor}` }}>Collection</span>
              </h2>
            </div>

            <Link
              href={`/fashionecommerce/products`}
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] dark:text-white self-start md:self-auto"
            >
              Browse Archive 
              <div className="p-2 rounded-full border border-gray-200 dark:border-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                <ArrowRightIcon className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* --- Aesthetic Filter Bar (Visual) --- */}
          <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar border-b border-gray-100 dark:border-zinc-900">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full text-[10px] font-bold uppercase tracking-widest">
              <AdjustmentsHorizontalIcon className="w-3 h-3" />
              Filter
            </button>
            {['New Arrivals', 'Best Sellers', 'Limited Edition', 'Archive'].map((filter) => (
              <Link 
                key={filter}
                href={`/fashionecommerce/products?filter=${filter}`}
                className="whitespace-nowrap px-4 py-2 rounded-full border border-gray-100 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:border-gray-900 dark:hover:border-white transition-all"
              >
                {filter}
              </Link>
            ))}
          </div>
        </div>

        {/* --- High-Impact Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {marketplaceListings.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (index % 4) * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* --- Bottom Call to Action --- */}
        <div className="mt-24 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-8">
            Showing {marketplaceListings.length} of {marketplaceListings.length}+ Styles
          </p>
          <Link 
             href={`/fashionecommerce/products`}
             className="inline-block px-12 py-5 border border-zinc-900 dark:border-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all rounded-full"
          >
            Load Entire Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}